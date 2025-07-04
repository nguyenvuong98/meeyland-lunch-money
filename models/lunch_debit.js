'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define User Schema
const lunch_debit = new Schema({
    user_name: String,
    debit: Number,
    payment: Number,
}, {
    collection: 'lunch_debit',
    timestamps: true
});

module.exports = mongoose.model('lunch_debit', lunch_debit);