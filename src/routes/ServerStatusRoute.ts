import { ServerStatusController } from "../controller/ServerStatusController.js"
import { Route } from "../types/Route.js"

export const ServerStatusRoute: Route = {
    endpoint: "/",
    method: "GET",
    controller: ServerStatusController.get
}