# Scientific Document - Personalized Recommendation System (SDPRS)
( A product of Research Topic : Text Data Analytics – Storage and personnalized Recommendation )
The description below is the context of the work which were done by Tran Binh Duong, a researcher in LSIS - Laboratory of Sciences of the Information and Systems.
The work is guided and supervised by Professor Mohamed Quafafou, who interests in Theory and Application of Data Mining and Analytics and leads Data, information and 
content management group ( DiMAG ) in LSIS.
Natural Language Processing (NLP) has many tasks like text processing, automatic summarization, machine translation, named entity recognition (NER), 
natural language understanding, etc. [1]. Its techniques and methods have been used in many application fields like information retrieval (IR), 
information extraction (IE), text-mining etc. In the internship, we consider the Text mining field, which is concerned with information learning 
from preprocessed text (i.e. identified part of speech, or stemmed word, or named entity recognition etc.). Consequently, heterogeneous information 
is extracted from texts, i.e., geo-localized information, graph of entities, topics hidden in texts and represented as probabilistic distributions, etc. 
Moreover, such data is generally enriched by semantic information collected from different data sources like Wikipedia, LinkedIn or more generally from 
social networks. Thus, rapidly such data became very large, i.e., Big Data, and crucial problem arises that is its storage to allow an efficient automatic 
processing [2].
However, when the data grows to an increasingly large container of resources and information, then we have to take the following problem into account: 
the user is overwhelmed by information and it might result difficult to find the right path while navigating across the resources. In other words, we 
face new problem: overload information. Hence, predicting, suggesting, and filtering items for the users would be helpful to reduce the numerous of data. 
These features become family of such kind system called: recommendation systems [3].
We leverage text mining text with efficient storage to allow the exploration of scientific paper collections to rapid access to a summary, author names, 
list of given papers, etc. Moreover, we consider also personalized services providing, to each user, the information matching its own interests like 
key papers, research topics, authors, events, etc.
In summary, the focused context is text data analytics focusing, more particularly, on the following two dimensions: storage and personalized recommendation.

During the last years, we have developed a Text Analytics API (NLPapi), which is currently used by several researchers. We have also proposed different 
Latent Variables Models API (LVMapi) to learn models that perform different taks as the classification. Both NLP and LVMapi APIs are currently used to 
offer NLP services for our scientific papers mining project. Thus, the trainee will participates to this project focusing on the following objectives:
•	Storage: In order to store a big corpus of textual documents, we need first to define an efficient storage solution considering both structured data 
(SQL-like) and NoSQL data (documents, graphs, etc.). In fact, the NLPapi allows the extraction of heterogeneous data from documents, which must be stored 
according to both its nature and relations it represents. This storage must allows and efficient geo-localized and personalized querying, search and 
recommendation.

•	Personalized recommendation: In order to perform this task, we firstly define the notion of user’s context including his profile including 
his main research interests and all information related to his publications like co-authors, conferences, etc. 
Secondly, we continually update users profiles by analyzing the documents corpus and evaluating their interest for a given user. 
Finally, a profile based recommendation method will be proposed and evaluated on real world data.

Furthermore, a human based evaluation of the recommendation method will be adopted, as different users will give their feedback and more particularly, 
their rating of the proposed recommendations.

In the project, the researcher will participate to the research and development conduced by a research group to mine scientific paper collections. 
More particularly, he will uses the following different methods and techniques: 
•	Storage: we will consider mainly different solutions for storage of unstructured data, like MongaDB [4] and those developed by apache foundation, 
for example, Solr [5], ElasticSearch [6], Cassandra [7], Giraph [8], etc.
•	Personalized recommendation:  We consider a personalized analysis using the LVMapi services to analyse the contextual data related to a given user 
profile. More particularly, we will use LDA-like models [9], as CorrLDA [10], Loc-LDA [11], DTM [12], HpDP [13], etc. Doing so, we continually and 
interactively update user profiles to improve both search and recommendations over time.

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

#### Server-module installation

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

* **Tran Binh Duong** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments
### Supervisor of the Project

### Contributions from Colleagues

### Credits - Contributors from RDash Templates
* [Elliot Hesp](https://github.com/Ehesp)
* [Leonel Samayoa](https://github.com/lsamayoa)
* [Mathew Goldsborough](https://github.com/mgoldsborough)
* [Ricardo Pascua Jr](https://github.com/rdpascua)

* Hat tip to anyone who's code was used
* Inspiration
* etc

