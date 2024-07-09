
import { RequestListener } from "./RequestListener.js"
import { RequestListenerAsync } from "./RequestListenerAsync.js"

export interface Route {
    endpoint: string
    method: string
    controller: RequestListener | RequestListenerAsync
}