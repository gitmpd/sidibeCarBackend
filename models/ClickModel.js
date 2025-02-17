const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
    carId: String,
    action: String,
    timestamp: Date,
  });
  
  const Click = mongoose.model("Click", ClickSchema);
  module.exports = Click;