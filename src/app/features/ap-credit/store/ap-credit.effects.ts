import { ApCreditService } from 'app/core/services/ap-credit.service';
import { AnteraMeta, ApCredit, ApCreditData } from 'app/models';
import { Injectable } from '@angular/core';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  ApCreditActionTypes,
  ApCreditActions,
  LoadList,
  LoadListSuccess,
  LoadListError,
  LoadDataSuccess,
  LoadDataError,
  EditStart,
  Create,
  CreateSuccess,
  CreateError,
  Update,
  UpdateSuccess,
  UpdateError,
  DeleteData,
  DeleteDataSuccess,
  DeleteDataError
} from './ap-credit.actions';

@Injectable()
export class ApCreditEffects {

  @Effect()
  loadList$ = this.actions$.pipe(
    ofType(ApCreditActionTypes.LoadList),
    switchMap((action: LoadList) => {
      return this.dataService.getList(action.payload.filter, action.payload.meta, action.payload.sort).pipe(
        map((res: {data: ApCredit [], _meta: AnteraMeta}) => new LoadListSuccess (res)),
        catchError(error => of(new LoadListError(error)))
      );
    })
  );

  @Effect()
  editStart$ = this.actions$.pipe(
    ofType(ApCreditActionTypes.EditStart),
    switchMap((action: EditStart) => {
      if (action.payload !== '') {
        return this.dataService.getData(action.payload).pipe(
          map((res: {data: ApCreditData[]}) => res.data && res.data[0] ? new LoadDataSuccess(res.data[0]) : of(new LoadDataError('Record not found'))),
          catchError(error => of(new LoadDataError(error)))
        );
      } else {
        return of();
      }
    })
  );

  @Effect()
  create$ = this.actions$.pipe(
    ofType(ApCreditActionTypes.Create),
    switchMap((action: Create) => {
      if (action.payload !== '') {
        return this.dataService.create(action.payload).pipe(
          map((res: {data: ApCreditData}) => res.data ? new CreateSuccess(res.data) : of(new CreateError('Error creating record'))),
          catchError(error => of(new UpdateError(error)))
        );
      } else {
        return of();
      }
    })
  );

  @Effect()
  update$ = this.actions$.pipe(
    ofType(ApCreditActionTypes.Update),
    switchMap((action: Update) => {
      if (action.payload !== '') {
        return this.dataService.update(action.payload.id, action.payload).pipe(
          map((res: {data: ApCreditData}) => res.data ? new UpdateSuccess(res.data) : of(new UpdateError('Error creating record'))),
          catchError(error => of(new UpdateError(error)))
        );
      } else {
        return of();
      }
    })
  );

  @Effect()
  delete$ = this.actions$.pipe(
    ofType(ApCreditActionTypes.DeleteData),
    switchMap((action: DeleteData) => {
      if (action.payload !== '') {
        return this.dataService.delete(action.payload.id).pipe(
          map((res: any) => res.data ? new DeleteDataSuccess(res.data) : of(new DeleteDataError('Error deleting record'))),
          catchError(error => of(new DeleteDataError(error)))
        );
      } else {
        return of();
      }
    })
  );

  constructor(private actions$: Actions<ApCreditActions>,
    private dataService: ApCreditService,
  ) { }
}
