var express =   require("express");
var multer  =   require('multer');
var app =   express();
//app.use(bodyParser.json());
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
	  //console.log(file);
    callback(null, Date.now() + '-' +file.originalname);
  }
});
var upload = multer({ storage : storage }).array('file',5);

app.post('/upload/photo',function(req,res){
	res.setHeader('Access-Control-Allow-Origin', '*');
	console.log(req.files);
    upload(req,res,function(err) {
        if(err) {
            return res.end("500");
        }
        //res.end("File is uploaded");
		return res.json(req.files);
    });
});

app.listen(3001,function(){
    console.log("Working on port 3000");
});