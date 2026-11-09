
import { Router } from "express";
import { authenticate } from '../../middleware/authentication.middleware.js';
import { validation } from '../../middleware/validation.middleware.js';

import {
    createIdentityRequest,
    getReceivedIdentityRequests,
    updateIdentityRequest
} from "./identity-request.service.js";
import { getIdentityRequestsQuerySchema, identityRequestParamsSchema, updateIdentityRequestSchema } from "./identity-request.validation.js";

const identityRequestController = Router();


// Receiver requests the identity of a registered sender
identityRequestController.post(
    "/messages/:messageId/identity-request",
    authenticate,
    validation(identityRequestParamsSchema),
    async (req, res) => {
        const result = await createIdentityRequest({
            messageId: req.params.messageId,
            requesterId: req.authUser._id
        });

        res.status(201).json({
            message: "Identity request created successfully",
            data: result
        });
    }
);


// Sender retrieves identity requests on their messages
identityRequestController.get(
    "/get-id-requests",
    authenticate,
validation(getIdentityRequestsQuerySchema),
    async (req, res) => {
        const result = await getReceivedIdentityRequests({
            senderId: req.authUser._id,
            status: req.query.status
        });

        res.status(200).json({
            message: "Identity requests retrieved successfully",
            data: result
        });
    }
);


// Sender accepts or rejects an identity request
identityRequestController.patch(
    "/update-id-requests/:requestId",
    authenticate,
validation(updateIdentityRequestSchema),
    async (req, res) => {
        const result = await updateIdentityRequest({
            requestId: req.params.requestId,
            senderId: req.authUser._id,
            status: req.body.status
        });

        res.status(200).json({
            message: "Identity request updated successfully",
            data: result
        });
    }
);

export default identityRequestController;
