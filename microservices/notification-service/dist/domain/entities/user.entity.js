"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
class User {
    constructor(id, email, password, role, createdAt, updatedAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(props) {
        const now = new Date();
        return new User(props.id || '', props.email, props.password, props.role || UserRole.USER, props.createdAt || now, props.updatedAt || now);
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map