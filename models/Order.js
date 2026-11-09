const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User Id is Required']
    },
    productsOrdered: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Product ID is required']
        },
        name: {
            type: String,
            required: [true, 'Product name is required']
        },
        price: {
            type: Number,
            required: [true, 'Product price is required']
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required']
        },
        subtotal: {
            type: Number,
            required: [true, 'Subtotal is required']
        }
    }],
    totalPrice: {
        type: Number,
        required: [true, 'Total price is Required']
    },
    orderedOn: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    }
});

module.exports = mongoose.model('Order', orderSchema);