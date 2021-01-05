import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, Subject, of, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { findIndex } from 'lodash';

import { Personalization } from '../../models';
import { ApiService } from './api.service';
import { MessageService } from './message.service';
import { SelectionService } from './selection.service';
import { AuthService } from './auth.service';
import { switchMap, map } from 'rxjs/operators';


@Injectable()
export class PersonalizationService
{
  list: Personalization[] = [
    { 
    "orderId": "",
    "lineItemId": "",
    "matrixId": "",
    "matrixQtyId": "",
    "matrixQtyNo": "",
    "itemNo": "",
    "itemCode": "",
    "itemSize": "",
    "itemColor": "",
    "sequance": "",
    "displayText": "",
    "notes": "",
    "font": "",
    "color": "",
    "location": ""
    }
  ];
  list$: BehaviorSubject<Personalization[]> = new BehaviorSubject(this.list);
  
    constructor(
        private api: ApiService,
        private msg: MessageService,
        public selection: SelectionService,
        private authService: AuthService
    ) {

    }

  update(index, field, value) {
    this.list = this.list.map((e, i) => {
      if (index === i) {
        return {
          ...e,
          [field]: value
        }
      }
      return e;
    });
    this.list$.next(this.list);
  }

  getControl(index, fieldName) {

  }
  getUpdatedPersonalizationsList(){
      return this.list;
  }
    getQuoteOrderPersonalizations(orderId, lineItemId){

	    this.api.getQuoteOrderPersonalizations(orderId, lineItemId).subscribe((response: Personalization[]) => {
	      this.list = response;
	      this.list$ = new BehaviorSubject(response);
	    });
    
        return this.list$;
    }

}
