import { AbstractDocument } from 'app/features/documents/document.interface';
import { DocumentImageManager, DocumentImageThumbnail } from 'app/features/documents/document-image-manager';
import { Observable } from 'rxjs';


export class GenericReportDocument extends AbstractDocument {
    imageManager: any;
    tocItems: any = [];
    isNaN: Function = Number.isNaN;

    constructor(public config: {
        logoUrl?: string;
        [x: string]: any;
    }) {
        super(config);
        this.imageManager = new DocumentImageManager();
    }

    getImages(): DocumentImageThumbnail[] {
        const images = [];
        if (this.config && this.config.logoUrl) {
            images.push({ src: this.config.logoUrl, width: 300 });
        }
        return images;
    }

    reportData() {
        const { report } = this.config;
        if (report.data && Array.isArray(report.data[0])) {
            return report.data.map((subReport, index, self) => {
                return {
                    ...this.reportTable(subReport),
                    pageBreak: index === 0 ? 'false' : 'before'
                };
            });
        } else {
            return this.reportTable(report.data);
        }
    }

    reportTable(data) {
        const { report } = this.config;
        const headerRow = data[0];
        const headerRowKeys = Object.keys(headerRow);
        const widths = headerRowKeys.map((column, index) => index == 0 ? '*' : 'auto');

        // Add table data
        const body: any[] = data.map((row, rowIndex, self) => {
            return headerRowKeys.map((key) => {
                const align = this.myIsNaN(row[key]) ? 'alignLeft' : 'alignRight';
                let node: any = { text: row[key], style: align};
                if (report.value == 'inventorysizecolumnskus') {
                    node.noWrap = true;
                    node.fontSize = 8;
                }
                return node;
            });
        });

        if (report.value == 'inventorysizecolumnskus') {
            body.shift();
        }

        // Add formatted header rows
        body.unshift(
            headerRowKeys.map((key, rowIndex) => {
                const node: any = { text: key, style: 'tableHeader' };
                // Add toc item grouped by header row first cell
                // Skip first and last
                // if (!(rowIndex === 0 || self.length === rowIndex + 1) && key === '') {
                // node.tocItem = headerRow[''];
                // }
                return node;
            })
        );

        let reportTableHeader: any = '';

        //if (report.reportName === 'Inventory Size Skus') {
        if (report.value === 'inventorysizecolumnskus') {
            // Get last of data and find total
            if (data && data.length) {
                const subtotal = data[data.length - 1].Total;
                this.tocItems.push({
                    toc: {
                        id: headerRow[''],  // optional
                        title: {
                            columns: [
                                { text: headerRow[''], bold: true },
                                { text: `Total: ${subtotal}`, bold: true },
                            ],
                            margin: [0, 8]

                        }
                    }
                });
                var count = this.getlength(subtotal);
                var padding = 25 - count;
                const subtotalString = `${subtotal}`.padEnd(padding, ' ');

                reportTableHeader = {
                    stack: [
                        { text: 'QTY / Product', bold: true, margin: [0, -25, 0, 0] },
                        {
                            text: [
                                { 
                                    text: `${subtotalString} ${headerRow['']}` ,
                                    bold: true,
                                    fontSize: 15,
                                    tocItem: true,
                                    tocStyle: {},
                                },
                            ],
                        }
                    ]
                };
            }
        }


        return {
            stack: [
                reportTableHeader,
                {
                    layout: 'order',
                    table: {
                        widths: widths,
                        headerRows: 1,
                        body: body
                    },
                    dontBreakRows: true,
                }
            ],
        };
    }

    getDocumentDefinition() {
        return Observable.create(observable => {
            this.loadImages().subscribe(() => {
                const dd = {
                    footer: this.footer(),
                    header: this.header(),
                    content: this.content(),
                    styles: {
                        header: {
                            fontSize: 18,
                            bold: true
                        },
                        tocHeader: {
                            fontSize: 18,
                            bold: true
                        },
                        smallGray: {
                            fontSize: 8,
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
                        bold: {
                            bold: true,
                        },
                        alignRight: {
                            alignment: 'right'
                        },
                        alignLeft: {
                            alignment: 'left'
                        }
                    },
                    defaultStyle: {
                        fontSize: 9,
                        columnGap: 16,
                    },
                    pageOrientation: 'landscape',
                    images: this.imageManager.imageMap
                };
                observable.next(dd);
                observable.complete();
            });
        });
    }

    tableOfContents() {
        const { report } = this.config;
        //if (report.reportName === 'Inventory Size Skus' && this.tocItems && this.tocItems.length) {
        if (report.value === 'inventorysizecolumnskus' && this.tocItems && this.tocItems.length) {

            const toc = {
                toc: {
                    title: {
                        columns: [
                            { text: 'QTY / Products', bold: true },
                            { text: 'Page', bold: true, alignment: 'right' },
                        ],
                        margin: [0, 8]

                    }
                }
            };
            return {
                stack: [
                    { text: 'Table of Contents', style: 'header' },
                    toc,
                ],
                margin: [24, 24],
                pageBreak: 'after',
            };
        }
        return null;
    }

    subheader() {
        const { order, report, logoUrl } = this.config;

        const dateCreated = this.formatter.transformDate(report.dateCreated);

        const detailStack: any = [
            {
                text: `Report: ${report.reportName}`,
                style: 'header',
                alignment: 'right'
            },
            {
                text: `Created at: ${dateCreated}`,
                alignment: 'right'
            }
        ];

        if (report.filters && report.filters.fromDate) {
            const fromDate = this.formatter.transformDate(report.filters.fromDate);
            const toDate = this.formatter.transformDate(report.filters.toDate);
            detailStack.push({
                text: `Range: ${fromDate} - ${toDate}`,
                alignment: 'right'
            });
        }

        const node = [
            {
                columns: [
                    { image: logoUrl ? logoUrl : 'placeholder', fit: [150, 150] },
                    {
                        stack: detailStack
                    }
                ]
            },
        ];



        return node;
    }

    header(): any {
        return (currentPage, pageCount) => { 
        };
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

    content() {
        const data = this.reportData();
        const tableOfContents = this.tableOfContents();
        return [
            this.subheader(),
            '\n',
            tableOfContents,
            '\n',
            data,
        ];
    }

    getlength(number) {
        return number.toString().length;

    }

    myIsNaN(input): boolean {
        if ((typeof input == 'string') && (typeof input.replace === "function")) {
            return isNaN(Number(input.replace(/,|\%/g, '')));
	    }
        return false;
    }
}
