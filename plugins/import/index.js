'use strict';
var fs = require('fs');
var keystone = require('keystone');
var async = require('async');
var helpers = require('./../helpers');
var decode = require('ent/decode');
console.log(__dirname);
var readFileAndImport = function readFileAndImport(i) {
	var base = __dirname + '/../../data/import';
	if (i > 3718) return false;
	fs.readFile(base + '/post-' + i + '.json', 'utf-8', function (err, data) {
		try {
			const post_data = JSON.parse(data);
			importPost(post_data, function (result) {
				console.log('imported ' + i);
				readFileAndImport(i + 1);
			});
		}
		catch (e) {
			readFileAndImport(i + 1);
			console.log('Error ' + i, e);
		}
	});
};

function nameToId(names, next) {
	var PostCategory = keystone.list('PostCategory');

	names = names.map(function (val) {
		return helpers.toName(val);
	});

	PostCategory.model
		.find({name: {$in: names}}, {_id: 1, name: 1, type: 1})
		.exec()
		.then(function (posts, err) {
			if (!err) {
				if (posts.length > 0) {
					var tags = [];
					var categories = [];
					for (var i = 0; i < posts.length; i++) {
						var p = posts[i];
						if (p.type === 'Category') {
							categories.push(p._id);
						}
						else {
							tags.push(p._id);
						}
					}
					next({
						tags: tags,
						categories: categories
					});
				}
				else{
					next({
						tags: [],
						categories: []
					});
				}
			}
			else{
				console.log('nameToId err: ',err);
				next();
			}
		});
}

function importPost(post_data, next) {
	var Post = keystone.list('Post');
	var PostCategory = keystone.list('PostCategory');

	var cats = post_data.categories;
	var tags = post_data.tags;

	var names = cats.concat(tags);

	var i = 0, j = 0;
	async.parallel([
		function (next1) {
			async.map(cats, function (cat, done) {
				var catName = decode(cat);
				PostCategory.model.findOrCreate({name: catName, type: 'Category'}, function (err, data) {
					done();
				});
			}, function (err, results) {
				next1();
			});
		},
		function (next2) {
			async.map(tags, function (cat, done) {
				var catName = decode(cat);
				PostCategory.model.findOrCreate({name: catName, type: 'Tag'}, function (err, data) {
					done();
				});
			}, function (err, results) {
				next2();
			});
		}
	], function (err, data) {
		if (!err) {
			nameToId(names, function (cats) {
				var newData = {
					title: post_data.title,
					slug: post_data.slug,
					state: 'published',
					featureImage: post_data.featureImage,
					content: {
						brief: post_data.excerpt,
						extended: post_data.content
					},
					categories: Object.assign([], cats.categories),
					tags: Object.assign([], cats.tags)
				};

				var newPost = new Post.model(newData);
				newPost.save(function (err) {
					next();
				});
			});
		}
		else {
			console.log(err);
			next();
		}
	});
}

module.exports = {
	readFileAndImport: readFileAndImport
};
