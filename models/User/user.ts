import { Schema, model } from "mongoose"

const User = new Schema({
    mail: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    newPassword: {
        type: String,
    },
    isActivated: {
        type: Boolean,
        default: false,
    },
    activationLink: {
        type: String,
    },
    restoreLink: {
        type: String,
    },
    roles: [{
        type: String,
        ref: 'Role'
    }]
})

module.exports = model("User", User)