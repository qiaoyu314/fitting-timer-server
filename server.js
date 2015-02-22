
var restify = require('restify');
var MongoClient = require('mongodb').MongoClient;
ObjectID = require('mongodb').ObjectID;
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
server.use(restify.queryParser());
server.use(function(req, res, next){
	console.log('get request from: ' + req.time());
	next();
});


/**
 * DB function
 */

 var createTimer = function(db, timer, callback){
 	timer.creationTime = new Date();

 	var collection = db.collection('timers');
 	collection.insert(timer,function(err, result){
 		if(err){
 			assert.equal(err, null, err.err);
 		}
 		callback(result);
 	});
 } 

//find all timers
var findTimers = function(db, loadSize, loadFrom, callback){
	var collection = db.collection('timers');
	if(loadFrom){
		loadFrom = new ObjectID(loadFrom);
		collection.find({_id: {$gt: loadFrom}}).sort({_id: 1}).toArray(function(err, result){
			console.log(result);
		});
		
		collection.find({_id: {$gt: loadFrom}}).sort({_id: 1}).limit(loadSize).toArray(function(err, result){
				assert.equal(err, null, "Find timers error");
				callback(result);
			});	
	}else{
		collection.find({},{name: 1}).sort({_id: 1}).toArray(function(err, result){
			console.log(result);
		});
		collection.find().sort({_id: 1}).limit(loadSize).toArray(function(err, result){
				assert.equal(err, null, "Find timers error");
				callback(result);
			});
	}
	
}

//delete all timers
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
	this.cycle = 10,
	this.description = "This is a good timer"
};
/**
 * routing
 */


server.get('/timers', function(req, res, next){
	var loadSize, loadFrom;
	if(req.query){
		//print out all properties 
		console.log("Has query");

		if(req.query.loadParams){
			console.log("has load params");
			loadSize = parseInt(req.query.loadParams.loadSize);
			loadFrom = req.query.loadParams.loadFrom;
		}
	}
	console.log("size: " + loadSize + " from: " + loadFrom);
	findTimers(mongodb, loadSize, loadFrom, function(timers){
		res.send(200, {timers: timers});
	});
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



server.listen(process.env.PORT || 5000, function(){
	console.log('%s listening at %s', server.name, server.url);
});