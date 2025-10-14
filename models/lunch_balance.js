'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define User Schema
const lunch_balance = new Schema({
    user_name: String,
    balance: Number,
}, {
    collection: 'lunch_balance',
    timestamps: true
});

module.exports = mongoose.model('lunch_balance', lunch_balance);