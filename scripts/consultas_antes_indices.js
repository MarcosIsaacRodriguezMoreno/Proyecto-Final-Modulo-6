db = db.getSiblingDB("metro_afluencia");

print("=== MEDICIONES ANTES DE CREAR ÍNDICES ===");


/* =========================================================
   CONSULTA A
   Evolución de la Línea 1 durante 2025
   ========================================================= */

const consultaA = db.afluencia_diaria
    .find({
        linea: "Linea 1",
        fecha: {
            $gte: ISODate("2025-01-01T00:00:00Z"),
            $lt: ISODate("2026-01-01T00:00:00Z")
        }
    })
    .sort({
        fecha: 1
    })
    .explain("executionStats");

print("\n=== CONSULTA A: Línea 1 durante 2025 ===");

printjson({
    plan: consultaA.queryPlanner.winningPlan,
    nReturned: consultaA.executionStats.nReturned,
    totalKeysExamined: consultaA.executionStats.totalKeysExamined,
    totalDocsExamined: consultaA.executionStats.totalDocsExamined,
    executionTimeMillis: consultaA.executionStats.executionTimeMillis
});


/* =========================================================
   CONSULTA B
   Historial de Pantitlán durante 2025
   ========================================================= */

const consultaB = db.afluencia_diaria
    .find({
        estacion_id: "pantitlan",
        fecha: {
            $gte: ISODate("2025-01-01T00:00:00Z"),
            $lt: ISODate("2026-01-01T00:00:00Z")
        }
    })
    .sort({
        fecha: 1
    })
    .explain("executionStats");

print("\n=== CONSULTA B: Pantitlán durante 2025 ===");

printjson({
    plan: consultaB.queryPlanner.winningPlan,
    nReturned: consultaB.executionStats.nReturned,
    totalKeysExamined: consultaB.executionStats.totalKeysExamined,
    totalDocsExamined: consultaB.executionStats.totalDocsExamined,
    executionTimeMillis: consultaB.executionStats.executionTimeMillis
});


/* =========================================================
   CONSULTA C
   Diez estaciones con mayor afluencia durante 2025
   ========================================================= */

const consultaC = db.afluencia_diaria
    .explain("executionStats")
    .aggregate([
        {
            $match: {
                fecha: {
                    $gte: ISODate("2025-01-01T00:00:00Z"),
                    $lt: ISODate("2026-01-01T00:00:00Z")
                }
            }
        },
        {
            $group: {
                _id: "$estacion_id",
                afluenciaTotal: {
                    $sum: "$afluencia.total"
                }
            }
        },
        {
            $sort: {
                afluenciaTotal: -1
            }
        },
        {
            $limit: 10
        }
    ]);

const cursorC = consultaC.stages[0].$cursor;
const ultimaEtapaC = consultaC.stages[consultaC.stages.length - 1];

print("\n=== CONSULTA C: Top 10 estaciones durante 2025 ===");

printjson({
    plan: cursorC.queryPlanner.winningPlan,
    nReturnedFinal: ultimaEtapaC.nReturned,
    totalKeysExamined: cursorC.executionStats.totalKeysExamined,
    totalDocsExamined: cursorC.executionStats.totalDocsExamined,
    executionTimeMillis: cursorC.executionStats.executionTimeMillis,
    etapasPipeline: consultaC.stages.map(
        etapa => Object.keys(etapa)[0]
    )
});
