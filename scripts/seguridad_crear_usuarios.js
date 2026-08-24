db = db.getSiblingDB("admin");

db.createUser({
    user: "ricardo_admin",
    pwd: passwordPrompt(),
    roles: [
        { role: "dbOwner", db: "metro_afluencia" }
    ]
})

db.createUser({
    user: "sebastian_carga",
    pwd: passwordPrompt(),
    roles: [
        { role: "readWrite", db: "metro_afluencia" }
    ]
})

db.createUser({
    user: "marcos_consulta",
    pwd: passwordPrompt(),
    roles: [
        { role: "read", db: "metro_afluencia" }
    ]
})

db.createUser({
    user: "manuel_consulta",
    pwd: passwordPrompt(),
    roles: [
        { role: "read", db: "metro_afluencia" }
    ]
})
