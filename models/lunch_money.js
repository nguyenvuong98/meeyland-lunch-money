'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define User Schema
const lunch_money = new Schema({
    user_name: String,
    amount: Number,
    type: String, // 0: ăn trưa, 1: nước uống
    debit: Number,
    payment_status: {
       type: Number,
       default: 0,
    }, // o: unpaid, 1: paid , 2: partial
    month: {
        type: Number,
        default: (new Date().getMonth() + 1), // Default value
    },
}, {
    collection: 'lunch_money',
    timestamps: true
});

module.exports = mongoose.model('lunch_money', lunch_money);