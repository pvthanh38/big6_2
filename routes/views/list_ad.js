var keystone = require('keystone');
var async = require('async');
var fs = require('fs');
exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Init locals
	locals.section = 'blog';
	locals.filters = {
		category: req.params.category ? req.params.category: false,
		tag: req.params.tag ? req.params.tag: false
	};
	
	locals.data = {
		posts: []
	};
	var path = require('path');	
	var city = [];
	var district = [];
	fs.readFile(path.join(__dirname, '../../public') + '/themes/default/json/tinh-thanh.json', "utf8", function(err, data){
		city = JSON.parse(data);	
	});
	fs.readFile(path.join(__dirname, '../../public') + '/themes/default/json/quan-huyen.json', "utf8", function(err, data){
		district = JSON.parse(data);	
	});
	
	// Load all categories
	view.on('init', function (next) {
		keystone.list('PostCategory').model.find({type: 'Category'}).sort('name').exec(function (err, results) {
			if (err || !results.length) {
				return next(err);
			}
			locals.data.categories = results;
			next(err);
			
		});
	});

	// Load the current category filter
	view.on('init', function (next) {
		if (req.params.category || req.params.tag) {
			if (req.params.category){
				keystone.list('PostCategory').model.findOne({slug: locals.filters.category}).exec(function (err, result) {
					locals.data.category = result;
					next(err);
				});	
			}
			else{
				keystone.list('PostCategory').model.findOne({slug: locals.filters.tag}).exec(function (err, result) {
					locals.data.tag = result;
					next(err);
				});
			}
			
		} else {
			next();
		}
	});

	// Load the posts
	view.on('init', function (next) {
		var Ad = keystone.list('Ad');
		
		var _params = {
			page: req.query.page || 1,
			perPage: 10,
			maxPages: 10,
			filters: {
				state: 'published'
			}
		};
		
		console.log(_params);
		
		var q = Ad.paginate(_params)
			.sort('-publishedDate');

		// if (locals.data.category) {
		// 	q.where('categories').in([locals.data.category]);
		// }
        //
		// if (locals.data.tag) {
		// 	q.where('tags').in([locals.data.tag]);
		// }

		q.exec(function (err, results) {
			
			//console.log(results.results);
			var post_all = results.results;
			for (var k in post_all){
				var tar = post_all.hasOwnProperty(k);
				var city_id = post_all[k].city;
				var district_id = post_all[k].district;
				var images = post_all[k].images;
				var ar = images.split(",");
				//console.log(city[city_id]);
				//post_all[k].city_name = city[city_id].name;
				post_all[k].city = city_id + "|" + city[city_id].name;
				post_all[k].district = district_id + "|" + district[district_id].name;
				post_all[k].images = ar[1];
				results.results = post_all;
				locals.data.posts = results;
			}
			
			next(err);
		});
	});


	// Load the posts
	view.on('init', function (next) {
		var Post = keystone.list('Post');
		var q = Post.paginate({
			page: req.query.page || 1,
			perPage: 8,
			maxPages: 1,
			filters: {
				state: 'published'
			}
		})
			.sort('-publishedDate');

		if (locals.data.category) {
			
			q.where('categories').in([locals.data.category]);
		}

		q.exec(function (err, results) {
			locals.data.vipPosts = results;
			next(err);
		});
	});
	
	// Render the view
	view.render('ad-list');
};
