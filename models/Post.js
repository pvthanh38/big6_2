var keystone = require('keystone');
var Types = keystone.Field.Types;
var slugify = require('./../plugins/slug');

/**
 * Post Model
 * ==========
 */

var Post = new keystone.List('Post', {
	map: { name: 'title' },
	//autokey: { path: 'slug', from: 'title', unique: true },
	autokey: { from: 'name', path: 'key', unique: true }
});

var myStorage = new keystone.Storage({
	adapter: keystone.Storage.Adapters.FS,
	fs: {
		path: 'data/files',
		publicPath: '/files',
		generateFilename: function (file) {
			return file.originalname;
		}
	}
});

Post.add({
	title: { type: String, required: true },
	slug: { type: String, slug: 'title', unique: false },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' } },
	//image: { type: Types.CloudinaryImage },
	localImage: { type: Types.File, storage: myStorage },
	featureImage: { type: String},
	// test: {
	// 	type: Types.UploadField
	// },
	content: {
		brief: { type: Types.Html, wysiwyg: true, enableImages: true, height: 150 },
		extended: { type: Types.Html, wysiwyg: true, height: 400 },
	},
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true, filters: { type: 'Category' } },
	tags: { type: Types.Relationship, ref: 'PostCategory', many: true, filters: { type: 'Tag' } }
});

Post.schema.plugin(slugify);

Post.schema.virtual('content.full').get(function () {
	return this.content.extended || this.content.brief;
});

Post.defaultColumns = 'title, state|20%, categories, author|20%, publishedDate|20%';
Post.register();
