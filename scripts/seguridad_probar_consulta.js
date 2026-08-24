db = db.getSiblingDB("metro_afluencia");

print("=== PRUEBA DE LECTURA ===");

printjson(
    db.afluencia_diaria.findOne(
        {},
        {
            _id: 0,
            fecha: 1,
            estacion_id: 1,
            linea: 1,
            "afluencia.total": 1
        }
    )
);

print("\n=== PRUEBA DE ESCRITURA ===");

try {
    db.afluencia_diaria.insertOne({
        fecha: ISODate("2025-01-01T00:00:00Z"),
        estacion_id: "prueba_seguridad",
        linea: "Linea 1",
        afluencia: {
            boleto: 0,
            prepago: 0,
            gratuidad: 0,
            total: 0
        }
    });

    print("ERROR: la escritura fue permitida.");

    db.afluencia_diaria.deleteOne({
        estacion_id: "prueba_seguridad"
    });

} catch (error) {
    print("CORRECTO: la escritura fue rechazada.");
    print(error.message);
}
