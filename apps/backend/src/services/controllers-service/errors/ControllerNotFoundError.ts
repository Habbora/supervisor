export class ControllerNotFoundError extends Error {
    constructor(id: string) {
        super(`Controller with id '${id}' not found`);
        this.name = 'ControllerNotFoundError';
    }
}
