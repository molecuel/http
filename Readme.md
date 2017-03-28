# @molecuel/http [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url]

HTTP module for the Molecuel framework

Based on the core modules and it's data functions http implments the automatic creation of HTTP endpoints with koa@2 async functions.

Endpoints can simply be defined in code with decorator functions and gets their url's through the project configuration. This guarantees a high flexibility and adds the option to reuse functions with different url's.

Functions need to be async and tagged as dataRead, dataCreate, dataDelete, dataUpdate or dataReplace. Parameters can be mapped by the mapDataParams function. All these decorators are provided by @molecuel/core to ensure that tagged functions can be reused with different services like FTP or websockets.

```js
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
```

[npm-image]: https://badge.fury.io/js/%40molecuel%2Fhttp.svg
[npm-url]: https://npmjs.org/package/@molecuel/http
[travis-image]: https://travis-ci.org/molecuel/http.svg?branch=master
[travis-url]: https://travis-ci.org/molecuel/http
[daviddm-image]: https://david-dm.org/molecuel/http.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/molecuel/http
[coveralls-image]: https://coveralls.io/repos/molecuel/http/badge.svg
[coveralls-url]: https://coveralls.io/r/molecuel/http
