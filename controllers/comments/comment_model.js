var mongoose = require("mongoose"),
    User     = require("@users-controllers/user_model"),
    Comment  = require("@comments-controllers/comment_model");
 
var commentSchema = new mongoose.Schema({    
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String
    },

    text: String,

    createdAt: { type: Date, default: Date.now },

    campground: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Campground" },
        author: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            username: String
        },

        name: String,
        
        isPending: { type: Boolean, default: false }
    }
});

module.exports = mongoose.model("Comment", commentSchema);