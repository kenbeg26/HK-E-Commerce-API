const express = require('express');
const productController = require('../controllers/product');
console.log(productController); // Should show all methods
const { verify, verifyAdmin } = require("../auth");

//[SECTION] Routing Component
const router = express.Router();

router.post("/", verify, verifyAdmin, productController.addProduct);

router.get("/all", verify, verifyAdmin, productController.getAllProducts);

router.get("/active", productController.getActiveProducts);

router.get("/:productId", productController.getProductById);

router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);

router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

router.post("/search-by-name", productController.searchByName);


router.post("/search-by-price", productController.searchByPrice);

module.exports = router;