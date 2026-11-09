//[SECTION] Dependencies and Modules
const express = require('express');
const userController = require('../controllers/user');

const { verify, verifyAdmin } = require("../auth");


//[SECTION] Routing Component
const router = express.Router();

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/details", verify, userController.getProfile);

router.patch("/:id/set-as-admin", verify, verifyAdmin, userController.updateAdmin);

router.patch("/update-password", verify, userController.updatePassword);



module.exports = router;


