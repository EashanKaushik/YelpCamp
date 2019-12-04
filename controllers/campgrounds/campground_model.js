var mongoose 	= require("mongoose"),
	Comment 	= require("@comments-controllers/comment_model"),
	User 		= require("@users-controllers/user_model");

var campgroundSchema = new mongoose.Schema({
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String
    },

    image: { type: String, default: "/placeholder.jpg" },

    name: String,
    desc: String,
    price: Number,

    location: { type: String, default: "" },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },

    createdAt: { type: Date, default: Date.now },
    
    comments: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Comment" }   
    ],

    isPending: { type: Boolean, default: false },

    rating: {
        votes: {
            "5": { type: Number, default: 0 },
            "4": { type: Number, default: 0 },
            "3": { type: Number, default: 0 },
            "2": { type: Number, default: 0 },
            "1": { type: Number, default: 0 }           
        },
        averageRating: { type: Number, default: 0 },
        votesQuantity: { type: Number, default: 0 },
        multipliedRatingsSum: { type: Number, default: 0 },
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);