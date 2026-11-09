//[Section] Dependency
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product Name is Required']
    },
    description: {
        type: String,
        required: [true, 'Product Description is Required']
    },
    price: {
        type: Number,
        required: [true, 'Product Price is Required']
    },
    imageUrl: {
        type: String,
        required: [true, 'Product Image URL is Required'],
        validate: {
            validator: function(url) {
                // Simple URL validation regex
                return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(url);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);