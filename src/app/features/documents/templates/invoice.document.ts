import { OrderDetails, LineItem, MatrixRow } from 'app/models';
import { Observable } from 'rxjs';
import { DocumentImageManager, DocumentImageThumbnail } from '../document-image-manager';
import { IDocument, AbstractOrderDocument } from '../document.interface';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';

const chunk = (arr, size) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );
};


export class InvoiceDocument extends AbstractOrderDocument implements IDocument {
    name = 'invoice';
    label = 'Invoice';
    showBarCode = false;
    workOrderCount = '';
    workOrderCountDetails = '';
    totalQty: number;
    docGridView = false;
    hideQuoteTotal = false;
    overrideInHandDateFound: boolean = false;
    defaultProductsSizesA = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
    defaultProductsPricesA = [0,0,0,0,0,0,0,0,0];
    defaultProductsSizesB = ['6XL', '7XL', '8XL'];
    defaultProductsPricesB = ['0', '0', '0'];
    defaultSizeColCount = 9;
    fromCurrencyCode = 'USD';
    fromCurrencySymbol = '$';
    toCurrencyCodeForCustomer = '';
    toCurrencySymbolForCustomer = '';
    exchageRateForCustomer = 1;
    productNamelist = [];

    

    constructor(public config: {
        order: Partial<OrderDetails>,
        logoUrl?: string,
        [x: string]: any,
    }) {
    
        super(config);
        this.imageManager = new DocumentImageManager();
        this.totalQty = 0;  

    }

    getAvailableFields() {
        return [];
    }

    getTotalLineDiscounts() {
        const items = this.getApplicableItems();
        const total = items.reduce((acc, item, index) => {
            let itemDiscount = 0;
            if (item.discount > 0) {
                itemDiscount += parseFloat(item.discount);
            }

            if (item.addonCharges) {
                item.addonCharges.forEach((charge) => {
                    if (charge.discount > 0) {
                        itemDiscount += parseFloat(charge.discount);
                    }
                });
            }

            return acc + itemDiscount;
        }, 0);
        return total;
    }

    getApplicableItems() {
        const { order } = this.config;
        return order.lineItems
            .filter((item) => {
                    return item.hideLine != '1' || (item.hideLine == '1' && item.totalPrice > 0 && item.lineType != '4' && item.lineType != '5' && item.isKitChild != '1') ;
            });
    }

    getImages(): DocumentImageThumbnail[] {
        const { order } = this.config;

        const images = this.getApplicableItems().reduce((collection, item, index) => {
            if (item.quoteCustomImage && item.quoteCustomImage.length) {
                item.quoteCustomImage.forEach((image) => {
                    if (!collection.find(x => x.src === image)) {
                        collection.push({ src: image });
                    }
                });
            }
            item.matrixRows.forEach((row) => {
                if (row.imageUrl && !collection.find(x => x.src === row.imageUrl)) {
                    collection.push({ src: row.imageUrl });
                }
            });
            item.decoVendors.forEach((deco) => {
                const decoImageUrl = this.getDecoImageUrl(deco);
                if (decoImageUrl && !collection.find(x => x.src === decoImageUrl)) {
                    collection.push({ src: decoImageUrl });
                }
            });
            return collection;
        }, []);

        if (this.config && this.config.logoUrl) {
            images.push({ src: this.config.logoUrl, width: 300 });
        }
        if (this.showBarCode && order.barCodeURL) {
            if(this.workOrderCount != ''){
                let overrideText = order.orderNo+'w'+this.workOrderCount;
                images.push({ src: `${order.barCodeURL}&overrideText=${overrideText}`, width: 200});
            }else{
                images.push({ src: order.barCodeURL, width: 99 });
            }
        }
        return images;
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
                configKey: 1,
                value: this.formatter.transformDate(order.orderDate),
                label: ( order.orderType == 'PO' ? 'PO Date' : (order.orderType == 'ARINVOICE' ? 'Invoice Date' : (order.orderType == 'Quote' ? 'Quote Date' : this.getFieldLabel('orderDate'))))
            },
            {
                configKey: 32,
                value: order.bookedDate,
                label: 'Booked Date'
            },
            {
                configKey: 4,
                value: this.formatter.transformDate(order.dueDate),
                label: this.getFieldLabel('dueDate')
            },            ,
            {
                configKey: 0,
                value: this.transformCurrencyForOrder(order.finalGrandTotalPrice, true),
                label: this.getFieldLabel('finalGrandTotalPrice')
            },
            {
                configKey: 2,
                value: this.formatter.transformDate(order.inHandDateBy),
                label: order.orderType == 'PO' ? 'In-Hands Date' : this.getFieldLabel('inHandDateBy')
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
                configKey: 34,
                value: this.formatter.transformDate(order.supplierShipDate),
                label: this.getFieldLabel('supplierShipDate')
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
    summaryTable() {
        const { order, docOptions } = this.config;
        const node: any = {
            stack: []
        };
        const fields = this.summaryFields();

        if (this.config.ordersConfig && this.config.ordersConfig.settings && this.config.ordersConfig.settings.gstNumberForInvoice != '') {
            node.stack.push(
                {
                    text: [
                        { text: 'GST# ', style: 'fieldLabel' },
                        { text: this.config.ordersConfig.settings.gstNumberForInvoice }
                    ],
                    alignment: 'right',
                }
            );            
        }
        if (this.config.ordersConfig && this.config.ordersConfig.settings && this.config.ordersConfig.settings.abnNumberForInvoice != '') {
            node.stack.push(
                {
                    text: [
                        { text: 'ABN# ', style: 'fieldLabel' },
                        { text: this.config.ordersConfig.settings.abnNumberForInvoice }
                    ],
                    alignment: 'right',
                }
            );            
        }
        if (this.name === 'invoice') {

            node.stack.push(
                {
                    text: [
                        { text: this.getFieldLabel('invoiceDate', 'Invoice Date: '), style: 'fieldLabel' },
                        { text: this.formatter.transformDate(order.invoiceDate) }
                    ],
                    alignment: 'right',
                }
            );
            
        }
        if (this.name === 'invoice-proforma') {
            node.stack.push(
                {
                    text: [
                        { text: this.getFieldLabel('invoiceDate', 'Invoice Date: '), style: 'fieldLabel' },
                        { text: this.formatter.transformDate(order.proformaDate) }
                    ],
                    alignment: 'right',
                }
            );
        }

        fields.forEach((field) => {
            if (docOptions[field.configKey] && docOptions[field.configKey].value && field.value) {
                if((field.configKey === 2) && (this.overrideInHandDateFound)){
                    return true;
                }
                if((field.configKey === 32) && (field.value == '0000-00-00' || field.value == '')){
                    return true;
                }
                
                node.stack.push(
                    {
                        text: [
                            { text: `${field.label}: `, style: 'fieldLabel' },
                            { text: field.value }
                        ],
                        alignment: 'right',
                    }
                );
            }
        });
        return node;
    }

    subheader(): any {
        
        const { order, docGridView, docOptions } = this.config;
        const title = this.getTitle();
        if(this.showBarCode){
        var orderNo = '#'+order.orderNo;
        let barCodeURL = order.barCodeURL;
        if(this.workOrderCount !=''){
            orderNo = '#'+order.orderNo+'-'+this.workOrderCount;
            let overrideText = order.orderNo+'w'+this.workOrderCount;
            barCodeURL = `${barCodeURL}&overrideText=${overrideText}`
            console.log(docOptions[40]);
        }
                return [{
                    layout: 'noBorders',
                    table: {
                        widths: [150, '*', 100],
                        body: [
                            // Table Header
                            [
                                //{ image: this.config.logoUrl ? this.config.logoUrl : 'placeholder', width: 150 },
                                (docOptions[40] && docOptions[40].value) ? { image: this.config.logoUrl ? this.config.logoUrl : 'placeholder', width: 150 } : {text: '', style: 'header', alignment: 'right', width: 150},
                                { stack: [
                                    { text: `${title}`, style: 'header', alignment: 'right' },
                                    { text: this.workOrderCountDetails , alignment: 'right',fontSize: 16, bold: true },
                                  ]
                                },
                                { stack: [
                                    { image: barCodeURL ? (barCodeURL) : 'placeholder', width: 99 , alignment: 'center' , fit: [99, 30] },
                                    { text: orderNo, alignment: 'center',fontSize: 16, bold: true },
                                  ]
                                },
                            ],

                        ],
                        dontBreakRows: true,
                    }
                },
                    (docGridView) ? this.horizontalLineGridView() : this.horizontalLine(),
                    this.billingDetails()
                ];        
        }else{
                return [
                    {
                        columns: [
                            //{ image: this.config.logoUrl ? this.config.logoUrl : 'placeholder', width: 150 },
                            (docOptions[40] && docOptions[40].value) ? { image: this.config.logoUrl ? this.config.logoUrl : 'placeholder', width: 150 } : {text: '', style: 'header', alignment: 'right', width: 150},
                            {
                                text: `${title} #${order.orderNo}`, style: 'header', alignment: 'right'
                            },
                        ]
                    },
                    (docGridView) ? this.horizontalLineGridView() : this.horizontalLine(),
                    this.billingDetails()
                ];        
        }

    }

    getTitle() {
        return this.getDynamicDocLabel('heading', this.getDocLabel('title'));
    }

    billingDetails() {
        const { order, docOptions } = this.config;


        let billingDetails = order.billingCompanyName;
        if (docOptions && docOptions[21] && docOptions[21].value && order.billingCustomerName && order.billingCompanyName.trim() !== order.billingCustomerName.trim()) {
            let billingCustomerSalutation = '';
            if(order.billingCustomerSalutation && order.billingCustomerSalutation !=''){
                billingCustomerSalutation = order.billingCustomerSalutation + ' ';
            }
            billingDetails += '\n' + billingCustomerSalutation + '' + order.billingCustomerName;
        }
        if (docOptions && docOptions[42] && docOptions[42].value && order.billingCustomerEmail) {
            billingDetails += '\nEmail: ' + order.billingCustomerEmail;
        }
        if (order.billingStreet) {
            billingDetails += '\n' + order.billingStreet;
        }
        if (order.billingStreet2) {
            billingDetails += '\n' + order.billingStreet2;
        }
        if (order.billingCity) {
            billingDetails += '\n' + order.billingCity;
        }
        if (order.billingState) {
            billingDetails += ' ' + order.billingState;
        }
        if (order.billingPostalcode) {
            billingDetails += ' ' + order.billingPostalcode;
        }
        if (order.billingCountry) {
            billingDetails += '\n' + order.billingCountry;
        }
        if (docOptions && docOptions[22] && docOptions[22].value && order.billingPhone) {
            billingDetails += '\n' + order.billingPhone;
        }

        let shippingDetails = order.shippingCompanyName;
        if (docOptions && docOptions[21] && docOptions[21].value && order.shippingCustomerName && order.shippingCustomerName.trim() !== order.shippingCompanyName.trim()) {
            let shippingCustomerSalutation = '';
            if(order.shippingCustomerSalutation && order.shippingCustomerSalutation !=''){
                shippingCustomerSalutation = order.shippingCustomerSalutation + ' ';
            }
            shippingDetails += '\n' + shippingCustomerSalutation + '' + order.shippingCustomerName;
        }
        if (docOptions && docOptions[42] && docOptions[42].value && order.shippingCustomerEmail) {
            shippingDetails += '\nEmail: ' + order.shippingCustomerEmail;
        }
        if (order.shippingStreet) {
            shippingDetails += '\n' + order.shippingStreet;
        }
        if (order.shippingStreet2) {
            shippingDetails += '\n' + order.shippingStreet2;
        }
        if (order.shippingCity) {
            shippingDetails += '\n' + order.shippingCity;
        }
        if (order.shippingState) {
            shippingDetails += ' ' + order.shippingState;
        }
        if (order.shipPostalcode) {
            shippingDetails += ' ' + order.shipPostalcode;
        }
        if (order.shipCountry) {
            shippingDetails += '\n' + order.shipCountry;
        }
        if (docOptions && docOptions[22] && docOptions[22].value && order.shippingPhone) {
            shippingDetails += '\n' + order.shippingPhone;
        }

        return {
            columns: [
                [
                    // Billing Headers
                    {
                        columns: [
                            { width: '70%', text: this.getDynamicDocLabel('billTo', 'Bill To'), style: 'fieldLabel' },
                            { width: '70%', text: this.getDynamicDocLabel('shipTo', 'Ship To'), style: 'fieldLabel' },
                        ]
                    },
                    // Billing Details
                    {
                        columns: [
                            { width: '70%', text: billingDetails },
                            { width: '70%', text: shippingDetails },
                        ]
                    },
                ],
                this.summaryTable()
            ]
        };
    }

    header(): any {
        return (currentPage, pageCount) => { };
    }

    content() {
    
    const { order, docGridView, docDefaultOptions } = this.config;

        this.fromCurrencyCode = order.fromCurrencyCode;
        this.fromCurrencySymbol = order.fromCurrencySymbol;
        this.toCurrencyCodeForCustomer = order.toCurrencyCodeForCustomer || '';
        this.toCurrencySymbolForCustomer = order.toCurrencySymbolForCustomer || '';
        this.exchageRateForCustomer = order.exchageRateForCustomer || 1;

        if(docGridView){
                return [
                    this.subheader(),
                    '\n',
                    this.horizontalLineGridView(),
                    this.orderNoteTop(),
                    this.lineItemGridTableByVariationGrouping(), // new grouping 
                    //this.lineItemGridTable(),
                    this.lineItemsSummaryGridTable(),
                    this.paymentButton(),
                    this.getPersonalizations(),
                    '\n',
                    this.shipInfoList(),
                    this.orderNote(),
                    this.documentFooterNote(),
                ];

        }else{
                return [
                    this.subheader(),
                    '\n',
                    this.orderNoteTop(),
                    this.lineItemTable(),
                    this.lineItemsSummaryTable(),
                    // ty
                    this.paymentButton(),
                    this.getPersonalizations(),
                    '\n',
                    this.shipInfoList(),
                    this.orderNote(),
                    this.documentFooterNote(),
                ];        
        }
    }

    // ty
    paymentButton() {
        const { docOptions, hideQuoteTotal } = this.config;
        if(this.label == 'Quote' && hideQuoteTotal){
            return '\n';
        }
        if(this.label == 'ARInvoice'){
            return '\n';
        }
        if (docOptions && docOptions[19] && docOptions[19].value) {
            return {
                columns: [
                    { text: '', width: '*' },
                    {
                        ...this.paymentLink(),
                        alignment: 'right',
                        width: 100
                    }
                ]
            };
        }

        return null;
    }    

    orderNoteTop() {

        const { order, docOptions } = this.config;
        if (order.orderNote && docOptions && docOptions[36] && docOptions[36].value) {
            return {
                stack: [
                    { text: 'Order Notes', bold: true },
                    { text: order.orderNote }
                ],
                margin: [0, 16]
            };
        }
    }

    getPersonalizations() {

        const { personalizations, docOptions } = this.config;
        let itemList = [];
        let matrixIdsFound = false;
            if(docOptions && docOptions[41] && docOptions[41].value && personalizations.length > 0){
                const personalizationsTable = {
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
                };
                const lines = [];
                personalizations.forEach((row) => {
                       if(row.displayText && row.color && row.location ){
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
                    personalizationsTable.table.body = [
                        ...personalizationsTable.table.body,
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
    orderNote() {

        const { order, docOptions } = this.config;
        if (order.orderNote) {
            if(docOptions && docOptions[36] && docOptions[36].value){
                return null;
            }else{
                    return {
                        stack: [
                            { text: 'Order Notes', bold: true },
                            { text: order.orderNote }
                        ],
                        margin: [0, 16]
                    };            
            }
        }
    }

    footer() {
        return (currentPage, pageCount) => {
            return {
                columns: [
                    { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right' }
                ],
                margin: [10, 10, 10, 10],
            };
        };
    }




    lineItemDescription(item): any {
        const { docOptions } = this.config;
        const description = [item.productName];
        return description;
    }

    lineItemTable(): any {
        this.totalQty = 0;
        const { order, docOptions } = this.config;
        const lineItemTable = {
            layout: 'order',
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: ['*', 35, 55, 65],
                body: [
                    // Table Header
                    [
                        { text: 'Product', style: 'tableHeader' },
                        { text: 'Qty', style: 'tableHeader' },
                        { text: 'Price', style: 'tableHeader' },
                        { text: 'Total', style: 'tableHeader' },
                    ],

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
            const itemLines = this.transformItemLines(item);
            itemLines.forEach(line => {
                lines.push(line);
            });

            // Show lines for more than one matrix row for all but freight 
            if (item.lineType != '4' && item.lineType != '5') {
                item.matrixRows.forEach((row) => {
                    if(item.hideLine != '1' || (item.hideLine == '1' && row.totalPrice > 0)) {
                        const rowLines: any[] = this.getMatrixRowLines(item, row);
                        rowLines.forEach((rowLine) => {
                            lines.push(rowLine);
                        });
                    }
                });
            }

            item.addonCharges.forEach((charge) => {
                let chargePrice = '';
                let totalChargePrice = 'Included';

                if (item.rollAddonChargesToProduct != '1') {
                    chargePrice = this.transformCurrencyForOrder(charge.price);
                    totalChargePrice = this.transformCurrencyForOrder(charge.totalPrice, true);
                    if(item.hideLine != '1' || (item.hideLine != '1' && charge.totalPrice > 0)) {
                       lines.push([
                            { text: `${charge.name} `, margin: [16, 0, 0, 0] },
                            { text: `${charge.quantity} `, alignment: 'right' },
                            { text: chargePrice, alignment: 'right' },
                            { text: totalChargePrice, alignment: 'right' },
                        ]);
                    }
                }

            });

            // if (item.matrixRows.length > 1) {
            // lines.push(this.getItemSummary(item));
            // }

        });
        console.log('docOptions[43].value');
        console.log(docOptions[43].value);
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

    getApplicableItemsWithDeco(selectedDecoDesigns, selectedWorkDataMatrixIds) {
        const { order } = this.config;
        let selectedDecoDesignsVariations = [];
        selectedDecoDesignsVariations = selectedDecoDesigns ? selectedDecoDesigns.split('-') : '';
        return order.lineItems.reduce((collection, item, index) => {
            const hasRelatedDecoration = item.decoVendors.some((deco) => (selectedDecoDesignsVariations.indexOf(deco.decorationDetails[0].variationUniqueId) > -1 ));


            const matrixRows = item.matrixRows
                .filter((row) => {
                    return row.decoDesigns.some((design) => (selectedWorkDataMatrixIds.indexOf(row.matrixUpdateId) > -1));
                });
            if (hasRelatedDecoration) {
                collection.push({
                    ...item,
                    matrixRows: matrixRows,
                    decoVendors: item.decoVendors.filter((deco) => (selectedDecoDesignsVariations.indexOf(deco.decorationDetails[0].variationUniqueId) > -1)) // Only pass applicable decoVendors
                });
            }
            return collection;
        }, []);
    }

    getApplicableItemsWithoutDeco(excludeMatrixIds) {
        const { order } = this.config;
        return order.lineItems.reduce((collection, item, index) => {

            const matrixRows = item.matrixRows
                .filter((row) => {
                    return (excludeMatrixIds.indexOf(row.matrixUpdateId) < 0);
                });
            if (matrixRows.length > 0) {
                collection.push({
                    ...item,
                    matrixRows: matrixRows
                });
            }
            return collection;
        }, []);
    }
    

    lineItemGridTableByVariationGrouping(): any {
        this.totalQty = 0;
        const { order, docOptions } = this.config;
        const lineItemTable = {
            layout: 'gridOrder',
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                //headerRows: 1,
                widths: [110,'*', 40, 60, 60],
                body: [
                    // Table Header
                    [
                        { text: '',border: [false, false, false, false]},
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                    ],

                ],
                dontBreakRows: true,
            }
        };

        const lines = [];
        const productsWithDecoLines = [];
        const productsWithoutDecoLines = [];
        const filteredItems = this.getApplicableItems();
        let totalDecoVendors = [];
        let uniqueVariationsGroup = [];
        let matrixGroupByDecoration = [];
        let matrixIdsWithDeco = [];
        let matrixToVariationDetails = [];
        const decoDesignStrings = [];
        const decoDesignMatrixDetails = [];

        filteredItems.forEach((item: any) => {
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
        filteredItems.forEach((item: any) => {
            if(typeof this.productNamelist[item.lineItemUpdateId] === 'undefined'){
                this.productNamelist[item.lineItemUpdateId] = item.productName;
            }
            let showProductDetails = true;
            const itemLines = this.transformItemLinesForGrid(item);
            itemLines.forEach(line => {
               // lines.push(line);
            });
            let productSizesSorting = keys(order.productSizesSorting);
            
            item.productSizes.sort(function(a, b) {
                  return productSizesSorting.indexOf(a.toUpperCase()) - productSizesSorting.indexOf(b.toUpperCase());
            });  
            // Show lines for more than one matrix row for all but freight 
            if (item.lineType != '4' && item.hideLine != '1' || (item.hideLine == '1' && item.totalPrice > 0)) {
                if(item.matrixRows.length > 0 ){
                        const decoDesignStrings = [];
                        const decoDesignMatrixDetails = [];

                        item.matrixRows.forEach((row) => {
                                if(item.productSizes.indexOf(row.size) < 0){
                                    item.productSizes.push(row.size);
                                }
                                if (item.lineType == '1') {
                                    this.totalQty = (this.totalQty * 1) + (row.quantity * 1);
                                }    
                                let variationId = 'No Variation';
                                if(typeof matrixToVariationDetails[row.matrixUpdateId.toString()] !=='undefined'){
                                    variationId = matrixToVariationDetails[row.matrixUpdateId.toString()];
                                }

                                if(typeof row.decoDesigns != 'undefined' && row.decoDesigns.length > 0){
                                    let designString = '';
                                    row.decoDesigns.forEach((design: any) => {
                                        if(design.designs){
                                            designString = designString.concat(design.designs.split(' ').sort().join(' '))+' ';

                                        }
                                    });
                                    designString = designString.trim();
                                    if(designString == ''){
                                        designString = 'No Deco';
                                    }
                                    if(designString !=''){
                                            if(decoDesignStrings[designString] === undefined){
                                                decoDesignStrings[designString] = [];
                                                decoDesignMatrixDetails[designString] = [];
                                            }                                            
                                    }
                                    decoDesignStrings[designString].push({
                                    ...row,
                                    variationUniqueId : variationId
                                    });
                                    decoDesignMatrixDetails[designString].push(row.matrixUpdateId);
                                }else{
                                    const designString = 'No Deco';
                                    if(decoDesignStrings[designString] === undefined){
                                        decoDesignStrings[designString] = [];
                                        decoDesignMatrixDetails[designString] = [];
                                    }
                                            //decoDesignStrings[designString].push(row);
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
                                if(typeof matrixRowsByVariations[matrixRowsByVariationKey] !== 'undefined'){
                                        matrixRowsByVariations[matrixRowsByVariationKey].forEach((dRow: any) => {
                                                totalColorQty = (totalColorQty*1) + (dRow.quantity*1);
                                                totalColorPrice = (totalColorPrice*1) + (dRow.totalPrice*1);
                                        });                        
                                }

                        if (typeof decoDesignStrings[designKey] !== 'undefined' && item.decoVendors && item.decoVendors.length && designKey !='No Deco') {
                        decoDesignStrings[designKey].forEach((row, index) => {
                        if(decoLines.length < 1 && matrixRowsByVariationKey.indexOf(row.variationUniqueId) > -1){
                            decoLines = this.decorationGridLines(item, row, 'order', totalColorQty, matrixRowsByVariationKey);
                        }
                        if (item.decoVendors && item.decoVendors.length) {
                            item.decoVendors
                                .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId && matrixRowsByVariationKey.indexOf(row.variationUniqueId) > -1 ))
                                .forEach((deco) => {
                                    const description = this.getDecoDescriptionGrid(deco);
                                    if(typeof totalDecoQty[row.variationUniqueId] !== 'undefined'){
                                    }else{
                                        totalDecoQty[row.variationUniqueId] = 0;
                                        totalDecoPrice[row.variationUniqueId] = (item.rollDecoChargesToProduct == '1') ? '' : 0;
                                    }
                                    if(typeof totalDecoPrice[row.variationUniqueId] !== 'undefined'){
                                    }else{
                                        totalDecoPrice[row.variationUniqueId] = (item.rollDecoChargesToProduct == '1') ? '' : 0;
                                    }
                                    if(item.hideLine != '1' || (item.hideLine != '1' && deco.totalPrice > 0)) {
                                           
                                            totalDecoQty[row.variationUniqueId] += (deco.quantity * 1);
                                            if (item.rollDecoChargesToProduct == '1') {
                                                totalDecoPrice[row.variationUniqueId] = '';
                                            }
                                            else {
                                                totalDecoPrice[row.variationUniqueId] += (deco.totalPrice * 1);
                                            }       
                                    }
                                    if (item.rollDecoAddonChargesToProduct != '1') {
                                        deco.addonCharges.forEach((charge) => {
                                            if(item.hideLine != '1' || (item.hideLine != '1' && charge.totalPrice > 0)) {
                                                decoLines.push([
                                                    { text: `${charge.name} `, margin: [24, 0, 0, 0], style: 'smallGray' },
                                                    { text: '', alignment: 'right', style: 'smallGray' },
                                                    { text: `${charge.quantity} `, alignment: 'right', style: 'smallGray' },
                                                    { text: this.transformCurrencyForOrder(charge.price), alignment: 'right' , style: 'smallGray'},
                                                    { text: this.transformCurrencyForOrder(Number(charge.totalPrice).toFixed(2)), alignment: 'right', style: 'smallGray' },
                                                ]);
                                            }
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
                                            if(typeof decoLines[designIndex][2].text !== 'undefined' && typeof totalDecoQty[totalDecoPriceKey]  !== 'undefined'){
                                                 //decoLines[designIndex][2].text = totalDecoQty[totalDecoPriceKey];
                                            }
                                            if(typeof decoLines[designIndex][4].text !== 'undefined' && typeof totalDecoPrice[totalDecoPriceKey]  !== 'undefined'){
                                                 if (item.rollDecoChargesToProduct == '1') {
                                                     decoLines[designIndex][4].text = '';
                                                 }else{
                                                     //decoLines[designIndex][4].text = this.transformCurrencyForOrder(Number(totalDecoPrice[totalDecoPriceKey]).toFixed(2));
                                                 }
                                                 
                                                 
                                            }
                                        designIndex++;
                                        });
                                        decoLines.forEach((decoLine) => {
                                            lines.push(decoLine);
                                        });                                
                                        showProductDetails = true;
                                }
                        }
                            let colorCnt = 0;
                            each(keys(colorRows), colorKey => {
                                    if(designKey == 'No Deco'){
                                            //lines.push(this.blankGridLine());
                                            if(colorCnt < 1){
                                                showProductDetails = true;
                                            }
                                    }
                                    let showSizeGrid = true;
                                    let productSizeCount = 0;
                                    let perRowSizes = 9;
                                    productSizeCount = item.productSizes.length;
                                    if(productSizeCount == perRowSizes){
                                       //perRowSizes = 9;
                                    }
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

                                    const priceRows = groupBy(colorRows[colorKey], 'price');
                                    //console.log('priceRows.length');
                                    //console.log(keys(priceRows).length);
                                    let multiSizeGrid = this.getDefaultProductsSizesMultGrid(item.productSizes, productSizeCount, perRowSizes, keys(priceRows).length, item.showAttribSize);
                                    //console.log(multiSizeGrid);
                                    each(keys(priceRows), priceKey => {
                                        let rows = priceRows[priceKey];
                                        imageUrl = rows[0].imageUrl;
                                        let totalQty = 0;
                                        const productSizes = [];
                                        const productQty = [];
                                        const productSizesWithQty = [];
                                        if(item.productSizes.length > 0){
                                            item.productSizes.forEach((size) => {
                                                productSizesWithQty[size] = 0;
                                            });    
                                        }
                                        rows.forEach((row: any) => {
                                            productSizes.push(row.size);
                                            productQty.push(row.quantity);
                                            totalQty = (totalQty*1) + (row.quantity*1);
                                            if(typeof productSizesWithQty[row.size] != 'undefined'){
                                                productSizesWithQty[row.size] += (row.quantity*1);
                                            }
                                        });
                                        totalGridQty.push(totalQty);
                                        unitPrice.push(this.transformCurrencyForOrder((priceKey)));
                                        totalPrice.push(this.transformCurrencyForOrder((totalQty * parseFloat(priceKey)), true));

                                        if(showProductDetails){
                                            //lines.push(this.productHeadingLine());
                                            lines.push(this.productDetailsLine(item, totalColorQty, totalColorPrice, showProductDetails));
                                            if (item.lineType != '4' && item.lineType != '5') {
                                                lines.push(this.productDescriptionLine(item));
                                            }
                                            showProductDetails = false;
                                        }else{
                                            //lines.push(this.productDetailsLine(item, totalQty, priceKey, showProductDetails));
                                            //lines.push(this.blankGridLine());
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
                                    const variationImageNode: any = {
                                        columns: []
                                    };
                                    if (docOptions[44] && docOptions[44].value) {
                                        variationImageNode.columns.push({image: this.lookupImage(imageUrl),fit: [32, 32],width: 32,alignment: 'center'})
                                    }else{
                                        //variationImageNode.columns.push({text: '',style: 'smallGray'});
                                    }
                                    variationImageNode.columns.push({text: colorKey,style: (item.showAttribColor == '1') ? 'smallGray' : 'smallWhite', margin: [0, 12]})
                                    const  DefaultSizeMultiGrid =  [
                                     variationImageNode,
                                     multiSizeGrid,
                                     this.noBorderQtyPriceColumns(totalGridQty, productSizeCount, perRowSizes),
                                     this.noBorderQtyPriceColumns(unitPrice, productSizeCount, perRowSizes),
                                     this.noBorderQtyPriceColumns(totalPrice, productSizeCount, perRowSizes),
                                        ];
                                    totalGridQty.forEach((value) => {
                                        //DefaultSizeGrid.push(totalGridQtyStack);
                                    });
                                    unitPrice.forEach((value) => {
                                        //DefaultSizeGrid.push(totalGridQtyStack);
                                    });
                                    totalPrice.forEach((value) => {
                                        //DefaultSizeGrid.push(totalGridQtyStack);
                                    });

                                    //lines.push(DefaultSizeGrid);
                                    lines.push(DefaultSizeMultiGrid);
                                    
                                    //lines.push(this.blankGridLine());
                                    colorCnt++;
                            });
                        });

                        });

                }
            }
            if(item.addonCharges.length > 0 && item.rollAddonChargesToProduct != '1' && item.hideLine != '1'){
                lines.push(this.blankGridLine());
            }
            item.addonCharges.forEach((charge) => {
                let chargePrice = '';
                let totalChargePrice = 'Included';

                if (item.rollAddonChargesToProduct != '1') {
                    chargePrice = this.transformCurrencyForOrder(charge.price);
                    totalChargePrice = this.transformCurrencyForOrder(charge.totalPrice, true);
                    if(item.hideLine != '1' || (item.hideLine != '1' && charge.totalPrice > 0)) {
                       lines.push([
                            { text: `${charge.name} `, margin: [16, 0, 0, 0], style: 'smallGray' },
                            { text: '', alignment: 'right', style: 'smallGray' },
                            this.noBorderQtyPriceColumns([charge.quantity]),
                            this.noBorderQtyPriceColumns([chargePrice]),
                            this.noBorderQtyPriceColumns([totalChargePrice])
                        ]);
                    }
                }

            });

            // if (item.matrixRows.length > 1) {
            // lines.push(this.getItemSummary(item));
            // }

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
        console.log(lineItemTable)
        return lineItemTable;
    }

    
    lineItemGridTable(): any {
        this.totalQty = 0;
        const { order, docOptions } = this.config;
        const lineItemTable = {
            layout: 'gridOrder',
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                //headerRows: 1,
                widths: [110,'*', 40, 60, 60],
                body: [
                    // Table Header
                    [
                        { text: '',border: [false, false, false, false]},
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                    ],

                ],
                dontBreakRows: true,
            }
        };

        const lines = [];
        const productsWithDecoLines = [];
        const productsWithoutDecoLines = [];
        const filteredItems = this.getApplicableItems();
        let totalDecoVendors = [];
        let uniqueVariationsGroup = [];
        let matrixGroupByDecoration = [];
        let matrixIdsWithDeco = [];
        const decoDesignStrings = [];
        const decoDesignMatrixDetails = [];
/*
        filteredItems.forEach((item: any) => {
                    if (item.lineType != '4' && item.hideLine != '1' || (item.hideLine == '1' && item.totalPrice > 0)) {
                        if(typeof item.matrixRows !=='undefined' && item.matrixRows.length > 0 ){
                                item.matrixRows.forEach((row) => {                
                                        if(typeof row.decoDesigns != 'undefined' && row.decoDesigns.length > 0){
                                            let designString = '';
                                            row.decoDesigns.forEach((design: any) => {
                                                if(design.designs){
                                                    designString = designString.concat(design.designs.split(' ').sort().join(' '))+' ';

                                                }
                                            });
                                            designString = designString.trim();
                                            if(designString !=''){
                                                    if(decoDesignStrings[designString] === undefined){
                                                        decoDesignStrings[designString] = [];
                                                        decoDesignMatrixDetails[designString] = [];
                                                    }                                            
                                            }
                                                    decoDesignStrings[designString].push(row);
                                                    decoDesignMatrixDetails[designString].push(row.matrixUpdateId);
                                        }else{
                                                    const designString = 'No Deco';

                                                    if(decoDesignStrings[designString] === undefined){
                                                        decoDesignStrings[designString] = [];
                                                        decoDesignMatrixDetails[designString] = [];
                                                    }
                                                    decoDesignStrings[designString].push(row);
                                                    decoDesignMatrixDetails[designString].push(row.matrixUpdateId);
                                        }
                                });
                        }
                    }
        });
        console.log('decoDesignMatrixDetails')
        console.log(decoDesignMatrixDetails)
        */
        
        filteredItems.forEach((item: any) => {
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
        /*
        each(keys(uniqueVariationsGroup), variationKey => {
            let filteredItemsWithDecoration = [];
            let filteredGroupedItemsWithDecoration = [];
            filteredItemsWithDecoration = this.getApplicableItemsWithDeco(variationKey, uniqueVariationsGroup[variationKey]);
            //console.log('filteredItemsWithDecoration');
            //console.log(filteredItemsWithDecoration);
            filteredGroupedItemsWithDecoration = groupBy(filteredItemsWithDecoration, 'productId');
            let showProductDetails = true;
            console.log('filteredGroupedItemsWithDecoration');
            console.log(filteredGroupedItemsWithDecoration);
            
            each(keys(filteredGroupedItemsWithDecoration), pKey => {
                //let item = Object.assign({}, filteredGroupedItemsWithDecoration[pKey]);
                let items = filteredGroupedItemsWithDecoration[pKey];
                filteredItems.forEach((item: any) => {
                    // Show lines for more than one matrix row for all but freight 
                    if (item.lineType != '4' && item.hideLine != '1' || (item.hideLine == '1' && item.totalPrice > 0)) {
                        if(typeof item.matrixRows !=='undefined' && item.matrixRows.length > 0 ){
                                const decoDesignStrings = [];
                                const decoDesignMatrixDetails = [];

                                item.matrixRows.forEach((row) => {
                                        if (item.lineType == '1') {
                                            this.totalQty = (this.totalQty * 1) + (row.quantity * 1);
                                        }                        
                                        if(typeof row.decoDesigns != 'undefined' && row.decoDesigns.length > 0){
                                            let designString = '';
                                            row.decoDesigns.forEach((design: any) => {
                                                if(design.designs){
                                                    designString = designString.concat(design.designs.split(' ').sort().join(' '))+' ';

                                                }
                                            });
                                            designString = designString.trim();
                                            if(designString !=''){
                                                    if(decoDesignStrings[designString] === undefined){
                                                        decoDesignStrings[designString] = [];
                                                        decoDesignMatrixDetails[designString] = [];
                                                    }                                            
                                            }
                                                    decoDesignStrings[designString].push(row);
                                                    decoDesignMatrixDetails[designString].push(row.matrixUpdateId);
                                        }else{
                                                    const designString = 'No Deco';

                                                    if(decoDesignStrings[designString] === undefined){
                                                        decoDesignStrings[designString] = [];
                                                        decoDesignMatrixDetails[designString] = [];
                                                    }
                                                    decoDesignStrings[designString].push(row);
                                                    decoDesignMatrixDetails[designString].push(row.matrixUpdateId);
                                        }
                                });
                                //console.log('decoDesignStrings');
                                //console.log(decoDesignStrings);
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
                                                totalColorPrice = (totalColorPrice*1) + (dRow.totalPrice*1);
                                        });                        
                                }
                                if (typeof decoDesignStrings[designKey] !== 'undefined' && item.decoVendors && item.decoVendors.length && designKey !='No Deco') {
                                decoDesignStrings[designKey].forEach((row, index) => {
                                    if(index < 1){
                                        decoLines = this.decorationGridLines(item, row, 'order');
                                    }

                                if (item.decoVendors && item.decoVendors.length) {
                                    item.decoVendors
                                        .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId))
                                        .forEach((deco) => {
                                            const description = this.getDecoDescriptionGrid(deco);
                                            if(typeof totalDecoQty[deco.designModal] !== 'undefined'){
                                            }else{
                                                totalDecoQty[deco.designModal] = 0;
                                                totalDecoPrice[deco.designModal] = (item.rollDecoChargesToProduct == '1') ? '' : 0;
                                            }
                                            if(typeof totalDecoPrice[deco.designModal] !== 'undefined'){
                                            }else{
                                                totalDecoPrice[deco.designModal] = (item.rollDecoChargesToProduct == '1') ? '' : 0;
                                            }
                                            if(item.hideLine != '1' || (item.hideLine != '1' && deco.totalPrice > 0)) {

                                                    totalDecoQty[deco.designModal] += (deco.quantity * 1);
                                                    if (item.rollDecoChargesToProduct == '1') {
                                                        totalDecoPrice[deco.designModal] = '';
                                                    }
                                                    else {
                                                        totalDecoPrice[deco.designModal] += (deco.totalPrice * 1);
                                                    }       
                                            }
                                            if (item.rollDecoAddonChargesToProduct != '1') {
                                                deco.addonCharges.forEach((charge) => {
                                                    if(item.hideLine != '1' || (item.hideLine != '1' && charge.totalPrice > 0)) {
                                                        decoLines.push([
                                                            { text: `${charge.name} `, margin: [24, 0, 0, 0], style: 'smallGray' },
                                                            { text: '', alignment: 'right', style: 'smallGray' },
                                                            { text: `${charge.quantity} `, alignment: 'right', style: 'smallGray' },
                                                            { text: this.transformCurrencyForOrder(charge.price), alignment: 'right' , style: 'smallGray'},
                                                            { text: this.transformCurrencyForOrder(Number(charge.totalPrice).toFixed(2)), alignment: 'right', style: 'smallGray' },
                                                        ]);
                                                    }
                                                });
                                            }
                                        });
                                }

                                });
        //console.log('totalDecoPrice');
        //console.log(totalDecoPrice);
                                        if(decoLines.length > 0){
                                                lines.push(this.blankGridLine());
                                                let designIndex = 0;
                                                each(keys(totalDecoPrice), totalDecoPriceKey => {
                                                    if(typeof decoLines[designIndex][2].text !== 'undefined' && typeof totalDecoQty[totalDecoPriceKey]  !== 'undefined'){
                                                         decoLines[designIndex][2].text = totalDecoQty[totalDecoPriceKey];
                                                    }
                                                    if(typeof decoLines[designIndex][4].text !== 'undefined' && typeof totalDecoPrice[totalDecoPriceKey]  !== 'undefined'){
                                                         if (item.rollDecoChargesToProduct == '1') {
                                                             decoLines[designIndex][4].text = '';
                                                         }else{
                                                             decoLines[designIndex][4].text = this.transformCurrencyForOrder(Number(totalDecoPrice[totalDecoPriceKey]).toFixed(2));
                                                         }


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
                                            let perRowSizes = 8;
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

                                            const priceRows = groupBy(colorRows[colorKey], 'price');
                                            //console.log('priceRows.length');
                                            //console.log(keys(priceRows).length);
                                            let multiSizeGrid = this.getDefaultProductsSizesMultGrid(item.productSizes, productSizeCount, perRowSizes, keys(priceRows).length);
                                            //console.log(multiSizeGrid);
                                            each(keys(priceRows), priceKey => {
                                                let rows = priceRows[priceKey];
                                                imageUrl = rows[0].imageUrl;
                                                let totalQty = 0;
                                                const productSizes = [];
                                                const productQty = [];
                                                const productSizesWithQty = [];
                                                if(item.productSizes.length > 0){
                                                    item.productSizes.forEach((size) => {
                                                        productSizesWithQty[size] = 0;
                                                    });    
                                                }
                                                rows.forEach((row: any) => {
                                                    productSizes.push(row.size);
                                                    productQty.push(row.quantity);
                                                    totalQty = (totalQty*1) + (row.quantity*1);
                                                    if(typeof productSizesWithQty[row.size] != 'undefined'){
                                                        productSizesWithQty[row.size] += (row.quantity*1);
                                                    }
                                                });
                                                totalGridQty.push(totalQty);
                                                unitPrice.push(this.transformCurrencyForOrder((priceKey)));
                                                totalPrice.push(this.transformCurrencyForOrder((totalQty * priceKey), true));

                                                if(showProductDetails){
                                                    //lines.push(this.productHeadingLine());
                                                    lines.push(this.productDetailsLine(item, totalColorQty, totalColorPrice, showProductDetails));
                                                    
                                                    if (item.lineType != '4' && item.lineType != '5') {
                                                        lines.push(this.productDescriptionLine(item));
                                                    }
                                                    showProductDetails = false;
                                                }else{
                                                    //lines.push(this.productDetailsLine(item, totalQty, priceKey, showProductDetails));
                                                    //lines.push(this.blankGridLine());
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
                                                        //console.log('gridRowOffset');
                                                        //console.log(gridRowOffset);
                                                        //console.log(size);
                                                        if(typeof multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text !== 'undefined'){
                                                             if(multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text == ' '){
                                                                 multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text = 0;
                                                             }
                                                             multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text = parseInt(multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text) + (productQty[qtyIndex]*1);
                                                        }                                        
                                                }else{
                                                        //console.log('gridRowMultiIndex');
                                                        //console.log(gridRowMultiIndex+1);
                                                        //console.log(size);
                                                        //console.log(item.productSizes);
                                                        //console.log(item.productSizes.indexOf(size));
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
                                                                        style: 'smallGray',
                                                                        margin: [0, 12],
                                                                }

                                                              ]

                                              },
                                             sizeGrid,
                                             this.noBorderQtyPriceColumns(totalGridQty),
                                             this.noBorderQtyPriceColumns(unitPrice),
                                             this.noBorderQtyPriceColumns(totalPrice),
                                                ];

                                            const DefaultSizeMultiGrid =  [
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
                                                                        style: 'smallGray',
                                                                        margin: [0, 12],
                                                                }

                                                              ]

                                              },
                                             multiSizeGrid,
                                             this.noBorderQtyPriceColumns(totalGridQty, productSizeCount, perRowSizes),
                                             this.noBorderQtyPriceColumns(unitPrice, productSizeCount, perRowSizes),
                                             this.noBorderQtyPriceColumns(totalPrice, productSizeCount, perRowSizes),
                                                ];
                                            totalGridQty.forEach((value) => {
                                                //DefaultSizeGrid.push(totalGridQtyStack);
                                            });
                                            unitPrice.forEach((value) => {
                                                //DefaultSizeGrid.push(totalGridQtyStack);
                                            });
                                            totalPrice.forEach((value) => {
                                                //DefaultSizeGrid.push(totalGridQtyStack);
                                            });

                                            //lines.push(DefaultSizeGrid);
                                            lines.push(DefaultSizeMultiGrid);

                                            //lines.push(this.blankGridLine());
                                    });
                                });

                        }
                    }
                    if(typeof item.addonCharges !=='undefined' && item.addonCharges.length > 0 && item.rollAddonChargesToProduct != '1' && item.hideLine != '1'){
                        lines.push(this.blankGridLine());
                    }

                    if(typeof item.addonCharges !=='undefined' && item.addonCharges.length > 0 ){
                            item.addonCharges.forEach((charge) => {
                                let chargePrice = '';
                                let totalChargePrice = 'Included';

                                if (item.rollAddonChargesToProduct != '1') {
                                    chargePrice = this.transformCurrencyForOrder(charge.price);
                                    totalChargePrice = this.transformCurrencyForOrder(charge.totalPrice, true);
                                    if(item.hideLine != '1' || (item.hideLine != '1' && charge.totalPrice > 0)) {
                                       lines.push([
                                            { text: `${charge.name} `, margin: [16, 0, 0, 0], style: 'smallGray' },
                                            { text: '', alignment: 'right', style: 'smallGray' },
                                            this.noBorderQtyPriceColumns([charge.quantity]),
                                            this.noBorderQtyPriceColumns([chargePrice]),
                                            this.noBorderQtyPriceColumns([totalChargePrice])
                                        ]);
                                    }
                                }

                            });                    
                    }
                
                });

            });

        });

        let filteredItemsWithoutDecoration = [];
        filteredItemsWithoutDecoration = this.getApplicableItemsWithoutDeco(matrixIdsWithDeco);
        console.log('filteredItemsWithoutDecoration');
        console.log(filteredItemsWithoutDecoration);
        filteredItemsWithoutDecoration.forEach((item: any) => {
            let showProductDetails = true;
        });
*/

        filteredItems.forEach((item: any) => {
            if(typeof this.productNamelist[item.lineItemUpdateId] === 'undefined'){
                this.productNamelist[item.lineItemUpdateId] = item.productName;
            }
            let showProductDetails = true;
            const itemLines = this.transformItemLinesForGrid(item);
            itemLines.forEach(line => {
               // lines.push(line);
            });
            let productSizesSorting = keys(order.productSizesSorting);
            
            item.productSizes.sort(function(a, b) {
                  return productSizesSorting.indexOf(a.toUpperCase()) - productSizesSorting.indexOf(b.toUpperCase());
            });  
            // Show lines for more than one matrix row for all but freight 
            if (item.lineType != '4' && item.hideLine != '1' || (item.hideLine == '1' && item.totalPrice > 0)) {
                if(item.matrixRows.length > 0 ){
                        const decoDesignStrings = [];
                        const decoDesignMatrixDetails = [];

                        item.matrixRows.forEach((row) => {
                                if(item.productSizes.indexOf(row.size) < 0){
                                    item.productSizes.push(row.size);
                                }
                                if (item.lineType == '1') {
                                    this.totalQty = (this.totalQty * 1) + (row.quantity * 1);
                                }                        
                                if(typeof row.decoDesigns != 'undefined' && row.decoDesigns.length > 0){
                                    let designString = '';
                                    row.decoDesigns.forEach((design: any) => {
                                        if(design.designs){
                                            designString = designString.concat(design.designs.split(' ').sort().join(' '))+' ';

                                        }
                                    });
                                    designString = designString.trim();
                                    if(designString !=''){
                                            if(decoDesignStrings[designString] === undefined){
                                                decoDesignStrings[designString] = [];
                                                decoDesignMatrixDetails[designString] = [];
                                            }                                            
                                    }
                                            decoDesignStrings[designString].push(row);
                                            decoDesignMatrixDetails[designString].push(row.matrixUpdateId);
                                }else{
                                            const designString = 'No Deco';

                                            if(decoDesignStrings[designString] === undefined){
                                                decoDesignStrings[designString] = [];
                                                decoDesignMatrixDetails[designString] = [];
                                            }
                                            decoDesignStrings[designString].push(row);
                                            decoDesignMatrixDetails[designString].push(row.matrixUpdateId);
                                }
                        });
                        //console.log('decoDesignStrings');
                        //console.log(decoDesignStrings);
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
                                        totalColorPrice = (totalColorPrice*1) + (dRow.totalPrice*1);
                                });                        
                        }
                        if (typeof decoDesignStrings[designKey] !== 'undefined' && item.decoVendors && item.decoVendors.length && designKey !='No Deco') {
                        decoDesignStrings[designKey].forEach((row, index) => {
                            if(index < 1){
                                decoLines = this.decorationGridLines(item, row, 'order');
                            }

                        if (item.decoVendors && item.decoVendors.length) {
                            item.decoVendors
                                .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId))
                                .forEach((deco) => {
                                    const description = this.getDecoDescriptionGrid(deco);
                                    if(typeof totalDecoQty[deco.designModal] !== 'undefined'){
                                    }else{
                                        totalDecoQty[deco.designModal] = 0;
                                        totalDecoPrice[deco.designModal] = (item.rollDecoChargesToProduct == '1') ? '' : 0;
                                    }
                                    if(typeof totalDecoPrice[deco.designModal] !== 'undefined'){
                                    }else{
                                        totalDecoPrice[deco.designModal] = (item.rollDecoChargesToProduct == '1') ? '' : 0;
                                    }
                                    if(item.hideLine != '1' || (item.hideLine != '1' && deco.totalPrice > 0)) {
                                           
                                            totalDecoQty[deco.designModal] += (deco.quantity * 1);
                                            if (item.rollDecoChargesToProduct == '1') {
                                                totalDecoPrice[deco.designModal] = '';
                                            }
                                            else {
                                                totalDecoPrice[deco.designModal] += (deco.totalPrice * 1);
                                            }       
                                    }
                                    if (item.rollDecoAddonChargesToProduct != '1') {
                                        deco.addonCharges.forEach((charge) => {
                                            if(item.hideLine != '1' || (item.hideLine != '1' && charge.totalPrice > 0)) {
                                                decoLines.push([
                                                    { text: `${charge.name} `, margin: [24, 0, 0, 0], style: 'smallGray' },
                                                    { text: '', alignment: 'right', style: 'smallGray' },
                                                    { text: `${charge.quantity} `, alignment: 'right', style: 'smallGray' },
                                                    { text: this.transformCurrencyForOrder(charge.price), alignment: 'right' , style: 'smallGray'},
                                                    { text: this.transformCurrencyForOrder(Number(charge.totalPrice).toFixed(2)), alignment: 'right', style: 'smallGray' },
                                                ]);
                                            }
                                        });
                                    }
                                });
                        }
                                 
                        });
//console.log('totalDecoPrice');
//console.log(totalDecoPrice);
                                if(decoLines.length > 0){
                                        lines.push(this.blankGridLine());
                                        let designIndex = 0;
                                        each(keys(totalDecoPrice), totalDecoPriceKey => {
                                            if(typeof decoLines[designIndex][2].text !== 'undefined' && typeof totalDecoQty[totalDecoPriceKey]  !== 'undefined'){
                                                 decoLines[designIndex][2].text = totalDecoQty[totalDecoPriceKey];
                                            }
                                            if(typeof decoLines[designIndex][4].text !== 'undefined' && typeof totalDecoPrice[totalDecoPriceKey]  !== 'undefined'){
                                                 if (item.rollDecoChargesToProduct == '1') {
                                                     decoLines[designIndex][4].text = '';
                                                 }else{
                                                     decoLines[designIndex][4].text = this.transformCurrencyForOrder(Number(totalDecoPrice[totalDecoPriceKey]).toFixed(2));
                                                 }
                                                 
                                                 
                                            }
                                        designIndex++;
                                        });
                                        decoLines.forEach((decoLine) => {
                                            lines.push(decoLine);
                                        });                                
                                        showProductDetails = true;
                                }
                        }
                            let colorCnt = 0;
                            each(keys(colorRows), colorKey => {
                                    if(designKey == 'No Deco'){
                                            //lines.push(this.blankGridLine());
                                            if(colorCnt < 1){
                                                showProductDetails = true;
                                            }
                                    }
                                    let showSizeGrid = true;
                                    let productSizeCount = 0;
                                    let perRowSizes = 9;
                                    productSizeCount = item.productSizes.length;
                                    if(productSizeCount == perRowSizes){
                                       //perRowSizes = 9;
                                    }
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

                                    const priceRows = groupBy(colorRows[colorKey], 'price');
                                    //console.log('priceRows.length');
                                    //console.log(keys(priceRows).length);
                                    let multiSizeGrid = this.getDefaultProductsSizesMultGrid(item.productSizes, productSizeCount, perRowSizes, keys(priceRows).length, item.showAttribSize);
                                    //console.log(multiSizeGrid);
                                    each(keys(priceRows), priceKey => {
                                        let rows = priceRows[priceKey];
                                        imageUrl = rows[0].imageUrl;
                                        let totalQty = 0;
                                        const productSizes = [];
                                        const productQty = [];
                                        const productSizesWithQty = [];
                                        if(item.productSizes.length > 0){
                                            item.productSizes.forEach((size) => {
                                                productSizesWithQty[size] = 0;
                                            });    
                                        }
                                        rows.forEach((row: any) => {
                                            productSizes.push(row.size);
                                            productQty.push(row.quantity);
                                            totalQty = (totalQty*1) + (row.quantity*1);
                                            if(typeof productSizesWithQty[row.size] != 'undefined'){
                                                productSizesWithQty[row.size] += (row.quantity*1);
                                            }
                                        });
                                        totalGridQty.push(totalQty);
                                        unitPrice.push(this.transformCurrencyForOrder((priceKey)));
                                        // TODO price key needed to be casted to guarantee total quantity is multiplied by a number
                                        // find out if this function still works as expected
                                        const priceNumber: number = parseInt(priceKey)
                                        totalPrice.push(this.transformCurrencyForOrder((totalQty * priceNumber), true));

                                        if(showProductDetails){
                                            //lines.push(this.productHeadingLine());
                                            lines.push(this.productDetailsLine(item, totalColorQty, totalColorPrice, showProductDetails));
                                            if (item.lineType != '4' && item.lineType != '5') {
                                                lines.push(this.productDescriptionLine(item));
                                            }
                                            showProductDetails = false;
                                        }else{
                                            //lines.push(this.productDetailsLine(item, totalQty, priceKey, showProductDetails));
                                            //lines.push(this.blankGridLine());
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
                                                console.log('gridRowOffset');
                                                console.log(gridRowOffset);
                                                console.log(size);
                                                if(typeof multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text !== 'undefined'){
                                                     if(multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text == ' '){
                                                         multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text = 0;
                                                     }
                                                     multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text = parseInt(multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][item.productSizes.indexOf(size) % perRowSizes].text) + (productQty[qtyIndex]*1);
                                                }                                        
                                        }else{
                                                console.log('gridRowMultiIndex');
                                                console.log(gridRowMultiIndex+1);
                                                console.log(size);
                                                console.log(item.productSizes);
                                                console.log(item.productSizes.indexOf(size));
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
                                    const variationImageNode: any = {
                                        columns: []
                                    };
                                    if (docOptions[44] && docOptions[44].value) {
                                        variationImageNode.columns.push({image: this.lookupImage(imageUrl),fit: [32, 32],width: 32,alignment: 'center'})
                                    }else{
                                        //variationImageNode.columns.push({text: '',style: 'smallGray'});
                                    }
                                    variationImageNode.columns.push({text: colorKey,style: (item.showAttribColor == '1') ? 'smallGray' : 'smallWhite', margin: [0, 12]})
                                    const  DefaultSizeMultiGrid =  [
                                     variationImageNode,
                                     multiSizeGrid,
                                     this.noBorderQtyPriceColumns(totalGridQty, productSizeCount, perRowSizes),
                                     this.noBorderQtyPriceColumns(unitPrice, productSizeCount, perRowSizes),
                                     this.noBorderQtyPriceColumns(totalPrice, productSizeCount, perRowSizes),
                                        ];
                                    totalGridQty.forEach((value) => {
                                        //DefaultSizeGrid.push(totalGridQtyStack);
                                    });
                                    unitPrice.forEach((value) => {
                                        //DefaultSizeGrid.push(totalGridQtyStack);
                                    });
                                    totalPrice.forEach((value) => {
                                        //DefaultSizeGrid.push(totalGridQtyStack);
                                    });

                                    //lines.push(DefaultSizeGrid);
                                    lines.push(DefaultSizeMultiGrid);
                                    
                                    //lines.push(this.blankGridLine());
                                    colorCnt++;
                            });
                        });

                }
            }
            if(item.addonCharges.length > 0 && item.rollAddonChargesToProduct != '1' && item.hideLine != '1'){
                lines.push(this.blankGridLine());
            }
            item.addonCharges.forEach((charge) => {
                let chargePrice = '';
                let totalChargePrice = 'Included';

                if (item.rollAddonChargesToProduct != '1') {
                    chargePrice = this.transformCurrencyForOrder(charge.price);
                    totalChargePrice = this.transformCurrencyForOrder(charge.totalPrice, true);
                    if(item.hideLine != '1' || (item.hideLine != '1' && charge.totalPrice > 0)) {
                       lines.push([
                            { text: `${charge.name} `, margin: [16, 0, 0, 0], style: 'smallGray' },
                            { text: '', alignment: 'right', style: 'smallGray' },
                            this.noBorderQtyPriceColumns([charge.quantity]),
                            this.noBorderQtyPriceColumns([chargePrice]),
                            this.noBorderQtyPriceColumns([totalChargePrice])
                        ]);
                    }
                }

            });

            // if (item.matrixRows.length > 1) {
            // lines.push(this.getItemSummary(item));
            // }

        });
        
        lines.push(this.blankGridLine());
        console.log('docOptions here goes 43');
        console.log(docOptions[43].value);
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
        console.log(lineItemTable)
        return lineItemTable;
    }

    getMatrixRowLines(item: LineItem, row: Partial<MatrixRow>) {
        const { docOptions } = this.config;
        const lines = [];
                    
        let price = row.price;
        let quantity = `${row.unitQuantity} `;
        if (row.uomConversionRatio) {
            price = price * row.uomConversionRatio;
        }
        if (row.uomAbbreviation) {
            quantity += ` ${row.uomAbbreviation} `;
        }
        const rowDescriptionCell: any = this.getRowDescriptionCell(item, row);
        const rowLine: any = [
            rowDescriptionCell,
            { text: quantity, alignment: 'right' },
            { text: this.transformCurrencyForOrder(price), alignment: 'right' },
            { text: this.transformCurrencyForOrder(row.totalPrice, true), alignment: 'right' },
        ];
        if (item.lineType == '1') {
            this.totalQty = (this.totalQty * 1) + (row.quantity * 1);
        }
        if (item.decoVendors && item.decoVendors.length) {
            // Only show supplier decorated here
            if (item.rollDecoChargesToProduct == '1') {
                const rolledDeco = this.rolledDecoration(item, row);
                const chunkedDeco = chunk(rolledDeco, 2);
                let descriptionIndex = 0;
                // column index changes when image is shown..
                if (docOptions[44] && docOptions[44].value) {
                    descriptionIndex = 1;
                }
                chunkedDeco.forEach((decoColumns) => {
                    rowLine[0].columns[descriptionIndex].stack.push(decoColumns);
                });
                lines.push(rowLine);
                if (item.rollDecoAddonChargesToProduct != '1') {
                    item.decoVendors
                        .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId))
                        .forEach((deco) => {
                            deco.addonCharges.forEach((charge) => {
                                lines.push([
                                    { text: `${charge.name} `, margin: [24, 0, 0, 0] },
                                    { text: `${charge.quantity} `, alignment: 'right' },
                                    { text: this.transformCurrencyForOrder(charge.price, true , '1.2-4'), alignment: 'right' },
                                    { text: this.transformCurrencyForOrder(charge.totalPrice, true), alignment: 'right' },
                                ]);
                            });
                        });
                }
            }
            else {
                lines.push(rowLine);
                const decoLines = this.decorationLines(item, row);
                decoLines.forEach((decoLine) => {
                    lines.push(decoLine);
                });
            }
        }
        else {

            lines.push(rowLine);
        }
        return lines;
    }

    getRowDescriptionCell(item: LineItem, row: Partial<MatrixRow>) {
        const { docOptions, order } = this.config;
        const rowDescription = { text: [] };
        if (item.showAttribSize == '1') {
            rowDescription.text.push((typeof order.productSizesSorting[row.size] !=='undefined' && order.productSizesSorting[row.size] !=='' && order.productSizesSorting[row.size] !== null) ? order.productSizesSorting[row.size] : row.size);
        }

        if (item.showAttribColor == '1') {
            if (rowDescription.text.length) {
                rowDescription.text.push(' ');
            }
            rowDescription.text.push(row.color);
        }
        const rowDescriptionCell: any = {
            columns: [],
            margin: [16, 0, 0, 0],
        };

        //Show image if configured
        if (docOptions[44] && docOptions[44].value) {
            rowDescriptionCell.columns.push({
                image: this.lookupImage(row.imageUrl),
                fit: [32, 32],
                width: 32,
                alignment: 'center'
            });
        }
        const rowDescriptionStack = {
            stack: [
                rowDescription,
            ],
        };
        if (row.calculatorData && row.calculatorData[0] && row.calculatorData[0].formatted) {
            rowDescriptionStack.stack.push(row.calculatorData[0].formatted);
        }

        rowDescriptionCell.columns.push(rowDescriptionStack);

        return rowDescriptionCell;
    }
    lineItemsSummaryTable(): any {
        const { order, hideQuoteTotal } = this.config;

        if(this.label == 'Quote' && hideQuoteTotal){
            return '\n';
        }
        
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
        if(order.finalGrandTotalPrice !== order.salesAmount && order.finalGrossPriceWithoutTax !== order.salesAmount){
                lines.push([
                    {
                        text: this.getDynamicDocLabel('salesAmount','Sales Amount'),
                        alignment: 'right'
                    },
                    {
                        text: this.transformCurrencyForOrder(order.salesAmount, true),
                        alignment: 'right'
                    }
                ]);
        }
        if (order.shippingAmountForReport > 0) {
            lines.push([
                {
                    text: this.getDocLabel('shipping', 'Shipping'),
                    alignment: 'right'
                },
                {
                    text: this.transformCurrencyForOrder(order.shippingAmountForReport, true),
                    alignment: 'right'
                }
            ]);
        }
        if (order.discountAmount > 0) {
            lines.push([
                {
                    text: this.getDocLabel('discount', 'Discount'),
                    alignment: 'right'
                },
                {
                    text: '('+this.transformCurrencyForOrder(order.discountAmount, true)+')',
                    alignment: 'right'
                }
            ]);
        }
        if(order.finalGrandTotalPrice !== order.finalGrossPriceWithoutTax){
                lines.push([
                    {
                        text: this.getDynamicDocLabel('subTotal','Subtotal'),
                        alignment: 'right'
                    },
                    {
                        text: this.transformCurrencyForOrder(order.finalGrossPriceWithoutTax, true),
                        alignment: 'right'
                    }
                ]);
        }
        let taxJarBreakupsFound = false;
        if(this.config.ordersConfig && this.config.ordersConfig.settings && this.config.ordersConfig.settings.showTaxJarTaxBreakup == '1'  && order.taxJarBreakups.length > 0){
                taxJarBreakupsFound = true;
                order.taxJarBreakups.forEach((taxDetails) => {
                    if(taxDetails.taxType){
                        if (+taxDetails.taxAmount > 0) {
                            lines.push([
                                {
                                    //text: this.getDynamicDocLabel('tax', taxDetails.taxType),
                                    text: taxDetails.taxType + '('+ taxDetails.taxRate +'%)',
                                    alignment: 'right'
                                },
                                {
                                    text: this.transformCurrencyForOrder(taxDetails.taxAmount, true),
                                    alignment: 'right'
                                }
                            ]);
                        }                        
                    }
                });        
        }
        if(!taxJarBreakupsFound){
                if (this.config.ordersConfig && this.config.ordersConfig.settings && this.config.ordersConfig.settings.enableGstOnPo == '1' && order.taxBreakup.length > 0) {
                        order.taxBreakup.forEach((taxDetails) => {
                            if(taxDetails.taxType){
                                if (+taxDetails.taxAmount > 0) {
                                    lines.push([
                                        {
                                            //text: this.getDynamicDocLabel('tax', taxDetails.taxType),
                                            text: taxDetails.taxType,
                                            alignment: 'right'
                                        },
                                        {
                                            text: this.transformCurrencyForOrder(taxDetails.taxAmount, true),
                                            alignment: 'right'
                                        }
                                    ]);
                                }                        
                            }
                        });
                }else{

                        const taxLabel = this.getTaxLabel();

                        // Have to cast the string to a number with the urnary operator
                        if (+order.taxAmount > 0) {
                            lines.push([
                                {
                                    //text: this.getDynamicDocLabel('tax', taxLabel),
                                    text: taxLabel,
                                    alignment: 'right'
                                },
                                {
                                    text: this.transformCurrencyForOrder(order.taxAmount, true),
                                    alignment: 'right'
                                }
                            ]);
                        }        
                }        
        }


        lines.push([
            {
                text: this.getDynamicDocLabel('total', this.getDocLabel('totalPrice')),
                alignment: 'right',
                style: 'big',
            },
            {
                text: this.transformCurrencyForOrder(order.finalGrandTotalPrice, true),
                alignment: 'right',
                style: 'big',
            }
        ]);

        lines.forEach((line) => node.table.body.push(line));

        const paymentTable = this.paymentList();
        if (paymentTable && paymentTable.table && paymentTable.table.body) {
            paymentTable.table.body.forEach((line) => node.table.body.push(line));
        }
        node.table.body.push([
            {
                text: ' ',
                alignment: 'right',
                style: 'big',
                color: '#FFFFFF'
            },
            {
                text: '_____________',
                alignment: 'right',
                style: 'big',
                color: '#FFFFFF'
            }
        ]);
        return node;
    }
    lineItemsSummaryGridTable(): any {
        const { order, hideQuoteTotal } = this.config;
        if(this.label == 'Quote' && hideQuoteTotal){
            return '\n';
        }
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
        if(order.finalGrandTotalPrice !== order.salesAmount && order.finalGrossPriceWithoutTax !== order.salesAmount){
                lines.push([
                    {
                        text: this.getDynamicDocLabel('salesAmount','Sales Amount'),
                        alignment: 'right'
                    },
                    {
                        text: this.transformCurrencyForOrder(order.salesAmount, true),
                        alignment: 'right'
                    }
                ]);        
        }
        if (order.shippingAmountForReport > 0) {
            lines.push([
                {
                    text: this.getDocLabel('shipping', 'Shipping'),
                    alignment: 'right'
                },
                {
                    text: this.transformCurrencyForOrder(order.shippingAmountForReport, true),
                    alignment: 'right'
                }
            ]);
        }
        if (order.discountAmount > 0) {
            lines.push([
                {
                    text: this.getDocLabel('discount', 'Discount'),
                    alignment: 'right'
                },
                {
                    text: '('+this.transformCurrencyForOrder(order.discountAmount, true)+')',
                    alignment: 'right'
                }
            ]);
        }
        if(order.finalGrandTotalPrice !== order.finalGrossPriceWithoutTax){
                lines.push([
                    {
                        text: this.getDynamicDocLabel('subTotal','Subtotal'),
                        alignment: 'right'
                    },
                    {
                        text: this.transformCurrencyForOrder(order.finalGrossPriceWithoutTax, true),
                        alignment: 'right'
                    }
                ]);        
        }
        let taxJarBreakupsFound = false;
        if(this.config.ordersConfig && this.config.ordersConfig.settings && this.config.ordersConfig.settings.showTaxJarTaxBreakup == '1'  && order.taxJarBreakups.length > 0){
                taxJarBreakupsFound = true;
                order.taxJarBreakups.forEach((taxDetails) => {
                    if(taxDetails.taxType){
                        if (+taxDetails.taxAmount > 0) {
                            lines.push([
                                {
                                    //text: this.getDynamicDocLabel('tax', taxDetails.taxType),
                                    text: taxDetails.taxType + '('+ taxDetails.taxRate +'%)',
                                    alignment: 'right'
                                },
                                {
                                    text: this.transformCurrencyForOrder(taxDetails.taxAmount, true),
                                    alignment: 'right'
                                }
                            ]);
                        }                        
                    }
                });        
        }
        if(!taxJarBreakupsFound){
                if (this.config.ordersConfig && this.config.ordersConfig.settings && this.config.ordersConfig.settings.enableGstOnPo == '1' && order.taxBreakup.length > 0) {
                        order.taxBreakup.forEach((taxDetails) => {
                            if(taxDetails.taxType){
                                if (+taxDetails.taxAmount > 0) {
                                    lines.push([
                                        {
                                            //text: this.getDynamicDocLabel('tax', taxDetails.taxType),
                                            text: taxDetails.taxType,
                                            alignment: 'right'
                                        },
                                        {
                                            text: this.transformCurrencyForOrder(taxDetails.taxAmount, true),
                                            alignment: 'right'
                                        }
                                    ]);
                                }                        
                            }
                        });
                }else{

                        const taxLabel = this.getTaxLabel();

                        // Have to cast the string to a number with the urnary operator
                        if (+order.taxAmount > 0) {
                            lines.push([
                                {
                                    //text: this.getDynamicDocLabel('tax', taxLabel),
                                    text: taxLabel,
                                    alignment: 'right'
                                },
                                {
                                    text: this.transformCurrencyForOrder(order.taxAmount, true),
                                    alignment: 'right'
                                }
                            ]);
                        }        
                }
        
        }

        lines.push([
            {
                text: this.getDynamicDocLabel('total', this.getDocLabel('totalPrice')),
                alignment: 'right',
                style: 'big',
            },
            {
                text: this.transformCurrencyForOrder(order.finalGrandTotalPrice, true),
                alignment: 'right',
                style: 'big',
            }
        ]);

        lines.forEach((line) => node.table.body.push(line));

        const paymentTable = this.paymentList();
        if (paymentTable && paymentTable.table && paymentTable.table.body) {
            paymentTable.table.body.forEach((line) => node.table.body.push(line));
        }
        node.table.body.push([
            {
                text: ' ',
                alignment: 'right',
                style: 'big',
                color: '#FFFFFF'
            },
            {
                text: '_____________',
                alignment: 'right',
                style: 'big',
                color: '#FFFFFF'
            }
        ]);
        return node;
    }

    getTaxLabel() {
        const { order } = this.config;
        let taxLabel = this.getDynamicDocLabel('tax', 'Sales Tax');
        if (this.config.ordersConfig && this.config.ordersConfig.settings && this.config.ordersConfig.settings.enableGstOnPo == '1') {
        /*
            if(order.taxBreakup.length > 0){
                taxLabel = '';
                let taxCnt = 1;
                order.taxBreakup.forEach((taxDetails) => {
                    if(taxDetails.taxType){
                        taxLabel += taxDetails.taxType + ' ('+ taxDetails.taxRate +'%)';
                    }
                    if(order.taxBreakup.length != taxCnt){
                        taxLabel += ' + ';
                    }
                    taxCnt++;
                });
                return taxLabel;
            }
            */
           
            taxLabel = ( order.taxStrategiesId !='0'  && order.taxStrategiesType !='') ? order.taxStrategiesType : this.getDynamicDocLabel('tax', 'GST');
        }
        return taxLabel;
    }

    transformItemLines(item: LineItem): any {
        const { docOptions } = this.config;

        const itemDescriptionCell: any = this.getItemDescriptionCell(item);

        let lines: any[];


        if (item.matrixRows.length > 0) {
        const row = item.matrixRows[0];

        let rowDescription = '';
        let price = '';
        let totalPrice = '';
        let quantity: any = '';

        if (item.lineType == '4') {
            price = this.transformCurrencyForOrder(row.price, true , '1.2-4');
            totalPrice = this.transformCurrencyForOrder(row.totalPrice, true , '1.2-4');
            quantity = row.quantity;
        }

        if (item.lineType == '5') {
            price = this.transformCurrencyForOrder(row.price, true, '1.2-4');
            totalPrice = '('+this.transformCurrencyForOrder(row.totalPrice, true, '1.2-4')+')';
            quantity = row.quantity;
        }


        // if (row && item.lineType != '4' && row) {
        //     rowDescription = this.getRowDescriptionCell(item, row);
        // }

        lines = [
            [
                { stack: [{ ...itemDescriptionCell }, rowDescription] },
                { text: quantity, alignment: 'right' },
                { text: price, alignment: 'right' },
                { text: totalPrice, alignment: 'right' },
            ],
        ];
         } else {
             lines = [
                 [
                     { ...itemDescriptionCell, colSpan: 4 },
                     '',
                     '',
                     '',
                 ],
             ];
         }

        return lines;
    }

    transformItemLinesForGrid(item: LineItem): any {
        const { docOptions } = this.config;

        const itemDescriptionCell: any = this.getItemDescriptionCell(item);

        let lines: any[];


        if (item.matrixRows.length > 0) {
        const row = item.matrixRows[0];

        let rowDescription = '';
        let price = '';
        let totalPrice = '';
        let quantity: any = '';

        if (item.lineType == '4') {
            price = this.transformCurrencyForOrder(row.price, true, '1.2-4');
            totalPrice = this.transformCurrencyForOrder(row.totalPrice, true, '1.2-4');
            quantity = row.quantity;
        }

        // if (row && item.lineType != '4' && row) {
        //     rowDescription = this.getRowDescriptionCell(item, row);
        // }

        lines = [
            [
                { stack: [{ ...itemDescriptionCell }, rowDescription] },
                { text: '', alignment: 'right' },
                { text: quantity, alignment: 'right' },
                { text: price, alignment: 'right' },
                { text: totalPrice, alignment: 'right' },
            ],
        ];
         } else {
             lines = [
                 [
                     { ...itemDescriptionCell, colSpan: 4 },
                     '',
                     '',
                     '',
                     '',
                 ],
             ];
         }

        return lines;
    }
    getItemSummary(item: LineItem) {
        let price = '';
        let totalPrice = '';
        if (item.lineType == '4') {
            price = this.transformCurrencyForOrder(item.price, true, '1.2-4');
            totalPrice = this.transformCurrencyForOrder(item.totalPrice, true, '1.2-4');
        }
        if (item.lineType == '5') {
            price = this.transformCurrencyForOrder(item.price, true, '1.2-4');
            totalPrice = '('+this.transformCurrencyForOrder(item.totalPrice, true, '1.2-4')+')';
        }
        const totalDecorations = item.decoVendors.reduce((sum, deco) => {
            return sum + parseFloat(deco.quantity);
        }, 0);

        const itemTotal = {
            text: [
                { text: 'Quantity: ' },
                { text: item.quantity }
            ]
        };
        const decorationTotal = {
            text: [
                { text: 'Decoration: ' },
                { text: totalDecorations }
            ]
        };

        const node = [
            {
                text: [
                    itemTotal,
                    ' ',
                    decorationTotal,
                ],
                colSpan: 4,
                alignment: 'right'
            },
            '',
            '',
            '',
        ];

        return node;
    }

    getItemDescriptionCell(item: LineItem, type: 'customer' | 'vendor' = 'customer') {

        const { docOptions } = this.config;

        const node: any = {
            rowType: 'item',
            columns: [],
            borderColor: ['#808080', '#808080', '#EFEFEF', '#808080'],
            borderWidth: [4, 4, 1, 4]
        };

        const description = (type == 'vendor') ? (item.vendorProductName ? [item.vendorProductName] : [item.productName]) : [item.productName];
        if (item.inhandDate && item.overrideInHandDate == '1' && type == 'vendor') {
            description.push('\n In hands date: ' + this.formatter.transformDate(item.inhandDate));
            this.overrideInHandDateFound = true;
        }


        const itemDescriptionArray: any = [
            { text: description },
        ];

        // Show product description
        if (type == 'customer') {
            if (docOptions[17] && docOptions[17].value && item.customerDescription && item.lineType != '4' && item.lineType != '5') {
                itemDescriptionArray.push({
                    text: `${item.customerDescription} `,
                    style: 'smallGray'
                });
            }
        } else {
            if (docOptions[17] && docOptions[17].value && item.vendorDescription && item.lineType != '4' && item.lineType != '5') {
                itemDescriptionArray.push({
                    text: `${item.vendorDescription} `,
                    style: 'smallGray'
                });
            }
        }

        if (item.calculatorData && item.calculatorData[0]) {
            itemDescriptionArray.push({
                text: `${item.calculatorData[0].formatted} `,
                style: 'smallGray'
            });
        }

        const imageStack = {
            stack: [],
            width: 52,
        };
        if (docOptions[15] && docOptions[15].value) {
            imageStack.stack.push({
                image: this.lookupImage(item.quoteCustomImage),
                fit: [48, 48],
                width: 48,
            });
        }
        if (docOptions[14] && docOptions[14].value) {
            imageStack.stack.push({ text: item.itemNo, bold: true, alignment: 'center', margin: [2, 2] });
        }
        if (docOptions[30] && docOptions[30].value) {
            imageStack.stack.push({ text: item.inhouseId, bold: true, alignment: 'center', margin: [2, 2] });
        }
        if (docOptions[33] && docOptions[33].value) {
            imageStack.stack.push({ text: item.itemCode, bold: true, alignment: 'center', margin: [2, 2] });
        }
        
        node.columns.push(imageStack);
        node.columns.push({ stack: itemDescriptionArray });
        return node;
    }

    signature() {
        return {
            columns: [
                '',
                {
                    stack: [
                        '_________________________',
                        'Your Name',
                        'Your job title'
                    ]
                },
            ]
        };
    }
    decorationGridLines(item, row, docType = 'order', totalColorQty = 0, matrixRowsByVariationKey = '') {
        const { docOptions } = this.config;

        const lines = [];
        console.log('matrixRowsByVariationKey');
        console.log(matrixRowsByVariationKey);
        console.log('variationUniqueId');
        console.log(row.variationUniqueId);

        if (item.decoVendors && item.decoVendors.length) {
            item.decoVendors
                .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId && matrixRowsByVariationKey.indexOf(row.variationUniqueId) > -1))
                .forEach((deco) => {
                    const description = this.getDecoDescriptionGrid(deco);
                    console.log('totalColorQty');
                    console.log(totalColorQty);
                    let quantity = (totalColorQty > 0 ) ? totalColorQty : deco.quantity;

                    if (item.calculatorData && item.calculatorData.length) {
                        quantity = '';
                    }
                    
                    if(item.hideLine != '1' || (item.hideLine != '1' && deco.totalPrice > 0)) {
                        let designName = '';
                        if (docOptions[38] && docOptions[38].value && deco.designName) {
                            designName = `Design : ${deco.designName} \n`;
                        }   
                        let designVariationTitle = '';
                        if (docOptions[39] && docOptions[39].value && deco.decorationDetails[0].decoDesignVariation.design_variation_title) {
                            designVariationTitle = `Variation : ${deco.decorationDetails[0].decoDesignVariation.design_variation_title} \n`;
                        }        
                        let decoDescriptionDetails = '';
                        if(docType == 'po' && deco.decorationNotes){
                            decoDescriptionDetails = `${designName} ${designVariationTitle} Type : ${deco.decoTypeName} \n Location : ${deco.decoLocation} \n ${deco.decorationNotes}`;
                        }else{
                            decoDescriptionDetails = `${designName} ${designVariationTitle} Type : ${deco.decoTypeName} \n Location : ${deco.decoLocation}`
                        }
                        let totalDecoPrice = Number(deco.customerPrice) * Number(quantity);
                        lines.push([
                            description ,
                            { text: decoDescriptionDetails, alignment: 'left', border: [false, true, false, true], style: 'smallGray' },
                            { text: `${quantity} `, alignment: 'right', border: [false, true, false, true], style: 'smallGray' },
                            { text: ((item.rollDecoChargesToProduct == '1') ? '' : this.transformCurrencyForOrder(Number(deco.customerPrice).toFixed(2))), alignment: 'right', border: [false, true, false, true], style: 'smallGray' },
                            { text: ((item.rollDecoChargesToProduct == '1') ? '' : this.transformCurrencyForOrder(Number(totalDecoPrice).toFixed(2))), alignment: 'right', border: [false, true, true, true], style: 'smallGray' },
                            //{ text: '', alignment: 'right', border: [false, true, false, true], style: 'smallGray' },
                            //{ text: '', alignment: 'right', border: [false, true, false, true], style: 'smallGray' },
                            //{ text: '', alignment: 'right', border: [false, true, false, true], style: 'smallGray' },
                        ]);
                    }
                    /*
                    if (item.rollDecoAddonChargesToProduct != '1') {
                        deco.addonCharges.forEach((charge) => {
                            if(item.hideLine != '1' || (item.hideLine != '1' && charge.totalPrice > 0)) {
                                lines.push([
                                    { text: `${charge.name} `, margin: [24, 0, 0, 0], style: 'smallGray' },
                                    { text: '', alignment: 'right', style: 'smallGray' },
                                    { text: `${charge.quantity} `, alignment: 'right', style: 'smallGray' },
                                    { text: this.transformCurrencyForOrder(charge.price), alignment: 'right' , style: 'smallGray'},
                                    { text: this.transformCurrencyForOrder(Number(charge.totalPrice).toFixed(2)), alignment: 'right', style: 'smallGray' },
                                ]);
                            }
                        });
                    }*/
                });
        }
        return lines;
    }
    decorationLines(item, row) {
        const { docOptions } = this.config;

        const lines = [];

        if (item.decoVendors && item.decoVendors.length) {
            item.decoVendors
                .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId))
                .forEach((deco) => {
                    const description = this.getDecoDescription(deco);
                    let quantity = deco.quantity;

                    if (item.calculatorData && item.calculatorData.length) {
                        quantity = '';
                    }
                    if(item.hideLine != '1' || (item.hideLine != '1' && deco.totalPrice > 0)) {
                        lines.push([
                            description,
                            { text: `${quantity} `, alignment: 'right' },
                            { text: this.transformCurrencyForOrder(deco.customerPrice), alignment: 'right' },
                            { text: this.transformCurrencyForOrder(Number(deco.totalPrice).toFixed(2)), alignment: 'right' },
                        ]);
                    }

                    if (item.rollDecoAddonChargesToProduct != '1') {
                        deco.addonCharges.forEach((charge) => {
                            if(item.hideLine != '1' || (item.hideLine != '1' && charge.totalPrice > 0)) {
                                lines.push([
                                    { text: `${charge.name} `, margin: [24, 0, 0, 0] },
                                    { text: `${charge.quantity} `, alignment: 'right' },
                                    { text: this.transformCurrencyForOrder(charge.price), alignment: 'right' },
                                    { text: this.transformCurrencyForOrder(Number(charge.totalPrice).toFixed(2)), alignment: 'right' },
                                ]);
                            }
                        });
                    }
                });
        }
        return lines;
    }

    rolledDecoration(item, row) {

        const columns = [];

        if (item.decoVendors && item.decoVendors.length) {

            const filteredDeco = item.decoVendors
                .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId));

            filteredDeco.forEach((deco, index) => {
                const description = { ...this.getDecoDescription(deco), margin: [0, 0, 0, 0] };
                columns.push(
                    description,
                );
            });
        }

        return columns;
    }


    rolledDecorationGrid(item, row) {

        const columns = [];

        if (item.decoVendors && item.decoVendors.length) {

            const filteredDeco = item.decoVendors
                .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId));

            filteredDeco.forEach((deco, index) => {
                const description = { ...this.getDecoDescriptionGrid(deco), margin: [0, 0, 0, 0] };
                columns.push(
                    description,
                );
            });
        }

        return columns;
    }

    shipInfoList() {
        const { shipInfoList, docOptions } = this.config;

        if (docOptions[28] && docOptions[28].value && shipInfoList && shipInfoList.length) {
            const node: any = {
                layout: 'lightHorizontalLines',
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', '*'],
                    body: [
                        // Table Header
                        [
                            { text: 'Tracking Code', style: 'tableHeader' },
                            { text: 'Shipping Method', style: 'tableHeader' },
                            { text: 'Ship Date', style: 'tableHeader' },
                            { text: 'Notes', style: 'tableHeader' },
                        ],
                    ],
                    dontBreakRows: true,
                }
            };

            shipInfoList.forEach((shipping) => {
                const row = [
                    shipping.trackNumber,
                    shipping.shippingMethod,
                    shipping.shipDate,
                    shipping.note,
                ];
                node.table.body.push(row);
            });
            return node;
        }
    }

    paymentList() {
        const { order, paymentList } = this.config;

        if (paymentList && paymentList.length) {
            const node: any = {
                layout: 'noBorders',
                table: {
                    headerRows: 0,
                    widths: ['*', 65],
                    body: [
                    ],
                    dontBreakRows: true,
                }
            };

            paymentList.forEach((payment) => {
                const paymentDate = this.formatter.transformDate(payment.paymentDate);
                node.table.body.push(
                    [
                        { text: `Payment ${paymentDate}`, alignment: 'right' },
                        { text: this.transformCurrencyForOrder(payment.amount), alignment: 'right' }
                    ]
                );
            });

            if (order.finalGrandTotalPrice != order.balanceAmount) {
                node.table.body.push([
                    {
                        text: 'Balance',
                        alignment: 'right',
                        style: 'big',
                    },
                    {
                        text: this.transformCurrencyForOrder(order.balanceAmount, true),
                        alignment: 'right',
                        style: 'big',
                    }
                ]);
            }

            return node;
        }
    }

    getDocumentDefinition() {
        const { order } = this.config;
        return Observable.create(observable => {
            this.loadImages().subscribe(() => {
                const dd: any = {
                    pageMargins: this.getPageMargins(),
                    pageSize: this.getPageSize(),
                    pageOrientation: this.getPageOrientation(),
                    footer: this.footer(),
                    header: this.header(),
                    content: this.content(),
                    styles: {
                        header: {
                            fontSize: 18,
                            bold: true
                        },
                        smallGray: {
                            fontSize: 8,
                            color: '#383838',
                        },
                        smallWhite: {
                            fontSize: 8,
                            color: '#FFFFFF',
                        },
                        mediumGray: {
                            fontSize: 10,
                            color: '#383838',
                        },
                        big: {
                            fontSize: 12,
                        },
                        bigger: {
                            fontSize: 16,
                        },
                        fieldLabel: {
                            color: '#333333',
                            bold: true,
                        },
                        tableHeader: {
                            bold: true,
                            alignment: 'center',
                            fillColor: '#EFEFEF',
                            borderColor: ['#333333', '#333333', '#333333', '#333333']
                        },
                        tableHeaderWO: {
                            bold: true,
                            alignment: 'center',
                            fillColor: '#efefef',
                            borderColor: ['#000000', '#000000', '#000000', '#000000']
                        },
                        tableHeaderWOYellow: {
                            bold: true,
                            alignment: 'center',
                            fillColor: '#ffff00',
                            color: '#000000',
                            borderColor: ['#000000', '#000000', '#000000', '#000000']
                        },
                        tableHeaderWORed: {
                            bold: true,
                            alignment: 'center',
                            fillColor: '#ff0000',
                            color: '#000000',
                            borderColor: ['#000000', '#000000', '#000000', '#000000']
                        },
                        tableHeaderWOBlue: {
                            bold: true,
                            alignment: 'center',
                            fillColor: '#00ffff',
                            color: '#000000',
                            borderColor: ['#000000', '#000000', '#000000', '#000000']
                        },
                        tableHeaderWOPurple: {
                            bold: true,
                            alignment: 'center',
                            fillColor: '#ff00ff',
                            color: '#000000',
                            borderColor: ['#000000', '#000000', '#000000', '#000000']
                        },
                        tableHeaderWOGrey: {
                            bold: true,
                            alignment: 'center',
                            fillColor: '#E3E8E9',
                            color: '#FFFFFF',
                            borderColor: ['#000000', '#000000', '#000000', '#000000']
                        },
                        tableHeaderWOBlack: {
                            bold: true,
                            alignment: 'center',
                            fillColor: '#000000',
                            color: '#FFFFFF',
                            borderColor: ['#000000', '#000000', '#000000', '#000000']
                        },
                        gridTableCell: {
                            color: '#CCCCCC',
                            fontSize: 8,
                        },
                        smallText: {
                            fontSize: 9,
                        },
                        mediumText: {
                            fontSize: 10
                        },
                        whiteText: {
                            fillColor: '#FFFFFF'
                        },
                        blackBackground: {
                            fillColor: '#000000',
                            color: '#FFFFFF'
                        },
                        bold: {
                            bold: true,
                        },
                    },
                    defaultStyle: this.getDefaultStyle(),
                    images: this.imageManager.imageMap,
                    defaultFileName: (this.workOrderCount !='') ? this.getTitle()+'.'+order.orderNo+ '.'+this.workOrderCount : this.getTitle()+' '+order.orderNo,
                    info: {
                        title: (this.workOrderCount !='') ? this.getTitle()+'.'+order.orderNo+ '.'+this.workOrderCount : this.getTitle()+' '+order.orderNo,
                        //author: 'Antera',
                        //subject: 'subject of document',
                        //keywords: 'keywords for document',
                    }                    
                };

                observable.next(dd);
                observable.complete();
            });
        });
    }

    getDefaultStyle() {
        return {
            fontSize: 9,
            columnGap: 16,
        };
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
            //return 'A4';
        }else{
            return 'A4';
        }
    }

    getPageOrientation() {
        return 'Portrait';
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
        //{ text: (showProductDetails ? item.productName : ''), alignment: 'left', border: [false, false, false, false], style: 'smallText'},
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
      productStack.columns[itemColIndex].stack.push({ text: item.productName, bold: true, alignment: 'left',  border: [false, false, false, false], style: 'smallText' });
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
        { text: (docOptions[17] && docOptions[17].value) ? item.customerDescription : '' , alignment: 'left', border: [false, true, true, false], style: 'smallText', colSpan: 4 },
        { text: '' ,  alignment: 'right', border: [false, true, false, false], style: 'smallText' },
        { text: '', alignment: 'right', border: [false, true, false, false], style: 'smallText' },
        { text: '', alignment: 'right', border: [false, false, false, false], style: 'smallText' },
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

    getDefaultProductsSizesMultGrid(productSizes, productSizeCount, perRowSizes, totalRows, showAttribSize = '1'){
    const { order } = this.config;
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
        productSizes.forEach((value, index) => {
           if(index < perRowSizes){
               sizeTable.table.widths.push('*');
           }
        });
        while(totalRows > 0){
                if(productSizeCount <= perRowSizes){
                        const line = [];
                        const lineQty = [];
                        productSizes.forEach((value, index) => {
                         line.push({
                                text: (typeof order.productSizesSorting[value] !=='undefined' && order.productSizesSorting[value] !=='' && order.productSizesSorting[value] !== null) ? order.productSizesSorting[value] : value,
                                alignment: 'center',
                                style: (showAttribSize == '1') ? 'smallGray' : 'smallWhite',
                            });
                         lineQty.push({
                                text: ' ',
                                alignment: 'center',
                                style: 'smallGray',
                            });
                        });                
                        sizeTable.table.body.push(line);
                        sizeTable.table.body.push(lineQty);
                }else{
                        let lines = [];
                        let linesQty = [];
                        productSizes.forEach((value, index) => {
                         lines.push({
                                text: (typeof order.productSizesSorting[value] !=='undefined' && order.productSizesSorting[value] !=='' && order.productSizesSorting[value] !== null) ? order.productSizesSorting[value] : value,
                                alignment: 'center',
                                style: (showAttribSize == '1') ? 'smallGray' : 'smallWhite',
                            });
                         linesQty.push({
                                text: ' ',
                                alignment: 'center',
                                style: 'smallGray',
                            });
                         if((index + 1) % perRowSizes === 0){
                             sizeTable.table.body.push(lines);
                             sizeTable.table.body.push(linesQty);
                             lines = [];
                             linesQty = [];
                         }
                         if(lines.length > 0 && (index + 1) == productSizeCount){
                             lines.push({
                                text: ' ',
                                alignment: 'center',
                                style: 'smallGray',
                                colSpan: (perRowSizes - ((index + 1)% perRowSizes)),
                             });
                             linesQty.push({
                                text: ' ',
                                alignment: 'center',
                                style: 'smallGray',
                                colSpan: (perRowSizes - ((index + 1)% perRowSizes)),
                             });
                             sizeTable.table.body.push(lines);
                             sizeTable.table.body.push(linesQty);
                         }
                        });                
                }        
                totalRows--;
        }
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

    getDecimalPlaces(num) {
      var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
      if (!match) { return 0; }
      return Math.max( 0,(match[1] ? match[1].length : 0)  - (match[2] ? +match[2] : 0));
    }
    transformCurrencyForOrder(amount, formating = false, format = '1.2-2'){
        if(formating){
                if(this.exchageRateForCustomer > 0 && this.toCurrencyCodeForCustomer !='' && this.toCurrencySymbolForCustomer !=''){
                    return this.formatter.transformCurrency(amount * this.exchageRateForCustomer, '', this.toCurrencySymbolForCustomer, format);
                }else if(this.fromCurrencyCode !='' && this.fromCurrencySymbol !=''){
                    return this.formatter.transformCurrency(amount , '', this.fromCurrencySymbol, format);
                }else{
                    return this.formatter.transformCurrency(amount , '', '$', format);
                }        
        }else{
                if(this.exchageRateForCustomer > 0 && this.toCurrencyCodeForCustomer !='' && this.toCurrencySymbolForCustomer !=''){
                    let oldDecimalPlaces = 2;
                    oldDecimalPlaces = this.getDecimalPlaces(amount);
                    if(oldDecimalPlaces < 2){
                        oldDecimalPlaces = 2;
                    }
                    return this.formatter.transformCurrency(amount * this.exchageRateForCustomer, '', this.toCurrencySymbolForCustomer, '1.2-' + oldDecimalPlaces);
                    /*
                    if(typeof this.config.sysConfig.sysconfigOrderFormCostDecimalUpto !=='undefined'){
                        return this.formatter.transformCurrency(amount * this.exchageRateForCustomer, '', this.toCurrencySymbolForCustomer, '1.2-' + this.config.sysConfig.sysconfigOrderFormCostDecimalUpto);
                    }else{
                        return this.formatter.transformCurrency(amount * this.exchageRateForCustomer, '', this.toCurrencySymbolForCustomer);
                    }*/                    
                }else if(this.fromCurrencyCode !='' && this.fromCurrencySymbol !=''){
                    return this.formatter.transformCurrency(amount , '', this.fromCurrencySymbol);
                }else{
                    return this.formatter.transformCurrency(amount , '', '$');
                }        
        }

    }
}
