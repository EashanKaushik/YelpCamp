var multer = require("multer");

var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    if((parseInt(file.size)/1000) > 50){
        return cb(new Error('Maximum size of an uploaded image is 500kB.'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter, limits: {fileSize: 512000}}).single('image');

module.exports = upload;