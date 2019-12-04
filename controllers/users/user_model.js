var mongoose                = require("mongoose"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    Campground              = require("@campgrounds-controllers/campground_model");    

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,

    avatar: { type: String, default: "/placeholder-user.png" },

    createdAt: { type: Date, default: Date.now },

    isAdmin: { type: Boolean, default: false },

    ratings: [
        {
            name: String,
            value: Number,
            _id: { type: mongoose.Schema.Types.ObjectId, ref: "Campground" },
        }    
    ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);