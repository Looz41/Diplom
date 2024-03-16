import { model, Schema } from "mongoose";

const FacultetsSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
});

export default model("Facultets", FacultetsSchema);