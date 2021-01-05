import { InvoiceDocument } from './invoice.document';
import { OrderDetails, LineItem, MatrixRow } from 'app/models';
import { DocumentImageManager, DocumentImageThumbnail } from '../document-image-manager';
import { IDocument, AbstractOrderDocument } from '../document.interface';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';

export class PurchaseOrderNeedsDocument extends InvoiceDocument {
    name = 'purchase-order-needs';
    label = 'Purchase Order Needs';
    totalQuantity: number = 0;
    totalPoCost: number = 0;
    fromCurrencyCode = 'USD';
    fromCurrencySymbol = '$';
    toCurrencyCodeForVendor = '';
    toCurrencySymbolForVendor = '';
    exchageRateForVendor = 1;
    getApplicableItemsList = [];
    constructor(public config: {
        order: Partial<OrderDetails>,
        logoUrl?: string,
        [x: string]: any,
    }) {
        super(config);
        this.imageManager = new DocumentImageManager();
        this.getApplicableItemsList = this.getApplicableItems();
    }
    getTitle() {
        return this.getDynamicDocLabel('heading', this.label);
    }

    getAvailableFields() {
        return [];
    }

    getImages(): DocumentImageThumbnail[] {
        const { order } = this.config;
        let getApplicableItemsListForImages = this.getApplicableItemsList;
        const images = getApplicableItemsListForImages.reduce((collection, item, index) => {
            if (item.config  && item.config.image) {
                    if (!collection.find(x => x.src === item.config.image)) {
                        collection.push({ src: item.config.image });
                    }
            }
            return collection;
        }, []);

        if (this.config && this.config.logoUrl) {
            images.push({ src: this.config.logoUrl, width: 300 });
        }
        if (this.showBarCode && order.barCodeURL) {
            images.push({ src: order.barCodeURL, width: 99 });
        }
        return images;
    }

    getApplicableShippingDetails() {
        const { order } = this.config;
        let filteredItems = [];
        const Items = order.lineItems
            .filter((item) => {
                    return item.description == '';
            });
            Items.forEach((item: any) => {
            const row = {
            ...item,
            shipTo: item.shipInfo.name
            }
            filteredItems.push(row);
            });
            return filteredItems;
    }
    getApplicableItems() {
        const { order } = this.config;
        let filteredItems = [];
        let totalAmount = 0;
        const Items = order.lineItems
            .filter((item) => {
                    return item.description != '';
            });
            Items.forEach((item: any) => {

            let colorSizes = item.description ? item.description.split(" - ") : '';
            if(item.vendorInfo){
		let vendorInfo = JSON.parse( item.vendorInfo );
		this.toCurrencyCodeForVendor = vendorInfo.toCurrencyCodeForVendor || '';
		this.toCurrencySymbolForVendor = vendorInfo.toCurrencySymbolForVendor || '';
		this.exchageRateForVendor = vendorInfo.exchageRateForVendor || 1;            
            }else{
                this.exchageRateForVendor = 1;
            }

            const row = {
            ...item,
            color: colorSizes[0],
            size: colorSizes[1],
            shipTo: item.shipInfo.name,
            unitPrice : (item.unitPrice * this.exchageRateForVendor),
            extendedPrice : (item.extendedPrice * this.exchageRateForVendor)
            }
            /*
            conosle.log(item.productInfo);
            const row = {
            ...item,
            color: item.productInfo.color,
            size: item.productInfo.size,
            shipTo: item.shipInfo.name
            }
            */
            totalAmount = (totalAmount * 1 ) +  (item.extendedPrice * this.exchageRateForVendor);

            filteredItems.push(row);
            });
            this.config.order.finalGrandTotalPrice = totalAmount.toString();
            this.config.order.toCurrencyCodeForCustomer = this.toCurrencyCodeForVendor;
            this.config.order.toCurrencySymbolForCustomer = this.toCurrencySymbolForVendor;            
            return filteredItems;
    }

    subheader(){
        
        const { order, docGridView } = this.config;
        const title = this.getTitle();
		return [
		    {
			columns: [
			    { image: this.config.logoUrl ? this.config.logoUrl : 'placeholder', width: 150 },
			    {
				text: `${title} #${order.orderNo}`, style: 'header', alignment: 'right'
			    },
			]
		    },
		    (docGridView) ? this.horizontalLineGridView() : this.horizontalLine(),
		    this.billingDetails()
		];        
    }

    billingDetails() {
        const { resolve } = this.config;

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

        let shippingDetails = '';
        const items = this.getApplicableShippingDetails();
        if(items.length == 1){
                shippingDetails = items[0].shipInfo.accountName;
		if (items[0].shipInfo.name && items[0].shipInfo.name !== items[0].shipInfo.accountName) {
		    shippingDetails += '\n' + items[0].shipInfo.name;
		}
		if(items[0].shipInfo.addressLines.length > 0){
		    items[0].shipInfo.addressLines.forEach((addr: any) => {
		        shippingDetails += '\n' + addr;
		    });
		}

		if (items[0].shipInfo.city) {
		    shippingDetails += '\n' + items[0].shipInfo.city;
		}
		if (items[0].shipInfo.state) {
		    shippingDetails += ' ' + items[0].shipInfo.state;
		}
		if (items[0].shipInfo.postalCode) {
		    shippingDetails += ' ' + items[0].shipInfo.postalCode;
		}
		if (items[0].shipInfo.country) {
		    shippingDetails += '\n' + items[0].shipInfo.country;
		}
		if (items[0].shipInfo.phone) {
		    shippingDetails += '\n' + items[0].shipInfo.phone;
		}
        }
        return {
            columns: [
                [
                    {
                        columns: [
                            { width: '70%', text: this.getDynamicDocLabel('supplier', 'Supplier'), style: 'fieldLabel' },
                            { width: '70%', text: (items.length == 1) ? this.getDynamicDocLabel('shipTo', 'Ship To') : '', style: 'fieldLabel' },
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

    itemListTable() {
        const { order} = this.config;
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
        //TODO Find correct corresponding type for filteredGroupedItemsByProductId
        let filteredGroupedItemsByShipTo: any = [];
        const filteredItems = this.getApplicableItemsList;
        filteredGroupedItemsByShipTo = groupBy(filteredItems, 'shipTo');
        const shippingDetails = this.getApplicableShippingDetails();
        let shippingCount = shippingDetails.length;
        each(keys(filteredGroupedItemsByShipTo), shipToKey => {
            //TODO Find correct corresponding type for filteredGroupedItemsByProductId
            let filteredGroupedItemsByProductId: any = [];
            let filteredGroupedItems = filteredGroupedItemsByShipTo[shipToKey];
            filteredGroupedItemsByProductId = groupBy(filteredGroupedItems, 'customerProductId');
            if(shippingCount > 1 && filteredGroupedItems[0].shipInfo){
	        lines.push(this.shipToHeadingLine());
	        lines.push(this.shipToDetailsLine(filteredGroupedItems[0].shipInfo));            
            }
	    each(keys(filteredGroupedItemsByProductId), itemKey => {
	       let totalColorQty = 0;
	       let totalColorPrice = 0; 	
	       filteredGroupedItemsByProductId[itemKey].forEach((row) => {
		   totalColorQty = (totalColorQty*1) + (row.quantity*1);
		   totalColorPrice = (totalColorPrice*1) + (row.extendedPrice*1);
		   this.totalPoCost += (row.extendedPrice*1);
	        });	    
	        let items = filteredGroupedItemsByProductId[itemKey];
	        let defaultProductSizes = this.getProductSizes(items);
                let productSizesSorting = keys(order.productSizesSorting);
	        defaultProductSizes.sort(function(a, b) {
		     return productSizesSorting.indexOf(a.toUpperCase()) - productSizesSorting.indexOf(b.toUpperCase());
                });
	        const colorRows = groupBy(items, 'color');

		     let showProductDetails = true;
		     each(keys(colorRows), colorKey => {
			    let showSizeGrid = true;
			    let productSizeCount = 0;
			    let perRowSizes = 9;
			    productSizeCount = defaultProductSizes.length;
			    let sizeGrid = this.getDefaultProductsSizes(defaultProductSizes);
			    let gridRowIndex = 1;
			    let gridRowMultiIndex = 0;
			    let imageUrl = '';
			    let totalGridQty = [];
			    let unitPrice = [];
			    let totalPrice = [];
			    totalGridQty.push('Qty');
			    unitPrice.push('Price');
			    totalPrice.push('Total Price');

			    const priceRows = groupBy(colorRows[colorKey], 'unitPrice');
			    let multiSizeGrid = this.getDefaultProductsSizesMultGrid(defaultProductSizes, productSizeCount, perRowSizes, keys(priceRows).length);
			    each(keys(priceRows), priceKey => {
				let rows = priceRows[priceKey];
				imageUrl = rows[0].config.image;
				let totalQty = 0;
				    const productSizes = [];
				    const productQty = [];
				rows.forEach((row: any) => {
				    productSizes.push(row.size);
				    productQty.push(row.quantity);
				    totalQty = (totalQty*1) + (row.quantity*1);
				});
				totalGridQty.push(totalQty);
                unitPrice.push(this.transformCurrencyForPO((priceKey)));
                // TODO price key needed to be casted to guarantee total quantity is multiplied by a number
                // find out if this function still works as expected                        
                const priceNumber: number = parseInt(priceKey)
				totalPrice.push(this.transformCurrencyForPO((totalQty * priceNumber), true));

				if(showProductDetails){
				    lines.push(this.productHeadingLine());
				    lines.push(this.productDetailsLine(rows[0], totalColorQty, totalColorPrice, showProductDetails));
				    showProductDetails = false;
				}else{
				    //lines.push(this.productDetailsLine(item, totalQty, priceKey, showProductDetails));
				    //lines.push(this.blankGridLine());
				}
				sizeGrid.table.body[gridRowIndex] = [];
				defaultProductSizes.forEach((size) => {
				 sizeGrid.table.body[gridRowIndex].push('');
				});				

				let qtyIndex = 0;
				productSizes.forEach((size) => {
				 if(sizeGrid.table.body[gridRowIndex][defaultProductSizes.indexOf(size)] !=''){
				     sizeGrid.table.body[gridRowIndex][defaultProductSizes.indexOf(size)] += (productQty[qtyIndex]*1);
				 }else{
				     sizeGrid.table.body[gridRowIndex][defaultProductSizes.indexOf(size)] = (productQty[qtyIndex]*1);
				 }
				if(productSizeCount > perRowSizes && defaultProductSizes.indexOf(size) >= perRowSizes ){
					let gridRowOffset = (Math.ceil((defaultProductSizes.indexOf(size)+1)/perRowSizes) + 1)
					if(typeof multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][defaultProductSizes.indexOf(size) % perRowSizes].text !== 'undefined'){
					     if(multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][defaultProductSizes.indexOf(size) % perRowSizes].text == ' '){
						 multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][defaultProductSizes.indexOf(size) % perRowSizes].text = 0;
					     }
					     multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][defaultProductSizes.indexOf(size) % perRowSizes].text = parseInt(multiSizeGrid.table.body[gridRowMultiIndex+gridRowOffset][defaultProductSizes.indexOf(size) % perRowSizes].text) + (productQty[qtyIndex]*1);
					}                                        
				}else{
					if(typeof multiSizeGrid.table.body[gridRowMultiIndex+1][defaultProductSizes.indexOf(size)].text !== 'undefined'){
					     if(multiSizeGrid.table.body[gridRowMultiIndex+1][defaultProductSizes.indexOf(size)].text == ' '){
						 multiSizeGrid.table.body[gridRowMultiIndex+1][defaultProductSizes.indexOf(size)].text = 0;
					     }
					     multiSizeGrid.table.body[gridRowMultiIndex+1][defaultProductSizes.indexOf(size)].text = parseInt(multiSizeGrid.table.body[gridRowMultiIndex+1][defaultProductSizes.indexOf(size)].text) + (productQty[qtyIndex]*1);
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
			    //lines.push(DefaultSizeGrid);
			    lines.push(DefaultSizeMultiGrid);
		});
	    });
        });
        
        
	


        lineItemTable.table.body = [
            ...lineItemTable.table.body,
            ...lines
        ];
        console.log('lineItemTable');
        console.log(lineItemTable);
        return lineItemTable;

    }
    getProductSizes(items) {
        return Object.keys(groupBy(items, 'size'));
    }
    itemListSummary() {
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
                text: this.getDynamicDocLabel('total', this.getDocLabel('totalPrice')),
                alignment: 'right',
                style: 'bigger',
            },
            {
                text: this.transformCurrencyForPO(this.totalPoCost, true),
                alignment: 'right',
                style: 'bigger',
            }
        ]);

        lines.forEach((line) => node.table.body.push(line));
        return node;
    }

    content() {
        return [
            this.subheader(),
            '\n',
            this.horizontalLineGridView(),
            this.headerVendorPoNotes(),
            this.vendorPoNote(),
            this.itemListTable(),
            this.itemListSummary(),
	    this.footerVendorPoNotes(),
	    this.documentFooterNote(),

        ];
    }



    shipToHeadingLine() {
      const productLine: any = [
        { text: 'Ship To', alignment: 'left', bold: true, border: [true, true, false, false], style: 'smallText' },
        { text: '', alignment: 'left', border: [false, true, false, false], style: 'smallText'},
        { text: '', alignment: 'center', border: [false, true, false, false], style: 'smallText' },
        { text: '', alignment: 'right', border: [false, true, false, false], style: 'smallText' },
        { text: '', alignment: 'center', border: [false, true, true, false], style: 'smallText' },
      ];
      return productLine;
    }
    shipToDetailsLine(shipInfo) {
        const { docOptions } = this.config;
        let shippingDetails = '';
        if(shipInfo.accountName){
            shippingDetails = shipInfo.accountName;
        }
	if (shipInfo.name && shipInfo.name !== shipInfo.accountName) {
	    shippingDetails += '\n' + shipInfo.name;
	}
	if(shipInfo.addressLines && shipInfo.addressLines.length > 0){
	    shipInfo.addressLines.forEach((addr: any) => {
		shippingDetails += '\n' + addr;
	    });
	}

	if (shipInfo.city) {
	    shippingDetails += '\n' + shipInfo.city;
	}
	if (shipInfo.state) {
	    shippingDetails += ' ' + shipInfo.state;
	}
	if (shipInfo.postalCode) {
	    shippingDetails += ' ' + shipInfo.postalCode;
	}
	if (shipInfo.country) {
	    shippingDetails += '\n' + shipInfo.country;
	}
	if (shipInfo.phone) {
	    shippingDetails += '\n' + shipInfo.phone;
	}

      const shippingLine: any = [
        { text: shippingDetails, alignment: 'left', border: [true, false, false, false], style: 'smallText'},
        { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
        { text: '' ,  alignment: 'right', border: [false, false, false, false], style: 'smallText' },
        { text: '', alignment: 'right', border: [false, false, false, false], style: 'smallText' },
        { text: '', alignment: 'right', border: [false, false, true, false], style: 'smallText' },
      ];
      return shippingLine;
    }

    productHeadingLine() {
      const productLine: any = [
        { text: 'Item', alignment: 'left', bold: true, border: [true, true, false, false], style: 'smallText' },
        { text: '', alignment: 'left', border: [false, true, false, false], style: 'smallText'},
        { text: '', alignment: 'center', border: [false, true, false, false], style: 'smallText' },
        { text: '', alignment: 'right', border: [false, true, false, false], style: 'smallText' },
        { text: '', alignment: 'center', border: [false, true, true, false], style: 'smallText' },
      ];
      return productLine;
    }
    productDetailsLine(item, totalQty, price, showProductDetails = true) {
        const { docOptions } = this.config;
        /*
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
            imageStack.columns[itemColIndex].stack.push({ text: item.itemNo, bold: true, alignment: 'left', margin: [2, 2], border: [false, false, false, false], style: 'smallText' });
        }
        if (docOptions[30] && docOptions[30].value) {
            imageStack.columns[itemColIndex].stack.push({ text: item.inhouseId, bold: true, alignment: 'left', margin: [2, 2], border: [false, false, false, false], style: 'smallText' });
        }
        if (docOptions[33] && docOptions[33].value) {
            imageStack.columns[itemColIndex].stack.push({ text: item.itemCode, bold: true, alignment: 'left', margin: [2, 2], border: [false, false, false, false], style: 'smallText' });
        }
        */
      const productLine: any = [
        { text: (showProductDetails ? item.supplierProductId : ''), alignment: 'left', border: [true, false, false, false], style: 'smallText'},
        { text: '', alignment: 'left', border: [false, false, false, false], style: 'smallText'},
        { text: 'Qty '+totalQty ,  alignment: 'right', border: [false, false, false, false], style: 'smallText' },
        { text: 'Total Price', alignment: 'right', border: [false, false, false, false], style: 'smallText' },
        { text: this.transformCurrencyForPO((price), true), alignment: 'right', border: [false, false, true, false], style: 'smallText' },
      ];
      return productLine;
    }

    headerVendorPoNotes() {
    
        const { docOptions } = this.config;
        if (docOptions && docOptions[36] && docOptions[36].value) {
		const filteredItems = this.getApplicableItemsList;
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
		const filteredItems = this.getApplicableItemsList;
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

    vendorPoNote() {
        const { order, resolve } = this.config;

        if (order && order.vendorNotes) {
            return {
                stack: [
                    { text: this.getDynamicDocLabel('vendorPONotes', 'PO Notes')+':', bold: true },
                    { text: order.vendorNotes }
                ],
                margin: [0, 5]
            };
        }
        return '';
    }

    transformCurrencyForPO(amount, formating = false, format = '1.2-2'){
        if(formating){
		if(false && this.exchageRateForVendor > 0 && this.toCurrencyCodeForVendor !='' && this.toCurrencySymbolForVendor !=''){
		    return this.formatter.transformCurrency(amount * this.exchageRateForVendor, '', this.toCurrencySymbolForVendor, format);
		}else if(this.fromCurrencyCode !='' && this.fromCurrencySymbol !=''){
		    return this.formatter.transformCurrency(amount , '', this.fromCurrencySymbol, format);
		}else{
		    return this.formatter.transformCurrency(amount , 'USD', 'symbol', format);
		}        
        }else{
		if(false && this.exchageRateForVendor > 0 && this.toCurrencyCodeForVendor !='' && this.toCurrencySymbolForVendor !=''){
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

}