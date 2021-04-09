const express = require('express');
const cors = require('cors');
const bodyParser =require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const admin = require('firebase-admin');
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j1rag.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const port = 5000

const app = express();

app.use(cors());
app.use(bodyParser.json());


var serviceAccount = require("./configs/burj-al-arab-simple-auth-firebase-adminsdk-qq5f3-0d20c2f975.json");
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIRE_DB
  });

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
   const bookings = client.db("burjAlArab").collection("booking");
   app.post('/addBooking', (req, res) => {
       const newBooking = req.body;
       bookings.insertOne(newBooking)
       .then(result => {
           res.send(result.insertedCount > 0);
       })
   })

   app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
           console.log({idToken});
           admin.auth().verifyIdToken(idToken)
            .then((decodedToken) => {
                const tokenEmail = decodedToken.name;
                const queryEmail = req.query.email;
                console.log(tokenEmail, queryEmail);
                if (tokenEmail == queryEmail) {
                    bookings.find({email: queryEmail})
                    .toArray((err, documents) => {
                        res.status(200).send(documents);
                    }) 
                }
                else{
                    res.status(401).send('Un-authorized acces')
                }
            })
            .catch((error) => {
                res.status(401).send('Un-authorized acces')
            })
        }
        else{
            res.status(401).send('Un-authorized acces')
        }
   })

});


app.listen(port, () => {
    console.log('starting server on port 5000');
});