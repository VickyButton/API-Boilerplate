import { Route } from "./Route.js"

export interface Router {
    endpoint: string
    routes: Route[]
}