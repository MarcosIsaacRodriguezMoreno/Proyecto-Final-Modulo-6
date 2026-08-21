db = db.getSiblingDB("metro_afluencia");

print("=== PRUEBAS DE LA CONSULTA TEMPORAL ===");

// Intervalo utilizado para el análisis de 2025.
const inicio = ISODate("2025-01-01T00:00:00Z");
const fin = ISODate("2026-01-01T00:00:00Z");


// Caso 1: la fecha inicial debe estar incluida.
const fechaInicial = db.afluencia_diaria.countDocuments({
    fecha: inicio
});

print("\n--- CASO 1: FECHA INICIAL ---");

if (fechaInicial > 0) {
    print("RESULTADO: CORRECTO - 2025-01-01 está incluida.");
} else {
    print("RESULTADO: ERROR - 2025-01-01 debía estar incluida.");
}


// Caso 2: una fecha dentro del intervalo debe estar incluida.
const fechaInterna = db.afluencia_diaria.countDocuments({
    fecha: ISODate("2025-12-31T00:00:00Z")
});

print("\n--- CASO 2: FECHA DENTRO DEL INTERVALO ---");

if (fechaInterna > 0) {
    print("RESULTADO: CORRECTO - 2025-12-31 está incluida.");
} else {
    print("RESULTADO: ERROR - 2025-12-31 debía estar incluida.");
}


// Caso 3: el límite superior debe quedar excluido.
const fechaLimite = db.afluencia_diaria.countDocuments({
    fecha: {
        $gte: inicio,
        $lt: fin
    }
});

const documentos2026 = db.afluencia_diaria.countDocuments({
    fecha: fin
});

print("\n--- CASO 3: LÍMITE SUPERIOR ---");

if (documentos2026 > 0 && fechaLimite === 71175) {
    print(
        "RESULTADO: CORRECTO - 2026-01-01 existe en la base, " +
        "pero queda fuera del intervalo de 2025."
    );
} else {
    print(
        "RESULTADO: ERROR - revisar el comportamiento del límite superior."
    );
}


// Caso 4: deben existir doce periodos mensuales.
const periodos = db.afluencia_diaria.aggregate([
    {
        $match: {
            fecha: {
                $gte: inicio,
                $lt: fin
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
            }
        }
    },
    {
        $count: "totalPeriodos"
    }
]).toArray();

const totalPeriodos =
    periodos.length > 0 ? periodos[0].totalPeriodos : 0;

print("\n--- CASO 4: PERIODOS MENSUALES ---");

if (totalPeriodos === 12) {
    print("RESULTADO: CORRECTO - se obtuvieron 12 meses.");
} else {
    print(
        "RESULTADO: ERROR - se esperaban 12 meses y se obtuvieron " +
        totalPeriodos +
        "."
    );
}

print("\n=== FIN DE LAS PRUEBAS TEMPORALES ===");
