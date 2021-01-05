import { createFeatureSelector, createSelector } from "@ngrx/store";
import { State } from "../pendingInvoices.state";

export const getPendingInvoiceState = createFeatureSelector<State>(
    "pendingInvoices"
);

export const getPendingInvoicesList = createSelector(
    getPendingInvoiceState,
    (state: State) => state.pendingInvoicesList
);

export const getInvoiceCheckBoxes = createSelector(
    getPendingInvoiceState,
    (state: State) => state.invoiceCheckboxes
);

export const getLineItemCheckBoxes = createSelector(
    getPendingInvoiceState,
    (state: State) => state.lineItemCheckboxes
);

export const getInvoiceFilters = createSelector(
    getPendingInvoiceState,
    (state: State) => state.invoiceFilters
);

export const getLineItemFilters = createSelector(
    getPendingInvoiceState,
    (state: State) => state.lineItemFilters
);

export const getPendingInvoiceCount = createSelector(
    getPendingInvoiceState,
    (state: State) => state.totalPendingInvoiceCount
);

export const getPendingLineItemCount = createSelector(
    getPendingInvoiceState,
    (state: State) => state.totalLineItemCount
);

export const getSelectAll = createSelector(
    getPendingInvoiceState,
    (state: State) => state.pendingSelectAll
);

export const lineItemSelectAll = createSelector(
    getPendingInvoiceState,
    (state: State) => state.lineItemSelectAll
);

export const getLoadingState = createSelector(
    getPendingInvoiceState,
    (state: State) => state.loading
);

export const getSelectedInvoices = createSelector(
    getPendingInvoiceState,
    (state: State) => state.selectedInvoices
);

export const getDeselectedInvoices = createSelector(
    getPendingInvoiceState,
    (state: State) => state.deselectedInvoices
);

export const getLineItems = createSelector(
    getPendingInvoiceState,
    (state: State) => state.lineItems
);

export const paginatedLineItems = createSelector(
    getPendingInvoiceState,
    (state: State) => {
        const begin = (state.lineItemPage.pageIndex) * state.lineItemPage.pageSize;
        const end = begin + state.lineItemPage.pageSize;
        return state.lineItems.slice(begin, end);
    }
);


export const getSelectionChanged = createSelector(
    getPendingInvoiceState,
    (state: State) => state.invoiceSelectionChanged
);

export const getSummaryInvoices = createSelector(
    getPendingInvoiceState,
    (state: State) => state.summaryInvoices
);

export const getQuantityInvoiced = createSelector(
    getPendingInvoiceState,
    (state: State) => state.quantityInvoiced
);

export const getUnitPrice = createSelector(
    getPendingInvoiceState,
    (state: State) => state.unitPrice
);

export const getSelectedLineItems = createSelector(
    getPendingInvoiceState,
    (state: State) => state.selectedLineItems
);

export const getCompletedState = createSelector(
    getPendingInvoiceState,
    (state: State) => state.completed
);

export const getPhaseTwoComplete = createSelector(
    getPendingInvoiceState,
    (state: State) => Object.values(state.selectedLineItems).length && !state.quantityInvoicedError && !state.unitPriceError
);

export const getQuantityInvoicedError = createSelector(
    getPendingInvoiceState,
    (state: State) => state.quantityInvoicedError
);

export const getQuantityUnitPriceError = createSelector(
    getPendingInvoiceState,
    (state: State) => state.unitPriceError
);

export const getTotalPrice = createSelector(
    getPendingInvoiceState,
    (state: State) => Object.values(state.selectedLineItems).reduce((acc, curr) => {
        let quantityInvoiced: number;
        let actualUnitPrice: number;
        if (state.quantityInvoiced[curr.id] != undefined && !checkFalseNumber(state.quantityInvoiced[curr.id])) {
            quantityInvoiced = parseFloat(state.quantityInvoiced[curr.id]);
        } else {
            quantityInvoiced = curr.invoiceQuantity;
        }

        if (state.unitPrice[curr.id] != undefined && !checkFalseNumber(state.unitPrice[curr.id])) {
            actualUnitPrice = parseFloat(state.unitPrice[curr.id])
        } else {
            actualUnitPrice = curr.unitPrice;
        }
        return acc + actualUnitPrice * quantityInvoiced;
    }, 0)
);

export const getPhaseOneComplete = createSelector(
    getPendingInvoiceState,
    (state: State) => (state.pendingSelectAll && (state.totalPendingInvoiceCount > Object.values(state.deselectedInvoices).length) || !!Object.values(state.selectedInvoices).length)
);

export const checkFalseNumber = (number: string) => {
    return Number.isNaN(parseFloat(number));
}

