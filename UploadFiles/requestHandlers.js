var querystring = require("querystring"),
    fs = require("fs"),
	formidable = require("formidable");
function start(response, postData) {
	console.log("Request handler 'start' was called");
	var body ='<html>'+
		'<head>'+
		'<meta http-equiv="Content-Type" content="text/html; '+
		'charset=UTF-8" />'+
		'</head>'+
		'<body>'+
		'<form action="/upload" enctype="multipart/form-data" '+
		'method="post">'+
		'<input type="file" name="upload" multiple="multiple">'+
		'<input type="submit" value="Upload file" />'+
		'</form>'+
		'</body>'+
		'</html>';
	response.writeHead(200, {"Content-Type":"text/html"});
	response.write(body);
	response.end();
}

function upload(response, request) {
	console.log("Request handler 'upload' was called");
	var form = new formidable.IncomingForm();
	console.log("about to parse.");
	form.parse(request, function(error, fields, files){
		console.log("about to parse.");
		fs.renameSync(files.upload.path, "./test.html");
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("received test:<br />");
		response.write("<img src='/show' />");
		response.end();
	})
}

function show(response) {
	console.log("Request handler 'show' was called");
	fs.readFile("./test.html", "binary", function(error, file){
		if(error) {
			response.writeHead(500, {"Content-Type":"text/plain"});
			response.write(error + "\n");
			response.end();
		} else {
			response.writeHead(200, {"Content-Type":"text/html"});
			response.write(file, "binary");
			response.end();
		}
	})
}

exports.show = show;
exports.start = start;
exports.upload = upload;