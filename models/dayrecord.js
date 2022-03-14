const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dayRecordSchema = new Schema({
    records:[{recordId:{type:Schema.Types.ObjectId,ref:'Record'}}],
    userId :{
        type: Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    registers:[{registerId:{type:Schema.Types.ObjectId,ref:'Register'}}],
    total:{
        type:Number
    },
    registereddays:{
        type:Number
    },
    registeredhours:{
        type:Number
    }
},{timestamps:true});



module.exports = mongoose.model('DayRecord',dayRecordSchema);