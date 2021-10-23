const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

let db, collection;

const url = "mongodb+srv://sharob:1OXoX9d5ACJMrhZQ@cluster0.eco37.mongodb.net/quotes?retryWrites=true&w=majority";
const dbName = "quotes";

app.listen(4000, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  db.collection('quotes').find().sort({heart:-1}).toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {quotes: result})
    console.log(result)
  })
})

app.post('/quotes', (req, res) => {
  db.collection('quotes').insertOne({quote:req.body.quote, heart:1}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})
app.get('/search', (req, res) => {
  console.log(req.query.search)
  db.collection('quotes').find({"quote": {$regex : req.query.search,$options:'i'}}).toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {quotes: result})
  })
})

app.put('/messages', (req, res) => {
  db.collection('quotes')
  .findOneAndUpdate({quote: req.body.quote}, {
    $inc: {
      heart:1,
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  db.collection('quotes').findOneAndDelete({heart: req.body.heart, quote:req.body.quote}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})




