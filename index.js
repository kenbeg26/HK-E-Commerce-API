// [SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
// Allows our backend application to be available to our frontend application
// Allows us to control the app's Cross Origin Resource Sharing settings
const cors = require("cors")

//[SECTION] Routes
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const productRoutes = require("./routes/product");
const userRoutes = require("./routes/user");
    
// [SECTION] Environment Setup
require('dotenv').config();

// [SECTION] Server Setup
// Creates an "app" variable that stores the result of the "express" function that initializes our express application and allows us access to different methods that will make backend creation easy
const app = express();
const port = 4002;

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://ec2-3-15-19-15.us-east-2.compute.amazonaws.com',
    'http://zuitt-bootcamp-prod-530-8605-astano.s3-website.us-east-1.amazonaws.com',
    'https://hk-e-commerce-client.vercel.app/',
    ''
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 


// Sets up session storage for logged-in users
/*app.use(session({ // session() here comes from the express-session package. It creates and manages user sessions in your app.
    secret: process.env.clientSecret, // Used to secure session data
    resave: false, // Does not save session again if unchanged
    			   // if nothing changes in the session, it won’t be saved again to the session store.
    saveUninitialized: false // Does not create a session until needed
}));*/

// Starts Passport for authentication
// app.use(passport.initialize());

// Allows Passport to store login sessions
// app.use(passport.session());

mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once('open', () => console.log("Now connected to MongoDB Atlas."));

//[SECTION] Backend Routes 
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);


// [SECTION] Server Gateway Response
// if(require.main) would allow us to listen to the app directly if it is not imported to another module, it will run the app directly.
// else, if it is needed to be imported, it will not run the app and instead export it to be used in another file.
if(require.main === module){
    app.listen( process.env.PORT || 3000, () => {
        console.log(`API is now online on port ${ process.env.PORT || 3000 }`)
    });
}

// In creating APIs, exporting modules in the "index.js" file is ommited
// exports an object containing the value of the "app" variable only used for grading.
module.exports = { app, mongoose };