import mongoose from 'mongoose';
const { Schema } = mongoose;


const messageSchema = new Schema({
content:{
    type:String,
},
file:{
    type:String,
},
receiverId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
}
,
senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    select: false
}
})

const Message = mongoose.model('Message', messageSchema);         //making model
export default Message;