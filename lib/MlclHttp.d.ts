import "reflect-metadata";
import { MlclHttpMiddleware } from "./middleware/MlclHttpMiddleware";
export declare class MlclHttp {
    private app;
    constructor(app: MlclHttpMiddleware);
    registerRoutes(routes: string[], target: string | ((...params) => any), type: string | string[], routingFunc?: ((target: ((...params) => any), params: any[], next?) => any), returnType?: string): void;
    private typeSwitch(type);
    private initAppBodyParser();
    private initRoutes();
    private initRouter();
    private initListen();
}
