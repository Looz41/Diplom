import { model } from "mongoose";
import mongoose from "mongoose";

const arrayNotEmpty = arr => arr.some(val => val.trim().length > 0);

const DisciplineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    facultet: {
        type: String,
        required: true,
    },
    teachers: {
        type: [String],
        validate: {
            validator: arrayNotEmpty,
            message: props => `Массив teachers должен содержать хотя бы один элемент`
        },
        required: true
    }
    // lections: {
    //     type: String,
    //     required: true,
    // },
    // practice: {
    //     type: String,
    //     required: true,
    // },
    // lab: {
    //     type: String,
    //     required: true,
    // },
    // independent: {
    //     type: String,
    //     required: true,
    // },
})

module.exports = model("disciplines", DisciplineSchema)