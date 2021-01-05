import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from "../purchase-orders.state";
export const getPurchaseOrderState = createFeatureSelector<State>("purchaseOrders");

export const getPurchaseOrderList = createSelector(
    getPurchaseOrderState,
    (state: State) => state.purchaseOrderList
);

export const getSelectedPurchaseOrder = createSelector(
    getPurchaseOrderState,
    (state: State) => state.selectedPurchaseOrder
);

export const getLoadingState = createSelector(
    getPurchaseOrderState,
    (state: State) => state.loading
);

export const getFilterState = createSelector(
    getPurchaseOrderState,
    (state: State) => state.filters
);

export const getMetaState = createSelector(
    getPurchaseOrderState,
    (state: State) => state.meta
);

export const getHiddenState = createSelector(
    getPurchaseOrderState,
    (state: State) => state.filters.hidden
);