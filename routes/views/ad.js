var keystone = require('keystone');
var async = require('async');
var fs = require('fs');
var each = require('async-each');


exports = module.exports = function (req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals;
	var customer = keystone.list('Customer');
	var Ad = keystone.list('Ad');
	// Init locals
	//var ob = {name: 'Thanh werwe Phan', email: 'pvthanh3wer8@gmail.com', password: '1234@qwer', isAdmin: false};
	
	
	locals.section = 'blog';
	locals.filters = {
		post: req.params.post,
		category: req.params.category ? req.params.category: false,
		tag: req.params.tag ? req.params.tag: false
	};
	locals.data = {
		posts: []
	};
	
	if (!req.session.user || req.session.user == null || req.session.user == undefined) { res.redirect('/login'); return true;}
	//console.log(req.session.user);
	view.on('post', { action: 'ad.create' }, function (next) {
		
		var path = require('path');			
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();
		if(dd<10){
			dd='0'+dd;
		} 
		if(mm<10){
			mm='0'+mm;
		} 
		var today = dd+'/'+mm+'/'+yyyy;
		if(!req.body.image || req.body.image == ""){
			res.end("Image not empty");
			return false;
		}
		var ob = { user_id: req.session.user._id,
			category: req.body.category, city: req.body.city, district: req.body.district
			, ward: req.body.ward, address: req.body.address, title: req.body.title
			, price: req.body.price, content: req.body.content, images: req.body.image
			, full_name: req.body.full_name, phone: req.body.phone, address1: req.body.address1
			, state:'published', publishedDate:today
		};
		Ad.model.findOrCreate(ob, function (err, ad) {
			console.log(err);
			if(err === null){
				res.redirect('/');
				res.end();
			}else{
				res.end(500);
				return false;
			}
		});	
		return true;
		
	});
	
	view.on('post', { action: 'district' }, function (next) {
		var path = require('path');	
		//console.log(req.body.district);
		var obj = {dev: path.join(__dirname, '../../public') + '/themes/default/json/xa.json'};
		var configs = {};
		var wards = [];
		each(obj, fs.readFile, function(error, data) {
			var target = JSON.parse(data); 	
			for (var k in target){
				var tar = target.hasOwnProperty(k);
				//console.log(target[k].parent_code +"-"+req.body.district);
				if (tar && target[k].parent_code == req.body.district) { 
					 //alert("Key is " + k + ", value is" + target[k]); && tar.parent_code == req.body.district
					console.log(target[k].parent_code +"-"+req.body.district);
					wards.push(target[k]); 
					
				}
			}
		});
		
	});
	var path = require('path');	
	fs.readFile(path.join(__dirname, '../../public') + '/themes/default/json/tinh-thanh.json', "utf8", function(err, data){
		locals.data.city = JSON.parse(data);	
	});
	fs.readFile(path.join(__dirname, '../../public') + '/themes/default/json/quan-huyen.json', "utf8", function(err, data){
		locals.data.district = JSON.parse(data);	
	});
	fs.readFile(path.join(__dirname, '../../public') + '/themes/default/json/xa.json', "utf8", function(err, data){
		locals.data.ward = JSON.parse(data);	
	});
	if (req.method == "GET") {
		view.on('init', function (next) {
			locals.data.test = "kaka test";
			keystone.list('PostCategory').model.find({type: 'Category'}).sort('name').exec(function (err, results) {
				if (err || !results.length) {
					return next(err);
				}
				locals.data.categories = results;
				next(err);
				
			});
		});
    }
	
	// Render the view
	view.render('ad');
};
