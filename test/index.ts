"use strict";
process.env.configpath = "./test/config/";
import {
  dataCreate, dataDelete, dataRead, dataReplace, dataUpdate, mapDataParams,
  MlclCore, MlclDataParam,
} from "@molecuel/core";
import { di, injectable } from "@molecuel/di";
import * as assert from "assert";
import * as _ from "lodash";
import "reflect-metadata";
import * as should from "should";
import * as supertest from "supertest";
import { MlclHttp, MlclHttpCoreRouter, MlclHttpMiddleware, MlclHttpRouter } from "../lib";

// tslint:disable:max-classes-per-file
export class TestConstants {
  public static get CUSTOM_ERROR(): string { return "My custom error"; }
  public static get CUSTOM_UPDATE_ERROR(): string { return "My custom update error"; }
  public static get MISSING_DATA_ERROR(): string { return "some data is missing"; }
  public static get REPLACE_ERROR(): string { return "Error on replace"; }
  public static get DELETE_ERROR(): string { return "Error on delete"; }
}

describe("MlclCoreBootStrap", () => {
  before(() => {
    @injectable
    class MyCreateTestRoutes {
      @mapDataParams([
        new MlclDataParam("request.headers", "headers", "origin"),
      ])
      @dataRead()
      public async dataPreReadeTest(headers: any) {
        if (headers) {
          headers.preRoute = true;
        }
      }
      @mapDataParams([
        new MlclDataParam("id", "id", "integer", 25),
        new MlclDataParam("large", "size", "boolean"),
      ])
      @dataRead()
      public async dataReadeTest1(id, size) {
        return {
          id,
          size,
        };
      }
      @mapDataParams([
        new MlclDataParam("request.headers.perms", "perms", "boolean"),
        new MlclDataParam("request.headers.params", "params", "string"),
        new MlclDataParam("request.headers.preRoute", "preRoute", "boolean"),
      ])
      @dataRead()
      public async dataReadeTest2(perms?, params?) {
        const result: any = {};
        if (perms) {
          result.perms = perms;
        }
        if (params) {
          result.params = params;
        }
        return result;
      }
      @dataRead("application/rss+xml")
      public async dataReadeTestXml() {
        return "<xml></<xml>";
      }
      @dataCreate()
      public async dataCreateTest() {
        return true;
      }
      @dataCreate()
      public async dataCreateTestError() {
        throw new Error(TestConstants.CUSTOM_ERROR);
      }
      @mapDataParams([
        new MlclDataParam("id", "id", "integer", 25),
        new MlclDataParam("body", "postdata", "json"),
        new MlclDataParam("body.testdata", "testdata", "string"),
      ])
      @dataUpdate()
      public async dataUpdateTest(id, postdata, testdata) {
        if (id !== undefined && postdata !== undefined) {
          return true;
        } else {
          throw new Error(TestConstants.MISSING_DATA_ERROR);
        }
      }
      @dataUpdate()
      public async dataUpdateTestError(id, size) {
        throw new Error(TestConstants.CUSTOM_UPDATE_ERROR);
      }
      @mapDataParams([
        new MlclDataParam("id", "id", "integer", 25),
      ])
      @dataReplace()
      public async dataReplaceTest(id, size) {
        return true;
      }
      @dataReplace()
      public async dataReplaceTestError(id, size) {
        throw new Error(TestConstants.REPLACE_ERROR);
      }
      @mapDataParams([
        new MlclDataParam("id", "id", "integer", 25),
      ])
      @dataDelete()
      public async dataDeleteTest(id, size) {
        return true;
      }
      @dataDelete()
      public async dataDeleteTestError(id, size) {
        throw new Error(TestConstants.DELETE_ERROR);
      }
    }
  });
  it("should bootstrap", () => {
    di.bootstrap(MlclCore, MlclHttpMiddleware, MlclHttp);
  });
});

describe("MlclCoreInit", () => {
  it("should init molecuel core", () => {
    const core: MlclCore = di.getInstance("MlclCore");
    assert(core !== undefined);
    assert(core instanceof MlclCore);
  });
  it("should exec init function", async () => {
    const core: MlclCore = di.getInstance("MlclCore");
    await core.init();
  });
});

describe("MlclHttpMiddleware", () => {
  it("should return a MlclHttpMiddleware instance", () => {
    const middleware = di.getInstance("MlclHttpMiddleware");
    assert(middleware !== undefined);
    assert(middleware instanceof MlclHttpMiddleware);
  });
  it("should be a singleton instance", () => {
    assert(di.getInstance("MlclHttpMiddleware") === di.getInstance("MlclHttpMiddleware"));
  });
});

describe("MlclHttpCoreRouter", () => {
  it("should return a MlclHttpCoreRouter instance", () => {
    const coreRouter = di.getInstance("MlclHttpCoreRouter");
    assert(coreRouter !== undefined);
    assert(coreRouter instanceof MlclHttpCoreRouter);
  });
  it("should be a singleton instance", () => {
    assert(di.getInstance("MlclHttpCoreRouter") === di.getInstance("MlclHttpCoreRouter"));
  });
});

describe("MlclHttpRouter", () => {
  it("should return a MlclHttpRouter instance", () => {
    const router = di.getInstance("MlclHttpRouter");
    assert(router !== undefined);
    assert(router instanceof MlclHttpRouter);
  });
});

describe("MlclHttp", () => {
  it("should return a MlclHttp instance", () => {
    const mhttp = di.getInstance("MlclHttp");
    assert(mhttp !== undefined);
    assert(mhttp instanceof MlclHttp);
  });
  it("MlclHttp should automatically attach the middleware", () => {
    const mhttp = di.getInstance("MlclHttp");
    assert(mhttp !== undefined);
    assert(mhttp instanceof MlclHttp);
    assert(mhttp.app instanceof MlclHttpMiddleware);
  });
  it("MlclHttp attached middleware should be singleton", () => {
    const mhttp = di.getInstance("MlclHttp");
    assert(mhttp.app === di.getInstance("MlclHttpMiddleware"));
  });
  it("should add some routes dynamically", () => {
    const mhttp: MlclHttp = di.getInstance("MlclHttp");
    const getRoutes: string[] = ["/testdynamicget1", "/testdynamicget2", "/testdynamicget3"];
    mhttp.registerRoutes(getRoutes, "MyCreateTestRoutes.dataReadeTest1", "read");
  });
  it("should get a reply from the application", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .get("/mlclhttp/health")
      .end((err: any, res: supertest.Response) => {
        assert(err === null);
        assert(res.status === 200);
        done();
      });
  });
  it("should get a reply from the test read", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .get("/testread")
      .end((err: any, res: supertest.Response) => {
        assert(err === null);
        assert(res.status === 200);
        assert(res.body);
        assert(res.body.preRoute === true);
        done();
      });
  });
  it("should get a reply from the test read with parameters and query options", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .get("/testread/111?large=true")
      .end((err: any, res: supertest.Response) => {
        assert(err === null);
        assert(res.status === 200);
        assert(res.body.id === 111);
        assert(res.body.size === true);
        done();
      });
  });
  it("should get a reply from the test read with RSS XML result type", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .get("/testreadXml")
      .end((err: any, res: supertest.Response) => {
        should.not.exist(err);
        should.strictEqual(res.status, 200);
        should.strictEqual(res.header["content-type"], "application/rss+xml");
        done();
      });
  });
  it("should be able to send a post request to create a object", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .post("/testcreate")
      .send({ testdata: "mytest" })
      .end((err: any, res: supertest.Response) => {
        assert(err === null);
        assert(res.status === 201);
        done();
      });
  });
  it("should be able to send a post request to create a object and return a error", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .post("/testcreateerror")
      .send({ testdata: "mytest" })
      .end((err: any, res: supertest.Response) => {
        // should.exist(err);
        res.status.should.equal(500);
        res.text.should.equal(TestConstants.CUSTOM_ERROR);
        done();
      });
  });
  it("should be able to send a post request to update a object", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    // app.use(bodyparser());
    supertest(app.listen())
      .post("/testupdate/myid")
      .send({ testdata: "mytest" })
      .end((err: any, res: supertest.Response) => {
        assert(err === null);
        assert(res.status === 200);
        done();
      });
  });
  it("should be able to send a post request to update a object and return an error", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .post("/testupdateerror/myid")
      .send({ testdata: "mytest" })
      .end((err: any, res: supertest.Response) => {
        assert(res.status === 500);
        res.text.should.equal(TestConstants.CUSTOM_UPDATE_ERROR);
        done();
      });
  });
  it("should be able to send a put request to replace a object", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .put("/testreplace/123")
      .send({ testdata: "mytest" })
      .end((err: any, res: supertest.Response) => {
        assert(err === null);
        assert(res.status === 200);
        done();
      });
  });
  it("should be able to send a put request to replace a object and return a error on error", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .put("/testreplaceerror/123")
      .send({ testdata: "mytest" })
      .end((err: any, res: supertest.Response) => {
        assert(res.status === 500);
        res.text.should.equal(TestConstants.REPLACE_ERROR);
        done();
      });
  });
  it("should be able to send a delete request for a object", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .delete("/testdelete/123")
      .end((err: any, res: supertest.Response) => {
        assert(err === null);
        assert(res.status === 204);
        done();
      });
  });
  it("should be able to send a delete request for a object and return a error on error", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .delete("/testdeleteerror/123")
      .end((err: any, res: supertest.Response) => {
        assert(res.status === 500);
        res.text.should.equal(TestConstants.DELETE_ERROR);
        done();
      });
  });
  it("should be able to send a request to a 'dynamic' route", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .get("/testdynamicget1?id=1234&large=false")
      .end((err: any, res: supertest.Response) => {
        assert(res.status === 200);
        assert(res.body !== undefined);
        assert(res.body.id === 1234);
        assert(res.body.size === false);
        done();
      });
  });
  it("should be able to send a request to a recently registered 'dynamic' route", (done) => {
    const coreRouter = di.getInstance("MlclHttpCoreRouter");
    const createRoutes: string[] = ["/testdynamiccreate1", "/testdynamiccreate2", "/testdynamiccreate3"];
    const mhttp: MlclHttp = di.getInstance("MlclHttp");
    mhttp.registerRoutes(createRoutes, "MyCreateTestRoutes.dataCreateTest", "create");
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .post("/testdynamiccreate2?blablubb=12")
      .end((err: any, res: supertest.Response) => {
        assert(res.status === 201);
        done();
      });
  });
  it("should be able to handle a request with fallback route", (done) => {
    const coreRouter = di.getInstance("MlclHttpCoreRouter");
    const mhttp: MlclHttp = di.getInstance("MlclHttp");
    mhttp.registerRoutes(["/testdynamicget*"], (...params) => {
      params[0] = params.find((param) => param.path).path;
      return params.filter((item) => typeof item === "string");
    }, "get");
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .get("/testdynamicget9?id=567&size=999")
      .end((err: any, res: supertest.Response) => {
        assert(res.status === 200);
        assert(Array.isArray(res.body));
        assert(res.body.length === 3);
        assert(res.body.every((item) => typeof item === "string"));
        done();
      });
  });
  it("should be able to handle a request with waterfall routes", (done) => {
    const coreRouter = di.getInstance("MlclHttpCoreRouter");
    coreRouter.stack = coreRouter.stack.filter((item) => item.path.indexOf("*") === -1);
    const mhttp: MlclHttp = di.getInstance("MlclHttp");
    mhttp.registerRoutes(
      ["/*"],
      (...params) => {
        if (params.length > 1) {
          const request = params[params.length - 2];
          request.headers.perms = true;
        }
      }, ["get", "post", "delete"],
      (async (target: any, params: any[], next) => {
        await target(...params);
        await next();
      }),
    );
    mhttp.registerRoutes(
      ["/specific/*"],
      (...params) => {
        if (params.length > 1) {
          const request = params[params.length - 2];
          params[0] = params.find((param) => param.path).path;
          request.headers.params = params.filter((item) => typeof item === "string");
        }
      },
      ["get", "post", "delete"],
      (async (target: any, params: any[], next) => {
        await target(...params);
        await next();
      }),
    );
    mhttp.registerRoutes(["/specific/getter"], "MyCreateTestRoutes.dataReadeTest2", "get");
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .get("/specific/getter?id=567&size=999")
      .end((err: any, res: supertest.Response) => {
        assert(res.status === 200);
        assert(res.body);
        assert(Array.isArray(res.body.params));
        assert(res.body.params.length === 3);
        assert(res.body.params.every((item) => typeof item === "string"));
        assert(res.body.perms === true);
        done();
      });
  });
  it("should stop mid waterfall", (done) => {
    const coreRouter = di.getInstance("MlclHttpCoreRouter");
    coreRouter.stack = coreRouter.stack.filter((item) => item.path.indexOf("*") === -1);
    const mhttp: MlclHttp = di.getInstance("MlclHttp");
    mhttp.registerRoutes(
      ["/*"],
      (...params) => {
        if (params.length > 1) {
          const request = params[params.length - 2];
          request.headers.perms = true;
        }
      }, ["get", "post", "delete"],
      (async (target: any, params: any[], next) => {
        await target(...params);
        await next();
      }),
    );
    mhttp.registerRoutes(
      ["/specific/*"],
      (...params) => {
        if (params.length > 1) {
          const request = params[params.length - 2];
          params[0] = params.find((param) => param.path).path;
          request.headers.params = params.filter((item) => typeof item === "string");
        }
      },
      ["get", "post", "delete"],
      (async (target: any, params: any[]) => {
        await target(...params);
      }),
    );
    mhttp.registerRoutes(["/specific/getter"], "MyCreateTestRoutes.dataReadeTest1", "get");
    const app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
      .get("/specific/getter?id=567&size=999")
      .end((err: any, res: supertest.Response) => {
        assert(res.status === 200);
        assert(res.body);
        assert(res.body instanceof Object);
        assert(Object.keys(res.body).length === 0);
        done();
      });
  });
});
