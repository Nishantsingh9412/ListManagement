import mongoose from "mongoose";

const ListSchema = mongoose.Schema({
    title: { type: String, required: true },
    properties: mongoose.Schema.Types.Mixed,
    users:[{type:mongoose.Schema.Types.ObjectId, ref:'Users'}]
},
{ timestamps: true }
)

export default mongoose.model('Lists', ListSchema);