const express = require("express");
const router = express.Router({mergeParams: true}); //mergeParams kyu use kiya dekhne ke liye app.js dekho
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,validateReview, isReviewAuthor} = require("../middleware.js");
const { createReview } = require("../controllers/reviews.js");

const reviewController = require("../controllers/reviews.js"); 

// Reviews
// Post Review Route
// /listings/:id/reviews => /
router.post("/",isLoggedIn, validateReview , wrapAsync(reviewController.createReview)); 

//Delete Review Route
//the $pull operator removes from an existing array all insances of a value or values that match a specified condtion
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;