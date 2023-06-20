const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 4000;                  //Save the port number where your server will be listening
const cors = require('cors');
var myParser = require("body-parser");

const mongoConnect = require('./mongodb/mongodb').mongoConnect;

app.use(myParser.urlencoded({extended : true}));
// Parse JSON bodies
app.use(myParser.json());

app.use(
  cors({
    origin: 'http://localhost:3000', // Replace with the URL of your frontend
  })
);

require('./paths/routes')(app);

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
  res.send("This is the response I am sending back to the front end page.");
  // res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
  //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

mongoConnect(() => {
  app.listen(port);
  console.log(`Now listening on port ${port}`);

});