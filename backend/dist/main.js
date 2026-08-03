"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv/config");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    const localOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5180', 'http://127.0.0.1:5180']);
    app.enableCors({ origin: (origin, callback) => callback(null, !origin || localOrigins.has(origin)) });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(Number(process.env.PORT ?? 3333));
}
bootstrap();
//# sourceMappingURL=main.js.map