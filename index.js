var express = require('express');
var cors = require('cors')
var app = express();

app.use(cors())

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

 var findprofesseur = function(db, profId,  callback) {
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

var createProf = function(db, nom, age, prix, matiere, ville, adresse, numero, mail,  callback) {
   db.collection(String(nom.toLowerCase()).replace(/ /g,"_")).insertOne({
      nom: nom,
      age : age,
      prix : prix,
      matiere : matiere,
      ville : ville,
      adresse : adresse,
      contact : [numero,mail],
      avis : [],
      cours : []
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
     findprofesseur(db, req.param('profId'),  function(prof) {
       console.log(prof)
       res.json(prof);
       dataBase.close();
     });
   });
 });

 app.get('/createProf/:nom/:age/:prix/:matiere/:ville/:adresse/:numero/:mail', function (req, res) {
   console.log('Received request for create prof : '+req.param('nom')+' from', req.ip)
   MongoClient.connect(url, function(err, dataBase) {
     assert.equal(null, err);
     const db=dataBase.db('Project-CAI');
     createProf(db, req.param('nom'), req.param('age'), req.param('prix'), req.param('matiere')
     ,req.param('ville'), req.param('adresse'), req.param('numero'), req.param('mail'), function() {
       dataBase.close();
     });
   });
 });

 app.get('/createCour/:prof/:jour/:heure/:longueur/:places', function (req, res) {
   console.log('Received request for create cour : '+req.param('prof')+' from', req.ip)
   MongoClient.connect(url, function(err, dataBase) {
     assert.equal(null, err);
     const db=dataBase.db('Project-CAI');
     createCour(db, req.param('prof') , req.param('jour'), req.param('heure'), req.param('longueur'), req.param('places'), function(test) {
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