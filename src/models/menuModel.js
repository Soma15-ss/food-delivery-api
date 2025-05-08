const mongoose = require('mongoose');
const { Role } = require('../helpers/Enum');

const menuSchema = mongoose.Schema({
    name:{
        type:String,
        unique: String,
        required:true,
    },
    category:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    image:{
        type:String,
        required:false,
    }
},
{
    timestamps:true
})


module.exports = mongoose.model('Menu',menuSchema);