
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://venkatsai:srilakshmi@chatapp.6gzx0mw.mongodb.net/");


const messgageSchema = new mongoose.Schema({
 
    usersOfChat:{
        type : Array
    },
    text:{
        type: String 
    }
},
{
    timestamps : true
})
module.exports = mongoose.model('messgage', messgageSchema);