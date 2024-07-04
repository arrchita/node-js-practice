var express = require('express');
var app = express();
var path = require('path');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware to parse JSON bodies (for JSON requests)
app.use(express.json());

// Middleware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve the index1.html as the home page
app.get('/', function (req, res) {
   res.sendFile(path.join(__dirname, "public", "index1.html"));
});

// On receiving GET request for /process_get, display data from query parameters
app.get('/process_get', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<link rel='stylesheet' type='text/css' href='/mystyle.css'>");

    // Prepare output in JSON format
    const response = {
        first_name: req.query.first_name,
        last_name: req.query.last_name
    };

    // Display the received data
    res.write("Welcome " + response.first_name + " " + response.last_name);
    res.end();
});

// On receiving POST request for /process_get, display data from the body
app.post('/process_get', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<link rel='stylesheet' type='text/css' href='/mystyle.css'>");
    res.write("This is a POST request.<br>");

    // Access data sent via POST
    res.write("Welcome " + req.body.first_name + " " + req.body.last_name);
    res.end();
});

// Start the server at port number 5000
var server = app.listen(5000, function () {
    console.log("Express App running at http://127.0.0.1:5000/");
});
