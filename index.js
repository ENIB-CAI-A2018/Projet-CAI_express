var express = require('express');
var cors = require('cors');
var bodyParser = require("body-parser");
var app = express();
var util = require("util");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var MongoClient = require('mongodb').MongoClient, assert = require('assert');

var findCours = function(db, courList,  callback) {
    const cursor =db.collection('list_prof').find({});
    cursor.each(function(err, doc) {
       assert.equal(err, null);
       if (doc != null) {
          courList.push(doc);
       } else {
          callback();
       }
    });
 };

 var findProfesseur = function(db, profId,  callback) {
   const cursor =db.collection(String(profId.toLowerCase()).replace(/ /g,"_")).find({});
   var prof;
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         prof = doc;
      } else {
         callback(prof);
      }
   });
};

var createProf = function(db, nom, age, prix, matiere, ville, adresse, numero, mail,jour, heure, longueur, places,  callback) {
   db.collection(String(nom.toLowerCase()).replace(/ /g,"_")).insertOne({
      nom: nom,
      age : age,
      prix : prix,
      matiere : matiere,
      ville : ville,
      adresse : adresse,
      contact : [numero,mail],
      avis : [],
      cours : [
        {
          jour : jour,
          heure : heure,
          longueur : longueur,
          places : places
        }
      ]
    });

    db.collection("list_prof").insertOne({
      professeur : nom,
      prix : prix,
      matiere : matiere
    });
};

var createCour = function(db, prof, jour, heure, longueur, places,  callback) {
  db.collection(String(prof.toLowerCase()).replace(/ /g,"_")).updateOne(
    { nom: prof}, 
    {
      $addToSet: 
      { 
        cours : 
        {
          jour : jour,
          heure : heure,
          longueur : longueur,
          places : places
        } 
      }
    }
  );  
};

var findUser = function(db, login,  callback) {
  const cursor =db.collection("users").find({pseudo: login});
   var user;
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         user = doc;
      } else {
         callback(user);
      }
   }); 
};

var inscription = function(db, login, mdp,  callback) {
  db.collection("users").insertOne({ 
    pseudo : login,
    mdp : mdp
  });  
};

var login = function(db, login, mdp,  callback) {
  const cursor =db.collection("users").find({pseudo: login, mdp:mdp});
   var user;
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         user = doc;
      } else {
         callback(user);
      }
   });  
};

 app.get('/cours', function (req, res) {
    console.log('Received request for cours from', req.ip)
    MongoClient.connect(url, function(err, dataBase) {
      assert.equal(null, err);
      var courList = [];
      const db=dataBase.db('Project-CAI');
      findCours(db, courList, function() {
        res.json(courList);
        dataBase.close();
      });
    });
  });
  
app.get('/prof/:profId', function (req, res) {
   console.log('Received request for '+req.param('profId')+' from', req.ip)
   MongoClient.connect(url, function(err, dataBase) {
     assert.equal(null, err);
     const db=dataBase.db('Project-CAI');
     findProfesseur(db, req.param('profId'),  function(prof) {
       res.json(prof);
       dataBase.close();
     });
   });
 });

 app.post('/createProf', function (req, res) {
   console.log('Received request for create prof : '+req.body.nom+' from', req.ip);
   var nom=util.format("%j",req.body.nom);
   nom=nom.replace('"',"");
   nom=nom.replace('"',"");//Afin de supprimer les "" crée lors de la ganération de la chaine de caractére servant a définir le fichier json de la bdd
   console.log('Received request for create prof : '+nom);
   var age=req.body.age;
   var prix=req.body.prix;
   var matiere=req.body.matiere;
   var ville=req.body.ville;
   var adresse=req.body.adresse;
   var numero=req.body.contact[0];
   var mail=req.body.contact[1];
   MongoClient.connect(url, function(err, dataBase) {
     assert.equal(null, err);
     const db=dataBase.db('Project-CAI');
     createProf(db, nom,age,prix,matiere,ville,adresse,numero,mail, function() {
       dataBase.close();
     });
   });
 });

 app.post('/createCours', function (req, res) {
   console.log('Received request for create cour : '+req.body.nom+' from', req.ip);
   var nom=util.format("%j",req.body.nom);
   nom=nom.replace('"',"");
   nom=nom.replace('"',"");
   var jour=req.body.cours[0].jour;
   var heure=req.body.cours[0].heure;
   var longueur=req.body.cours[0].longueur;
   var places=req.body.cours[0].places;
   MongoClient.connect(url, function(err, dataBase) {
    assert.equal(null, err);
    const db=dataBase.db('Project-CAI');

   findProfesseur(db, nom,  function(prof) {
     if(prof==null){
      var age=req.body.age;
      var prix=req.body.prix;
      var matiere=req.body.matiere;
      var ville=req.body.ville;
      var adresse=req.body.adresse;
      var numero=req.body.contact[0];
      var mail=req.body.contact[1];
      createProf(db, nom,age,prix,matiere,ville,adresse,numero,mail,jour,heure,longueur,places, function() {
        dataBase.close();
      });
     }
     else{
      createCour(db,nom , jour,heure,longueur,places, function() {
        dataBase.close();
       });
     }
   });

  });
});

app.post('/inscription', function (req, res) {
  console.log('Received request for inscription : '+req.body.login+' from', req.ip);
  var login=req.body.login;
  var mdp=req.body.mdp;
  MongoClient.connect(url, function(err, dataBase) {
    assert.equal(null, err);
    const db=dataBase.db('Project-CAI');
    findUser(db,login, function(user){
      if (user==null){
        inscription(db,login, mdp, function() {
          res.end('It worked!');
        });
      }
      else{
        res.end('This pseudo already exist!');
      }
      dataBase.close();
    });
  });
});

app.post('/login', function (req, res) {
  console.log('Received request for inscription : '+req.body.login+' from', req.ip);
  var login=req.body.login;
  var mdp=req.body.mdp;
  MongoClient.connect(url, function(err, dataBase) {
    assert.equal(null, err);
    const db=dataBase.db('Project-CAI');
    login(db,login, function(user){
      if (user==null){
        res.end("This pseudo doesn't exist!");
      }
      else {
        res.end('It worked!');
      }
      dataBase.close();
    });
  });
});

 var url = 'mongodb://localhost:27017/Project-CAI';

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    db.close();
});

app.use(function(req,rep,next){
    rep.header('Access-Control-Allow-Origin' , '*');
})

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
});