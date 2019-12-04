var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Campground  = require("@campgrounds-controllers/campground_model"),
    Comment     = require("@comments-controllers/comment_model"),
    middleware  = require("@middleware");

// =====================================
// COMMENTS ROUTES
// =====================================

// NEW COMMENT FORM
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by ID
    Campground.findById(req.params.id, function(err, campground){
        if(err || !campground){
            console.log(err);
            req.flash("error", "Campground not found.");
            res.status(204).redirect("/campgrounds");
        }
        else{
            res.status(200).render("comments/new", {campground: campground});
        }
    });
});

// CREATE COMMENT
router.post("/", middleware.isLoggedIn, middleware.checkInputLength("comment"), function(req, res){
    // lookup campground using ID
    Campground.findById(req.params.id, function(err, campground){
        if(err || !campground){
            console.log(err);
            req.flash("error", "Campground not found.")
            res.status(500).redirect("/campgrounds");
        }
        else if(!req.sanitize(req.body.comment.text)){
            req.flash("error", "Can't add an empty comment.")
            res.status(500).redirect("back");
        }
        else{
            let comment = {
                text: req.sanitize(req.body.comment.text),
                author: {
                    id: req.user._id,
                    username: req.user.username
                },
                campground: {
                    id: campground._id,
                    name: campground.name,
                    author: {
                        id: campground.author.id,
                        username: campground.author.id
                    },
                    isPending: campground.isPending
                }
            };

            // create new comment
            Comment.create(comment, function(err, comment){
                if(err){
                    console.log(err);
                }
                else{
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    // connect new comment to campground
                    campground.comments.push(comment);
                    // save
                    campground.save();
                    // show flash message
                    req.flash("success", "Successfully created a comment.");
                    // redirect to campground show page 
                    res.status(201).redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// EDIT COMMENT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground){
            console.log(err);
            req.flash("error", "Campground not found.");
            res.status(204).redirect("/campgrounds");
        }
        else{
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err || !foundComment){
                    console.log(err);
                    req.flash("error", "Comment not found.")
                    res.status(204).redirect("back");
                }
                res.status(200).render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            });
        }       
    });
});

// UPDATE COMMENT
router.put("/:comment_id", middleware.checkCommentOwnership, middleware.checkInputLength("comment"), function(req, res){
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground){
            console.log(err);
            req.flash("error", "Campground not found.");
            res.status(204).redirect("/campgrounds");
        }
        else{
            Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, foundComment){
                if(err || !foundComment){
                    console.log(err);
                    req.flash("error", "Comment not found.")
                    res.status(204).redirect("back");
                }

                req.flash("success", "Successfully edited a comment.");
                res.status(200).redirect("/campgrounds/" + req.params.id);
            });
        }
    }); 
});

// DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground){
            console.log(err);
            req.flash("error", "Campground not found.");
            res.status(204).redirect("/campgrounds");
        }
        else{
            Comment.findByIdAndRemove(req.params.comment_id, function(err, removedComment){
                if(err || !removedComment){
                    console.log(err);
                    req.flash("error", "Comment not found.")
                    res.status(204).redirect("/campgrounds");
                }
                
                req.flash("success", "Successfully removed a comment.");
                res.status(200).redirect("/campgrounds/" + req.params.id);
            });
        }
    }); 
});

module.exports = router;