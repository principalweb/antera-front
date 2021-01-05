import { createFeatureSelector, createSelector } from "@ngrx/store";
import { State } from "../invoices.state";
export const getInvoiceState = createFeatureSelector<State>(
  "invoices"
);

export const getFinalInvoicesList = createSelector(
  getInvoiceState,
  (state: State) => state.invoiceList
);

export const getFilterState = createSelector(
  getInvoiceState,
  (state: State) => state.filters
);

export const getLoadingState = createSelector(
  getInvoiceState,
  (state: State) => state.loading
);


