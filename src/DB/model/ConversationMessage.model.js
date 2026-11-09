import mongoose from 'mongoose';

const { Schema } = mongoose;

const conversationMessageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

const ConversationMessage = mongoose.model(
    'ConversationMessage',
    conversationMessageSchema
);

export default ConversationMessage;