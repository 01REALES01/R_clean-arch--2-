"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectorGetUseCase = void 0;
class DirectorGetUseCase {
    constructor(directorRepo) {
        this.directorRepo = directorRepo;
    }
    async execute(id) {
        return this.directorRepo.findById(id);
    }
}
exports.DirectorGetUseCase = DirectorGetUseCase;
//# sourceMappingURL=director-get.usecase.js.map