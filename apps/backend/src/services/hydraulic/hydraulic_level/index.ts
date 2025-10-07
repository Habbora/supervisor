export class HydraulicLevel {
    id: string;
    name: string;
    value: number;
    minValueAlert: number;
    maxValueAlert: number;

    constructor(dto: HydraulicLevelDto) {
        this.id = dto.id;
        this.name = dto.name;
        this.value = dto.value;
        this.minValueAlert = dto.minValueAlert ?? 0;
        this.maxValueAlert = dto.maxValueAlert ?? 100;
    }
}

export type HydraulicLevelDto = {
    id: string;
    name: string;
    value: number;
    minValueAlert?: number;
    maxValueAlert?: number;
}
