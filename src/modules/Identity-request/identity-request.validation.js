import { z } from 'zod';
import mongoose from 'mongoose';

export const identityRequestParamsSchema = z.object({
    params: z.object({
        messageId: z.string().refine(
            value => mongoose.isValidObjectId(value),
            { message: 'Invalid message ID' }
        )
    })
});

export const getIdentityRequestsQuerySchema = z.object({
    query: z.object({
        status: z.enum(['pending', 'accepted', 'rejected']).optional()
    })
});

export const updateIdentityRequestSchema = z.object({
    params: z.object({
        requestId: z.string().refine(
            value => mongoose.isValidObjectId(value),
            { message: 'Invalid request ID' }
        )
    }),
    body: z.object({
        status: z.enum(['accepted', 'rejected'])
    })
});