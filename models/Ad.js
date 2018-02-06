var keystone = require('keystone');
var Types = keystone.Field.Types;
var slugify = require('./../plugins/slug');
var findOrCreate = require('./../plugins/findOrCreate');

/**
 * Ad Model
 * ==========
 */
var Ad = new keystone.List('Ad');

Ad.add({
	user_id: { type: String, initial: true, required: true, index: true },
	category: { type: String },
	city: { type: String },
	district: { type: String },
	ward: { type: String },
	address: { type: String },
	title: { type: String },
	price: { type: String },
	content: { type: String },
	images: { type: String },
	full_name: { type: String },
	phone: { type: String },
	address1: { type: String },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' } }
});



Ad.schema.plugin(findOrCreate);
/**
 * Relationships
 */
Ad.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });


/**
 * Registration
 */
//Ad.defaultColumns = 'name, email, fb, gg, isAdmin';
Ad.register();
