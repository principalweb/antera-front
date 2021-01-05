import { OrderDetails, AdditionalCharge, LineItem, MatrixRow } from 'app/models';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';
import { Observable } from 'rxjs';
import { DocumentImageManager } from '../document-image-manager';
import { AbstractOrderDocument } from '../document.interface';
import { InvoiceDocument } from './invoice.document';
import { IDecoVendor } from 'app/features/e-commerce/order-form/interfaces';

const chunk = (arr, size) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );
};

export class PurchaseOrderDocument extends InvoiceDocument {
    name = 'purchase-order';
    label = 'Purchase Order';

    imageManager: DocumentImageManager;
    vendorLineItems: any;
    overrideInHandDateFound: boolean = false;
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

    summaryFields() {
        const { order, invoiceDate, creditTerms, resolve } = this.config;

        //const creditTermDescription = creditTerms.find((term) => term.value === order.creditTerms);
        const supplier = resolve;
        const creditTermDescription = creditTerms.find((term) => term.value === supplier.creditTerms);

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
                value: this.transformCurrencyForPO(this.getTotalCostPO(), true),
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
                configKey: 34,
                value: this.formatter.transformDate(order.supplierShipDate),
                label: this.getFieldLabel('supplierShipDate')
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

    getPoSubtotal() {
        const { order, vendorId } = this.config;
        let totalCost = 0;
        const filteredItems = this.getApplicableItems();
        for (const item of filteredItems) {
            item.matrixRows.forEach((row) => {
                totalCost += parseFloat(row.cost) * parseFloat(row.quantity);
            });

            const decorations = item.decoVendors.filter((deco) => deco.vendorSupplierDecorated == '1' && (vendorId == deco.decorationVendorId || vendorId == deco.vendorId));

            decorations.forEach((deco) => {
                totalCost += parseFloat(deco.totalCost);

                deco.addonCharges.forEach((addonCharge) => {
                    totalCost += parseFloat(addonCharge.cost) * parseFloat(addonCharge.quantity);
                });
            });

            if (!item.addonCharges) { break; }
            item.addonCharges.forEach((addonCharge) => {
                totalCost += parseFloat(addonCharge.cost) * parseFloat(addonCharge.quantity);
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
        const details = filteredItems[0].poShippingBillingDetails;

        const supplier = resolve;
        let billingDetails = '';

        if (supplier.accountName) {
            billingDetails +=  supplier.accountName;
        }
        
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

        let shippingDetails = '';
        const items = this.getApplicableShippingItemsDetails();
        if(keys(items).length == 1){
                shippingDetails = details.shippingCompanyName;
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
        }


        return {
            columns: [
                [
                    {
                        columns: [
                            { width: '70%', text: this.getDynamicDocLabel('supplier', 'Supplier'), style: 'fieldLabel' },
                            { width: '70%', text: (keys(items).length == 1) ? this.getDynamicDocLabel('shipTo', 'Ship To') : '', style: 'fieldLabel' },
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
                    this.headerVendorPoNotes(),
                    //this.lineItemGridTable(),
                    this.lineItemGridTableByVariationGrouping(),
                    this.lineItemsSummaryGridTable(),
                    this.getPOPersonalizations(),
                    '\n',
                    this.generalDecorationNote(),
                    this.footerVendorPoNotes(),
                    this.vendorPoNote(),
                    this.documentFooterNote(),
                ];        
        }else{
                return [
                    this.subheader(),
                    '\n',
                    this.headerVendorPoNotes(),
                    this.lineItemTable(),
                    this.lineItemsSummaryTable(),
                    this.getPOPersonalizations(),
                    '\n',
                    this.generalDecorationNote(),
                    this.footerVendorPoNotes(),
                    this.vendorPoNote(),
                    this.documentFooterNote(),
                ];
        
        }
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
            border: [false, true, true, true],
            unbreakable: true,
            margin: [0, 0, 8, 0],
        };
        const lines = [];
        // Totals
        lines.push([
            {
                text: this.getDynamicDocLabel('subTotal', 'Subtotal'),
                alignment: 'right'
            },
            {
                text: this.transformCurrencyForPO(this.getPoSubtotal(), true),
                alignment: 'right'
            }
        ]);

        if (order.gstTaxDetailsOnPo && order.gstTaxDetailsOnPo.length > 0) {
            const vendorGstTaxDetails = order.gstTaxDetailsOnPo.find((detail) => detail.vendorId === vendorId);
            if (vendorGstTaxDetails.gstTaxTotalOnPo > 0) {
                let taxLabel = vendorGstTaxDetails.taxLabel;
                //let taxLabel = this.getTaxLabel();
                if(taxLabel.indexOf("%") < 0){
                    taxLabel = taxLabel+' ('+ order.taxRate +'%)';
                }
                lines.push([
                    {
                        text: `${taxLabel}`,
                        alignment: 'right'
                    },
                    {
                        text: this.transformCurrencyForPO(vendorGstTaxDetails.gstTaxTotalOnPo, true),
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
                text: this.transformCurrencyForPO(this.getTotalCostPO(), true),
                alignment: 'right',
                style: 'bigger',
            }
        ]);

        lines.forEach((line) => node.table.body.push(line));
        return node;
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
            border: [false, true, true, true],
            unbreakable: true,
            margin: [0, 0, 8, 0],
        };
        const lines = [];
        // Totals
        lines.push([
            {
                text: this.getDynamicDocLabel('subTotal', 'Subtotal'),
                alignment: 'right'
            },
            {
                text: this.transformCurrencyForPO(this.getPoSubtotal(), true),
                alignment: 'right'
            }
        ]);

        if (order.gstTaxDetailsOnPo && order.gstTaxDetailsOnPo.length > 0) {
            const vendorGstTaxDetails = order.gstTaxDetailsOnPo.find((detail) => detail.vendorId === vendorId);
            if (vendorGstTaxDetails.gstTaxTotalOnPo > 0) {
                let taxLabel = vendorGstTaxDetails.taxLabel;
                //let taxLabel = this.getTaxLabel();
                if(taxLabel.indexOf("%") < 0){
                    taxLabel = taxLabel+' ('+ order.taxRate +'%)';
                }
                lines.push([
                    {
                        text: `${taxLabel}`,
                        alignment: 'right'
                    },
                    {
                        text: this.transformCurrencyForPO(vendorGstTaxDetails.gstTaxTotalOnPo, true),
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
                text: this.transformCurrencyForPO(this.getTotalCostPO(), true),
                alignment: 'right',
                style: 'bigger',
            }
        ]);

        lines.forEach((line) => node.table.body.push(line));
        return node;
    }
    getApplicableItems() {
        const { order, vendorId } = this.config;

        this.fromCurrencyCode = order.fromCurrencyCode;
        this.fromCurrencySymbol = order.fromCurrencySymbol;

        this.applicableItems = order.lineItems.reduce((collection, item, index) => {
            if (item.vendorId === vendorId) {
                if (item.inhandDate && item.overrideInHandDate == '1') {
                    this.overrideInHandDateFound = true;
                }   

                this.toCurrencyCodeForVendor = item.toCurrencyCodeForVendor || '';
                this.toCurrencySymbolForVendor = item.toCurrencySymbolForVendor || '';
                this.exchageRateForVendor = item.exchageRateForVendor || 1;

                const vendorItem = {
                    ...item,
                    matrixRows: item.matrixRows.filter((row) => row.poType === 'DropShip'),
                };
                if (vendorItem.matrixRows && vendorItem.matrixRows.length) {
                    collection.push(vendorItem);
                }
            }
            return collection;
        }, []);
        return this.applicableItems;
    }

    transformItemLines(item: LineItem): any {
        const { docOptions } = this.config;

        let price = '';
        let totalPrice = '';
        let totalQquantity = 0;
        if (item.lineType == '4') {
            price = this.transformCurrencyForPO(item.cost, true, '1.2-4');
            totalPrice = this.transformCurrencyForPO(item.totalCost, true, '1.2-4');
        }
        item.matrixRows.forEach((row) => {
            totalQquantity += (row.quantity*1);
        });
        const itemDescriptionCell: any = this.getItemDescriptionCell(item, 'vendor');

        const lines: any = [
            [
                itemDescriptionCell,
                {
                    text: `${totalQquantity}`,
                    alignment: 'right',
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
            ]
        ];

        return lines;
    }

    lineItemTable(): any {
        this.totalQty = 0;
        const { order, docOptions, vendorId } = this.config;
        const lineItemTable = {
            layout: 'order',
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: ['*', 35, 45, 45],
                body: [
                    // Table Header
                    [
                        { text: 'Product', style: 'tableHeader' },
                        { text: 'Qty', style: 'tableHeader' },
                        { text: 'Price', style: 'tableHeader' },
                        { text: 'Total', style: 'tableHeader' },
                    ]
                ],
                dontBreakRows: true,
            },
        };

        const lines = [];
        //const filteredItems = this.getApplicableItems();

        const filteredItems = groupBy(this.getApplicableItems(), 'alternateShipToAccountId');
        each(keys(filteredItems), iKey => {

                if(keys(filteredItems).length > 1 && filteredItems[iKey][0].poShippingBillingDetails){
                        lines.push(this.shipToHeadingLine());
                        lines.push(this.shipToDetailsLine(filteredItems[iKey][0].poShippingBillingDetails));            
                }        
                filteredItems[iKey].forEach((item: LineItem) => {
                    if(typeof this.productNamelist[item.lineItemUpdateId] === 'undefined'){
                        this.productNamelist[item.lineItemUpdateId] = item.productName;
                    }
                    const itemLines = this.transformItemLines(item);
                    itemLines.forEach(line => {
                        lines.push(line);
                    });

                    // Show matrix rows for all but freight
                    //if (item.lineType != '4') 
                    if (1) 
                    {

                        item.matrixRows.forEach((row) => {
                            if(this.selectedMatrixIds.indexOf(row.matrixUpdateId) < 0){
                                this.selectedMatrixIds.push(row.matrixUpdateId);
                            }
                            const rowLines: any[] = this.getMatrixRowLines(item, row);
                            rowLines.forEach((rowLine) => {
                                lines.push(rowLine);
                            });
                        });

                        item.addonCharges.forEach((charge) => {
                            let chargeCost = '';
                            let totalChargeCost = 'Included';
            /*
                            if (item.rollAddonChargesToProduct != '1') {
                                chargeCost = this.transformCurrencyForPO(charge.cost)
                                totalChargeCost = this.transformCurrencyForPO(charge.totalCost, true)
                            }
        */                    

                            chargeCost = this.transformCurrencyForPO(charge.cost)
                            totalChargeCost = this.transformCurrencyForPO(charge.totalCost, true)
                            lines.push([
                                { text: `${charge.name} `, margin: [16, 0, 0, 0] },
                                { text: `${charge.quantity} `, alignment: 'right' },
                                { text: chargeCost, alignment: 'right' },
                                { text: totalChargeCost, alignment: 'right' },
                            ]);
                        });
                    }
                });
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
    lineItemGridTableByVariationGrouping(): any {
        this.totalQty = 0;
        const { order, docOptions, vendorId } = this.config;
        let showProductDetails = true;
        const lineItemTable = {
            layout: 'gridOrder',
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: [110,'*', 40, 60, 60],
                body: [
                    // Table Header
                    [
                        { text: '',border: [false, false, false, false]},
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                    ]
                ],
                dontBreakRows: true,
            },
        };

        const lines = [];
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
                    if (!isSupplierDecorated && (vendorId == decoVendor.decorationVendorId || vendorId == decoVendor.vendorId)) {
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


        const filteredItems = groupBy(applicableItems, 'alternateShipToAccountId');
        each(keys(filteredItems), iKey => {
            if(keys(filteredItems).length > 1 && filteredItems[iKey][0].poShippingBillingDetails){
                lines.push(this.shipToHeadingLine());
                lines.push(this.shipToDetailsLine(filteredItems[iKey][0].poShippingBillingDetails));            
            }        
                filteredItems[iKey].forEach((item: any) => {
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
                                        if(design.designs && design.supplierDecoratedVendorId && design.supplierDecoratedVendorId == vendorId && design.supplierDecorated == "1"){
                                            designString = designString.concat(design.designs.split(' ').sort().join(' '))+' ';

                                        }
                                    });
                                    if(designString == ''){
                                        designString = 'No Deco';
                                    }
                                    designString = designString.trim();
                                    if(designString !==''){
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
                                let totalColorPrice = 0;         
                                let decoLines = [];
                                let totalDecoPrice = [];
                                let totalDecoQty = [];
                                if(designKey == 'No Deco'){
                                        if(typeof decoDesignStrings[designKey] !== 'undefined'){
                                                decoDesignStrings[designKey].forEach((dRow: any) => {
                                                        totalColorQty = (totalColorQty*1) + (dRow.quantity*1);
                                                        totalColorPrice = (totalColorPrice*1) + (dRow.totalCost*1);
                                                });                        
                                        }
                                }else{
                                        if(typeof matrixRowsByVariations[matrixRowsByVariationKey] !== 'undefined'){
                                                matrixRowsByVariations[matrixRowsByVariationKey].forEach((dRow: any) => {
                                                        totalColorQty = (totalColorQty*1) + (dRow.quantity*1);
                                                        totalColorPrice = (totalColorPrice*1) + (dRow.totalCost*1);
                                                });                        
                                        }
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
                                        .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId && matrixRowsByVariationKey.indexOf(row.variationUniqueId) > -1 ))
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
                                            console.log('multiSizeGrid');
                                            console.log(multiSizeGrid);
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
                                                unitPrice.push(this.transformCurrencyForPO((priceKey)));
                                                totalPrice.push(this.transformCurrencyForPO((totalQty * parseFloat(priceKey)),  true));

                                                if(showProductDetails){
                                                    //lines.push(this.productHeadingLine());
                                                    lines.push(this.productDetailsLine(item, totalColorQty, totalColorPrice, showProductDetails));
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
                                if(item.addonCharges.length > 0){
                                     lines.push(this.blankGridLine());
                                }
                                item.addonCharges.forEach((charge) => {
                                    let chargeCost = '';
                                    let totalChargeCost = 'Included';                    
                                    chargeCost = this.transformCurrencyForPO(charge.cost)
                                    totalChargeCost = this.transformCurrencyForPO(charge.totalCost, true)
                                    lines.push([
                                        { text: `${charge.name} `, margin: [16, 0, 0, 0] },
                                        { text: '', alignment: 'right', style: 'smallGray' },
                                        this.noBorderQtyPriceColumns([charge.quantity]),
                                        this.noBorderQtyPriceColumns([chargeCost]),
                                        this.noBorderQtyPriceColumns([totalChargeCost]),
                                    ]);
                                });                        
                        });

                        });

                }

                });
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
    
    lineItemGridTable(): any {
        this.totalQty = 0;
        const { order, docOptions, vendorId } = this.config;
        let showProductDetails = true;
        const lineItemTable = {
            layout: 'gridOrder',
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: [110,'*', 40, 60, 60],
                body: [
                    // Table Header
                    [
                        { text: '',border: [false, false, false, false]},
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                    ]
                ],
                dontBreakRows: true,
            },
        };

        const lines = [];
        //const filteredItems = this.getApplicableItems();
        const filteredItems = groupBy(this.getApplicableItems(), 'alternateShipToAccountId');
        each(keys(filteredItems), iKey => {

            if(keys(filteredItems).length > 1 && filteredItems[iKey][0].poShippingBillingDetails){
                lines.push(this.shipToHeadingLine());
                lines.push(this.shipToDetailsLine(filteredItems[iKey][0].poShippingBillingDetails));            
            }        
                filteredItems[iKey].forEach((item: any) => {

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
                                        if(design.designs && design.supplierDecoratedVendorId && design.supplierDecoratedVendorId == vendorId && design.supplierDecorated == "1"){
                                            designString = designString.concat(design.designs.split(' ').sort().join(' '))+' ';

                                        }
                                    });
                                    designString = designString.trim();
                                    if(designString !==''){
                                            if(typeof decoDesignStrings[designString] == 'undefined'){
                                                decoDesignStrings[designString] = [];
                                                decoDesignMatrixDetails[designString] = [];
                                            }
                                            decoDesignStrings[designString].push(row);
                                            decoDesignMatrixDetails[designString].push(row.matrixUpdateId);
                                    
                                    }
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
                        let totalColorPrice = 0;         
                        let decoLines = [];
                        let totalDecoPrice = [];
                        let totalDecoQty = [];
                        if(typeof decoDesignStrings[designKey] !== 'undefined'){
                                decoDesignStrings[designKey].forEach((dRow: any) => {
                                        totalColorQty = (totalColorQty*1) + (dRow.quantity*1);
                                        totalColorPrice = (totalColorPrice*1) + (dRow.totalCost*1);
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
                                    console.log('multiSizeGrid');
                                    console.log(multiSizeGrid);
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
                                        // TODO price key needed to be casted to guarantee total quantity is multiplied by a number
                                        // find out if this function still works as expected
                                        const priceNumber: number = parseInt(priceKey)
                                        totalPrice.push(this.transformCurrencyForPO((totalQty * priceNumber),  true));

                                        if(showProductDetails){
                                            //lines.push(this.productHeadingLine());
                                            lines.push(this.productDetailsLine(item, totalColorQty, totalColorPrice, showProductDetails));
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
                        if(item.addonCharges.length > 0){
                             lines.push(this.blankGridLine());
                        }
                        item.addonCharges.forEach((charge) => {
                            let chargeCost = '';
                            let totalChargeCost = 'Included';                    
                            chargeCost = this.transformCurrencyForPO(charge.cost)
                            totalChargeCost = this.transformCurrencyForPO(charge.totalCost, true)
                            lines.push([
                                { text: `${charge.name} `, margin: [16, 0, 0, 0] },
                                { text: '', alignment: 'right', style: 'smallGray' },
                                this.noBorderQtyPriceColumns([charge.quantity]),
                                this.noBorderQtyPriceColumns([chargeCost]),
                                this.noBorderQtyPriceColumns([totalChargeCost]),
                            ]);
                        });
                        });

                }

                });
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
    
    getMatrixRowLines(item: LineItem, row: Partial<MatrixRow>) {
        const { docOptions } = this.config;

        const lines = [];
        let rowCost = row.cost;
        let rowQuantity = `${row.unitQuantity}`;
        if (row.uomConversionRatio) {
            rowCost = rowCost * row.uomConversionRatio;
        }
        if (row.uomAbbreviation) {
            rowQuantity += ` ${row.uomAbbreviation}`;
        }

        const rowDescriptionCell = this.getRowDescriptionCell(item, row);

        const rowLine: any = [
            rowDescriptionCell,
            { text: rowQuantity, alignment: 'right' },
            { text: this.transformCurrencyForPO(rowCost), alignment: 'right' },
            { text: this.transformCurrencyForPO(row.totalCost, true), alignment: 'right' },
        ];
        if (item.lineType == '1') {
            this.totalQty = (this.totalQty * 1) + (row.quantity * 1);
        }
        lines.push(rowLine);

        if (item.decoVendors && item.decoVendors.length) {
            const decoLines = this.decorationLines(item, row);
            decoLines.forEach((decoLine) => {
                lines.push(decoLine);
            });
        }
        return lines;
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
                fit: [32, 16],
                width: 32,
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

        if (deco.decorationNotes) {
            description.stack.push({ text: deco.decorationNotes });
        }
        
        
        const colors = this.getDecoColors(deco);
        if (colors) {
            description.stack.push(colors);
        }

        node.columns.push(description);

        return node;
    }
    processGeneralNotes(item, row) {
        const { docOptions, vendorId } = this.config;

        const lines = [];

        if (item.decoVendors && item.decoVendors.length) {
            item.decoVendors
                .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId))
                .forEach((deco) => {

                    if(item.hideLine != '1' || (item.hideLine != '1' && deco.totalPrice > 0)) {
                        if((vendorId == deco.decorationVendorId || vendorId == deco.vendorId) && deco.vendorSupplierDecorated == "1" && deco.decorationNotes && deco.decorationNotes != '' && this.generalDecoNote.indexOf(`${deco.designModal}: ${deco.decorationNotes}`) < 0 ){
                            this.generalDecoNote.push(`${deco.designModal}: ${deco.decorationNotes}`);
                        }
                    }
                });
        }
        return lines;
    }
    decorationGridLines(item, row, docType = 'order', totalColorQty = 0, matrixRowsByVariationKey = '') {
        const { docOptions, vendorId } = this.config;

        const lines = [];
        console.log('matrixRowsByVariationKey');
        console.log(matrixRowsByVariationKey);
        console.log('variationUniqueId');
        console.log(row.variationUniqueId);

        if (item.decoVendors && item.decoVendors.length) {
            item.decoVendors
                .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId && matrixRowsByVariationKey.indexOf(row.variationUniqueId) > -1))
                .forEach((deco) => {
                    if((vendorId == deco.decorationVendorId || vendorId == deco.vendorId)){
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

                                            decoDescriptionDetails = `${designName} ${designVariationTitle} Type : ${deco.decoTypeName} \n Location : v${deco.decoLocation} \n ${colors}`;
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
                                    { text: this.transformCurrencyForOrder(Number(totalDecoCost).toFixed(2)), alignment: 'right', border: [false, true, true, true], style: 'smallGray' },
                                ]);
                            }
                    }

                });
        }
        return lines;
    }
    decorationLines(item, row) {
        const { vendorId } = this.config;
        const lines = [];
        if (item.decoVendors && item.decoVendors.length) {
            item.decoVendors
                .filter((deco: IDecoVendor) => {
                    return deco.vendorSupplierDecorated == '1'
                        && (vendorId == deco.decorationVendorId || vendorId == deco.vendorId) && deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId);
                })
                .forEach((deco: IDecoVendor) => {
                    const description = this.getDecoDescription(deco);
                    let quantity = deco.quantity;

                    if (item.calculatorData && item.calculatorData.length) {
                        quantity = '';
                    }
                    lines.push([
                        description,
                        { text: `${quantity}`, alignment: 'right' },
                        { text: this.transformCurrencyForPO(deco.itemCost), alignment: 'right' },
                        { text: this.transformCurrencyForPO(deco.totalCost.toFixed(2)), alignment: 'right' },
                    ]);
                    deco.addonCharges.forEach((charge) => {
                        lines.push([
                            { text: `${charge.name} `, margin: [24, 0, 0, 0] },
                            { text: `${charge.quantity} `, alignment: 'right' },
                            { text: this.transformCurrencyForPO(charge.cost), alignment: 'right' },
                            { text: this.transformCurrencyForPO(charge.totalCost), alignment: 'right' },
                        ]);
                    });
                });
        }

        return lines;
    }

    rolledDecorationGrid(item, row) {
        const { vendorId } = this.config;
        const columns = [];
        if (item.decoVendors && item.decoVendors.length) {
            item.decoVendors
                .filter((deco: IDecoVendor) => {
                    return deco.vendorSupplierDecorated == '1'
                        && (vendorId == deco.decorationVendorId || vendorId == deco.vendorId) && deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId);
                })
                .forEach((deco) => {
                    const decoImageUrl = this.getDecoImageUrl(deco);
                    columns.push(
                        {
                            columns: [
                                {
                                    image: this.lookupImage(decoImageUrl),
                                    fit: [32, 16],
                                    alignment: 'right',
                                    width: 32,
                                },
                                { text: `${deco.decoTypeName} ${deco.decoLocation}` },
                            ],
                            margin: [0, 4, 0, 4]
                        },
                    );
                });
        }
        return columns;
    }

    lineItemDescription(item) {
        let description = '';

        description += item.vendorProductName ? `${item.vendorProductName} ` : `${item.productName} `;

        if (item.productId) {
            description += ` - ${item.productId} `;
        }

        if (item.vendorPONote) {
            description += ` - ${item.vendorPONote} `;
        }

        if (item.inhandDate && item.overrideInHandDate == '1') {
            description += '\n In hands date: ' + this.formatter.transformDate(item.inhandDate);
        }

        return description;
    }

    headerVendorPoNotes() {
    
        const { docOptions } = this.config;
        if (docOptions && docOptions[36] && docOptions[36].value) {
                const filteredItems = this.getApplicableItems();
                const node = { stack: [] };
                filteredItems.forEach(item => {
                    if (item.vendorPONote) {
                        node.stack.push(item.vendorPONote);
                    }
                });

                if (node.stack.length) {
                    node.stack.unshift({ text: this.getDynamicDocLabel('poNotes', 'PO Notes')+':', bold: true });
                }

                return node;        
        }
        return null;
    }
    footerVendorPoNotes() {
        const { docOptions } = this.config;
        if(docOptions && docOptions[36] && docOptions[36].value){
            return null;
        }else{
                const filteredItems = this.getApplicableItems();
                const node = { stack: [] };
                filteredItems.forEach(item => {
                    if (item.vendorPONote) {
                        node.stack.push(item.vendorPONote);
                    }
                });

                if (node.stack.length) {
                    node.stack.unshift({ text: this.getDynamicDocLabel('poNotes', 'PO Notes')+':', bold: true });
                }

                return node;            
        }
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
    getPageMargins() {
    const { docGridView } = this.config;
        if(docGridView){
            return [20, 20, 20, 20];
        }else{
            return [40, 40, 40, 40];
        }
    }
    getPageSize() {
    const { docGridView } = this.config;
        if(docGridView){
            return {width: 700, height: 900};
        }else{
            return 'A4';
        }
    }
    blankGridLine() {

    const blankLine =  [{ text: ' ', alignment: 'right', colSpan: 5, border: [false, false, false, false],} ];
            return blankLine;
    }
    productHeadingLine() {
      const productLine: any = [
        { text: 'Item', alignment: 'center', border: [false, false, false, false], style: 'smallText' },
        { text: 'Description', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
        { text: '', alignment: 'center', border: [false, false, false, false], style: 'smallText' },
        { text: '', alignment: 'right', border: [false, false, false, false], style: 'smallText' },
        { text: '', alignment: 'center', border: [false, false, false, false], style: 'smallText' },
      ];
      return productLine;
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
        { text: '', alignment: 'right', border: [false, true, true, false], style: 'smallText' },
      ];
      return productLine;
    }
    
    getDefaultProductsSizes(productSizes){
        const sizeTable = {
            layout: 'gridSize',    
            style: 'smallGray',
            alignment:'center',
            table: {
                headerRows: 0,
                widths:[],
                body: [],
                dontBreakRows: true,
            }
        };
        const line = [];
        productSizes.forEach((value) => {
         sizeTable.table.widths.push('*');
         line.push({
                text: value,
                alignment: 'center',
                style: 'smallGray',
            });
        });        
           sizeTable.table.body.push(line);
        return sizeTable;
    }

    getDefaultProductsPricesA(){
        const sizeTable = {
            layout: 'order',
            style: 'smallGray',
            table: {
                headerRows: 0,
                body: [],
                dontBreakRows: true,
            }
        };
        this.defaultProductsPricesA.forEach((value) => {
           sizeTable.table.body.push({
                text: value,
                alignment: 'center',
                style: 'smallGray',
                border: [false, false, false, false]
            });
        });
        return sizeTable;
    }

    noBorderQtyPriceColumns(data, productSizeCount = 0, perRowSizes = 0){
        const qtyGrid = {
            layout: 'gridSize',    
            alignment:'right',
            table: {
                headerRows: 0,
                widths:['*'],
                body: [],
                dontBreakRows: true,
            }
        };        
        data.forEach((value) => {
        const line = [];
        line.push([
            {
                text: value,
                alignment: 'right',
                style: 'smallGray',
                border: [false, false, false, false]
            }
        ]);

         qtyGrid.table.body.push(line);
        });        
        return qtyGrid;
    }
    getApplicableShippingItemsDetails() {
        const filteredItems = groupBy(this.getApplicableItems(), 'alternateShipToAccountId');
        return filteredItems;
    }
    shipToHeadingLine() {
      const { docGridView } = this.config;
      const productLine: any = [
        { text: 'Ship To', alignment: 'left', bold: true, border: [false, false, false, false], style: 'smallText' },
        { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
        { text: '', alignment: 'center', border: [false, false, false, false], style: 'smallText' },
        { text: '', alignment: 'right', border: [false, false, false, false], style: 'smallText' },
      ];
      if(docGridView){
          productLine.push({ text: '', alignment: 'center', border: [false, false, false, false], style: 'smallText' })
      }
      return productLine;
    }
    shipToDetailsLine(details) {
        const { docGridView } = this.config;
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
      const shippingLine: any = [
        { text: shippingDetails, alignment: 'left', border: [false, false, false, true], style: 'smallText'},
        { text: '', alignment: 'left', border: [false, false, false, true], style: 'smallText'},
        { text: '' ,  alignment: 'right', border: [false, false, false, true], style: 'smallText' },
        { text: '', alignment: 'right', border: [false, false, false, true], style: 'smallText' }
      ];
      if(docGridView){
          shippingLine.push({ text: '', alignment: 'center', border: [false, false, false, true], style: 'smallText' });
      }
      return shippingLine;
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
