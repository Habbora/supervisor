export class HydraulicLevel {
    id: string;
    name: string;
    value: number;

    constructor(dto: HydraulicLevelDto) {
        this.id = dto.id;
        this.name = dto.name;
        this.value = dto.value;
    }
}

export type HydraulicLevelDto = {
    id: string;
    name: string;
    value: number;
}
