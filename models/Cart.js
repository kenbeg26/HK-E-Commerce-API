//[Section] Dependency
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User ID is required']
    },
    cartItems: [{
        productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // This tells Mongoose which model to use for populate
        required: [true, 'Product ID is required']
},
        quantity: {
            type: Number,
            required: [true, 'Quantity is required']
        },
        subtotal: {
            type: Number,
            required: [true, 'Total number is required']
        }
    }],
    totalPrice: {
        type: Number,
        required: [true, 'Price is Required']
    },
    orderedOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', cartSchema);