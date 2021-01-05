import { fieldLabel } from 'app/utils/utils';
import { DocumentImageThumbnail, DocumentImageManager } from './document-image-manager';
import { IDecoVendor } from '../e-commerce/order-form/interfaces';

export interface IDocument {
    formatter: any;
    name: string;
    config?: any;
    header?(): any;
    footer?(): any;
    content?(): any;
    getDocumentDefinition(): any;
    loadImages?(): any;
    getImages?(): DocumentImageThumbnail[];
    setFormatter(formatter: any): any;
};

export abstract class AbstractDocument  {
    // TODO implement IDocument
    name: string;
    formatter: any;
    imageManager: DocumentImageManager;

    setFormatter(formatter) {
        if (formatter) {
            this.formatter = formatter;  
        }         
    }

    // header?() {
    //     // throw new Error('Method not implemented.');
    // }
    // footer?() {
    //     // throw new Error('Method not implemented.');
    // }
    // content?() {
    //     // throw new Error('Method not implemented.');
    // }
    // getDocumentDefinition() {
    //     // throw new Error('Method not implemented.');
    // }

    documentFooterNote() {
        const { docOptions, docDefaultOptions } = this.config;
        if (docOptions && docOptions[29] && docOptions[29].value) {

            const footerNote = docDefaultOptions.find((option) => {
                return option.name === docOptions[29].name;
            });
            if (footerNote) {
                return { text: footerNote.description };
            }
        }
    }

    getDecoImageUrl(deco: any) {
        let decoImageUrl = deco.decorationDetails[0] && deco.decorationDetails[0].decoDesignVariation && deco.decorationDetails[0].decoDesignVariation.itemImageThumbnail && deco.decorationDetails[0].decoDesignVariation.itemImageThumbnail[0];
        if (!decoImageUrl) {
            decoImageUrl = deco.decorationDetails[0] && deco.decorationDetails[0].decoDesignVariation && deco.decorationDetails[0].decoDesignVariation.itemImage && deco.decorationDetails[0].decoDesignVariation.itemImage[0];
        }
        //console.log(decoImageUrl);
        return decoImageUrl;
    }

    getDecoLocationImageUrl(deco: any) {
        let decoLocationImageUrl = 'https://s3.amazonaws.com/images.anterasoftware.com/locations/'+deco.decoLocation+'.png';
        if (!decoLocationImageUrl) {
            decoLocationImageUrl = decoLocationImageUrl;
        }
        return decoLocationImageUrl;
    }
    
    loadImages() {
        return this.imageManager.loadImages(
            this.getImages()
        );
    }
    getImages?(): DocumentImageThumbnail[] {
        throw new Error('Method not implemented.');
    }

    getDecoColors(deco: IDecoVendor) {
        const node: any = {
            text: [],
        };

        if (deco.decorationDetails[0].decoDesignVariation && deco.decorationDetails[0].decoDesignVariation.design_color_thread_pms) {
            const colors = deco.decorationDetails[0].decoDesignVariation.design_color_thread_pms;

            colors.forEach((color, index) => {
                let colorText = `Color ${color.No}`;
                if (color.Color) {
                    colorText += ' ' + color.Color;
                }
                if (color.ThreadPMS) {
                    colorText += ' ' + color.ThreadPMS;
                }
                if (color.Description) {
                    colorText += ' ' + color.Description;
                }

                node.text.push(colorText);
                if (index !== colors.length - 1) {
                    node.text.push(', ');
                }
            });
        }

        return node;
    }
    getDecoDescriptionGrid(deco: IDecoVendor) {

        const { docOptions } = this.config;

        const decoImageUrl = this.getDecoImageUrl(deco);

        const node = {
            columns: [],
            margin: [10, 0, 0, 0], 
            border: [true, true, false, true]
            
        };
        let designName = '';
	if (docOptions[38] && docOptions[38].value && deco.designName) {
            //designName = `${deco.designName} \n`;
	}   
	let designVariationTitle = '';
	if (docOptions[39] && docOptions[39].value && deco.decorationDetails[0].decoDesignVariation.design_variation_title) {
            //designVariationTitle = `${deco.decorationDetails[0].decoDesignVariation.design_variation_title} \n`;
	}        
	
        if (docOptions[20] && docOptions[20].value) {
            node.columns.push({
            columns: [
                {
                    image: this.lookupImage(decoImageUrl),
                    fit: [48, 32],
                    width: 48
                },            
                { text: `${deco.designModal} ${designName} ${designVariationTitle}`, style: 'smallGray', margin: [0, 12] }
            ]
        });
        }else{
            node.columns.push({
            columns: [           
                { text: `${deco.designModal} ${designName} ${designVariationTitle}`, style: 'smallGray', margin: [0, 12] }
            ]
        });
        }

	
        /*
        const description = {
            stack: [
                { text: `${deco.decoTypeName} \n ${deco.decoLocation} ` }
            ]
        };

        node.columns.push(description);
*/
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
            stack: [
                {
                    image: this.lookupImage(decoImageUrl),
                    fit: [64, 32],
                    width: 64,
                },            
                { text: `${deco.designModal}` }
            ]
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
        node.columns.push(description);

        return node;
    }

    lookupImage(src) {
        return (src && this.imageManager.imageMap[src]) || 'placeholder';
    }

    getFieldLabel(val: string, defaultValue: string = '') {
        let label;
        if (this.config.fields) {
            label = fieldLabel(val, this.config.fields);
        }
        if (label) {
            return label;
        }
        return defaultValue;
    }

    getDocLabel(key: string, defaultValue: string = '') {
        if (this.config.docLabels && this.config.docLabels[key]) {
            return this.config.docLabels[key];
        }
        return defaultValue;
    }
    
    getDynamicDocLabel(key: string, defaultValue: string = '') {
        if (this.config.dynamicDocumentLabels && this.config.dynamicDocumentLabels[key]) {
            return this.config.dynamicDocumentLabels[key];
        }
        return defaultValue;
    }

    checkbox() {
        return {
            width: 16,
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
        };
    }

    horizontalLine() {
        return [
            '\n',
            {
                canvas: [
                    {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 515.00,
                        h: 1,
                        // lineWidth: 10,
                        lineColor: '#CCCCCC',
                    },
                ]
            },
            '\n',
        ];
    }


    horizontalLineGridView() {
        return [
            '\n',
            {
                canvas: [
                    {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 658.00,
                        h: 1,
                        // lineWidth: 10,
                        lineColor: '#CCCCCC',
                    },
                ]
            },
            '\n',
        ];
    }
    
    public constructor(public config: any) {

    }
}

export abstract class AbstractOrderDocument extends AbstractDocument {

    documentFields() {
        return [
            'Total Due',
            'Order Date',
            'In Hands Date',
            'Ship Via',
            'Due Date',
            'Shipping Date',
            'Customer PO #',
            'Payment Terms',
            'Salesperson Name',
            'Salesperson Phone',
            'Salesperson Email',
            'CSR Name',
            'CSR Phone',
            'CSR Email',
            'Item Number',
            'Product Image',
            'Product Unit',
            'Description',
            'Show Decimal',
            'Payment Button',
            'Decoration Image',
            'Customer Name',
            'Customer Phone',
            'Size',
            'Color',
            'Shipping Account No',
            'Alternate Account #',
            'Attention To',
            'Tracking No',
            'Footer Note',
            'In-House ID',
            'Factory Ship Date',
            'Booked Date',
            'Item Code'
        ];
    }

    paymentLink() {
        const { order } = this.config;
        const amount = order.finalGrandTotalPrice == '' ? '0' : order.finalGrandTotalPrice;
        const paymentUrl = window.location.origin +
            `/protected/payment.html?method=none&oId=${order.id}&amount=${amount}`;
        return {
            image: 'data:image/png;base64,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',
            width: 100,
            link: paymentUrl,
        };
    }

}
