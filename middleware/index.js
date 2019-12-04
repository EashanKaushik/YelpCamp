var Campground  = require("../controllers/campgrounds/campground_model"),
    Comment     = require("../controllers/comments/comment_model"),
    Constants   = require("../enviroment/constants");

var middlewareObject = {};

middlewareObject.setAdminIfInputSecretCorrect = (req, res, next) => {
    if(req.sanitize(req.body.adminSecretCode)){
        if(req.body.adminSecretCode === process.env.ADMIN_SECRET){
            res.locals.isAdmin = true;
            next();
        }
        else{
            req.flash("error", "Wrong admin secret code. If you're not an admin, just leave it blank and try to sign up again.");
            return res.status(403).redirect("back");
        }
    }
    else{
        next();
    }
}

middlewareObject.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that.");
    return res.status(403).redirect("/login");
}

middlewareObject.isAdmin = (req, res, next) => {
    if(req.user.isAdmin){
        return next();
    }
    req.flash("error", "You need to be an admin to do that.");
    return res.status(403).redirect("/campgrounds");
}

middlewareObject.checkCampgroundOwnership = async (req, res, next) => {
    if(req.isAuthenticated()){      
        await Campground.findById(req.params.id, function(err, foundCampground){
            if(err || !foundCampground){
                req.flash("error", "Campground not found.");
                return res.status(500).redirect("/campgrounds/" + req.params.id);
            }
            else{
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    return next();
                }
                else{
                    req.flash("error", "You don't have permission to do that.");
                    return res.status(403).redirect("/campgrounds/" + req.params.id);
                }
            }
        });
    }
    else{
        req.flash("error", "You need to be logged in to do that.");
        return res.status(403).redirect("/campgrounds/" + req.params.id);
    }
}

middlewareObject.checkCommentOwnership = (req, res, next) => {
    if(req.isAuthenticated()){      
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash("error", "Comment not found.")
                return res.status(500).redirect("back");
            }
            else{
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    return next();
                }
                else{
                    req.flash("error", "You don't have permission to do that.");
                    return res.status(403).redirect("back");
                }
            }
        });
    }
    else{
        req.flash("error", "You need to be logged in to do that.");
        return res.status(403).redirect("back");
    }
};

middlewareObject.findCampground = (req, res, next) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err){
            console.log(err);
            req.flash("error", "Campground not found.");
            return res.status(500).redirect("/campgrounds");
        } else{
            res.locals.campground = foundCampground;
            next();
        }
    });
};

middlewareObject.checkInputLength = function(type){
    return function(req, res, next){
        var objKeys = Object.keys(req.body[type]);
        var objConstants = Constants[type];
        for(property in req.body[type]){
            if(req.body[type][property] && objConstants[property]){
                if(req.body[type][property].length > objConstants[property].maxLength){
                    req.flash("error", `Specified ${objConstants[property].message} is too long. Allowed number of characters is ${objConstants[property].maxLength}.`);
                    return res.status(403).redirect('back');
                }
            }
        }
        next();
    }
}

module.exports = middlewareObject;