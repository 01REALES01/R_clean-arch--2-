"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMovieDto = void 0;
const toMovieDto = (d) => ({
    id: d.id,
    title: d.title,
    year: d.year,
    directorId: d.directorId,
});
exports.toMovieDto = toMovieDto;
//# sourceMappingURL=movie.mapper.js.map