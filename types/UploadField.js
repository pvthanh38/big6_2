var keystone = require('keystone');
var util = require('util');

var uploadField  = function(list, path, options){
	this._nativeType = Number;
	uploadField.super_.call(this, list, path, options);
	console.log('ahihi');
};

util.inherits(uploadField, keystone.Field);
module.exports = uploadField;
