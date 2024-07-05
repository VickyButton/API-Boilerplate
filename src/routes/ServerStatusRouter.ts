import { ServerStatusController } from "../controller/ServerStatusController.js"
import { Router } from "../types/Router.js"

export const ServerStatusRouter: Router = {
    endpoint: "/",
    routes: [
        {
            endpoint: "",
            method: "GET",
            controller: ServerStatusController.get
        }
    ]
}