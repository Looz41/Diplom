import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const DisciplineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    groups: [{
        type: Schema.Types.ObjectId,
        ref: 'Groups',
        required: true,
    }],
    teachers: [{
        type: Schema.Types.ObjectId,
        ref: 'Teachers',
        required: true,
    }],
    aH: {
        type: Number,
        required: true,
    },
    hH: {
        type: Number,
    }
})

export default model("Disciplines", DisciplineSchema)