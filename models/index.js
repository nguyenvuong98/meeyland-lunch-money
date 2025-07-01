const fs = require('fs'),
    path = require('path'),
    mongoose = require('mongoose'),
    db = {};

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('debug', true);


// import all file in this dir, except index.js
fs.readdirSync(__dirname)
.filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
})
.forEach(function(file) {
    let model = require(path.join(__dirname, file));
    db[model.modelName] = model;
});

db.mongoose = mongoose;
module.exports = db;