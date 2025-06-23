type ControllerDto = {
    id: string;
    name: string;
    driverName: string;
    startConfig: any;
}

class Controller {
    id: string;
    name: string;
    driverName: string;
    startConfig: any;

    constructor(dto: ControllerDto) {
        this.id = dto.id;
        this.name = dto.name;
        this.driverName = dto.driverName;
        this.startConfig = dto.startConfig;
    }
}

export class ControllerManager {
    private controllers: Controller[] = [];

    createController(dto: ControllerDto) {
        const controller = new Controller(dto);
        this.controllers.push(controller);
    }

    getControllerById(id: string) {
        return this.controllers.find((controller) => controller.id === id);
    }
}