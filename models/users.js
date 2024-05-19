import mongoose from "mongoose";

const UsersSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    properties: mongoose.Schema.Types.Mixed, 
    subscribed: { type: Boolean, default: true },
},
{ timestamps: true }
)

export default mongoose.model('Users', UsersSchema);

