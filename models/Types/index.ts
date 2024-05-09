import { model, Schema } from "mongoose";

const TypesSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
});

export default model("Types", TypesSchema);