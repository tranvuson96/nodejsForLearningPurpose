
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    doB: {
        type: Date,
        required: true
    },
    salaryScale: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    department: {
        type: String,
        required: true,
    },
    annualLeave: {
        type: Number,
        default: 10
    },
    imageUrl: {
        type: String,
        required: true
    },
    hoursleft:{
        type: Number,
        min:0,
        max: 8,
        default:8,
        required: true
    },
    totalhourspday:{
        type: Number
    },
    overTime:{
        type:Number
    },
    username:{
        type:String
    },
    password:{
        type: String
    },
    role: {
        type:String
    },
    manager: {
        managerId :{
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Manager'
        },
        managerName:{
            type:String
        }
    },
    status: {
        type:String
    }
});



module.exports = mongoose.model('User',userSchema);