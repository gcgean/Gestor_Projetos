"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("./prisma.service");
const auth_controller_1 = require("./auth/auth.controller");
const auth_service_1 = require("./auth/auth.service");
const projects_controller_1 = require("./projects/projects.controller");
const projects_service_1 = require("./projects/projects.service");
const dashboard_controller_1 = require("./dashboard/dashboard.controller");
const dashboard_service_1 = require("./dashboard/dashboard.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({ secret: process.env.JWT_SECRET ?? 'dev-secret', signOptions: { expiresIn: '7d' } })],
        controllers: [auth_controller_1.AuthController, projects_controller_1.ProjectsController, dashboard_controller_1.DashboardController],
        providers: [prisma_service_1.PrismaService, auth_service_1.AuthService, projects_service_1.ProjectsService, dashboard_service_1.DashboardService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map