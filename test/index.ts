'use strict';
import 'reflect-metadata';
import assert = require('assert');
import should =  require('should');
import {di, injectable} from '@molecuel/di';
import {MlclCore} from '@molecuel/core';
import {MlclKoa} from '../dist';
should();

describe('MlclCoreInit', function() {
  it('should bootstrap', function() {
    di.bootstrap(MlclCore, MlclKoa);
  });
  it('should init molecuel core', function() {
    let core: MlclCore = di.getInstance('MlclCore');
    assert(core !== undefined);
    assert(core instanceof MlclCore);
  });
});

describe('MlclKoa', function() {
  it('should return a MlclKoa instance', function() {
    let koa = di.getInstance('MlclKoa');
    assert(koa !== undefined);
    assert(koa instanceof MlclKoa);
  });
  it('should be a singleton instance', function() {
    assert(di.getInstance('MlclKoa') === di.getInstance('MlclKoa'));
  });
}); // test end
