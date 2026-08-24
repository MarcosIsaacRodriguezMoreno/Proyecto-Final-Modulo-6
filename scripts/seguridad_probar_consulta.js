db = db.getSiblingDB("metro_afluencia");

print("=== PRUEBA DE PRIVILEGIO MÍNIMO ===");


// ---------------------------------------------------------
// 1. Mostrar el usuario autenticado y sus roles
// ---------------------------------------------------------

const estadoConexion = db
    .getSiblingDB("admin")
    .runCommand({
        connectionStatus: 1,
        showPrivileges: false
    });

print("\n=== USUARIO AUTENTICADO ===");

printjson({
    usuarios: estadoConexion.authInfo.authenticatedUsers,
    roles: estadoConexion.authInfo.authenticatedUserRoles
});


// ---------------------------------------------------------
// 2. Prueba de lectura
// ---------------------------------------------------------

print("\n=== PRUEBA DE LECTURA ===");

try {
    const documento = db.afluencia_diaria.findOne(
        {},
        {
            _id: 0,
            fecha: 1,
            estacion_id: 1,
            linea: 1,
            "afluencia.total": 1
        }
    );

    print("CORRECTO: la lectura fue permitida.");
    printjson(documento);

} catch (error) {
    print("ERROR: la lectura fue rechazada.");
    print(error.message);
}


// ---------------------------------------------------------
// 3. Prueba de escritura
// ---------------------------------------------------------

print("\n=== PRUEBA DE ESCRITURA ===");

const idPrueba =
    "PRUEBA-SEGURIDAD-" + new Date().getTime();

let insercionPermitida = false;

try {
    db.afluencia_diaria.insertOne({
        _id: idPrueba,
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

    insercionPermitida = true;

    print(
        "ERROR: la escritura fue permitida y debía ser rechazada."
    );

} catch (error) {

    if (
        error.code === 13 ||
        error.codeName === "Unauthorized"
    ) {
        print(
            "CORRECTO: la escritura fue rechazada por falta de privilegios."
        );
    } else {
        print(
            "ERROR: la escritura falló por una causa diferente a los permisos."
        );
    }

    print("Código: " + error.code);
    print("Motivo: " + error.message);
}


// ---------------------------------------------------------
// 4. Limpieza únicamente si la inserción fue permitida
// ---------------------------------------------------------

if (insercionPermitida) {

    print("\n=== LIMPIEZA DEL DOCUMENTO DE PRUEBA ===");

    try {
        const limpieza = db.afluencia_diaria.deleteOne({
            _id: idPrueba
        });

        print(
            "Documento eliminado: " +
            limpieza.deletedCount
        );

    } catch (error) {
        print(
            "ADVERTENCIA: no fue posible eliminar el documento de prueba."
        );
        print(
            "Debe eliminarse con un usuario administrador. _id: " +
            idPrueba
        );
        print(error.message);
    }
}
