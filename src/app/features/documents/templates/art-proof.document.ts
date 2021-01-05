import { OrderDetails, LineItem } from 'app/models';
import { Observable } from 'rxjs';
import { DocumentImageManager, DocumentImageThumbnail } from '../document-image-manager';
import { IDocument, AbstractOrderDocument } from '../document.interface';
import { InvoiceDocument } from './invoice.document';
import { IDecoVendor } from 'app/features/e-commerce/order-form/interfaces';


export class ArtProofDocument extends InvoiceDocument {
    name = 'art-proof';
    label = 'Art Proof';

    proofsAdded = [];

    constructor(public config: {
        order: Partial<OrderDetails>,
        disableApprovalButtons?: boolean,
        directCustomerProof?: boolean,
        onlyShowProofsById?: string[],
        [x: string]: any,
    }) {
        super(config);
        this.imageManager = new DocumentImageManager();
    }

    getTitle() {
        return this.getDynamicDocLabel('heading', this.label);
    }

    getImages(): DocumentImageThumbnail[] {
        const { order, resolve } = this.config;

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
                    collection.push({ src: row.imageUrl, width: 400 });
                }
            });
            item.decoVendors.forEach((deco) => {
                let decoImageUrl = this.getDecoImageUrl(deco);
                if (decoImageUrl && !collection.find(x => x.src === decoImageUrl)) {
                    collection.push({ src: decoImageUrl });
                }
            });
            return collection;
        }, []);

        if (this.config && this.config.logoUrl) {
            images.push({ src: this.config.logoUrl, width: 300 });
        }

        // proof images

        if (resolve.data) {
            resolve.data.forEach((proof) => {
                if (proof.image_url) {
                    images.push({ src: proof.image_url, width: 600 });
                }
            });

        }

        return images;
    }

    headerTableLayout(item, row, deco, proofRecord) {
        return {
            table: {
                body: [
                    [
                        {
                            stack: [
                                { text: 'DIGITAL PROOF', alignment: 'center', bold: true, fontSize: 16, marginRight: 2, paddingBottom: 16, paddingTop: 16 },
                                (proofRecord && proofRecord.status) ? this.statusText(proofRecord.status) : this.statusText(1),
                            ],
                            margin: [0, 30, 0, 0],
                            rowSpan: 2,
                        },
                        { text: '', border: [false, false, false, false], rowSpan: 2 },
                        this.headerTableFields(item, row, deco)
                    ],
                    [
                        '',
                        '',
                        {
                            text: 'PLEASE REVIEW THIS PROOF CAREFULLY. We do our best to ensure the accuracy of every layout but it is the responisbility of the client to review the proof for spelling, grammar, layout, ommissions, and color. (Contact your sales rep for questions)',
                            style: ['blackBackground', 'smallText']
                        }
                    ]
                ]
            },
        }
    }

    statusText(status: any) {
        const node = { text: 'PENDING', color: 'orange', margin: [4, 4, 4, 4], alignment: 'center' }

        if (status) {
            if (status === '2') {
                node.text = 'DECLINED';
                node.color = 'red';
            }
            if (status === '3') {
                node.text = 'APPROVED\n (with changes)';
                node.color = '#ff9800';
            }
            if (status === '4') {
                node.text = 'APPROVED';
                node.color = 'green';
            }
        }
        return node;
    }

    artProof() {
        const { order, resolve, onlyShowProofsById } = this.config;

        const proofs = [];
        order.lineItems
            .filter((item) => item.decoVendors && item.decoVendors.length > 0)
            .forEach((item: LineItem) => {

                item.matrixRows.forEach((row, rowIndex) => {
                    const decoRows: any = [];

                    const filteredDeco = item.decoVendors
                        .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId));

                    filteredDeco.forEach((deco) => {
                        let decoImageUrl =  this.getDecoImageUrl(deco);
                        if (!decoImageUrl) {
                            decoImageUrl = 'placeholder';
                        }

                        const productDescription: any = [
                            {
                                text: [
                                    { text: 'Item Description: ', bold: true },
                                    { text: item.productName },
                                ]
                            }
                        ];
                        if (row.color) {
                            productDescription.push(
                                {
                                    text: [
                                        { text: 'Item Color: ', bold: true },
                                        { text: row.color },
                                    ]
                                }
                            );
                        }

                        const proofRecord = resolve.data && resolve.data.find((_proof) => {
                            return _proof.artwork_id == deco.designId
                                && _proof.artwork_variation_id == deco.decorationDetails[0].decoDesignVariation.decoImprintVariation
                                && _proof.product_id == item.productId;
                        });

                        let proofLayout = {};

                        if (proofRecord) {

                            if (proofRecord.notes) {
                                productDescription.push(
                                    {
                                        stack: [
                                            { text: 'Notes', bold: true },
                                            { text: proofRecord.notes }
                                        ]
                                    }
                                );
                            }

                            proofLayout = {
                                columns: [
                                    {
                                        image: this.lookupImage(proofRecord.image_url),
                                        maxWidth: 300,
                                        maxHeight: 500,
                                    },
                                    {
                                        stack: [
                                            ...productDescription,
                                        ],
                                        width: '*',
                                        margin: [0, 24, 0, 0]
                                    }
                                ],
                                margin: [0, 24]
                            };
                        } else {
                            proofLayout = {
                                columns: [
                                    {
                                        stack: [
                                            {
                                                image: decoImageUrl,
                                                fit: [36, 36]
                                            },
                                            { text: deco.decoLocation },
                                            '\n'
                                        ],
                                        width: '*',
                                        margin: [0, 24, 0, 0]
                                    },
                                    {
                                        image: this.lookupImage(row.imageUrl),
                                        fit: [300, 300],
                                        width: 300,
                                    },
                                    {
                                        stack: productDescription,
                                        width: '*',
                                        margin: [0, 24, 0, 0]
                                    }
                                ],
                                margin: [0, 24]
                            };
                        }

                        let shouldShowProof = true;
                        if (onlyShowProofsById && onlyShowProofsById.length) {
                            shouldShowProof = false;
                            if (proofRecord && onlyShowProofsById.indexOf(proofRecord.id) !== -1 && this.proofsAdded.indexOf(proofRecord.id) === -1) {
                                shouldShowProof = true;
                                this.proofsAdded.push(proofRecord.id);
                            }
                        }

                        const proof = {
                            stack: [
                                this.headerTableLayout(item, row, deco, proofRecord),
                                proofLayout,
                                this.proofTransitions(proofRecord),
                                this.pageFooter(proofRecord),
                            ],
                            pageBreak: 'after'
                        };

                        if (shouldShowProof) {
                            proofs.push(proof);
                        }
                    });
                });

            });
        proofs[proofs.length - 1].pageBreak = undefined;
        return proofs;
    }

    artProofImageOnly() {
        const { order, resolve, onlyShowProofsById } = this.config;

        const proofs = [];
        order.lineItems
            .filter((item) => item.decoVendors && item.decoVendors.length > 0)
            .forEach((item: LineItem) => {

                item.matrixRows.forEach((row, rowIndex) => {
                    const decoRows: any = [];

                    const filteredDeco = item.decoVendors
                        .filter((deco) => deco.decorationDetails.some((detail) => detail.matrixId == row.matrixUpdateId));

                    filteredDeco.forEach((deco) => {
                        let decoImageUrl =  this.getDecoImageUrl(deco);
                        if (!decoImageUrl) {
                            decoImageUrl = 'placeholder';
                        }

                        const productDescription: any = [
                            {
                                text: [
                                    { text: '', bold: true },
                                    { text: '' },
                                ]
                            }
                        ];
                        if (row.color) {
                            productDescription.push(
                                {
                                    text: [
                                        { text: '', bold: true },
                                        { text: '' },
                                    ]
                                }
                            );
                        }

                        const proofRecord = resolve.data && resolve.data.find((_proof) => {
                            return _proof.artwork_id == deco.designId;
                        });

                        let proofLayout = {};

                        if (proofRecord) {

                            if (proofRecord.notes) {
                                productDescription.push(
                                    {
                                        stack: [
                                            { text: 'Notes', bold: true },
                                            { text: proofRecord.notes }
                                        ]
                                    }
                                );
                            }
                            console.log('proofRecord.image_url')
                            console.log(proofRecord.image_url)
                            proofLayout = {
                                columns: [
                                    {
                                        image: this.lookupImage(proofRecord.image_url),
                                        maxWidth: 300,
                                        maxHeight: 500,
                                    },
                                    {
                                        stack: [
                                            ...productDescription,
                                        ],
                                        width: '*',
                                        margin: [0, 24, 0, 0]
                                    }
                                ],
                                margin: [0, 24]
                            };
                        }else{
                            proofLayout = {
                                columns: [
                                    {
                                        stack: [
                                            {
                                                image: decoImageUrl,
                                                fit: [36, 36]
                                            },
                                            { text: deco.decoLocation },
                                            '\n'
                                        ],
                                        width: '*',
                                        margin: [0, 24, 0, 0]
                                    },
                                    {
                                        image: this.lookupImage(row.imageUrl),
                                        fit: [300, 300],
                                        width: 300,
                                    },
                                    {
                                        stack: productDescription,
                                        width: '*',
                                        margin: [0, 24, 0, 0]
                                    }
                                ],
                                margin: [0, 24]
                            };
                        }

                        let shouldShowProof = true;
                        if (onlyShowProofsById && onlyShowProofsById.length) {
                            shouldShowProof = false;
                            if (proofRecord && onlyShowProofsById.indexOf(proofRecord.id) !== -1 && this.proofsAdded.indexOf(proofRecord.id) === -1) {
                                shouldShowProof = true;
                                this.proofsAdded.push(proofRecord.id);
                            }
                        }

                        const proof = {
                            stack: [
                                proofLayout
                            ],
                            pageBreak: 'after'
                        };

                        if (shouldShowProof) {
                            proofs.push(proof);
                        }
                    });
                });

            });
            if(proofs[proofs.length - 1]){
                proofs[proofs.length - 1].pageBreak = undefined;
            }
        return proofs;
    }
    productColorsForProof() {
        const { order, resolve } = this.config;
        const node = {};

        resolve.data.forEach(proof => {

            // Find product colors for each artwork variation
            order.lineItems.forEach((item) => {
                item.matrixRows.reduce((rows, row) => {
                    return rows;
                }, []);
                // proof.artwork_variation_id
            });
            // proof.artwork_id,
            // proof.artwork_variation_id
        });


    }

    proofForm() {
        const form = [
            {
                columns: [
                    {
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

                    },
                    'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines'
                ]
            },
            '\n\n',
            {
                columns: [
                    {
                        width: 15,
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
            this.horizontalLine(),
            this.horizontalLine(),
            {
                columns: [
                    this.checkbox(),
                    'Proof is not approved. Please make the changes indicated here.',
                ]
            },
            this.horizontalLine(),
            this.horizontalLine(),
            {
                text: 'Please fax back to 214-555-2121, or scan and email to salesadvance@anterasoftware.com',
                alignment: 'center',
                margin: [0, 12, 0, 0]
            }
        ];
        return form;
    }

    fieldCell(label, value, attr = {}) {
        return {
            stack: [
                { text: label, bold: true, style: ['mediumText'] },
                { text: value, style: ['mediumText'] }
            ],
            ...attr
        };
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
                if (color.ThreadPMS) {
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

    headerTableFields(item, row, deco) {
        const { order } = this.config;


        const colors = this.getDecoColors(deco);
        const variation = deco.decorationDetails && deco.decorationDetails[0] && deco.decorationDetails[0].decoDesignVariation.decoImprintVariation;
        return {
            stack: [
                {
                    columns: [
                        this.fieldCell('Customer Name', order.accountName),
                        this.fieldCell('Decoration Type', deco.decoTypeName),
                        this.fieldCell('Detail Count', deco.designDetailCount),
                        this.fieldCell('Variation', variation),
                    ],
                    margin: [0, 0, 0, 5],
                },
                {
                    columns: [
                        this.fieldCell('Product', item.productName),
                        this.fieldCell('Color Specs', colors),
                        this.fieldCell('Notes', deco.decorationNotes),
                        '',
                    ],
                    margin: [0, 0, 0, 5],
                }
            ],
            margin: [4, 4, 4, 4]
        }
    }

    svgButton(label, link, config: any = {
        color: 'gray',
        attributes: {},
    }) {
        return {
            svg: `<svg viewBox="0 0 100% 100%" xmlns="http://www.w3.org/2000/svg">
      <a href="${link}">
        <rect x="0" width="100%" height="100%" fill="${config.color}" rx="4" />
        <text x="50%" y="50%" font-size="12" dominant-baseline="middle" fill="white" text-anchor="middle">${label}</text>
      </a>
    </svg>`,
            height: 42,
            width: 160,
            ...config.attributes
        };
    }

    pageFooter(proof) {
        const { order, disableApprovalButtons } = this.config;

        if (disableApprovalButtons || !proof || !proof.id) {
            return {};
        }

        const baseUrl = window.location.protocol + '//' + window.location.host;
        const transitionUrl = `${baseUrl}/external/art-proof/${order.id}?proof=${proof.id}`;
        return this.svgButton(
            'Review Electronic Proof',
            `${transitionUrl}`,
            { color: 'gray', attributes: { alignment: 'center' } },
        );
    }

    proofTransitions(proof) {

        if (proof && proof.transitions && proof.transitions.length ) {

            const node = {
                layout: 'order',
                table: {
                    headerRows: 1,
                    widths: ['auto', '*', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Status', style: 'tableHeader' },
                            { text: 'Notes', style: 'tableHeader' },
                            { text: 'Name', style: 'tableHeader' },
                            { text: 'Date', style: 'tableHeader' },
                        ]
                    ]
                },
                margin: [0, 16]
            };

            proof.transitions.forEach((transition) => {
                node.table.body.push([
                    this.statusText(transition.to_state),
                    transition.notes,
                    transition.name,
                    this.formatter.transformDate(transition.created_at)
                ]);
            });

            return node;
        }
        return '';
    }


    subheader(): any {
        const { order } = this.config;
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
            this.horizontalLine(),
        ];
    }

    content() {
        const { directCustomerProof } = this.config;
        return [
            directCustomerProof ? this.artProofImageOnly() : this.artProof(),
            this.documentFooterNote(),
        ];
    }
}