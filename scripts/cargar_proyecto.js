/*
============================================================
CARGA REPRODUCIBLE DEL PROYECTO METRO AFLUENCIA

Uso:

1. Abrir una terminal en la raíz del repositorio.
2. Descomprimir procesados.zip si aún no existe procesados/.
3. Entrar a mongosh con las credenciales de cada persona.
4. Ejecutar:

   load("scripts/cargar_proyecto.js")

El script no contiene conexiones ni credenciales.
Utiliza la sesión de mongosh que ya se encuentra autenticada.
============================================================
*/

const fs = require("fs");
const path = require("path");

const NOMBRE_BASE = "metro_afluencia";
const TAMANIO_LOTE = 1000;

const ESPERADO_ESTACIONES = 163;
const ESPERADO_AFLUENCIA = 379470;

const DIRECTORIO_PROYECTO = process.cwd();

const ARCHIVO_COLECCIONES = path.join(
    DIRECTORIO_PROYECTO,
    "colecciones.js"
);

const ARCHIVO_ESTACIONES = path.join(
    DIRECTORIO_PROYECTO,
    "procesados",
    "estaciones.ndjson"
);

const ARCHIVO_AFLUENCIA = path.join(
    DIRECTORIO_PROYECTO,
    "procesados",
    "afluencia_diaria.ndjson"
);


print("=== CARGA DEL PROYECTO METRO AFLUENCIA ===");


// ---------------------------------------------------------
// 1. Verificar archivos requeridos
// ---------------------------------------------------------

const archivosRequeridos = [
    ARCHIVO_COLECCIONES,
    ARCHIVO_ESTACIONES,
    ARCHIVO_AFLUENCIA
];

for (const archivo of archivosRequeridos) {
    if (!fs.existsSync(archivo)) {
        throw new Error(
            "No se encontró el archivo requerido: " + archivo
        );
    }
}

print("Archivos requeridos encontrados.");


// ---------------------------------------------------------
// 2. Seleccionar la base del proyecto
// ---------------------------------------------------------

db = db.getSiblingDB(NOMBRE_BASE);


// ---------------------------------------------------------
// 3. Evitar duplicar o sobrescribir una base existente
// ---------------------------------------------------------

const coleccionesExistentes = db.getCollectionNames();

if (coleccionesExistentes.length > 0) {
    throw new Error(
        "La base " +
        NOMBRE_BASE +
        " ya contiene colecciones: " +
        coleccionesExistentes.join(", ") +
        ". No se realizó ninguna modificación."
    );
}

print("La base está disponible para una carga nueva.");


// ---------------------------------------------------------
// 4. Crear colecciones y validadores
// ---------------------------------------------------------

print("Creando colecciones y validadores...");

load(ARCHIVO_COLECCIONES);

const coleccionesCreadas = db.getCollectionNames().sort();

if (
    !coleccionesCreadas.includes("afluencia_diaria") ||
    !coleccionesCreadas.includes("estaciones")
) {
    throw new Error(
        "No se crearon correctamente las colecciones esperadas."
    );
}

print("Colecciones y validadores creados.");


// ---------------------------------------------------------
// 5. Función de carga NDJSON por lotes
// ---------------------------------------------------------

function cargarNDJSON(rutaArchivo, coleccion, nombreCarga) {
    print("Cargando " + nombreCarga + "...");

    const contenido = fs.readFileSync(rutaArchivo, "utf8");
    const lineas = contenido.split(/\r?\n/);

    let lote = [];
    let insertados = 0;

    for (const linea of lineas) {
        const lineaLimpia = linea.trim();

        if (lineaLimpia === "") {
            continue;
        }

        lote.push(
            EJSON.parse(lineaLimpia)
        );

        if (lote.length === TAMANIO_LOTE) {
            coleccion.insertMany(lote, {
                ordered: true
            });

            insertados += lote.length;
            lote = [];

            if (insertados % 50000 === 0) {
                print(
                    nombreCarga +
                    ": " +
                    insertados +
                    " documentos insertados"
                );
            }
        }
    }

    if (lote.length > 0) {
        coleccion.insertMany(lote, {
            ordered: true
        });

        insertados += lote.length;
    }

    print(
        nombreCarga +
        ": " +
        insertados +
        " documentos insertados"
    );

    return insertados;
}


// ---------------------------------------------------------
// 6. Cargar estaciones
// ---------------------------------------------------------

const estacionesInsertadas = cargarNDJSON(
    ARCHIVO_ESTACIONES,
    db.estaciones,
    "Estaciones"
);


// ---------------------------------------------------------
// 7. Cargar afluencia diaria
// ---------------------------------------------------------

const afluenciasInsertadas = cargarNDJSON(
    ARCHIVO_AFLUENCIA,
    db.afluencia_diaria,
    "Afluencia diaria"
);


// ---------------------------------------------------------
// 8. Verificar conteos
// ---------------------------------------------------------

const conteoEstaciones = db.estaciones.countDocuments();
const conteoAfluencia = db.afluencia_diaria.countDocuments();

print("\n=== VERIFICACIÓN FINAL ===");

print("Estaciones esperadas: " + ESPERADO_ESTACIONES);
print("Estaciones almacenadas: " + conteoEstaciones);

print("Afluencias esperadas: " + ESPERADO_AFLUENCIA);
print("Afluencias almacenadas: " + conteoAfluencia);

if (
    estacionesInsertadas !== ESPERADO_ESTACIONES ||
    conteoEstaciones !== ESPERADO_ESTACIONES
) {
    throw new Error(
        "El conteo de estaciones no coincide con el esperado."
    );
}

if (
    afluenciasInsertadas !== ESPERADO_AFLUENCIA ||
    conteoAfluencia !== ESPERADO_AFLUENCIA
) {
    throw new Error(
        "El conteo de afluencia no coincide con el esperado."
    );
}

print("\nCarga terminada y verificada correctamente.");
