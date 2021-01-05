import { MatrixRow } from 'app/models';
import { InvoiceDocument } from './invoice.document';

export class PickListDocument extends InvoiceDocument {
    name = 'pick-list';
    label = 'Pick List';
    totalQuantity: number = 0;

    getTitle() {
        return this.getDynamicDocLabel('heading', this.label);
    }

    getApplicableItems() {
        const { order } = this.config;
        return order.lineItems.filter((item) => item.lineType != '4' && item.lineType != '3');
    }

    pickListTable() {
        const { order, docOptions } = this.config;

        const lineItemTable = {
            layout: 'noBorders',
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 1,
                widths: [45, '*', 55, 45, 45, 45, 45, 35],
                body: [
                    // Table Header
                    // Item #	Name	SKU	Size	Color	Qty
                    [
                        { text: 'Item #', style: 'tableHeader' },
                        { text: 'Name', style: 'tableHeader' },
                        { text: 'SKU', style: 'tableHeader' },
                        { text: 'Size', style: 'tableHeader' },
                        { text: 'Color', style: 'tableHeader' },
                        { text: 'Site', style: 'tableHeader' },
                        { text: 'Bin', style: 'tableHeader' },
                        { text: 'Qty', style: 'tableHeader' },
                    ],
                ],
                dontBreakRows: true,
            }
        };

        const lines = [];

        this.getApplicableItems().forEach((lineItem) => {
            if (!lineItem.matrixRows || lineItem.matrixRows.length === 0) {
                lineItem.matrixRows = [new MatrixRow({})];
            }
            lineItem.matrixRows.forEach(row => {
                this.totalQuantity += (row.unitQuantity * 1);

                let inventoryData = {
                    site: '',
                    bin: '',
                };
                if (this.config && this.config.resolve && this.config.resolve.length) {
                    const inventoryRow = this.config.resolve.find((_row) => _row.sku === row.itemSku);
                    if (inventoryRow) {
                        inventoryData = { ...inventoryData, ...inventoryRow };
                    }
                }


                const itemNumberNode = {
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
                        { text: lineItem.itemNo, alignment: 'center' }
                    );
                }

                if (docOptions[30] && docOptions[30].value) {
                    itemNumberNode.stack.push(
                        { text: lineItem.inhouseId, alignment: 'center' }
                    );
                }

                if (docOptions[33] && docOptions[33].value) {
                    itemNumberNode.stack.push(
                        {text: lineItem.itemCode, alignment: 'center' }
                    );
                }


                const newRow = [
                    itemNumberNode,
                    lineItem.productName,
                    row.itemSku,
                    (typeof order.productSizesSorting[row.size] !=='undefined' && order.productSizesSorting[row.size] !=='' && order.productSizesSorting[row.size] !== null) ? order.productSizesSorting[row.size] : row.size,
                    row.color,
                    inventoryData.site,
                    inventoryData.bin,
                    row.unitQuantity
                ];
                lines.push(newRow);
            });
        });
        lines.forEach((line) => lineItemTable.table.body.push(line));

        return lineItemTable;
    }

    pickListSummary() {
        const { order } = this.config;
        return {
            layout: 'order',
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
        return [
            this.subheader(),
            '\n',
            this.pickListTable(),
            this.pickListSummary(),
            this.documentFooterNote(),
        ];
    }


}