//This appliction redirects to index1.html
//On clicking on the submit button, the data is sent through the GET request
//The data through GET request is received through the request object (as it is available in the URL)
//There is also a middleware that handles the error in the page
const express = require('express');
const app = express();
const port = 3000;
const path=require('path');
const bodyParser = require('body-parser');
const session = require("express-session");
const fs = require('fs');
const formidable=require('formidable');
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,"views"));
console.log("Line 16");
app.use(
  session({
      secret: "your-secret-key",
      resave: false,
      saveUninitialized: false,
  })
);
console.log("Line 23");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
MongoClient.connect(url)
  .then((db) => {
    dbo = db.db("mydb");
  })
  .catch((err) => {
    console.log('Failed...', err)
  })
app.use(express.static('public'));
 app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname,"public","index1.html"));
 })
 
 
 
 
 app.post('/register', function (req, res) {
  var myobj;
    //res.setHeader('Content-Type', 'text/html');
    //res.write("<link rel=stylesheet type=text/css href=mystyle.css>");
   // Prepare output in JSON format
   let form = new formidable.IncomingForm();
   form.parse(req, function (error, fields, file) {
    myobj = { 
    first_name:fields.first_name[0],
    last_name:fields.last_name[0],
    username:fields.username[0],
    password:fields.pwd[0]
  }
  console.log(myobj.username);
  const folderName = path.join(__dirname,"public","Users",myobj.username);
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
  console.log("1");
//Note: In the updated API, filetoupload is an array. So, there is a need to put an index 0 to it.
  let filepath = file.pp[0].filepath;
  console.log("Filepath="+filepath)
  let newpath=folderName;
  newpath +="/profilepic.jpg"
  console.log(newpath);
  //Copy the uploaded file to a custom folder
  fs.rename(filepath, newpath, function () {
  //Send a NodeJS file upload confirmation message
  console.log('NodeJS File Upload Success!');
  });
    
      dbo.collection("customers").insertOne(myobj)
    .then((resolve)=>{
                      console.log("1 document inserted");
                      req.session.fname=myobj.first_name;
                      req.session.username=myobj.username;
                      res.redirect("/success");
                    })
    .catch((err)=>{
                    console.log(err);
                  })
   //console.log(response);
   //res.write("Welcome "+ myobj.first_name + " " + myobj.last_name);
   //res.write("<br>You have successfully registered");
   //res.end();
   });
})
app.post('/login', function (req, res) {
  //res.setHeader('Content-Type', 'text/html');
  //res.write("<link rel=stylesheet type=text/css href=mystyle.css>");
  var q={username:req.body.username, password:req.body.pwd};
  dbo.collection("customers").find(q).toArray()
.then((resolve)=>{
    if(resolve.length==0){
      res.redirect("errorpage.html");
      //res.write("You are not an authorised user<br>")
      }
    else{
      //res.write("You are an authentic user<br>");
      //console.log(resolve[0]);
      req.session.fname=resolve[0].first_name;
      req.session.username=resolve[0].username;
      res.redirect("/success");
    }
    //res.end();
})
.catch((err)=>{console.log(err);});
})
app.post("/changepic", function (req,res){
  let form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, file) {
  const username=req.session.username;
  const folderName = path.join(__dirname,"public","Users",username);
 //Note: In the updated API, filetoupload is an array. So, there is a need to put an index 0 to it.
 let filepath = file.pp[0].filepath;
 //console.log("Filepath="+filepath)
 let newpath=folderName;
 newpath +="/profilepic.jpg"
 //console.log(newpath);
 //Copy the uploaded file to a custom folder
 fs.rename(filepath, newpath, function () {
 //Send a NodeJS file upload confirmation message
 console.log('NodeJS File Upload Success!');
 res.redirect("/success");
 });
})
});

app.get('/success', function (req, res) {
  if(req.session.fname){
    //res.setHeader('Content-Type', 'text/html');
    //res.write("<link rel=stylesheet type=text/css href=mystyle.css>");
    const fname=req.session.fname;
    const username=req.session.username;
    const data = {
      message: fname,
      username:username
  };
  res.render('success', { data });
    //res.write(`Welcome ${fname}, You are on the success page`);
    //res.write('<br><a href=/logout>Logout</a>');
    //res.end();
  }
  else{
    res.redirect("index1.html");
  }
});


app.get("/logout", (req, res) => {
  // Destroy the session and redirect to the login page
  req.session.destroy(() => {
  res.redirect("index1.html");
  });
});



app.get('/retrieve', function (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.write("<link rel=stylesheet type=text/css href=mystyle.css>");
 // dbo.collection("customers").findOne()
// .then((resolve)=>{res.end(resolve.first_name+ " "+ resolve.last_name)})
// .catch((err)=>{console.log(err)});
dbo.collection("customers").find().toArray()
.then((resolve)=>{
  for(var i=0; i<resolve.length; i++){
    res.write(resolve[i].first_name+ " "+ resolve[i].last_name+" "+ resolve[i].username+" "+ resolve[i].password+ "<br>")
  } 
  res.end();
})
.catch((err)=>{console.log(err)});
});

// app.post('/json', (req, res) => {
//   //console.log(req.body); // Access parsed JSON body
//   if(req.body.first_name.length==0){throw new Error("Please enter the First Name");}
//   if(req.body.last_name.length==0){throw new Error("Please enter the Last Name");}
//   res.send("Welcome "+req.body.first_name+" "+ req.body.last_name); // Echo the received JSON back to the client
// });

app.get('/deleteAll', function (req,res){
  dbo.collection("customers").deleteMany({});
  })
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).send(err.message); // Send a 500 error response
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});