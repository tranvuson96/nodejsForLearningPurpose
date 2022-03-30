const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const managerSchema = new Schema({
    name: {
        type: String
    },
    doB: {
        type: Date
    },
    startDate: {
        type: Date
    },
    role: {
        type: String
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
    imageUrl: {
        type: String
    },
    staffs: [
        {
            userId:{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ]
});

module.exports = mongoose.model('Manager',managerSchema);