export class ControllerAlreadyExistsError extends Error {
    constructor(name: string) {
        super(`Controller with name '${name}' already exists`);
        this.name = 'ControllerAlreadyExistsError';
    }
}
