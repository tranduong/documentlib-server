# Scientific Document - Personalized Recommendation System (SDPRS)
( A product of Research Topic : Text Data Analytics – Storage and personnalized Recommendation )
The work was done by Tran Binh Duong, a researcher in LSIS - Laboratory of Sciences of the Information and Systems.
He was guided and supervised by Professor Mohamed Quafafou, who interests in Theory and Application of Data Mining and Analytics and leads Data, information and 
content management group ( DiMAG ) in LSIS.
The Scientific Document - Personalized Recommendation System is the product which will be developed during the stage of the researcher.

## Getting Started

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
		
	Others Off-the-Shelf modules: [MongoDB] (https://www.mongodb.com/), [Elastic Search] (https://www.elastic.co) and Neo4J (http://neo4j.com/)
		
Please, refer to those to know how to install them.

First you need to install NodeJS with NPM. After that, you can use npm to installer bower and then use bower to install Gulp.
For example: to install Bower by:
$ npm install -g bower --save

to install Gulp by bower:
$ bower install Gulp

### Installing

#### Client-module installation
1. Clone the repository: `git clone https://github.com/tranduong/documentlib-client.git`
2. Install the NodeJS dependencies: `npm install`.
3. Install the Bower dependencies: `bower install`.
4. Run the gulp build task: `gulp build`.

*Note: angular-route, angular-breadcrumb, angular-utils-pagination are added in development, they might be lack.*

*If there is some errors occured and related to YYYYY.min.js files, you can try to install some lacking modules by bower as follow:*

*bower install -g --save bower install angular-route angular-breadcrumbangular-utils-pagination*

5. Run the gulp default task: `gulp`. This will build any changes made automatically, and also run a live reload server on [http://localhost:8888](http://localhost:8888).

*Note: Ensure your preferred web server points towards the `dist` directory.*

#### Server-module installation
1. Clone the repository: `git clone https://github.com/tranduong/documentlib-server.git`
2. Install the NodeJS dependencies: `npm install`.
3. Run server by command : start_server ( to execute the built-in batch file start_server.bat )

*Note: If you use this command `node server.js`, the pdftotext module is not specified so that the textract module work improperly. In other OSs, please make sure that pdftotext module has been installed and work properly before executing the server *

*If there is some errors occured, please try to install shortage packages such as ssh2, textract by command : `npm install ssh2, textract`*

*If you face with this error "js-bson: Failed to load c++ bson extension, using pure JS version", refer [this article](https://github.com/Automattic/mongoose/issues/2285) and [this artice] (http://stackoverflow.com/questions/29238424/error-in-npm-install-inspite-of-changing-the-file-bson/29714359#29714359)*

*Then use follow command: "npm config set python python2.7" & "npm install" (make sure that all installed module has been removed or clean. If you are using Windows, make sure that your system had been installed Visual Studio and Python)*
*If it is still not solved, you should modify the content of index.js file in  ".\node_modules\mongoose\node_modules\mongodb\node_modules\bson\ext" folder from "bson = require('../build/Release/bson'); " to "bson = require('bson'); "" *

#### Integrate them with MongoDB and Elastic Search
When you assure that Client module and Server module are started properly (without error at compiled time), you will turn on a whole system and integrate them step by step:

1. Start the mongodb server, then you will have to configure the server module to point to this database server in the next step. (see Configuration section)
2. Start the elasticsearch server, you will also need to define the pointer to this server on the server module. (see Configuration section)
3. Start the file server, in case you store the data outside the service server node. ( To be determined )
4. Start the (service) server module
5. Configure the client module to point to the search engine server for searchable support (see Configuration section)
6. Start the client module

#### Configuration Server and Client modules to point to other servers
1. To config the server, open the 'config.js' in folder 'config'

*Change the URL to point to your mongo database server's address
config.database.URL				= process.env.MONGO_URL || "mongodb://127.0.0.1:27017/documentlib";

*Change the URL to point to your elastic search engine server's address
config.searchengine.HOST		= "localhost";
config.searchengine.PORT		= 9200;

2. To config the client, open the 'config.js' in folder 'src\js\config'

*Change the DEPLOYED_HOST's URL to point to your service server's address (server module's host and port)
.constant("DEPLOYED_HOST", {"URL": "http://localhost:3001"}) // Change when you have a new 

*Change the SEARCH_HOST's URL to point to your elastic search engine server's address
.constant("SEARCH_HOST", {"URL": "http://localhost:9200", "MULTI_API" : "_msearch", "SINGLE_API" : "_search"}) // Change when you have a new 

### Development
#### Client-module development
Continue developing the client further by editing the `src` directory. With the `gulp` command, any file changes made will automatically be compiled into the specific location within the `dist` directory.

#### Server-module development
Start from server.js, you can modify and implement any others feature if you want.

#### Modules & Packages
##### Client-module packages
By default, client-module includes [`ui.bootstrap`](http://angular-ui.github.io/bootstrap/), [`ui.router`](https://github.com/angular-ui/ui-router), [`ngCookies`](https://docs.angularjs.org/api/ngCookies), 'ngStorage', 'ngRoute', 'ngFileUpload', 'angularUtils.directives.dirPagination', and 'ncy-angular-breadcrumb'.
If you'd like to include any additional modules/packages not included with client-module, add them to your `bower.json` file and then update the `src/index.html` file, to include them in the minified distribution output.

Refers to package.json and bower.json for more information
##### Server-module packages
Refers to package.json for detail information

## Deployment

Add additional notes about how to deploy this on a live system

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Tran Binh Duong** - *Initial work* - [TranDuong](https://github.com/tranduong)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments
### Supervisor of the Project
Professor Mohamed Quafafou (http://www.quafafou.com)

### Contributions from Colleagues

### Credits - Contributors from RDash Templates
* [Elliot Hesp](https://github.com/Ehesp)
* [Leonel Samayoa](https://github.com/lsamayoa)
* [Mathew Goldsborough](https://github.com/mgoldsborough)
* [Ricardo Pascua Jr](https://github.com/rdpascua)

