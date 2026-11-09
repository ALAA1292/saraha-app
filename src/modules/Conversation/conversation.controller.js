import { Router } from 'express'
import { authenticate } from '../../middleware/authentication.middleware.js';
import { getConversationMessages, getMyConversations, sendConversationMessage } from './conversation.service.js';
import { conversationParamsSchema, sendConversationMessageSchema } from './conversation.validation.js';
import { validation } from '../../middleware/validation.middleware.js';

const conversationController = Router(); 

//my conversation
conversationController.get('/', authenticate, async (req, res) => {
    const result = await getMyConversations(req.authUser._id)
    res.status(200).json({ message: 'conversations retrieved successfully', data: result })
})

conversationController.post(
    '/:conversationId/messages',
    authenticate,
    validation(sendConversationMessageSchema),
    async (req, res) => {
        const result = await sendConversationMessage({
            conversationId: req.params.conversationId,
            senderId: req.authUser._id,
            content: req.body.content
        });

        res.status(201).json({
            message: 'Message sent successfully',
            data: result
        });
    }
);


//get conversation

conversationController.get(
    '/:conversationId/messages',
    authenticate,
     validation(conversationParamsSchema),
    async (req, res) => {
        const result = await getConversationMessages({
            conversationId: req.params.conversationId,
            userId: req.authUser._id
        });

        res.status(200).json({
            message: 'Conversation messages retrieved successfully',
            data: result
        });
    }
);


export default conversationController