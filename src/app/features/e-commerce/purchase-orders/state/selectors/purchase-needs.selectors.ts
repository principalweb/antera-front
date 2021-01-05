import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State } from "../purchase-needs.state";
export const getPurchaseNeedState = createFeatureSelector<State>("purchaseNeeds");

export const getPurchaseNeedsList = createSelector(
    getPurchaseNeedState,
    (state: State) => state.purchaseNeedsList
);

export const getSlicedPurchaseNeedsList = createSelector(
    getPurchaseNeedState,
    (state: State) => {
        // const begin = ((pageIndex + 1) - 1) * pageSize;
        // const end = begin + pageSize;
        const begin = ((state.detailPage.pageIndex + 1) - 1) * state.detailPage.pageSize;
        const end = begin + state.detailPage.pageSize;
        return state.purchaseNeedsList.slice(begin, end);
    }
);


export const getPurchaseNeedsProductList = createSelector(
    getPurchaseNeedState,
    (state: State) => state.purchaseNeedsProductList
);

export const getQuantityOrdered = createSelector(
    getPurchaseNeedState,
    (state: State) => state.quantityOrdered
);

export const getDetailChexboxes = createSelector(
    getPurchaseNeedState,
    (state: State) => state.detailCheckBoxes
);

export const getProductChexboxes = createSelector(
    getPurchaseNeedState,
    (state: State) => state.productCheckBoxes
);

export const getLoadingState = createSelector(
    getPurchaseNeedState,
    (state: State) => state.loading
);

export const getRefreshState = createSelector(
    getPurchaseNeedState,
    (state: State) => state.refresh
);

export const getTotalSum = createSelector(
    getPurchaseNeedState,
    (state: State) => state.totalSum
);

export const getFilterState = createSelector(
    getPurchaseNeedState,
    (state: State) => state.filters
);

export const getCleanseState = createSelector(
    getPurchaseNeedState,
    (state: State) => state.cleanse
);

export const getProductFilterState = createSelector(
    getPurchaseNeedState,
    (state: State) => state.productListFilters
);

export const getSelectedProducts = createSelector(
    getPurchaseNeedState,
    (state: State) => state.selectedProductLevelNeeds
);

export const getSummaryNeeds = createSelector(
    getPurchaseNeedState,
    (state: State) => Object.values(state.summaryNeeds)
);

export const getOrderCost = createSelector(
  getPurchaseNeedState,
  (state: State) => state.orderCost
);



export const getOrderCostError = createSelector(
  getPurchaseNeedState,
  (state: State) => state.orderCostError
);

export const getTotalCost = createSelector(
    getPurchaseNeedState,
    (state: State) => state.selectedNeeds.reduce((acc, curr) => {
        let quantityOrdered;
        let orderCost;
        if (
            state.quantityOrdered[curr.id] &&
            state.quantityOrdered[curr.id].quantity
        ) {
            quantityOrdered = parseFloat(state.quantityOrdered[curr.id].quantity);
        } else {
            quantityOrdered = curr.quantityOrdered;
        }

        if (state.orderCost[curr.id] != undefined 
            && !checkFalseNumber(state.orderCost[curr.id]) && state.orderCost[curr.id] != null){
            orderCost = parseFloat(state.orderCost[curr.id]);
            } else {
                orderCost = curr.actualUnitCost;
            }

        return acc + orderCost * quantityOrdered;
    }, 0)
);



// export const getMetaState = createSelector(
//     getPurchaseNeedState,
//     (state: State) => state.meta
// );

export const getSelectedNeedSate = createSelector(
    getPurchaseNeedState,
    (state: State) => state.selectedNeeds
);

export const getSelectedNeedsAndSummaryNeedsUpdate = createSelector(
    getPurchaseNeedState,
    (state: State) => [state.selectedNeeds, state.summaryNeeds]
);

export const getTotalCount = createSelector(
    getPurchaseNeedState,
    (state: State) => state.totalCountProducts
);

export const getIsDifferentQuantity = createSelector(
  getPurchaseNeedState,
  (state: State) => state.differentQuantity
);

export const getConfirmation = createSelector(
  getPurchaseNeedState,
  (state: State) => state.purchaseOrdersGenerated
);

export const getDialogLoadingState = createSelector(
  getPurchaseNeedState,
  (state: State) => state.dialogLoading
);

export const getFetchError = createSelector(
    getPurchaseNeedState,
    (state: State) => state.fetchError
);

export const getSelectionChanged = createSelector(
    getPurchaseNeedState,
    (state: State) => state.selectionChanged
);

export const getSummaryTableSort = createSelector(
    getPurchaseNeedState,
    (state: State) => state.sortSummaryTable
);

export const getProductPage = createSelector(
    getPurchaseNeedState,
    (state: State) => state.productPage
);

export const getSummaryPage = createSelector(
    getPurchaseNeedState,
    (state: State) => state.summaryPage
);

export const getDetailPage = createSelector(
    getPurchaseNeedState,
    (state: State) => state.detailPage
);

export const getDetailSortState = createSelector(
    getPurchaseNeedState,
    (state: State) => state.sortDetailTable
);

export const getShowInventoryState = createSelector(
    getPurchaseNeedState,
    (state: State) => state.showInventory
);

export const getDetailCount = createSelector(
    getPurchaseNeedState,
    (state: State) => state.detailCount
);

export const getSummaryCount = createSelector(
    getPurchaseNeedState,
    (state: State) => state.summaryCount
);

export const checkFalseNumber = (number: string) => {
  return Number.isNaN(parseFloat(number));
};



