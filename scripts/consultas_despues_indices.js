db = db.getSiblingDB("metro_afluencia");

print("=== MEDICIONES DESPUÉS DE CREAR ÍNDICES ===");


/* =========================================================
   CONSULTA A
   Evolución diaria de la Línea 1 durante 2025.

   Se suman todas las estaciones de la línea para obtener
   un único resultado agregado por fecha.
   ========================================================= */

const consultaA = db.afluencia_diaria
    .explain("executionStats")
    .aggregate([
        {
            $match: {
                linea: "Linea 1",
                fecha: {
                    $gte: ISODate("2025-01-01T00:00:00Z"),
                    $lt: ISODate("2026-01-01T00:00:00Z")
                }
            }
        },
        {
            $group: {
                _id: "$fecha",
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
    ]);

const cursorA = consultaA.stages[0].$cursor;
const ultimaEtapaA =
    consultaA.stages[consultaA.stages.length - 1];

print("\n=== CONSULTA A: Línea 1 por fecha durante 2025 ===");

printjson({
    plan: cursorA.queryPlanner.winningPlan,
    nReturnedFinal: ultimaEtapaA.nReturned,
    totalKeysExamined:
        cursorA.executionStats.totalKeysExamined,
    totalDocsExamined:
        cursorA.executionStats.totalDocsExamined,
    executionTimeMillis:
        cursorA.executionStats.executionTimeMillis,
    etapasPipeline: consultaA.stages.map(
        etapa => Object.keys(etapa)[0]
    )
});


/* =========================================================
   CONSULTA B
   Evolución diaria de Pantitlán durante 2025.

   Se suman todas las líneas asociadas con la estación física
   para obtener un único resultado agregado por fecha.
   ========================================================= */

const consultaB = db.afluencia_diaria
    .explain("executionStats")
    .aggregate([
        {
            $match: {
                estacion_id: "pantitlan",
                fecha: {
                    $gte: ISODate("2025-01-01T00:00:00Z"),
                    $lt: ISODate("2026-01-01T00:00:00Z")
                }
            }
        },
        {
            $group: {
                _id: "$fecha",
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
    ]);

const cursorB = consultaB.stages[0].$cursor;
const ultimaEtapaB =
    consultaB.stages[consultaB.stages.length - 1];

print("\n=== CONSULTA B: Pantitlán por fecha durante 2025 ===");

printjson({
    plan: cursorB.queryPlanner.winningPlan,
    nReturnedFinal: ultimaEtapaB.nReturned,
    totalKeysExamined:
        cursorB.executionStats.totalKeysExamined,
    totalDocsExamined:
        cursorB.executionStats.totalDocsExamined,
    executionTimeMillis:
        cursorB.executionStats.executionTimeMillis,
    etapasPipeline: consultaB.stages.map(
        etapa => Object.keys(etapa)[0]
    )
});


/* =========================================================
   CONSULTA C
   Diez estaciones con mayor afluencia durante 2025.

   Esta consulta no se modifica.
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
const ultimaEtapaC =
    consultaC.stages[consultaC.stages.length - 1];

print("\n=== CONSULTA C: Top 10 estaciones durante 2025 ===");

printjson({
    plan: cursorC.queryPlanner.winningPlan,
    nReturnedFinal: ultimaEtapaC.nReturned,
    totalKeysExamined:
        cursorC.executionStats.totalKeysExamined,
    totalDocsExamined:
        cursorC.executionStats.totalDocsExamined,
    executionTimeMillis:
        cursorC.executionStats.executionTimeMillis,
    etapasPipeline: consultaC.stages.map(
        etapa => Object.keys(etapa)[0]
    )
});
