import { model, Schema } from "mongoose";

const FacultetsSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    courses: [{
        name: {
            type: String,
            required: true
        },
        groups: [{
            type: Schema.Types.ObjectId,
            ref: 'Groups'
        }]
    }],
    audithories: [{
        type: Schema.Types.ObjectId,
        ref: 'Audithories'
    }]
});

export default model("Facultets", FacultetsSchema);