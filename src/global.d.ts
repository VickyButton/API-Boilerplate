import { API } from "./core/API.js"
import { Logger } from "./core/Logger.js"

declare global {
    var api: API
    var logger: Logger
}