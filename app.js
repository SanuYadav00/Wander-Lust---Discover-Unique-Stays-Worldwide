if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

//express
const express = require("express");
const app=express();

//mongodb 
const mongoose=require("mongoose");
//const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const dbUrl=process.env.ATLASDB_URL;
main()
.then((res)=>{
    console.log("connection successful");
})
.catch(err => console.log(err));
async function main() {
    await mongoose.connect(dbUrl);
}

//EJS 
const path=require("path");
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));

//method-override
const methodOverride=require("method-override");
app.use(methodOverride("_method"));

//ejs-mate
const ejsMate=require("ejs-mate");
app.engine('ejs',ejsMate);

//async-wrap
const wrapAsync = require("./utils/wrapAsync.js");

//Expresserror
const ExpressError = require("./utils/ExpressError.js");

//listing-schema
const {listingSchema} = require("./schema.js");

//review-schema
const {reviewSchema} = require("./schema.js");

//listing-model
const Listing = require("./models/listing.js")

//review-model
const Review = require("./models/review.js");

//router
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//cookie-parser
const cookieParser = require("cookie-parser");

//express-session
const session=require("express-session");
const MongoStore = require("connect-mongo");
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});
store.on("error",()=>{
    console.log("error in mongo session store",err);
})
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
};


//flash
const flash=require("connect-flash");

//pass-port
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success =req.flash("success");
    res.locals.error =req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async (req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta_student",
//     });
//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })
//------------------------------------------------------//


//ccokie
//app.use(cookieParser());

// app.get("/getcookies",(req,res)=>{
//     res.cookie("greet","namaste");
//     res.cookie("name","Krish");
//     res.send("sent you some cookies");
// })

// app.get("/greet",(req,res)=>{
//     let {name= "ananymous"} = req.cookies;
//     res.send(`hi, ${name}`)
// })
// app.get("/",(req,res)=>{
//     console.dir(req.cookies);
//     res.send("I AM G-ROOT");
// })

// app.get("/testListing",async (req,res)=>{
//     // let sample=new Listing({
//     //     title:"My new villa",
//     //     description:"By the beach",
//     //     price: 1200,
//     //     location: "Puri,Odisha",
//     //     country: "India"
//     // });
//     // await sample.save();
//     console.log("sample was saved");
//     res.send("SUCCESSFUL");
// })

// app.get("/",(req,res)=>{
//     res.send("Hi,I am root.");
// });


//for listing-routes
app.use("/listings",listingRouter);

//for review-routes
app.use("/listings/:id/reviews",reviewRouter);

//for user-routes authenetication
app.use("/",userRouter);
//
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
})

//error-handler
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong!"} = err;
    res.render("error.ejs",{err});
    //res.status(statusCode).send(message);
    //res.send("something went wrong");
})

app.listen(8080,()=>{
    console.log("server is working on port 8080...")
})