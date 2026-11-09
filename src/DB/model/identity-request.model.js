import mongoose from 'mongoose';

const { Schema } = mongoose;

const identityRequestSchema = new Schema({
    messageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        required: true,         unique: true
    },
    requesterId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const IdentityRequest = mongoose.model(
    'IdentityRequest',
    identityRequestSchema
);

export default IdentityRequest;