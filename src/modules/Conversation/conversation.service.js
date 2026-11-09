import mongoose from 'mongoose';


import ConversationMessageRepository from "../../DB/Repositories/conversation-message.repository.js";
import ConversationRepository from "../../DB/Repositories/conversation.repository.js";
import { BadRequestException, ForbiddenException } from './../../Utils/Security/Errors/exceptions.error.js';

const conversationRepo = new ConversationRepository();
const conversationMessageRepo = new ConversationMessageRepository();



export const sendConversationMessage = async ({
    conversationId,
    senderId,
    content
}) => {
    if (!mongoose.isValidObjectId(conversationId)) {
        throw new BadRequestException(
            "Invalid conversation ID",
            null,
            "INVALID_CONVERSATION_ID"
        );
    }

    const conversation =
        await conversationRepo.FindDocumentById(conversationId);

    if (!conversation) {
        throw new BadRequestException(
            "Conversation not found",
            null,
            "CONVERSATION_NOT_FOUND"
        );
    }

    const isParticipant = conversation.participants.some(
        participant => String(participant) === String(senderId)
    );

    if (!isParticipant) {
        throw new ForbiddenException(
            "You are not a participant in this conversation",
            null,
            "NOT_A_PARTICIPANT"
        );
    }

    if (!content || !content.trim()) {
        throw new BadRequestException(
            "Message content is required",
            null,
            "INVALID_CONTENT"
        );
    }

    const message = await conversationMessageRepo.CreateDocument({
        conversationId,
        senderId,
        content
    });

    return message;
};


//get conversation message

export const getConversationMessages = async ({
    conversationId,
    userId
}) => {
    if (!mongoose.isValidObjectId(conversationId)) {
        throw new BadRequestException(
            "Invalid conversation ID",
            null,
            "INVALID_CONVERSATION_ID"
        );
    }

    const conversation =
        await conversationRepo.FindDocumentById(conversationId);

    if (!conversation) {
        throw new BadRequestException(
            "Conversation not found",
            null,
            "CONVERSATION_NOT_FOUND"
        );
    }

    const isParticipant = conversation.participants.some(
        participant => String(participant) === String(userId)
    );

    if (!isParticipant) {
        throw new ForbiddenException(
            "You are not a participant in this conversation",
            null,
            "NOT_A_PARTICIPANT"
        );
    }

    const messages = await conversationMessageRepo.FindDocuments(
        { conversationId },
        null,
        { sort: { createdAt: 1 } }
    );

    return messages;
};



//my conversation
export const getMyConversations = (userId) =>
    conversationRepo.FindDocuments({ participants: userId }, null, { sort: { createdAt: -1 } });