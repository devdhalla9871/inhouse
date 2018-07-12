var port  = process.env.PORT || 3079;
// require npm packages
var express    = require("express"),
    passport   = require("passport"),
    bodyParser = require("body-parser"),
    fbStrategy = require("passport-facebook").Strategy,
    flash      = require("connect-flash"),
    app        = express();
// require routes
var indexRoute = require("./app/routes/index.route");
// set views directory path
app.set("views", "./app/views");
// set templating engine to ejs
app.set("view engine", "ejs");
// host static files (public directory) with express
app.use(express.static("public"));
// passport configuration
app.use(require("express-session")({
    secret: "thisissecretstring",
    resave: true,
    saveUninitialized: true
}));
app.use(flash()); // use flash for flash messages
app.use(passport.initialize());
app.use(passport.session());
if(process.env.NODE_ENV !== 'production'){
    // if app is running on localhost
    var key       = require("./config/config.json"),
        appId     = key.appid,
        appSecret = key.appsecret,
        backUrl   = '/signin/facebook/return';
} else {
    // if app is running on hosting service
    var appId     = process.env.APPID,
        appSecret = process.env.APPSECRET,
        backUrl   = process.env.BACKURL+'/signin/facebook/return';
}
passport.use(new fbStrategy(
    {
        clientID: appId,
        clientSecret: appSecret,
        callbackURL: backUrl,
        enableProof: true,
        profileFields: ['id', 'email', 'displayName', 'picture.type(large)']
    }, function(accessToken, refreshToken, profile, cb){
        return cb(null, profile);
    }
));
passport.serializeUser(function(user, cb){
    cb(null, user);
});
passport.deserializeUser(function(obj, cb){
    cb(null, obj);
});
// middleware to send variables to every template page
app.use(function(req, res, next){
    if(req.user){
        // if user exist set currentUser to req.user._json
        res.locals.currentUser = req.user._json;
    } else {
        // if user doesn't exist set currentUser to req.user
        res.locals.currentUser = req.user;
    }
    // success and error message variables for flash
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    next();
});
// use body-parser
app.use(bodyParser.urlencoded({extended: true}));
// use routes
app.use(indexRoute);
// listen to the port
app.listen(port, function(){
    console.log("Server started...");
});