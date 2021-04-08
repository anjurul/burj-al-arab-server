const express = require('express');
const cors = require('cors');
const bodyParser =require('body-parser');
const MongoClient = require('mongodb').MongoClient;

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-swu9d.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const uri = "mongodb+srv://burj-al-arab:Z8RW5xsetAPDj!s@cluster0.j1rag.mongodb.net/burjAlArab?retryWrites=true&w=majority";
const port = 5000

const app = express();

app.use(cors());
app.use(bodyParser.json());



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
    //    console.log(req.query.email);
       bookings.find({email: req.query.email})
       .toArray((err, documents) => {
           res.send(documents);
       })
   })

});


app.listen(port, () => {
    console.log('starting server on port 5000');
});