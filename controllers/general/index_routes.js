var express             = require("express"),
    router              = express.Router(),
    passport            = require("passport"),
    middleware          = require("@middleware"),
    Campground          = require("@campgrounds-controllers/campground_model"),
    Comment             = require("@comments-controllers/comment_model"),    
    User                = require("@users-controllers/user_model");

// ROOT ROUTE - LANDING PAGE
router.get("/", function(req, res){
    res.status(200).render("landing");
});

router.get("/admin", async (req, res, next) => {
    res.locals.renderData = {};
    if(req.user && req.user.isAdmin){
        Campground.find({}, (err, campgrounds) => {
            if(err){
                console.log(err);
                req.flash("error", err.message);
                return res.status(500).redirect("/campgrounds");
            } else{
                User.find({}, (err, users) => {
                    if(err){
                        console.log(err);
                        req.flash("error", err.message);
                        return res.status(500).redirect("/campgrounds");
                    } else{
                        Comment.find({}, (err, comments) => {
                            if(err){
                                console.log(err);
                                req.flash("error", err.message);
                                return res.status(500).redirect("/campgrounds");
                            } else{
                                res.locals.renderData.users = users;
                                res.locals.renderData.campgrounds = campgrounds;
                                res.locals.renderData.comments = comments;
                                next();
                            }
                        });
                    }
                });
            }
        });
    } else{
        req.flash("error", "You don't have permission to do that.");
        return res.status(403).redirect("/campgrounds");
    }   
}, (req, res) => {
    return res.status(200).render("admin", {campgrounds: res.locals.renderData.campgrounds, users: res.locals.renderData.users, comments: res.locals.renderData.comments});
});

module.exports = router;