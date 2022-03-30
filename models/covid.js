const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const healthSchema = new Schema({
    bodyheat:{
        type: Number
    },
    vaccin:{
        firstShot:{
            date:{
                type:Date
            },
            shottype: {
                type:String
            }
        },
        secondShot:{
            date:{
                type:Date
            },
            shottype: {
                type:String
            }
        }
    },
    positiveWithCovid:{
        type: Boolean
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true});



module.exports = mongoose.model('Health',healthSchema)
