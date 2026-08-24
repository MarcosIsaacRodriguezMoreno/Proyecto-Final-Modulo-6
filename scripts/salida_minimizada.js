db = db.getSiblingDB("metro_afluencia");

print("=== SALIDA MINIMIZADA PARA USUARIO DE CONSULTA ===");

const resultado = db.estaciones
    .find(
        {},
        {
            _id: 0,
            nombre: 1,
            lineas: 1
        }
    )
    .sort({
        nombre: 1
    })
    .limit(10)
    .toArray();

printjson(resultado);

print(
    "\nDocumentos mostrados: " +
    resultado.length
);
