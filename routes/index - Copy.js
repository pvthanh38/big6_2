/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */
var express =   require("express");
var fs = require('fs');
var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);
var passport = require('passport');
var multer  =   require('multer');



var importPlugin = require('./../plugins/import');

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
};



// Setup Route Bindings
exports = module.exports = function (app) {
	app.use(passport.initialize());
	//app.use(passport.session());
	// Views
	app.get('/', routes.views.index);
	
	app.get('/import', function(req, res){
		// var view = new keystone.View(req, res);
		var Post = keystone.list('Post');
		var PostCategory = keystone.list('PostCategory');
		importPlugin.readFileAndImport(1);
		res.send('Test');
	});
	
	app.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'public_profile', 'email'] }));
	
	app.get('/auth/facebook/callback', 
		passport.authenticate('facebook', { failureRedirect: '/login', scope : ['email', 'public_profile'] }),
		function(req, res) {
			req.session.user = req.user;		
			res.redirect('/');		  
		});
		
	app.get('/auth/google',  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.profile.emails.read'] }));
	app.get('/auth/google/callback', 
		passport.authenticate('google', { failureRedirect: '/login', scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.profile.emails.read'] }), 
		function(req, res) {
			req.session.user = req.user;	
			res.redirect('/');
	});
	app.all('/login', routes.views.login);
	app.all('/ad', routes.views.ad);
	app.get('/:post.html', routes.views.post);
	app.get('/:category?', routes.views.index);
	app.get('/tag/:tag?', routes.views.index);
	app.all('/contact', routes.views.contact);
	
	
	app.get('/api/admin/upload-image', function (req, res) {
		console.log(req);
	});
	
	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
