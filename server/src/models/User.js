
const mongoose = require('mongoose');
const { Schema } = mongoose;

const noteSchema = new Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthdate: { type: Date, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  notes: [noteSchema] // Embedding notes directly in the user document
});

const User = mongoose.model('User', userSchema);
module.exports = User;
