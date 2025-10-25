"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectorDeleteUseCase = void 0;
class DirectorDeleteUseCase {
    constructor(directorRepo) {
        this.directorRepo = directorRepo;
    }
    async execute(id) {
        return this.directorRepo.delete(id);
    }
}
exports.DirectorDeleteUseCase = DirectorDeleteUseCase;
//# sourceMappingURL=director-delete.usecase.js.map