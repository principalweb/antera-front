import { Action } from '@ngrx/store';
import { ApCreditFilter, ApCredit, AnteraMeta, AnteraSort, ApCreditData } from 'app/models';

export enum ApCreditActionTypes {
  LoadList = '[ApCredit] Load List',
  LoadListSuccess = '[ApCredit] Load List Success',
  LoadListError = '[ApCredit] Load List Error',
  EditStart = '[ApCredit] Edit Start',
  EditEnd = '[ApCredit] Edit End',
  LoadDataSuccess = '[ApCredit] Load Data Success',
  LoadDataError = '[ApCredit] Load Data Error',
  Create = '[ApCredit] Create',
  CreateError = '[ApCredit] Create Error',
  CreateSuccess = '[ApCredit] Create Success',
  Update = '[ApCredit] Update',
  UpdateError = '[ApCredit] Update Error',
  UpdateSuccess = '[ApCredit] Update Success',
  DeleteData = '[ApCredit] Delete',
  DeleteDataError = '[ApCredit] Delete Error',
  DeleteDataSuccess = '[ApCredit] Delete Success',
}

export class LoadList implements Action {
  readonly type = ApCreditActionTypes.LoadList;
  constructor(public payload: {filter: ApCreditFilter, meta: AnteraMeta, sort: AnteraSort}) {
  }
}

export class LoadListSuccess implements Action {
  readonly type = ApCreditActionTypes.LoadListSuccess;
  constructor(public payload: {data: ApCredit[], _meta: AnteraMeta}) {
  }
}

export class LoadListError implements Action {
  readonly type = ApCreditActionTypes.LoadListError;
  constructor(public payload: any) {
  }
}

export class EditStart implements Action {
  readonly type = ApCreditActionTypes.EditStart;
  constructor(public payload: string = '') {
  }
}

export class EditEnd implements Action {
  readonly type = ApCreditActionTypes.EditEnd;
  constructor(public payload: string = '') {
  }
}

export class LoadDataSuccess implements Action {
  readonly type = ApCreditActionTypes.LoadDataSuccess;
  constructor(public payload: ApCreditData) {
  }
}

export class LoadDataError implements Action {
  readonly type = ApCreditActionTypes.LoadDataError;
  constructor(public payload: any) {
  }
}

export class Create implements Action {
  readonly type = ApCreditActionTypes.Create;
  constructor(public payload: any) {
  }
}

export class CreateSuccess implements Action {
  readonly type = ApCreditActionTypes.CreateSuccess;
  constructor(public payload: ApCreditData) {
  }
}

export class CreateError implements Action {
  readonly type = ApCreditActionTypes.CreateError;
  constructor(public payload: any) {
  }
}

export class Update implements Action {
  readonly type = ApCreditActionTypes.Update;
  constructor(public payload: any) {
  }
}

export class UpdateSuccess implements Action {
  readonly type = ApCreditActionTypes.UpdateSuccess;
  constructor(public payload: ApCreditData) {
  }
}

export class UpdateError implements Action {
  readonly type = ApCreditActionTypes.UpdateError;
  constructor(public payload: any) {
  }
}

export class DeleteData implements Action {
  readonly type = ApCreditActionTypes.DeleteData;
  constructor(public payload: any) {
  }
}

export class DeleteDataSuccess implements Action {
  readonly type = ApCreditActionTypes.DeleteDataSuccess;
  constructor(public payload: ApCreditData) {
  }
}

export class DeleteDataError implements Action {
  readonly type = ApCreditActionTypes.DeleteDataError;
  constructor(public payload: any) {
  }
}

export type ApCreditActions =
  LoadList |
  LoadListSuccess |
  LoadListError |
  EditStart |
  EditEnd |
  LoadDataSuccess |
  LoadDataError |
  Create |
  CreateError |
  CreateSuccess |
  Update |
  UpdateError |
  UpdateSuccess |
  DeleteData |
  DeleteDataError |
  DeleteDataSuccess;
