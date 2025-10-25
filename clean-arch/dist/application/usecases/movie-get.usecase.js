"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieGetUseCase = void 0;
class MovieGetUseCase {
    constructor(movieRepo) {
        this.movieRepo = movieRepo;
    }
    async execute(id) {
        return this.movieRepo.findById(id);
    }
}
exports.MovieGetUseCase = MovieGetUseCase;
//# sourceMappingURL=movie-get.usecase.js.map