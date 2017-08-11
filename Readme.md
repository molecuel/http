# @molecuel/http
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url]

HTTP module for the Molecuel framework

Based on the core modules and it's data functions http implments the automatic creation of HTTP endpoints with koa@2 async functions.

Endpoints can simply be defined in code with decorator functions and gets their url's through the project configuration. This guarantees a high flexibility and adds the option to reuse functions with different url's.

Functions need to be async and tagged as dataRead, dataCreate, dataDelete, dataUpdate or dataReplace. Parameters can be mapped by the mapDataParams function. All these decorators are provided by @molecuel/core to ensure that tagged functions can be reused with different services like FTP or websockets.

A running server is based on one or multiple classes using the decorators and a configuration mapping the urls to the classes.


The javascript part.
```js
import {MlclCore, dataRead, dataCreate, dataUpdate, dataDelete, mapDataParams} from '@molecuel/core';
import {di, injectable} from "@molecuel/di";
import {MlclHttp, MlclHttpCoreRouter, MlclHttpMiddleware, MlclHttpRouter} from "@molecuel/http";

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
    new MlclDataParam("body", "postdata", "json"),
    new MlclDataParam("body.property", "child", "string"),
  ])
  @dataUpdate()
  public async dataUpdateTest(id, postdata, child) {
    return true;
  }
  @mapDataParams([
    new MlclDataParam("id", "id", "integer", 25),
  ])
  @dataReplace()
  public async dataReplaceTest(id) {
    return true;
  }
  @mapDataParams([
    new MlclDataParam("id", "id", "integer", 25),
  ])
  @dataDelete()
  public async dataDeleteTest(id) {
    return true;
  }
}
di.bootstrap(MlclCore, MlclHttpMiddleware, MlclHttp);
```

The configuration should be stored in ./config/development.json (or NODE_ENV) and look like this example:

```json
{
  "http": {
    "security": {

    },
    "routes": [
      {
        "url": "/testread",
        "class": "MyCreateTestRoutes",
        "property": "dataReadeTest2"
      },
      {
        "url": "/testread/:id",
        "class": "MyCreateTestRoutes",
        "property": "dataReadeTest1"
      },
      {
        "url": "/testreadXml",
        "class": "MyCreateTestRoutes",
        "property": "dataReadeTestXml"
      },
      {
        "url": "/testcreate",
        "class": "MyCreateTestRoutes",
        "property": "dataCreateTest"
      },
      {
        "url": "/testupdate/:id",
        "class": "MyCreateTestRoutes",
        "property": "dataUpdateTest"
      },
      {
        "url": "/testreplace/:id",
        "class": "MyCreateTestRoutes",
        "property": "dataReplaceTest"
      },
       {
        "url": "/testdelete/:id",
        "class": "MyCreateTestRoutes",
        "property": "dataDeleteTest"
      }
    ]
  }
}

```

[npm-image]: https://badge.fury.io/js/%40molecuel%2Fhttp.svg
[npm-url]: https://npmjs.org/package/@molecuel/http
[travis-image]: https://travis-ci.org/molecuel/http.svg?branch=master
[travis-url]: https://travis-ci.org/molecuel/http
[daviddm-image]: https://david-dm.org/molecuel/http.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/molecuel/http
[coveralls-image]: https://coveralls.io/repos/molecuel/http/badge.svg
[coveralls-url]: https://coveralls.io/r/molecuel/http
