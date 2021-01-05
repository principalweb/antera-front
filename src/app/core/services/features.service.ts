import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable()
export class FeaturesService {

  constructor() { }

  isLogisticsEnabled() {
    
    const whitelist = [
      'localhost',
      'dev-front.anterasaas.com',
      'dev-front.anterasoftware.com',
      'greaterchina.anterasaas.com',
    ];
    const hostname = window.location.hostname;
    const isEnabled = whitelist.indexOf(hostname) !== -1;
    return of(isEnabled);
  }

}
