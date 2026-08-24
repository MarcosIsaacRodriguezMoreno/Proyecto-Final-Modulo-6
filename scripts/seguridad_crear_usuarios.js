const adminDB = db.getSiblingDB("admin");
const metroDB = db.getSiblingDB("metro_afluencia");

print("=== CONFIGURACIÓN DE ROLES Y USUARIOS ===");


// ---------------------------------------------------------
// 1. Crear rol personalizado de carga y mantenimiento
// ---------------------------------------------------------

const NOMBRE_ROL_CARGA = "cargaMantenimiento";

const rolExistente = metroDB.getRole(
    NOMBRE_ROL_CARGA,
    {
        showPrivileges: false
    }
);

if (rolExistente === null) {

    metroDB.createRole({
        role: NOMBRE_ROL_CARGA,

        privileges: [
            {
                resource: {
                    db: "metro_afluencia",
                    collection: ""
                },

                actions: [
                    "find",
                    "insert",
                    "update"
                ]
            }
        ],

        roles: []
    });

    print(
        "Rol creado: " +
        NOMBRE_ROL_CARGA
    );

} else {
    print(
        "El rol ya existe: " +
        NOMBRE_ROL_CARGA
    );
}


// ---------------------------------------------------------
// 2. Función para crear usuarios sin duplicarlos
// ---------------------------------------------------------

function crearUsuarioSiNoExiste(
    nombreUsuario,
    roles
) {

    const usuarioExistente =
        adminDB.getUser(nombreUsuario);

    if (usuarioExistente !== null) {
        print(
            "El usuario ya existe: " +
            nombreUsuario
        );

        return;
    }

    print(
        "\nCreando usuario: " +
        nombreUsuario
    );

    adminDB.createUser({
        user: nombreUsuario,
        pwd: passwordPrompt(),
        roles: roles
    });

    print(
        "Usuario creado: " +
        nombreUsuario
    );
}


// ---------------------------------------------------------
// 3. Crear los usuarios
// ---------------------------------------------------------

crearUsuarioSiNoExiste(
    "ricardo_admin",
    [
        {
            role: "dbOwner",
            db: "metro_afluencia"
        }
    ]
);

crearUsuarioSiNoExiste(
    "sebastian_carga",
    [
        {
            role: NOMBRE_ROL_CARGA,
            db: "metro_afluencia"
        }
    ]
);

crearUsuarioSiNoExiste(
    "marcos_consulta",
    [
        {
            role: "read",
            db: "metro_afluencia"
        }
    ]
);

crearUsuarioSiNoExiste(
    "manuel_consulta",
    [
        {
            role: "read",
            db: "metro_afluencia"
        }
    ]
);

print("\n=== CONFIGURACIÓN FINALIZADA ===");
