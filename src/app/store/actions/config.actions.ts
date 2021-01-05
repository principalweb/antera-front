import { Action } from '@ngrx/store';
import { NavigationExtras } from '@angular/router';

export enum ConfigActionTypes {
    InitializeCustomerView = '[Customer View] Initialize',
    SetCustomerView = '[Customer View] Toggle',
}

export class InititalizeCustomerView implements Action {
    readonly type = ConfigActionTypes.InitializeCustomerView;
    constructor() { }
}

export class SetCustomerView implements Action {
    readonly type = ConfigActionTypes.SetCustomerView;
    constructor(public payload: { enabled: boolean }) { }
}

export type ConfigActions = InititalizeCustomerView | SetCustomerView;
