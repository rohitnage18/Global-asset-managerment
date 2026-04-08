// CloudWatch monitoring and logging utility
export class Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  info(message: string, meta?: any) {
    console.log(
      JSON.stringify({
        level: "info",
        context: this.context,
        message,
        meta,
        timestamp: new Date().toISOString(),
      }),
    )
  }

  error(message: string, error?: any, meta?: any) {
    console.error(
      JSON.stringify({
        level: "error",
        context: this.context,
        message,
        error: error?.message || error,
        stack: error?.stack,
        meta,
        timestamp: new Date().toISOString(),
      }),
    )
  }

  warn(message: string, meta?: any) {
    console.warn(
      JSON.stringify({
        level: "warn",
        context: this.context,
        message,
        meta,
        timestamp: new Date().toISOString(),
      }),
    )
  }
}

export function createLogger(context: string) {
  return new Logger(context)
}
