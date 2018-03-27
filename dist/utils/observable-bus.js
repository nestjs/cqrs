"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Subject_1 = require("rxjs/Subject");
const Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/filter");
const isEmpty = array => !(array && array.length > 0);
class ObservableBus extends Observable_1.Observable {
  constructor() {
    super();
    this.subject$ = new Subject_1.Subject();
    this.source = this.subject$;
  }
  ofType(...metatypes) {
    return this.filter(
      event => !isEmpty(metatypes.filter(metatype => event instanceof metatype))
    );
  }
}
exports.ObservableBus = ObservableBus;
