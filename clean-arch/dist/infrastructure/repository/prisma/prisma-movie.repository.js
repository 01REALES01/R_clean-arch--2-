"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaMovieRepository = void 0;
const movie_entity_1 = require("../../../domain/entity/movie.entity");
class PrismaMovieRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(movie) {
        const saved = await this.prisma.movie.upsert({
            where: { id: movie.id },
            update: { title: movie.title, year: movie.year, directorId: movie.directorId },
            create: { id: movie.id, title: movie.title, year: movie.year, directorId: movie.directorId },
        });
        return new movie_entity_1.Movie(saved.id, saved.title, saved.year, saved.directorId);
    }
    async findById(id) {
        const found = await this.prisma.movie.findUnique({ where: { id }, include: {
                director: true
            } });
        return found ? new movie_entity_1.Movie(found.id, found.title, found.year, found.directorId) : null;
    }
    async findAll() {
        const rows = await this.prisma.movie.findMany();
        return rows.map(r => new movie_entity_1.Movie(r.id, r.title, r.year, r.directorId));
    }
    async delete(id) {
        const found = await this.prisma.movie.delete({ where: { id } });
        return found ? true : false;
    }
}
exports.PrismaMovieRepository = PrismaMovieRepository;
//# sourceMappingURL=prisma-movie.repository.js.map