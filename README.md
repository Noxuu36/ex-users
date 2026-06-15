Creér projet DAW:

-Creation dossier "projet"

-Backend création dossier api :

->dossier database ->fichier database.db

->dossier dist ( pour stocker fichier js)

-> dossier src ->fichier server.ts ( faire les requètes a la db) ->fichier databse.ts (création table au lancement et peut les initialiser)

->fichier tsconfig.json ( a copier coller)

commande Backend : npm install -D typescript / npm install fastify / npm install @fastify/cors / npm install better-sqlite3
npx tsc --init (créer automatiquement le tsconfig..json) npx tsc ( compile le ts en js) /pour token : npm install @fastify/jwt

-Frontend :

-npm create vite@latest -> nom ="front" -> Vanilla + Typescript -> Yes

-Si besoin du lien a nouveau : npm run dev
