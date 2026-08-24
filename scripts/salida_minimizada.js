db = db.getSiblingDB("metro_afluencia");

db.estaciones.find(
    {},
    {
        _id: 0,
        nombre: 1,
        lineas: 1
    }
).limit(10)
