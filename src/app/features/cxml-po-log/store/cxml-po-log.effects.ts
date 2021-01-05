import { CxmlPoLogService } from '../cxml-po-log.service';
import { AnteraMeta } from 'app/models';
import { CxmlPoLog, CxmlPoLogData } from '../models/cxml-po-log';
import { Injectable } from '@angular/core';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  CxmlPoLogActionTypes,
  CxmlPoLogActions,
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
  Process,
  ProcessError,
 ProcessSuccess
} from './cxml-po-log.actions';

@Injectable()
export class CxmlPoLogEffects {

  @Effect()
  loadList$ = this.actions$.pipe(
    ofType(CxmlPoLogActionTypes.LoadList),
    switchMap((action: LoadList) => {
      return this.dataService.getList(action.payload.filter, action.payload.meta, action.payload.sort).pipe(
        map((res: {data: CxmlPoLog [], _meta: AnteraMeta}) => new LoadListSuccess (res)),
        catchError(error => of(new LoadListError(error)))
      );
    })
  );

  @Effect()
  editStart$ = this.actions$.pipe(
    ofType(CxmlPoLogActionTypes.EditStart),
    switchMap((action: EditStart) => {
      if (action.payload !== '') {
        return this.dataService.getData(action.payload).pipe(
          map((res: {data: CxmlPoLogData[]}) => res.data && res.data[0] ? new LoadDataSuccess(res.data[0]) : of(new LoadDataError('Record not found'))),
          catchError(error => of(new LoadDataError(error)))
        );
      } else {
        return of();
      }
    })
  );

  @Effect()
  create$ = this.actions$.pipe(
    ofType(CxmlPoLogActionTypes.Create),
    switchMap((action: Create) => {
      if (action.payload !== '') {
        return this.dataService.create(action.payload).pipe(
          map((res: {data: CxmlPoLogData}) => res.data ? new CreateSuccess(res.data) : of(new CreateError('Error creating record'))),
          catchError(error => of(new UpdateError(error)))
        );
      } else {
        return of();
      }
    })
  );

  @Effect()
  update$ = this.actions$.pipe(
    ofType(CxmlPoLogActionTypes.Update),
    switchMap((action: Update) => {
      if (action.payload !== '') {
        return this.dataService.update(action.payload.id, action.payload).pipe(
          map((res: {data: CxmlPoLogData}) => res.data ? new UpdateSuccess(res.data) : of(new UpdateError('Error creating record'))),
          catchError(error => of(new UpdateError(error)))
        );
      } else {
        return of();
      }
    })
  );

  @Effect()
  process$ = this.actions$.pipe(
    ofType(CxmlPoLogActionTypes.Process),
    switchMap((action: Process) => {
      if (action.payload !== '') {
        return this.dataService.process(action.payload).pipe(
          map((res: any) => res.data && res.data.message ? new ProcessSuccess(res.data.message) : (
            res.errors ? of(new ProcessError(res.errors)) : of(new ProcessError('Error processing response'))
            )
          ),
          catchError(error => of(new ProcessError(error)))
        );
      } else {
        return of();
      }
    })
  );

  constructor(private actions$: Actions<CxmlPoLogActions>,
    private dataService: CxmlPoLogService,
  ) { }
}
