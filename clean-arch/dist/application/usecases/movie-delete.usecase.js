"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieDeleteUseCase = void 0;
class MovieDeleteUseCase {
    constructor(movieRepo) {
        this.movieRepo = movieRepo;
    }
    async execute(id) {
        return this.movieRepo.delete(id);
    }
}
exports.MovieDeleteUseCase = MovieDeleteUseCase;
//# sourceMappingURL=movie-delete.usecase.js.map