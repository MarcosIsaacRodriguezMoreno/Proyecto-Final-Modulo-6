db = db.getSiblingDB("metro_afluencia");

print("=== PRUEBAS DEL VALIDADOR DE AFLUENCIA ===");

const idsPrueba = [
    "PRUEBA-VAL-01",
    "PRUEBA-VAL-02",
    "PRUEBA-INV-01",
    "PRUEBA-INV-02",
    "PRUEBA-INV-03",
    "PRUEBA-INV-04"
];

// Limpieza preventiva de pruebas anteriores.
db.afluencia_diaria.deleteMany({
    _id: { $in: idsPrueba }
});

function probarDocumento(nombre, documento, resultadoEsperado) {
    try {
        db.afluencia_diaria.insertOne(documento);

        print(
            nombre +
            ": ACEPTADO" +
            " | esperado: " +
            resultadoEsperado
        );
    } catch (error) {
        print(
            nombre +
            ": RECHAZADO" +
            " | esperado: " +
            resultadoEsperado +
            " | regla de validación"
        );
    }
}


// 1. Documento válido completo.

probarDocumento(
    "1. Documento válido completo",
    {
        _id: "PRUEBA-VAL-01",
        fecha: ISODate("2025-01-15T00:00:00Z"),
        estacion_id: "balderas",
        linea: "Linea 1",
        afluencia: {
            boleto: 0,
            prepago: 1000,
            gratuidad: 100,
            total: 1100
        }
    },
    "ACEPTADO"
);


// 2. Segundo documento válido.

probarDocumento(
    "2. Segundo documento válido",
    {
        _id: "PRUEBA-VAL-02",
        fecha: ISODate("2025-01-16T00:00:00Z"),
        estacion_id: "pantitlan",
        linea: "Linea 1",
        afluencia: {
            boleto: NumberLong("0"),
            prepago: NumberLong("2000"),
            gratuidad: NumberLong("200"),
            total: NumberLong("2200")
        }
    },
    "ACEPTADO"
);


// 3. Inválido: falta el campo obligatorio fecha.

probarDocumento(
    "3. Falta fecha",
    {
        _id: "PRUEBA-INV-01",
        estacion_id: "balderas",
        linea: "Linea 1",
        afluencia: {
            boleto: 0,
            prepago: 1000,
            gratuidad: 100,
            total: 1100
        }
    },
    "RECHAZADO"
);


// 4. Inválido: fecha almacenada como cadena.

probarDocumento(
    "4. Fecha como cadena",
    {
        _id: "PRUEBA-INV-02",
        fecha: "2025-01-15",
        estacion_id: "balderas",
        linea: "Linea 1",
        afluencia: {
            boleto: 0,
            prepago: 1000,
            gratuidad: 100,
            total: 1100
        }
    },
    "RECHAZADO"
);


// 5. Inválido: afluencia negativa.

probarDocumento(
    "5. Afluencia negativa",
    {
        _id: "PRUEBA-INV-03",
        fecha: ISODate("2025-01-15T00:00:00Z"),
        estacion_id: "balderas",
        linea: "Linea 1",
        afluencia: {
            boleto: 0,
            prepago: -1,
            gratuidad: 100,
            total: 99
        }
    },
    "RECHAZADO"
);


// 6. Inválido: falta total en el subdocumento.

probarDocumento(
    "6. Falta afluencia.total",
    {
        _id: "PRUEBA-INV-04",
        fecha: ISODate("2025-01-15T00:00:00Z"),
        estacion_id: "balderas",
        linea: "Linea 1",
        afluencia: {
            boleto: 0,
            prepago: 1000,
            gratuidad: 100
        }
    },
    "RECHAZADO"
);


const almacenados = db.afluencia_diaria.find({
    _id: { $in: idsPrueba }
}).toArray();

print("\nDocumentos de prueba almacenados: " + almacenados.length);

printjson(almacenados);


// Limpieza final: elimina únicamente los documentos de prueba aceptados.

const limpieza = db.afluencia_diaria.deleteMany({
    _id: { $in: idsPrueba }
});

print(
    "\nDocumentos de prueba eliminados: " +
    limpieza.deletedCount
);

print(
    "Documentos reales restantes: " +
    db.afluencia_diaria.countDocuments()
);
