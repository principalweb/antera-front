import { ConfigActionTypes, ConfigActions } from '../actions/config.actions';
import { createSelector, createFeatureSelector } from '@ngrx/store';

export interface CustomerViewState {
    enabled: boolean;
}
export interface State {
    customerView: CustomerViewState; // OrderDetails requires function 
}

export const initialState: State = {
    customerView: {
        enabled: false,
    }
};

export function reducer(state = initialState, action: ConfigActions): State {
    switch (action.type) {
        case ConfigActionTypes.SetCustomerView: {
            return {
                ...state,
                customerView: action.payload
            };
        }
        default:
            return state;
    }
}

export const getConfigState = createFeatureSelector<State>('config');

export const getCustomerViewState = createSelector(
    getConfigState,
    (state: State) => state.customerView
);
