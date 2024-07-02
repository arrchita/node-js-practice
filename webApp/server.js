const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
const session = require("express-session");

app.use(express.urlencoded({ extended: false }));

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Specify the views directory

// Middleware for session
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// MongoDB Connection
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
let dbo;

MongoClient.connect(url)
  .then((db) => {
    dbo = db.db("webapp");
  })
  .catch((err) => {
    console.log('Failed...', err);
  });

// Middleware for static files
app.use(express.static(path.join(__dirname, 'public'))); // Ensure correct path for static files

// Route for Homepage (directly accessing index1.html)
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index1.html')); // Ensure file exists in 'public'
});

// Register Route
app.post('/register', function (req, res) {
  const myobj = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    username: req.body.username,
    password: req.body.pwd
  };

  dbo.collection("customers").insertOne(myobj)
    .then(() => {
      console.log("1 document inserted");
      req.session.fname = myobj.first_name;
      res.redirect("/success");
    })
    .catch((err) => {
      console.log(err);
    });
});

// Login Route
app.post('/login', function (req, res) {
  const q = { username: req.body.username, password: req.body.pwd };

  dbo.collection("customers").find(q).toArray()
    .then((resolve) => {
      if (resolve.length === 0) {
        res.redirect("/errorpage.html"); // Ensure file exists in 'public'
      } else {
        req.session.fname = resolve[0].first_name;
        res.redirect("/success");
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

// Success Route
app.get('/success', function (req, res) {
  if (req.session.fname) {
    const fname = req.session.fname;
    const data = { message: fname };
    res.render('success', { data });
  } else {
    res.redirect("/index1.html"); // Ensure file exists in 'public'
  }
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/index1.html"); // Ensure file exists in 'public'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err.message);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
