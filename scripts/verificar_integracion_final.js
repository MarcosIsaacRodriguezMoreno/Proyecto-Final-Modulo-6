db = db.getSiblingDB("metro_afluencia");

print("=== VERIFICACIÓN INTEGRAL DEL PROYECTO ===");

let comprobaciones = 0;
let correctas = 0;
let errores = 0;

function verificar(nombre, condicion, detalle) {
    comprobaciones++;

    if (condicion) {
        correctas++;
        print("CORRECTO: " + nombre);
    } else {
        errores++;
        print("ERROR: " + nombre);
    }

    if (detalle !== undefined) {
        printjson(detalle);
    }

    print("");
}


// ---------------------------------------------------------
// 1. Colecciones
// ---------------------------------------------------------

const colecciones = db.getCollectionNames().sort();

verificar(
    "Existen las colecciones principales",
    colecciones.includes("afluencia_diaria") &&
        colecciones.includes("estaciones"),
    colecciones
);


// ---------------------------------------------------------
// 2. Conteos
// ---------------------------------------------------------

const conteoAfluencia =
    db.afluencia_diaria.countDocuments();

const conteoEstaciones =
    db.estaciones.countDocuments();

verificar(
    "La colección afluencia_diaria contiene 379470 documentos",
    conteoAfluencia === 379470,
    {
        esperado: 379470,
        obtenido: conteoAfluencia
    }
);

verificar(
    "La colección estaciones contiene 163 documentos",
    conteoEstaciones === 163,
    {
        esperado: 163,
        obtenido: conteoEstaciones
    }
);


// ---------------------------------------------------------
// 3. Validadores
// ---------------------------------------------------------

const infoAfluencia =
    db.getCollectionInfos({
        name: "afluencia_diaria"
    })[0];

const infoEstaciones =
    db.getCollectionInfos({
        name: "estaciones"
    })[0];

const validadorAfluencia =
    infoAfluencia &&
    infoAfluencia.options &&
    infoAfluencia.options.validator &&
    infoAfluencia.options.validator.$jsonSchema;

const validadorEstaciones =
    infoEstaciones &&
    infoEstaciones.options &&
    infoEstaciones.options.validator &&
    infoEstaciones.options.validator.$jsonSchema;

verificar(
    "afluencia_diaria tiene validador JSON Schema",
    Boolean(validadorAfluencia)
);

verificar(
    "estaciones tiene validador JSON Schema",
    Boolean(validadorEstaciones)
);


// ---------------------------------------------------------
// 4. Índices
// ---------------------------------------------------------

const indicesAfluencia =
    db.afluencia_diaria
        .getIndexes()
        .map(indice => indice.name);

const indicesEstaciones =
    db.estaciones
        .getIndexes()
        .map(indice => indice.name);

const indicesAfluenciaEsperados = [
    "_id_",
    "idx_linea_fecha",
    "idx_estacion_fecha",
    "idx_fecha"
];

const indicesEstacionesEsperados = [
    "_id_",
    "idx_estaciones_ubicacion_2dsphere"
];

verificar(
    "afluencia_diaria contiene los índices esperados",
    indicesAfluenciaEsperados.every(
        nombre => indicesAfluencia.includes(nombre)
    ),
    indicesAfluencia
);

verificar(
    "estaciones contiene el índice geoespacial",
    indicesEstacionesEsperados.every(
        nombre => indicesEstaciones.includes(nombre)
    ),
    indicesEstaciones
);


// ---------------------------------------------------------
// 5. Rango temporal
// ---------------------------------------------------------

const rangoTemporal =
    db.afluencia_diaria.aggregate([
        {
            $group: {
                _id: null,
                fechaMinima: {
                    $min: "$fecha"
                },
                fechaMaxima: {
                    $max: "$fecha"
                }
            }
        }
    ]).toArray()[0];

verificar(
    "El rango temporal coincide con el periodo esperado",
    rangoTemporal.fechaMinima.getTime() ===
        ISODate("2021-01-01T00:00:00Z").getTime() &&
    rangoTemporal.fechaMaxima.getTime() ===
        ISODate("2026-04-30T00:00:00Z").getTime(),
    rangoTemporal
);


// ---------------------------------------------------------
// 6. Integridad de afluencia
// ---------------------------------------------------------

const totalesIncorrectos =
    db.afluencia_diaria.countDocuments({
        $expr: {
            $ne: [
                "$afluencia.total",
                {
                    $add: [
                        "$afluencia.boleto",
                        "$afluencia.prepago",
                        "$afluencia.gratuidad"
                    ]
                }
            ]
        }
    });

verificar(
    "Todos los totales coinciden con sus componentes",
    totalesIncorrectos === 0,
    {
        documentosIncorrectos: totalesIncorrectos
    }
);

const valoresNegativos =
    db.afluencia_diaria.countDocuments({
        $or: [
            {
                "afluencia.boleto": {
                    $lt: 0
                }
            },
            {
                "afluencia.prepago": {
                    $lt: 0
                }
            },
            {
                "afluencia.gratuidad": {
                    $lt: 0
                }
            },
            {
                "afluencia.total": {
                    $lt: 0
                }
            }
        ]
    });

verificar(
    "No existen valores negativos de afluencia",
    valoresNegativos === 0,
    {
        documentosNegativos: valoresNegativos
    }
);


// ---------------------------------------------------------
// 7. Integridad entre colecciones
// ---------------------------------------------------------

const estacionesNoReferenciadas =
    db.afluencia_diaria.aggregate([
        {
            $group: {
                _id: "$estacion_id"
            }
        },
        {
            $lookup: {
                from: "estaciones",
                localField: "_id",
                foreignField: "_id",
                as: "estacion"
            }
        },
        {
            $match: {
                estacion: {
                    $size: 0
                }
            }
        }
    ]).toArray();

verificar(
    "Todos los estacion_id existen en estaciones",
    estacionesNoReferenciadas.length === 0,
    {
        referenciasFaltantes:
            estacionesNoReferenciadas.length
    }
);


// ---------------------------------------------------------
// 8. Componente temporal
// ---------------------------------------------------------

const resultadoTemporal =
    db.afluencia_diaria.aggregate([
        {
            $match: {
                fecha: {
                    $gte: ISODate(
                        "2025-01-01T00:00:00Z"
                    ),
                    $lt: ISODate(
                        "2026-01-01T00:00:00Z"
                    )
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m",
                        date: "$fecha",
                        timezone: "UTC"
                    }
                },
                afluenciaTotal: {
                    $sum: "$afluencia.total"
                }
            }
        },
        {
            $sort: {
                _id: 1
            }
        }
    ]).toArray();

verificar(
    "El análisis temporal produce 12 meses para 2025",
    resultadoTemporal.length === 12,
    {
        periodosObtenidos:
            resultadoTemporal.length,
        primerPeriodo:
            resultadoTemporal[0]._id,
        ultimoPeriodo:
            resultadoTemporal[
                resultadoTemporal.length - 1
            ]._id
    }
);


// ---------------------------------------------------------
// 9. Componente geoespacial
// ---------------------------------------------------------

const estacionesCercanas =
    db.estaciones.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [
                        -99.133331,
                        19.432781
                    ]
                },
                key: "ubicacion",
                distanceField: "distancia_m",
                maxDistance: 2000,
                spherical: true
            }
        },
        {
            $count: "total"
        }
    ]).toArray();

const totalEstacionesCercanas =
    estacionesCercanas.length === 0
        ? 0
        : estacionesCercanas[0].total;

verificar(
    "La consulta geoespacial encuentra 20 estaciones",
    totalEstacionesCercanas === 20,
    {
        estacionesEncontradas:
            totalEstacionesCercanas
    }
);


// ---------------------------------------------------------
// 10. Resumen
// ---------------------------------------------------------

print("=== RESUMEN FINAL ===");

printjson({
    comprobaciones: comprobaciones,
    correctas: correctas,
    errores: errores,
    estado:
        errores === 0
            ? "PROYECTO VERIFICADO"
            : "REVISAR ERRORES"
});

if (errores > 0) {
    throw new Error(
        "La verificación integral encontró errores."
    );
}

print(
    "\nLa integración del proyecto fue comprobada correctamente."
);
