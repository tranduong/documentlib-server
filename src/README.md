Scientific Document - Personalized Recommendation System (SDPRS)
=======
( A product of Research Topic : **Text Data Analytics – Storage and personnalized Recommendation** )  

The work was done by Tran Binh Duong, a researcher in LSIS - Laboratory of Sciences of the Information and Systems.He was guided and supervised by Professor Mohamed Quafafou, who interests in Theory and Application of Data Mining and Analytics and leads Data, information and 
content management group ( DiMAG ) in LSIS.  

The Scientific Document - Personalized Recommendation System is the product which will be developed during the stage of the researcher.

Getting Started
-----------

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisities

To run SDPRS, it is required to have:
	
	Client module - Requirements
		* 1. [NodeJS] (http://nodejs.org/) (with [NPM](https://www.npmjs.org/))
		* 2. [Bower] (http://bower.io)
		* 3. [Gulp] (http://gulpjs.com)

	Server module - Requirements
		* 1. [NodeJS] (http://nodejs.org/) (with [NPM](https://www.npmjs.org/))
		* 2. [Bower] (http://bower.io)
		
	Others Off-the-Shelf modules: [MongoDB] (https://www.mongodb.com/), [Elastic Search - v2.0 or above] (https://www.elastic.co) and Neo4J (http://neo4j.com/)
		
Please, refer to their manual documents to know how to install them.

### Installing

#### Client-module installation
First you need to install NodeJS with NPM. After that, you can use npm to installer bower and then use bower to install Gulp.  

1. Clone the repository:  `git clone https://github.com/tranduong/documentlib-client.git`
2. Install the NodeJS dependencies:  `npm install -g`.
	*If there is an error occured with message ENOENT, you should install 'nodejs-legacy' package by command : 'apt-get install nodejs-legacy'. After that, you should remove all installed npm modules to re-install again by command : 'rm -rf ~/.npm'*  
    2.1. to install Bower as a global module by:  
        $`npm install -g bower --save`  

3. Install the Bower dependencies:  `bower install -g`.  
    3.1. to install Gulp by bower:  
        $`bower install Gulp`
4. Run the gulp build task:  `gulp build`.  
(if you don't use -g, the gulp will be located in './node_modules/gulp/bin/' path)  

	**Note:** angular-route, angular-breadcrumb, angular-utils-pagination are added in development, they might be lack.
	
	* If there is some errors occured and related to YYYYY.min.js files, you can try to install some lacking modules by bower as follow:  
	
		$` bower install -g --save bower install angular-route angular-breadcrumbangular-utils-pagination`
		
5. Run the gulp default task: `gulp`.  
    This will build any changes made automatically, and also run a live reload server on [http://localhost:8888](http://localhost:8888).  

	*Note: If you use another web server for client module, please ensure your preferred web server points towards the `dist` directory.*

#### Server-module installation

1. Clone the repository:  
    $`git clone https://github.com/tranduong/documentlib-server.git`
2. Install the NodeJS dependencies:  
    $`npm install`.
3. Run server by command :  
    $`start_server` ( to execute the built-in batch file start_server.bat )  

---
	*If there is some errors occured, please try to install shortage packages such as ssh2, textract by command :  
        $`npm install ssh2, tika, node-java, node-tika, mkdirp, node-neo4j, mime`*  

	*If you face with this error "js-bson: Failed to load c++ bson extension, using pure JS version",  
        refer [this article](https://github.com/Automattic/mongoose/issues/2285) and [this artice] (http://stackoverflow.com/questions/29238424/error-in-npm-install-inspite-of-changing-the-file-bson/29714359#29714359)*  

	*Then use follow command:  
        $`npm config set python python2.7` & `npm install`  
        (make sure that all installed module has been removed or clean. If you are using Windows, make sure that your system had been installed Visual Studio and Python)*  

    *If it is still not solved, you should modify the content of index.js file in  ".\node_modules\mongoose\node_modules\mongodb\node_modules\bson\ext" folder  
        from  
            "bson = require('../build/Release/bson'); "  
        to  
            "bson = require('bson'); "" *  

	*There is some problem with `nodejava` module while running on node v6.4.0,  
        you need to investigate to fix it.

#### Integrate them with MongoDB and Elastic Search
When you assure that Client module and Server module are started properly (without error at compiled time), you will turn on a whole system and integrate them step by step:

1. Start the mongodb server, then you will have to configure the server module to point to this database server in the next step. (see Configuration section)  

	*If you can't connect to mongodb via localhost (or 127.0.0.1) in ubuntu,  
        refer to [this page](http://stackoverflow.com/questions/13312358/mongo-couldnt-connect-to-server-127-0-0-127017) to solve the problem by removing `mongod.lock` file in '/var/lib/mongodb/' folder*  

2. Start the elasticsearch server, you will also need to define the pointer to this server on the server module. (see Configuration section)  

3. Start the file server, in case you store the data outside the service server node. ( To be determined )  

4. Start the Neo4J server, you will need to config the server module to point to the Neo4J server.  

5. Start the (service) server module  

6. Configure the client module to point to the search engine server for searchable support (see Configuration section)  

7. Start the client module  

#### Configuration Server and Client modules to point to other servers
1. To config the server, open the 'config.js' in folder 'config'

	* Change the URL to point to your mongo database server's address  
		`config.database.URL= process.env.MONGO_URL || "mongodb://<Your_Mongo_Server_IP>:<Your_Mongo_Server_Listening_Port>/documentlib"`;  

	* Change the URL to point to your elastic search engine server's address  
		`config.searchengine.HOST		= "<Your_Elastic_Search_Engine_IP_OR_HOSTNAME>";`  

		`config.searchengine.PORT		= <Your_Elastic_Search_Engine_Listening_Port>;` 
		
	* Change the URL to point to your Neo4J server's address :  
		`config.graphdb.URL				= process.env.NEO4J_URL || "http://<User_Name>:<Password>@<Your_Neo4J_Server_IP_OR_HOSTNAME>:<Your_Neo4J_Server_Listening_Port>/";`  
	
2. To config the client, open the 'config.js' in folder 'src\js\config'  

	* Change the DEPLOYED_HOST's URL to point to your service server's address (server module's host and port)  
		`.constant("DEPLOYED_HOST", {"URL": "http://<YOUR_DOCUMENT_LIB_MODULE_SERVER_IP>:<YOUR_DOCUMENT_LIB_MODULE_SERVER_LISTENING_PORT>"}) // Change when you have a new`  

	* Change the SEARCH_HOST's URL to point to your elastic search engine server's address  
		`.constant("SEARCH_HOST", {"URL": "http://<Your_Elastic_Search_Engine_IP_OR_HOSTNAME>:<Your_Elastic_Search_Engine_Listening_Port>", "MULTI_API" : "_msearch", "SINGLE_API" : "_search"}) // Change when you have a new `  

### Development
#### Client-module development
Continue developing the client further by editing the `src` directory.   

With the `gulp` command, any file changes made will automatically be compiled into the specific location within the `dist` directory.  

Rebuild client module by :  
    $`gulp build` command,  
    you should install the `gulp` as a global  

If you cannot use `gulp build` in your environment,  
    you should upload the `dist` version which had been built in another machine to it.  


#### Server-module development
Start from server.js, you can modify and implement any others feature if you want.

#### Modules & Packages

**Client-module packages**  

By default, client-module includes [`ui.bootstrap`](http://angular-ui.github.io/bootstrap/), [`ui.router`](https://github.com/angular-ui/ui-router), [`ngCookies`](https://docs.angularjs.org/api/ngCookies), 'ngStorage', 'ngRoute', 'ngFileUpload', 'angularUtils.directives.dirPagination', and 'ncy-angular-breadcrumb'.  

	If you'd like to include any additional modules/packages not included with client-module,  
    add them to your `bower.json` file and then update the `src/index.html` file,  
    to include them in the minified distribution output.  

	Refers to package.json and bower.json for more information  

**Server-module packages**  

Refers to package.json for detail information  

Deployment
-----------

Add additional notes about how to deploy this on a live system
1. Initialize Database structure in MongoDB, create its folder to store data e.g. '/data/db/'.  
You need to create 'documentlib' database by using 'use documentlib' in mongo console.  
Then create 'User', 'Document' ... collections.  

2. Initialize Neo4J Database, point the database engine to the `documentlib graph data storage` location or copy the data to a database location of neo4j.  

	2.1. Configuration active data base to the `documentlib graph data storage` instance.  

	2.2. Change the owner permission by command: chown -R neo4j:neo4j <your_graphdb_folder>.  
        Note: If you got a "WARNING: Max 1024 open files allowed, minimum of 40 000 recommended. See the Neo4j manual." message in Ubuntu.  

        To fix this, edit this file  
            sudo nano /etc/security/limits.conf (or you can use vi editor)  
                and add these two entries:  
					root    soft    nofile  40000  
					root    hard    nofile  40000  
					neo4j   soft    nofile  40000  
					neo4j   hard    nofile  40000  
					panos   soft    nofile  40000  
					panos   hard    nofile  40000  
				I add an entry for all three users root, neo4j and panos,  
				but you actually just need the one that you’ll use when you restart the service.  
				Then edit the file `/etc/pam.d/su` by following command:  
					sudo nano /etc/pam.d/su  
				uncomment this line  
					session    required   pam_limits.so  
			and restart your server (your machine not the service).  
			Now if you do  `sudo service neo4j-service restart`  
				the warning should have disappeared.  

	2.3. You need to use a browser in GUI mode to access to `http://localhost:7474/browser` to activate your database.  

3. Assign permission to write files on file servers or `<server_application_module>/upload` folder on the server by command:  
	$`chmod -R 777 <folder_name>`.  
	You should assign the owner for this folder to a specified user,  
	and running the server app by the **same user**.  

4. Change search engine configuration to support CORS access:  

	4.1. find the location of `elasticsearch.yml`, Eg: `/etc/elasticsearch/elasticsearch.yml`  
	4.2. edit the config file `elasticsearch.yml` by adding two setting:  

		4.2.1. enable cross-domain accessing :  
			`http.cors.enabled: true`  
		4.2.a. filter localhost domain only:  
			`http.cors.allow-origin: /https?:\/\/<Your_Server_IP>(:[0-9]+)?/`  
			*e.g: Your_Server_IP = localhost*  
		4.2.3. allow the Authorization header field by adding 'Authorization' into the line:  
			`http.cors.allow-headers: X-Requested-With, Content-Type, Content-Length, Authorization`  

		
*5. Upload the sample data to the system  
	5.1. copy the uploaded file samples to `upload` folder on server module  
	5.2. insert sample data into mongodb database  
	5.3. insert sample data into elasticsearch database  
	5.3. insert sample data into neo4j database by copy the sample data folder into `data` location of neo4j,  
		you must change the owned of the folders and its content to neo4j:adm  

Contributing
-----------

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

Versioning
-----------

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

Authors
-----------

* **Tran Binh Duong** - *Initial work* - [TranDuong](https://github.com/tranduong)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

License
-----------

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

Acknowledgement
-----------

### Supervisor of the Project
Professor Mohamed Quafafou (http://www.quafafou.com)

### Contributions from Colleagues

### Credits - Contributors from RDash Templates
* [Elliot Hesp](https://github.com/Ehesp)
* [Leonel Samayoa](https://github.com/lsamayoa)
* [Mathew Goldsborough](https://github.com/mgoldsborough)
* [Ricardo Pascua Jr](https://github.com/rdpascua)

