import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Device', deviceSchema);
