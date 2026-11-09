const jwt = require("jsonwebtoken");
// [SECTION] Environment Setup
// import our .env for environment variables
require('dotenv').config();


//[Section] Token Creation

module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
    };

    // Make sure the secret key is correctly set in your .env file
    return jwt.sign(data, process.env.AUTH_SECRET_KEY);
};



//[SECTION] Token Verification

module.exports.verify = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({ auth: "Failed. No Token" });
    }

    token = token.replace("Bearer ", ""); 

    jwt.verify(token, process.env.AUTH_SECRET_KEY, (err, decodedToken) => {
        if (err) {
            return res.status(403).json({ auth: "Failed", message: err.message });
        }

        req.user = decodedToken;
        next();
    });
};


//[SECTION] Verify Admin

module.exports.verifyAdmin = (req, res, next) => {

    // console.log("result from verifyAdmin method");
    // console.log(req.user);

    // Checks if the owner of the token is an admin.
    if(req.user.isAdmin){
        // If it is, move to the next middleware/controller using next() method.
        next();
    } else {
        // Else, end the request-response cycle by sending the appropriate response and status code.
        return res.status(403).send({
            auth: "Failed",
            message: "Action Forbidden"
        })
    }
}


// [SECTION] Error Handler
module.exports.errorHandler = (err, req, res, next) => {
    // Log the error
    console.error(err);

    // it ensures there's always a clear error message, either from the error itself or a fallback
    const statusCode = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';

    // Send a standardized error response
    //We construct a standardized error response JSON object with the appropriate error message, status code, error code, and any additional details provided in the error object.
    res.status(statusCode).json({
        error: {
            message: errorMessage,
            errorCode: err.code || 'SERVER_ERROR',
            details: err.details || null
        }
    });
};


