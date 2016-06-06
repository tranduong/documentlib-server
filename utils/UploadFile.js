var fs = require('fs');
var ssh2 = require('ssh2');
var path = require('path');
var formidable = require('formidable');
// Create a token generator with the default settings:
var randtoken = require('rand-token');

function UploadFile() {

}

var uploader = UploadFile.prototype;

uploader.uploadSimple = function(req,res, generatedCallback, errCallback, successCallback){
	console.log("Run upload");
	// create an incoming form object
	var form = new formidable.IncomingForm();

	// specify that we want to allow the user to upload multiple files in a single request
	form.multiples = false;
    var uploadedFileName = "";
	// Generate a 16 character alpha-numeric token:
    var token = randtoken.generate(24);
	// store all uploads in the /uploads directory
	form.uploadDir = path.join(__dirname, '../upload/' + token); // change when you change

	if (!fs.existsSync(form.uploadDir)){
		fs.mkdirSync(form.uploadDir);
	}
	// every time a file has been uploaded successfully,
	// rename it to it's orignal name	
	form.on('file', function(field, file) {		
		// do nothing
	});

	// log any errors that occur
	form.on('error', function(err) {
		console.log('An error has occured: ', err);
		if (typeof errCallback === "function") {
			errCallback(err);
		}
	});

	// once all the files have been uploaded, send a response to the client
	form.on('end', function() {
		console.log('Upload Processing is successful');
		if (typeof successCallback === "function") {
			successCallback();
		}
	});

	// parse the incoming request containing the form data
	form.parse(req,function(err, fields, files) {
		var filePathName = path.join(form.uploadDir, files.file.name);		
		//console.log("path = " + filePathName);
		fs.stat(filePathName, function(err, stat) {
			if(err == null) {
				// check if the name is duplicated, add to the name an increased number suffix, eg: '_1', '_2'...
				var increaseNum = 1;
				var stopLoop = false;
				while( true )
				{
					filePathName = path.join(form.uploadDir, files.file.name + "_" + increaseNum);
					console.log("path 1 = " + filePathName);
					fs.stat(filePathName, function(err, stat) {
						if(err == null) {
							increaseNum ++;
						}
						else if(err.code === 'ENOENT') {
							stopLoop = true;
						}
						else {
							console.log('Some other error: ', err.code);
						}
					});
					
					if ( stopLoop )
					{						
						break;
					}						
				}
				
				fs.rename(files.file.path, filePathName);
				console.log("updated path 1 = " + files.file.path);
				// Make sure the callback is a function​
				if (typeof generatedCallback === "function") {					
					var relativePath = path.relative(__dirname + '../', filePathName);
					console.log("path returned = " + relativePath);
					generatedCallback(files.file.name, relativePath, fields);
				}
			} else if(err.code === 'ENOENT') {				
				fs.rename(files.file.path, filePathName);
				console.log("updated path = " + filePathName);
				// Make sure the callback is a function​
				if (typeof generatedCallback === "function") {					
					var relativePath = path.relative(__dirname + '../', filePathName);
					console.log("path returned = " + relativePath);
					generatedCallback(files.file.name, relativePath, fields);
				}				
			} else {
				console.log('Some other error: ', err.code);
			}
		});		
		
    });

};

// Reserved for the next improvement sprint
uploader.uploadSSH = function(req,res, sshLocationPath, strHostname, strHostport, strUserName, strKeyPhrase, generatedCallback,successCallback, errCallback   ) {

	var conn = new ssh2();
	 
	conn.on(
		'connect',
		function () {
			console.log( "- connected" );
		}
	);
	 
	conn.on(
		'ready',
		function () {
			console.log( "- ready" );
	 
			conn.sftp(
				function (err, sftp) {
					if ( err ) {
						console.log( "Error, problem starting SFTP: %s", err );
						process.exit( 2 );
					}
	 
					console.log( "- SFTP started" );
	 
					// upload file
					var readStream = fs.createReadStream( inputStream );
					var writeStream = sftp.createWriteStream( sshLocationPath + originFileName );
	 
					// what to do when transfer finishes
					writeStream.on(
						'close',
						function () {
							console.log( "- file transferred" );
							sftp.end();
							process.exit( 0 );
						}
					);
	 
					// initiate transfer of file
					readStream.pipe( writeStream );
				}
			);
		}
	);
	 
	conn.on(
		'error',
		function (err) {
			console.log( "- connection error: %s", err );
			process.exit( 1 );
		}
	);
	 
	conn.on(
		'end',
		function () {
			process.exit( 0 );
		}
	);
	 
	conn.connect(
		{
			"host": strHostname,
			"port": strHostport,
			"username": strUserName,
			"privateKey": strKeyPhrase // "/home/root/.ssh/id_root"
		}
	);
    return;
};

module.exports = UploadFile;

