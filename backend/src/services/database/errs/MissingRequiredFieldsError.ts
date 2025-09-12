export class MissingRequiredFieldsError extends Error {
    constructor(message?: string) {
        super(message || "Missing required fields");
        this.name = "MissingRequiredFieldsError";
    }
}