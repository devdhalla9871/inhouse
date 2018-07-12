// express router configuration
var express = require("express"),
    router  = express.Router();
// require passport for authentication
var passport = require("passport");
// require request
var request  = require("request");
// require middleware
var middleware = require("../middleware");
// database
var cars = require("../db/cars.js");
var tyres = require("../db/tyres.js");
var cart = [];
// root route to homepage
router.get("/", function(req, res){
    res.render("index", {cartnum: cart.length});
});
// route to car page
router.get("/car/:brandname", function(req, res){
    var brand = req.params.brandname, foundcars;
    if(brand === "honda"){
        foundcars = cars.honda;
    } else if(brand === "suzuki"){
        foundcars = cars.suzuki;
    } else if(brand === "hyundai"){
        foundcars = cars.hyundai;
    } else if(brand === "toyota"){
        foundcars = cars.toyota;
    } else {
        foundcars = [];
    }
    res.render("car", {name: brand, cars: foundcars, tyres: tyres, cartnum: cart.length});
});
// route to add item to cart
router.post("/cart/add/:brandname/:carname/:id", function(req, res){
    var brand = req.params.brandname;
    var car = req.params.carname;
    var id = req.params.id;
    var tyre = req.body.tyre;
    var price;
    if(tyre === "mrf"){
        price = tyres.mrf;
    } else if(tyre === "bridgestone"){
        price = tyres.bridgestone;
    } else if(tyre === "apollo"){
        price = tyres.apollo;
    }
    var item = {
        id: id,
        name: brand+' - '+car+' - '+tyre,
        price: price
    }
    cart.push(item)
    req.flash("success", "One item successfully added to cart!");
    res.redirect(req.headers.referer);
});
// route to delete item form cart
router.post("/cart/delete/:id", function(req, res){
    cart.forEach(function(item){
        if(item.id === req.params.id){
            cart.splice(cart.indexOf(item), 1);
        }
    })
    req.flash("success", "One item deleted from cart!");
    res.redirect(req.headers.referer);
});
// route to cart page which is accessible only when signed in
router.get("/cart", middleware.isLoggedIn, function(req, res){
    res.render("cart", {items: cart, cartnum: cart.length});
});
// route to get signed which is handled by facebook
router.get('/signin/facebook',
    passport.authenticate(
        'facebook',
        {
            authType: 'rerequest',
            scope: [
                'public_profile',
                'email'
            ]
        }
    )
);
// route to return
router.get('/signin/facebook/return',
    passport.authenticate(
        'facebook',
        {
            failureRedirect: '/',
            failureFlash: "Signin failed!",
            successFlash: "Successfully SignedIn!"
        }
    ), function(req, res){
        res.redirect(req.headers.referer);
});
// route to signout
router.get("/signout", function(req, res){
    req.logout();
    req.flash("success", "Successfully SignedOut!");
    res.redirect("/");
});
// export express router to use in main app
module.exports = router;