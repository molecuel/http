import "reflect-metadata";
import { MlclHttpMiddleware } from "./middleware/MlclHttpMiddleware";
export declare class MlclHttp {
    private app;
    constructor(app: MlclHttpMiddleware);
    registerRoutesBulk(routes: string[], target: string, type: string, returnType?: string): void;
    private typeSwitch(type);
    private initAppBodyParser();
    private initRoutes();
    private initRouter();
    private initListen();
}
