import mongoose from 'mongoose';

const { Schema } = mongoose;

const conversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],

    messageId: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        required: true,
        unique: true
    }

}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;