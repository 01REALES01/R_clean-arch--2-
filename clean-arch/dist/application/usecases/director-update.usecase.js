"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectorCreateUseCase = void 0;
const director_entity_1 = require("../../domain/entity/director.entity");
class DirectorCreateUseCase {
    constructor(directorRepo) {
        this.directorRepo = directorRepo;
    }
    async execute(id, input) {
        const nameTaken = await this.directorRepo.existsByName(input.name);
        if (nameTaken) {
            throw new Error('Name already in use');
        }
        const director = new director_entity_1.Director(id, input.name, input.nationality, input.birth_day);
        return this.directorRepo.save(director);
    }
}
exports.DirectorCreateUseCase = DirectorCreateUseCase;
//# sourceMappingURL=director-update.usecase.js.map