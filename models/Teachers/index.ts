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
    burden: [
        {
            hH: {
                type: Number,
            },
            mounth: {
                type: Date,
            }
        }
    ]
})

export default model("Teachers", TeachersSchema)