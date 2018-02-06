var keystone = require('keystone');
var async = require('async');

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

	// Load all categories
	view.on('init', function (next) {
		keystone.list('PostCategory').model.find({type: 'Category'}).sort('name').exec(function (err, results) {
			if (err || !results.length) {
				return next(err);
			}
			locals.data.categories = results;
			next(err);
			// Load the counts for each category
			// async.each(locals.data.categories, function (category, next) {
			//
			// 	keystone.list('Post').model.count().where('categories').in([category.id]).exec(function (err, count) {
			// 		category.postCount = count;
			// 		next(err);
			// 	});
			//
			// }, function (err) {
			// 	next(err);
			// });
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
		var Post = keystone.list('Post');
		
		var _params = {
			page: req.query.page || 1,
			perPage: 10,
			maxPages: 10,
			filters: {
				state: 'published'
			}
		};


		if (locals.data.category) {
			//q.where('categories').in([locals.data.category]);
			_params.filters.categories = {$in: [locals.data.category]};
		}

		if (locals.data.tag) {
			_params.filters.tags = {$in: [locals.data.tag]};
		}
		
		console.log(_params);
		
		var q = Post.paginate(_params)
			.sort('-publishedDate')
			.populate('author categories');

		// if (locals.data.category) {
		// 	q.where('categories').in([locals.data.category]);
		// }
        //
		// if (locals.data.tag) {
		// 	q.where('tags').in([locals.data.tag]);
		// }

		q.exec(function (err, results) {
			locals.data.posts = results;
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
	view.render('index');
};
