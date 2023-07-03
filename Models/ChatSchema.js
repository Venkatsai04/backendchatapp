
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://venkatsai:srilakshmi@chatapp.6gzx0mw.mongodb.net/");

const chatSchema = new mongoose.Schema({
    persons:{
        type: Array 
    }
},
{
    timestamps : true
})
module.exports = mongoose.model('Chat', chatSchema);
