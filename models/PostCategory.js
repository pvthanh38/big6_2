var slugify = require('./../plugins/slug');
var findOrCreate = require('./../plugins/findOrCreate');

var keystone = require('keystone');
Types = keystone.Field.Types;

/**
 * PostCategory Model
 * ==================
 */

var PostCategory = new keystone.List('PostCategory', {
	autokey: { from: 'name', path: 'key', unique: true },
});

PostCategory.add({
	name: { type: String, required: true },
	//slug: { type: String},
	slug: { type: String, slug: 'name', unique: false },
	type: { type: Types.Select, options: 'Tag, Category' }
});

PostCategory.schema.plugin(slugify);
PostCategory.schema.plugin(findOrCreate);

PostCategory.relationship({ ref: 'Post', path: 'posts', refPath: 'categories' });

PostCategory.register();
