db = db.getSiblingDB("metro_afluencia");

print("=== PRUEBAS DE LA CONSULTA GEOESPACIAL ===");

// Punto de referencia: Zócalo de la Ciudad de México.
const zocalo = {
    type: "Point",
    coordinates: [-99.133331, 19.432781]
};

// Obtiene las estaciones ubicadas a máximo 2 km.
const estacionesCercanas = db.estaciones.aggregate([
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
        $project: {
            _id: 1,
            nombre: 1,
            distancia_m: {
                $round: ["$distancia_m", 2]
            }
        }
    }
]).toArray();

const idsCercanos = estacionesCercanas.map(
    estacion => estacion._id
);


// Caso 1: estación cercana que debe quedar incluida.
const estacionIncluida = "zocalo_tenochtitlan";

print("\n--- CASO 1: ESTACIÓN CERCANA ---");

if (idsCercanos.includes(estacionIncluida)) {
    print(
        "RESULTADO: CORRECTO - " +
        estacionIncluida +
        " fue incluida."
    );
} else {
    print(
        "RESULTADO: ERROR - " +
        estacionIncluida +
        " debía ser incluida."
    );
}


// Caso 2: estación lejana que debe quedar excluida.
const estacionExcluida = "acatitla";

print("\n--- CASO 2: ESTACIÓN LEJANA ---");

if (!idsCercanos.includes(estacionExcluida)) {
    print(
        "RESULTADO: CORRECTO - " +
        estacionExcluida +
        " fue excluida."
    );
} else {
    print(
        "RESULTADO: ERROR - " +
        estacionExcluida +
        " debía ser excluida."
    );
}


// Caso 3: ninguna estación debe superar el límite de 2 km.
const distanciaMaxima = Math.max(
    ...estacionesCercanas.map(
        estacion => estacion.distancia_m
    )
);

print("\n--- CASO 3: DISTANCIA MÁXIMA ---");

if (distanciaMaxima <= 2000) {
    print(
        "RESULTADO: CORRECTO - ninguna estación supera 2000 m."
    );
} else {
    print(
        "RESULTADO: ERROR - existe una estación fuera del límite."
    );
}

print(
    "\nEstaciones seleccionadas: " +
    estacionesCercanas.length
);

print(
    "Mayor distancia seleccionada: " +
    distanciaMaxima +
    " m"
);

print("\n=== FIN DE LAS PRUEBAS GEOESPACIALES ===");
