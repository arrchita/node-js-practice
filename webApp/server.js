//Import the module express to create a web application
const express = require('express');

//Create an application object
const app = express();

//Define the port number where the application will be running
const port = 3000;

//Import the module path that will help us to define the path of the index file
const path=require('path');

//Import the module body-parser that will help us to receive the post data
const bodyParser = require('body-parser');

//Import the module express-session that will help us to create and retrieve sessions
const session = require("express-session");

//Create a middleware that will help us to get the data received through post request
app.use(express.urlencoded({extended: false}));

//Set the folder for the ejs files
//ejs files are the html files that can share the data from Node JS to the HTML file (Converted into EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,"views"));

//Create a middleware for session
app.use(
  session({
      secret: "your-secret-key",
      resave: false,
      saveUninitialized: false,
  })
);


//Create a connection with a MongoDB client with the database mydb
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
MongoClient.connect(url)
  .then((db) => {
    dbo = db.db("mydb1");
  })
  .catch((err) => {
    console.log('Failed...', err)
  })

//Create a middleware for specifying the address of the folder with the static content
app.use(express.static('public'));


//Creating a route for the homepage
 app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname,"public","index1.html"));
 })
 

//Create a route for the pathname register 
//Receive the data in the JSON object
//Store the data in the database
//If the data is inserted successfully, store the data in the session and redirect to success route
//If not, execute the catch block to display the error on the console
app.post('/register', function (req, res) {
  var myobj;
  // Prepare output in JSON format
   myobj = { 
    first_name:req.body.first_name,
    last_name:req.body.last_name,
    username:req.body.username,
    password:req.body.pwd
  }
  dbo.collection("customers").insertOne(myobj)
  .then((resolve)=>{
                      console.log("1 document inserted");
                      req.session.fname=myobj.first_name;
                      res.redirect("/success");
                    })//end of .then
  .catch((err)=>{console.log(err);})
})//end of the route

//Create a route for pathname /login
//Here, we first recieve the data through post method from a form
//Find the data in the database and return the array in the resolve through the Promise
//If the array does not contain any data, we redirect to the errorpage.html
//If the data exist in the array, we store the data in the session for use in the upcoming pages
//and redirect to the success route
//Also, we have a .catch, which will be executed if the data is not inserted
//It will display the error on the console in that case
app.post('/login', function (req, res) {
var q={username:req.body.username, password:req.body.pwd};
dbo.collection("customers").find(q).toArray()
.then((resolve)=>{
    if(resolve.length==0){
      res.redirect("errorpage.html");
      }
    else{
      req.session.fname=resolve[0].first_name;
      res.redirect("/success");
    }//end of else
})//end of .then
.catch((err)=>{console.log(err);})
})//end of route


//Create route for pathname /success
//Here, we first check if the session exists or not.
//If session exists, we extract the firstname
//Store the firstname in the JSON object to be passed in the success.ejs page
//Redirect to the success.ejs page and pass the data to it.
//If the session does not exist, we redirect to index1.html
app.get('/success', function (req, res) {
  if(req.session.fname){
    const fname=req.session.fname;
    const data = {
      message: fname,
    };
  res.render('success', { data });
    //res.write(`Welcome ${fname}, You are on the success page`);
    //res.write('<br><a href=/logout>Logout</a>');
    //res.end();
  }//end of if
  else{
    res.redirect("index1.html");
  }//end of else
});//end of route

//Create a route for logout
app.get("/logout", (req, res) => {
  // Destroy the session and redirect to the login page
  req.session.destroy(() => {
  res.redirect("index1.html");
  });
});


//Create a route for retrieving all the data only for your reference
//This code will be deleted later and will not be the part of the application
app.get('/retrieve', function (req, res) {
  res.setHeader('Content-Type', 'text/html');
  dbo.collection("customers").find().toArray()
.then((resolve)=>{
  for(var i=0; i<resolve.length; i++){
    res.write(resolve[i].first_name+ " "+ resolve[i].last_name+" "+ resolve[i].username+" "+ resolve[i].password+ "<br>")
  } 
  res.end();
})
.catch((err)=>{console.log(err)});
});//End of the route

//Create a route for deleting all the data at once. It is for developer's use only
//This code will be deleted later and will not be the part of the application
app.get('/deleteAll', function (req,res){
  dbo.collection("customers").deleteMany({});
  })

//Create a middleware any type of error in the application
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).send(err.message); // Send a 500 error response
  });

//Create the server running on port number defined in the variable port in the beggining
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});