import { State } from "../state/purchase-orders.state";
//import { RECEIVE_PURCHASE_ORDERS, CREATE_PURCHASE_ORDER } from './purchase-orders.actions';
import * as PurchaseOrderActions from "./purchase-orders.actions";
import merge from 'lodash/merge';

const initState : State = {
    filters: {
        label: "",
        number: "",
        vendor: "",
        //status: [],
        status:"",
        hidden: "0"
    },
    purchaseOrderList: [],
    selectedPurchaseOrder: null,
    loading: false,
    fetchError: false,
    meta: null
}
export function purchaseOrderReducer(state = initState, action : PurchaseOrderActions.PurchaseOrderActions) {
    switch(action.type){
        case PurchaseOrderActions.RECEIVE_PURCHASE_ORDERS: return {
            ...state,
            loading: false,
            purchaseOrderList: [...action.payload]
        }
        case PurchaseOrderActions.CREATE_PURCHASE_ORDER: return {
            ...state,
            purchaseOrderList: [...state.purchaseOrderList, action.payload]
        }
        case PurchaseOrderActions.SET_INITIAL_PURCHASE_ORDERS: return {
            ...state, ...action.payload
        }
        case PurchaseOrderActions.FETCH_ERROR: return {
            ...state, loading: false, fetchError: true
        }
        case PurchaseOrderActions.CLEAR_FETCH_ERROR: return {
            ...state, fetchError: false
        }
        case PurchaseOrderActions.IS_LOADING: return {
            ...state, loading: action.payload
        }
        case PurchaseOrderActions.TRACK_FILTERS: 
        return {
            ...state, 
            filters: {
                ...state.filters, ...action.payload
            }
        }
        case PurchaseOrderActions.UPDATE_STATUS_FILTER: 
        return {
            ...state,
            filters: {
                ...state.filters,
                ...action.payload
            }
        }
        case PurchaseOrderActions.UPDATE_HIDDEN: return {
            ...state,
            filters: {
                ...state.filters,
                ...action.payload
            }
        }
        case PurchaseOrderActions.UPDATE_META:
            return {
                ...state,
                meta: { ...action.payload}
            }
        case PurchaseOrderActions.RECEIVE_SELECTED_PURCHASE_ORDER: 
        return {
            ...state,
            selectedPurchaseOrder: action.payload,
            loading: false
        }
        default: 
        return state;
    }
}