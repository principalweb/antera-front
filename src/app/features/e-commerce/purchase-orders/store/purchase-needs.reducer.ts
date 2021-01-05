import { State } from '../state/purchase-needs.state';
import { PurchaseNeed } from "../interface/interface";
import * as PurchaseNeedsActions from './purchase-needs.actions';
import { convertToSummaryNeeds } from "../util/converter";
import { state } from '@angular/animations';
const initState: State = {
  purchaseNeedsList: [],
  loading: false,
  filters: {
    name: "",
    vendor: "",
    description: "",
    customer: "",
  },
  fetchError: false,
  //meta: null,
  //secondMeta: null,
  selectedNeeds: [],
  selectedProductLevelNeeds: [],
  totalCountProducts: null,
  purchaseNeedsProductList: [],
  productListFilters: {
    customer: "",
    refSalesOrderNo: [],
    vendor: "",
    description: "",
    name: "",
    supplierProductId: "",
    inhouseId: "",
    color: "",
    size: "",
    inventory: "0",
  },
  productCheckBoxes: {},
  detailCheckBoxes: {},
  quantityOrdered: {},
  refresh: 0,
  cleanse: 0,
  differentQuantity: false,
  dialogLoading: false,
  purchaseOrdersGenerated: false,
  totalSum: "0.00",
  summaryNeeds: {},
  selectionChanged: true,
  sortSummaryTable: { active: "color", direction: "asc" },
  sortDetailTable: { active: "color", direction: "asc" },
  productPage: {
    pageIndex: 0,
    pageSize: 50,
    length: 50,
    previousPageIndex: 0,
  },
  summaryPage: {
    pageIndex: 0,
    pageSize: 50,
    length: 50,
    previousPageIndex: 0,
  },
  detailPage: {
    pageIndex: 0,
    pageSize: 50,
    length: 50,
    previousPageIndex: 0,
  },
  showInventory: false,
  summaryCount: 0,
  detailCount: 0,
  orderCost: {},
  orderCostError: false
};
export function purchaseNeedsReducer(state = initState, action: PurchaseNeedsActions.PurchaseNeedsActions){
    switch(action.type){
        case PurchaseNeedsActions.RECEIVE_PURCHASE_NEEDS: {
            
            const purchaseNeedsList = [...action.payload];
            
            return {
                ...state,
                loading: false,
                fetchError: false,
                purchaseNeedsList,
                detailCount: purchaseNeedsList.length
            }
        }
            
        case PurchaseNeedsActions.RECEIVE_PURCHASE_PRODUCT_NEEDS: {
            const purchaseNeedsProductList = [...action.payload];

            // Preserves selected product needs
            state.selectedProductLevelNeeds.forEach((selectedNeed: PurchaseNeed) => {
                if (purchaseNeedsProductList.findIndex((listPurchaseNeed: PurchaseNeed) => 
                (listPurchaseNeed.id === selectedNeed.id || listPurchaseNeed.productId === selectedNeed.productId)) === -1){
                    purchaseNeedsProductList.unshift(selectedNeed);
                }
            });
            
            const totalCountProducts = purchaseNeedsProductList.length;
            return {
                ...state,
                loading: false,
                fetchError: false,
                purchaseNeedsProductList,
                totalCountProducts,
                
            }
        }
        case PurchaseNeedsActions.DESELECT_PRODUCT_ID: {
            const selectedNeeds = state.selectedNeeds.filter((purchaseNeed: PurchaseNeed) => purchaseNeed.productId !== action.payload);
            const summaryNeeds = convertToSummaryNeeds(selectedNeeds, state.quantityOrdered, "deselect product Id");
            return {
                ...state,
                loading: false,
                fetchError: false,
                selectedNeeds,
                summaryNeeds,
                selectedProductLevelNeeds: state.selectedProductLevelNeeds
                .filter((purchaseNeed: PurchaseNeed) => purchaseNeed.productId !== action.payload)
            }
        }
        case PurchaseNeedsActions.DETAIL_SORT_EVENT: return {
            ...state,
            sortDetailTable: {...action.payload}
        }
        case PurchaseNeedsActions.PRODUCT_CHECKBOX: return {
            ...state,
            productCheckBoxes: {...state.productCheckBoxes, ...action.payload}
        }
        case PurchaseNeedsActions.DETAIL_CHECKBOX: return {
            ...state,
            detailCheckBoxes: { ...state.detailCheckBoxes, ...action.payload }
        }
        case PurchaseNeedsActions.EDIT_QUANTITY_ORDER: {
            return {
                ...state,
                quantityOrdered: {...state.quantityOrdered, ...action.payload}
            }
        }
        case PurchaseNeedsActions.EDIT_COST: {
            let orderCost = { ...state.orderCost, ...action.payload };
            const newCost = action.payload[action.purchaseNeed.id];
            const purchaseNeedsList = [...state.purchaseNeedsList];
            let orderCostError = false;
            
            const selectedNeeds: PurchaseNeed[] = [...state.selectedNeeds];

            for (let selectedNeed of selectedNeeds){
                if (orderCost[selectedNeed.id] != undefined && checkFalseNumber(orderCost[selectedNeed.id]) || orderCost[selectedNeed.id] === null){
                    orderCostError = true;
                    break;
                }
            }

            const costsChanged = {};

            purchaseNeedsList.forEach((purchaseNeed: PurchaseNeed) => {
                if (purchaseNeed.sku === action.purchaseNeed.sku){
                    costsChanged[purchaseNeed.id] = newCost;
                }
            });
            orderCost = { ...orderCost, ...costsChanged }
            
            const summaryNeeds = convertToSummaryNeeds(selectedNeeds, state.quantityOrdered, state.orderCost, "Edit Cost");
            return {
              ...state,
              orderCost,
              orderCostError,
              summaryNeeds,
            };
        }
        case PurchaseNeedsActions.RECEIVE_TOTAL_SUM: return {
            ...state,
            loading: false,
            totalSum: action.payload
        }
        // case PurchaseNeedsActions.PRODUCT_PAGE_EVENT: return {
        //     ...state,
        //     productPage: {...action.payload}
        // }
        case PurchaseNeedsActions.PRODUCT_PAGE_EVENT: return Object.assign({}, state, {
            productPage: { ...action.payload },
            purchaseNeedsProductList: [...state.purchaseNeedsProductList]
        })
        case PurchaseNeedsActions.SUMMARY_PAGE_EVENT: return Object.assign({}, state, {
            summaryPage: { ...action.payload },
            summaryNeeds: { ...state.summaryNeeds }
        })
        case PurchaseNeedsActions.DETAIL_PAGE_EVENT: return Object.assign({}, state, {
            detailPage: { ...action.payload },
            detailNeeds: [...state.purchaseNeedsList]
        })
        case PurchaseNeedsActions.SUMMARY_SORT_EVENT: return {
            ...state,
            sortSummaryTable: {...action.payload}
        }
        case PurchaseNeedsActions.SELECT_SINGLE_PRODUCT_LEVEL_NEED: {
            const newSelected = [...state.selectedProductLevelNeeds];
            if (newSelected.findIndex((need: PurchaseNeed) => need.productId === action.payload.productId) === -1){
                newSelected.push(action.payload);
            }
            return {
                ...state,
                selectedProductLevelNeeds: [...newSelected]
            }
        }

        case PurchaseNeedsActions.IS_DIFFERENT_QUANTITY: return {
            ...state,
            differentQuantity: action.payload
        }

        case PurchaseNeedsActions.RECEIVE_PURCHASE_NEEDS_AND_SELECTED_NEEDS: {
            const orderCost = {...state.orderCost};
            
            const purchaseNeedsList = [...action.payload];
            
            const previousNeeds = [...state.selectedNeeds];

            const newNeeds = [...action.payload];
            newNeeds.forEach((newNeed: PurchaseNeed) => {
                if (previousNeeds.findIndex((previousNeed: PurchaseNeed) => previousNeed.id === newNeed.id) === -1) {
                    previousNeeds.push(newNeed);
                } else {
                    const idx = previousNeeds.findIndex((previousNeed: PurchaseNeed) => previousNeed.id === newNeed.id);
                    previousNeeds[idx] = newNeed;
                }
            });
            const summaryNeeds = convertToSummaryNeeds(previousNeeds, state.quantityOrdered, orderCost);
            
            return {
                ...state,
                detailCheckBoxes: { ...state.detailCheckBoxes, ...action.checkboxes },
                selectedNeeds: [...previousNeeds],
                loading: false,
                fetchError: false,
                purchaseNeedsList,
                detailCount: purchaseNeedsList.length,
                summaryNeeds,
                summaryCount: Object.values(summaryNeeds).length
            }
        }

        case PurchaseNeedsActions.SELECT_MULTIPLE_NEEDS: {
            const previousNeeds = [...state.selectedNeeds];
            const newNeeds = [...action.payload];
            const orderCost = {...state.orderCost };
            let orderCostError = false;
            newNeeds.forEach((newNeed: PurchaseNeed) => {
                if (previousNeeds.findIndex((previousNeed: PurchaseNeed) => previousNeed.id === newNeed.id) === -1){
                    previousNeeds.push(newNeed);
                } else {
                    const idx = previousNeeds.findIndex((previousNeed: PurchaseNeed) => previousNeed.id === newNeed.id);
                    previousNeeds[idx] = newNeed;
                }
            });
            for (let selectedNeed of previousNeeds){
                if (orderCost[selectedNeed.id] != undefined && checkFalseNumber(orderCost[selectedNeed.id]) || orderCost[selectedNeed.id] === null){
                    orderCostError = true;
                    break;
                }
            }
            const summaryNeeds = convertToSummaryNeeds(previousNeeds, state.quantityOrdered, orderCost);
            
            return {
                ...state,
                selectedNeeds: [...previousNeeds],
                summaryNeeds,
                orderCostError,
                summaryCount: Object.values(summaryNeeds).length
            }
        }

        case PurchaseNeedsActions.DESELECT_MULTIPLE_PRODUCT_LEVEL_NEED: {
            const detailCheckBoxes = {...state.detailCheckBoxes};
            for (let key in detailCheckBoxes){
                detailCheckBoxes[key] = false;
            }

            const productCheckBoxes = {...state.productCheckBoxes};
            for (let key in productCheckBoxes){
                productCheckBoxes[key] = false;
            }
            
            return {
                ...state,
                selectedNeeds: [],
                orderCostError: false,
                summaryNeeds: {},
                summaryCount: 0,
                selectedProductLevelNeeds: [],
                detailCheckBoxes: {...state.detailCheckBoxes, ...detailCheckBoxes},
                productCheckBoxes: {...state.productCheckBoxes, ...productCheckBoxes},
                loading: false,
                detailCount: 0
            }
        }

        case PurchaseNeedsActions.All_DETAIL_CHEXBOXES_FALSE: {
            const newStateDetailBox = {...state.detailCheckBoxes};
            for (let key in newStateDetailBox){
                newStateDetailBox[key] = false;
            }
            return {
                ...state,
                detailCheckBoxes: newStateDetailBox
            }
        }

        case PurchaseNeedsActions.NEW_PRICE: {
           return {
               ...state
           }

        }

        case PurchaseNeedsActions.SELECT_FROM_FILTERED: {
            const selectedNeeds = [...state.purchaseNeedsList];
            const orderCost = { ...state.orderCost };
            let orderCostError = false;
            for (let selectedNeed of selectedNeeds){
                if (orderCost[selectedNeed.id] != undefined && checkFalseNumber(orderCost[selectedNeed.id]) || orderCost[selectedNeed.id] === null){
                    orderCostError = true;
                    break;
                }
            }
            const summaryNeeds = convertToSummaryNeeds(selectedNeeds, state.quantityOrdered, orderCost);
            return {
                ...state,
                selectedNeeds,
                orderCostError,
                summaryNeeds,
                summaryCount: Object.values(summaryNeeds).length
            }
        }

        case PurchaseNeedsActions.SELECTION_CHANGED: {
            return {
                ...state,
                selectionChanged: action.payload
            }
        }
        case PurchaseNeedsActions.SELECT_MULTIPLE_PRODUCT_LEVEL_NEED: {
            const productCheckBoxes = {}
            action.payload.forEach((purchaseNeed: PurchaseNeed) => productCheckBoxes[purchaseNeed.productId] = true)
            return {
                ...state,
                productCheckBoxes: {...state.productCheckBoxes, ...productCheckBoxes},
                selectedProductLevelNeeds: [...action.payload]
            }
        }

        case PurchaseNeedsActions.DESELECT_SINGLE_PRODUCT_LEVEL_NEED: return {
            ...state,
            selectedProductLevelNeeds: state.selectedProductLevelNeeds
            .filter((levelNeed: PurchaseNeed) => levelNeed.id !== action.payload.id)
        }


        case PurchaseNeedsActions.PURCHASE_ORDER_GENERATED_CONFIRMATION: return {
            ...state,
            purchaseOrdersGenerated: action.payload,
            loading: false,
            fetchError: false,
            dialogLoading: false
        }

        case PurchaseNeedsActions.SET_INIT_STATE: return initState;

        case PurchaseNeedsActions.FETCH_ERROR: return {
            ...state, loading: false, fetchError: true
        }
        case PurchaseNeedsActions.CLEAR_FETCH_ERROR: return {
            ...state, fetchError: false
        }
        case PurchaseNeedsActions.IS_LOADING: return {
            ...state, loading: action.payload
        }
        case PurchaseNeedsActions.DIALOG_IS_LOADING: return {
            ...state, dialogLoading: action.payload
        }
        case PurchaseNeedsActions.DESELECT_MULTIPLE_NEEDS: return {
            ...state,
            selectedNeeds: [],
            orderCostError: false,
            summaryNeeds: {},
            selectionChanged: true,
            summaryCount: 0
        }
        case PurchaseNeedsActions.SELECT_SINGLE_NEED: {
            const selectedNeeds = [...state.selectedNeeds];
            const orderCost = {...state.orderCost};
            let orderCostError = false;
            let count: number = 0;
            selectedNeeds.forEach((selectedNeed: PurchaseNeed, i: number) => {
                if (selectedNeed.id === action.payload.id){
                    selectedNeeds[i] = action.payload;
                    count++;
                }
            });
            if (count === 0) selectedNeeds.push(action.payload);
            for (let selectedNeed of selectedNeeds){
                if (orderCost[selectedNeed.id] != undefined && checkFalseNumber(orderCost[selectedNeed.id]) || orderCost[selectedNeed.id] === null){
                    orderCostError = true;
                    break;
                }
            }
            const summaryNeeds = convertToSummaryNeeds(selectedNeeds, state.quantityOrdered, orderCost);
            return {
              ...state,
              selectedNeeds: [...selectedNeeds],
              summaryNeeds,
              orderCostError,
              summaryCount: Object.values(summaryNeeds).length
            };
        }
        case PurchaseNeedsActions.DESELECT_SINGLE_NEED: {
            const selectedNeeds = state.selectedNeeds.filter(need => need.id !== action.payload);
            const orderCost = {...state.orderCost};
            let orderCostError = false;

            for (let selectedNeed of selectedNeeds){
                if (orderCost[selectedNeed.id] != undefined && checkFalseNumber(orderCost[selectedNeed.id]) || orderCost[selectedNeed.id] === null){
                    orderCostError = true;
                    break;
                }
            }
            const summaryNeeds = convertToSummaryNeeds(selectedNeeds, state.quantityOrdered, orderCost);
            return {
                ...state,
                selectedNeeds,
                orderCostError,
                summaryNeeds,
                summaryCount: Object.values(summaryNeeds).length
            }
        }
        case PurchaseNeedsActions.ADD_MULTI_SELECT_ORDER_NUMBER_FILTER: return {
            ...state,
            productListFilters: {
                ...state.productListFilters,
                refSalesOrderNo: [...action.payload]
            }
        }
        case PurchaseNeedsActions.REMOVE_MULTI_SELECT_ORDER_NUMBER_FILTER: {
            return {
                ...state,
                productListFilters: {
                    ...state.productListFilters,
                    refSalesOrderNo: state.productListFilters.refSalesOrderNo.filter(orderNumbers => orderNumbers != action.payload)
                }
            }
        }
        case PurchaseNeedsActions.ADD_SINGLE_ORDER_NUMBER_FILTER: 
            return {
                ...state,
                productListFilters: {
                    ...state.productListFilters,
                    refSalesOrderNo: state.productListFilters.refSalesOrderNo.concat(action.payload)
                }
            }
        case PurchaseNeedsActions.DESELECT_ALL_NEEDS_BY_PRODUCT: {
            const selectedNeeds = state.selectedNeeds.filter(need => need.productId !== action.payload);
            const orderCost = {...state.orderCost};
            let orderCostError = false;
            for (let selectedNeed of selectedNeeds){
                if (orderCost[selectedNeed.id] != undefined && checkFalseNumber(orderCost[selectedNeed.id]) || orderCost[selectedNeed.id] === null){
                    orderCostError = true;
                    break;
                }
            }
            const summaryNeeds = convertToSummaryNeeds(selectedNeeds, state.quantityOrdered, orderCost);
            return {
                ...state,
                selectedNeeds,
                summaryNeeds,
                orderCostError,
                summaryCount: Object.values(summaryNeeds).length
            }
        }
        case PurchaseNeedsActions.DESELECT_SPECIFIC_NEEDS: {
            const toBeDeselected = [...action.payload];
            const oldSelected = [...state.selectedNeeds];
            const orderCost = {...state.orderCost};
            let orderCostError = false;
            const selectedNeeds = oldSelected.filter((selectedNeed: PurchaseNeed) => !toBeDeselected.includes(selectedNeed.id));
            for (let selectedNeed of selectedNeeds){
                if (orderCost[selectedNeed.id] != undefined && checkFalseNumber(orderCost[selectedNeed.id]) || orderCost[selectedNeed.id] === null){
                    orderCostError = true;
                    break;
                }
            }
            const summaryNeeds = convertToSummaryNeeds(selectedNeeds, state.quantityOrdered, orderCost);
            return {
                ...state,
                selectedNeeds,
                orderCostError,
                summaryNeeds,
                summaryCount: Object.values(summaryNeeds).length
            }
        }
        case PurchaseNeedsActions.TRACK_PRODUCT_NEED_FILTERS: return {
            ...state,
            productListFilters: {
                ...state.productListFilters, ...action.payload
            }
        }
        case PurchaseNeedsActions.TRACK_FILTERS:
            return Object.assign({}, state, {
                filters: {
                    ...state.filters, ...action.payload
                },
                summaryNeeds: { ...state.summaryNeeds }
            }) 
        case PurchaseNeedsActions.UPDATE_SUMMARY_NEED_COUNT: return {
            ...state,
            summaryCount: action.payload
        }
        case PurchaseNeedsActions.REFRESH_LIST: {
            const refresh = state.refresh + 1;
            return {
                    ...state,
                    loading: false,
                    refresh
            }
        }
        case PurchaseNeedsActions.CLEANSE_FORM: {
            const selectedNeeds = [...state.selectedNeeds];
            const orderCost = {...state.orderCost};
            let orderCostError = false;
            for (let selectedNeed of selectedNeeds){
                if (orderCost[selectedNeed.id] != undefined && checkFalseNumber(orderCost[selectedNeed.id]) || orderCost[selectedNeed.id] === null){
                    orderCostError = true;
                    break;
                }
            }
            const summaryNeeds = convertToSummaryNeeds(selectedNeeds, state.quantityOrdered, orderCost)
            const cleanse = state.cleanse + 1;
            return {
                ...state,
                orderCostError,
                cleanse,
                differentQuantity: false,
                summaryNeeds
            }
        }
        case PurchaseNeedsActions.SHOW_INVENTORY: return {
            ...state,
            showInventory: action.payload,
            productListFilters: {
                ...state.productListFilters,
                inventory: action.payload ? "1" : "0"
            }
        }
        default:
            return state;
    }
}

export const checkFalseNumber = (number: string) => {
  return Number.isNaN(parseFloat(number));
};
