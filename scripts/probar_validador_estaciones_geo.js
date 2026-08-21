/*
 * ============================================================
 * PRUEBAS DEL VALIDADOR GEOESPACIAL DE ESTACIONES
 * Proyecto Final - Módulo 6 NoSQL
 * ============================================================
 *
 * Objetivo:
 * Comprobar que el validador de la colección "estaciones"
 * acepte una geometría GeoJSON válida y rechace geometrías
 * que no cumplen con el modelo definido.
 *
 * Estructura esperada:
 *
 * ubicacion: {
 *   type: "Point",
 *   coordinates: [longitud, latitud]
 * }
 *
 * Rangos permitidos:
 * - Longitud: -180 a 180
 * - Latitud:   -90 a 90
 * ============================================================
 */

print("=== PRUEBAS DEL VALIDADOR GEOESPACIAL ===");


/*
 * Función auxiliar para ejecutar cada caso de prueba.
 *
 * esperado = true
 *   El documento debe ser aceptado.
 *
 * esperado = false
 *   El documento debe ser rechazado por el validador.
 */
function probarDocumento(nombrePrueba, documento, esperado) {

    print("\n--- " + nombrePrueba + " ---");

    try {

        db.estaciones.insertOne(documento);

        if (esperado) {
            print("RESULTADO: CORRECTO - documento aceptado.");
        } else {
            print(
                "RESULTADO: ERROR - el documento fue aceptado " +
                "y debía ser rechazado."
            );
        }

        /*
         * Se elimina el documento de prueba para no modificar
         * permanentemente el catálogo de estaciones.
         */
        db.estaciones.deleteOne({ _id: documento._id });

    } catch (error) {

        if (!esperado) {
            print(
                "RESULTADO: CORRECTO - documento rechazado " +
                "por el validador."
            );
        } else {
            print(
                "RESULTADO: ERROR - documento válido rechazado."
            );
        }

        print("Motivo: " + error.message);
    }
}


/*
 * ------------------------------------------------------------
 * CASO 1
 * Point válido
 * ------------------------------------------------------------
 *
 * La geometría cumple con:
 * - type = Point
 * - dos coordenadas
 * - orden [longitud, latitud]
 * - valores dentro de los rangos permitidos
 */
probarDocumento(
    "Caso 1 - Point válido",
    {
        _id: "prueba_geo_valida",
        nombre: "Prueba Geo Válida",
        lineas: ["Linea Prueba"],
        ubicacion: {
            type: "Point",
            coordinates: [-99.1332, 19.4326]
        }
    },
    true
);


/*
 * ------------------------------------------------------------
 * CASO 2
 * Tipo de geometría incorrecto
 * ------------------------------------------------------------
 *
 * El modelo de estaciones únicamente permite geometrías
 * GeoJSON de tipo Point.
 */
probarDocumento(
    "Caso 2 - Tipo de geometría incorrecto",
    {
        _id: "prueba_geo_tipo",
        nombre: "Prueba Geo Tipo",
        lineas: ["Linea Prueba"],
        ubicacion: {
            type: "Polygon",
            coordinates: [-99.1332, 19.4326]
        }
    },
    false
);


/*
 * ------------------------------------------------------------
 * CASO 3
 * Longitud fuera de rango
 * ------------------------------------------------------------
 *
 * Una longitud válida debe encontrarse
 * dentro del intervalo [-180, 180].
 */
probarDocumento(
    "Caso 3 - Longitud fuera de rango",
    {
        _id: "prueba_geo_longitud",
        nombre: "Prueba Longitud",
        lineas: ["Linea Prueba"],
        ubicacion: {
            type: "Point",
            coordinates: [-200.0, 19.4326]
        }
    },
    false
);


/*
 * ------------------------------------------------------------
 * CASO 4
 * Latitud fuera de rango
 * ------------------------------------------------------------
 *
 * Una latitud válida debe encontrarse
 * dentro del intervalo [-90, 90].
 */
probarDocumento(
    "Caso 4 - Latitud fuera de rango",
    {
        _id: "prueba_geo_latitud",
        nombre: "Prueba Latitud",
        lineas: ["Linea Prueba"],
        ubicacion: {
            type: "Point",
            coordinates: [-99.1332, 100.0]
        }
    },
    false
);


print("\n=== FIN DE LAS PRUEBAS GEOESPACIALES ===");
