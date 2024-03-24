import { model } from "mongoose";
import mongoose from "mongoose";

const TeachersSchema = new mongoose.Schema({
    surname: {
        type: String,
        required: true,
    },
    name: {
        type: String,
    },
    patronymic: {
        type: String,
    },
    aH: {
        type: Number,
        required: true,
    },
    hH: {
        type: Number,
    }
})

export default model("Teachers", TeachersSchema)