import { Schema, model } from "mongoose";

const DisciplineSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    groups: [
        {
            item: {
                type: Schema.Types.ObjectId,
                ref: 'Groups',
                required: true,
            },
            aH: {
                type: Number,
                required: true
            },
            burden: {
                month: {
                    type: Date,
                },
                hH: {
                    type: Number,
                },
            }
        }
    ],
    teachers: [{
        type: Schema.Types.ObjectId,
        ref: 'Teachers',
        required: true,
    }],
    pc: {
        type: Boolean
    }
});

export default model("Disciplines", DisciplineSchema);
