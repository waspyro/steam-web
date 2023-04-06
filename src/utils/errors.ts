export class ErrorWithContext extends Error {
    constructor(message, public context: any) {super(message)}
}