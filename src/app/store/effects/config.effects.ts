import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Effect, Actions, ofType } from '@ngrx/effects';
import * as RouterActions from '../actions/router.action';

import { tap, map, switchMap } from 'rxjs/operators';
import { ConfigActionTypes, ConfigActions, InititalizeCustomerView, SetCustomerView } from '../actions/config.actions';
import { of } from 'rxjs';

@Injectable()
export class ConfigEffects {
  constructor(
    private actions$: Actions,
  ) {}

  @Effect()
  initialize$ = this.actions$.pipe(
    ofType(ConfigActionTypes.InitializeCustomerView),
    switchMap((action: InititalizeCustomerView) => {
      const enabled: boolean = localStorage.getItem('features.customer-view-enabled') == '1' ? true : false;
      if (enabled) {
        return of(new SetCustomerView({
          enabled: enabled 
        }));
      }
      // load from localstorage
      return of({type: 'NOOP'});
    })
  );

  @Effect({dispatch: false})
  updateCustomer$ = this.actions$.pipe(
    ofType(ConfigActionTypes.SetCustomerView),
    tap((action: SetCustomerView) => {
      // update localstorage
      const enabled = action.payload.enabled;
      localStorage.setItem('features.customer-view-enabled', enabled ? '1' : '0');
    })
  );

}
