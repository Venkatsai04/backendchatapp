
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://venkatsai:srilakshmi@chatapp.6gzx0mw.mongodb.net/");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    avatar:{
        type: String
    }
},{
    timestamps: true
})

module.exports = mongoose.model('User', userSchema);
