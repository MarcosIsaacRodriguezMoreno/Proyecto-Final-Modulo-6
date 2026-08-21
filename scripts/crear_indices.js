db = db.getSiblingDB("metro_afluencia");

print("=== CREACIÓN DE ÍNDICES ===");

// Índices para consultas de afluencia
db.afluencia_diaria.createIndex(
    { linea: 1, fecha: 1 },
    { name: "idx_linea_fecha" }
);

db.afluencia_diaria.createIndex(
    { estacion_id: 1, fecha: 1 },
    { name: "idx_estacion_fecha" }
);

db.afluencia_diaria.createIndex(
    { fecha: 1 },
    { name: "idx_fecha" }
);

// Índice para consultas geoespaciales de estaciones
db.estaciones.createIndex(
    { ubicacion: "2dsphere" },
    { name: "idx_estaciones_ubicacion_2dsphere" }
);

print("\n=== ÍNDICES DE AFLUENCIA DIARIA ===");

printjson(
    db.afluencia_diaria.getIndexes()
);

print("\n=== ÍNDICES DE ESTACIONES ===");

printjson(
    db.estaciones.getIndexes()
);
