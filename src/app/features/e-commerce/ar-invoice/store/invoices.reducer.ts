import { State } from "../state/invoices.state";
import * as InvoiceActions from "../store/invoices.actions";

const initState: State = {
    filters: {
        status: "",
        label: "",
        customer: ""
    },
    invoiceList: [],
    selectedInvoice: null,
    loading: false,
    fetchError: false,
    meta: null
}

export function InvoiceReducer(state = initState, action: InvoiceActions.InvoiceActions){
    switch(action.type){
        case InvoiceActions.RECEIVE_FINAL_INVOICES: return {
            ...state,
            loading: false,
            fetchError: false,
            invoiceList: [...action.payload]
        }
        case InvoiceActions.SET_INITIAL_STATE: return {
            ...state,
            ...action.payload
        }
        case InvoiceActions.TRACK_FILTERS: return {
            ...state,
            filters: {
                ...state.filters,
                ...action.payload
            }
        }
        case InvoiceActions.IS_LOADING: return {
            ...state,
            loading: action.payload
        }
        case InvoiceActions.RECEIVE_SELECTED_INVOICE: return {
            ...state,
            loading: false,
            fetchError: false,
            selectedInvoice: action.payload
        }
        case InvoiceActions.FETCH_ERROR: return {
            ...state,
            loading: false,
            fetchError: true
        }
        default:
            return state;
    }
}