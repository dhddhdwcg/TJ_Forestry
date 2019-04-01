import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {

  constructor() { }
  
  /**
   * TODO move this elsewhere
   */
  public assign(obj: any, prop: any, value: any) {
    if (typeof prop === 'string') {
      prop = prop.split('.');
    }
    if (prop.length > 1) {
      const e = prop.shift();
      this.assign(obj[e] =
        Object.prototype.toString.call(obj[e]) === '[object Object]'  ? obj[e] : {},  prop, value);
    } else {
      obj[prop[0]] = value;
    }
  }
}
