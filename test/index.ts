"use strict";
process.env.configpath = "./test/config/";
import {dataCreate, dataDelete, dataRead, dataReplace, dataUpdate, mapDataParams,
  MlclCore, MlclDataParam} from "@molecuel/core";
import {di, injectable} from "@molecuel/di";
import * as assert from "assert";
import "reflect-metadata";
import * as should from "should";
import * as supertest from "supertest";
import {MlclHttp, MlclHttpCoreRouter, MlclHttpMiddleware, MlclHttpRouter} from "../lib";

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
      @dataCreate()
      public async dataCreateTestError() {
        throw new Error("My custom error");
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
          throw new Error("some data is missing");
        }
      }
      @dataUpdate()
      public async dataUpdateTestError(id, size) {
        throw new Error("My custom update error");
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
        throw new Error("Error on replace");
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
        throw new Error("Error on delete");
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
    .send({testdata: "mytest"})
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
    .send({testdata: "mytest"})
    .end((err: any, res: supertest.Response) => {
      // should.exist(err);
      res.status.should.equal(500);
      done();
    });
  });
  it("should be able to send a post request to update a object", (done) => {
    const app = di.getInstance("MlclHttpMiddleware");
    // app.use(bodyparser());
    supertest(app.listen())
    .post("/testupdate/myid")
    .send({testdata: "mytest"})
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
    .send({testdata: "mytest"})
    .end((err: any, res: supertest.Response) => {
      assert(res.status === 500);
      done();
    });
  });
  // it("should be able to send a put request to replace a object", (done) => {
  //   const app = di.getInstance("MlclHttpMiddleware");
  //   supertest(app.listen())
  //   .put("/testreplace/123")
  //   .send({testdata: "mytest"})
  //   .end((err: any, res: supertest.Response) => {
  //     assert(err === null);
  //     assert(res.status === 200);
  //     done();
  //   });
  // });
  // it("should be able to send a put request to replace a object and return a error on error", (done) => {
  //   const app = di.getInstance("MlclHttpMiddleware");
  //   supertest(app.listen())
  //   .put("/testreplaceerror/123")
  //   .send({testdata: "mytest"})
  //   .end((err: any, res: supertest.Response) => {
  //     assert(res.status === 500);
  //     done();
  //   });
  // });
  // it("should be able to send a delete request for a object", (done) => {
  //   const app = di.getInstance("MlclHttpMiddleware");
  //   supertest(app.listen())
  //   .delete("/testdelete/123")
  //   .end((err: any, res: supertest.Response) => {
  //     assert(err === null);
  //     assert(res.status === 204);
  //     done();
  //   });
  // });
  // it("should be able to send a delete request for a object and return a error on error", (done) => {
  //   const app = di.getInstance("MlclHttpMiddleware");
  //   supertest(app.listen())
  //   .delete("/testdeleteerror/123")
  //   .end((err: any, res: supertest.Response) => {
  //     assert(res.status === 500);
  //     done();
  //   });
  // });
});
