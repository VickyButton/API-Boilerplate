import { RequestListener } from "http"
import { Dictionary } from "./Dictionary.js"
import { RequestListenerAsync } from "./RequestListenerAsync.js"

export interface Controller extends Dictionary<RequestListener | RequestListenerAsync> { }