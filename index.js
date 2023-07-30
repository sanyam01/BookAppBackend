const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server

const MONGODB_URI =
  'mongodb+srv://sanyam1396:sanyam1396@booksappcluster.oxr9lg8.mongodb.net/BooksApp?retryWrites=true&w=majority';

const port = 4000;                  //Save the port number where your server will be listening
const cors = require('cors');
var myParser = require("body-parser");
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({ storage: storage });

const mongoConnect = require('./mongodb/mongodb').mongoConnect;

app.use(myParser.urlencoded({ extended: true }));
// Parse JSON bodies
app.use(myParser.json());

app.use(
  cors({
    origin: 'http://localhost:3000', // Replace with the URL of your frontend
  })
);

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
  res.send("This is the response I am sending back to the front end page.");
  // res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
  //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

require('./paths/routes')(app, upload);

mongoConnect(() => {
  app.listen(port);
  console.log(`Now listening on port ${port}`);

});