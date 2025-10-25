"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaDirectorRepository = void 0;
const director_entity_1 = require("../../../domain/entity/director.entity");
class PrismaDirectorRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(director) {
        const saved = await this.prisma.director.upsert({
            where: { id: director.id },
            update: { name: director.name, nationality: director.nationality, birth_day: director.birth_day },
            create: { id: director.id, name: director.name, nationality: director.nationality, birth_day: director.birth_day },
        });
        return new director_entity_1.Director(saved.id, saved.name, saved.nationality, saved.birth_day);
    }
    async findById(id) {
        const found = await this.prisma.director.findUnique({ where: { id } });
        return found ? new director_entity_1.Director(found.id, found.name, found.nationality, found.birth_day) : null;
    }
    async findAll() {
        const rows = await this.prisma.director.findMany();
        return rows.map(r => new director_entity_1.Director(r.id, r.name, r.nationality, r.birth_day));
    }
    async delete(id) {
        const found = await this.prisma.director.delete({ where: { id } });
        return found ? true : false;
    }
    async existsByName(name) {
        const count = await this.prisma.director.count({ where: {
                name: {
                    equals: name, mode: 'insensitive'
                }
            } });
        return count > 0;
    }
}
exports.PrismaDirectorRepository = PrismaDirectorRepository;
//# sourceMappingURL=prisma-director.repository.js.map