db = db.getSiblingDB("metro_afluencia");

print("=== CREACIÓN DE ÍNDICES ===");

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

print("\n=== ÍNDICES DISPONIBLES ===");

printjson(
    db.afluencia_diaria.getIndexes()
);
