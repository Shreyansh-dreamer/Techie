const mongoose = require("mongoose");
const Schema= mongoose.Schema;
// one listing has many reviews:- Basically, one to many relationship

const reviewSchema = new Schema({
    comment: {
        type: String,
        minLength : 1 
    },
    rating :{
        type: Number,
        min: 1,
        max: 5
    },
    createdAt:{
        type: Date,
        default : Date.now
    },
    author:{
        type: Schema.Types.ObjectId,
        ref: "User",
    }, 
});

module.exports = mongoose.model("Review", reviewSchema);
