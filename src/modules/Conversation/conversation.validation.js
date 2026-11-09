import { z } from 'zod';
import mongoose from 'mongoose';

export const conversationParamsSchema = z.object({
    params: z.object({
        conversationId: z.string().refine(
            value => mongoose.isValidObjectId(value),
            { message: 'Invalid conversation ID' }
        )
    })
});

export const sendConversationMessageSchema = z.object({
    params: z.object({
        conversationId: z.string().refine(
            value => mongoose.isValidObjectId(value),
            { message: 'Invalid conversation ID' }
        )
    }),
    body: z.object({
        content: z.string().trim().min(1, {
            message: 'Message content is required'
        })
    })
});