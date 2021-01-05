import { PurchaseNeed } from '../interface/interface';
import { IEditQuantity } from '../store/purchase-needs.actions';
import { SummaryNeed } from '../state/purchase-needs.state';
export const convertToSummaryNeeds = (purchaseNeeds: PurchaseNeed[], quantityOrderd: { [key: number]: IEditQuantity } = null, orderCost: {[key: number]: string}, action?: string) => {
    const summaryNeeds = {};
    purchaseNeeds.forEach((purchaseNeed: PurchaseNeed) => {
        if (!summaryNeeds[purchaseNeed.sku]){
            summaryNeeds[purchaseNeed.sku] = {
                sku: purchaseNeed.sku,
                combinedQuantityNeeded: purchaseNeed.quantityNeeded,
                combinedQuantityOrdered: quantityOrderd && quantityOrderd[purchaseNeed.id] ? parseInt(quantityOrderd[purchaseNeed.id].quantity) : purchaseNeed.quantityOrdered,
                purchaseNeeds: [purchaseNeed],
                attribute: purchaseNeed.description,
                color: purchaseNeed.color,
                rank: purchaseNeed.rank,
                size: purchaseNeed.size,
                name: purchaseNeed.name,
                //multipleCosts: false,
                item: purchaseNeed.supplierProductId,
                actualCost: orderCost[purchaseNeed.id] != undefined && 
                !checkFalseNumber(orderCost[purchaseNeed.id]) && orderCost[purchaseNeed.id] != null ? parseFloat(orderCost[purchaseNeed.id]) : purchaseNeed.actualUnitCost,
                customer: purchaseNeed.customer ? [purchaseNeed.customer] : [],
                vendor: purchaseNeed.vendor ? [purchaseNeed.vendor] : [],
                refSalesOrderNo: purchaseNeed.refSalesOrderNo ? [purchaseNeed.refSalesOrderNo] : []
            }
        } else {
            summaryNeeds[purchaseNeed.sku].combinedQuantityNeeded += purchaseNeed.quantityNeeded;
            summaryNeeds[purchaseNeed.sku].combinedQuantityOrdered += quantityOrderd && quantityOrderd[purchaseNeed.id] ? parseInt(quantityOrderd[purchaseNeed.id].quantity) : purchaseNeed.quantityOrdered;
            summaryNeeds[purchaseNeed.sku].purchaseNeeds.push(purchaseNeed);
            if (purchaseNeed.customer) summaryNeeds[purchaseNeed.sku].customer.push(purchaseNeed.customer);
            if (purchaseNeed.vendor) summaryNeeds[purchaseNeed.sku].vendor.push(purchaseNeed.vendor);
            if (summaryNeeds[purchaseNeed.sku].rank < purchaseNeed.rank) summaryNeeds[purchaseNeed.sku].rank = purchaseNeed.rank;
            if (!summaryNeeds[purchaseNeed.sku].refSalesOrderNo.includes(purchaseNeed.refSalesOrderNo)) summaryNeeds[purchaseNeed.sku].refSalesOrderNo.push(purchaseNeed.refSalesOrderNo);
            // if ((orderCost[purchaseNeed.id] != undefined &&
            //     !checkFalseNumber(orderCost[purchaseNeed.id]) && orderCost[purchaseNeed.id] != null && parseFloat(orderCost[purchaseNeed.id]) != summaryNeeds[purchaseNeed.sku].actualCost) || (orderCost[purchaseNeed.id] == undefined ||
            //         checkFalseNumber(orderCost[purchaseNeed.id]) || orderCost[purchaseNeed.id] == null) && purchaseNeed.actualUnitCost != summaryNeeds[purchaseNeed.sku].actualCost){
            //         console.log("MULTIPLE COSTS");
            //     summaryNeeds[purchaseNeed.sku].multipleCosts = true;
            //     } 
        }
    });
    return summaryNeeds;
}

export const editSummaryNeed = (purchaseNeed: PurchaseNeed, 
    summaryNeeds: {[key: string]: SummaryNeed}, quantityOrdered: {[key: number]: IEditQuantity}): {[key: string]: SummaryNeed} => {
    const summaryNeedsCopy = {...summaryNeeds};
    const summaryNeed: SummaryNeed = summaryNeedsCopy[purchaseNeed.sku];
    let newCombinedQuantityOrdered = 0;
    summaryNeed.purchaseNeeds.forEach((elementNeed: PurchaseNeed) => {
       newCombinedQuantityOrdered +=  quantityOrdered[purchaseNeed.id] ? 
       parseInt(quantityOrdered[purchaseNeed.id].quantity) : purchaseNeed.quantityOrdered
    });
    summaryNeed.combinedQuantityOrdered = newCombinedQuantityOrdered;
    const newKeyPair = {
        [summaryNeed.sku]: summaryNeed
    };
    const finalSummaryNeeds = {...summaryNeedsCopy, ...newKeyPair};
    return finalSummaryNeeds;
}

export const checkFalseNumber = (number: string) => {
  return Number.isNaN(parseFloat(number));
};