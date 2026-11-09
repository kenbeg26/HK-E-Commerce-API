//[SECTION] Activity: Dependencies and Modules
const bcrypt = require("bcrypt");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../auth");
const { errorHandler } = auth;



module.exports.getCart = async (req, res) => {
    const userId = req.user?.id;

    console.log("Decoded user ID:", userId); // Debug log

    try {
        const cart = await Cart.findOne({ userId }).populate({
            path: 'cartItems.productId',
            select: 'name price'
        });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Filter out items where productId was not found (e.g., deleted product)
        const populatedCartItems = cart.cartItems
            .filter(item => item.productId) // Ensure product exists
            .map(item => ({
                productId: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                quantity: item.quantity,
                subtotal: item.subtotal
            }));

        res.status(200).json({
            userId: cart.userId,
            cartItems: populatedCartItems,
            totalPrice: cart.totalPrice,
            orderedOn: cart.orderedOn
        });
    } catch (error) {
        console.error("getCart failed:", error); // Detailed error logging
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports.addToCart = (req, res) => {
    const userId = req.user.id; // Assuming user is authenticated and extracted from JWT
    const { productId, quantity, subtotal } = req.body;

    Cart.findOne({ userId })
        .then(cart => {
            if (!cart) {
                // No cart found, create a new one
                const newCart = new Cart({
                    userId,
                    cartItems: [{ productId, quantity, subtotal }],
                    totalPrice: subtotal
                });
                return newCart.save();
            } else {
                // Check if product already exists in cart
                const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);
                
                if (itemIndex > -1) {
                    // Product exists, update quantity and subtotal
                    cart.cartItems[itemIndex].quantity += quantity;
                    cart.cartItems[itemIndex].subtotal += subtotal;
                } else {
                    // Add new product to cart
                    cart.cartItems.push({ productId, quantity, subtotal });
                }

                // Update total price
                cart.totalPrice += subtotal;
                return cart.save();
            }
        })
        .then(updatedCart => res.json({ message: "Cart updated successfully", cart: updatedCart }))
        .catch(error => errorHandler(error, req, res)); 
};


module.exports.updateCartQuantity = (req, res) => {
    const { productId, newQuantity } = req.body;

    // Validate quantity
    if (typeof newQuantity !== 'number' || isNaN(newQuantity)) {
        return res.status(400).send({ message: "Invalid quantity" });
    }

    Cart.findOne({ userId: req.user.id })
        .then(cart => {
            if (!cart) return res.status(404).send({ message: "Cart not found" });

            const cartItem = cart.cartItems.find(item => item.productId.equals(productId));
            if (!cartItem) return res.status(404).send({ message: "Product not in cart" });

            if (newQuantity <= 0) {
                cart.cartItems = cart.cartItems.filter(item => !item.productId.equals(productId));
                cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);
                return cart.save().then(updatedCart => {
                    return res.status(200).send({
                        success: true,
                        message: "Cart updated successfully",
                        cart: updatedCart
                    });
                });
            }

            return Product.findById(productId).then(product => {
                if (!product) return res.status(404).send({ message: "Product not found" });

                // Check product price too
                if (typeof product.price !== 'number' || isNaN(product.price)) {
                    return res.status(500).send({ message: "Invalid product price" });
                }

                cartItem.quantity = newQuantity;
                cartItem.subtotal = newQuantity * product.price;

                cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

                return cart.save().then(updatedCart => {
                    return res.status(200).send({
                        success: true,
                        message: "Cart updated successfully",
                        cart: updatedCart
                    });
                });
            });
        })
        .catch(error => errorHandler(error, req, res));
};


// Remove Item from Cart
module.exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        // Find the user's cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        // Find the product in the cartItems array
        const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // Remove the item from cartItems array
        const removedItem = cart.cartItems.splice(itemIndex, 1)[0];

        // Update totalPrice
        cart.totalPrice -= removedItem.subtotal;

        // Save the updated cart
        await cart.save();

        res.status(200).json({ message: "Item removed from cart successfully", updatedCart: cart });
    } catch (error) {
        res.status(500).json({ error: "Error removing product from cart", error: error.message });
    }
};

// Clear Cart
module.exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the user's cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        // Check if cartItems has at least one item
        if (cart.cartItems.length > 0) {
            // Clear the cartItems array
            cart.cartItems = [];
            
            // Reset totalPrice to 0
            cart.totalPrice = 0;

            // Save the updated cart
            await cart.save();

            return res.status(200).json({ message: "Cart cleared successfully", cart: cart });
        } else {
            return res.status(400).json({ message: "Cart is already empty" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error removing items from cart", error: error.message });
    }
};