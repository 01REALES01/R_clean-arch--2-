"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieCreateUseCase = void 0;
const crypto_1 = require("crypto");
const movie_entity_1 = require("../../domain/entity/movie.entity");
class MovieCreateUseCase {
    constructor(movieRepo, directorRepo) {
        this.movieRepo = movieRepo;
        this.directorRepo = directorRepo;
    }
    async execute(input) {
        const directorIdExists = await this.directorRepo.findById(input.directorId);
        if (!directorIdExists) {
            throw new Error('directorId does not exist');
        }
        const movie = new movie_entity_1.Movie((0, crypto_1.randomUUID)(), input.title, input.year, input.directorId);
        return this.movieRepo.save(movie);
    }
}
exports.MovieCreateUseCase = MovieCreateUseCase;
//# sourceMappingURL=movie-create.usecase.js.map