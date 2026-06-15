import './style.css'


type hours = {
  id: number,
  start: string,
  end: string,
  userid: number
}

let add_btn = document.querySelector("#add_btn");

let log_btn = document.querySelector("#loginbtn");

let log_out = document.querySelector("#logout");

let startbtn = document.querySelector("#start");

let endbtn = document.querySelector("#end");

log_btn?.addEventListener("click",login);

add_btn?.addEventListener("click",new_user);

log_out?.addEventListener("click",logout);

startbtn?.addEventListener("click",start);

endbtn?.addEventListener("click",end);



function new_user(){
      //selectionne l'élement et le donne au bon format
    const name = document.querySelector("#nameInput") as HTMLInputElement;
    const email = document.querySelector("#emailInput") as HTMLInputElement;

    //prend la valeur dans l'input
    var nom = name.value;
    var mail = email.value;

    console.log(nom,mail);

    adduser(nom,mail);

    
}

async function adduser(name:string,email:string){

  if (!name||!email){
    console.log("il manque un élément!");
    return;
  }
  const response = await fetch(
    "http://localhost:3000/users", {
      method:"POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        name: name,
        email: email }),
    }
  )

  if (response.ok){
    console.log("utilisateur ajouté avec succès");

    const nameInput = document.querySelector("#nameInput") as HTMLInputElement;
    const emailInput = document.querySelector("#emailInput") as HTMLInputElement;
    //met a 0 les champs input
    nameInput.value = "";
    emailInput.value = "";
  }

}

function login (){
  const emailInput = document.querySelector("#loginInput")as HTMLInputElement;

  const email = emailInput.value;

  console.log(email);

  connexion(email);

}
//conexion avec email
async function connexion(email:string){
  //conexion avec token ( method POST)
  const response = await fetch(
    "http://localhost:3000/login",{
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        email:email
      })
  });

  if(!response.ok){
    console.log("user not found!");
    return;
  }
  //récupère le token ( envoié par /login)
  const data = await response.json();
  //active le token avec les données fournie par data en backend:
  localStorage.setItem("token", data.token);

  console.log("Connecté !");
  getallhours();
}


function logout(){
  localStorage.removeItem("token");  //retrait token
  console.log("Déconnecté");
  const liste = document.querySelector("#hours_list")as HTMLUListElement;
  liste.innerHTML = ""; //remet la liste a 0 apres déconexion
}

//fct start, requete insert sous token
async function start(){
  //on reprend le token
  const token = localStorage.getItem("token");

  console.log("TOKEN =", token);
  
  if (!token) {
    console.log("Pas de token, veuillez vous connecter !");
    return;
  }

  const response  = await fetch(
    "http://localhost:3000/hours/start",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  //on donne la token a la demande
      },
      body: JSON.stringify({})  //mise de l'heure ( automatique)
      //pas de valeur mais obligatoire car POST
    });

  if (!response.ok){
    console.log("Unauthorized access!");
    return;
  }
  //renvoie le "ok" du serveur
  const data = await response.json();
  console.log(data);
  getallhours();

}

//fct end, requete update sous token
async function end(){
    //on reprend le token
  const token = localStorage.getItem("token");

  console.log("TOKEN =", token);
  
  //si pas de token
  if (!token) {
    console.log("Pas de token, veuillez vous connecter !");
    return;
  }

  const response  = await fetch(
    "http://localhost:3000/hours/end",{
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },//envoie token dans les headers
      body: JSON.stringify({})
    });

  if (!response.ok){
    console.log("Unauthorized access!");
    return;
  }
  //renvoie le "ok" du serveur
  const data = await response.json();
  console.log(data);
  getallhours();

}

async function getallhours(){

  //on reprend le token
  const token = localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:3000/hours",{
      method: "GET",
      headers: {        
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }});

    const hoursList: hours[] = await response.json();
    //tableau avec toutes les lignes de "hours"

    createhourlist(hoursList);
}

function createhourlist(list: hours[]){
  const liste = document.querySelector("#hours_list") as HTMLUListElement;
  liste.innerHTML = "";

  list.forEach(hour =>{
    const li = document.createElement("li");

    li.textContent = `${hour.start} - ${hour.end}`;  //créer un élément pour chaque "hours"
  
    liste.appendChild(li);
  });
  

}
