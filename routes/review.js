const express=require("express");
const router=express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const {reviewSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js")
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

const reviewControllers = require("../controllers/review.js");

//Review-Post
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewControllers.createReview));

//Review-delete-post route
router.delete("/:reviewId",
    isReviewAuthor,
    isLoggedIn, wrapAsync(reviewControllers.destroyReview)
);

module.exports = router;