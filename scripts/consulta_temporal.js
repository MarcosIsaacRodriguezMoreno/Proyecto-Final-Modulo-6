db = db.getSiblingDB("metro_afluencia");

print("=== CONSULTA TEMPORAL ===");

// Analiza la afluencia total mensual durante 2025.
// Se utiliza el intervalo semiabierto [inicio, fin).
const resultado = db.afluencia_diaria.aggregate([
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
        $project: {
            _id: 0,
            periodo: "$_id",
            afluenciaTotal: 1
        }
    },
    {
        $sort: {
            periodo: 1
        }
    }
]).toArray();

print("\n=== AFLUENCIA TOTAL MENSUAL DURANTE 2025 ===");

printjson(resultado);

print(
    "\nPeriodos obtenidos: " +
    resultado.length
);
