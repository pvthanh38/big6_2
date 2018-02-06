var keystone = require('keystone');
var Types = keystone.Field.Types;
var slugify = require('./../plugins/slug');
var findOrCreate = require('./../plugins/findOrCreate');

/**
 * Customer Model
 * ==========
 */
var Customer = new keystone.List('Customer');

Customer.add({
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
	address1: { type: String }	
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
});

// Provide access to Keystone
Customer.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});


Customer.schema.plugin(findOrCreate);
/**
 * Relationships
 */
Customer.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });


/**
 * Registration
 */
//Customer.defaultColumns = 'name, email, fb, gg, isAdmin';
Customer.register();
