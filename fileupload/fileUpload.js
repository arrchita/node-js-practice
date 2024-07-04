var http = require('http');
var formidable = require('formidable');
const path = require("path");
var fs = require('fs');

http.createServer(function (req, res) {
    if (req.url == '/fileupload') {
        // Create an instance of the form object
        let form = new formidable.IncomingForm();

        // Set up the upload directory for the form
        form.uploadDir = path.join(__dirname, 'UploadedFiles');

        // Process the file upload in Node
        form.parse(req, function (error, fields, file) {
            if (error) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.write('Error while uploading file');
                res.end();
                return;
            }

            // Get the folder name from the form input
            let folderName = fields.name[0];
            let uploadDir = path.join(form.uploadDir, folderName);

            // Create the folder if it doesn't exist
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Get the temporary file path of the uploaded file
            let tempPath = file.filetoupload[0].filepath;
            let newPath = path.join(uploadDir, file.filetoupload[0].originalFilename);

            // Move the uploaded file to the desired directory
            fs.rename(tempPath, newPath, function (err) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.write('Error while saving the file');
                    res.end();
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.write('NodeJS File Upload Success!');
                res.end();
            });
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
        res.write('<input type="text" name="name"><br>');
        res.write('<input type="file" name="filetoupload"><br>');
        res.write('<input type="submit">');
        res.write('</form>');
        return res.end();
    }
}).listen(8000);
