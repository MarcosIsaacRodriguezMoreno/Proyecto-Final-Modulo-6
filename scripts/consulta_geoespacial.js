db = db.getSiblingDB("metro_afluencia");

print("=== CONSULTA GEOESPACIAL ===");

// Punto de referencia: Zócalo de la Ciudad de México.
// Formato GeoJSON: [longitud, latitud].
const zocalo = {
    type: "Point",
    coordinates: [-99.133331, 19.432781]
};

// Busca estaciones a máximo 2 km del Zócalo
// y calcula su afluencia acumulada durante 2025.
const resultado = db.estaciones.aggregate([
    {
        $geoNear: {
            near: zocalo,
            key: "ubicacion",
            distanceField: "distancia_m",
            maxDistance: 2000,
            spherical: true
        }
    },
    {
        $lookup: {
            from: "afluencia_diaria",
            let: {
                estacionId: "$_id"
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $eq: [
                                        "$estacion_id",
                                        "$$estacionId"
                                    ]
                                },
                                {
                                    $gte: [
                                        "$fecha",
                                        ISODate("2025-01-01T00:00:00Z")
                                    ]
                                },
                                {
                                    $lt: [
                                        "$fecha",
                                        ISODate("2026-01-01T00:00:00Z")
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        afluencia2025: {
                            $sum: "$afluencia.total"
                        }
                    }
                }
            ],
            as: "afluencia_2025"
        }
    },
    {
        $set: {
            afluencia2025: {
                $ifNull: [
                    {
                        $arrayElemAt: [
                            "$afluencia_2025.afluencia2025",
                            0
                        ]
                    },
                    0
                ]
            }
        }
    },
    {
        $project: {
            _id: 1,
            nombre: 1,
            lineas: 1,
            distancia_m: {
                $round: ["$distancia_m", 2]
            },
            afluencia2025: 1
        }
    },
    {
        $sort: {
            distancia_m: 1
        }
    }
]).toArray();

print(
    "\n=== ESTACIONES A MÁXIMO 2 KM DEL ZÓCALO Y AFLUENCIA 2025 ==="
);

printjson(resultado);

print(
    "\nTotal de estaciones encontradas: " +
    resultado.length
);
