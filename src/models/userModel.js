const mongoose = require('mongoose');
const { Role } = require('../helpers/Enum');

const userSchema = mongoose.Schema({
    username:{
        type:String,
        unique: String,
        required:true
    },
    role:{
        type: String,
        enum: Role,
        required: true,
    },
    password:{
        type: String,
        required: true
    }
},
{
    timestamps:true
})


module.exports = mongoose.model('User',userSchema);