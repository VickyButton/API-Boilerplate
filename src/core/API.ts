import { readdir } from "fs/promises"
import { IncomingMessage, Server, ServerResponse, createServer } from "http"
import path from "path"
import { Dictionary } from "../types/Dictionary.js"
import { RequestListener } from "../types/RequestListener.js"
import { RequestListenerAsync } from "../types/RequestListenerAsync.js"
import { Route } from "../types/Route.js"
import { Router } from "../types/Router.js"

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
            let controller = this.controllers[controllerKey]
            let params: string[] | undefined

            if (!controller) {
                for (const path in this.controllers) {
                    const pathRegex = new RegExp(path)
                    const match = controllerKey.match(pathRegex)

                    if (!match) continue

                    controller = this.controllers[path]
                    params = [...match].slice(1)

                    if (params.includes("")) throw 400

                    break
                }
            }

            if (!controller) throw 404

            controller instanceof Promise ? await controller(req, res, params) : controller(req, res, params)
        }
        catch (err) {
            if (typeof err == "number") this.sendStatus(res, err)
            else this.sendStatus(res, 500)
        }
    }

    private getControllerKey(endpoint: string, method: string) {
        return endpoint + "_" + method
    }

    private pathToRegex(path: string) {
        const parameterGroup = "([^/]+)"
        let regexPath = path
        let i = regexPath.lastIndexOf(":")

        while (i != -1) {
            const end = regexPath.indexOf("/", i)
            const substring = regexPath.substring(i, end == -1 ? regexPath.indexOf("_") : end)

            regexPath = regexPath.replace(substring, parameterGroup)

            i = regexPath.lastIndexOf(":")
        }

        regexPath = `^${regexPath}$`

        return regexPath
    }

    public async loadRoutes(routesDir: string) {
        try {
            const files = await readdir(routesDir)

            for (const file of files) {
                if (!file.includes(".js")) continue

                logger.log(API_LOG_TYPE, `Loading route "${file}"...`)

                const src = path.resolve(routesDir, file)
                const router = (await import(src))[file.split(".")[0]] as Router

                for (const route of router.routes) {
                    api.setRoute({ ...route, endpoint: router.endpoint + route.endpoint })
                }
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

    public sendJson(res: ServerResponse, json: Object) {
        res.setHeader("Content-Type", "application/json")
        res.writeHead(200)
        res.write(JSON.stringify(json))
        res.end()
    }

    public sendStatus(res: ServerResponse, status: number) {
        res.writeHead(status)
        res.end()
    }

    public setRoute({ endpoint, method, controller }: Route) {
        const controllerKey = this.getControllerKey(endpoint, method)
        const path = endpoint.includes(":") ? this.pathToRegex(controllerKey) : controllerKey

        this.controllers[path] = controller
    }

    public start(host: string, port: number, callback?: () => void) {
        logger.log(API_LOG_TYPE, "Starting...")

        this.httpServer.listen(port, host, callback)
    }
}