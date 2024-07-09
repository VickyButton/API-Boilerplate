import { Dictionary } from "./Dictionary.js"
import { RequestListener } from "./RequestListener.js"
import { RequestListenerAsync } from "./RequestListenerAsync.js"

export interface Controller extends Dictionary<RequestListener | RequestListenerAsync> { }