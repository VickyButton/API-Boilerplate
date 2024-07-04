export interface Log {
    type: string
    message: string
    timestamp: number
}

export class Logger {
    private readonly logs: Log[] = []

    private print(log: Log) {
        const date = new Date(log.timestamp)

        console[log.type.toLowerCase() == "error" ? "error" : "log"](`[${date.toLocaleTimeString("en-GB")}][${log.type}] ${log.message}`)
    }

    public log(type: string, message: string) {
        const timestamp = Date.now()
        const log = { type, message, timestamp }

        this.logs.push(log)

        this.print(log)
    }
}