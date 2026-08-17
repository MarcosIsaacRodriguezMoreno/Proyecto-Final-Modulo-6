db = db.getSiblingDB("metro_afluencia");

db.createCollection("afluencia_diaria", {
    validator: {
        $jsonSchema: {
            bsonType: "object",

            required: [
                "fecha",
                "estacion_id",
                "linea",
                "afluencia"
            ],

            properties: {

                fecha: {
                    bsonType: "date"
                },

                estacion_id: {
                    bsonType: "string"
                },

                linea: {
                    bsonType: "string"
                },

                afluencia: {
                    bsonType: "object",

                    required: [
                        "boleto",
                        "prepago",
                        "gratuidad",
                        "total"
                    ],

                    properties: {

                        boleto: {
                            bsonType: ["int", "long"],
                            minimum: 0
                        },

                        prepago: {
                            bsonType: ["int", "long"],
                            minimum: 0
                        },

                        gratuidad: {
                            bsonType: ["int", "long"],
                            minimum: 0
                        },

                        total: {
                            bsonType: ["int", "long"],
                            minimum: 0
                        }
                    }
                }
            }
        }
    }
})


db.createCollection("estaciones", {
    validator: {
        $jsonSchema: {
            bsonType: "object",

            required: [
                "_id",
                "nombre",
                "lineas",
                "ubicacion"
            ],

            properties: {

                _id: {
                    bsonType: "string"
                },

                nombre: {
                    bsonType: "string"
                },

                lineas: {
                    bsonType: "array",
                    minItems: 1,

                    items: {
                        bsonType: "string"
                    }
                },

                ubicacion: {
                    bsonType: "object",

                    required: [
                        "type",
                        "coordinates"
                    ],

                    properties: {

                        type: {
                            enum: ["Point"]
                        },

                        coordinates: {
                            bsonType: "array",
                            minItems: 2,
                            maxItems: 2,

                            items: [
                                {
                                    bsonType: "double",
                                    minimum: -180,
                                    maximum: 180
                                },
                                {
                                    bsonType: "double",
                                    minimum: -90,
                                    maximum: 90
                                }
                            ]
                        }
                    }
                }
            }
        }
    }
})