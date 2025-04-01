if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}

const express= require("express");
const app = express();
const mongoose = require("mongoose");
const path=require("path");
const req = require("express/lib/request.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport=require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); 

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//const MONGO_URL="mongodb://127.0.0.1:27017/AirBNB";
const dbUrl = process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl)
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600, //seconds
});

store.on("error", ()=>{
    console.log("Error in MONGO SESSION STORE", err);
});

const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized : true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,    // to safeguard from cross-scripting attacks
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success= req.flash("success");
    res.locals.error= req.flash("error");
    res.locals.currUser = req.user;
    next(); //next() karne ke baad /listings jo iske baad hai usme direct hoga ye jo ki index.ejs me hai, phir style dene ke liye use boilerplate ka part banalenge
});

// app.get("/demouser", async(req,res)=>{
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username: "Student",
//     });

//     let registeredUser = await User.register(fakeUser,"HelloWorld");  //store the user with the helloworld password
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter); 
app.use("/listings/:id/reviews", reviewRouter); //yaha pe jab req.params.id request bhej raha hai to wo id le nahi paa raha listing se , constant treat kar raha hai, isliye mergeparams use karna padega
app.use("/", userRouter);

// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title:"New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err, req,res, next)=>{
    let {statusCode=500, message="Something went wrong!"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).  render("error.ejs", {message});
});

app.get("/",(req, res)=>{
    res.redirect("/listings" ); 
});

app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});