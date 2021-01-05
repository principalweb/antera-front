import { State } from "../state/pendingInvoices.state";
import * as PendingInvoiceActions from "./pendingInvoices.actions";
import { IInvoice, ILineItem } from '../interface/interface';
const initState: State = {
    pendingInvoicesList: [],
    loading: false,
    lineItemFilters: {
        customer: "",
        invoiceNo: ""
    },
    invoiceFilters: {
        label: "",
        status: "",
        customer: "",
        number: ""
    },
    fetchError: false,
    selectedInvoices: {},
    selectedLineItems: {},
    invoiceCheckboxes: {},
    lineItemCheckboxes: {},
    showBooked: false,
    lineItems: [],
    totalPendingInvoiceCount: 0,
    pendingSelectAll: false,
    lineItemSelectAll: false,
    deselectedInvoices: {},
    totalLineItemCount: 0,
    lineItemPage: {
        pageIndex: 0,
        pageSize: 50,
        length: 50,
        previousPageIndex: 0
    },
    invoiceSelectionChanged: true,
    summaryInvoices: [],
    quantityInvoiced: {},
    unitPrice: {},
    completed: false,
    quantityInvoicedError: false,
    unitPriceError: false
};
export function PendingInvoicesReducer(state = initState, action: PendingInvoiceActions.PendingInvoiceActions) {
    switch (action.type) {
        case PendingInvoiceActions.RECEIVE_PENDING_INVOICES: {
            const totalPendingInvoiceCount = action.totalCount;
             const newInvoices = [...action.payload];
             const selectedInvoices = { ...state.selectedInvoices };
             const deselected: { [key: string]: IInvoice } = { ...state.deselectedInvoices };
             const invoiceCheckboxes = {};
             if (state.pendingSelectAll){
                 newInvoices.forEach((newInvoice: IInvoice) => {
                     if (selectedInvoices[newInvoice.id]) selectedInvoices[newInvoice.id] = newInvoice;
                     if (deselected[newInvoice.id]){
                         invoiceCheckboxes[newInvoice.id] = false;
                     } else {
                         invoiceCheckboxes[newInvoice.id] = true;
                     }
                 });
             } else {
                 newInvoices.forEach((newInvoice: IInvoice) => {
                     invoiceCheckboxes[newInvoice.id] = false;
                 });
             }
             
            return {
                ...state,
                loading: false,
                fetchError: false,
                pendingInvoicesList: [...action.payload],
                totalPendingInvoiceCount,
                invoiceCheckboxes,
                selectedInvoices
            }
        }
        case PendingInvoiceActions.RECEIVE_LINE_ITEMS: {
            const totalLineItemCount = action.totalCount;
            const newLineItems = [...action.payload];
            const selectedLineItems = { ...state.selectedLineItems };
            const lineItemCheckboxes = {};
            
                newLineItems.forEach((newLineItem: ILineItem) => {
                    selectedLineItems[newLineItem.id] = newLineItem;
                    lineItemCheckboxes[newLineItem.id] = true;
                });
                return {
                ...state,
                loading: false,
                fetchError: false,
                totalLineItemCount,
                lineItems: [...action.payload],
                lineItemCheckboxes,
                selectedLineItems,
                lineItemSelectAll: true
            }
        }
        case PendingInvoiceActions.TRACK_INVOICE_FILTERS: {
            return {
                ...state,
                invoiceFilters: { ...state.invoiceFilters, ...action.payload }
            }
        }
        case PendingInvoiceActions.TRACK_LINE_ITEM_FILTERS: {
            return {
                ...state,
                lineItemFilters: { ...state.lineItemFilters, ...action.payload }
            }
        }
        case PendingInvoiceActions.IS_LOADING: {
            return {
                ...state,
                loading: action.payload
            }
        }
        case PendingInvoiceActions.RECEIVE_SUMMARY_INVOICES: {
            return {
                ...state,
                loading: false,
                fetchError: false,
                summaryInvoices: [...action.payload]
            }
        }
        case PendingInvoiceActions.FETCH_ERROR: return {
            ...state,
            fetchError: true,
            loading: false
        }
        case PendingInvoiceActions.PENDING_INVOICE_SELECT_ALL: {
            const pendingInvoices = [...state.pendingInvoicesList];
            const invoiceCheckboxes = {};
            pendingInvoices.forEach((pendingInvoice: IInvoice) => {
                invoiceCheckboxes[pendingInvoice.id] = action.payload;
            });
            return {
            ...state,
            pendingSelectAll: action.payload,
            invoiceCheckboxes: { ...state.invoiceCheckboxes, ...invoiceCheckboxes },
            invoiceSelectionChanged: true
        }
        }

        case PendingInvoiceActions.LINE_ITEM_SELECT_ALL: {
            const lineItems = [...state.lineItems];
            const lineItemCheckboxes = {};
            const selectedLineItems = {};
            lineItems.forEach((lineItem: ILineItem) => {
                lineItemCheckboxes[lineItem.id] = action.payload;
                if (action.payload) selectedLineItems[lineItem.id] = selectedLineItems;
            });
            return {
                ...state,
                lineItemSelectAll: action.payload,
                lineItemCheckboxes: { ...state.lineItemCheckboxes, ...lineItemCheckboxes },
                selectedLineItems
            }
        }
        case PendingInvoiceActions.SELECT_PENDING_INVOICE: {
            const oldselectedInvoices = { ...state.selectedInvoices };
            const oldDeselectedInvoices = {...state.deselectedInvoices }
            let deselectedInvoices = {};
            let selectedInvoices = {};
            if (!action.selected) {
                
                delete oldselectedInvoices[action.payload.id];
                selectedInvoices = oldselectedInvoices;
                deselectedInvoices = { ...state.deselectedInvoices, [action.payload.id]: action.payload }
            } else {
               
                selectedInvoices = { ...state.selectedInvoices, [action.payload.id]: action.payload }
                if (oldDeselectedInvoices[action.payload.id]){
                    delete oldDeselectedInvoices[action.payload.id];
                    deselectedInvoices = oldselectedInvoices;
                }
            }

            return {
                ...state,
                selectedInvoices,
                invoiceCheckboxes: { ...state.invoiceCheckboxes, [action.payload.id]: action.selected },
                invoiceSelectionChanged: true,
                deselectedInvoices
            }
        }
        case PendingInvoiceActions.SELECT_LINE_ITEM: {
            const oldselectedLineItems = { ...state.selectedLineItems };
            const quantityInvoiced = { ...state.quantityInvoiced };
            const unitPrice = { ...state.unitPrice };
            let selectedLineItems = {};
            let lineItemSelectAll = state.lineItemSelectAll;
            let quantityInvoicedError = false;
            let unitPriceError = false;
            if (!action.selected) {
                delete oldselectedLineItems[action.payload.id];
                selectedLineItems = oldselectedLineItems;
                lineItemSelectAll = false;
                for (let key in quantityInvoiced){
                    if (selectedLineItems[key] != undefined && checkFalseNumber(quantityInvoiced[key]) || selectedLineItems[key] != undefined && selectedLineItems[key].orderedQuantity < parseFloat(quantityInvoiced[key])){
                        quantityInvoicedError = true;
                    }
                }
                for (let key in unitPrice){
                    if (selectedLineItems[key] != undefined && checkFalseNumber(unitPrice[key])){
                        unitPriceError = true;
                    }
                }
            } else {
                selectedLineItems = { ...state.selectedLineItems, [action.payload.id]: action.payload }
                for (let key in quantityInvoiced) {
                    if (selectedLineItems[key] != undefined && checkFalseNumber(quantityInvoiced[key]) || selectedLineItems[key] != undefined && selectedLineItems[key].orderedQuantity < parseFloat(quantityInvoiced[key])) {
                        quantityInvoicedError = true;
                    }
                }
                for (let key in unitPrice) {
                    if (selectedLineItems[key] != undefined && checkFalseNumber(unitPrice[key])) {
                        unitPriceError = true;
                    }
                }
            }

            return {
                ...state,
                selectedLineItems,
                lineItemSelectAll,
                lineItemCheckboxes: { ...state.lineItemCheckboxes, [action.payload.id]: action.selected },
                unitPriceError,
                quantityInvoicedError
            }
        }
        case PendingInvoiceActions.COMPLETE_INVOICES: return {
            ...state,
            completed: true
        }
        case PendingInvoiceActions.QUANTITY_INVOICED_ERROR: return {
            ...state,
            quantityInvoicedError: action.payload
        }
        case PendingInvoiceActions.UNIT_PRICE_ERROR: return {
            ...state,
            unitPriceError: action.payload
        }
        case PendingInvoiceActions.RESET_STATE: return initState;
        case PendingInvoiceActions.EDIT_AMOUNT: return {
            ...state,
            quantityInvoiced: {...state.quantityInvoiced, ...action.payload }
        }
        case PendingInvoiceActions.EDIT_PRICE: return {
            ...state,
            unitPrice: { ...state.unitPrice, ...action.payload }
        }
        case PendingInvoiceActions.LINE_ITEM_PAGE_EVENT: return {
            ...state,
            lineItemPage: { ...action.payload }
        }
        case PendingInvoiceActions.CLEAR_DESELECTED: return {
            ...state,
            deselectedInvoices: {}
        }
        case PendingInvoiceActions.CLEAR_SELECTED: return {
            ...state,
            selectedInvoices: {}
        }
        case PendingInvoiceActions.CLEAR_LINE_ITEM_DESELECTED: return {
            ...state,
            deselectedLineItems: {}
        }
        case PendingInvoiceActions.CLEAR_LINE_ITEM_SELECTED: return {
            ...state,
            selectedLineItems: {}
        }
        case PendingInvoiceActions.INVOICE_SELECTION_CHANGED: return {
            ...state,
            invoiceSelectionChanged: action.payload
        }
        default: return state;
    }
}

const checkFalseNumber = (number: string) => {
    return Number.isNaN(parseFloat(number));
}