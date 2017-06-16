import "reflect-metadata";
import { MlclHttpMiddleware } from "./middleware/MlclHttpMiddleware";
export declare class MlclHttp {
    private app;
    constructor(app: MlclHttpMiddleware);
    private initAppBodyParser();
    private initRoutes();
    private initRouter();
    private initListen();
}
