import { model } from "mongoose";
import mongoose from "mongoose";

const AudithoriesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    pc: {
        type: Boolean,
    },
})

export default model("Audithories", AudithoriesSchema)