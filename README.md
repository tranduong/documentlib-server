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
5. Run the gulp default task: `gulp`. This will build any changes made automatically, and also run a live reload server on [http://localhost:8888](http://localhost:8888).
** Note: Ensure your preferred web server points towards the `dist` directory.

#### Server-module installation
1. Clone the repository: `git clone https://github.com/tranduong/documentlib-server.git`
2. Install the NodeJS dependencies: `npm install`.
3. Install the Bower dependencies: `bower install`.

#### Integrate them with MongoDB and Elastic Search

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

