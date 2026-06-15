"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
require("./database");
const database_1 = __importDefault(require("./database"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("fastify");
//install : npm install jsonwebtoken
//install types : npm install @types/jsonwebtoken
const SECRET = "super-secret";
const fastify = (0, fastify_1.default)(); //instance serveur
//autorise toutes les méthodes avec justify
fastify.register(cors_1.default, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
});
//vigile pour les chemin qui demande le token ( a copier )
fastify.decorate("authenticate", async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return reply.code(401).send({ error: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1]; // extrait le token après "Bearer "
        const decoded = jsonwebtoken_1.default.verify(token, SECRET); // lève une erreur si invalide
        request.user = decoded; // injecte le user dans la requête
    }
    catch (err) {
        return reply.code(401).send({ error: "Unauthorized" });
    }
});
console.log("sevreur démaré !");
fastify.post("/users", (request, reply) => {
    const { name, email } = request.body;
    const query = database_1.default.prepare("INSERT INTO users (name, email) VALUES (?,?)");
    const result = query.run(name, email);
    if (result.changes === 0) {
        reply.code(404).send({ Message: "erreur création table" });
        return;
    }
    reply.code(204).send();
});
//conexion user( post pour token)
fastify.post("/login", (request, reply) => {
    const { email } = request.body;
    const query = database_1.default.prepare(`SELECT * FROM users WHERE email = ?`);
    //résultat celon type perso
    const user = query.get(email);
    //si pas d utilisateur trouvé :
    if (!user) {
        reply.code(401).send("no users found!");
        return;
    }
    //création du token =
    // clée avec les info sur le user actuellement connécté
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        name: user.name,
        email: user.email
    }, SECRET, { expiresIn: "1h" });
    //retour du token
    reply.send({ token });
});
fastify.post("/hours/start", { preHandler: fastify.authenticate }, async (request, reply) => {
    const user = request.user;
    database_1.default.prepare(`
                INSERT INTO hours (userId, start)
                VALUES (?, datetime('now','localtime'))
            `).run(user.id);
    console.log("AUTH HEADER =", request.headers.authorization);
    console.log("USER =", request.user);
    return { message: "ok" };
});
fastify.put("/hours/end", { preHandler: fastify.authenticate }, async (request, reply) => {
    //obtiens les données de user connécté via le token
    const user = request.user;
    //prend le hours avec l id le plus élevé ( le dernier)
    database_1.default.prepare(`
                UPDATE hours
                SET end = datetime('now','localtime')
                WHERE id = (
                    SELECT id
                    FROM hours
                    WHERE userId = ?
                    ORDER BY id DESC
                    LIMIT 1
                    )
                `).run(user.id);
    return { message: "ok" };
});
fastify.get("/hours", { preHandler: fastify.authenticate }, async (request, reply) => {
    //obtiens les données de user connécté via le token
    const user = request.user;
    const response = database_1.default.prepare(`SELECT * FROM hours
            WHERE userid = ?
            `).all(user.id);
    if (response.length === 0) {
        reply.code(404).send();
        return;
    }
    reply.send(response);
});
fastify.listen({ port: 3000 });
