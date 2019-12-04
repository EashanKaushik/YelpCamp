var express             = require("express"),
    router              = express.Router(),
    Campground          = require("@campgrounds-controllers/campground_model"),
    Comment             = require("@comments-controllers/comment_model"),
    User                = require("@users-controllers/user_model"),
    Functions           = require("@enviroment/functions"),
    Constants           = require("@enviroment/constants"),
    middleware          = require("@middleware"),
    NodeGeocoder        = require("node-geocoder"),
    upload              = require('@enviroment/multer'),
    cloudinary          = require('cloudinary');

// ===================================== //
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
 
var geocoder = NodeGeocoder(options);
// ===================================== //
cloudinary.config({ 
    cloud_name: String(process.env.CLOUDINARY_CLOUD_NAME), 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// ===================================== //

router.get("/", async function(req, res){
    var perPage = 12;
    var pageNumber = req.query.page ? parseInt(req.query.page) : 1;

    var search_object = {};
    search_object.isPending = false;

    if(req.query.search){
        search_object.name = new RegExp(Functions.escapeRegex(req.query.search), 'gi');      
    }

    var sortingObject = {};
    if(req.query.sort){
        if(Constants.campground["sortingOptions"].includes(req.query.sort)){
            sortingObject[req.query.sort] = req.query.type ? (req.query.type == 'ascending' ? 1 : (req.query.type == 'descending' ? -1 : 1)) : 1;
        }
    } else{
        sortingObject['name'] = 1;
    }

    await Campground.find(search_object).sort(sortingObject).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.status(500).redirect("back");
        } else if(req.query.search && (allCampgrounds.length < 1)){
            req.flash("error", "No campgrounds match that query, please try again.");
            return res.status(204).redirect("/campgrounds");
        } else{
            Campground.count(search_object).exec(async function (err, count){
                if(err){
                    console.log(err);
                    req.flash("error", err.message);
                    return res.status(500).redirect("back");
                } else{
                    var render_object = await {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: (req.query.search && req.query.search != "") ? Functions.escapeRegex(req.query.search) : false,
                        sort: req.query.sort ? Functions.escapeRegex(req.query.sort) : "",
                        type: req.query.type ? Functions.escapeRegex(req.query.type) : ""
                    }

                    if(req.user && req.isAuthenticated()){
                        await User.findById(req.user._id, async function(err, foundUser){
                            if(err){
                                console.log(err);
                                req.flash("error", err.message);
                                return res.status(500).redirect("/campgrounds");
                            } else{
                                render_object["user"] = await foundUser;
                            }
                        })
                    }

                    if(req.query.page > render_object.pages || req.query.page < 1){
                        return res.status(200).redirect("/campgrounds");
                    }
                    res.status(200).render('campgrounds/index', render_object);
                }
            });
        }
    });
});

// CUSTOM ROUTE FOR PUBLISHING PENDING CAMPGROUNDS
router.put("/pending/:id/publish", middleware.isLoggedIn, async (req, res, next) => {
    res.locals.update = {};
    await Campground.findById(req.params.id, async (err, foundCampground) => {
        if(req.user.isAdmin && foundCampground.isPending){
            await geocoder.geocode(foundCampground.location, async function (err, data){
                if (err || data.status === 'ZERO_RESULTS') {
                    req.flash('error', 'Invalid address.');
                    return res.status(500).redirect('back');
                }

                res.locals.update.isPending = await false;
                res.locals.update.location = await data[0].formattedAddress;
                res.locals.update.lat = await data[0].latitude;
                res.locals.update.lng = await data[0].longitude;
                next();
            });
        } else{
            req.flash("error", "You don't have permission to do that.");
            return res.status(403).redirect("/campgrounds");
        }
    });
}, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, res.locals.update, (err, updatedCampground) => {
       if(err){
           console.log(err);
           req.flash("error", err.message);
           return res.status(500).redirect("/campgrounds");
       } else{
            console.log("UPDATED CAMPGROUND");
            console.log(updatedCampground);
            req.flash("success", "Successfully published pending campground.");
            return res.status(200).redirect("/admin");
       }
    });
});

// NEW - FORM TO ADD CAMPGROUNDS
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.status(200).render("campgrounds/new");
});

// CREATE - CREATE NEW CAMPGROUND
router.post("/",
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
    middleware.isLoggedIn, 
    middleware.checkInputLength("campground"), 
    async function(req, res, next){
        if(req.file){
            await cloudinary.uploader.upload(req.file.path, async function(result){
                req.body.campground.image = await result.secure_url;
            });
        }
        next();
    },
    async function(req, res, next){
        req.body.campground = Functions.returnSanitizedInput(req.body.campground);    
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        };
        res.locals.url = "/campgrounds/";
        res.locals.msg = "";
        if(req.body.campground.location && !req.user.isAdmin){
            req.body.campground.isPending = true;
            res.locals.msg = "Successfully created campground. Since you've specified location, it's awaiting confirmation by one of our administrators. Then it will be published";
        } else if(req.body.campground.location && req.user.isAdmin){
            await geocoder.geocode(req.body.campground.location, function (err, data){
                if (err || data.status === 'ZERO_RESULTS') {
                    req.flash('error', 'Invalid address.');
                    return res.status(500).redirect('back');
                } else{
                    req.body.campground.lat = data[0].latitude;
                    req.body.campground.lng = data[0].longitude;
                    req.body.campground.location = data[0].formattedAddress;
                }
            });
            res.locals.msg = "Successfully created campground.";
        }
        next();
    }, function(req, res){
        Campground.create(req.body.campground, (err, createdCampground) => {
            if(err){
                console.log(err);
                req.flash("error", "There was an error while creating a campground. Please try again later.");
                return res.status(500).redirect("/campgrounds");
            } else{
                console.log(createdCampground);
                res.locals.url += (req.body.campground.location && !req.user.isAdmin) ? "" : `${createdCampground._id}`;
                req.flash("success", res.locals.msg);
                return res.status(201).redirect(res.locals.url);
            }
        });
    }
);
    
// SHOW - SHOW ONE CAMPGROUND'S INFO
router.get("/:id", function(req, res){
    //find campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.status(500).redirect("/campgrounds");
        }
        else if(foundCampground.isPending && !req.user.isAdmin){
            req.flash("error", "You can't view this campground right now");
            return res.status(403).redirect("back");
        }
        else{
            //render show template of the specific campground
            res.status(200).render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT - SHOW FORM TO EDIT CAMPGROUND
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found.");
            res.status(500).redirect("/campgrounds");
        }
        else if(foundCampground.isPending && !req.user.isAdmin){
            req.flash("error", "You can't view edit form for this campground right now");
            return res.status(403).redirect("back");
        }
        else{
            res.status(200).render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

// UPDATE - RATING CAMPGROUND
router.put("/:id/rate",
    function(req, res){
        Campground.findById(req.params.id, (err, foundCampground) => {
            if(err){
                console.log(err);
                return res.status(500).send(err.message);
            } else{
                User.findById(req.user._id, async function(err, foundUser){
                    if(err){
                        console.log(err);
                        return res.status(500).send(err.message);
                    } else{
                        foundCampground.rating.votes[String(req.body.rating)] += await 1;
                        var x = await foundCampground.rating.votes;
                        var totalRatings = await (x["1"] +  x["2"] + x["3"] + x["4"] + x["5"]);
                        var totalRatingsValues = await ((x["1"] +  (x["2"]*2) + (x["3"]*3) + (x["4"]*4) + (x["5"]*5)));
                        foundCampground.rating.multipliedRatingsSum = await totalRatingsValues;
                        foundCampground.rating.averageRating = await (totalRatingsValues/totalRatings);
                        foundCampground.rating.votesQuantity += await 1;
                        await foundUser.ratings.push({_id: foundCampground._id, name: foundCampground.name, value: req.body.rating});
                        await foundCampground.save();
                        await foundUser.save();

                        return res.status(200).send(`Successfuly rated a campground. Your rating: ${req.body.rating}`);
                        return res.status(200).send({});
                    }
                });
            }
        });
    }
);

// UPDATE - UPDATE CAMPGROUND WITH DATA FROM EDIT FORM
router.put("/:id",
    function(req, res, next){
        upload(req, res, err => {
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
    async function(req, res, next){
         if(req.file){
            await cloudinary.uploader.upload(req.file.path, async function(result){
                req.body.campground.image = await result.secure_url;
            });
        }
        next();
    },
    middleware.checkCampgroundOwnership, 
    middleware.findCampground, 
    middleware.checkInputLength("campground"), 
    async function(req, res, next){
        req.body.campground = Functions.returnSanitizedInput(req.body.campground);
        res.locals.msg = "Successfully updated campground.";        
        if(res.locals.campground.isPending){
            if(req.user.isAdmin){
                if(req.body.campground.location){
                    if(req.body.campground.location != res.locals.campground.location){
                        await geocoder.geocode(req.body.campground.location, function (err, data){
                            if(err){
                                console.log(err);
                                req.flash("error", "There was an error while uploading a campground. Please try again later.");
                                return res.status().redirect("/campgrounds");
                            } else{
                                req.body.campground.lat = data[0].latitude;
                                req.body.campground.lng = data[0].longitude;
                                req.body.campground.location = data[0].formattedAddress;
                            }
                        });
                    }
                } else{
                    req.body.campground.lng = null;
                    req.body.campground.lat = null;
                }
            } else{
                req.flash("error", "This campground is awaiting confirmation, you don't have permission to update it now.");
                return res.status(403).redirect("/campgrounds");
            }
        } else{
            if(req.body.campground.location){
                if(res.locals.campground.location === req.body.campground.location){
                    req.body.campground = Functions.returnSanitizedInput(req.body.campground);
                } else{
                    if(req.user.isAdmin){
                        await geocoder.geocode(req.body.campground.location, function (err, data){
                            if(err){
                                console.log(err);
                                req.flash("error", err.message);
                                return res.status(500).redirect("/campgrounds");
                            } else{
                                req.body.campground.lat = data[0].latitude;
                                req.body.campground.lng = data[0].longitude;
                                req.body.campground.location = data[0].formattedAddress;
                            }
                        });
                    } else{
                        req.body.campground.isPending = true;
                        res.locals.msg = "Successfully updated campground. Since you've specified location, which is different than the previous one, this campground has to wait for confirmation by one of our administrators.";
                    }
                }
            } else{
                req.body.campground.lat = null;
                req.body.campground.lng = null;
            }
        }
        next();
    },
    function(req, res){
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
            if(err){
                console.log(err);
                req.flash("error", "There was an error while updating a campground. Please try again later.");
                return res.status(500).redirect("/campgrounds");
            } else{
                console.log(updatedCampground);
                req.flash("success", res.locals.msg);
                return res.status(200).redirect("/campgrounds");
            }
        });
    }
);

// DESTROY
router.delete("/:id", middleware.checkCampgroundOwnership, middleware.findCampground, (req, res) => {
    if(res.locals.campground.isPending && !req.user.isAdmin){
        req.flash("error", "You can't remove this campground right now");
        return res.status(403).redirect("back");
    } else{
        Campground.findByIdAndRemove(req.params.id, (err, removedCampground) => {
            if(err || !removedCampground){
                req.flash("error", "Campground not found.");
                res.status(500).redirect("/campgrounds");
            }
            Comment.deleteMany( {_id: { $in: removedCampground.comments } }, (err) => {
                if(err){
                    console.log(err);
                }
                if(req.headers.referer.includes('pending')){
                    req.flash("success", "Successfully removed a campground and it's comments.");
                    return res.status(200).redirect("/campgrounds/pending")
                } else{
                    req.flash("success", "Successfully removed a campground and it's comments.");
                    if(req.headers.referer.includes('campgrounds')){
                        res.status(500).redirect("/campgrounds");
                    } else{
                        res.status(200).redirect("back"); 
                    }               
                }
            });
        });
    }
});

module.exports = router;