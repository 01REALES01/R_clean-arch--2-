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
exports.DirectorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const director_create_usecase_1 = require("../../application/usecases/director-create.usecase");
const director_get_usecase_1 = require("../../application/usecases/director-get.usecase");
const director_delete_usecase_1 = require("../../application/usecases/director-delete.usecase");
const director_list_usecase_1 = require("../../application/usecases/director-list.usecase");
const director_mapper_1 = require("../../application/mappers/director.mapper");
class CreateDirectorRequest {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Director name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDirectorRequest.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Director name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDirectorRequest.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Director nationality' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDirectorRequest.prototype, "nationality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Director birth day' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDirectorRequest.prototype, "birth_day", void 0);
let DirectorController = class DirectorController {
    constructor(directorCreate, directorGet, directorList, directorDelete) {
        this.directorCreate = directorCreate;
        this.directorGet = directorGet;
        this.directorList = directorList;
        this.directorDelete = directorDelete;
    }
    async create(body) {
        try {
            let director;
            if (body.id) {
                director = await this.directorCreate.execute({ id: body.id, name: body.name, nationality: body.nationality, birth_day: body.birth_day });
            }
            else {
                director = await this.directorCreate.execute({ name: body.name, nationality: body.nationality, birth_day: body.birth_day });
            }
            return (0, director_mapper_1.toDirectorDto)(director);
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
            const director = await this.directorGet.execute(id);
            if (!director) {
                throw new common_1.HttpException('Director not found', common_1.HttpStatus.NOT_FOUND);
            }
            return (0, director_mapper_1.toDirectorDto)(director);
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
            const director = await this.directorGet.execute(id);
            if (!director) {
                throw new common_1.HttpException('Director not found', common_1.HttpStatus.NOT_FOUND);
            }
            const deleteDirector = await this.directorDelete.execute(id);
            return deleteDirector;
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
            const categories = await this.directorList.execute();
            return categories.map(director_mapper_1.toDirectorDto);
        }
        catch (error) {
            if (error.message) {
                throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
            }
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.DirectorController = DirectorController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateDirectorRequest]),
    __metadata("design:returntype", Promise)
], DirectorController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DirectorController.prototype, "get", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DirectorController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DirectorController.prototype, "list", null);
exports.DirectorController = DirectorController = __decorate([
    (0, swagger_1.ApiTags)('director'),
    (0, common_1.Controller)('director'),
    __metadata("design:paramtypes", [typeof (_a = typeof director_create_usecase_1.DirectorCreateUseCase !== "undefined" && director_create_usecase_1.DirectorCreateUseCase) === "function" ? _a : Object, typeof (_b = typeof director_get_usecase_1.DirectorGetUseCase !== "undefined" && director_get_usecase_1.DirectorGetUseCase) === "function" ? _b : Object, typeof (_c = typeof director_list_usecase_1.DirectorListUseCase !== "undefined" && director_list_usecase_1.DirectorListUseCase) === "function" ? _c : Object, typeof (_d = typeof director_delete_usecase_1.DirectorDeleteUseCase !== "undefined" && director_delete_usecase_1.DirectorDeleteUseCase) === "function" ? _d : Object])
], DirectorController);
//# sourceMappingURL=director.controller.js.map