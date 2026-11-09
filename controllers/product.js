// Dependencies and Modules
const bcrypt = require("bcrypt");
const Product = require("../models/Product");
const auth = require("../auth");
const { errorHandler } = auth; 

// Create Product
module.exports.addProduct = (req, res) => {
    const { name, description, price, imageUrl } = req.body; // Added imageUrl

    if (!name || !description || !price || !imageUrl) { // Added validation
        return res.status(400).json({ error: "All fields (name, description, price, imageUrl) are required" });
    }

    const newProduct = new Product({
        name,
        description,
        price,
        imageUrl, // Added to match schema
        isActive: true
    });

    newProduct.save()
        .then(product => {
            res.status(201).json({
                name: product.name,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl, // Include in response
                isActive: product.isActive,
                _id: product._id,
                createdOn: product.createdAt
            });
        })  
        .catch(error => errorHandler(error, req, res)); 
};

// Retrieve all products (Admin only)
module.exports.getAllProducts = (req, res) => {
    Product.find({})
        .then(products => {
            console.log("Products found:", products);
            res.status(200).json(products);
        })
        .catch(error => errorHandler(error, req, res));
};


// Retrieve all active products (Public)
module.exports.getActiveProducts = (req, res) => {
    Product.find({ isActive: true })
        .then(products => res.status(200).json(products))
        .catch(error => errorHandler(error, req, res));
};

// Retrieve a single product (Public)
module.exports.getProductById = (req, res) => {
    Product.findById(req.params.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.status(200).json({ success: true, data: product });
        })
        .catch(error => errorHandler(error, req, res));
};

// Update Product Info (Admin only) - Updated to handle imageUrl
module.exports.updateProduct = (req, res) => {
    const { imageUrl, ...otherUpdates } = req.body;
    
    // Validate imageUrl if it's being updated
    if (imageUrl && !/^https?:\/\/.+\/.+\.(jpg|jpeg|png|webp)$/i.test(imageUrl)) {
        return res.status(400).json({ error: "Invalid image URL format" });
    }

    Product.findByIdAndUpdate(
        req.params.productId, 
        { ...otherUpdates, ...(imageUrl && { imageUrl }) }, // Conditionally include imageUrl
        { new: true }
    )
    .then(updatedProduct => {
        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json({ 
            success: true, 
            message: "Product updated successfully",
            data: updatedProduct // Return full product including imageUrl
        });
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.archiveProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.productId,
            { isActive: false },
            { new: true }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.json({
            message: "Product archived successfully",
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Activate Product (Admin only)
module.exports.activateProduct = (req, res) => {
    Product.findByIdAndUpdate(req.params.productId, { isActive: true }, { new: true })
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.status(200).json({ success: true, message: "Product activated successfully" });
        })
        .catch(error => errorHandler(error, req, res));
};

// Search Products by Name
module.exports.searchByName = async (req, res) => {
    try {
        const productName = req.body?.name || req.query?.name; // Handle both body & query

        if (!productName?.trim()) {
            return res.status(400).json({ error: 'productName required' });
        }

        // Find products with case-insensitive match
        const products = await Product.find({
            name: { $regex: new RegExp(productName.trim(), 'i') }
        });

        return res.status(200).json(products); // Ensure correct status
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};



// Search Products by Price range
module.exports.searchByPrice = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.body;

        if (minPrice === undefined || maxPrice === undefined) {
            return res.status(400).json({ error: 'Both minPrice and maxPrice are required' });
        }

        // Find courses within the specified price range
        const courses = await Product.find({
            price: { $gte: minPrice, $lte: maxPrice }
        });

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};