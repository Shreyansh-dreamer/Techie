const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req,res,next)=>{
    console.log(req.user); //agar undefined aaya matlab user logged in nahi hai
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        //req.originalUrl ke andar jaha hum log login kiye bina jaa rahe the 
        //uski info store hoti hai, jaise edit karna chah rahe the bina login kiye 
        //to fir wo  all listings pe direct kar raha tha login ke baad bhi, isse 
        //ab login ke  baad direct edit me jayenge

        req.flash("error", "You must be logged in to add your listing!");
        return res.redirect("/login");
    }
    next();
};
// login karne ke baad passport req.originalUrl erase kardeta hai isliye save 
// karne ke liye locals me save karaliya
module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async(req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
