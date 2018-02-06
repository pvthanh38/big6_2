'use strict';

var _slug = require('slug');
var decode = require('ent/decode');

var _slug2 = _interopRequireDefault(_slug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prepareSlug(string){
	var __slug = decode(string).replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g,'-');
	__slug = __slug.replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g,'-');
	var slug = (0, _slug2.default)(__slug, { lower: true });
	return slug.replace('--','-');
}

module.exports = function (schema, options) {
	var field = schema.tree.slug.slug;

	schema.pre('validate', function (next) {
		var _id = this['_id'];
		var slug = false;
		if (this['slug']) {
			slug = this['slug'];
		} else {
			slug = prepareSlug(this[field]);
		}

		if (!slug) {
			next();
			return true;
		}

		var c = this.constructor;

		var that = this;
		this.schema.statics.slugify(c, slug, _id, 0, function (final_slug) {
			that['slug'] = final_slug;
			next();
		});
	});

	schema.pre('update', function (next) {
		var data = this._update.$set;

		if (data.hasOwnProperty(field)) {

			var slug = false;
			if (this['slug']) {
				slug = this['slug'];
			} else {
				//slug = (0, _slug2.default)(this[field], { lower: true });
				slug = prepareSlug(this[field]);
			}

			var _id = this._conditions['_id'];

			var that = this;
			this.model.slugify(false, slug, _id, 0, function (final_slug) {
				data['slug'] = final_slug;
				next();
			});
		} else next();
	});

	// Unique slug generator, converts `slug` to `slug_1` if `slug` exists
	schema.statics.slugify = function (c, slug, _id, count, cb) {
		var _this = this;

		// TODO: Check that slug is not bigger than 1000 characters
		var final_slug = count ? slug + '-' + (count || '') : slug;

		var search_slug = function search_slug(item) {
			if (item) {
				if ('' + item._id === '' + _id)
				// Checks if current document has already the current slug
					cb(final_slug);else return _this.slugify(c, slug, _id, (count || 0) + 1, cb);
			} else cb(final_slug);
		};

		var that = c || this;
		that.findOne({ slug: final_slug }).then(search_slug);
	};
};
