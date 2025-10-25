"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const movie_create_usecase_1 = require("../../application/usecases/movie-create.usecase");
const movie_delete_usecase_1 = require("../../application/usecases/movie-delete.usecase");
const movie_get_usecase_1 = require("../../application/usecases/movie-get.usecase");
const movie_list_usecase_1 = require("../../application/usecases/movie-list.usecase");
const movie_mapper_1 = require("../../application/mappers/movie.mapper");
class CreateMovieRequest {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Movie id' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMovieRequest.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Movie title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMovieRequest.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Movie year' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMovieRequest.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Director ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMovieRequest.prototype, "directorId", void 0);
let MovieController = class MovieController {
    constructor(movieCreate, movieGet, movieList, movieDelete) {
        this.movieCreate = movieCreate;
        this.movieGet = movieGet;
        this.movieList = movieList;
        this.movieDelete = movieDelete;
    }
    async create(body) {
        try {
            let movie;
            if (body.id) {
                movie = await this.movieCreate.execute({ id: body.id, title: body.title, year: body.year, directorId: body.directorId });
            }
            else {
                movie = await this.movieCreate.execute({ title: body.title, year: body.year, directorId: body.directorId });
            }
            return (0, movie_mapper_1.toMovieDto)(movie);
        }
        catch (error) {
            if (error.message) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async get(id) {
        try {
            const movie = await this.movieGet.execute(id);
            if (!movie) {
                throw new common_1.HttpException('Movie not found', common_1.HttpStatus.NOT_FOUND);
            }
            return (0, movie_mapper_1.toMovieDto)(movie);
        }
        catch (error) {
            if (error.message) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async put(id, body) {
        try {
            const movie = await this.movieGet.execute(id);
            if (!movie) {
                throw new common_1.HttpException('Movie not found', common_1.HttpStatus.NOT_FOUND);
            }
            return (0, movie_mapper_1.toMovieDto)(movie);
        }
        catch (error) {
            if (error.message) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async delete(id) {
        try {
            const movie = await this.movieGet.execute(id);
            if (!movie) {
                throw new common_1.HttpException('Movie not found', common_1.HttpStatus.NOT_FOUND);
            }
            const deleteMovie = await this.movieDelete.execute(id);
            return deleteMovie;
        }
        catch (error) {
            if (error.message) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async list() {
        try {
            const movies = await this.movieList.execute();
            return movies.map(movie_mapper_1.toMovieDto);
        }
        catch (error) {
            if (error.message) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.MovieController = MovieController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateMovieRequest]),
    __metadata("design:returntype", Promise)
], MovieController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MovieController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateMovieRequest]),
    __metadata("design:returntype", Promise)
], MovieController.prototype, "put", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MovieController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MovieController.prototype, "list", null);
exports.MovieController = MovieController = __decorate([
    (0, swagger_1.ApiTags)('movie'),
    (0, common_1.Controller)('movie'),
    __metadata("design:paramtypes", [typeof (_a = typeof movie_create_usecase_1.MovieCreateUseCase !== "undefined" && movie_create_usecase_1.MovieCreateUseCase) === "function" ? _a : Object, typeof (_b = typeof movie_get_usecase_1.MovieGetUseCase !== "undefined" && movie_get_usecase_1.MovieGetUseCase) === "function" ? _b : Object, typeof (_c = typeof movie_list_usecase_1.MovieListUseCase !== "undefined" && movie_list_usecase_1.MovieListUseCase) === "function" ? _c : Object, typeof (_d = typeof movie_delete_usecase_1.MovieDeleteUseCase !== "undefined" && movie_delete_usecase_1.MovieDeleteUseCase) === "function" ? _d : Object])
], MovieController);
//# sourceMappingURL=movie.controller.js.map