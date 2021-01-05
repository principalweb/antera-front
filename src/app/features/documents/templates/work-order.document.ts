import { OrderDetails, LineItem } from 'app/models';
import { Observable } from 'rxjs';
import { DocumentImageManager, DocumentImageThumbnail } from '../document-image-manager';
import { IDocument, AbstractOrderDocument } from '../document.interface';
import { InvoiceDocument } from './invoice.document';
import { MatrixRow, Account } from 'app/models';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';
import { fx2Str, exportImageUrlForPDF, b64toBlob, fx2N } from 'app/utils/utils';

export class WorkOrderDocument extends InvoiceDocument {
    name = 'work-order';
    label = 'Work Order';
    workDataGroupByDecoTypes = [];
    productData = [];
    allMatrixRows = [];
    productNamelist = [];
    designDynamicNotesList = [];
    constructor(public config: {
        order: Partial<OrderDetails>,
        decoTypes: any,
        selectedDecoVendor: any,
        selectedDecoDesigns: any,
        selectedDecoVariation:any,
        selectedDecoLocation:any,
        selectedWorkOrderCnt:any,
        totalWorkOrderCnt:any,
        decoLocationsList: any,
        logoUrl?: string,
        [x: string]: any,
    }) {
        super(config);
        this.imageManager = new DocumentImageManager();
    }

    getTitle() {
        return this.getDynamicDocLabel('heading', this.label);
    }

    getImages(): DocumentImageThumbnail[] {
        const { order, decoLocationsList, selectedWorkOrderCnt, totalWorkOrderCnt } = this.config;
        const images = order.lineItems.reduce((collection, item, index) => {
            if (item.quoteCustomImage && item.quoteCustomImage.length) {
                item.quoteCustomImage.forEach((image) => {
                    if (!collection.find(x => x.src === image)) {
                        collection.push({ src: image });
                    }
                });
            }
            item.matrixRows.forEach((row) => {
                if (row.imageUrl && !collection.find(x => x.src === row.imageUrl)) {
                    collection.push({ src: row.imageUrl, width: 400 });
                }
            });
            item.decoVendors.forEach((deco) => {
                const decoImageUrl = this.getDecoImageUrl(deco);
                if (decoImageUrl && !collection.find(x => x.src === decoImageUrl)) {
                    collection.push({ src: decoImageUrl, width: 400 });
                }

                const decoLocationImageUrl = this.getDecoLocationImageUrl(deco);
                if (decoLocationImageUrl && !collection.find(x => x.src === decoLocationImageUrl)) {
                    collection.push({ src: decoLocationImageUrl, width: 400 });
                }

                const decoLocationsDetails = find(decoLocationsList, { locationName: deco.decoLocation });
                if (decoLocationsDetails && decoLocationsDetails.locationImage && !collection.find(x => x.src === decoLocationsDetails.locationImage)) {
                    collection.push({ src: decoLocationsDetails.locationImage, width: 400 });
                }
                
                
            });
            return collection;
        }, []);

        if (this.config && this.config.logoUrl) {
            images.push({ src: this.config.logoUrl, width: 300 });
        }
        if (order.barCodeURL) {
            //images.push({ src: order.barCodeURL, width: 200 });
            let overrideText = order.orderNo+'w'+selectedWorkOrderCnt;

            images.push({ src: `${order.barCodeURL}&overrideText=${overrideText}`, width: 200});
        }
        
        return images;
    }

    shipTable() {
        return {
            layout: 'order',
            table: {
                widths: ['*', '*', '*', '*'],
                body: [
                    [
                        {
                            stack: [
                                { text: 'Ship To:' }
                            ],
                            rowSpan: 4
                        },
                        'Terms',
                        'Request Ship',
                        'Drop Dead'
                    ],
                    [
                        '',
                        'Shipping Method',
                        'Date',
                        'Date',
                    ],
                    [
                        '',
                        'W/C NOTIFIED',
                        { text: 'Date Completed', rowSpan: 2 },
                        { text: 'Job Run By', rowSpan: 2 },
                    ],
                    [
                        '',
                        'Name',
                        '',
                        '',
                    ],
                ]
            }
        };
    }

    descriptionTable() {
        return {
            layout: 'order',
            table: {
                widths: ['*', '*'],
                body: [
                    [
                        {
                            stack: [
                                { text: 'Description', bold: true }
                            ],
                            rowSpan: 2
                        },
                        {
                            stack: [
                                { text: 'STITCH COUNT', margin: [2, 0] },
                                { text: '# OF SCREENS', margin: [2, 0] },
                                { text: '# OF RE-SET CHARGES', margin: [2, 0] },
                                { text: '# OF COLOR CHANGES', margin: [2, 0] },
                            ]
                        }
                    ],
                    [
                        '',
                        {
                            stack: [
                                {
                                    columns: [
                                        this.checkbox(),
                                        { text: 'LOGGED ON SCHEDULE', margin: [0, 2] }
                                    ]
                                },
                                {
                                    columns: [
                                        this.checkbox(),
                                        { text: 'PROOF READ', margin: [0, 2] }
                                    ]
                                },
                            ]
                        }
                    ],
                ]
            }
        };
    }

    getApplicableItems(currentDecoType = 'temp') {
        const { order, selectedDecoVendor, selectedDecoDesigns, selectedWorkDataMatrixIds  } = this.config;
        console.log('selectedDecoDesigns');
        console.log(selectedDecoDesigns);
        let selectedDecoDesignsVariations = [];
        selectedDecoDesignsVariations = selectedDecoDesigns ? selectedDecoDesigns.split('-'): '';
        return order.lineItems.reduce((collection, item, index) => {
            const hasRelatedDecoration = item.decoVendors.some((deco) => (deco.vendorName === selectedDecoVendor && selectedDecoDesignsVariations.indexOf(deco.decorationDetails[0].variationUniqueId) > -1 ));


            const matrixRows = item.matrixRows
                .filter((row) => {
                    return row.decoDesigns.some((design) => (design.vendor === selectedDecoVendor && selectedWorkDataMatrixIds.indexOf(row.matrixUpdateId) > -1));
                });
            if(matrixRows.length > 0){
                    matrixRows.forEach((row) => {
                        this.allMatrixRows.push(row.matrixUpdateId);
                    });            
            }
            if (hasRelatedDecoration) {
                collection.push({
                    ...item,
                    matrixRows: matrixRows,
                    decoVendors: item.decoVendors.filter((deco) => (deco.vendorName === selectedDecoVendor && selectedDecoDesignsVariations.indexOf(deco.decorationDetails[0].variationUniqueId) > -1)) // Only pass applicable decoVendors
                });
            }
            return collection;
        }, []);
    }
    
    getApplicableItemsOld(currentDecoType = 'temp') {
        const { order } = this.config;
        return order.lineItems.reduce((collection, item, index) => {
            const hasRelatedDecoration = item.decoVendors.some((deco) => deco.decoType === currentDecoType);

            const matrixRows = item.matrixRows
                .filter((row) => {
                    return item.decoVendors.some((deco) => {
                        return deco.decoType === currentDecoType
                            && deco.decorationDetails.some((detail) => detail.matrixId === row.matrixUpdateId);
                    });
                });

            if (hasRelatedDecoration) {
                collection.push({
                    ...item,
                    matrixRows: matrixRows,
                    decoVendors: item.decoVendors.filter((deco) => deco.decoType === currentDecoType) // Only pass applicable decoVendors
                });
            }
            return collection;
        }, []);
    }
    itemTable(item) {
        const { docOptions, order } = this.config;
        const node: any = {
            style: 'tableExample',
            table: {
                widths: ['*',25,35,40,40,40,40,40,40,40],
                body: [
                ],
                dontBreakRows: true,
            }        
        };
        const colcnt = 7;
        const colSize = 40;
        const colorMatches = [];
        var stagesHeader = ['Received', 'Staged', 'Printed', 'Damaged', 'Misprint', 'Replaced', 'Shipped'];
        //console.log('item.matrixRows');
        //console.log(item.matrixRows);
        if (item.matrixRows && item.matrixRows.length) {
                var sizeNode: any = [{ text: 'Size', alignment: 'center' }];
                
                var blankNode: any = [];

                item.productSizes.forEach(size => {
                    sizeNode.push({ text: (typeof order.productSizesSorting[size] !=='undefined' && order.productSizesSorting[size] !=='' && order.productSizesSorting[size] !== null) ? order.productSizesSorting[size] : size , alignment: 'center' });
                    blankNode.push({ text: '_____', alignment: 'center' });
                });
                sizeNode.push({ text: 'Total', alignment: 'center' });
                blankNode.push({ text: '_____', alignment: 'center' });
                var itemCount = 0;
                item.matrixRows.forEach(row => {
                    if(colorMatches.indexOf(row.color) < 0){
                        colorMatches.push(row.color);
                        var qtyNode: any = [{ text: 'Ordered', alignment: 'center' }];
                        var total = 0;
                        item.productSizes.forEach(size => {
                                var qtyForsize = '_____'
                                item.matrixRows.forEach((innerRow, index) => {
                                        if(innerRow.color === row.color && innerRow.size === size){
                                                total += (innerRow.quantity * 1);                                        
                                                qtyForsize = innerRow.quantity;
                                        }
                                });                 
                                qtyNode.push({ text: qtyForsize, alignment: 'center' });
                        });                        
                        qtyNode.push({ text: total, alignment: 'center' });
                        node.table.body.push([
                            {
                                stack: [
                                    { image: this.lookupImage(row.imageUrl), fit: [50, 50], alignment: 'left' },
                                    { text: (docOptions && docOptions[14] && docOptions[14].value) ? item.itemNo : '', alignment: 'left' },
                                    { text: (docOptions && docOptions[30] && docOptions[30].value) ? item.inhouseId : '', alignment: 'left' },
                                    { text: (docOptions && docOptions[33] && docOptions[33].value) ? item.itemCode : '', alignment: 'left' },
                                    { text: item.productName + ' - ' + row.color, alignment: 'left' },
                                ]
                            },
                            {
                              stack: [sizeNode]
                            },
                            {
                              stack: [qtyNode]
                            },
                            {
                              stack: [{ text: 'Received', alignment: 'center' }]
                            },
                            {
                              stack: [{ text: 'Staged', alignment: 'center' }]
                            },
                            {
                              stack: [{ text: 'Printed', alignment: 'center' }]
                            },
                            {
                              stack: [{ text: 'Damaged', alignment: 'center' }]
                            },
                            {
                              stack: [{ text: 'Misprint', alignment: 'center' }]
                            },
                            {
                              stack: [{ text: 'Replaced', alignment: 'center' }]
                            },
                            {
                              stack: [{ text: 'Shipped', alignment: 'center' }]
                            }
                        ]);
                        stagesHeader.forEach((stages, index) => {
                            node.table.body[itemCount][3+index].stack.push(blankNode);
                        });                        
                        itemCount++;
                    }
                });


        }
        console.log('node');
        console.log(node);
        return node;
    }/*
    itemTableOld2(item) {
        const node: any = {
            layout: 'order',
            table: {
                //headerRows: 1,
                widths: [40,80,'*'],
                body: [
                ],
                dontBreakRows: true,
            }
        };
        const colcnt = 7;
        const colSize = 40;
        const colorMatches = [];
        if (item.matrixRows && item.matrixRows.length) {
            var i = 0;
            
            item.matrixRows.forEach(row => {
                        if(colorMatches.indexOf(row.color) > -1){
                        
                        }else{
                            colorMatches.push(row.color);
                                var total = 0;
                                var         Node: any = {
                                    layout: 'noBorders',
                                    table: {
                                        headerRows: 1,
                                        widths: [],
                                        body: [
                                        ]
                                    }
                                };
                                var n = 0;
                                var j = 0;
                                item.productSizes.forEach(size => {
                                        if(Math.abs(n % colcnt) == 0){

                                                if(n > 0 && sizeNode.table.body[j]){

                                                sizeNode.table.body[j].push(
                                                        {
                                                                stack: [
                                                                    { text: 'Total', alignment: 'center' },
                                                                    { text: total, alignment: 'center' },
                                                                    { text: ' ', alignment: 'center' },
                                                                    { text: ' ', alignment: 'center' },
                                                                    { text: ' ', alignment: 'center' },
                                                                    { text: ' ', alignment: 'center' },
                                                                    { text: ' ', alignment: 'center' },
                                                                    { text: ' ', alignment: 'center' },                            
                                                                ]                
                                                        }
                                                );
                                                if(j == 0){
                                                     sizeNode.table.widths.push(25);
                                                }
                                                j++;
                                                }
                                                sizeNode.table.body.push([
                                                {
                                                        stack: [
                                                            { text: ' ', alignment: 'center' },
                                                            { text: 'Ordered', alignment: 'left' },
                                                            { text: 'Received', alignment: 'left' },
                                                            { text: 'Staged', alignment: 'left' },
                                                            { text: 'Printed', alignment: 'left' },
                                                            { text: 'Damaged', alignment: 'left' },
                                                            { text: 'Misprint', alignment: 'left' },
                                                            { text: 'Shipped', alignment: 'left' },                            
                                                        ]                
                                                }
                                                ]);
                                                if(j == 0){
                                                     sizeNode.table.widths.push(colSize);
                                                }

                                        }
                                        if(sizeNode.table.body[j]){

                                        sizeNode.table.body[j].push(
                                                {
                                                        stack: [
                                                            { text: (typeof order.productSizesSorting[size] !=='undefined' && order.productSizesSorting[size] !=='' && order.productSizesSorting[size] !== null) ? order.productSizesSorting[size] : size, alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                        ]                
                                                }
                                        );                                        
                                        item.matrixRows.forEach(innerRow => {
                                                if(innerRow.color == row.color && innerRow.size == size){
                                                        total += (innerRow.quantity * 1);                                        
                                                }
                                        });

                                                if(j == 0){
                                                     sizeNode.table.widths.push('*');
                                                }
                                        }

                                        if(Math.abs(n % colcnt) == 0){


                                        }
                                n++;
                                });
                                var sizeCnt = 1;
                                var sizeRows = -1;
                                item.productSizes.forEach(size => {
                                if(sizeCnt == 1 || Math.abs((sizeCnt-1) % colcnt) == 0){
                                    sizeCnt = 1;
                                    sizeRows++;
                                }

                                        item.matrixRows.forEach(innerRow => {
                                                if(innerRow.color == row.color && innerRow.size == size){

                                                        if(sizeNode.table.body[sizeRows][sizeCnt] && sizeNode.table.body[sizeRows][sizeCnt].stack[1] && sizeNode.table.body[sizeRows][sizeCnt].stack[1].text){
                                                            sizeNode.table.body[sizeRows][sizeCnt].stack[1].text = innerRow.quantity;
                                                        }
                                                }
                                        });                        
                                sizeCnt++;
                                
                                });

                                if(Math.abs((n) % colcnt) != 0){
                                
                                        do {


                                               if(sizeNode.table.body[j]){

                                                        sizeNode.table.body[j].push(
                                                                {
                                                                        stack: [
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ((item.productSizes.length < colcnt) ? 'Total' : '') : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ((item.productSizes.length < colcnt) ? total : '') : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ' ' : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ' ' : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ' ' : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ' ' : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ' ' : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ' ' : '.....', alignment: 'center' },                            
                                                                        ]                
                                                                }
                                                        );
                                                        if(j == 0){
                                                                if((Math.abs((n) % colcnt) == 0)){
                                                                     sizeNode.table.widths.push(25);
                                                                }else{
                                                                     sizeNode.table.widths.push('*');        
                                                                }                                                
                                                        }
                                                        //sizeNode.table.widths.push('auto');        

                                               } 
                                        n++;
                                        }
                                        while(Math.abs((n-1) % colcnt) != 0);                         
                                }



                        node.table.body.push([
                            {
                                stack: [
                                    { image: this.lookupImage(row.imageUrl), fit: [50, 50], alignment: 'center' },
                                    { text: row.itemSku, alignment: 'center' },
                                ]
                            },
                            { text: item.productName + ' - ' + row.color, alignment: 'left' },
                            [sizeNode],
                            //{ text: row.color, alignment: 'center' },
                            //{ text: row.quantity, alignment: 'center' }
                        ]);
             i++;
                        }
            });

        }
        //console.log(node);
        return node;
    }
    itemTableOld(item) {
        const node: any = {
            layout: 'order',
            table: {
                headerRows: 1,
                widths: [40,80,'*'],
                body: [
                ],
                dontBreakRows: true,
            }
        };
        const colcnt = 7;
        const colSize = 40;
        const colorMatches = [];
        if (item.matrixRows && item.matrixRows.length) {
            var i = 0;
            
            item.matrixRows.forEach(row => {
                        if(colorMatches.indexOf(row.color) > -1){
                        
                        }else{
                            colorMatches.push(row.color);
                                var total = 0;
                                var sizeNode: any = {
                                    layout: 'noBorders',
                                    table: {
                                        headerRows: 1,
                                        widths: [],
                                        body: [
                                        ]
                                    }
                                };
                                var n = 0;
                                var j = 0;
                                item.productSizes.forEach(size => {
                                        if(Math.abs(n % colcnt) == 0){

                                                if(n > 0 && sizeNode.table.body[j]){

                                                sizeNode.table.body[j].push(
                                                        {
                                                                stack: [
                                                                    { text: 'Total', alignment: 'center' },
                                                                    { text: total, alignment: 'center' },
                                                                    { text: ' ', alignment: 'center' },
                                                                    { text: ' ', alignment: 'center' },
                                                                    { text: ' ', alignment: 'center' },
                                                                    { text: ' ', alignment: 'center' },
                                                                    { text: ' ', alignment: 'center' },
                                                                    { text: ' ', alignment: 'center' },                            
                                                                ]                
                                                        }
                                                );
                                                if(j == 0){
                                                     sizeNode.table.widths.push(25);
                                                }
                                                j++;
                                                }
                                                sizeNode.table.body.push([
                                                {
                                                        stack: [
                                                            { text: ' ', alignment: 'center' },
                                                            { text: 'Ordered', alignment: 'left' },
                                                            { text: 'Received', alignment: 'left' },
                                                            { text: 'Staged', alignment: 'left' },
                                                            { text: 'Printed', alignment: 'left' },
                                                            { text: 'Damaged', alignment: 'left' },
                                                            { text: 'Misprint', alignment: 'left' },
                                                            { text: 'Shipped', alignment: 'left' },                            
                                                        ]                
                                                }
                                                ]);
                                                if(j == 0){
                                                     sizeNode.table.widths.push(colSize);
                                                }

                                        }
                                        if(sizeNode.table.body[j]){

                                        sizeNode.table.body[j].push(
                                                {
                                                        stack: [
                                                            { text: size, alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                            { text: '.....', alignment: 'center' },
                                                        ]                
                                                }
                                        );                                        
                                        item.matrixRows.forEach(innerRow => {
                                                if(innerRow.color == row.color && innerRow.size == size){
                                                        total += (innerRow.quantity * 1);                                        
                                                }
                                        });

                                                if(j == 0){
                                                     sizeNode.table.widths.push('*');
                                                }
                                        }

                                        if(Math.abs(n % colcnt) == 0){


                                        }
                                n++;
                                });
                                var sizeCnt = 1;
                                var sizeRows = -1;
                                item.productSizes.forEach(size => {
                                if(sizeCnt == 1 || Math.abs((sizeCnt-1) % colcnt) == 0){
                                    sizeCnt = 1;
                                    sizeRows++;
                                }

                                        item.matrixRows.forEach(innerRow => {
                                                if(innerRow.color == row.color && innerRow.size == size){

                                                        if(sizeNode.table.body[sizeRows][sizeCnt] && sizeNode.table.body[sizeRows][sizeCnt].stack[1] && sizeNode.table.body[sizeRows][sizeCnt].stack[1].text){
                                                            sizeNode.table.body[sizeRows][sizeCnt].stack[1].text = innerRow.quantity;
                                                        }
                                                }
                                        });                        
                                sizeCnt++;
                                
                                });

                                if(Math.abs((n) % colcnt) != 0){
                                
                                        do {


                                               if(sizeNode.table.body[j]){

                                                        sizeNode.table.body[j].push(
                                                                {
                                                                        stack: [
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ((item.productSizes.length < colcnt) ? 'Total' : '') : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ((item.productSizes.length < colcnt) ? total : '') : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ' ' : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ' ' : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ' ' : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ' ' : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ' ' : '.....', alignment: 'center' },
                                                                            { text: (Math.abs((n) % colcnt) == 0) ? ' ' : '.....', alignment: 'center' },                            
                                                                        ]                
                                                                }
                                                        );
                                                        if(j == 0){
                                                                if((Math.abs((n) % colcnt) == 0)){
                                                                     sizeNode.table.widths.push(25);
                                                                }else{
                                                                     sizeNode.table.widths.push('*');        
                                                                }                                                
                                                        }
                                                        //sizeNode.table.widths.push('auto');        

                                               } 
                                        n++;
                                        }
                                        while(Math.abs((n-1) % colcnt) != 0);                         
                                }



                        node.table.body.push([
                            {
                                stack: [
                                    { image: this.lookupImage(row.imageUrl), fit: [50, 50], alignment: 'center' },
                                    { text: row.itemSku, alignment: 'center' },
                                ]
                            },
                            { text: item.productName + ' - ' + row.color, alignment: 'left' },
                            [sizeNode],
                            //{ text: row.color, alignment: 'center' },
                            //{ text: row.quantity, alignment: 'center' }
                        ]);
             i++;
                        }
            });

        }

        return node;
    }
    */
    topInfo() {
        const { order } = this.config;
        const node: any = {
            style: 'tableExample',
            table: {
                widths: [50, '*', '*', 70, 80],
                body: [
                    [
                        { text: 'Ship By', style: 'tableHeaderWO', alignment: 'center' },
                        { text: 'Terms', style: 'tableHeaderWO', alignment: 'center' },
                        { text: 'Ship Via', style: 'tableHeaderWO', alignment: 'center' },
                        { text: 'Phone', style: 'tableHeaderWO', alignment: 'center' },
                        { text: 'Sales Rep', style: 'tableHeaderWO', alignment: 'center' }
                        
                    ],
                    [
                        { text: order.shipDate , alignment: 'center' },
                        { text: ' ' , alignment: 'center' },
                        { text: order.shipVia , alignment: 'center' },
                        { text: order.shippingPhone, alignment: 'center' },
                        { text: order.salesPerson, alignment: 'center' }

                    ]

                ]
            }
        };

        return node;

    }
    designInstructionTable(filteredItems) {
        const { order, selectedDecoDesigns, docOptions } = this.config;
        let selectedDecoDesignsVariations = [];
        selectedDecoDesignsVariations = selectedDecoDesigns ? selectedDecoDesigns.split('-') : '';

        const node: any = {
            style: 'tableExample',
            table: {
                widths: ['*', '*'],
                heights: [15,100],
                body: [
                    [
                        { text: 'Art/Decoration Instructions', style: 'tableHeaderWO', alignment: 'center' },
                        { text: 'Work Order Notes', style: 'tableHeaderWO', alignment: 'center' },
                    ],
                    [
                        {stack: []},
                        {stack: []}
                    ]
                ]
            }
        };

        var decoTitle = '';
        const decoModelsUniqKeys = [];
        const decoModelsUniqKeysWithLocation = [];
        var n = 1;
        filteredItems.forEach((item) =>  {
        item.decoVendors.forEach((deco) => {

            if(this.allMatrixRows.indexOf(deco.decorationDetails[0].matrixId) < 0){
                return;
            }
            /*
            if(decoModelsUniqKeys.indexOf(deco.designModal+'-'+deco.decorationDetails[0].decoProductColor) > -1){
                if(selectedDecoDesignsVariations.indexOf(deco.decorationDetails[0].variationUniqueId) > -1 && decoModelsUniqKeysWithLocation.indexOf(deco.designModal+'-'+deco.decoLocation) < 0 ){
                    //found one more decoration
                    //decoModelsUniqKeysWithLocation.push(deco.designModal+'-'+deco.decoLocation);                                    
                }else{
                    return;  
                }
            }else{
                decoModelsUniqKeys.push(deco.designModal+'-'+deco.decorationDetails[0].decoProductColor);
                decoModelsUniqKeysWithLocation.push(deco.designModal+'-'+deco.decoLocation);                                    
            }  
            */
            if(decoModelsUniqKeysWithLocation.indexOf(deco.designModal+'-'+deco.decorationDetails[0].decoProductColor) > -1){
                return;  
            }else{
                decoModelsUniqKeysWithLocation.push(deco.designModal+'-'+deco.decorationDetails[0].decoProductColor);
            }
                        
            node.table.body[1][0].stack.push({ text: 'Design: '+deco.designModal+', Color: '+deco.decorationDetails[0].decoProductColor+', Desc:'+deco.decorationDetails[0].decoDescription, alignment: 'left' })
            node.table.body[1][0].stack.push({ text: 'Notes: \n'+deco.decorationNotes, alignment: 'left' });
            if(docOptions && docOptions[46] && docOptions[46].value){
                node.table.body[1][0].stack.push({ text: 'Artwork Notes: \n'+deco.designDynamicNotes, alignment: 'left' });
            }

        });
           
        });
        node.table.body[1][1].stack.push({ text: order.workOrderNote, alignment: 'left' })
        return node;
    
    }
    topInfoSizeQty(item) {
        const { order } = this.config;
        const node: any = {
            layout: 'order',
            table: {
                headerRows: 1,
                widths: [40, 110, 340],
                body:[ 
                    [
                        { text: 'Design/Sku', style: 'tableHeader', alignment: 'left' },
                        { text: 'SS Description', style: 'tableHeader', alignment: 'left' },
                        { text: ' - - - - - - Size & Quantity - - - - - - ', style: 'tableHeader', alignment: 'center' },                        
                    ]
                    ]
            }
        };

        return node;

    }


    designTable(filteredItems) {
        const { decoLocationsList, selectedDecoDesigns, docOptions } = this.config;
        let selectedDecoDesignsVariations = [];
        selectedDecoDesignsVariations = selectedDecoDesigns ? selectedDecoDesigns.split('-') : '';

        const node: any = {
            layout: 'noBorders',
            table: {
                widths: ['*','*','*','*'],
                body: [ []
                ]
            }
        };
        var decoTitle = '';
        var n = 1;
        var j = 0;
        var colcnt = 4;
        var stylesHeader = ['tableHeaderWOYellow', 'tableHeaderWORed', 'tableHeaderWOBlue', 'tableHeaderWOPurple'];
        var need2nd = false;
        const decoTypes = [];
        //console.log(item.decoVendors);
        const decoModelsUniqKeys = [];
        filteredItems.forEach((item) =>  {
                if (item.matrixRows && item.matrixRows.length > 0) 
                {
                        item.decoVendors.forEach((deco) => {
                            if(this.allMatrixRows.indexOf(deco.decorationDetails[0].matrixId) < 0){
                                return;
                            }
                            if(decoTypes.indexOf(deco.decorationDetails[0].variationUniqueId) > -1){
                                if(selectedDecoDesignsVariations.indexOf(deco.decorationDetails[0].variationUniqueId) > -1 && decoModelsUniqKeys.indexOf(deco.designModal+'-'+deco.decoLocation) < 0 ){
                                    //found one more decoration
                                      decoModelsUniqKeys.push(deco.designModal+'-'+deco.decoLocation);                                    
                                }else{
                                    return;  
                                }
                                
                            }else{
                                need2nd = false;
                                decoTypes.push(deco.decorationDetails[0].variationUniqueId);
                                decoModelsUniqKeys.push(deco.designModal+'-'+deco.decoLocation);
                            }
                            const threadPms = deco.decorationDetails[0].decoDesignVariation.design_color_thread_pms;
                            //decoTitle += deco.designModal + '\n' + deco.designName + '\n';
                            decoTitle += deco.designModal + '\n' ;
                            const colors = threadPms.map(pms => {
                                return `${pms.No} ${pms.Color} ${pms.ThreadPMS} ${pms.Description}`;
                            });

                            let decoImageUrl = this.getDecoImageUrl(deco);
                            if (!decoImageUrl) {
                                decoImageUrl = 'placeholder';
                            }
                            const decoLocationsDetails = find(decoLocationsList, { locationName: deco.decoLocation });
                            var locationHexColor = '#CCCCCC';
                            if(decoLocationsDetails && decoLocationsDetails.locationHexColor){
                                locationHexColor = decoLocationsDetails.locationHexColor;
                            }

                                if(n > 1 && Math.abs(n % colcnt) == 1){
                                    node.table.body.push([]);
                                    j++;
                                }
                                let designName = '';
                                if (docOptions[38] && docOptions[38].value && deco.designName) {
                                    designName = `Design : ${deco.designName} \n`;
                                }   
                                if(typeof this.designDynamicNotesList[deco.designModal] === 'undefined' && deco.designDynamicNotes){
                                    this.designDynamicNotesList[deco.designModal] = deco.designDynamicNotes;
                                }
                                let designVariationTitle = '';
                                if (docOptions[39] && docOptions[39].value && deco.decorationDetails[0].decoDesignVariation.design_variation_title) {
                                    designVariationTitle = `Variation : ${deco.decorationDetails[0].decoDesignVariation.design_variation_title} \n`;
                                }
                                            node.table.body[j].push([
                                                {       style: 'tableExample',
                                                        table: {
                                                                widths: ['*'],
                                                                heights: [15,15,100,60],
                                                                body: [
                                                                        [{ text: deco.decoLocation, alignment: 'center', style: stylesHeader[Math.abs((n -1) % 4)], fillColor: locationHexColor }],
                                                                        [{ text: deco.decoTypeName, alignment: 'center', style: 'tableHeaderWOBlack' }],
                                                                        [{ image: this.lookupImage(decoImageUrl), fit: [100, 100], height: 100, alignment: 'center', style: 'tableHeaderWOGrey' }],
                                                                        [{stack: [
                                                                          { text: `${deco.designModal} \n ${designName} ${designVariationTitle}`, alignment: 'center' },
                                                                          //{ text: deco.designName, alignment: 'center' },
                                                                          //{ text: deco.decorationDetails[0].decoDesignVariation.design_variation_title, alignment: 'center' },
                                                                          //{ text: deco.decorationNotes, alignment: 'center' },
                                                                          { text: 'Detail Count : '+deco.designDetailCount, alignment: 'center' } ,
                                                                          { text: 'Size : '+deco.decorationDetails[0].decoLogoSize, alignment: 'center' }
                                                                        ]},]
                                                                ]
                                                        },
                                                }
                                            ]);
                                            if(n < 4){
                                                //node.table.widths.push(100);
                                            }                            

                          n++;
                        });
                }
        });
//console.log(n);
//console.log(Math.abs((n) % colcnt));
                                if(Math.abs((n-1) % colcnt) != 0){
                                
                                        do {


                                               if(node.table.body[j]){

                                                        node.table.body[j].push([
                                                                {       
                                                                        table: {
                                                                                widths: ['*'],
                                                                                heights: [15,15,100,60],
                                                                                body: [
                                                                                        [{ text: '', alignment: 'center', style: stylesHeader[Math.abs((n -1) % 4)], fillColor: '#CCCCCC' }],
                                                                                        [{ text: '', alignment: 'center', style: 'tableHeaderWOBlack' }],
                                                                                        [{ text: '', alignment: 'center', style: 'tableHeaderWOGrey' }],
                                                                                        [{stack: [
                                                                                          { text: ' ', alignment: 'center' },
                                                                                          { text: ' ', alignment: 'center' },
                                                                                          { text: ' ', alignment: 'center' },
                                                                                          { text: ' ', alignment: 'center' } ,
                                                                                          { text: ' ', alignment: 'center' }
                                                                                        ]},]                                                                                ]
                                                                        },
                                                                }
                                                            ]);
                                               } 
                                        n++;
                                        }
                                        while(Math.abs((n-1) % colcnt) != 0);                         
                                }        
        //console.log(node);
        return node;

    }

    designIndividualTable(item) {
        const { order, decoLocationsList, selectedDecoDesigns, docOptions } = this.config;
        let selectedDecoDesignsVariations = [];
        selectedDecoDesignsVariations = selectedDecoDesigns ? selectedDecoDesigns.split('-') : '';

        const node: any = {
            layout: 'noBorders',
            table: {
                widths: ['*'],
                body: [
                ]
            }
        };
        var decoTitle = '';
        const decoModelsUniqKeys = [];
        const decoModelsUniqKeysWithLocation = [];
        var n = 1;
        var stylesHeader = ['tableHeaderWOYellow', 'tableHeaderWORed', 'tableHeaderWOBlue', 'tableHeaderWOPurple'];
        const decoTypesWithLocation = [];
        item.decoVendors.forEach((deco) => {

            if(this.allMatrixRows.indexOf(deco.decorationDetails[0].matrixId) < 0){
                return;
            }
            /*
            if(decoTypesWithLocation.indexOf(deco.designModal+'-'+deco.decorationDetails[0].decoProductColor+'-'+deco.decoLocation) > -1){
                if(selectedDecoDesignsVariations.indexOf(deco.decorationDetails[0].variationUniqueId) > -1){
                    //found one more decoration
                }else{
                    return;  
                }
            }else{
                decoModelsUniqKeys.push(deco.designModal+'-'+deco.decorationDetails[0].decoProductColor);
                decoTypesWithLocation.push(deco.designModal+'-'+deco.decorationDetails[0].decoProductColor+'-'+deco.decoLocation);
            }*/

            if(selectedDecoDesignsVariations.indexOf(deco.decorationDetails[0].variationUniqueId) > -1 && decoModelsUniqKeysWithLocation.indexOf(deco.designModal+'-'+deco.decoLocation) > -1){
                 return;            
            }else{
                decoModelsUniqKeysWithLocation.push(deco.designModal+'-'+deco.decoLocation);
            }
            
            const threadPms = deco.decorationDetails[0].decoDesignVariation.design_color_thread_pms;
            decoTitle += deco.designModal + '\n' + deco.designName + '\n';
            const colors = threadPms.map(pms => {
                return `${pms.No} ${pms.Color} ${pms.ThreadPMS} ${pms.Description}`;
            });

            let decoImageUrl = this.getDecoImageUrl(deco);

            if (!decoImageUrl) {
                decoImageUrl = 'placeholder';
            }

            const decoLocationsDetails = find(decoLocationsList, { locationName: deco.decoLocation });
            var locationHexColor = '#CCCCCC';
            if(decoLocationsDetails && decoLocationsDetails.locationHexColor){
                locationHexColor = decoLocationsDetails.locationHexColor;
            }            
            //node.table.body.push({ text: '', pageBreak: 'after' });
            node.table.body.push([
                    {
                                layout: 'noBorders',
                                table: {
                                    widths: ['*'],
                                    body: [
                                        [
                                            { text: deco.designModal, style: 'big', alignment: 'center' },
                                        ],
                                        [
                                            { text: deco.designName, style: 'big', alignment: 'center' },                                        
                                        ]
                                    ]
                                }
                }
            ]);
            
            node.table.body.push([
                    {
                            style: 'tableExample',
                                table: {
                                    widths: ['*', '*', '*', '*', '*'],
                                    body: [
                                        [
                                            { text: 'Imprint Type', style: 'tableHeaderWO', alignment: 'center' },
                                            { text: 'Imprint Location', style: 'tableHeaderWO', alignment: 'center' },
                                            { text: 'Color Count', style: 'tableHeaderWO', alignment: 'center' },
                                            { text: 'Imprint Size', style: 'tableHeaderWO', alignment: 'center' },
                                            { text: 'Designer', style: 'tableHeaderWO', alignment: 'center' }

                                        ],
                                        [
                                            { text: deco.decoTypeName , alignment: 'center' },
                                            { text: deco.decoLocation , alignment: 'center' },
                                            { text: deco.designDetailCount , alignment: 'center' },
                                            { text: (deco.decorationDetails[0].decoLogoSize) ? deco.decorationDetails[0].decoLogoSize : ' ', alignment: 'center' },
                                            { text: ((deco.artistName) ? deco.artistName : ''), alignment: 'center' }

                                        ]

                                    ]
                                }
                }
            ]);

            node.table.body.push([
                    {
                                layout: 'order',
                                table: {
                                    widths: ['*'],
                                    body: [
                                        [
                                            //{ text: 'For '+((deco.decorationDetails[0].decoProductName && deco.decorationDetails[0].decoProductColor) ? deco.decorationDetails[0].decoProductName + ' ' + deco.decorationDetails[0].decoProductColor : '') , style: 'big', alignment: 'center' },
                                            //{ text: 'For '+((deco.decorationDetails[0].decoProductColor) ? deco.decorationDetails[0].decoProductColor : '') , style: 'big', alignment: 'center' },
                                            { text: 'For '+((deco.decoLocation) ? deco.decoLocation : '') , style: 'big', alignment: 'center' },
                                        ]
                                    ]
                                }
                }
            ]);
                        
/*
                    node.table.body.push([
                        {       layout: 'noBorders',
                                table: {
                                        widths: ['*',20],
                                        body: [
                                                    [
                                                        { text: deco.decoTypeName+' WorkSheet', alignment: 'left', fontSize: 24, bold: true },
                                                        { image: order.barCodeURL ? (order.barCodeURL) : 'placeholder', width: 120 , alignment: 'right'},

                                                    ],
                                                    [
                                                        { text: deco.designName , alignment: 'left', fontSize: 18, bold: true },
                                                        { text: ' ' , alignment: 'left' },
                                                    ]
                                        ]
                                },
                                
                        }
                        
                    ]
                    );

                    node.table.body.push([
                        {       layout: 'noBorders',
                                table: {
                                        widths: ['*','*','*'],
                                        body: [
                                                    [
                                                        { text: 'Design#: '+ deco.designModal, alignment: 'left' },
                                                        { text: ' ' , alignment: 'left' },
                                                        { text: ' ' , alignment: 'left' },

                                                    ],
                                                    [
                                                        { text: 'Artist: '+ ((deco.artistName) ? deco.artistName : ''), alignment: 'left' },
                                                        { text: 'Units: ' , alignment: 'left' },
                                                        { text: 'Date Needed: ' , alignment: 'left' },
                                                    ],
                                                    [
                                                        { text: 'Cust PO#:' , alignment: 'left' },
                                                        { text: ' ' , alignment: 'left' },
                                                        { text: 'Date: ' , alignment: 'left' },
                                                    ]
                                        ]
                                },
                                
                        }
                        
                    ]
                    );

                    node.table.body.push([
                        {       layout: 'noBorders',
                                table: {
                                        widths: ['*'],
                                        body: [
                                                [                                                
                                                    { text:  'Color/Thread : '+ colors, alignment: 'left', fontSize: 12, bold: true },
                                                ],
                                                [                                                
                                                    { text:  'Notes: '+ ((deco.decorationDetails[0].design_note) ? deco.decorationDetails[0].design_note : ''), alignment: 'left', fontSize: 12, bold: true },
                                                ],
                                        ]
                                },
                        }
                    ]);
*/
                    const decoTable = {       
                                style: 'tableExample',
                                table: {
                                        headerRows: 1,
                                        widths: ['*','*','*','*','*','*','*'],
                                        body: [
                                                    [
                                                        { text: 'Order', style: 'tableHeaderWO', alignment: 'center' },
                                                        { text: 'Color/Code' , style: 'tableHeaderWO', alignment: 'center' },
                                                        { text: 'ThreadPMS' , style: 'tableHeaderWO', alignment: 'center' },
                                                        { text: 'Description' , style: 'tableHeaderWO', alignment: 'center' },
                                                        { text: 'Mesh' , style: 'tableHeaderWO', alignment: 'center' },
                                                        { text: 'Squeege' , style: 'tableHeaderWO', alignment: 'center' },
                                                        { text: 'Pressure' , style: 'tableHeaderWO', alignment: 'center' },

                                                    ]
                                        ]
                                },
                                
                        };

                    const threadPmsTable = deco.decorationDetails[0].decoDesignVariation.design_color_thread_pms;
                    var tpCnt = 1;
                    threadPms.map(pms => {
                        decoTable.table.body.push(
                                                    [
                                                        { text: pms.No, style: '', alignment: 'center' },
                                                        { text: pms.Color, style: '', alignment: 'center' },
                                                        { text: pms.ThreadPMS, style: '', alignment: 'center' },
                                                        { text: pms.Description, style: '', alignment: 'center' },
                                                        { text: '', style: '', alignment: 'center' },
                                                        { text: '', style: '', alignment: 'center' },
                                                        { text: '', style: '', alignment: 'center' },
                                                    ]

                        );
                    });
                    var decoTableTotal = (decoTable.table.body.length - 1);
                    for(var i = decoTableTotal; i < (20);i++){
                        decoTable.table.body.push(
                                                    [
                                                        { text: ''+(i+1), style: '', alignment: 'center' },
                                                        { text: '', style: '', alignment: 'center' },
                                                        { text: '', style: '', alignment: 'center' },
                                                        { text: '', style: '', alignment: 'center' },
                                                        { text: '', style: '', alignment: 'center' },
                                                        { text: '', style: '', alignment: 'center' },
                                                        { text: '', style: '', alignment: 'center' },
                                                    ]

                        );                    
                    }
                    
                    node.table.body.push([decoTable]);
                    //const decoLocationsDetails = find(decoLocationsList, { locationName: deco.decoLocation });
                    let decoLocationsS3Image= deco.decoLocation;
                    decoLocationsS3Image = 'https://s3.amazonaws.com/images.anterasoftware.com/locations/'+decoLocationsS3Image+'.png';
                    if(decoLocationsDetails && decoLocationsDetails.locationImage){
                        decoLocationsS3Image = decoLocationsDetails.locationImage;
                    }
                    console.log(decoLocationsS3Image);
/*                    
                    if(decoLocationsDetails && decoLocationsDetails.locationImage){
                            node.table.body.push([
                                {       layout: 'noBorders',
                                        table: {
                                                widths: ['*','*'],
                                                body: [
                                                        [                                                
                                                        { image: (deco.decoLocation) ? ((decoLocationsDetails.locationImage) ? this.lookupImage(decoLocationsDetails.locationImage) : this.lookupImage(decoLocationsS3Image)) :  'locationPlaceholder', fit: [200, 200], height: 200, alignment: 'center' },
                                                        { text: 'Instruction' , alignment: 'left' }
                                                        ],
                                                ]
                                        },
                                }
                            ]);

                    }else{
                            node.table.body.push([
                                {       layout: 'noBorders',
                                        table: {
                                                widths: ['*','*'],
                                                body: [
                                                        [                                                
                                                        { image: (deco.decoLocation) ?  this.lookupImage(decoLocationsS3Image) :  'locationPlaceholder', fit: [200, 200], height: 200, alignment: 'center' },
                                                        { text: 'Instruction' , alignment: 'left' }
                                                        ],
                                                ]
                                        },
                                }
                            ]);

                    }
*/
                    if(docOptions && docOptions[37] && docOptions[37].value){
                            node.table.body.push([
                                {       
                                        style: 'tableExample',
                                        table: {
                                                dontBreakRows: true,
                                                widths: ['*'],
                                                heights: [40,250],
                                                body: [
                                                        [{ text: (deco.decoLocation) , style: stylesHeader[Math.abs((n - 1) % 4)], alignment: 'center', fontSize: 40, bold: true, fillColor: locationHexColor }],
                                                        [{columns: [{ image: this.lookupImage(decoImageUrl), fit: [250, 250], alignment: 'center' }, { image: (deco.decoLocation) ? (this.lookupImage(decoLocationsS3Image)) :  'locationPlaceholder', fit: [250, 250], alignment: 'center' }]}]
                                                ]
                                        },
                                }
                            ]);                    
                    }else{
                            node.table.body.push([
                                {       
                                        style: 'tableExample',
                                        table: {
                                                dontBreakRows: true,
                                                widths: ['*'],
                                                heights: [40,250],
                                                body: [
                                                        [{ text: (deco.decoLocation) , style: stylesHeader[Math.abs((n - 1) % 4)], alignment: 'center', fontSize: 40, bold: true, fillColor: locationHexColor }],
                                                        [{ image: this.lookupImage(decoImageUrl), fit: [250, 250], alignment: 'center' }]
                                                ]
                                        },
                                }
                            ]);                    
                    }

                    /*
                    node.table.body.push([
                        {       
                                style: 'tableExample',
                                table: {
                                        dontBreakRows: true,
                                        widths: ['*'],
                                        heights: [15,100],
                                        body: [
                                            [
                                                { text: 'Size Details' , style: stylesHeader[Math.abs((n - 1) % 4)], alignment: 'center', fontSize: 14, bold: true },
                                            ],
                                            [
                                                {stack: [
                                                                                                          { text: '', alignment: 'center' },
                                                                                                          { text: '', alignment: 'center' },
                                                                                                          { text: '', alignment: 'center' },
                                                                                                          { text: '', alignment: 'center' },
                                                                                ]}
                                            ]
                                        ]
                                },
                        }
                    ]);
                    */

        n++;
        });

        console.log('designIndividualTable');
        console.log(node);
        return node;

    }
    workOrder() {
        const { order, decoTypes } = this.config;
      
        const content = [];
        content.push('\n');
        content.push('\n');
        content.push(this.topInfo());
        //content.push({ text: '', pageBreak: 'after' });
 
        const filteredItems = this.getApplicableItems();
        var forPageBreackCnt = 0;
        let designIndividualTableNode = [];
                    content.push(this.designTable(filteredItems));
                    content.push('\n');
                    content.push(this.designInstructionTable(filteredItems));
                    //content.push('\n');            

        filteredItems.forEach((item, index) => {
        if(typeof this.productNamelist[item.lineItemUpdateId] === 'undefined'){
            this.productNamelist[item.lineItemUpdateId] = item.productName;
        }
        if (item.matrixRows && item.matrixRows.length > 0) {
            content.push('\n');
            if(forPageBreackCnt > 0){
                //content.push({ text: '', pageBreak: 'after' });
            }
            if(forPageBreackCnt < 1){
                    //content.push(this.designTable(filteredItems));
                    //content.push('\n');
                    //content.push({ text: '', pageBreak: 'after' });
                    //content.push(this.designInstructionTable(item));
                    content.push('\n');            
            }
            //content.push({ text: '', pageBreak: 'after' });
            content.push(this.itemTable(item));
            if(forPageBreackCnt < 1){  
              designIndividualTableNode = this.designIndividualTable(item);
            }
            forPageBreackCnt++;
        }

        });
        if(typeof designIndividualTableNode['layout'] !== 'undefined' ){
            content.push({ text: '', pageBreak: 'after' });
            content.push(designIndividualTableNode);        
        }
        //content.push(this.descriptionTable());
        //content.push('\n');
        //content.push(this.shipTable());        
        return content;

    }

    proofForm() {
        const form = [
            {
                columns: [
                    {
                        width: 24,
                        canvas: [
                            {
                                type: 'rect',
                                x: 0,
                                y: 3,
                                w: 12,
                                h: 12,
                                // lineWidth: 10,
                                lineColor: '#058ec0',
                            },
                        ]

                    },
                    'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines'
                ]
            },
            '\n\n',
            {
                columns: [
                    {
                        width: 24,
                        canvas: [
                            {
                                type: 'rect',
                                x: 0,
                                y: 3,
                                w: 12,
                                h: 12,
                                // lineWidth: 10,
                                lineColor: '#058ec0',
                            },
                        ]
                    },
                    'Proof is approved with the following changes. There is No need to send an additional proof.'
                ]
            },
            '_______________________________________________________________________________________________',
            '_______________________________________________________________________________________________',
            {
                columns: [
                    {
                        width: 24,
                        canvas: [
                            {
                                type: 'rect',
                                x: 0,
                                y: 3,
                                w: 12,
                                h: 12,
                                // lineWidth: 10,
                                lineColor: '#058ec0',
                            },
                        ]
                    },
                    'Proof is not approved. Please make the changes indicated here.',
                ]
            },
            '_______________________________________________________________________________________________',
            '_______________________________________________________________________________________________',
            {
                text: 'Please fax back to 214-555-2121, or scan and email to salesadvance@anterasoftware.com',
                alignment: 'center',
                margin: [0, 12, 0, 0]
            }
        ];
        return form;
    }

    content() {
        const { selectedWorkOrderCnt, totalWorkOrderCnt } = this.config;
        this.showBarCode = true;
        this.workOrderCount = selectedWorkOrderCnt;
        this.workOrderCountDetails = (selectedWorkOrderCnt*1) + ' of ' + totalWorkOrderCnt;
        return [
            this.subheader(),
            this.workOrder(),
            this.getWOPersonalizations(),
            '\n',
            //this.documentFooterDynamicDesignNote(),
            this.documentFooterNote(),
        ];
    }

    generateProductDataByColorsSizes(lineItems) {
        const productData = [];

        lineItems.forEach((_lineItem: any) => {

            const lineItem = { ..._lineItem };

            if (!lineItem.matrixRows || lineItem.matrixRows.length === 0) {
                lineItem.matrixRows = [new MatrixRow({})];
            }

            const totalCount = sum(
                lineItem.matrixRows.map(row => Number(row.quantity))
            );

            lineItem.matrixRows.forEach((row: any) => {
                if (!row) { return; }

                const defaultImage = (lineItem.quoteCustomImage && lineItem.quoteCustomImage[0]) || 'assets/images/ecommerce/product-image-placeholder.png';

                // TODO: Need to add unit cost / unit price based on conversion value


                const newRow = {
                    productName: lineItem.productName,
                    productId: lineItem.itemNo,
                    itemCode: lineItem.itemCode,
                    inhouseId: lineItem.inhouseId,
                    image: exportImageUrlForPDF(row.imageUrl || defaultImage),
                    quantity: +row.quantity,
                    unitQuantity: +row.unitQuantity,
                    price: row.price,
                    totalMatrixPrice: row.totalPrice,
                    cost: row.cost,
                    color: row.color,
                    size: row.size,
                    matrixRows: [row],
                    matrixUpdateId: row.matrixUpdateId,
                    lineItemUpdateId: lineItem.lineItemUpdateId,
                    customerDescription: lineItem.customerDescription,
                    vendorDescription: lineItem.vendorDescription,
                    sizeList: [{ size: row.size, quantity: row.quantity }],
                    addonCharges: (findIndex(productData, { lineItemUpdateId: lineItem.lineItemUpdateId }) < 0) ? lineItem.addonCharges : [],
                    lineItem: lineItem,
                    uomConversionRatio: row.uomConversionRatio,
                    uomAbbreviation: row.uomAbbreviation,
                    matchOrderQty: totalCount,
                    poShippingBillingDetails: !lineItem.poShippingBillingDetails ? {} : lineItem.poShippingBillingDetails,
                    calculatorData: row.calculatorData,
                };
                productData.push(newRow);
            });
        });

        productData.forEach(row => {
            let decoVendors = [];

            if (!row.lineItem.decoVendors) {
                return;
            }

            for (const v of row.lineItem.decoVendors) {
                // let q = 0;
                // v.decorationDetails.forEach(decoDetail => {
                //     const mrow = find(row.matrixRows, { matrixUpdateId: decoDetail.matrixId });
                //     if (mrow) {
                //         q += Number(mrow.quantity);
                //     }
                // });

                // if (q === 0) {
                //     break;
                // }

                if (!v.decorationDetails[0]) {
                    break;
                }
                if (row.matrixUpdateId == v.decorationDetails[0].matrixId) {

                    let decoColors = '';
                    if (v.decorationDetails[0].decoDesignVariation && v.decorationDetails[0].decoDesignVariation.design_color_thread_pms) {
                        const colors = v.decorationDetails[0].decoDesignVariation.design_color_thread_pms;
                        each(colors, color => {
                            decoColors += `Color ${color.No} ${color.Color} ${color.ThreadPMS} ${color.Description}`;
                            if (findIndex(colors, { No: color.No }) != (colors.length - 1)) { decoColors += ' , '; }
                        });
                    }

                    const vendor: any = {
                        id: v.decoVendorRecordId,
                        designId: v.designId,
                        designCustomerId: v.designCustomerId,
                        designNo: v.designModal,
                        name: v.designName,
                        decoLocation: v.decoLocation,
                        decoType: v.decoType,
                        decoTypeName: v.decoTypeName,
                        quantity: row.quantity,
                        price: fx2Str(v.customerPrice),
                        itemCost: fx2Str(v.itemCost),
                        decoVendorId: v.vendorId,
                        decoVendorName: v.vendorName,
                        decorationDetails: v.decorationDetails,
                        addonCharges: v.addonCharges,
                        poShippingBillingDetails: v.poShippingBillingDetails,
                        decorationNotes: v.decorationNotes,
                        decoColors: decoColors,
                        decoDescription: v.decorationDetails[0].decoDescription,
                        vendorSupplierDecorated: v.vendorSupplierDecorated,
                        designDynamicNotes: v.designDynamicNotes,
                    };

                    if (v.decorationDetails[0] && v.decorationDetails[0].decoDesignVariation && v.decorationDetails[0].decoDesignVariation.itemImageThumbnail && v.decorationDetails[0].decoDesignVariation.itemImageThumbnail[0]) {
                        vendor.image = v.decorationDetails[0].decoDesignVariation.itemImageThumbnail[0];
                    } else {
                        vendor.image = v.decorationDetails[0].decoDesignVariation.itemImage[0];
                    }
                    decoVendors.push(vendor);
                }

            }

            row.decoVendors = decoVendors;
        });
        return productData;
    }

    groupDataByDecoTypes(productData) {
        const totalDecoVendors = [];
        productData.forEach((product: any) => {
            if (product.decoVendors) {
                product.decoVendors.forEach((decoVendor: any) => {
                    if (decoVendor.decoType != 'Supplier_Decorated') {
                        totalDecoVendors.push(decoVendor);
                    }
                });
            }
        });
        return groupBy(totalDecoVendors, 'decoType');
    }
    /*
    header(): any {
        const { order } = this.config;
        const title = this.getTitle();    
        return (currentPage, pageCount) => [{
                        columns: [
                            { image: this.config.logoUrl ? this.config.logoUrl : 'placeholder', height: 100, fit: [100, 50] },                            
                            {
                                text: `${title}`, style: 'header', alignment: 'right'
                            },
                            { image: order.barCodeURL ? (order.barCodeURL) : 'placeholder', width: 120 , alignment: 'right'},
                            {
                                text: `${title}`, style: 'header', alignment: 'right'
                            }
                        ]
                    },
                    this.horizontalLine()];
    }

    subheader(): any {
        
        const { order } = this.config;
        const title = this.getTitle();
                return [
                    this.billingDetails()
                ];        

    }*/    


    documentFooterDynamicDesignNote(){
        const { docOptions } = this.config;            
        if(docOptions && docOptions[46] && docOptions[46].value && this.designDynamicNotesList.length > 0){
                const designDynamicNotesTable = [{ text: '', pageBreak: 'after' },{
                    layout: 'order',
                    table: {
                        headerRows: 1,
                        widths: [150, '*'],
                        body: [
                            // Table Header
                            [
                                { text: 'Design Notes', alignment: 'left', bold: true, style: 'tableHeader'  },
                                { text:'', style: 'tableHeader'  }
                            ],
                            [
                                { text:'', alignment: 'left', bold: true  },
                                { text:''  },
                            ],
                            ],
                        dontBreakRows: true,
                    }
                }];
                const lines = [];
                lines.push([
                { text: 'Design#', alignment: 'left', style: 'tableHeader' },
                { text: 'Note', alignment: 'left', style: 'tableHeader' },
                ]);
                each(keys(this.designDynamicNotesList), designModal => {
                               lines.push([
                                    { text: `${designModal}`, alignment: 'left' },
                                    { text: `${this.designDynamicNotesList[designModal]}`, alignment: 'left' }
                                ]);                       
                });
                designDynamicNotesTable[1].table.body = [
                ...designDynamicNotesTable[1].table.body,
                ...lines
                ];
                return designDynamicNotesTable;
        }else{
                return null;
        }
    }
    getWOPersonalizations() {

        const { personalizations, docOptions, selectedWorkDataMatrixIds } = this.config;
            let itemList = [];
            let matrixIdsFound = false;
            if(docOptions && docOptions[41] && docOptions[41].value && personalizations.length > 0){
                const personalizationsTable = [{ text: '', pageBreak: 'after' },{
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
                       if(row.displayText && row.color && row.location && selectedWorkDataMatrixIds.indexOf(row.matrixId) > -1){
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
                    personalizationsTable[1].table.body = [
                    ...personalizationsTable[1].table.body,
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