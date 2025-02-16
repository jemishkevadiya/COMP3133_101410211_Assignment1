const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: [
            /^\S+@\S+\.\S+$/,
            'Please use a valid email address',
        ],
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "other"],
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true,
        min: 1000
    },
    date_of_joining: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    employee_photo: {
        type: String
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Employee', EmployeeSchema);