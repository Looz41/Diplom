import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const GroupsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    course: {
        type: String
    },
    facultet: {
        type: Schema.Types.ObjectId,
        ref: 'facultets'
    }
})

export default model("Groups", GroupsSchema)