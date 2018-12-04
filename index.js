var express = require('express');
var cors = require('cors')
var app = express();

app.use(cors())

var MongoClient = require('mongodb').MongoClient, assert = require('assert');

var findCours = function(db, courList,  callback) {
    const cursor =db.collection('cours').find({});
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
   const cursor =db.collection(profId).find({});
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

var createProf = function(db, prenom, nom, age, metier, spe,  callback) {
   db.collection(prenom+" "+nom).insertOne({
      nom: nom,
      prenom: prenom,
      âge : age,
      métier : metier,
      nombre_de_cour : 0,
      spécialité : spe,
      avis : []
    });
};

var createCour = function(db, prof, prix, lieu, nbrP, matiere, date, heure, duree,  callback) {
   db.collection("cours").insertOne({
      professeur : prof,
      prix : prix,
      lieu : lieu,
      eleve : "",
      nombre_de_place : nbrP,
      matiere : matiere,
      date : date,
      heure : heure,
      durée : duree
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
     findprofesseur(db, req.param('profId'),  function(prof) {
       console.log(prof)
       res.json(prof);
       dataBase.close();
     });
   });
 });

 app.get('/createProf/:prenom/:nom/:age/:metier/:spe', function (req, res) {
   console.log('Received request for '+req.param('prenom')+" "+req.param('nom')+' from', req.ip)
   MongoClient.connect(url, function(err, dataBase) {
     assert.equal(null, err);
     const db=dataBase.db('Project-CAI');
     createProf(db, req.param('prenom') , req.param('nom'), req.param('age'), req.param('metier'), req.param('spe'), function() {
       dataBase.close();
     });
   });
 });

 app.get('/createCour/:prof/:prix/:lieu/:nbrP/:matiere/:date/:heure/:duree', function (req, res) {
   console.log('Received request for '+req.param('prof')+" "+req.param('matiere')+' from', req.ip)
   MongoClient.connect(url, function(err, dataBase) {
     assert.equal(null, err);
     const db=dataBase.db('Project-CAI');
     createCour(db, req.param('prof') , req.param('prix'), req.param('lieu'), req.param('nbrP'), req.param('matiere'), req.param('date')
     , req.param('heure'), req.param('duree'), function() {
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