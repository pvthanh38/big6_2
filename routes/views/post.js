var keystone = require('keystone');
var async = require('async');
var helpers = require('./../../plugins/helpers');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'blog';
	locals.filters = {
		post: req.params.post,
	};
	locals.data = {
		posts: [],
		relatedPosts: [],
		relatedPosts2: []
	};

	// view.on('init', function(next){
	// 	keystone.list('Post').model.find().where('categories').in([category.id]).exec(function(err, posts) {
	//		
	// 	});
	// });
	// Load the current post
	view.on('init', function (next) {
		var q = keystone.list('Post').model.findOne({
			state: 'published',
			slug: locals.filters.post
		}).populate('author categories tags');

		q.exec(function (err, result) {

			result = helpers.contentFilter(result);
			
			locals.data.post = result;
			
			async.parallel({
				relatedPost1: function (next1) {
					var cats = result.categories;
					if (cats.length > 0) {
						var cat_ids = cats.map(function (cat) {
							if (cat.type === 'Category')
								return cat._id;
							return 0;
						});

						keystone.list('Post').model.find()
							.where('categories')
							.in(cat_ids)
							.limit(8)
							.exec(function (err, posts) {
								next1(err, posts);
							});
					}
				},
				relatedPost2: function (next2) {
					var tags = result.tags;
					var tag_ids = [];

					if (tags.length > 0) {
						tag_ids = tags.map(function (tag) {
							if (tag.type === 'Tag')
								return tag._id;
							return 0;
						});
						keystone.list('Post').model.find()
							.where('tags')
							.in(tag_ids)
							.limit(4)
							.exec(function (err, posts) {
								//locals.data.relatedPosts2 = posts;
								next2(err,posts);
							});
					}
				}
			}, function(err, result){
				locals.data.relatedPosts = result.relatedPost1;
				locals.data.relatedPosts1 = result.relatedPost2;
				next();
			});
		});

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

	// Render the view
	view.render('post');
};
