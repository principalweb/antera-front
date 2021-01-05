import { Injectable } from '@angular/core';
import * as fromConfig from '../../store/reducers/config.reducer';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { getConfigState } from 'app/store';
import { take } from 'rxjs/operators';
import { InititalizeCustomerView, SetCustomerView } from 'app/store/actions/config.actions';

@Injectable({
  providedIn: 'root'
})
export class CustomerViewService {

  state$: Observable<any>;
  
  constructor(private store: Store<fromConfig.State>) {
    this.state$ = store.pipe(select(fromConfig.getCustomerViewState));
  }

  toggle() {
    this.state$.pipe(
      take(1),
    ).subscribe((config: fromConfig.CustomerViewState) => {
      const isCustomerViewEnabled = config.enabled;
      this.store.dispatch(new SetCustomerView({ enabled: !isCustomerViewEnabled }));
    });
  }

  initialize() {
    this.store.dispatch(new InititalizeCustomerView());
  }
}
