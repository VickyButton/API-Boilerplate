import { readdir } from "fs/promises"
import { IncomingMessage, RequestListener, Server, ServerResponse, createServer } from "http"
import path from "path"
import { Dictionary } from "../types/Dictionary.js"
import { RequestListenerAsync } from "../types/RequestListenerAsync.js"
import { Route } from "../types/Route.js"

const API_LOG_TYPE = "API"

export class API {
    private readonly controllers: Dictionary<RequestListener | RequestListenerAsync> = {}
    private readonly httpServer: Server

    constructor() {
        this.httpServer = createServer(this.delegateRequest.bind(this))
    }

    private async delegateRequest(req: IncomingMessage, res: ServerResponse) {
        try {
            const { url, method } = req

            logger.log(API_LOG_TYPE, `Incoming ${method} request at ${url}`)

            if (!url || !method) throw 400

            const controllerKey = this.getControllerKey(url, method)
            const controller = this.controllers[controllerKey]

            if (!controller) throw 404

            controller instanceof Promise ? await controller(req, res) : controller(req, res)
        }
        catch (err) {
            if (typeof err == "number") this.sendStatus(res, err)
            else this.sendStatus(res, 500)
        }
    }

    private getControllerKey(endpoint: string, method: string) {
        return endpoint + "_" + method
    }

    public async loadRoutes(routesDir: string) {
        try {
            const files = await readdir(routesDir)

            for (const file of files) {
                if (!file.includes(".js")) continue

                logger.log(API_LOG_TYPE, `Loading route "${file}"...`)

                const src = path.resolve(routesDir, file)
                const route = (await import(src))[file.split(".")[0]] as Route

                api.setRoute(route)
            }
        }
        catch (err) {
            logger.log(API_LOG_TYPE, "Unable to load routes...")
        }
    }

    public parseRequestData<T extends Object = Object>(req: IncomingMessage) {
        const callback = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => {
            let chunks: any[] = []

            const onData = (chunk: any) => chunks.push(chunk)
            const onEnd = () => {
                const buffer = Buffer.concat(chunks).toString()
                const data = JSON.parse(buffer)

                req.removeListener("data", onData)
                req.removeListener("end", onEnd)

                resolve(data)
            }

            req.addListener("data", onData)
            req.addListener("end", onEnd)
        }

        return new Promise<T>(callback)
    }

    public sendStatus(res: ServerResponse, status: number) {
        res.writeHead(status)
        res.end()
    }

    public setRoute({ endpoint, method, controller }: Route) {
        const controllerKey = this.getControllerKey(endpoint, method)

        this.controllers[controllerKey] = controller
    }

    public start(host: string, port: number, callback?: () => void) {
        logger.log(API_LOG_TYPE, "Starting...")

        this.httpServer.listen(port, host, callback)
    }
}