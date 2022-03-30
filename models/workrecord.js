
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recordsSchema = new Schema ({
    startAt:{
        type: Date
    },
    endAt: {
        type: Date
    },
    place:{
        type:String
    },
    times:{
        type: Number
    },
    userId:{
            type: Schema.Types.ObjectId,
            ref:'User',
            required:true
    },  
},{timestamps:true});

module.exports = mongoose.model('Record',recordsSchema);