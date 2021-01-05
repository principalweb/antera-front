import { MatrixRow } from 'app/models';
import { InvoiceDocument } from './invoice.document';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';
export class PackingListDocument extends InvoiceDocument {
    name = 'packing-list';
    label = 'Packing List';
    totalQuantity: number;
    getTitle() {
        return this.getDynamicDocLabel('heading', this.label);
    }

    getApplicableItems() {
        const { order, vendorId } = this.config;
        if(vendorId !== '' && vendorId !== 'All'){
            return order.lineItems.filter((item) => item.vendorId == vendorId && item.lineType != '4' && item.lineType != '3' && item.hideLine != '1');
        }else{
            return order.lineItems.filter((item) => item.lineType != '4' && item.lineType != '3' && item.hideLine != '1');
        }
        
    }

    packingTable() {
        const { order, docOptions, vendorId, updatedpackingListTempQuantity, packingListTempQuantity, boxNotesPLColumn } = this.config;
        let colWidths = [45, '*', 'auto', 45, 45, 35];
        if(updatedpackingListTempQuantity){
            colWidths = [45, '*', 'auto', 40, 40, 60, 35];
        }
        const node = {
            layout: 'order',
            table: {
                headerRows: 1,
                widths: colWidths,
                body: [

                ],
                dontBreakRows: true,
                margin: [0, 16, 0, 0]
            }
        };
        if(vendorId != 'All'){
            if(updatedpackingListTempQuantity){
                node.table.body.push([
                        { text: 'Item #', style: 'tableHeader' },
                        { text: 'Name', style: 'tableHeader' },
                        { text: 'SKU', style: 'tableHeader' },
                        { text: (docOptions[23] && docOptions[23].value) ? 'Size' : '', style: 'tableHeader' },
                        { text: (docOptions[23] && docOptions[23].value) ? 'Color' : '', style: 'tableHeader' },
                        { text: boxNotesPLColumn ? boxNotesPLColumn : 'Box Notes', style: 'tableHeader' },
                        { text: 'Qty', style: 'tableHeader' },
                    ]);            
            }else{
                node.table.body.push([
                        { text: 'Item #', style: 'tableHeader' },
                        { text: 'Name', style: 'tableHeader' },
                        { text: 'SKU', style: 'tableHeader' },
                        { text: (docOptions[23] && docOptions[23].value) ? 'Size' : '', style: 'tableHeader' },
                        { text: (docOptions[23] && docOptions[23].value) ? 'Color' : '', style: 'tableHeader' },
                        { text: 'Qty', style: 'tableHeader' },
                    ]);                        
            }
        }
        const lines = [];
        this.totalQuantity = 0;
        if(vendorId == 'All'){
            const filteredItems = this.getApplicableItems();
            let lineItemsByVendor = groupBy(filteredItems, 'vendorName');
            each(keys(lineItemsByVendor), vendorNameKey => {
                let line = this.getInnterTable(lineItemsByVendor[vendorNameKey]);
                    if(updatedpackingListTempQuantity){
                            lines.push([
                                { text: '', colSpan : 2, alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                {},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'}
                            ]);
                            lines.push([
                                { text: 'Vendor', colSpan : 2, alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                {},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'}
                            ]);
                            lines.push([
                                { text: vendorNameKey, colSpan : 2, alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                {},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'}
                            ]);
                            lines.push([
                                { text: 'Item #', style: 'tableHeader' },
                                { text: 'Name', style: 'tableHeader' },
                                { text: 'SKU', style: 'tableHeader' },
                                { text: (docOptions[23] && docOptions[23].value) ? 'Size' : '', style: 'tableHeader' },
                                { text: (docOptions[23] && docOptions[23].value) ? 'Color' : '', style: 'tableHeader' },
                                { text: boxNotesPLColumn ? boxNotesPLColumn : 'Box Notes', style: 'tableHeader' },
                                { text: 'Qty', style: 'tableHeader' },
                            ]);
                            line.forEach((item: any) => {
                                lines.push(item);
                            });

                    }else{
                            lines.push([
                                { text: '', colSpan : 2, alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                {},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'}
                            ]);
                            lines.push([
                                { text: 'Vendor', colSpan : 2, alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                {},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'}
                            ]);
                            lines.push([
                                { text: vendorNameKey, colSpan : 2, alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                {},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'}
                            ]);
                            lines.push([
                                { text: 'Item #', style: 'tableHeader' },
                                { text: 'Name', style: 'tableHeader' },
                                { text: 'SKU', style: 'tableHeader' },
                                { text: (docOptions[23] && docOptions[23].value) ? 'Size' : '', style: 'tableHeader' },
                                { text: (docOptions[23] && docOptions[23].value) ? 'Color' : '', style: 'tableHeader' },
                                { text: 'Qty', style: 'tableHeader' },
                            ]);
                            line.forEach((item: any) => {
                                lines.push(item);
                            });

                    }
            });
        }else{
            const filteredItems = this.getApplicableItems();
            let line = this.getInnterTable(filteredItems);
                    line.forEach((item: any) => {
                        lines.push(item);
                    });
        }
        lines.forEach((line) => node.table.body.push(line));

        return node;
    }
    getInnterTable(filteredItems){
        const { order, docOptions, vendorId, updatedpackingListTempQuantity, packingListTempQuantity, packingListTempBoxNotes } = this.config;
        const lines = [];
        filteredItems.forEach((lineItem) => {
            
            if (!lineItem.matrixRows || lineItem.matrixRows.length === 0) {
                lineItem.matrixRows = [new MatrixRow({})];
            }
            lineItem.matrixRows.forEach(row => {
                if (lineItem.hideLine != '1') {
                    if(updatedpackingListTempQuantity && packingListTempQuantity[row.matrixUpdateId]){
                        this.totalQuantity += (packingListTempQuantity[row.matrixUpdateId] * 1);
                    }else{
                        this.totalQuantity += (row.unitQuantity * 1);
                    }
                }

                const itemNumberNode = {
                    stack: []
                };
                const itemDetails = {
                    stack: []
                };
                if (docOptions[15] && docOptions[15].value) {                
                        itemNumberNode.stack.push({
                            image: this.lookupImage(row.imageUrl),
                            fit: [16, 16],
                            width: 16,
                            alignment: 'center'                    
                        });
                }
                if (docOptions[14] && docOptions[14].value) {
                    itemNumberNode.stack.push(
                        {text: lineItem.itemNo, alignment: 'center' }
                    );
                }

                if (docOptions[30] && docOptions[30].value) {
                    itemNumberNode.stack.push(
                        {text: lineItem.inhouseId, alignment: 'center' }
                    );
                }

                if (docOptions[33] && docOptions[33].value) {
                    itemNumberNode.stack.push(
                        {text: lineItem.itemCode, alignment: 'center' }
                    );
                }
                itemDetails.stack.push(
                    {text: lineItem.productName, alignment: 'left' }
                );
                if (docOptions[17] && docOptions[17].value && lineItem.customerDescription && lineItem.lineType != '4' && lineItem.lineType != '5') {
                    itemDetails.stack.push(
                        {text: lineItem.customerDescription, alignment: 'left' }
                    );
                }
                if(updatedpackingListTempQuantity){
                        const newRow = [
                            itemNumberNode,
                            itemDetails,
                            row.itemSku,
                            (docOptions[23] && docOptions[23].value) ? ((typeof order.productSizesSorting[row.size] !=='undefined' && order.productSizesSorting[row.size] !=='' && order.productSizesSorting[row.size] !== null) ? order.productSizesSorting[row.size] : row.size) : '',
                            (docOptions[24] && docOptions[24].value) ? row.color : '',
                            (updatedpackingListTempQuantity && packingListTempBoxNotes[row.matrixUpdateId]) ? packingListTempBoxNotes[row.matrixUpdateId] : '',
                            (updatedpackingListTempQuantity && packingListTempQuantity[row.matrixUpdateId]) ? packingListTempQuantity[row.matrixUpdateId] : row.unitQuantity
                        ];
                        lines.push(newRow);
                }else{
                        const newRow = [
                            itemNumberNode,
                            itemDetails,
                            row.itemSku,
                            (docOptions[23] && docOptions[23].value) ? ((typeof order.productSizesSorting[row.size] !=='undefined' && order.productSizesSorting[row.size] !=='' && order.productSizesSorting[row.size] !== null) ? order.productSizesSorting[row.size] : row.size) : '',
                            (docOptions[24] && docOptions[24].value) ? row.color : '',
                            (updatedpackingListTempQuantity && packingListTempQuantity[row.matrixUpdateId]) ? packingListTempQuantity[row.matrixUpdateId] : row.unitQuantity
                        ];
                        lines.push(newRow);                
                }

            });
        });
        return lines;
    }

    packingTableGrid() {
        const { order, docOptions, vendorId, updatedpackingListTempQuantity, packingListTempQuantity } = this.config;
        const lineItemTable = {
            layout: 'gridOrder',
            table: {
                headerRows: 1,
                widths: [110,'*', 60],
                body: [
                    // Table Header
                    [
                        { text: '',border: [false, false, false, false]},
                        { text: '',border: [false, false, false, false] },
                        { text: '',border: [false, false, false, false] },
                    ]
                ],
                dontBreakRows: true,
            },
        };
        const lines = [];
        this.totalQuantity = 0;
        if(vendorId == 'All'){
            const filteredItems = this.getApplicableItems();
            let lineItemsByVendor = groupBy(filteredItems, 'vendorName');
            each(keys(lineItemsByVendor), vendorNameKey => {
                let line = this.getInnterTableGrid(lineItemsByVendor[vendorNameKey]);
                    lines.push(this.vendorDetailsLine(''));
                    lines.push(this.vendorHeadingLine());
                    lines.push(this.vendorDetailsLine(vendorNameKey));
                    line.forEach((item: any) => {
                        lines.push(item);
                    });
            });
        }else{
            const filteredItems = this.getApplicableItems();
            let line = this.getInnterTableGrid(filteredItems);
                    line.forEach((item: any) => {
                        lines.push(item);
                    });
        }
        

        lineItemTable.table.body = [
            ...lineItemTable.table.body,
            ...lines
        ];
        console.log(lineItemTable);
        return lineItemTable;
    }
    getInnterTableGrid(filteredItems){
        const { order, docOptions, vendorId, updatedpackingListTempQuantity, packingListTempQuantity, packingListTempBoxNotes, boxNotesPLColumn } = this.config;
        const lines = [];
        filteredItems.forEach((item: any) => {
            let productSizesSorting = keys(order.productSizesSorting);
            item.productSizes.sort(function(a, b) {
                  return productSizesSorting.indexOf(a.toUpperCase()) - productSizesSorting.indexOf(b.toUpperCase());
            });
            if(item.matrixRows.length > 0 ){
                const colorRows = groupBy(item.matrixRows, 'color');
                let totalColorQty = 0;
                item.matrixRows.forEach((row) => {
                if(item.productSizes.indexOf(row.size) < 0){
                    item.productSizes.push(row.size);
                }
                    if(updatedpackingListTempQuantity && packingListTempQuantity[row.matrixUpdateId]){
                        this.totalQuantity += (packingListTempQuantity[row.matrixUpdateId] * 1);
                        totalColorQty += (totalColorQty*1) + (packingListTempQuantity[row.matrixUpdateId]*1);
                    }else{
                        this.totalQuantity += (row.unitQuantity * 1);
                        totalColorQty = (totalColorQty*1) + (row.unitQuantity*1);
                    }
                });
                let showProductDetails = true;
                each(keys(colorRows), colorKey => {
                    let showSizeGrid = true;
                    let productSizeCount = 0;
                    let perRowSizes = 9;
                    productSizeCount = item.productSizes.length;
                    let sizeGrid = this.getDefaultProductsSizes(item.productSizes);
                    let gridRowIndex = 1;
                    let gridRowMultiIndex = 0;
                    let imageUrl = '';
                    let totalGridQty = [];
                    totalGridQty.push('Qty');
                    const priceRows = groupBy(colorRows[colorKey], 'unitPrice');
                    let multiSizeGrid = this.getDefaultProductsSizesMultGrid(item.productSizes, productSizeCount, perRowSizes, keys(priceRows).length);
                    each(keys(priceRows), priceKey => {
                        let rows = priceRows[priceKey];
                        let totalQty = 0;
                        const productSizes = [];
                        const productQty = [];
                        rows.forEach((row: any) => {
                            productSizes.push(row.size);
                            if(updatedpackingListTempQuantity && packingListTempQuantity[row.matrixUpdateId]){
                                productQty.push(packingListTempQuantity[row.matrixUpdateId]);
                                totalQty = (totalQty*1) + (packingListTempQuantity[row.matrixUpdateId]*1);                            
                            }else{
                                productQty.push(row.unitQuantity);
                                totalQty = (totalQty*1) + (row.unitQuantity*1);                            
                            }
                            if(imageUrl == ''){
                                imageUrl = row.imageUrl ? row.imageUrl : '';
                                imageUrl = (imageUrl !='' ? imageUrl : (item.quoteCustomImage[0] ? item.quoteCustomImage[0] : ''));                            
                            }
                        });
                        totalGridQty.push(totalQty);
                        if(showProductDetails){
                            lines.push(this.productHeadingLine());
                            lines.push(this.productDetailsLine(item, totalColorQty, showProductDetails));
                            showProductDetails = false;
                        }

                        let qtyIndex = 0;
                        productSizes.forEach((size) => {
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
                        ];
                    lines.push(DefaultSizeMultiGrid);
                    if(updatedpackingListTempQuantity){
			const boxNotesStack = {
			    stack: []
			};
			boxNotesStack.stack.push({ text: boxNotesPLColumn, alignment: 'left'});
			colorRows[colorKey].forEach((row: any) => {
			    if(packingListTempBoxNotes[row.matrixUpdateId]){
			       boxNotesStack.stack.push({ text: row.size +': '+ packingListTempBoxNotes[row.matrixUpdateId], alignment: 'left'});
			    }                            
			});
                        const boxNotes =  [
			    { text: '',border: [true, true, true, true]},
			    boxNotesStack,
                            { text: '',border: [true, true, true, true]}
                            ];
                        lines.push(boxNotes);
                    }
                });
            }
        });
        return lines;
    }
    packingSummary() {
        const { order } = this.config;
        const totalQuantity = this.getApplicableItems().reduce((total, item) => {
            return total + parseFloat(item.quantity);
        }, 0);

        return {
            layout: 'noBorders',
            table: {
                widths: ['*', 'auto'],
                body: [
                    [
                        { text: this.getDynamicDocLabel('totalQuantity', 'Total Quantity'), style: 'bigger', alignment: 'right' },
                        { text: this.totalQuantity, style: 'bigger', alignment: 'center', margin: [8, 0, 0, 0] },
                    ],
                ],
                dontBreakRows: true,
                margin: [0, 16, 0, 0]
            }
        };
    }

    content() {
        const { docGridView } = this.config;
        if(docGridView){
                return [
                    this.subheader(),
                    '\n',
                    this.packingTableGrid(),
                    
                    this.packingSummary(),
                    this.customNotes(),
                    '\n',
                    this.documentFooterNote(),
                ];        
        }else{
                return [
                    this.subheader(),
                    '\n',
                    this.packingTable(),
                    this.packingSummary(),
                    this.customNotes(),
                    '\n',
                    this.documentFooterNote(),
                ];        
        }

    }

    vendorHeadingLine() {
      const vendorLine: any = [
        { text: 'Vendor', alignment: 'left', bold: true, border: [true, true, false, false], style: 'smallText' },
        { text: '', alignment: 'left', border: [false, true, false, false], style: 'smallText'},
        { text: '', alignment: 'center', border: [false, true, true, false], style: 'smallText' },
      ];
      return vendorLine;
    }
    vendorDetailsLine(vendorName) {
      let vendorLine: any;
      if(vendorName != ''){
              vendorLine = [
                { text: vendorName, alignment: 'left', border: [true, false, false, false], style: 'smallText'},
                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                { text: '', alignment: 'right', border: [false, false, true, false], style: 'smallText' },
              ];
      }else{
              vendorLine = [
                { text: `\n \n \n`, alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
                { text: '', alignment: 'right', border: [false, false, false, false], style: 'smallText' },
              ];
      }

      return vendorLine;
    }
    productHeadingLine() {
      const productLine: any = [
        { text: 'Item', alignment: 'left', bold: true, border: [true, true, false, false], style: 'smallText' },
        { text: '', alignment: 'left', border: [false, true, false, false], style: 'smallText'},
        { text: '', alignment: 'center', border: [false, true, true, false], style: 'smallText' },
      ];
      return productLine;
    }
    productDetailsLine(item, totalQty, showProductDetails = true) {
        const { docOptions } = this.config;

        let itemDetails = item.productName;
        if (docOptions[17] && docOptions[17].value && item.customerDescription && item.lineType != '4' && item.lineType != '5') {
            itemDetails = `${item.productName} \n ${item.customerDescription}`;
        }
      const productLine: any = [
        { text: (showProductDetails ? item.itemNo : ''), alignment: 'left', border: [true, false, false, false], style: 'smallText'},
        { text: itemDetails, alignment: 'left', border: [false, false, false, false], style: 'smallText'},
        { text: 'Qty '+totalQty, alignment: 'right', border: [false, false, true, false], style: 'smallText' },
      ];
      return productLine;
    }
    customNotes(){
    const { customPLNote } = this.config;
            if (customPLNote) {
                return { text: customPLNote };
            }    
    }
}