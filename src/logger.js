/**
 * Create a JSON logger
 */

export default class Logger {
    constructor() {
        this.log = {}
    }

    push(id, res, state) {
        const { options } = res.request

        this.log[id] = {
            req: {
                method: options.method,
                url: options.url.toString(),
                headers: res.req.getHeaders(),
                cookies: res.req.getHeader('cookie'),
                body: { ...res.request.options?.form?.entries() }
            },
            res: {
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                'set-cookie': res.headers['set-cookie'],
                body: res.body
            },
            state
        }
    }

    stringify() {
        return JSON.stringify(this.log, null, 2)
    }
}
