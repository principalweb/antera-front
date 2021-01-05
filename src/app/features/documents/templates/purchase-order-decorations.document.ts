import { OrderDetails, LineItem, AdditionalCharge } from 'app/models';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';
import { Observable } from 'rxjs';
import { DocumentImageManager } from '../document-image-manager';
import { IDocument, AbstractOrderDocument } from '../document.interface';
import { IDecoVendor } from 'app/features/e-commerce/order-form/interfaces';
import { InvoiceDocument } from './invoice.document';

export class PurchaseOrderDecorationsDocument extends InvoiceDocument {

    name = 'purchase-order-decorations';

    imageManager: DocumentImageManager;
    fromCurrencyCode = 'USD';
    fromCurrencySymbol = '$';
    toCurrencyCodeForVendor = '';
    toCurrencySymbolForVendor = '';
    exchageRateForVendor = 1;
    generalDecoNote = [];
    totalQty: number;
    applicableItems = [];
    productNamelist = [];
    selectedMatrixIds = [];
    constructor(public config: {
        order: Partial<OrderDetails>,
        vendorId: string,
        logoUrl?: string,
        [x: string]: any,
    }) {
        super(config);
        this.imageManager = new DocumentImageManager();
        this.totalQty = 0;  
    }


    getPoSubtotal() {
        const { order, vendorId } = this.config;
        let totalCost = 0;
        const filteredItems = this.getApplicableItems();
        for (const item of filteredItems) {
            item.decoVendors.forEach((deco) => {
                totalCost += deco.totalCost;
                deco.addonCharges.forEach((addonCharge) => {
                    if (addonCharge.matchOrderQty == '1') {
                        totalCost += parseFloat(addonCharge.cost) * parseFloat(deco.quantity);
                    } else {
                        totalCost += parseFloat(addonCharge.cost) * parseFloat(addonCharge.quantity);
                    }
                });
            });
        }
        const gstTaxDetailsOnPo = order.gstTaxDetailsOnPo.find((gst) => {
            return gst.vendorId === vendorId;
        });
        if (gstTaxDetailsOnPo && gstTaxDetailsOnPo.totalCost) {
            totalCost = parseFloat(gstTaxDetailsOnPo.totalCost);
        }
        return totalCost;
    }

    getTotalCostPO() {
        const { order, vendorId } = this.config;

        let totalCost = this.getPoSubtotal();

        const gstTaxDetailsOnPo = order.gstTaxDetailsOnPo.find((gst) => {
            return gst.vendorId === vendorId;
        });
        if (gstTaxDetailsOnPo && gstTaxDetailsOnPo.totalCost) {
            totalCost = parseFloat(gstTaxDetailsOnPo.totalCost);
        }
        if (gstTaxDetailsOnPo && gstTaxDetailsOnPo.gstTaxTotalOnPo) {
            totalCost = totalCost + parseFloat(gstTaxDetailsOnPo.gstTaxTotalOnPo);
        }
        return totalCost;
    }

    billingDetails() {
        const { resolve } = this.config;

        const filteredItems = this.getApplicableItems();
        const details = filteredItems[0].decoVendors[0].poShippingBillingDetails;

        const supplier = resolve;
        let billingDetails = supplier.accountName;

        if (supplier.billAddress1) {
            billingDetails += '\n' + supplier.billAddress1;
        }
        if (supplier.billAddress2) {
            billingDetails += '\n' + supplier.billAddress2;
        }
        if (supplier.billCity) {
            billingDetails += '\n' + supplier.billCity;
        }
        if (supplier.billState) {
            billingDetails += ' ' + supplier.billState;
        }
        if (supplier.billPostalcode) {
            billingDetails += ' ' + supplier.billPostalcode;
        }
        if (supplier.billCountry) {
            billingDetails += '\n' + supplier.billCountry;
        }
        if (supplier.phone) {
            billingDetails += '\n' + supplier.phone;
        }

        let shippingDetails = details.shippingCompanyName;
        if (details.shippingCompanyName && details.shippingCompanyName !== details.shippingCustomerName) {
            let shippingCustomerSalutation = '';
            if(details.shippingCustomerSalutation && details.shippingCustomerSalutation !=''){
                shippingCustomerSalutation = details.shippingCustomerSalutation + ' ';
            }
            shippingDetails += '\n' + shippingCustomerSalutation + '' + details.shippingCustomerName;            
        }
        if (details.shippingStreet) {
            shippingDetails += '\n' + details.shippingStreet;
        }
        if (details.shippingStreet2) {
            shippingDetails += '\n' + details.shippingStreet2;
        }
        if (details.shippingCity) {
            shippingDetails += '\n' + details.shippingCity;
        }
        if (details.shippingState) {
            shippingDetails += ' ' + details.shippingState;
        }
        if (details.shipPostalcode) {
            shippingDetails += ' ' + details.shipPostalcode;
        }
        if (details.shipCountry) {
            shippingDetails += '\n' + details.shipCountry;
        }
        if (details.shippingPhone) {
            shippingDetails += '\n' + details.shippingPhone;
        }

        return {
            columns: [
                [
                    {
                        columns: [
                            { width: '70%', text: this.getDynamicDocLabel('supplier', 'Supplier'), style: 'fieldLabel' },
                            { width: '70%', text: this.getDynamicDocLabel('shipTo', 'Ship To'), style: 'fieldLabel' },
                        ]
                    },
                    {
                        columns: [
                            { width: '70%', text: billingDetails },
                            { width: '70%', text: shippingDetails },
                        ]
                    },
                ],
                this.summaryTable(),
            ]
        };
    }

    content() {
        const { docGridView } = this.config;
        if(docGridView){
            return [
                this.subheader(),
                '\n',
                this.horizontalLineGridView(),
                //this.lineItemGridTable(),
                this.lineItemGridTableByVariationGrouping(),
                this.lineItemsSummaryGridTable(),
                this.getPOPersonalizations(),
                '\n',
                this.generalDecorationNote(),
                this.vendorPoNote(),
                this.documentFooterNote(),
            ];                
        }else{
            return [
                this.subheader(),
                this.lineItemTable(),
                this.lineItemsSummaryTable(),
                this.getPOPersonalizations(),
                '\n',
                this.generalDecorationNote(),
                this.vendorPoNote(),
                this.documentFooterNote(),
            ];        
        }

    }

    getApplicableItems() {
        const { order, vendorId } = this.config;
        this.fromCurrencyCode = order.fromCurrencyCode;
        this.fromCurrencySymbol = order.fromCurrencySymbol;
        this.applicableItems =  order.lineItems.reduce((collection, item, index) => {
            const hasRelatedDecoration = item.decoVendors.some((deco) => deco.vendorId === vendorId);

            const matrixRows = item.matrixRows
                .filter((row) => {
                    return item.decoVendors.some((deco) => {
                        return deco.vendorId === vendorId
                            && deco.decorationDetails.some((detail) => detail.matrixId === row.matrixUpdateId);
                    });
                });
            if (hasRelatedDecoration) {
                if (item.inhandDate && item.overrideInHandDate == '1') {
                    this.overrideInHandDateFound = true;
                }

                collection.push({
                    ...item,
                    matrixRows: matrixRows,
                    decoVendors: item.decoVendors.filter((deco) => deco.vendorId === vendorId) // Only pass applicable decoVendors
                });
                let decoVendorDetails = item.decoVendors.filter((deco) => deco.vendorId === vendorId);
                if(decoVendorDetails.length > 0 && typeof decoVendorDetails[0].toCurrencyCodeForVendor != 'undefined' ){
                        this.toCurrencyCodeForVendor = decoVendorDetails[0].toCurrencyCodeForVendor || '';
                        this.toCurrencySymbolForVendor = decoVendorDetails[0].toCurrencySymbolForVendor || '';
                        this.exchageRateForVendor = decoVendorDetails[0].exchageRateForVendor || 1;                
                }

            }
            return collection;
        }, []);
        return this.applicableItems;
    }

    lineItemTable() {
        this.totalQty = 0;
        const { order, docOptions } = this.config;
        const lineItemTable = {
            layout: 'order',
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: ['*', 35, 45, 45],
                body: [
                    [
                        { text: 'Product', style: 'tableHeader' },
                        { text: 'Qty', style: 'tableHeader' },
                        { text: 'Price', style: 'tableHeader' },
                        { text: 'Total', style: 'tableHeader' },
                    ]
                ],
                dontBreakRows: true,
            }
        };

        const lines = [];
        const filteredItems = this.getApplicableItems();

        filteredItems.forEach((item: LineItem) => {
            if(typeof this.productNamelist[item.lineItemUpdateId] === 'undefined'){
                this.productNamelist[item.lineItemUpdateId] = item.productName;
            }
            const itemDescription = this.getItemDescriptionCell(item, 'vendor');
            // Add Line item
            lines.push([
                itemDescription,
                {
                    text: `${item.quantity}`,
                    borderColor: ['#EFEFEF', '#808080', '#EFEFEF', '#808080']
                },
                {
                    text: '',
                    alignment: 'right',
                    borderColor: ['#EFEFEF', '#808080', '#EFEFEF', '#808080']
                },
                {
                    text: '',
                    alignment: 'right',
                    borderColor: ['#EFEFEF', '#808080', '#808080', '#808080']
                },
            ]);


            // Show matrix rows for all but freight
            if (item.lineType != '4') {



                item.matrixRows.forEach((row) => {

		    if(this.selectedMatrixIds.indexOf(row.matrixUpdateId) < 0){
			this.selectedMatrixIds.push(row.matrixUpdateId);
		    }

                    const rowDescription = this.getRowDescriptionCell(item, row);

                    const rowLine: any = [
                        rowDescription,
                        { text: row.quantity },
                        { text: '', alignment: 'right' },
                        { text: '', alignment: 'right' },
                    ];

                    if (item.decoVendors && item.decoVendors.length) {
                        lines.push(rowLine);
                        const decoLines = this.decorationLines(item, row);
                        decoLines.forEach((decoLine) => {
                            lines.push(decoLine);
                        });
                    }
                });
            }
        });
        if (docOptions && docOptions[43] && docOptions[43].value){
                lines.push([
                    { text: `Total Product Quantity`, margin: [16, 0, 0, 0] },
                    { text: this.totalQty, alignment: 'right' },
                    { text: ``, alignment: 'right' },
                    { text: ``, alignment: 'right' },
                ]);        
        }
        lineItemTable.table.body = [
            ...lineItemTable.table.body,
            ...lines
        ];
        return lineItemTable;
    }

    lineItemsSummaryTable() {
        const { order, vendorId } = this.config;
        const node = {
            layout: 'noBorders',
            table: {
                headerRows: 0,
                widths: ['*', 'auto'],
                body: [],
                dontBreakRows: true,
            },
            margin: [0, 0, 8, 0],
            unbreakable: true,
        };
        const lines = [];
        // Totals
        lines.push([
            {
                text: this.getDynamicDocLabel('subTotal', 'Subtotal'),
                alignment: 'right'
            },
            {
                text: this.transformCurrencyForPO(this.getPoSubtotal(),  true),
                alignment: 'right'
            }
        ]);


        if (order.gstTaxDetailsOnPo && order.gstTaxDetailsOnPo.length > 0) {
            const vendorGstTaxDetails = order.gstTaxDetailsOnPo.find((detail) => detail.vendorId === vendorId);
            if (vendorGstTaxDetails.gstTaxTotalOnPo > 0) {

                let taxLabel = vendorGstTaxDetails.taxLabel;
                if(taxLabel.indexOf("%") < 0){
                    taxLabel = taxLabel+' ('+ order.taxRate +'%)';
                }
                lines.push([
                    {
                        text: `${taxLabel}`,
                        alignment: 'right'
                    },
                    {
                        text: this.transformCurrencyForPO(vendorGstTaxDetails.gstTaxTotalOnPo,  true),
                        alignment: 'right'
                    }
                ]);
            }
        }

        lines.push([
            {
                text: this.getDynamicDocLabel('total', this.getDocLabel('totalPrice')),
                alignment: 'right',
                style: 'bigger',
            },
            {
                text: this.transformCurrencyForPO(this.getTotalCostPO(),  true),
                alignment: 'right',
                style: 'bigger',
            }
        ]);

        lines.forEach((line) => node.table.body.push(line));
        return node;
    }

    lineItemGridTableByVariationGrouping() {
        this.totalQty = 0;
        const { order, docOptions, vendorId } = this.config;
        const lineItemTable = {
            layout: 'gridOrder',
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: [110,'*', 40, 60, 60],
                body: [
                    [
                        { text: '',border: [false, false, false, false]},
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                    ]
                ],
                dontBreakRows: true,
            }
        };

        const lines = [];
        const filteredItems = this.getApplicableItems();
        const productsWithDecoLines = [];
        const productsWithoutDecoLines = [];
        const applicableItems = this.getApplicableItems();
        let totalDecoVendors = [];
        let uniqueVariationsGroup = [];
        let matrixGroupByDecoration = [];
        let matrixIdsWithDeco = [];
        let matrixToVariationDetails = [];
        const decoDesignStrings = [];
        const decoDesignMatrixDetails = [];

        applicableItems.forEach((item: any) => {
            if (item.decoVendors) {
                const uniqueVariationsKeys = [];
                item.decoVendors.forEach((decoVendor: any) => {
                    const isSupplierDecorated = +decoVendor.vendorSupplierDecorated;
                    if (!isSupplierDecorated) {
                        totalDecoVendors.push(decoVendor);
                        uniqueVariationsKeys.push(decoVendor.decorationDetails[0]);
                    }
                });
                if(uniqueVariationsKeys.length > 0){
                    matrixGroupByDecoration.push(groupBy(uniqueVariationsKeys, 'matrixId'));
                }
            }        
        });

        matrixGroupByDecoration.forEach((matrixRows) => {
                each(keys(matrixRows), matrixId => {
                    let variationStringArray = [];
                    let variationString = '';
                    matrixRows[matrixId].forEach((matrixRow) => {
                        if(variationStringArray.indexOf(matrixRow.variationUniqueId) < 0){
                            variationStringArray.push(matrixRow.variationUniqueId);
                        }
                    });
                    if(variationStringArray.length>0){
                        variationString = variationStringArray.sort().join('-');
                    }
                    if(variationString !=''){
                        if(typeof uniqueVariationsGroup[variationString] === 'undefined'){
                            uniqueVariationsGroup[variationString] = [];
                        }
                        uniqueVariationsGroup[variationString].push(matrixId);
                        if(matrixIdsWithDeco.indexOf(matrixId) < 0){
                            matrixIdsWithDeco.push(matrixId);
                        }
                    }
                });        
        });
        console.log('uniqueVariationsGroup');
        console.log(uniqueVariationsGroup);

        each(keys(uniqueVariationsGroup), uniqueVariationsGroupKey => {
                    uniqueVariationsGroup[uniqueVariationsGroupKey].forEach((matrixId) => {
                        matrixToVariationDetails[matrixId.toString()] = uniqueVariationsGroupKey;
                    });
        });
        //console.log('matrixToVariationDetails');
        //console.log(matrixToVariationDetails);


        applicableItems.forEach((item) => {
            let showProductDetails = true;
            if (item.lineType != '4') {
            if(typeof this.productNamelist[item.lineItemUpdateId] === 'undefined'){
                this.productNamelist[item.lineItemUpdateId] = item.productName;
            }
            let productSizesSorting = keys(order.productSizesSorting);
            item.productSizes.sort(function(a, b) {
                  return productSizesSorting.indexOf(a.toUpperCase()) - productSizesSorting.indexOf(b.toUpperCase());
            });
            showProductDetails = true;
                if(item.matrixRows.length > 0 ){
                        const decoDesignStrings = [];
                        const decoDesignMatrixDetails = [];

                        item.matrixRows.forEach((row, index) => {
                                if(item.productSizes.indexOf(row.size) < 0){
                                    item.productSizes.push(row.size);
                                }
                                let variationId = 'No Variation';
                                if(typeof matrixToVariationDetails[row.matrixUpdateId.toString()] !=='undefined'){
                                    variationId = matrixToVariationDetails[row.matrixUpdateId.toString()];
                                }
                                if(typeof row.decoDesigns != 'undefined' && row.decoDesigns.length > 0){
                                    let designString = '';
                                    row.decoDesigns.forEach((design: any) => {
                                    console.log('design.vendor');
                                    console.log(design.vendor);
                                    console.log('vendorId');
                                    console.log(vendorId);
                                        if(design.designs && design.vendorId == vendorId){
                                            designString = designString.concat(design.designs.split(' ').sort().join(' '))+' ';
                                        }
                                        if(designString == ''){
                                            designString = 'No Deco';
                                        }
                                    });
                                    designString = designString.trim();
                                            if(typeof decoDesignStrings[designString] == 'undefined'){
                                                decoDesignStrings[designString] = [];
                                                decoDesignMatrixDetails[designString] = [];
                                            }
                                            decoDesignStrings[designString].push({
                                            ...row,
                                            variationUniqueId : variationId
                                            });
                                            decoDesignMatrixDetails[designString].push(row.matrixUpdateId);
                                 item.matrixRows[index].cost = 0;
                                 item.matrixRows[index].totalCost = 0;
                                 item.decoVendors.filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId))
                                .forEach((deco) => {
                                    item.matrixRows[index].cost += deco.itemCost
                                    item.matrixRows[index].totalCost += deco.totalCost;
                                });
                                }else{
                                            const designString = 'No Deco';

                                            if(typeof decoDesignStrings[designString] == 'undefined'){
                                                decoDesignStrings[designString] = [];
                                                decoDesignMatrixDetails[designString] = [];
                                            }
                                            decoDesignStrings[designString].push({
                                            ...row,
                                            variationUniqueId : variationId
                                            });
                                            decoDesignMatrixDetails[designString].push(row.matrixUpdateId);
                                }
                        });
                        console.log('decoDesignStrings');
                        console.log(decoDesignStrings);
                        each(keys(decoDesignStrings), designKey => {
                        const matrixRowsByVariations = groupBy(decoDesignStrings[designKey], 'variationUniqueId');
                        each(keys(matrixRowsByVariations), matrixRowsByVariationKey => {
                                const colorRows = groupBy(matrixRowsByVariations[matrixRowsByVariationKey], 'color');
                                let totalColorQty = 0;
                                let totalColorPrice = '';         
                                let decoLines = [];
                                let totalDecoPrice = [];
                                let totalDecoQty = [];
                                if(typeof matrixRowsByVariations[matrixRowsByVariationKey] !== 'undefined'){
                                        matrixRowsByVariations[matrixRowsByVariationKey].forEach((dRow: any) => {
                                                totalColorQty = (totalColorQty*1) + (dRow.quantity*1);
                                        });                        
                                }
                                if (typeof decoDesignStrings[designKey] !== 'undefined' && item.decoVendors && item.decoVendors.length && designKey !='No Deco') {
                                decoDesignStrings[designKey].forEach((row, index) => {
                                if(matrixRowsByVariationKey.indexOf(row.variationUniqueId) > -1){
                                    if(decoLines.length < 1){
                                        decoLines = this.decorationGridLines(item, row, 'po', totalColorQty, matrixRowsByVariationKey);
                                    }else{
                                        this.processGeneralNotes(item, row)
                                    }                                
                                }


                                if (item.decoVendors && item.decoVendors.length) {
                                    item.decoVendors
                                        .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId && matrixRowsByVariationKey.indexOf(row.variationUniqueId) > -1))
                                        .forEach((deco) => {
                                            const description = this.getDecoDescriptionGrid(deco);
                                            if(typeof totalDecoQty[row.variationUniqueId] !== 'undefined'){
                                            }else{
                                                totalDecoQty[row.variationUniqueId] = 0;
                                                totalDecoPrice[row.variationUniqueId] = 0;
                                            }
                                            if(typeof totalDecoPrice[row.variationUniqueId] !== 'undefined'){
                                            }else{
                                                totalDecoPrice[row.variationUniqueId] = 0;
                                            }
                                            if(deco.totalCost > 0) {                                           
                                                    totalDecoPrice[row.variationUniqueId] += (deco.totalCost * 1);    
                                            }
                                            totalDecoQty[row.variationUniqueId] += (deco.quantity * 1);
                                            //if (item.rollDecoAddonChargesToProduct != '1') 
                                            if(1){
                                                deco.addonCharges.forEach((charge) => {
                                                        decoLines.push([
                                                            { text: `${charge.name} `, margin: [24, 0, 0, 0], style: 'smallGray' },
                                                            { text: '', alignment: 'right', style: 'smallGray' },
                                                            { text: `${charge.quantity} `, alignment: 'right', style: 'smallGray' },
                                                            { text: this.transformCurrencyForPO(charge.cost), alignment: 'right' , style: 'smallGray'},
                                                            { text: this.transformCurrencyForPO(Number(charge.totalCost).toFixed(2)), alignment: 'right', style: 'smallGray' },
                                                        ]);
                                                });
                                            }
                                        });
                                }

                                });
console.log('totalDecoPrice');
console.log(totalDecoPrice);

console.log('decoLines');
console.log(decoLines);
                                        if(decoLines.length > 0){
                                                lines.push(this.blankGridLine());
                                                let designIndex = 0;
                                                each(keys(totalDecoPrice), totalDecoPriceKey => {
                                                    if(typeof decoLines[designIndex][2] !== 'undefined' && typeof decoLines[designIndex][2].text !== 'undefined' && typeof totalDecoQty[totalDecoPriceKey]  !== 'undefined'){
                                                         //decoLines[designIndex][2].text = totalDecoQty[totalDecoPriceKey];
                                                    }
                                                    if(typeof decoLines[designIndex][4] !== 'undefined' && typeof decoLines[designIndex][4].text !== 'undefined' && typeof totalDecoPrice[totalDecoPriceKey]  !== 'undefined'){
                                                        //decoLines[designIndex][4].text = this.transformCurrencyForPO(Number(totalDecoPrice[totalDecoPriceKey]).toFixed(2));                                                 
                                                    }
                                                designIndex++;
                                                });
                                                decoLines.forEach((decoLine) => {
                                                    lines.push(decoLine);
                                                });                                
                                                showProductDetails = true;
                                        }
                                }

                                    each(keys(colorRows), colorKey => {
                                            if(designKey == 'No Deco'){
                                                    //lines.push(this.blankGridLine());
                                                    //showProductDetails = true;
                                            }
                                            let showSizeGrid = true;
                                            let productSizeCount = 0;
                                            let perRowSizes = 9;
                                            productSizeCount = item.productSizes.length;
                                            let sizeGrid = this.getDefaultProductsSizes(item.productSizes);
                                            let gridRowIndex = 1;
                                            let gridRowMultiIndex = 0;
                                            let imageUrl = '';
                                            let totalGridQty = [];
                                            let unitPrice = [];
                                            let totalPrice = [];
                                            totalGridQty.push('Qty');
                                            unitPrice.push('Price');
                                            totalPrice.push('Total Price');

                                            const priceRows = groupBy(colorRows[colorKey], 'cost');
                                            let multiSizeGrid = this.getDefaultProductsSizesMultGrid(item.productSizes, productSizeCount, perRowSizes, keys(priceRows).length, item.showAttribSize);
                                            each(keys(priceRows), priceKey => {
                                                let rows = priceRows[priceKey];
                                                imageUrl = rows[0].imageUrl;
                                                let totalQty = 0;
                                                    const productSizes = [];
                                                    const productQty = [];
                                                rows.forEach((row: any) => {
                                                    productSizes.push(row.size);
                                                    productQty.push(row.quantity);
                                                    totalQty = (totalQty*1) + (row.quantity*1);
                                                    if(this.selectedMatrixIds.indexOf(row.matrixUpdateId) < 0){
                                                        this.selectedMatrixIds.push(row.matrixUpdateId);
                                                    }

                                                });
                                                totalGridQty.push(totalQty);
                                                this.totalQty = (this.totalQty * 1) + (totalQty * 1);                                    
                                                //unitPrice.push(this.transformCurrencyForPO((priceKey)));
                                                //totalPrice.push(this.transformCurrencyForPO((totalQty * parseFloat(priceKey)),  true));
                                                unitPrice.push(' ');
                                                totalPrice.push(' ');

                                                if(showProductDetails){
                                                    //lines.push(this.productHeadingLine());
                                                    lines.push(this.productDetailsLine(item, totalColorQty, '', showProductDetails));
                                                    if (item.lineType != '4' && item.lineType != '5') {
                                                        lines.push(this.productDescriptionLine(item));
                                                    }
                                                    showProductDetails = false;
                                                }
                                                sizeGrid.table.body[gridRowIndex] = [];
                                                item.productSizes.forEach((size) => {
                                                 sizeGrid.table.body[gridRowIndex].push('');
                                                });                                

                                                let qtyIndex = 0;
                                                productSizes.forEach((size) => {
                                                 if(sizeGrid.table.body[gridRowIndex][item.productSizes.indexOf(size)] !=''){
                                                     sizeGrid.table.body[gridRowIndex][item.productSizes.indexOf(size)] += (productQty[qtyIndex]*1);
                                                 }else{
                                                     sizeGrid.table.body[gridRowIndex][item.productSizes.indexOf(size)] = (productQty[qtyIndex]*1);
                                                 }
                                                if(productSizeCount > perRowSizes && item.productSizes.indexOf(size) >= perRowSizes ){
                                                        let gridRowOffset = (Math.ceil((item.productSizes.indexOf(size)+1)/perRowSizes) + 1)
                                                        if(typeof multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text !== 'undefined'){
                                                             if(multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text == ' '){
                                                                 multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text = 0;
                                                             }
                                                             multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text = parseInt(multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text) + (productQty[qtyIndex]*1);
                                                        }                                        
                                                }else{
                                                        if(typeof multiSizeGrid.table.body[gridRowMultiIndex+1][item.productSizes.indexOf(size)].text !== 'undefined'){
                                                             if(multiSizeGrid.table.body[gridRowMultiIndex+1][item.productSizes.indexOf(size)].text == ' '){
                                                                 multiSizeGrid.table.body[gridRowMultiIndex+1][item.productSizes.indexOf(size)].text = 0;
                                                             }
                                                             multiSizeGrid.table.body[gridRowMultiIndex+1][item.productSizes.indexOf(size)].text = parseInt(multiSizeGrid.table.body[gridRowMultiIndex+1][item.productSizes.indexOf(size)].text) + (productQty[qtyIndex]*1);
                                                        }                                        
                                                }
                                                 qtyIndex++;
                                                });   
                                                if(productSizeCount >= perRowSizes){
                                                    gridRowMultiIndex += ((Math.ceil(productSizeCount/perRowSizes) * 2) - 0);
                                                }else if(productSizeCount < perRowSizes){
                                                    gridRowMultiIndex += ((Math.ceil(productSizeCount/perRowSizes) * 2) - 0);
                                                }
                                                gridRowIndex++;
                                            });

                                            const DefaultSizeGrid =  [
                                             {
                                                    columns: [
                                                                {
                                                                image: this.lookupImage(imageUrl),
                                                                fit: [32, 32],
                                                                width: 32,
                                                                alignment: 'center'
                                                            },
                                                                {
                                                                        text: colorKey,
                                                                        style: (item.showAttribColor == '1') ? 'smallGray' : 'smallWhite',
                                                                        margin: [0, 12],
                                                                }

                                                              ]

                                              },
                                             sizeGrid,
                                             this.noBorderQtyPriceColumns(totalGridQty),
                                             this.noBorderQtyPriceColumns(unitPrice),
                                             this.noBorderQtyPriceColumns(totalPrice),
                                                ];


                                            if (docOptions[44] && docOptions[44].value) {

                                                    let DefaultSizeMultiGrid =  [
                                                                                     {
                                                                                            columns: [{
                                                                                                        image: this.lookupImage(imageUrl),
                                                                                                        fit: [32, 32],
                                                                                                        width: 32,
                                                                                                        alignment: 'center'
                                                                                                    },{
                                                                                                                text: colorKey,
                                                                                                                style: (item.showAttribColor == '1') ? 'smallGray' : 'smallWhite',
                                                                                                                margin: [0, 0],
                                                                                                        }]

                                                                                      },
                                                                                     multiSizeGrid,
                                                                                     this.noBorderQtyPriceColumns(totalGridQty),
                                                                                     this.noBorderQtyPriceColumns(unitPrice),
                                                                                     this.noBorderQtyPriceColumns(totalPrice),
                                                                                     //{ text: ``, alignment: 'right' },
                                                                                     //{ text: ``, alignment: 'right'}
                                                        ];
                                                lines.push(DefaultSizeMultiGrid);
                                              }else{

                                                    let DefaultSizeMultiGrid =  [
                                                                                     {
                                                                                            columns: [{
                                                                                                                text: colorKey,
                                                                                                                style: (item.showAttribColor == '1') ? 'smallGray' : 'smallWhite',
                                                                                                                margin: [0, 0],
                                                                                                        }]
                                                                                      },
                                                                                     multiSizeGrid,
                                                                                     this.noBorderQtyPriceColumns(totalGridQty),
                                                                                     this.noBorderQtyPriceColumns(unitPrice),
                                                                                     this.noBorderQtyPriceColumns(totalPrice),
                                                        ];

                                                lines.push(DefaultSizeMultiGrid);
                                              }
                                            //lines.push(DefaultSizeGrid);
                                            //lines.push(DefaultSizeMultiGrid);
                                    });                        
                        })

                        });

                }
            }
        });
        lines.push(this.blankGridLine());
        if (docOptions && docOptions[43] && docOptions[43].value){
                lines.push([
                    { text: `Total Product Quantity`, margin: [16, 0, 0, 0] , style: 'smallGray'},
                    { text: '', alignment: 'right' , style: 'smallGray'},
                    { text: this.totalQty, alignment: 'right' , style: 'smallGray'},
                    { text: ``, alignment: 'right' , style: 'smallGray'},
                    { text: ``, alignment: 'right' , style: 'smallGray'},
                ]);        
        }

        lineItemTable.table.body = [
            ...lineItemTable.table.body,
            ...lines
        ];
        console.log('lineItemTable');
        console.log(lineItemTable);
        return lineItemTable;
    }

    lineItemGridTable() {
        this.totalQty = 0;
        const { order, docOptions, vendorName } = this.config;
        const lineItemTable = {
            layout: 'gridOrder',
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: [110,'*', 40, 60, 60],
                body: [
                    [
                        { text: '',border: [false, false, false, false]},
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                    ]
                ],
                dontBreakRows: true,
            }
        };

        const lines = [];
        const filteredItems = this.getApplicableItems();

        filteredItems.forEach((item) => {
            let showProductDetails = true;
            if (item.lineType != '4') {

            let productSizesSorting = keys(order.productSizesSorting);
            item.productSizes.sort(function(a, b) {
                  return productSizesSorting.indexOf(a.toUpperCase()) - productSizesSorting.indexOf(b.toUpperCase());
            });
                if(item.matrixRows.length > 0 ){
                        const decoDesignStrings = [];
                        const decoDesignMatrixDetails = [];

                        item.matrixRows.forEach((row, index) => {
                                if(item.productSizes.indexOf(row.size) < 0){
                                    item.productSizes.push(row.size);
                                }
                                if(typeof row.decoDesigns != 'undefined' && row.decoDesigns.length > 0){
                                    let designString = 'No Deco';
                                    row.decoDesigns.forEach((design: any) => {
                                        if(design.designs && design.vendor == vendorName){
                                            designString = designString.concat(design.designs.split(' ').sort().join(' '))+' ';

                                        }
                                    });
                                    designString = designString.trim();
                                            if(typeof decoDesignStrings[designString] == 'undefined'){
                                                decoDesignStrings[designString] = [];
                                                decoDesignMatrixDetails[designString] = [];
                                            }
                                            decoDesignStrings[designString].push(row);
                                            decoDesignMatrixDetails[designString].push(row.matrixUpdateId);
                                 item.matrixRows[index].cost = 0;
                                 item.matrixRows[index].totalCost = 0;
                                 item.decoVendors.filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId))
                                .forEach((deco) => {
                                    item.matrixRows[index].cost += deco.itemCost
                                    item.matrixRows[index].totalCost += deco.totalCost;
                                });
                                }else{
                                            const designString = 'No Deco';

                                            if(typeof decoDesignStrings[designString] == 'undefined'){
                                                decoDesignStrings[designString] = [];
                                                decoDesignMatrixDetails[designString] = [];
                                            }
                                            decoDesignStrings[designString].push(row);
                                            decoDesignMatrixDetails[designString].push(row.matrixUpdateId);
                                }
                        });
                        console.log('decoDesignStrings');
                        console.log(decoDesignStrings);
                        each(keys(decoDesignStrings), designKey => {
                        const colorRows = groupBy(decoDesignStrings[designKey], 'color');
                        let totalColorQty = 0;
                        let totalColorPrice = '';         
                        let decoLines = [];
                        let totalDecoPrice = [];
                        let totalDecoQty = [];
                        if(typeof decoDesignStrings[designKey] !== 'undefined'){
                                decoDesignStrings[designKey].forEach((dRow: any) => {
                                        totalColorQty = (totalColorQty*1) + (dRow.quantity*1);
                                });                        
                        }
                        if (typeof decoDesignStrings[designKey] !== 'undefined' && item.decoVendors && item.decoVendors.length && designKey !='No Deco') {
                        decoDesignStrings[designKey].forEach((row, index) => {
                            if(index < 1){
                                decoLines = this.decorationGridLines(item, row, 'po');
                            }else{
                                this.processGeneralNotes(item, row)
                            }

                        if (item.decoVendors && item.decoVendors.length) {
                            item.decoVendors
                                .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId))
                                .forEach((deco) => {
                                    const description = this.getDecoDescriptionGrid(deco);
                                    if(typeof totalDecoQty[deco.designModal] !== 'undefined'){
                                    }else{
                                        totalDecoQty[deco.designModal] = 0;
                                        totalDecoPrice[deco.designModal] = 0;
                                    }
                                    if(typeof totalDecoPrice[deco.designModal] !== 'undefined'){
                                    }else{
                                        totalDecoPrice[deco.designModal] = 0;
                                    }
                                    if(deco.totalCost > 0) {                                           
                                            totalDecoPrice[deco.designModal] += (deco.totalCost * 1);    
                                    }
                                    totalDecoQty[deco.designModal] += (deco.quantity * 1);
                                    //if (item.rollDecoAddonChargesToProduct != '1') 
                                    if(1){
                                        deco.addonCharges.forEach((charge) => {
                                                decoLines.push([
                                                    { text: `${charge.name} `, margin: [24, 0, 0, 0], style: 'smallGray' },
                                                    { text: '', alignment: 'right', style: 'smallGray' },
                                                    { text: `${charge.quantity} `, alignment: 'right', style: 'smallGray' },
                                                    { text: this.transformCurrencyForPO(charge.cost), alignment: 'right' , style: 'smallGray'},
                                                    { text: this.transformCurrencyForPO(Number(charge.totalCost).toFixed(2)), alignment: 'right', style: 'smallGray' },
                                                ]);
                                        });
                                    }
                                });
                        }
                                 
                        });

                                if(decoLines.length > 0){
                                        lines.push(this.blankGridLine());
                                        let designIndex = 0;
                                        each(keys(totalDecoPrice), totalDecoPriceKey => {
                                            if(typeof decoLines[designIndex][2] !== 'undefined' && typeof decoLines[designIndex][2].text !== 'undefined' && typeof totalDecoQty[totalDecoPriceKey]  !== 'undefined'){
                                                 decoLines[designIndex][2].text = totalDecoQty[totalDecoPriceKey];
                                            }
                                            if(typeof decoLines[designIndex][4] !== 'undefined' && typeof decoLines[designIndex][4].text !== 'undefined' && typeof totalDecoPrice[totalDecoPriceKey]  !== 'undefined'){
                                                decoLines[designIndex][4].text = this.transformCurrencyForPO(Number(totalDecoPrice[totalDecoPriceKey]).toFixed(2));                                                 
                                            }
                                        designIndex++;
                                        });
                                        decoLines.forEach((decoLine) => {
                                            lines.push(decoLine);
                                        });                                
                                        showProductDetails = true;
                                }
                        }

                            each(keys(colorRows), colorKey => {
                                    if(designKey == 'No Deco'){
                                            //lines.push(this.blankGridLine());
                                            showProductDetails = true;
                                    }
                                    let showSizeGrid = true;
                                    let productSizeCount = 0;
                                    let perRowSizes = 9;
                                    productSizeCount = item.productSizes.length;
                                    let sizeGrid = this.getDefaultProductsSizes(item.productSizes);
                                    let gridRowIndex = 1;
                                    let gridRowMultiIndex = 0;
                                    let imageUrl = '';
                                    let totalGridQty = [];
                                    let unitPrice = [];
                                    let totalPrice = [];
                                    totalGridQty.push('Qty');
                                    unitPrice.push('Price');
                                    totalPrice.push('Total Price');

                                    const priceRows = groupBy(colorRows[colorKey], 'cost');
                                    let multiSizeGrid = this.getDefaultProductsSizesMultGrid(item.productSizes, productSizeCount, perRowSizes, keys(priceRows).length, item.showAttribSize);
                                    each(keys(priceRows), priceKey => {
                                        let rows = priceRows[priceKey];
                                        imageUrl = rows[0].imageUrl;
                                        let totalQty = 0;
                                            const productSizes = [];
                                            const productQty = [];
                                        rows.forEach((row: any) => {
                                            productSizes.push(row.size);
                                            productQty.push(row.quantity);
                                            totalQty = (totalQty*1) + (row.quantity*1);
                                        });
                                        totalGridQty.push(totalQty);
                                        this.totalQty = (this.totalQty * 1) + (totalQty * 1);                                    
                                        unitPrice.push(this.transformCurrencyForPO((priceKey)));
                                        totalPrice.push(this.transformCurrencyForPO((totalQty * parseInt(priceKey)),  true));

                                        if(showProductDetails){
                                            //lines.push(this.productHeadingLine());
                                            lines.push(this.productDetailsLine(item, totalColorQty, '', showProductDetails));
                                            if (item.lineType != '4' && item.lineType != '5') {
                                                lines.push(this.productDescriptionLine(item));
                                            }
                                            showProductDetails = false;
                                        }
                                        sizeGrid.table.body[gridRowIndex] = [];
                                        item.productSizes.forEach((size) => {
                                         sizeGrid.table.body[gridRowIndex].push('');
                                        });                                

                                        let qtyIndex = 0;
                                        productSizes.forEach((size) => {
                                         if(sizeGrid.table.body[gridRowIndex][item.productSizes.indexOf(size)] !=''){
                                             sizeGrid.table.body[gridRowIndex][item.productSizes.indexOf(size)] += (productQty[qtyIndex]*1);
                                         }else{
                                             sizeGrid.table.body[gridRowIndex][item.productSizes.indexOf(size)] = (productQty[qtyIndex]*1);
                                         }
                                        if(productSizeCount > perRowSizes && item.productSizes.indexOf(size) >= perRowSizes ){
                                                let gridRowOffset = (Math.ceil((item.productSizes.indexOf(size)+1)/perRowSizes) + 1)
                                                if(typeof multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text !== 'undefined'){
                                                     if(multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text == ' '){
                                                         multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text = 0;
                                                     }
                                                     multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text = parseInt(multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text) + (productQty[qtyIndex]*1);
                                                }                                        
                                        }else{
                                                if(typeof multiSizeGrid.table.body[gridRowMultiIndex+1][item.productSizes.indexOf(size)].text !== 'undefined'){
                                                     if(multiSizeGrid.table.body[gridRowMultiIndex+1][item.productSizes.indexOf(size)].text == ' '){
                                                         multiSizeGrid.table.body[gridRowMultiIndex+1][item.productSizes.indexOf(size)].text = 0;
                                                     }
                                                     multiSizeGrid.table.body[gridRowMultiIndex+1][item.productSizes.indexOf(size)].text = parseInt(multiSizeGrid.table.body[gridRowMultiIndex+1][item.productSizes.indexOf(size)].text) + (productQty[qtyIndex]*1);
                                                }                                        
                                        }
                                         qtyIndex++;
                                        });   
                                        if(productSizeCount >= perRowSizes){
                                            gridRowMultiIndex += ((Math.ceil(productSizeCount/perRowSizes) * 2) - 0);
                                        }else if(productSizeCount < perRowSizes){
                                            gridRowMultiIndex += ((Math.ceil(productSizeCount/perRowSizes) * 2) - 0);
                                        }
                                        gridRowIndex++;
                                    });

                                    const DefaultSizeGrid =  [
                                     {
                                            columns: [
                                                        {
                                                        image: this.lookupImage(imageUrl),
                                                        fit: [32, 32],
                                                        width: 32,
                                                        alignment: 'center'
                                                    },
                                                        {
                                                                text: colorKey,
                                                                style: (item.showAttribColor == '1') ? 'smallGray' : 'smallWhite',
                                                                margin: [0, 12],
                                                        }

                                                      ]

                                      },
                                     sizeGrid,
                                     this.noBorderQtyPriceColumns(totalGridQty),
                                     this.noBorderQtyPriceColumns(unitPrice),
                                     this.noBorderQtyPriceColumns(totalPrice),
                                        ];


                                    if (docOptions[44] && docOptions[44].value) {
                                    
                                            let DefaultSizeMultiGrid =  [
                                                                             {
                                                                                    columns: [{
                                                                                                image: this.lookupImage(imageUrl),
                                                                                                fit: [32, 32],
                                                                                                width: 32,
                                                                                                alignment: 'center'
                                                                                            },{
                                                                                                        text: colorKey,
                                                                                                        style: (item.showAttribColor == '1') ? 'smallGray' : 'smallWhite',
                                                                                                        margin: [0, 0],
                                                                                                }]

                                                                              },
                                                                             multiSizeGrid,
                                                                             this.noBorderQtyPriceColumns(totalGridQty),
                                                                             this.noBorderQtyPriceColumns(unitPrice),
                                                                             this.noBorderQtyPriceColumns(totalPrice),
                                                ];
                                        lines.push(DefaultSizeMultiGrid);
                                      }else{

                                            let DefaultSizeMultiGrid =  [
                                                                             {
                                                                                    columns: [{
                                                                                                        text: colorKey,
                                                                                                        style: (item.showAttribColor == '1') ? 'smallGray' : 'smallWhite',
                                                                                                        margin: [0, 0],
                                                                                                }]
                                                                              },
                                                                             multiSizeGrid,
                                                                             this.noBorderQtyPriceColumns(totalGridQty),
                                                                             this.noBorderQtyPriceColumns(unitPrice),
                                                                             this.noBorderQtyPriceColumns(totalPrice),
                                                ];

                                        lines.push(DefaultSizeMultiGrid);
                                      }
                                    //lines.push(DefaultSizeGrid);
                                    //lines.push(DefaultSizeMultiGrid);
                            });
                        });

                }
            }
        });
        lines.push(this.blankGridLine());
        if (docOptions && docOptions[43] && docOptions[43].value){
                lines.push([
                    { text: `Total Product Quantity`, margin: [16, 0, 0, 0] , style: 'smallGray'},
                    { text: '', alignment: 'right' , style: 'smallGray'},
                    { text: this.totalQty, alignment: 'right' , style: 'smallGray'},
                    { text: ``, alignment: 'right' , style: 'smallGray'},
                    { text: ``, alignment: 'right' , style: 'smallGray'},
                ]);        
        }

        lineItemTable.table.body = [
            ...lineItemTable.table.body,
            ...lines
        ];
        console.log('lineItemTable');
        console.log(lineItemTable);
        return lineItemTable;
    }

    lineItemsSummaryGridTable() {
        const { order, vendorId } = this.config;
        const node = {
            layout: 'noBorders',
            table: {
                headerRows: 0,
                widths: ['*', 'auto'],
                body: [],
                dontBreakRows: true,
            },
            margin: [0, 0, 8, 0],
            unbreakable: true,
        };
        const lines = [];
        // Totals
        lines.push([
            {
                text: this.getDynamicDocLabel('subTotal', 'Subtotal'),
                alignment: 'right'
            },
            {
                text: this.transformCurrencyForPO(this.getPoSubtotal(),  true),
                alignment: 'right'
            }
        ]);


        if (order.gstTaxDetailsOnPo && order.gstTaxDetailsOnPo.length > 0) {
            const vendorGstTaxDetails = order.gstTaxDetailsOnPo.find((detail) => detail.vendorId === vendorId);
            if (vendorGstTaxDetails.gstTaxTotalOnPo > 0) {

                let taxLabel = vendorGstTaxDetails.taxLabel;
                if(taxLabel.indexOf("%") < 0){
                    taxLabel = taxLabel+' ('+ order.taxRate +'%)';
                }
                lines.push([
                    {
                        text: `${taxLabel}`,
                        alignment: 'right'
                    },
                    {
                        text: this.transformCurrencyForPO(vendorGstTaxDetails.gstTaxTotalOnPo,  true),
                        alignment: 'right'
                    }
                ]);
            }
        }

        lines.push([
            {
                text: this.getDynamicDocLabel('total', this.getDocLabel('totalPrice')),
                alignment: 'right',
                style: 'bigger',
            },
            {
                text: this.transformCurrencyForPO(this.getTotalCostPO(),  true),
                alignment: 'right',
                style: 'bigger',
            }
        ]);

        lines.forEach((line) => node.table.body.push(line));
        return node;
    }
    
    getDecoDescription(deco: IDecoVendor) {

        const { docOptions } = this.config;

        const decoImageUrl = this.getDecoImageUrl(deco);

        const node = {
            columns: [],
            margin: [32, 0, 0, 0]
        };

        if (docOptions[20] && docOptions[20].value) {
            node.columns.push({
                image: this.lookupImage(decoImageUrl),
                fit: [64, 32],
                width: 64,
            });

        }

        const description = {
            stack: [
            ]
        };

        if (docOptions[38] && docOptions[38].value && deco.designName) {
            description.stack.push({ text: `Design : ${deco.designName}` });
        }        
        if (docOptions[39] && docOptions[39].value && deco.decorationDetails[0].decoDesignVariation.design_variation_title) {
            description.stack.push({ text: `Variation : ${deco.decorationDetails[0].decoDesignVariation.design_variation_title}` });
        }        
        description.stack.push({ text: `Type : ${deco.decoTypeName}` });
        description.stack.push({ text: `Location : ${deco.decoLocation} ` });
        if (deco.decorationDetails && deco.decorationDetails[0] && deco.decorationDetails[0].decoDescription) {
            description.stack.push({ text: deco.decorationDetails[0].decoDescription });
        }

        const colors = this.getDecoColors(deco);
        if (colors) {
            description.stack.push(colors);
        }

        if (deco.decorationNotes && deco.decorationNotes != '') {
            if(deco.isGeneralNote === '1'){
                if(this.generalDecoNote.indexOf(`${deco.designModal}: ${deco.decorationNotes}`) < 0 ){
                    this.generalDecoNote.push(`${deco.designModal}: ${deco.decorationNotes}`);
                } 
            }else{
                description.stack.push({ text: deco.decorationNotes });
            }
        }


        node.columns.push(description);

        return node;
    }
    
    processGeneralNotes(item, row) {
        const { docOptions } = this.config;

        const lines = [];

        if (item.decoVendors && item.decoVendors.length) {
            item.decoVendors
                .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId))
                .forEach((deco) => {

                    if(item.hideLine != '1' || (item.hideLine != '1' && deco.totalPrice > 0)) {
                        if(deco.decorationNotes && deco.decorationNotes != '' && this.generalDecoNote.indexOf(`${deco.designModal}: ${deco.decorationNotes}`) < 0 ){
                            this.generalDecoNote.push(`${deco.designModal}: ${deco.decorationNotes}`);
                        }
                    }
                });
        }
        return lines;
    }
    decorationGridLines(item, row, docType = 'order', totalColorQty = 0, matrixRowsByVariationKey = '') {
        const { docOptions } = this.config;

        const lines = [];

        if (item.decoVendors && item.decoVendors.length) {
            item.decoVendors
                .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId && matrixRowsByVariationKey.indexOf(row.variationUniqueId) > -1))
                .forEach((deco) => {
                    const description = this.getDecoDescriptionGrid(deco);
                    let quantity = (totalColorQty > 0 ) ? totalColorQty : deco.quantity;

                    if (item.calculatorData && item.calculatorData.length) {
                        quantity = '';
                    }
                    if(item.hideLine != '1' || (item.hideLine != '1' && deco.totalPrice > 0)) {
                        let decoDescriptionDetails = '';
                        const decoVariationInstructions = this.getDecoColors(deco);
                        console.log(decoVariationInstructions);
                        let colors = '';
                        if(decoVariationInstructions && decoVariationInstructions.text && decoVariationInstructions.text.length > 0){
                            colors = decoVariationInstructions.text.join('');
                        }
                        let designName = '';
                        if (docOptions[38] && docOptions[38].value && deco.designName) {
                            designName = `Design : ${deco.designName} \n`;
                        }   
                        let designVariationTitle = '';
                        if (docOptions[39] && docOptions[39].value && deco.decorationDetails[0].decoDesignVariation.design_variation_title) {
                            designVariationTitle = `Variation : ${deco.decorationDetails[0].decoDesignVariation.design_variation_title} \n`;
                        }                          
                        if(docType == 'po' && deco.decorationNotes && deco.decorationNotes != ''){
                            if(deco.isGeneralNote === '1'){
                                if(this.generalDecoNote.indexOf(`${deco.designModal}: ${deco.decorationNotes}`) < 0 ){
                                    this.generalDecoNote.push(`${deco.designModal}: ${deco.decorationNotes}`);
                                    
                                    decoDescriptionDetails = `${designName} ${designVariationTitle} Type : ${deco.decoTypeName} \n Location : ${deco.decoLocation} \n ${colors}`;
                                } 
                            }else{
                                decoDescriptionDetails = `${designName} ${designVariationTitle} Type : ${deco.decoTypeName} \n Location : ${deco.decoLocation} \n ${deco.decorationNotes} \n ${colors}`;
                            }
                        }else{
                            decoDescriptionDetails = `${designName} ${designVariationTitle} Type : ${deco.decoTypeName} \n Location : ${deco.decoLocation} \n ${colors}`
                        }
                        let totalDecoCost = Number(deco.itemCost) * Number(quantity);
                        lines.push([
                            description ,
                            { text: decoDescriptionDetails, alignment: 'left', border: [false, true, false, true], style: 'smallGray' },
                            { text: `${quantity} `, alignment: 'right', border: [false, true, false, true], style: 'smallGray' },
                            { text: this.transformCurrencyForOrder(Number(deco.itemCost).toFixed(2)), alignment: 'right', border: [false, true, false, true], style: 'smallGray' },
                            //{ text: ((item.rollDecoChargesToProduct == '1') ? '' : this.transformCurrencyForOrder(Number(totalDecoCost).toFixed(2))), alignment: 'right', border: [false, true, true, true], style: 'smallGray' },
                            { text: this.transformCurrencyForOrder(Number(totalDecoCost).toFixed(2)), alignment: 'right', border: [false, true, true, true], style: 'smallGray' },
                        ]);
                    }
                });
        }
        return lines;
    }
    decorationLines(item, row) {
        const lines = [];
        if (item.decoVendors && item.decoVendors.length) {
            item.decoVendors
                .filter((deco: IDecoVendor) => {
                    return deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId);
                })
                .forEach((deco: IDecoVendor) => {

                    // column index changes when image is shown..
                    const description: any = this.getDecoDescription(deco);
                    let quantity = deco.quantity;

                    if (item.calculatorData && item.calculatorData.length) {
                        quantity = '';
                    }

                    lines.push([
                        description,
                        { text: `${quantity}` },
                        { text: this.transformCurrencyForPO(deco.itemCost), alignment: 'right' },
                        { text: this.transformCurrencyForPO(deco.totalCost.toFixed(2)), alignment: 'right' },
                    ]);
                    deco.addonCharges.forEach((charge) => {
                        lines.push([
                            { text: `${charge.name} `, margin: [24, 0, 0, 0] },
                            { text: `${charge.quantity} ` },
                            { text: this.transformCurrencyForPO(charge.cost), alignment: 'right' },
                            { text: this.transformCurrencyForPO(charge.totalCost), alignment: 'right' },
                        ]);
                    });
                });
        }

        return lines;
    }

    rolledDecorationGrid(item, row) {
        const columns = [];
        if (item.decoVendors && item.decoVendors.length) {
            item.decoVendors
                .filter((deco: IDecoVendor) => {
                    return deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId);
                })
                .forEach((deco) => {
                    const decoImageUrl = this.getDecoImageUrl(deco);
                    columns.push(
                        {
                            columns: [
                                {
                                    image: this.lookupImage(decoImageUrl),
                                    fit: [32, 16],
                                    width: 32,
                                    margin: [16, 0, 0, 0],
                                },
                                { text: `${deco.decoTypeName} ${deco.decoLocation}` },
                            ],
                        },
                    );
                });
        }
        return columns;
    }

    summaryFields() {
        const { order, invoiceDate, creditTerms } = this.config;

        const creditTermDescription = creditTerms.find((term) => term.value === order.creditTerms);

        return [
            {
                configKey: 35,
                value: order.orderIdentity,
                label: this.getFieldLabel('orderIdentity')
            },
            {
                configKey: 4,
                value: this.formatter.transformDate(order.dueDate),
                label: this.getFieldLabel('dueDate')
            },
            {
                configKey: 1,
                value: this.formatter.transformDate(order.orderDate),
                label: this.getFieldLabel('orderDate')
            },
            {
                configKey: 0,
                value: this.transformCurrencyForPO(this.getTotalCostPO(),  true),
                label: this.getFieldLabel('finalGrandTotalPrice')
            },
            {
                configKey: 2,
                value: this.formatter.transformDate(order.inHandDateBy),
                label: this.getFieldLabel('inHandDateBy')
            },
            {
                configKey: 3,
                value: order.shipVia,
                label: this.getFieldLabel('shipVia')
            },
            {
                configKey: 25,
                value: order.shippingAccountNo,
                label: this.getFieldLabel('shippingAccountNo')
            },
            {
                configKey: 5,
                value: this.formatter.transformDate(order.shipDate),
                label: this.getFieldLabel('shipDate')
            },
            {
                configKey: 31,
                value: this.formatter.transformDate(order.factoryShipDate),
                label: this.getFieldLabel('factoryShipDate')
            },
            {
                configKey: 6,
                value: order.customerPo,
                label: this.getFieldLabel('customerPo')
            },
            {
                configKey: 7,
                value: creditTermDescription && creditTermDescription.label,
                label: this.getFieldLabel('creditTerms')
            },
            {
                configKey: 8,
                value: order.salesPerson,
                label: this.getFieldLabel('salesPerson')
            },
            {
                configKey: 9,
                value: order.salesPersonPhone,
                label: this.getFieldLabel('salesPersonPhone')
            },
            {
                configKey: 10,
                value: order.salesPersonEmail,
                label: (order.salesPersonEmail && order.salesPersonEmail.length > 22) ? 'Email' : this.getFieldLabel('salesPersonEmail')
            },
            {
                configKey: 11,
                value: order.csrName,
                label: this.getFieldLabel('csrName')
            },
            {
                configKey: 12,
                value: order.csrPhone,
                label: this.getFieldLabel('csrPhone')
            },
            {
                configKey: 13,
                value: order.csrEmail,
                label: this.getFieldLabel('csrEmail')
            },
            {
                configKey: 26,
                value: order.alternateAccountNumber,
                label: this.getFieldLabel('alternateAccountNumber')
            },
            {
                configKey: 27,
                value: order.attentionTo,
                label: this.getFieldLabel('attentionTo')
            }
        ];
    }

    vendorPoNote() {
        const { order, resolve } = this.config;

        if (resolve && resolve.vendorPoNotes) {
            return {
                stack: [
                    { text: this.getDynamicDocLabel('vendorPONotes', 'Vendor PO Notes')+':', bold: true },
                    { text: resolve.vendorPoNotes }
                ],
                margin: [0, 16]
            };
        }
        return '';
    }
    generalDecorationNote() {

        if (this.generalDecoNote && this.generalDecoNote.length > 0) {
            return {
                stack: [
                    { text: 'Decoration Notes', bold: true },
                    { text: this.generalDecoNote.join('\r\n') }
                ],
                margin: [0, 16]
            };
        }
        return '';
    }
    productDetailsLine(item, totalQty, price, showProductDetails = true) {
        const { docOptions } = this.config;
        const imageStack = {
            columns: [],
            width: 52,
            border: [false, false, false, false], style: 'smallText'
        };
        let itemColIndex = 0;
        if (docOptions[15] && docOptions[15].value) {
            imageStack.columns.push({
                image: this.lookupImage(item.quoteCustomImage),
                fit: [32, 32],
                width: 32,
            });
            itemColIndex = 1;
        }
        imageStack.columns.push({ stack: []});
        
        if (docOptions[14] && docOptions[14].value) {
            //imageStack.columns[itemColIndex].stack.push({ text: item.itemNo, bold: true, alignment: 'left', margin: [2, 2], border: [false, false, false, false], style: 'smallText' });
        }
        if (docOptions[30] && docOptions[30].value) {
            //imageStack.columns[itemColIndex].stack.push({ text: item.inhouseId, bold: true, alignment: 'left', margin: [2, 2], border: [false, false, false, false], style: 'smallText' });
        }
        if (docOptions[33] && docOptions[33].value) {
            //imageStack.columns[itemColIndex].stack.push({ text: item.itemCode, bold: true, alignment: 'left', margin: [2, 2], border: [false, false, false, false], style: 'smallText' });
        }
      const productLine: any = [
        imageStack,
        //{ text: (showProductDetails ? (item.vendorProductName ? item.vendorProductName : item.productName) : ''), alignment: 'left', border: [false, false, false, false], style: 'smallText'},
        { text: (showProductDetails ? ' ' : ''), alignment: 'left', border: [false, false, false, false], style: 'smallText'},
        { text: (docOptions[45] && docOptions[45].value) ? 'Qty '+totalQty : '' ,  alignment: 'right', border: [false, false, false, false], style: 'smallText' },
        { text: (docOptions[45] && docOptions[45].value) ? 'Total Price' : '', alignment: 'right', border: [false, false, false, false], style: 'smallText' },
        { text: (docOptions[45] && docOptions[45].value) ? this.transformCurrencyForOrder((price), true) : '', alignment: 'right', border: [false, false, false, false], style: 'smallText' },
      ];
      return productLine;
    }
    
    productDescriptionLine(item) {
      const { docOptions } = this.config;
      const productStack = {
          columns: [],
          width: 52,
          border: [true, true, false, false], style: 'smallText'
      };
      productStack.columns.push({ stack: []});
      let itemColIndex = 0;
      productStack.columns[itemColIndex].stack.push({ text: (item.vendorProductName ? item.vendorProductName : item.productName), bold: true, alignment: 'left',  border: [false, false, false, false], style: 'smallText' });
      if (docOptions[14] && docOptions[14].value) {
          productStack.columns[itemColIndex].stack.push({ text: item.itemNo,  alignment: 'left', border: [false, false, false, false], style: 'smallText' });
      }
      if (docOptions[30] && docOptions[30].value) {
          productStack.columns[itemColIndex].stack.push({ text: item.inhouseId,  alignment: 'left', border: [false, false, false, false], style: 'smallText' });
      }
      if (docOptions[33] && docOptions[33].value) {
          productStack.columns[itemColIndex].stack.push({ text: item.itemCode,  alignment: 'left', border: [false, false, false, false], style: 'smallText' });
      }
      const productLine: any = [
        productStack,
        { text: (docOptions[17] && docOptions[17].value) ? item.vendorDescription : '' , alignment: 'left', border: [false, true, true, false], style: 'smallText', colSpan: 4 },
        { text: '' ,  alignment: 'right', border: [false, true, false, false], style: 'smallText' },
        { text: '', alignment: 'right', border: [false, true, false, false], style: 'smallText' },
        { text: '', alignment: 'right', border: [false, true, false, false], style: 'smallText' },
      ];
      return productLine;
    }
    transformCurrencyForPO(amount, formating = false, format = '1.2-2'){

        if(formating){
                if(this.exchageRateForVendor > 0 && this.toCurrencyCodeForVendor !='' && this.toCurrencySymbolForVendor !=''){
                    return this.formatter.transformCurrency(amount * this.exchageRateForVendor, '', this.toCurrencySymbolForVendor, format);
                }else if(this.fromCurrencyCode !='' && this.fromCurrencySymbol !=''){
                    return this.formatter.transformCurrency(amount , '', this.fromCurrencySymbol, format);
                }else{
                    return this.formatter.transformCurrency(amount , 'USD', 'symbol', format);
                }        
        }else{
                if(this.exchageRateForVendor > 0 && this.toCurrencyCodeForVendor !='' && this.toCurrencySymbolForVendor !=''){
                    let oldDecimalPlaces = 2;
                    oldDecimalPlaces = this.getDecimalPlaces(amount);
                    if(oldDecimalPlaces < 2){
                        oldDecimalPlaces = 2;
                    }
                    return this.formatter.transformCurrency(amount * this.exchageRateForVendor, '', this.toCurrencySymbolForVendor, '1.2-' + oldDecimalPlaces);                
                    //return this.formatter.transformCurrency(amount * this.exchageRateForVendor, '', this.toCurrencySymbolForVendor);
                }else if(this.fromCurrencyCode !='' && this.fromCurrencySymbol !=''){
                    return this.formatter.transformCurrency(amount , '', this.fromCurrencySymbol);
                }else{
                    return this.formatter.transformCurrency(amount , 'USD', 'symbol');
                }        
        }

    }

    getPOPersonalizations() {

        const { personalizations, docOptions } = this.config;
            let itemList = [];
            let matrixIdsFound = false;
            if(docOptions && docOptions[41] && docOptions[41].value && personalizations.length > 0){
                const personalizationsTable = [{
                    layout: 'order',
                    table: {
                        // headers are automatically repeated if the table spans over multiple pages
                        // you can declare how many rows should be treated as headers
                        headerRows: 1,
                        widths: [50, 40, 70, 40, 70, '*'],
                        body: [
                            // Table Header
                            [
                                { text: 'Personalization', alignment: 'left', colSpan: 6, bold: true, style: 'tableHeader'  },
                                { text:'', style: 'tableHeader'  },
                                { text:'', style: 'tableHeader'  },
                                { text:'', style: 'tableHeader'  },
                                { text:'', style: 'tableHeader'  },
                                { text:'', style: 'tableHeader'  },
                            ],
                            [
                                { text:'', alignment: 'left', colSpan: 6, bold: true  },
                                { text:''  },
                                { text:''  },
                                { text:''  },
                                { text:''  },
                                { text:''  },
                            ],
                            ],
                        dontBreakRows: true,
                    }
                }];
                const lines = [];
                personalizations.forEach((row) => {
                       if(row.displayText && row.color && row.location && this.selectedMatrixIds.indexOf(row.matrixId) > -1){
                            if(itemList.indexOf(row.lineItemId) < 0){
                                itemList.push(row.lineItemId);
                               matrixIdsFound = true;
                               lines.push([
                                    { text: `${this.productNamelist[row.lineItemId]}\n${row.itemNo}\n${row.itemCode}`, alignment: 'left', colSpan: 6, bold: true  },
                                    { text:''  },
                                    { text:''  },
                                    { text:''  },
                                    { text:''  },
                                    { text:''  },
                                ]);
                               lines.push([
                                { text: 'Item Color', alignment: 'left', style: 'tableHeader' },
                                { text: 'Item Size', alignment: 'left', style: 'tableHeader' },
                                { text: 'Display text', alignment: 'left', style: 'tableHeader' },
                                { text: 'Color', alignment: 'left', style: 'tableHeader' },
                                { text: 'Location', alignment: 'left', style: 'tableHeader' },
                                { text: 'Notes', alignment: 'left', style: 'tableHeader' },
                                ]);

                    }
                
                               lines.push([
                                    { text: `${row.itemColor}`, alignment: 'left' },
                                    { text: `${row.itemSize}`, alignment: 'left' },
                                    { text: `${row.displayText}`, alignment: 'left' },
                                    { text: `${row.color}`, alignment: 'left' },
                                    { text: `${row.location}`, alignment: 'left' },
                                    { text: `${row.notes}`, alignment: 'left' },
                                ]);
                       }
                
                });
                if(matrixIdsFound){
                    personalizationsTable[0].table.body = [
                    ...personalizationsTable[0].table.body,
                    ...lines
                    ];
                    return personalizationsTable;

                }else{
                    return null;
                }
            }else{
                return null;
            }
    }
}
