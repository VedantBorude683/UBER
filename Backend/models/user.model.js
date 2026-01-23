const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'first name be atleat 3 characters long']
        },
        lastname: {
            type: String,
            minlength: [3, 'last name be atleat 3 characters long']
        }
    }, // <--- 🛑 THIS BRACE WAS MISSING/WRONG PLACE!
    
    // Now these are outside fullname (Correct)
    email: {
        type: String,
        required: true,
        unique: true, // Fixed typo: 'unqiue' -> 'unique'
        minlength: [5, 'email must be atleast 5 charcter long'],
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    socketId: {
        type: String,
    }
})

// ⚠️ ALSO FIX THESE NAMES to match your Controller (camelCase)
userSchema.methods.generateAuthToken = function () { // generateauthtoken -> generateAuthToken
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' })
    return token;
}

userSchema.methods.comparePassword = async function (password) { // comparepasswords -> comparePassword
    return await bcrypt.compare(password, this.password);
}

userSchema.statics.hashPassword = async function (password) { // hashpasswords -> hashPassword
    return await bcrypt.hash(password, 10);
}

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;