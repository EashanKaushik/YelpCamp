// ================================================
// DEPENDECIES - LIBRARIES/FRAMEWORKS/MODELS/ROUTES
// ================================================
require('dotenv').config();
require('module-alias/register');

var	Campground			= require("@campgrounds-controllers/campground_model"),
	Comment				= require("@comments-controllers/comment_model"),
	User				= require("@users-controllers/user_model"),
	// reads your .env file in root directory of the project and assigns variables from there to process.env.[variable name]
	mongoose			= require("mongoose"),
	passport			= require("passport"),
	localStrategy		= require("passport-local"),
	methodOverride		= require("method-override"),
	express 			= require("express"),
	app 				= express(),
	bodyParser			= require("body-parser"),
	expressSanitizer 	= require("express-sanitizer"),
	flash 				= require("connect-flash"),
	dotenv				= require("dotenv").config(),
	seedDB				= require("./seeds");

var commentsRoutes		= require("@comments-controllers/comments_routes"),
	campgroundsRoutes	= require("@campgrounds-controllers/campgrounds_routes"),
	indexRoutes 		= require("@general-controllers/index_routes"),
	usersRoutes			= require("@users-controllers/user_routes");

// ================================================
// DATABASE CONNECTION SETUP
// ================================================
// CONNECT
mongoose.Promise = global.Promise;
mongoose.connect('Your mongodb cluster link here',{useNewUrlParser: true,																							  useUnifiedTopology: true
}).then(() => console.log("Database connected!"))
    .catch((err) => console.log("Database error: " + err.message));
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// ================================================
// APP SETUP
// ================================================
// SETTING PUBLIC FOLDER TO BE VISIBLE FOR CLIENTS (CONTAINS CSS/JS FILES)
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/images"));
// MAKING APP USE BODYPARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// SET VIEW ENGINE
app.set("view engine", "ejs");
// USE METHOD OVERRIDE, THAT FIXES PROBLEMS WITH PUT REQUESTS
app.use(methodOverride("_method"));
// USE FLASH MESSAGES PACKAGE
app.use(flash());
// EXPRESS SANITIZER
app.use(expressSanitizer());

// NOW MOMENT.JS IS AVAILABLE IN ALL VIEWS
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Once again. Rusty wins.",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ADD CURRENTLY LOGGED IN USER'S DATA TO ALL TEMPLATES
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

// USE ROUTES FILES
app.use(indexRoutes);
app.use(usersRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/comments", commentsRoutes);

// =====================================
// SERVER LISTENING
// =====================================
// MAKING APP LISTEN ON THE PROCESS.ENV.PORT (IF NOT DEFINED, ON PORT 3000)

// =====================================
// SEED DB THEN APP LISTEN
// =====================================
seedDB().then(() => {
	app.listen(process.env.Port, process.env.IP, () => {
		console.log("===========================================================================");
		console.log(`\nDone, YelpCamp server has started. Listening on port ${process.env.Port}.`);
	});
});
