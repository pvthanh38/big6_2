var keystone = require('keystone');
var Types = keystone.Field.Types;
var findOrCreate = require('./../plugins/findOrCreate');

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, unique: true, index: true },
	password: { type: Types.Password, initial: true, required: false },
	fb: { type: String},
	gg: { type: String},
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

User.schema.plugin(findOrCreate);
/**
 * Relationships
 */
User.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });


/**
 * Registration
 */
User.defaultColumns = 'name, email, fb, gg, isAdmin';
User.register();
