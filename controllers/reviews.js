const Listing= require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async( req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);  //We are storing the new review in the review array we created as can be seen in show.ejs
    newReview.author=req.user._id;

    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created!");

    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req,res)=>{
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id , {$pull: {reviews: reviewId}});
    // matlab reviews array ke andar jo reviewId hai wo delete karna
    await Review.findByIdAndDelete(reviewId)
    req.flash("success"," Review Deleted!");

    res.redirect(`/listings/${id}`);
};