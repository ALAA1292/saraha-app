import { Router } from 'express'
import { multerUpload } from './../../middleware/multer.middleware.js';
import { BadRequestException } from '../../Utils/Security/Errors/exceptions.error.js';
import {  getMessagesByReceiverId, sendMessage } from './message.service.js';
import { authenticate, optionalAuthenticate } from './../../middleware/authentication.middleware.js';
const messageController = Router(); 
messageController.post("/health", async (req, res, next) => {
    return res.status(200).json({ message: "message is heakthy"
        })
})

//send message
messageController.post(
    '/send',
    optionalAuthenticate,
    multerUpload({desiredPath:'message'}).single('file'),
    async (req, res) => {

        const { content, receiverId } = req.body;
        const file = req.file;

        if (!content && !file) {
            throw new BadRequestException(
                "content or file is required",
                null,
                "CONTENT_OR-FILE_REQUIRED"
            );
        }

        const result = await sendMessage({
            content,
            file,
            receiverId,
            senderId: req.authUser?._id
        });

        res.status(201).json({
            message: 'message sent successfully',
            data: result
        });
    }
);
//receive messages

messageController.get('/receiver',authenticate,async(req,res)=>{

    const result=await getMessagesByReceiverId(req.authUser._id)
    res.status(200).json({message:'message received successfully', data:result})

})


export default messageController