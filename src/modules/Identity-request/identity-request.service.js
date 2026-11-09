
// Identity request

import mongoose from "mongoose";

import IdentityRequestRepository from "../../DB/Repositories/identity-request.repository.js";
import MessageRepository from "../../DB/Repositories/message.repository.js";
import UserRepository from "../../DB/Repositories/user.repository.js";
import ConversationRepository from "../../DB/Repositories/conversation.repository.js";

import {
    BadRequestException,
    ForbiddenException
} from "../../Utils/Security/Errors/exceptions.error.js";


const identityRequestRepo = new IdentityRequestRepository();
const messageRepo = new MessageRepository();
const userRepo = new UserRepository();
const conversationRepo = new ConversationRepository();


// Create a request to reveal the identity of a registered sender
export const createIdentityRequest = async ({ messageId, requesterId }) => {

    // Validate the message ID before querying the database
    if (!mongoose.isValidObjectId(messageId)) {
        throw new BadRequestException(
            "Invalid message ID",
            null,
            "INVALID_MESSAGE_ID"
        );
    }

    // Get the original message and include senderId because it is hidden by default
    const message = await messageRepo
        .FindDocumentById(messageId)
        .select("+senderId");

    // Check if the message exists
    if (!message) {
        throw new BadRequestException(
            "Message not found",
            null,
            "MESSAGE_NOT_FOUND"
        );
    }

    // Make sure the requester is the actual receiver of this message
    if (String(message.receiverId) !== String(requesterId)) {
        throw new ForbiddenException(
            "You are not the receiver of this message",
            null,
            "NOT_MESSAGE_RECEIVER"
        );
    }

    // Guest senders cannot receive identity requests
    if (!message.senderId) {
        throw new BadRequestException(
            "Cannot request identity of a guest sender",
            null,
            "SENDER_IS_GUEST"
        );
    }

    // Prevent creating more than one identity request for the same message
    const existingRequest = await identityRequestRepo.FindOneDocument({
        messageId
    });

    if (existingRequest) {
        throw new BadRequestException(
            "Identity request already exists",
            null,
            "REQUEST_ALREADY_EXISTS"
        );
    }

    // Create a new identity request with pending status
    const request = await identityRequestRepo.CreateDocument({
        messageId,
        requesterId,
        status: "pending"
    });

    // Return only the required fields without exposing the sender's identity
    return {
        _id: request._id,
        messageId: request.messageId,
        status: request.status
    };
};


// Get the identity requests received on the messages I sent
export const getReceivedIdentityRequests = async ({ senderId, status }) => {

    // Validate the optional status filter
    if (status && !["pending", "accepted", "rejected"].includes(status)) {
        throw new BadRequestException(
            "Invalid status",
            null,
            "INVALID_STATUS"
        );
    }

    // Get all messages sent by the current user
    const myMessages = await messageRepo.FindDocuments({ senderId });

    const messageIds = myMessages.map((message) => message._id);

    // Get identity requests related to my messages
    const filter = {
        messageId: { $in: messageIds }
    };

    if (status) {
        filter.status = status;
    }

    const requests = await identityRequestRepo.FindDocuments(filter);

    // Get the users who sent the identity requests
    const requesters = await userRepo.FindDocuments(
        {
            _id: { $in: requests.map((request) => request.requesterId) }
        },
        { firstName: 1, lastName: 1 }
    );

    // Create maps to find messages and requesters by their IDs
    const messagesById = new Map(
        myMessages.map((message) => [String(message._id), message])
    );

    const requestersById = new Map(
        requesters.map((user) => [String(user._id), user])
    );

    // Return the requests with their related messages and requesters
    return requests.map((request) => {

        // Find the original message and the user who requested its identity
        const message = messagesById.get(String(request.messageId));
        const requester = requestersById.get(String(request.requesterId));

        return {
            _id: request._id,
            status: request.status,
            createdAt: request.createdAt,

            message: {
                _id: request.messageId,
                content: message?.content
            },

            requester: {
                firstName: requester?.firstName,
                lastName: requester?.lastName
            }
        };
    });
};


// The sender accepts or rejects an identity request
export const updateIdentityRequest = async ({ requestId, senderId, status }) => {

    // Only these two values are allowed
    if (!["accepted", "rejected"].includes(status)) {
        throw new BadRequestException(
            "Invalid status",
            null,
            "INVALID_STATUS"
        );
    }

    if (!mongoose.isValidObjectId(requestId)) {
        throw new BadRequestException(
            "Invalid request ID",
            null,
            "INVALID_REQUEST_ID"
        );
    }

    const request = await identityRequestRepo.FindDocumentById(requestId);

    if (!request) {
        throw new BadRequestException(
            "Identity request not found",
            null,
            "REQUEST_NOT_FOUND"
        );
    }

    // The owner of a request is the sender of the original message
    const message = await messageRepo
        .FindDocumentById(request.messageId)
        .select("+senderId");

    if (!message) {
        throw new BadRequestException(
            "Message not found",
            null,
            "MESSAGE_NOT_FOUND"
        );
    }

    if (String(message.senderId) !== String(senderId)) {
        throw new ForbiddenException(
            "You are not the sender of this message",
            null,
            "NOT_MESSAGE_SENDER"
        );
    }

    // A request can be answered only once
    if (request.status !== "pending") {
        throw new BadRequestException(
            "Identity request has already been handled",
            null,
            "REQUEST_ALREADY_HANDLED"
        );
    }

    // Rejected: change the status and keep the identity hidden
    if (status === "rejected") {
        request.status = "rejected";
        await request.save();

        return {
            _id: request._id,
            status: request.status
        };
    }

    // Accepted: reuse the conversation if it already exists, otherwise create it
    let conversation = await conversationRepo.FindOneDocument({
        messageId: message._id
    });

    if (!conversation) {
        conversation = await conversationRepo.CreateDocument({
            participants: [message.senderId, request.requesterId],
            messageId: message._id
        });
    }

    request.status = "accepted";
    await request.save();

    return {
        _id: request._id,
        status: request.status,
        conversationId: conversation._id
    };
};
