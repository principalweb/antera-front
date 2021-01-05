import { OrderDetails, LineItem } from 'app/models';
import { Observable } from 'rxjs';
import { DocumentImageManager, DocumentImageThumbnail } from '../document-image-manager';
import { IDocument, AbstractOrderDocument } from '../document.interface';
import { InvoiceDocument } from './invoice.document';

const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}

export class MultiQuoteDocument extends InvoiceDocument {
    name = 'multi-quote';
    label = 'Multi Quote';

    getPageMargins() {
        return [40, 160, 40, 40];
    }

    getTitle() {
        return this.getDynamicDocLabel('heading', this.label);
    }

    getApplicableItems() {
        const { order } = this.config;
        return order.lineItems
            .filter((item) => {
                return item.hideLine != '1' && item.lineType != '4';
            });
    }

    getImages(): DocumentImageThumbnail[] {
        const { order, resolve } = this.config;
        const products = resolve;
        const images = this.getApplicableItems().reduce((collection, item, index) => {
            if (item.quoteCustomImage && item.quoteCustomImage.length) {
                item.quoteCustomImage.forEach((image) => {
                    if (!collection.find(x => x.src === image)) {
                        collection.push({ src: image, width: 300 });
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

        if (products && products.length) {
            products.forEach((product) => {
                if (product.distinctImages && product.distinctImages.length) {
                    images.push({ src: product.distinctImages[0], width: 300 });
                }
            });
        }

        return images;
    }


    fieldRow(label, value, ...args) {
        const node = {
            text: [],
            ...args
        };

        node.text.push({
            text: label + ' ', bold: true,
            margin: []
        });

        node.text.push({
            text: value
        });


        return {
            stack: [node],
            margin: [0, 4]
        };
    }

    lineItemProduct(item, product, config = {}) {
        const node = {
            stack: [],
            ...config
        };
        const attributes = this.uniqueSizesAndColors(product);

        const productImage = this.productImage(item, product);
        if (productImage) {
            node.stack.push({
                columns: [
                    { text: '', width: '*' },
                    {
                        table: {
                            body: [
                                [
                                    {
                                        ...productImage,
                                        borderColor: '#333333',
                                    }
                                ]
                            ]
                        },
                        width: 'auto',
                        margin: [0, 16],
                    },
                    { text: '', width: '*' },
                ]
            });
        }

        node.stack.push({ text: product.productName, style: 'header' });

        if (item.customerDescription) {
            node.stack.push(this.fieldRow('Description: ', item.customerDescription));
        }

        if (product.itemCode) {
            node.stack.push(this.fieldRow('Product Number: ', product.itemCode));
        }

        if (item.showAttribSize == '1') {
            node.stack.push(this.fieldRow('Sizes: ', attributes.sizes.join(', ')));
        }

        if (item.showAttribColor == '1') {
            node.stack.push(this.fieldRow('Color: ', attributes.colors.join(', ')));
        }

        node.stack.push(this.priceBreakTable(item, product));

        node.stack.push(this.addonCharges(item));

        return node;
    }

    productImage(item, product) {
        if (item.quoteCustomImage && item.quoteCustomImage.length) {
            return {
                image: item.quoteCustomImage[0],
                fit: [250, 250],
                alignment: 'center'
            };
        }
        if (product.distinctImages && product.distinctImages.length) {
            return {
                image: product.distinctImages[0],
                fit: [250, 250],
                alignment: 'center'
            };
        }
    }

    decoVendors(item) {
        if (item.decoVendors && item.decoVendors.length) {
            const decoTableData = item.decoVendors.map((deco) => {
                return [
                    { text: deco.decoTypeName },
                    { text: this.formatter.transformCurrency(deco.price) },
                    { text: deco.quantity }
                ];
            });
            return {
                layout: 'order',
                table: {
                    headerRows: 1,
                    body: [
                        ['Name', 'Price', 'Quantity'],
                        ...decoTableData
                    ]
                }
            };
        }
    }

    addonCharges(item) {
        if (item.addonCharges && item.addonCharges.length) {
            const chargeTableData = item.addonCharges.map((charge) => {
                return [
                    { text: charge.name },
                    { text: this.formatter.transformCurrency(charge.price) },
                    { text: charge.quantity }
                ];
            });
            return {
                stack: [
                    { text: 'Additional Charges', bold: true },
                    {
                        layout: 'order',
                        table: {
                            headerRows: 1,
                            widths: ['*', 'auto', 'auto'],
                            body: [
                                ['Name', 'Price', 'Quantity'],
                                ...chargeTableData
                            ]
                        }
                    }
                ]
            };
        }
    }

    priceBreakTable(item, product) {
        const parts = product.ProductPartArray.ProductPart;
        if (parts) {
            product.minQtys = parts.reduce((qtys, part, index) => {
                const partPrice = part.partPrice.PartPriceArray.PartPrice;
                for (let i = 0; i < partPrice.length; i++) {
                    const key = +partPrice[i].minQuantity;
                    const qtyIndex = qtys.indexOf(key);
                    if (qtyIndex === -1) {
                        qtys.push(key);
                    }
                }
                return qtys;
            }, []);
            product.minQtys.sort((a, b) => a - b);
            product.priceTableArray = parts.reduce((rows, part, index) => {
                const partPrice = part.partPrice.PartPriceArray.PartPrice;

                for (let i = 0; i < partPrice.length; i++) {

                    if (item.modifiedPriceBreaks && item.modifiedPriceBreaks.priceBreaks) {
                        const modified = item.modifiedPriceBreaks.priceBreaks[i];

                        if (modified) {
                            partPrice[i].margin = modified.margin;
                            partPrice[i].price = modified.price;
                            partPrice[i].salePrice = modified.salePrice;
                        }
                    }

                    const sizeIndex = rows.findIndex((row) => row.label === part.ApparelSize.labelSize);
                    if (sizeIndex === -1) {
                        const row = { label: part.ApparelSize.labelSize };
                        row[partPrice[i].minQuantity] = partPrice[i];
                        rows.push(row);
                    } else {
                        rows[sizeIndex][partPrice[i].minQuantity] = partPrice[i];
                    }
                }
                return rows;
            }, []);
            if (product.priceTableArray && product.priceTableArray.length) {
                product.priceTableColumns = [
                    'label',
                    ...product.minQtys
                ];
            }

            const tableData = product.priceTableArray.reduce((rows, row) => {
                const rowNode = [];
                product.priceTableColumns.forEach((column) => {
                    if (column === 'label') {
                        rowNode.push({ text: ` ${row[column]} `, alignment: 'right' });
                    } else {


                        let priceValue = '';
                        if (row[column] && row[column].salePrice) {
                            priceValue = this.formatter.transformCurrency(row[column].salePrice, 'USD', 'symbol', '1.2-2');
                        }

                        rowNode.push({ text: priceValue });
                    }
                });
                rows.push(rowNode);
                return rows;
            }, []);

            const node: any = {
                stack: [
                    { text: 'Pricing', bold: true },
                    {
                        layout: 'order',
                        table: {
                            widths: product.priceTableColumns.map((col, colIndex) => {
                                return colIndex === 0 ? '*' : 'auto';
                            }),
                            headerRows: 1,
                            body: [
                                product.priceTableColumns.map((col) => {
                                    if (col === 'label') {
                                        return { text: '', style: 'tableHeader' };
                                    }
                                    return { text: col, style: 'tableHeader' };
                                }),
                                ...tableData
                            ],
                        },
                        margin: [0, 0, 0, 16],
                        alignment: 'center'
                    }
                ]
            };
            return node;
        }
    }

    products() {
        const { order, resolve } = this.config;
        const products = resolve;

        const node = {
            stack: []
        };

        if (order && order.lineItems) {
            const items = this.getApplicableItems();
            items.forEach((item, itemIndex, self) => {
                const product = products.find((p) => p.id === item.productId);
                if (product) {
                    const config: any = {};
                    const isLast = (self.length - 1) === itemIndex;
                    if (!isLast) {
                        config.pageBreak = 'after';
                    }
                    node.stack.push(this.lineItemProduct(item, product, config));
                }
            });
        }

        if (products && products.length) {
            products.forEach((p) => {
            });
        }
        return node;
    }


    header(): any {
        const { order } = this.config;
        const title = this.getTitle();
        return (currentPage, pageCount) => {
            return [
                {
                    columns: [
                        {
                            stack: [
                                { image: this.config.logoUrl ? this.config.logoUrl : 'placeholder', fit: [150, 150] },
                            ],
                            width: 150
                        },
                        {
                            stack: [
                                // { text: `${title} #${order.orderNo}`, style: 'header', alignment: 'right' },
                                { text: order.salesPerson, alignment: 'right' },
                                { text: order.salesPersonEmail, alignment: 'right' },
                                { text: order.salesPersonPhone, alignment: 'right' }
                            ],
                            width: '*'
                        },
                    ],
                    margin: [40, 40, 40, 40]
                },
            ];
        };
    }

    uniqueSizesAndColors(product) {
        const sizes = [];
        const colors = [];
        let quantities = [];

        product.ProductPartArray.ProductPart.forEach(part => {
            // Group price options by sizes
            const size = part.ApparelSize.labelSize;
            sizes.push(size);

            // Update form
            const color = part.ColorArray.Color.colorName;
            colors.push(color);

            const _quantities = part.partPrice.PartPriceArray.PartPrice
                .flatMap(price => price.minQuantity);

            quantities = [...quantities, ..._quantities];
        });

        return {
            sizes: sizes.filter(distinct),
            colors: colors.filter(distinct)
        };
    }

    getDefaultStyle() {
        return {
            fontSize: 11,
            columnGap: 16,
        };
    }

    content() {
        return [
            this.products(),
        ];
    }
}
