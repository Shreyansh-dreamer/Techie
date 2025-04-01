const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js"); 
const multer  = require('multer'); //used for uploading files and handling multipart data
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

// Filtered Routes (GET method only)
router.get("/", async (req, res) => {
    let allListings = await Listing.find({});

    if (req.query.category) {
        const selectedCategory = req.query.category;
        allListings = allListings.filter(listing => {
            if (listing.category && Array.isArray(listing.category)) {
                return listing.category.includes(selectedCategory);
            }
            return false;
        });
        res.render("listings/index.ejs", { allListings: null, filteredListings: allListings });
    }
    // for destination searched on the search bar 
    else if (req.query.searchQuery) {
        const searchQuery = req.query.searchQuery;
        // The $regex operator provides regular expression capabilities for pattern matching within string fields. It allows you to perform flexible and powerful searches.
        // $options: "i" makes the search case-insensitive.
        allListings = await Listing.find({
            $or: [
                { location: { $regex: searchQuery, $options: "i" } },
                { country: { $regex: searchQuery, $options: "i" } },
            ],
        });
        res.render("listings/index.ejs", { allListings: null, filteredListings: allListings });
    } else {
        res.render("listings/index.ejs", { allListings: allListings, filteredListings: null });
    }
});

router.route("/")
    // Index Route
    .get(wrapAsync(listingController.index))
    // Create Route
    .post(isLoggedIn ,upload.single("listing[image]"), validateListing,
        wrapAsync(listingController.createListing));


//New Route 
router.get("/new",isLoggedIn , listingController.renderNewForm);    

router.route("/:id")
    //Show Route
    .get(wrapAsync(listingController.showListing))
    //Update Route
    .put(isLoggedIn,isOwner,validateListing,wrapAsync(listingController.updateListing))
    //Delete Route
    .delete(isLoggedIn, isOwner , wrapAsync(listingController.destroyListing));

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner ,wrapAsync(listingController.renderEditForm));

module.exports = router;