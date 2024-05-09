import { model } from "mongoose";
import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Groups',
        required: true
    },
    items: [
        {
            discipline: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Disciplines',
                required: true
            },
            teacher: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Teachers',
                required: true
            },
            type: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Types',
                required: true
            },
            audithoria: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Audithories',
                required: true
            },
            number: {
                type: Number,
                required: true,
            }
        }
    ]
});

export default model("Schedule", ScheduleSchema)