//[SECTION] Dependencies and Modules
const express = require('express');
const orderController = require('../controllers/order');
const { verify, verifyAdmin } = require("../auth");

//[SECTION] Routing Component
const router = express.Router();

router.post('/checkout', verify, orderController.createOrder);

router.get('/my-orders', verify, orderController.retrieveOrder);

router.get('/all-orders', verify, verifyAdmin, orderController.retrieveAllOrders);


module.exports = router;