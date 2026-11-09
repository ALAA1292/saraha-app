// Sending messages
import mongoose from "mongoose";
import MessageRepository from "../../DB/Repositories/message.repository.js";
import { BadRequestException } from "../../Utils/Security/Errors/exceptions.error.js";
import UserRepository from "../../DB/Repositories/user.repository.js";
import IdentityRequestRepository from "../../DB/Repositories/identity-request.repository.js";
import ConversationRepository from "../../DB/Repositories/conversation.repository.js";

const messageRepo = new MessageRepository();
const userRepo = new UserRepository();
const conversationRepo = new ConversationRepository();


// Send a message to a receiver
export const sendMessage = async ({ content, file, receiverId, senderId }) => {

    // Check if the receiver ID is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(receiverId)) {
        throw new BadRequestException(
            "Invalid receiver ID",
            null,
            "INVALID_RECEIVER_ID"
        );
    }

    // Prevent authenticated users from sending messages to themselves
    if (senderId && String(receiverId) === String(senderId)) {
        throw new BadRequestException(
            "You cannot send a message to yourself",
            null,
            "CANNOT_MESSAGE_SELF"
        );
    }

    // Check if the receiver exists in the database
    const user = await userRepo.FindDocumentById(receiverId);

    if (!user) {
        throw new BadRequestException(
            "Receiver not found",
            null,
            "RECEIVER_NOT_FOUND"
        );
    }

    // Save the message and store null as senderId for guest users
    return messageRepo.CreateDocument({
        content,
        file: file?.path,
        receiverId,
        senderId: senderId || null
    });
};


// Get all messages received by a user; reveal the sender only when the request was accepted
export const getMessagesByReceiverId = async (receiverId) => {
    const messages = await messageRepo.FindDocuments({ receiverId });

    // A conversation exists only for messages whose identity request was accepted
    const conversations = await conversationRepo.FindDocuments({
        messageId: { $in: messages.map((message) => message._id) }
    });

    // message id -> its conversation
    const conversationByMessage = new Map(
        conversations.map((conversation) => [String(conversation.messageId), conversation])
    );

    // the sender is the participant who is not me
    const otherParticipant = (conversation) =>
        conversation.participants.find((participant) => String(participant) !== String(receiverId));

    // Load only the names of those senders
    const senders = await userRepo.FindDocuments(
        { _id: { $in: conversations.map(otherParticipant).filter(Boolean) } },
        { firstName: 1, lastName: 1 }
    );
    const sendersById = new Map(senders.map((user) => [String(user._id), user]));

    return messages.map((message) => {
        const plainMessage =
            typeof message.toObject === "function" ? message.toObject() : message;

        const conversation = conversationByMessage.get(String(message._id));

        // Request not accepted: the message stays anonymous
        if (!conversation) return plainMessage;

        const sender = sendersById.get(String(otherParticipant(conversation)));

        return {
            ...plainMessage,
            conversationId: conversation._id,
            sender: { firstName: sender?.firstName, lastName: sender?.lastName }
        };
    });
};

