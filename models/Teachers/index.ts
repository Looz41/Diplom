import { model } from "mongoose";
import mongoose from "mongoose";

const arrayNotEmpty = arr => arr.some(val => val.trim().length > 0);

const TeachersSchema = new mongoose.Schema({
    surname: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    patronymic: {
        type: String,
        required: true,
    }
})

module.exports = model("Teachers", TeachersSchema)