var express     = require("express"),
    app         = express(),
    http        = require("http"),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash       = require("connect-flash"),
    Blog        = require("./models/blog"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    session     = require("express-session"),
    methodOverride = require("method-override");

//requiring routes
var commentRoutes    = require("./routes/comments"),
    blogRoutes = require("./routes/blogs"),
    indexRoutes      = require("./routes/index")
    
// assign mongoose promise library and connect to database
mongoose.Promise = global.Promise;

mongoose.connect(
    "mongodb+srv://arthur:" +
    process.env.MONGO_ATLAS_PW +
    "@cluster0.t24fe.mongodb.net/heroku-blog?retryWrites=true&w=majority"
)
.then(() => {
    console.log("Connected to database!");
})
.catch((err) => {
    console.log(`Connection error: ${err.message}`);
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
//require moment
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});


app.use("/", indexRoutes);
app.use("/blogs", blogRoutes);
app.use("/blogs/:id/comments", commentRoutes);

const normalizePort = val => {
    var port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
  };

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);
server.listen(port);