import { Action } from '@ngrx/store';
import { AnteraMeta, AnteraSort } from 'app/models';
import { CxmlPoLogFilter, CxmlPoLog, CxmlPoLogData } from '../models/cxml-po-log';

export enum CxmlPoLogActionTypes {
  LoadList = '[CxmlPoLog] Load List',
  LoadListSuccess = '[CxmlPoLog] Load List Success',
  LoadListError = '[CxmlPoLog] Load List Error',
  EditStart = '[CxmlPoLog] Edit Start',
  EditEnd = '[CxmlPoLog] Edit End',
  LoadDataSuccess = '[CxmlPoLog] Load Data Success',
  LoadDataError = '[CxmlPoLog] Load Data Error',
  Create = '[CxmlPoLog] Create',
  CreateError = '[CxmlPoLog] Create Error',
  CreateSuccess = '[CxmlPoLog] Create Success',
  Update = '[CxmlPoLog] Update',
  UpdateError = '[CxmlPoLog] Update Error',
  UpdateSuccess = '[CxmlPoLog] Update Success',
  DeleteData = '[CxmlPoLog] Delete',
  DeleteDataError = '[CxmlPoLog] Delete Error',
  DeleteDataSuccess = '[CxmlPoLog] Delete Success',
  Process = '[CxmlPoLog] Process',
  ProcessError = '[CxmlPoLog] Process Error',
  ProcessSuccess = '[CxmlPoLog] Process Success',
}

export class LoadList implements Action {
  readonly type = CxmlPoLogActionTypes.LoadList;
  constructor(public payload: {filter: CxmlPoLogFilter, meta: AnteraMeta, sort: AnteraSort}) {
  }
}

export class LoadListSuccess implements Action {
  readonly type = CxmlPoLogActionTypes.LoadListSuccess;
  constructor(public payload: {data: CxmlPoLog[], _meta: AnteraMeta}) {
  }
}

export class LoadListError implements Action {
  readonly type = CxmlPoLogActionTypes.LoadListError;
  constructor(public payload: any) {
  }
}

export class EditStart implements Action {
  readonly type = CxmlPoLogActionTypes.EditStart;
  constructor(public payload: string = '') {
  }
}

export class EditEnd implements Action {
  readonly type = CxmlPoLogActionTypes.EditEnd;
  constructor(public payload: string = '') {
  }
}

export class LoadDataSuccess implements Action {
  readonly type = CxmlPoLogActionTypes.LoadDataSuccess;
  constructor(public payload: CxmlPoLogData) {
  }
}

export class LoadDataError implements Action {
  readonly type = CxmlPoLogActionTypes.LoadDataError;
  constructor(public payload: any) {
  }
}

export class Create implements Action {
  readonly type = CxmlPoLogActionTypes.Create;
  constructor(public payload: any) {
  }
}

export class CreateSuccess implements Action {
  readonly type = CxmlPoLogActionTypes.CreateSuccess;
  constructor(public payload: CxmlPoLogData) {
  }
}

export class CreateError implements Action {
  readonly type = CxmlPoLogActionTypes.CreateError;
  constructor(public payload: any) {
  }
}

export class Update implements Action {
  readonly type = CxmlPoLogActionTypes.Update;
  constructor(public payload: any) {
  }
}

export class UpdateSuccess implements Action {
  readonly type = CxmlPoLogActionTypes.UpdateSuccess;
  constructor(public payload: CxmlPoLogData) {
  }
}

export class UpdateError implements Action {
  readonly type = CxmlPoLogActionTypes.UpdateError;
  constructor(public payload: any) {
  }
}

export class Process implements Action {
  readonly type = CxmlPoLogActionTypes.Process;
  constructor(public payload: string) {
  }
}

export class ProcessSuccess implements Action {
  readonly type = CxmlPoLogActionTypes.ProcessSuccess;
  constructor(public payload: any) {
  }
}

export class ProcessError implements Action {
  readonly type = CxmlPoLogActionTypes.ProcessError;
  constructor(public payload: any) {
  }
}

export type CxmlPoLogActions =
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
  Process |
  ProcessError |
  ProcessSuccess/* |
  Delete |
  DeleteError |
  DeleteSuccess*/;
