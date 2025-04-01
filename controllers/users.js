const User = require("../models/user");

module.exports.renderSignupForm = (req,res)=>{
    res.render("./users/signup.ejs");
};

module.exports.signup = async (req,res)=>{
    try{
        let {username, email, password} = req.body;
        const newUser =new User({ email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err)=>{
            if(err)return next(err);
            req.flash("success", "Welcome to AirBNB!");
            res.redirect("/listings");
        });
    }
    catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async(req,res)=>{
    req.flash("success","Successfully Logged In !");
    let redirectUrl= res.locals.redirectUrl || "/listings"; 
    //ye isliye kyuki is line ke bina hum kabhi wo case le nahi rahe jab 
    // humne normal login pe click kiya aur hume ab all listings me jaana hai
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err) return next(err);
        req.flash("success","You are logged out");
        res.redirect("/listings");
    });
}; 