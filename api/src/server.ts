import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import "./database";
import db from "./database";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import "fastify";


//install jwt :  npm install @fastify/jwt

//type pour user
type User = {
  id: number;
  name: string;
  email: string;
};

//type module pour fastify authenticate (obligatoire)
declare module "fastify" {
  interface FastifyInstance {
    authenticate: any;
  }
}

const fastify = Fastify();  //instane serveur


//autorise toutes les méthodes avec justify
fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
});

//clées jwt ( obligatoire)
fastify.register(jwt, {
  secret: "super-secret"
});


//vigile pour les chemin qui demande le token (obligatoire)
fastify.decorate("authenticate",async (request:FastifyRequest, reply:FastifyReply) => {
    try {
        await request.jwtVerify();
    } catch (err) {
        return reply.code(401).send({ error: "Unauthorized" });
    }
});


console.log("sevreur démaré !");

//requete de base création user ( pas de gesion de token) 
fastify.post("/users",(request,reply)=>{

    const {name , email} = request.body as {    //demande au body ( info a mettre dans le fetch)
        name: string;
        email:string;
    };

    const query = db.prepare("INSERT INTO users (name, email) VALUES (?,?)");
    const result = query.run(name,email);
    if(result.changes === 0){
        reply.code(404).send({Message: "erreur création table"});
        return;
    }
    reply.code(204).send();

})

//conexion user( post pour token) création du token ICI
fastify.post("/login",(request,reply)=> {
    const {email} = request.body as { email: string};

    const query = db.prepare(`SELECT * FROM users WHERE email = ?`);
    //résultat celon type perso
    const user = query.get(email) as User | undefined;
    //si pas d utilisateur trouvé :
    if (!user){
        reply.code(401).send("no users found!");
        return;
    }

    //création du token =
    // clée avec les info sur le user actuellement connécté
    const token = fastify.jwt.sign ({
        id: user.id,
        name: user.name,
        email: user.email
    });

    //retour du token
    reply.send({token});

})


fastify.post("/hours/start",{preHandler: fastify.authenticate}, //vérifie si on a la token dans le header
        async (request,reply)=>{
            //obtiens les données de user connécté via le token
            const user = request.user as {id: number}  //confirme a ts que id est forcément number
            //permet d'utiliser id en tant que number apres

            //création d une table hour associé à l'utilisateur
            db.prepare(`
                INSERT INTO hours (userId, start)
                VALUES (?, datetime('now','localtime'))
            `).run(user.id);
        

            console.log("AUTH HEADER =", request.headers.authorization);
            console.log("USER =", request.user);

            return { message: "ok"};
        }
)

fastify.put("/hours/end",{preHandler: fastify.authenticate},    //vérif token dans le header
        async (request,reply)=>{
            //obtiens les données de user connécté via le token
            const user = request.user as {id: number};

            //prend le hours avec l id le plus élevé ( le dernier)
            db.prepare(`
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
        
            return { message: "ok"};
        }
)

fastify.get("/hours",{preHandler: fastify.authenticate},//vérif token dans le header
    async (request,reply) =>{
        //obtiens les données de user connécté via le token
        const user = request.user as {id: number};

        const response = db.prepare(`SELECT * FROM hours
            WHERE userid = ?
            `).all(user.id);

            if(response.length === 0){
                reply.code(404).send();
                return;
            }
            reply.send(response);

    }
)

fastify.listen({port: 3000});
