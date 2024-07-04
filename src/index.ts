import path from "path"
import { fileURLToPath } from "url"
import { API } from "./core/API.js"
import { Logger } from "./core/Logger.js"

const SYSTEM_LOG_TYPE = "System"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const routesDir = path.resolve(__dirname, "routes")
let host = process.env.HOST
let port = process.env.PORT ? parseInt(process.env.PORT) : undefined

globalThis.api = new API()
globalThis.logger = new Logger()

if (host && port) {
    await api.loadRoutes(routesDir)

    const callback = () => {
        logger.log(SYSTEM_LOG_TYPE, `Running API on port ${port}...`)
    }

    api.start(host, port, callback)
}