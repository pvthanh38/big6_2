var keystone = require('keystone');
var async = require('async');
//google
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
  
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new GoogleStrategy({
    clientID: "891018322895-ljf5rahhd5eg2atpdiutoblls8b690bb.apps.googleusercontent.com",
    clientSecret: "shGwWG37LT1E6lPGPTPQOS6L",
    callbackURL: "http://localhost:3010/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
		var User = keystone.list('User');
		keystone.list('User').model.findOne({ email: profile._json.emails[0].value, gg:'1' }).exec(function(err, user) {
			if (user) {
				done(null, user);	
			}else{
				User.model.findOrCreate({name: profile.displayName, email: profile._json.emails[0].value, password: 'gg', gg:'1', isAdmin: false}, function (err, user) {
					done(null, user);
				});
			}			
		});
  }
));

//facebook
	passport.use(new FacebookStrategy({
		clientID: '715603241959374',
		clientSecret: '4ee0f16c3204909400b20bd12b8313ef',
		callbackURL: "http://localhost:3010/auth/facebook/callback",
		profileFields: ['id', 'emails', 'name']
	},
	function(accessToken, refreshToken, profile, done) {
		//console.log(profile);
		var User = keystone.list('User');
		keystone.list('User').model.findOne({ email: profile._json.email, fb:'1' }).exec(function(err, user) {
			if (user) {
				done(null, user);	
			}else{
				User.model.findOrCreate({name: profile._json.first_name + ' ' + profile._json.last_name, email: profile._json.email, password: 'fb', fb:'1', isAdmin: false}, function (err, user) {
					done(null, user);
				});
			}			
		});
		
		
		}
	));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

exports = module.exports = function (req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals;
	var customer = keystone.list('User');
	// Init locals
	/*//customer.model.findOrCreate({name: 'Thanh Phan', email: 'pvthanh38@gmail.com', password: '1234@qwer', isAdmin: false}, function (err, data) {
		done();
	});//*/
	locals.section = 'blog';
	locals.filters = {
		category: req.params.category ? req.params.category: false,
		tag: req.params.tag ? req.params.tag: false
	};
	locals.data = {
		posts: []
	};
	
		
	
	view.on('post', { action: 'login.create' }, function (next) {
		keystone.list('User').model.findOne({ email: req.body.username }).exec(function(err, customer) {    
			if (err || !customer) {
				return res.json({
					success: false,
					session: false,
					message: (err && err.message ? err.message : false) || 'Sorry, there was an issue signing you in, please try again.'
				});
			}
			
			keystone.session.signin({ email: req.body.username, password: req.body.password }, req, res, function(customer) {		  
				req.session.user = customer;
				res.redirect('/ad');		
			  
			}, function(err) {		  
				return res.json({
					success: true,
					session: false,
					message: (err && err.message ? err.message : false) || 'Sorry, there was an issue signing you in, please try again.'
				});
			});
		});
	});
	
	if (req.session.user && req.session.user != null && req.session.user != undefined) { res.redirect('/'); return true;}
	
	view.on('init', function (next) {
		keystone.list('PostCategory').model.find({type: 'Category'}).sort('name').exec(function (err, results) {
			if (err || !results.length) {
				return next(err);
			}
			locals.data.categories = results;
			next(err);
			
		});
	});
	// Render the view
	view.render('login');
};
