import { model } from "mongoose";
import mongoose from "mongoose";

const arrayNotEmpty = arr => arr.some(val => val.trim().length > 0);

const TeachersSchema = new mongoose.Schema({
    facultets: {
        type: [String],
        validate: {
            validator: arrayNotEmpty,
            message: props => `Массив facultets должен содержать хотя бы один элемент`
        },
        required: true
    },
    disciplines: {
        type: [String],
        validate: {
            validator: arrayNotEmpty,
            message: props => `Массив disciplines должен содержать хотя бы один элемент`
        },
        required: true
    }
})

module.exports = model("Teachers", TeachersSchema)