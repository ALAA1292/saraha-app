import ConversationMessage from "../model/ConversationMessage.model.js";
import BaseRepository from "./base.repository.js";


export default class ConversationMessageRepository extends BaseRepository {
    constructor() {
        super(ConversationMessage);
    }
}