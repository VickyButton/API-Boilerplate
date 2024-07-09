import { IncomingMessage, ServerResponse } from "http"
import { Controller } from "../types/Controller.js"

export const ServerStatusController: Controller = {
    get(req: IncomingMessage, res: ServerResponse, params?: string[]) {
        if (params) console.log(params)

        api.sendStatus(res, 200)
    }
}