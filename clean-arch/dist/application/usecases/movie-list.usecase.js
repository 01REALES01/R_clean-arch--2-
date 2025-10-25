"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieListUseCase = void 0;
class MovieListUseCase {
    constructor(movieRepo) {
        this.movieRepo = movieRepo;
    }
    async execute() {
        return this.movieRepo.findAll();
    }
}
exports.MovieListUseCase = MovieListUseCase;
//# sourceMappingURL=movie-list.usecase.js.map