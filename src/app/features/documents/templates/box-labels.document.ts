import { OrderDetails, LineItem } from 'app/models';
import { Observable } from 'rxjs';
import { DocumentImageManager, DocumentImageThumbnail } from '../document-image-manager';
import { IDocument, AbstractOrderDocument } from '../document.interface';
import { InvoiceDocument } from './invoice.document';
import { MatrixRow, Account } from 'app/models';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';
import { fx2Str, exportImageUrlForPDF, b64toBlob, fx2N } from 'app/utils/utils';
import * as htmlToPdfmake from 'html-to-pdfmake';
// import { pdfMake } from 'pdfmake/build/pdfmake';
// import { pdfFonts } from 'pdfmake/build/vfs_fonts';

export class BoxLabelsDocument extends InvoiceDocument {
    name = 'box-labels';
    label = 'Box Labels';
    workDataGroupByDecoTypes = [];
    productData = [];
    allMatrixRows = [];
    designNameForheading = [];
    totalQty: any;
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
        this.totalQty = 0;
    }

    getTitle() {
        return this.getDynamicDocLabel('heading', this.label);
    }

    getImages(): DocumentImageThumbnail[] {
        const { order, decoLocationsList,selectedWorkOrderCnt, totalWorkOrderCnt } = this.config;
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
                    collection.push({ src: decoImageUrl });
                }

                const decoLocationImageUrl = this.getDecoLocationImageUrl(deco);
                if (decoLocationImageUrl && !collection.find(x => x.src === decoLocationImageUrl)) {
                    collection.push({ src: decoLocationImageUrl });
                }

                const decoLocationsDetails = find(decoLocationsList, { locationName: deco.decoLocation });
                if (decoLocationsDetails && decoLocationsDetails.locationImage && !collection.find(x => x.src === decoLocationsDetails.locationImage)) {
                    collection.push({ src: decoLocationsDetails.locationImage });
                }
                
                
            });
            return collection;
        }, []);

        if (this.config && this.config.logoUrl) {
            images.push({ src: this.config.logoUrl, width: 300 });
        }
        if (order.barCodeURL) {
                if (typeof order.workOrderBoxLabel[selectedWorkOrderCnt] !=='undefined') {
                    order.workOrderBoxLabel[selectedWorkOrderCnt].forEach((bl) => {
                      if(bl.boxNo && bl.totalBox)
                      images.push({ src: `${order.barCodeURL}&wo=${selectedWorkOrderCnt}&box=${bl.boxNo}&total=${bl.totalBox}`, width: 80});
                    });
                }else{
                    images.push({ src: `${order.barCodeURL}&wo=${selectedWorkOrderCnt}&box=1&total=1`, width: 80});
                }
        }
        return images;
    }


    getApplicableItems(currentDecoType = 'temp') {
        this.totalQty = 0;
        const { order, selectedDecoVendor, selectedDecoDesigns, selectedWorkDataMatrixIds  } = this.config;
        console.log('selectedDecoDesigns');
        console.log(selectedDecoDesigns);
        let selectedDecoDesignsVariations = [];
        selectedDecoDesignsVariations = selectedDecoDesigns ? selectedDecoDesigns.split('-') : '';
        return order.lineItems.reduce((collection, item, index) => {
            const hasRelatedDecoration = item.decoVendors.some((deco) => (deco.vendorName === selectedDecoVendor && selectedDecoDesignsVariations.indexOf(deco.decorationDetails[0].variationUniqueId) > -1 ));


            const matrixRows = item.matrixRows
                .filter((row) => {
                    return row.decoDesigns.some((design) => (design.vendor === selectedDecoVendor && selectedWorkDataMatrixIds.indexOf(row.matrixUpdateId) > -1));
                });
            if(matrixRows.length > 0){
                    matrixRows.forEach((row) => {
                        this.totalQty += (row.quantity*1);
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
    


    designTable(filteredItems) {
        const { decoLocationsList, selectedDecoDesigns } = this.config;
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
                                      if(this.designNameForheading.indexOf(deco.designName) < 0){
                                          this.designNameForheading.push(deco.designName);
                                      }
                                      
                                }else{
                                    return;  
                                }
                                
                            }else{
                                need2nd = false;
                                decoTypes.push(deco.decorationDetails[0].variationUniqueId);
                                decoModelsUniqKeys.push(deco.designModal+'-'+deco.decoLocation);
                                if(this.designNameForheading.indexOf(deco.designName) < 0){
                                    this.designNameForheading.push(deco.designName);
                                }
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
                                            node.table.body[j].push([
                                                {       style: 'tableExample',
                                                        margin : [0, 20, 0, 0],
                                                        table: {
                                                                widths: ['*'],
                                                                heights: [150,80],
                                                                body: [
                                                                        //[{ text: deco.decoLocation, alignment: 'center', style: stylesHeader[Math.abs((n -1) % 4)], fillColor: locationHexColor }],
                                                                        //[{ text: deco.decoTypeName, alignment: 'center', style: 'tableHeaderWOBlack' }],
                                                                        [{ image: this.lookupImage(decoImageUrl), fit: [100, 100], height: 100, alignment: 'center', margin : [0, 25, 0, 0] }],
                                                                        //[{ text: deco.decoLocation, alignment: 'center', fontSize: 20, bold: true  }],
                                                                        //[{ text: deco.decoTypeName, alignment: 'center', fontSize: 20, bold: true }],
                                                                        [{stack: [
                                                                            { text: deco.decoLocation, alignment: 'center', fontSize: 20, bold: true  },
                                                                            { text: deco.decoTypeName, alignment: 'center', fontSize: 20, bold: true },
                                                                          //{ text: deco.designModal, alignment: 'center' },
                                                                          //{ text: deco.designName, alignment: 'center' },
                                                                          //{ text: deco.decorationDetails[0].decoDesignVariation.design_variation_title, alignment: 'center' },
                                                                          //{ text: deco.decorationNotes, alignment: 'center' },
                                                                          //{ text: 'Detail Count : '+deco.designDetailCount, alignment: 'center' } ,
                                                                          //{ text: 'Size : '+deco.decorationDetails[0].decoLogoSize, alignment: 'center' }
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
                                                                        layout: 'noBorders',
                                                                        margin : [0, 20, 0, 0],
                                                                        table: {
                                                                                widths: ['*'],
                                                                                heights: [150,80],
                                                                                body: [
                                                                                        [{ text: '', alignment: 'center' }],
                                                                                        [{stack: [
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


    content() {
        const { selectedWorkOrderCnt, totalWorkOrderCnt } = this.config;
        this.showBarCode = true;
        this.workOrderCount = selectedWorkOrderCnt;
        this.workOrderCountDetails = (selectedWorkOrderCnt*1) + ' of ' + totalWorkOrderCnt;
        return [
            this.boxLabels(),
        ];
    }
    getboxLabel(boxNo, totalBox, qty, totalQty, shipDate, designDetails){
        const { order, selectedWorkOrderCnt, totalWorkOrderCnt } = this.config;
        let orderNo = order.orderNo+'-'+this.workOrderCount;
        const boxLabel: any = {
                        style: 'tableExample',
                        color: '#444',
                        table: {
                                widths: [100, 380, 100, 140],
                                heights: [50, 50, 280,30],
                                body: [
                                        [
                                                {rowSpan: 4, image: this.lookupImage(`${order.barCodeURL}&wo=${selectedWorkOrderCnt}&box=${boxNo}&total=${totalBox}`) , width:80, height:450, alignment: 'center'}, 
                                                {colSpan: 2, rowSpan: 2, stack:[
                                                        {text:`${orderNo}`, fontSize: 32, bold: true, alignment: 'left'},
                                                        {text: `${order.accountName.toUpperCase()}`, fontSize: 20, bold: true, alignment: 'left'},
                                                        {text: `${this.designNameForheading.join('-').toUpperCase()}`, fontSize: (this.designNameForheading.join('-').length > 35) ? 20 : 26, bold: true, alignment: 'left', margin:[0,5,0,0]}
                                                    ] 
                                                },
                                                '', 
                                                {stack:[
                                                        {text:'SHIP BY', fontSize: 18, bold: true, alignment: 'center'},
                                                        {text: this.formatter.transformDate(shipDate), fontSize: 20, bold: true, alignment: 'center'}
                                                    ]}
                                        ],
                                        ['', '', '', 
                                        {stack:[
                                                        {text:'PART', fontSize: 18, bold: true, alignment: 'center'},
                                                        {text:`${this.workOrderCountDetails}`, fontSize: 24, bold: true, alignment: 'center'}
                                                    ]}
                                        ],
                                        ['', {colSpan: 3,  stack:[designDetails]}, '', ''],
                                        ['', {stack:[
                                                        {text:'Sales Rep', fontSize: 18, bold: true, alignment: 'left'},
                                                        {text:`${order.salesPerson}`, fontSize: 24, bold: true, alignment: 'left'}
                                                    ]},
                                        {stack:[
                                                        {text:'BOX', fontSize: 18, bold: true, alignment: 'center'},
                                                        {text:`${boxNo} of ${totalBox}`, fontSize: 24, bold: true, alignment: 'center'}
                                                    ]}, 
                                        {stack:[
                                                        {text:'PIECES', fontSize: 18, bold: true, alignment: 'center'},
                                                        {text:`${qty}`, fontSize: 24, bold: true, alignment: 'center'}
                                                    ]}],
                                ]
                        }
                };
            return boxLabel;
    }
    boxLabels(){
        const { order, decoLocationsList,selectedWorkOrderCnt, totalWorkOrderCnt } = this.config;
        const node:any = [];
        const filteredItems = this.getApplicableItems();
        const designDetails = this.designTable(filteredItems);
        if (typeof order.workOrderBoxLabel[selectedWorkOrderCnt] !=='undefined') {
            let blCount = order.workOrderBoxLabel[selectedWorkOrderCnt].length;
            order.workOrderBoxLabel[selectedWorkOrderCnt].forEach((bl, index) => {
                    node.push(this.getboxLabel(bl.boxNo, bl.totalBox, bl.qty, bl.totalQty, bl.shipDate, designDetails));
                    if(blCount != (index + 1)){
                        node.push({ text: '', pageBreak: 'after' })
                    }
            });
        }else{
            node.push(this.getboxLabel(1, 1, this.totalQty, this.totalQty, '', designDetails));
        }
        return node;
    }


    getPageOrientation() {
        return 'landscape';
    }
    getPageMargins() {
       return [40, 80, 40, 0];
    }
}