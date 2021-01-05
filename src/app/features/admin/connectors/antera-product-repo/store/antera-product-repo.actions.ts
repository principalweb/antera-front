import { Action } from '@ngrx/store';
import { AnteraProductRepoFilter, AnteraProductRepo, AnteraMeta, AnteraSort, AnteraProductRepoData } from 'app/models';

export enum AnteraProductRepoActionTypes {
  LoadList = '[AnteraProductRepo] Load List',
  LoadListSuccess = '[AnteraProductRepo] Load List Success',
  LoadListError = '[AnteraProductRepo] Load List Error',
  EditStart = '[AnteraProductRepo] Edit Start',
  EditEnd = '[AnteraProductRepo] Edit End',
  LoadDataSuccess = '[AnteraProductRepo] Load Data Success',
  LoadDataError = '[AnteraProductRepo] Load Data Error',
  Create = '[AnteraProductRepo] Create',
  CreateError = '[AnteraProductRepo] Create Error',
  CreateSuccess = '[AnteraProductRepo] Create Success',
  Update = '[AnteraProductRepo] Update',
  UpdateError = '[AnteraProductRepo] Update Error',
  UpdateSuccess = '[AnteraProductRepo] Update Success',
  DeleteData = '[AnteraProductRepo] Delete',
  DeleteDataError = '[AnteraProductRepo] Delete Error',
  DeleteDataSuccess = '[AnteraProductRepo] Delete Success',
}

export class LoadList implements Action {
  readonly type = AnteraProductRepoActionTypes.LoadList;
  constructor(public payload: {filter: AnteraProductRepoFilter, meta: AnteraMeta, sort: AnteraSort}) {
  }
}

export class LoadListSuccess implements Action {
  readonly type = AnteraProductRepoActionTypes.LoadListSuccess;
  constructor(public payload: {data: AnteraProductRepo[], _meta: AnteraMeta}) {
  }
}

export class LoadListError implements Action {
  readonly type = AnteraProductRepoActionTypes.LoadListError;
  constructor(public payload: any) {
  }
}

export class EditStart implements Action {
  readonly type = AnteraProductRepoActionTypes.EditStart;
  constructor(public payload: string = '') {
  }
}

export class EditEnd implements Action {
  readonly type = AnteraProductRepoActionTypes.EditEnd;
  constructor(public payload: string = '') {
  }
}

export class LoadDataSuccess implements Action {
  readonly type = AnteraProductRepoActionTypes.LoadDataSuccess;
  constructor(public payload: AnteraProductRepoData) {
  }
}

export class LoadDataError implements Action {
  readonly type = AnteraProductRepoActionTypes.LoadDataError;
  constructor(public payload: any) {
  }
}

export class Create implements Action {
  readonly type = AnteraProductRepoActionTypes.Create;
  constructor(public payload: any) {
  }
}

export class CreateSuccess implements Action {
  readonly type = AnteraProductRepoActionTypes.LoadDataSuccess;
  constructor(public payload: AnteraProductRepoData) {
  }
}

export class CreateError implements Action {
  readonly type = AnteraProductRepoActionTypes.LoadDataError;
  constructor(public payload: any) {
  }
}

export class Update implements Action {
  readonly type = AnteraProductRepoActionTypes.Update;
  constructor(public payload: any) {
  }
}

export class UpdateSuccess implements Action {
  readonly type = AnteraProductRepoActionTypes.UpdateSuccess;
  constructor(public payload: AnteraProductRepoData) {
  }
}

export class UpdateError implements Action {
  readonly type = AnteraProductRepoActionTypes.UpdateError;
  constructor(public payload: any) {
  }
}

export type AnteraProductRepoActions =
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
  UpdateSuccess/* |
  Delete |
  DeleteError |
  DeleteSuccess*/;
