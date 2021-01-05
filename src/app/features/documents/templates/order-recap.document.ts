import { LineItem } from 'app/models';
import { InvoiceDocument } from './invoice.document';
import { IDecoVendor } from 'app/features/e-commerce/order-form/interfaces';


export class OrderRecapDocument extends InvoiceDocument {
    name = 'order-recap';
    label = 'Order Recap';
    fromCurrencyCode = 'USD';
    fromCurrencySymbol = '$';
    toCurrencyCodeForCustomer = '';
    toCurrencySymbolForCustomer = '';
    exchageRateForCustomer = 1;

    getTitle() {
        const { docTitle } = this.config;
        if (docTitle) {
            return this.getDynamicDocLabel('heading', this.getDocLabel('title', docTitle));
        }
        return this.getDynamicDocLabel('heading', this.getDocLabel('title', this.label));
    }

    vouchedLineItemTable() {
        const lineItemTable = {
            layout: 'order',
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: ['*', 35, 45, 45, 45, 45],
                body: [
                    [
                        // Table Header
                        { text: 'Product', style: 'tableHeader' },
                        { text: 'Qty', style: 'tableHeader' },
                        { text: 'Cost', style: 'tableHeader' },
                        { text: 'Total', style: 'tableHeader' },
                        { text: 'Credit', style: 'tableHeader' },
                        { text: 'Line Total', style: 'tableHeader' },
                    ]
                ],
                dontBreakRows: true,
            }
        };

        const lines = [];
        this.config.vouchedInfo.lines.forEach((item: any) => {
            const line = [
                        { text: item.name },
                        { text: item.quantity },
                        { text: this.transformCurrencyForOrder(item.price), alignment: 'right' },
                        { text: this.transformCurrencyForOrder(item.total), alignment: 'right' },
                        { text: this.transformCurrencyForOrder(item.credit), alignment: 'right' },
                        { text: this.transformCurrencyForOrder(item.lineTotal), alignment: 'right' },
                    ];
          lines.push(line);
        });

        lineItemTable.table.body = [
            ...lineItemTable.table.body,
            ...lines
        ];
        return lineItemTable;
    }

    lineItemTable() {
        const { order } = this.config;
        const lineItemTable = {
            layout: 'order',
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: ['*', 35, 45, 45, 45, 45],
                body: [
                    [
                        // Table Header
                        { text: 'Product', style: 'tableHeader' },
                        { text: 'Qty', style: 'tableHeader' },
                        { text: 'Cost', style: 'tableHeader' },
                        { text: 'Total Cost', style: 'tableHeader' },
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

            const itemLines = this.transformItemLines(item);
            itemLines.forEach(line => {
                lines.push(line);
            });

            // Show matrix rows for all but freight
            if (item.lineType != '4') {

                item.matrixRows.forEach((row) => {

                    const rowDescription = { text: [] };

                    if (item.showAttribSize == '1') {
                        rowDescription.text.push((typeof order.productSizesSorting[row.size] !=='undefined' && order.productSizesSorting[row.size] !=='' && order.productSizesSorting[row.size] !== null) ? order.productSizesSorting[row.size] : row.size);
                    }

                    if (item.showAttribColor == '1') {
                        if (rowDescription.text.length) { rowDescription.text.push(' '); }
                        rowDescription.text.push(row.color);
                    }

                    const rowLine: any = [
                        {
                            columns: [
                                {
                                    // you can also fit the image inside a rectangle
                                    image: this.lookupImage(row.imageUrl),
                                    fit: [32, 32],
                                    width: 32,
                                    margin: [0, 0, 0, 8],
                                },
                                {
                                    stack: [
                                        rowDescription
                                    ]
                                }
                            ],
                        },
                        { text: row.uomAbbreviation ? `${row.quantity} ${row.uomAbbreviation} ` : row.quantity },
                        { text: this.transformCurrencyForOrder(row.cost), alignment: 'right' },
                        { text: this.transformCurrencyForOrder(row.totalCost), alignment: 'right' },
                        { text: this.transformCurrencyForOrder(row.price), alignment: 'right' },
                        { text: this.transformCurrencyForOrder(row.totalPrice, true), alignment: 'right' },
                    ];
                    lines.push(rowLine);

                    if (item.decoVendors && item.decoVendors.length) {
                        const decoLines = this.decorationLines(item, row);
                        decoLines.forEach((decoLine) => {
                            lines.push(decoLine);
                        });
                    }
                });

                item.addonCharges.forEach((charge) => {
                    lines.push([
                        { text: `${charge.name} ` },
                        { text: `${charge.quantity} ` },
                        { text: this.transformCurrencyForOrder(charge.cost), alignment: 'right' },
                        { text: this.transformCurrencyForOrder(charge.totalCost, true), alignment: 'right' },
                        { text: this.transformCurrencyForOrder(charge.price), alignment: 'right' },
                        { text: this.transformCurrencyForOrder(charge.totalPrice, true), alignment: 'right' },
                    ]);
                });
            }
        });

        lineItemTable.table.body = [
            ...lineItemTable.table.body,
            ...lines
        ];
        return lineItemTable;
    }

    getApplicableItems() {
        const { order } = this.config;
        return order.lineItems;
    }

    // Extend in order to not roll
    decorationLines(item, row) {
        const lines = [];
        if (item.decoVendors && item.decoVendors.length) {
            item.decoVendors
                .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId))
                .forEach((deco: IDecoVendor) => {
                    const decoImageUrl = this.getDecoImageUrl(deco);

                    let quantity = deco.quantity;

                    if (item.calculatorData && item.calculatorData.length) {
                        quantity = '';
                    }
                    lines.push([
                        {
                            columns: [
                                {
                                    image: this.lookupImage(decoImageUrl),
                                    fit: [64, 32],
                                    width: 64,
                                    margin: [16, 0, 0, 0],
                                },
                                { text: `${deco.decoTypeName} \n ${deco.decoLocation}` },
                            ],
                        },
                        { text: `${quantity}` },
                        { text: this.transformCurrencyForOrder(deco.itemCost), alignment: 'right' },
                        { text: this.transformCurrencyForOrder(deco.totalCost, true), alignment: 'right' },
                        { text: this.transformCurrencyForOrder(deco.customerPrice), alignment: 'right' },
                        { text: this.transformCurrencyForOrder(deco.totalPrice, true), alignment: 'right' },
                    ]);
                    deco.addonCharges.forEach((charge) => {
                        lines.push([
                            { text: `${charge.name} `, margin: [16, 0, 0, 0] },
                            { text: `${charge.quantity} ` },
                            { text: this.transformCurrencyForOrder(charge.cost), alignment: 'right' },
                            { text: this.transformCurrencyForOrder(charge.totalCost, true), alignment: 'right' },
                            { text: this.transformCurrencyForOrder(charge.price), alignment: 'right' },
                            { text: this.transformCurrencyForOrder(charge.totalPrice, true), alignment: 'right' },
                        ]);
                    });
                });
        }

        return lines;
    }
    transformItemLines(item: LineItem): any {
        const { docOptions } = this.config;

        const itemDescriptionStack: any = [
            { text: this.lineItemDescription(item) },
        ];
        const itemDescriptionWithCodeStack: any = [];
        if(docOptions[14] && docOptions[14].value){
            itemDescriptionStack.push({ text: item.itemNo, alignment: 'left' });

        }
        if (docOptions[30] && docOptions[30].value) {
                itemDescriptionStack.push({ text: item.inhouseId, alignment: 'left' });
                itemDescriptionWithCodeStack.push({ text: item.inhouseId, alignment: 'left' });
        }
        
        if(docOptions[33] && docOptions[33].value){
            itemDescriptionStack.push({ text: item.itemCode, alignment: 'left' });
            itemDescriptionWithCodeStack.push({ text: item.itemCode, alignment: 'left' });
        }



        
        // Show product description
        if (docOptions[17] && docOptions[17].value && item.customerDescription && item.lineType != '4') {
            itemDescriptionStack.push({
                text: `${item.customerDescription}`,
                style: 'smallGray'
            });
        }


        const lines: any = [
            [
                {
                    columns: [
                        {
                            stack: [ {image: this.lookupImage(item.quoteCustomImage),fit: [48, 48], width: 48}, itemDescriptionWithCodeStack]
                        },
                        { stack: itemDescriptionStack },
                    ],
                },
                {
                    text: `${item.quantity}`,
                },
                {
                    text: '',
                    alignment: 'right'
                },
                {
                    text: '',
                    alignment: 'right'
                },
                {
                    text: '',
                    alignment: 'right'
                },
                {
                    text: '',
                    alignment: 'right'
                },
            ]
        ];
        return lines;
    }

    lineItemsSummaryTable(): any {
        const { order } = this.config;
        const node = {
            layout: 'noBorders',
            table: {
                headerRows: 0,
                widths: ['*', 'auto'],
                body: [],
                dontBreakRows: true,
            },
            margin: [0, 4, 0, 0],
            unbreakable: true,
        };
        const lines = [];
        // Totals
        lines.push([
            {
                text: this.getDynamicDocLabel('subTotal','Subtotal'),
                alignment: 'right'
            },
            {
                text: this.transformCurrencyForOrder(order.orderAmount, true),
                alignment: 'right'
            }
        ]);

        if (order.discountAmount) {
            lines.push([
                {
                    text: this.getDocLabel('discount', 'Discount Amount'),
                    alignment: 'right'
                },
                {
                    text: this.transformCurrencyForOrder(order.discountAmount, true),
                    alignment: 'right'
                }
            ]);
        }
        let taxLabel = this.getTaxLabel();
        if(taxLabel.indexOf("%") < 0){
            taxLabel = taxLabel+' ('+ order.taxRate +'%)';
        }
        lines.push([
            {
                text: taxLabel,
                alignment: 'right'
            },
            {
                text: this.transformCurrencyForOrder(order.taxAmount, true),
                alignment: 'right'
            }
        ]);

        lines.push([
            {
                text: this.getDynamicDocLabel('total', this.getDocLabel('totalPrice')),
                alignment: 'right',
                style: 'bigger',
            },
            {
                text: this.transformCurrencyForOrder(order.finalGrandTotalPrice, true),
                alignment: 'right',
                style: 'bigger',
            }
        ]);

        let grossProfit = order.grossProfit;
        let totalCost = order.totalCost;

        let gpPercent: number = ((parseFloat(order.grossProfit) / parseFloat(order.orderAmount)) * 100);

        if (isNaN(gpPercent)) {
            gpPercent = 0;
        }
        if (typeof this.config.ordersConfig.settings !=='undefined' && typeof this.config.ordersConfig.settings.poDoc !=='undefined' && this.config.ordersConfig.settings.poDoc === '2' && this.config.vouchedInfo.lines.length > 0 && this.config.vouchedInfo.vouchCompleted) {
          grossProfit = this.config.vouchedInfo.orderSummary.grossProfit;
          gpPercent = Number(this.config.vouchedInfo.orderSummary.grossProfitPercent);
          totalCost = this.config.vouchedInfo.orderSummary.totalCost;
        }

        lines.push([
            {
                text: this.getDynamicDocLabel('grossProfit', 'Gross Profit'),
                alignment: 'right',
            },
            {
                text: this.transformCurrencyForOrder(grossProfit, true),
                alignment: 'right',
            }
        ]);

        lines.push([
            {
                text: this.getDynamicDocLabel('totalCost', 'Total Cost'),
                alignment: 'right',
            },
            {
                text: this.transformCurrencyForOrder(totalCost, true),
                alignment: 'right',
            }
        ]);

        lines.push([
            {
                text: 'GP %',
                alignment: 'right',
            },
            {
                text: `${gpPercent.toFixed(2)}%`,
                alignment: 'right',
            }
        ]);

        //     <tr class="discount">
        //     <td>Gross profit</td>
        //     <td>{{order.grossProfit | currency:'USD':'symbol':sysconfigOrderFormTotalDecimalUpto}}</td>
        // </tr>
        // <tr class="discount">
        //     <td>Total Cost</td>
        //     <td>{{order.totalCost | currency:'USD':'symbol':sysconfigOrderFormTotalDecimalUpto}}</td>
        // </tr>
        // <tr class="discount">
        //     <td>GP %</td>
        //     <td>{{(order.grossProfit / order.orderAmount) | percent:sysconfigOrderFormTotalDecimalUpto}}
        //     </td>
        // </tr>


        lines.forEach((line) => node.table.body.push(line));
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
    
    vendorSummaryTable() {
        const node: any = {
            layout: 'order',
            table: {
                headerRows: 1,
                widths: ['*', 45, 70],
                body: [
                    [
                        { text: 'Vendor Name', style: 'tableHeader' },
                        { text: 'Qty', style: 'tableHeader' },
                        //{ text: 'Cost', style: 'tableHeader' },
                        { text: 'Total Cost', style: 'tableHeader' },
                    ]
                ],
                dontBreakRows: true,
            },
            margin: [0, 4, 0],
            unbreakable: true,
        };
        if (typeof this.config.ordersConfig.settings !=='undefined' && typeof this.config.ordersConfig.settings.poDoc !=='undefined' && this.config.ordersConfig.settings.poDoc === '2' && this.config.vouchedInfo.lines.length > 0) {
            node.table.widths.push(45);
            node.table.widths.push(70);
            node.margin.push(0);
            node.margin.push(0);
            node.table.body[0].push({text: 'Vouched Qty', style: 'tableHeader'});
            node.table.body[0].push({text: 'Vouched Cost', style: 'tableHeader'});
        }
        const filteredItems = this.getApplicableItems();
        const summary = filteredItems.reduce((summary, item) => {
            const vendorId = item.vendorId;

            item.matrixRows.forEach((row) => {
                    if (!summary[vendorId]) {
                        summary[vendorId] = {
                            vendorId: item.vendorName,
                            vendorName: item.vendorName,
                            totalCost: parseFloat(row.totalCost),
                            totalQty: parseFloat(row.quantity),
                            costPerQty: row.quantity != 0 ? (row.totalCost / row.quantity) : 0
                        };
                    } else {
                        summary[vendorId].totalCost += parseFloat(row.totalCost);
                        summary[vendorId].totalQty += parseFloat(row.quantity);
                        summary[vendorId].costPerQty += summary[vendorId].totalQty != 0 ? (summary[vendorId].totalCost / summary[vendorId].totalQty) : 0;
                    }
            });

            item.addonCharges.forEach((addonCharge) => {
                    if (!summary[vendorId]) {
                        summary[vendorId] = {
                            vendorId: item.vendorName,
                            vendorName: item.vendorName,
                            totalCost: parseFloat(addonCharge.totalCost),
                            totalQty: 0,
                            costPerQty: item.quantity != 0 ? (addonCharge.totalCost / item.quantity) : 0
                        };
                    } else {
                        summary[vendorId].totalCost += parseFloat(addonCharge.totalCost);
                        summary[vendorId].totalQty += 0;
                        summary[vendorId].costPerQty += summary[vendorId].totalQty != 0 ? (summary[vendorId].totalCost / summary[vendorId].totalQty) : 0;
                    }
            });

            item.decoVendors.forEach((deco) => {
                    const vendorId = deco.vendorId;
                    if (!summary[vendorId]) {
                        summary[vendorId] = {
                            vendorId: deco.vendorName,
                            vendorName: deco.vendorName,
                            totalCost: parseFloat(deco.totalCost),
                            totalQty: parseFloat(deco.quantity),
                            costPerQty: deco.quantity != 0 ? (deco.totalCost / deco.quantity) : 0
                        };
                    } else {
                        summary[vendorId].totalCost += parseFloat(deco.totalCost);
                        summary[vendorId].totalQty += parseFloat(deco.quantity);
                        summary[vendorId].costPerQty += summary[vendorId].totalQty != 0 ? (summary[vendorId].totalCost / summary[vendorId].totalQty) : 0;
                    }

                    deco.addonCharges.forEach((addonCharge) => {
                            if (!summary[vendorId]) {
                                summary[vendorId] = {
                                    vendorId: deco.vendorName,
                                    vendorName: deco.vendorName,
                                    totalCost: parseFloat(addonCharge.totalCost),
                                    totalQty: 0,
                                    costPerQty: deco.quantity != 0 ? (addonCharge.totalCost / deco.quantity) : 0
                                };
                            } else {
                                summary[vendorId].totalCost += parseFloat(addonCharge.totalCost);
                                summary[vendorId].totalQty += 0;
                                summary[vendorId].costPerQty += summary[vendorId].totalQty != 0 ? (summary[vendorId].totalCost / summary[vendorId].totalQty) : 0;
                            }
                    });
            });

            /*
            if (!summary[vendorId]) {
                summary[vendorId] = {
                    vendorId: item.vendorName,
                    vendorName: item.vendorName,
                    totalCost: parseFloat(item.totalCost),
                    totalQty: parseFloat(item.quantity),
                    costPerQty: item.quantity != 0 ? (item.totalCost / item.quantity) : 0
                };
            } else {
                summary[vendorId].totalCost += parseFloat(item.totalCost);
                summary[vendorId].totalQty += parseFloat(item.quantity);
                summary[vendorId].costPerQty += summary[vendorId].totalQty != 0 ? (summary[vendorId].totalCost / summary[vendorId].totalQty) : 0;
            }*/
            return summary;
        }, {});

        const vendorIds = Object.keys(summary);

        vendorIds.forEach(id => {
            const rows = [
                { text: summary[id].vendorName },
                { text: summary[id].totalQty, alignment: 'right' },
                //{ text: this.transformCurrencyForOrder(summary[id].costPerQty, true), alignment: 'right' },
                { text: this.transformCurrencyForOrder(summary[id].totalCost, true), alignment: 'right' },
            ];
            if (typeof this.config.ordersConfig.settings !=='undefined' && typeof this.config.ordersConfig.settings.poDoc !=='undefined' && this.config.ordersConfig.settings.poDoc === '2' && this.config.vouchedInfo.lines.length > 0) {
              if (this.config.vouchedInfo.poTotal && this.config.vouchedInfo.poTotal[id]) {
                  rows.push({text: this.config.vouchedInfo.poTotal[id].quantity, alignment: 'right'});
                  rows.push({text: this.transformCurrencyForOrder(this.config.vouchedInfo.poTotal[id].total, true), alignment: 'right'});
              } else {
                  rows.push({text: '', alignment: 'right'});
                  rows.push({text: '', alignment: 'right'});
              }
            }
            node.table.body.push(rows);

        });
        return node;
    }

    content() {
        const { order } = this.config;
        this.fromCurrencyCode = order.fromCurrencyCode;
        this.fromCurrencySymbol = order.fromCurrencySymbol;

      return [
          this.subheader(),
          '\n',
          this.orderNoteTop(),
          this.lineItemTable(),
          this.lineItemsSummaryTable(),
          // ty
          this.paymentButton(),
          this.paymentList(),
          this.shipInfoList(),
          this.orderNote(),
          this.documentFooterNote(),
          (typeof this.config.ordersConfig.settings !=='undefined' && typeof this.config.ordersConfig.settings.poDoc !=='undefined' && this.config.ordersConfig.settings.poDoc === '2' && this.config.vouchedInfo.lines.length) > 0 ? {text: '\nVouched Details\n', style: 'bigger'} : '',
          (typeof this.config.ordersConfig.settings !=='undefined' && typeof this.config.ordersConfig.settings.poDoc !=='undefined' && this.config.ordersConfig.settings.poDoc === '2' && this.config.vouchedInfo.lines.length) > 0 ? this.vouchedLineItemTable() : '',
          this.vendorSummaryTable(),
      ];
    }

    // ty
    paymentButton() {
        const {docOptions} = this.config;
        if (docOptions && docOptions[19] && docOptions[19].value) {
            return { columns:[{ text: '', width: '*' },{ ...this.paymentLink(), alignment: 'right', width: 100 }]}
        }

        return null;
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
                    //return this.formatter.transformCurrency(amount * this.exchageRateForCustomer, '', this.toCurrencySymbolForCustomer);
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
