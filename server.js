
var restify = require('restify');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');


var server = restify.createServer({
	//sever property
	name: 'fitting timer server',
	version: '1.0.0'
});

//db
var mongodb;
MongoClient.connect('mongodb://fittingTimerUser:test@ds051750.mongolab.com:51750/heroku_app29339179', function(err, db){
	assert.equal(err, null, 'DB connection failed');
	console.log('Connected to DB');
	mongodb = db;
});

/**
 * plug in
 */
server.use(restify.bodyParser());
server.use(function(req, res, next){
	console.log('get request from: ' + req.time());
	next();
});


/**
 * DB function
 */

 var createTimer = function(db, timer, callback){
 	timer.creationTime = new Date();
 	delete timer._id;	//need to clear out the _id
 	var collection = db.collection('timers');
 	collection.insert(timer,function(err, result){
 		if(err){
 			assert.equal(err, null, err.err);
 		}
 		callback(result);
 	});
 } 

var findTimers = function(db, callback){
	var collection = db.collection('timers');
	collection.find({}).toArray(function(err, result){
		assert.equal(err, null, "Find timers error");
		callback(result);
	});
}

var deleteTimers = function(db, callback){
	var collection = db.collection('timers');
	collection.remove(function(err, num){
		callback(num);
	});
}
//Constructor
var Timer = function(){
	this.name = 'template',
	this.warmUpLength = 10,
	this.roundLength = 30,
	this.restLength = 20,
	this.coolDownLength = 30,
	this.cycle = 10
};
/**
 * routing
 */


//get next 10 timers
server.get('/timers', function(req, res, next){
	findTimers(mongodb, function(timers){
		res.send(200, {timers: timers});
	});

/*
	res.send(200, 
		[{id: 1, name: 'timer 1', Descripton: 'This is a good timer'},
		{id: 1, name: 'timer 2', Descripton: 'This is also a good timer'}
		]);
	//res.send('test');
*/
	next();
});

//get a timer info
server.get('/timers/:id', function(req, res, next){
	res.send(200);
});


//create a timer
server.post('/timers', function(req, res, next){
	//verify the data
	if(!req.params.timer){
		console.log("No timer passed in. Creating a template.");
		//create a template timer
		var templateTimer = new Timer();
		createTimer(mongodb, templateTimer, function(result){
			res.send(result);
		});
	}else{
		createTimer(mongodb, req.params.timer, function(result){
			res.send(result);
		});
	}
});


//update a timer or create one if it doens't exist
server.put('/timers/:id', function(req, res, next){

});

//delete a timer
server.del('/timers/:id',function(req, res, next){

});

//delete all timers. Be careful to send this request
server.del('/timers', function(req, res, next){
	deleteTimers(mongodb, function(result){
		res.send(result);
	});
	next();
});



server.listen(5000, function(){
	console.log('%s listening at %s', server.name, server.url);
});