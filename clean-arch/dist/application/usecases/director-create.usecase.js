"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectorCreateUseCase = void 0;
const crypto_1 = require("crypto");
const director_entity_1 = require("../../domain/entity/director.entity");
class DirectorCreateUseCase {
    constructor(directorRepo) {
        this.directorRepo = directorRepo;
    }
    async execute(input) {
        const nameTaken = await this.directorRepo.existsByName(input.name);
        if (nameTaken) {
            throw new Error('Name already in use');
        }
        const director = new director_entity_1.Director((0, crypto_1.randomUUID)(), input.name, input.nationality, input.birth_day);
        return this.directorRepo.save(director);
    }
}
exports.DirectorCreateUseCase = DirectorCreateUseCase;
//# sourceMappingURL=director-create.usecase.js.map