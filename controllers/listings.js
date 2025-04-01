const Listing= require("../models/listing");

module.exports.index=async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index",{allListings});
};

module.exports.renderNewForm = (req,res)=>{
    // isAuthenticate middleware here
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author" , // populate the 'author' field within 'reviews'
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Requested Listing does not exist!");
        return res.redirect("/listings");
    };
    console.log(listing);
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async (req,res, next)=>{
    let url= req.file.path;
    let filename = req.file.filename;
    console.log(url,"..",filename);
    // let{title,image,description,price,country,location}= req.body
    const newListing= new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success","New Listing Created!"); //app.js se ab use karenge
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Requested Listing does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250"); 
    res.render("listings/edit", {listing , originalImageUrl});
};

module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing}); //.listing isiye likha kyuki harr info listing array ke andar hi store karwa rahe hai
    
    if(typeof req.file !== "undefined"){
        let url= req.file.path;
        let filename = req.file.filename;
        listing.image= {url, filename};
        await listing.save();
    }
    
    req.flash("success", "Listing sucessfully updated!");
    res.redirect(`/listings/${id}`)
};

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};