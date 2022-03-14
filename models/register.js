const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const registerSchema = new Schema({
    startDate:{
        type: Date,
        required:true
    },
    endDate:{
        type: Date,
        required:true
    },
    hours:{
        type: Number,
        min: 0,
        max:8,
        default: 0,
        required:true
    },
    description:{
        type: String
    },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref:'User'
        }
},
{
    timestamps: true,
});


module.exports = mongoose.model('Register',registerSchema)