
var index = require('./index');
var user = require('../app/controller/user');
var article = require('../app/controller/article');

module.exports = function(app){

	app.use('/', index);

	app.use('/user', user);

	app.use('/article',article);
	
}