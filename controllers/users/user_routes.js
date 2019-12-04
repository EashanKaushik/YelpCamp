var express             = require("express"),
    router              = express.Router(),
    passport            = require("passport"),
    middleware          = require("@middleware"),
    Campground          = require("@campgrounds-controllers/campground_model"),
    Comment             = require("@comments-controllers/comment_model"),
    User                = require("@users-controllers/user_model"),
    multer              = require('multer'),
    cloudinary          = require('cloudinary');

// ===================================== //
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
cloudinary.config({ 
    cloud_name: String(process.env.CLOUDINARY_CLOUD_NAME), 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// ===================================== //

// SHOW SIGN UP FORM
router.get("/register", function(req, res){
    res.status(200).render("register"); 
});

// SIGN UP
router.post("/register",
    function(req, res, next){
        upload(req, res, err => {
            console.log(req.body);
            console.log(req.file);
            console.log(req.files);
            if(err){
                console.log(err);
                req.flash("error", err.message);
                var status = err instanceof multer.MulterError ? 415 : 500;
                return res.status(status).redirect("back");
            } else{
                next();
            }
        })
    },
    middleware.setAdminIfInputSecretCorrect,
    async function(req, res, next){
        if(req.file){
            await cloudinary.uploader.upload(req.file.path, async function(result){
                req.body.avatar = await String(result.secure_url);
            });
        }
        next();
    },
    async function(req, res, next){ 
        var newUser = await new User({
            username: req.sanitize(req.body.username),
            firstName: req.sanitize(req.body.firstname),
            lastName: req.sanitize(req.body.lastname),
            email: req.sanitize(req.body.email),
            avatar: req.sanitize(req.body.avatar),
            isAdmin: res.locals.isAdmin
        });
        res.locals.newUser = await newUser;
        next();
    },
    function(req, res){
        console.log(res.locals.newUser);
        User.register(res.locals.newUser, req.sanitize(req.body.password), function(err, user){
            if(err){
                console.log(err);
                req.flash("error", err.message);
                res.status(500).redirect("/register");
            } else{
                passport.authenticate("local")(req, res, function(){
                    console.log("NEWLY CREATED USER:");
                    console.log(user);
                    let msg = `Successfully signed up and logged in. Welcome to YelpCamp ${user.username}!`;
                    msg += user.isAdmin ? `  >>  Your user role: admin  <<` : ``;
                    req.flash("success", msg);
                    res.status(200).redirect("/campgrounds");   
                });
            }           
        });
    }
);

// SHOW LOGIN FORM
router.get("/login", function(req, res){
    res.status(200).render("login");    
});

// LOG IN
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    successFlash: 'You are logged in!',
    failureFlash: 'Something went wrong.'
}));

// LOG OUT
router.get("/logout", function(req, res){
    if(req.isAuthenticated()){
        req.logout();
        req.flash("success", "Successfully logged you out!");
        res.status(200).redirect("/campgrounds");
    }
    else{
        req.flash("error", "You need to be logged in to do that.");
        res.status(403).redirect("back");
    }
});

// USER INDEX ROUTE
router.get("/users", middleware.isLoggedIn, (req, res) => {
    if(req.user.isAdmin){
        User.find({}, (err, users) => {
                if(err){
                        console.log(err);
                        req.flash("error", err.message);
                        return res.status(500).redirect("/campgrounds");
                    } else{         
                    return res.status(200).render("users/index", {users: users});
                    }
            });
    } else{
        req.flash("error", "You need to be an admin to do that.");
        return res.status(403).redirect("campgrounds");
    }       
});

// USER SHOW ROUTE
router.get("/users/:id", (req, res) => {
    User.findById({_id: req.params.id}, (err, foundUser) => {
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.status(500).redirect("/campgrounds");
        } else{
            Campground.find().where("author.id").equals(foundUser._id).sort({"createdAt": 1}).exec(function(err, campgrounds){
                if(err){
                    console.log(err);
                    req.flash("error", err.message);
                    return res.status(500).redirect("/campgrounds");
                } else{
                    Comment.find().where("author.id").equals(foundUser._id).sort({"createdAt": 1}).exec(function(err, comments){
                        if(err){
                            console.log(err);
                            req.flash("error", err.message);
                            return res.status(500).redirect("/campgrounds");
                        } else{
                            return res.status(200).render("users/show", {user: foundUser, campgrounds: campgrounds, comments: comments});
                        }
                    });
                }
            });
        }
     });
});

// UPGRADE USER TO ADMIN
router.put("/users/:id/op", middleware.isLoggedIn, (req, res) => {
    if(req.user.isAdmin){
        User.findByIdAndUpdate(req.params.id, {isAdmin: true}, (err, updatedUser) => {
            if(err){
                console.log(err);
                req.flash("error", err.message);
                return res.status(500).redirect("/campgrounds");
            } else{
                req.flash("success", "Successfully made user an admin.");
                return res.status(200).redirect("back");
            }
        });
    } else{
        req.flash("error", "You don't have permission to do that");
        return res.status(403).redirect("/campgrounds");
    }
});

// DEGRADE USER FROM ADMIN
router.put("/users/:id/unop", middleware.isLoggedIn, (req, res) => {
    if(req.user.isAdmin){
        User.findByIdAndUpdate(req.params.id, {isAdmin: false}, (err, updatedUser) => {
            if(err){
                console.log(err);
                req.flash("error", err.message);
                return res.status(500).redirect("/campgrounds");
            } else{
                req.flash("success", "Successfully made admin an regular user.");
                return res.status(200).redirect("back");
            }
        });
    } else{
        req.flash("error", "You don't have permission to do that");
        return res.redirect("/campgrounds");
    }
});

// USER DELETE ROUTE
router.delete("/users/:id", middleware.isLoggedIn, (req, res) => {
    if(req.user.isAdmin || (req.user._id.equals(req.params.id))){
        User.findByIdAndRemove(req.params.id, (err, removedUser) => {
            if(err){
                console.log(err);
                req.flash("error", err.message);
                return res.status(500).redirect("/campgrounds");
            } else{
                Comment.deleteMany().where("author.id").equals(req.params.id).exec((err, removedComments) => {
                    if(err){
                        console.log(err);
                        req.flash("error", err.message);
                        return res.status(500).redirect("/campgrounds");
                    } else{
                        Campground.deleteMany().where("author.id").equals(req.params.id).exec((err, removedCampgrounds) => {
                            if(err){
                                console.log(err);
                                req.flash("error", err.message);
                                return res.status(500).redirect("/campgrounds");
                            } else{
                                req.flash("success", "Successfully removed user, comments created by him aswell as created campgrounds.");
                                return res.status(200).redirect("/users");
                            }
                        });
                    }
                });
            }
        });
    } else{
        req.flash("error", "You don\'t have enough priviliges to do that.");
        return res.status(403).redirect("/campgrounds");
    }
});

module.exports = router;