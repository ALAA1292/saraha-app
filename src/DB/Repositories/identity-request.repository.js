import IdentityRequest from "../model/identity-request.model.js";
import BaseRepository from "./base.repository.js";


export default class IdentityRequestRepository extends BaseRepository{
    constructor() {
        super(IdentityRequest);
    }
}