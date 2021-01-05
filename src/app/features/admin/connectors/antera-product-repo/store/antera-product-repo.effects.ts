import { AnteraProductRepoService } from 'app/core/services/antera-product-repo.service';
import { AnteraMeta, AnteraProductRepo, AnteraProductRepoData } from 'app/models';
import { Injectable } from '@angular/core';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  AnteraProductRepoActionTypes,
  AnteraProductRepoActions,
  LoadList,
  LoadListSuccess,
  LoadListError,
  LoadDataSuccess,
  LoadDataError,
  EditStart
} from './antera-product-repo.actions';

@Injectable()
export class AnteraProductRepoEffects {

  @Effect()
  loadList$ = this.actions$.pipe(
    ofType(AnteraProductRepoActionTypes.LoadList),
    switchMap((action: LoadList) => {
      return this.dataService.getList(action.payload.filter, action.payload.meta, action.payload.sort).pipe(
        map((res: {data: AnteraProductRepo [], _meta: AnteraMeta}) => new LoadListSuccess (res)),
        catchError(error => of(new LoadListError(error)))
      );
    })
  );

  @Effect()
  editStart$ = this.actions$.pipe(
    ofType(AnteraProductRepoActionTypes.EditStart),
    switchMap((action: EditStart) => {
      if (action.payload !== '') {
        return this.dataService.getData(action.payload).pipe(
          map((res: {data: AnteraProductRepoData[]}) => res.data && res.data[0] ? new LoadDataSuccess(res.data[0]) : of(new LoadDataError('Record not found'))),
          catchError(error => of(new LoadDataError(error)))
        );
      } else {
        return of();
      }
    })
  );

  constructor(private actions$: Actions<AnteraProductRepoActions>,
    private dataService: AnteraProductRepoService,
  ) { }
}
