//[SECTION] Activity: Dependencies and Modules
const bcrypt = require("bcrypt");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require('../models/Product');
const { errorHandler } = require("../auth");


module.exports.createOrder = async (req, res) => {
    const userId = req.user.id;

    try {
        const cart = await Cart.findOne({ userId }).populate('cartItems.productId');
        
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        if (!cart.cartItems.length) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Filter out any items where product doesn't exist
        const validItems = cart.cartItems.filter(item => item.productId);
        
        if (validItems.length !== cart.cartItems.length) {
            // Update cart to remove invalid items
            await Cart.updateOne(
                { userId },
                { $set: { cartItems: validItems } }
            );
            return res.status(400).json({ 
                message: 'Some products are no longer available',
                removedItems: cart.cartItems.length - validItems.length
            });
        }

        // Process valid items
        const populatedItems = validItems.map(item => ({
            productId: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            quantity: item.quantity,
            subtotal: item.productId.price * item.quantity,
        }));

        const totalPrice = populatedItems.reduce((sum, item) => sum + item.subtotal, 0);

        const newOrder = new Order({
            userId,
            productsOrdered: populatedItems,
            totalPrice,
        });

        const savedOrder = await newOrder.save();
        
        // Clear the cart after successful order
        await Cart.updateOne({ userId }, { $set: { cartItems: [], totalPrice: 0 } });

        res.status(201).json({ 
            message: 'Order created successfully', 
            order: savedOrder 
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ 
            message: 'Error creating order', 
            error: error.message 
        });
    }
};

// Retrieve Logged-in User's Orders
module.exports.retrieveOrder = (req, res) => {
    console.log("Request received at /orders/my-orders"); // Debugging log

    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }

    if (req.user.role && req.user.role === "admin") {
        return res.status(403).json({ message: 'Forbidden: Admins cannot access this resource' });
    }

    const userId = req.user.id;

    Order.find({ userId })
        .then(orders => {
            if (!orders || orders.length === 0) {
                return res.status(404).json({ message: 'No orders found for this user' });
            }
            res.status(200).json({ orders });
        })
        .catch(error => {
            console.error('Error retrieving orders:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        });
};



// Retrieve All Orders
module.exports.retrieveAllOrders = (req, res) => {
    // Fetch all orders
    Order.find()
        .then(orders => {
            res.status(200).json({ orders });
        })
        .catch(error => {
            res.status(500).json({ message: 'Error retrieving orders', error: error.message });
        });
};