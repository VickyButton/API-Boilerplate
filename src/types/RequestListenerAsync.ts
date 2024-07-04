import { IncomingMessage, ServerResponse } from "http"

export type RequestListenerAsync = (req: IncomingMessage, res: ServerResponse) => Promise<void>