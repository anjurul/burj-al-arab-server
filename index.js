const express = require('express');
const cors = require('cors');
const bodyParser =require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const admin = require('firebase-admin');


const uri = "mongodb+srv://burj-al-arab:Z8RW5xsetAPDj!s@cluster0.j1rag.mongodb.net/burjAlArab?retryWrites=true&w=majority";
const port = 5000

const app = express();

app.use(cors());
app.use(bodyParser.json());


var serviceAccount = require("./burj-al-arab-simple-auth-firebase-adminsdk-qq5f3-0d20c2f975.json");
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://burj-al-arab-simple-auth.firebaseio.com'
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
                if (tokenEmail == req.query.email) {
                    bookings.find({email: req.query.email})
                    .toArray((err, documents) => {
                        res.send(documents);
                    }) 
                }
            })
            .catch((error) => {
                // Handle error
            });
           
        }

       

       
   })

});


app.listen(port, () => {
    console.log('starting server on port 5000');
});