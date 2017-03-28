"use strict";
process.env.configpath = "./test/config/";
import {dataCreate, dataDelete, dataRead, dataReplace, dataUpdate, mapDataParams,
  MlclCore, MlclDataParam} from "@molecuel/core";
import {di, injectable} from "@molecuel/di";
import * as assert from "assert";
import "reflect-metadata";
import * as should from "should";
import * as supertest from "supertest";
import {MlclHttp, MlclHttpCoreRouter, MlclHttpMiddleware, MlclHttpRouter} from "../dist";

describe("MlclCoreBootStrap", () => {
  before(() => {
    @injectable
    class MyCreateTestRoutes {
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
      @dataRead()
      public async dataReadeTest2() {
        return {};
      }
      @dataRead("application/rss+xml")
      public async dataReadeTestXml() {
        return "<xml></<xml>";
      }
      @dataCreate()
      public async dataCreateTest() {
        return true;
      }
      @mapDataParams([
        new MlclDataParam("id", "id", "integer", 25),
      ])
      @dataUpdate()
      public async dataUpdateTest(id, size) {
        return true;
      }
      @mapDataParams([
        new MlclDataParam("id", "id", "integer", 25),
      ])
      @dataReplace()
      public async dataReplaceTest(id, size) {
        return true;
      }
      @mapDataParams([
        new MlclDataParam("id", "id", "integer", 25),
      ])
      @dataDelete()
      public async dataDeleteTest(id, size) {
        return true;
      }
    }
  });
  it("should bootstrap", () => {
    di.bootstrap(MlclCore, MlclHttpMiddleware, MlclHttp);
  });
});

describe("MlclCoreInit", () => {
  it("should init molecuel core", () => {
    let core: MlclCore = di.getInstance("MlclCore");
    assert(core !== undefined);
    assert(core instanceof MlclCore);
  });
  it("should exec init function", async () => {
    let core: MlclCore = di.getInstance("MlclCore");
    await core.init();
  });
});

describe("MlclHttpMiddleware", () => {
  it("should return a MlclHttpMiddleware instance", () => {
    let middleware = di.getInstance("MlclHttpMiddleware");
    assert(middleware !== undefined);
    assert(middleware instanceof MlclHttpMiddleware);
  });
  it("should be a singleton instance", () => {
    assert(di.getInstance("MlclHttpMiddleware") === di.getInstance("MlclHttpMiddleware"));
  });
});

describe("MlclHttpCoreRouter", () => {
  it("should return a MlclHttpCoreRouter instance", () => {
    let coreRouter = di.getInstance("MlclHttpCoreRouter");
    assert(coreRouter !== undefined);
    assert(coreRouter instanceof MlclHttpCoreRouter);
  });
  it("should be a singleton instance", () => {
    assert(di.getInstance("MlclHttpCoreRouter") === di.getInstance("MlclHttpCoreRouter"));
  });
});

describe("MlclHttpRouter", () => {
  it("should return a MlclHttpRouter instance", () => {
    let router = di.getInstance("MlclHttpRouter");
    assert(router !== undefined);
    assert(router instanceof MlclHttpRouter);
  });
});

describe("MlclHttp", () => {
  it("should return a MlclHttp instance", () => {
    let mhttp = di.getInstance("MlclHttp");
    assert(mhttp !== undefined);
    assert(mhttp instanceof MlclHttp);
  });
  it("MlclHttp should automatically attach the middleware", () => {
    let mhttp = di.getInstance("MlclHttp");
    assert(mhttp !== undefined);
    assert(mhttp instanceof MlclHttp);
    assert(mhttp.app instanceof MlclHttpMiddleware);
  });
  it("MlclHttp attached middleware should be singleton", () => {
    let mhttp = di.getInstance("MlclHttp");
    assert(mhttp.app === di.getInstance("MlclHttpMiddleware"));
  });
  it("should get a reply from the application", (done) => {
    let app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
    .get("/mlclhttp/health")
    .end((err: any, res: supertest.Response) => {
      assert(err === null);
      assert(res.status === 200);
      done();
    });
  });
  it("should get a reply from the test read", (done) => {
    let app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
    .get("/testread")
    .end((err: any, res: supertest.Response) => {
      assert(err === null);
      assert(res.status === 200);
      done();
    });
  });
  it("should get a reply from the test read with parameters and query options", (done) => {
    let app = di.getInstance("MlclHttpMiddleware");
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
    let app = di.getInstance("MlclHttpMiddleware");
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
    let app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
    .post("/testcreate")
    .send({testdata: "mytest"})
    .end((err: any, res: supertest.Response) => {
      assert(err === null);
      assert(res.status === 201);
      done();
    });
  });
  it("should be able to send a post request to update a object", (done) => {
    let app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
    .post("/testupdate/myid")
    .send({testdata: "mytest"})
    .end((err: any, res: supertest.Response) => {
      assert(err === null);
      assert(res.status === 200);
      done();
    });
  });
  it("should be able to send a put request to replace a object", (done) => {
    let app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
    .put("/testreplace/123")
    .send({testdata: "mytest"})
    .end((err: any, res: supertest.Response) => {
      assert(err === null);
      assert(res.status === 200);
      done();
    });
  });
  it("should be able to send a delete request for a object", (done) => {
    let app = di.getInstance("MlclHttpMiddleware");
    supertest(app.listen())
    .delete("/testdelete/123")
    .end((err: any, res: supertest.Response) => {
      assert(err === null);
      assert(res.status === 204);
      done();
    });
  });
});
