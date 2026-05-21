"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const serverless_express_1 = __importDefault(require("@vendia/serverless-express"));
const express_1 = __importDefault(require("express"));
const app_module_1 = require("../src/app.module");
let cachedHandler;
async function bootstrap() {
    if (cachedHandler)
        return cachedHandler;
    const expressApp = (0, express_1.default)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
    app.enableCors();
    await app.init();
    cachedHandler = (0, serverless_express_1.default)({ app: expressApp });
    return cachedHandler;
}
async function handler(req, res) {
    const serverHandler = await bootstrap();
    return serverHandler(req, res);
}
//# sourceMappingURL=index.js.map