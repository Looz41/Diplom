import { model } from "mongoose";
import mongoose from "mongoose";

const GroupsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
})

export default model("Groups", GroupsSchema)