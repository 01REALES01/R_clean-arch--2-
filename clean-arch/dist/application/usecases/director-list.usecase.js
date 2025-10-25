"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectorListUseCase = void 0;
class DirectorListUseCase {
    constructor(directorRepo) {
        this.directorRepo = directorRepo;
    }
    async execute() {
        return this.directorRepo.findAll();
    }
}
exports.DirectorListUseCase = DirectorListUseCase;
//# sourceMappingURL=director-list.usecase.js.map