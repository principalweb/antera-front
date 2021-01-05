import { Injectable } from '@angular/core';
import { BehaviorSubject ,  Observable ,  Subject, of } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiService } from './api.service';
import { MessageService } from 'app/core/services/message.service';
@Injectable()
export class DocumentsService {

    invoice: any;
    invoiceOnChanged: BehaviorSubject<any> = new BehaviorSubject({});
    documentOptionsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onSetLogoChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onGetLogoChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onSetAddonLogoChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onGetAddonLogoChanged: BehaviorSubject<any> = new BehaviorSubject({});

    onDocumentChanged: Subject<any> = new Subject();
    onTemplateChanged: Subject<any> = new Subject();

    document = 'Invoice';
    template = '1';

    defaultDocOptions = [
        {
          "Total Due": 1
        },
        {
          "Order Date": 1
        },
        {
          "In Hands Date": 1
        },
        {
          "Ship Via": 1
        },
        {
          "Due Date": 1
        },
        {
          "Shipping Date": 1
        },
        {
          "Customer PO #": 1
        },
        {
          "Payment Terms": 1
        },
        {
          "Salesperson Name": 1
        },
        {
          "Salesperson Phone": 1
        },
        {
          "Salesperson Email": 1
        },
        {
          "CSR Name": 1
        },
        {
          "CSR Phone": 1
        },
        {
          "CSR Email": 1
        },
        {
          "Item Number": 1
        },
        {
          "Product Image": 1
        },
        {
          "Product Unit": 1
        },
        {
          "Description": 1
        },
        {
          "Show Decimal": 1
        },
        {
          "Payment Button": 1
        },
        {
          "Decoration Image": 1
        },
        {
          "Customer Name": 1
        },
        {
          "Customer Phone": 1
        },
        {
            "Size": 1
        },
        {
            "Color": 1
        },
        {
            "Shipping Account No": 1
        },
        {
            "Alternate Account #": 1
        },
        {
            "Attention To": 1
        },
        {
            "Tracking No": 0
        },
        {
            "Footer Note": 0
        },
        {
            "In-House ID": 0
        },
        {
            "Factory Ship Date": 0
        },
        {
            "Booked Date": 0
        },
        {
            "Item Code": 1
        },
        {
            "Supplier Ship Date": 0
        },
        {
            "Order Identity": 0
        }
      ];

    constructor(
        private api: ApiService,
        private msg: MessageService
    )
    {
        this.defaultDocOptions = [];
        this.onDocumentChanged.subscribe(document => {
            this.document = document;
            this.getDocumentOptions().then(console.log);
        })

        this.onTemplateChanged.subscribe(template => {
            this.template = template;
            this.getDocumentOptions().then(console.log);
        })
    }

      /**
     * Resolve
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getDocumentOptions(),
                this.getLogo(),
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get doc Options
     */
    getDocumentOptions(): Promise<any[]>
    {
        this.defaultDocOptions = [];
        return new Promise((resolve, reject) => {
            let data  = {type: this.document, template: this.template};
            this.api.post('/content/get-document-options', data)
                .subscribe((response: any) => {
                console.log('Array.isArray(response)')
                console.log(Array.isArray(response))
                    if (Array.isArray(response)){
                        console.log('this.defaultDocOptions.length' + this.defaultDocOptions.length);
                        console.log('response.length' + response.length);
                        let docOptions = response.map(option => Object.keys(option).map(key => ({name: key, value: option[key] == 1 ? true: false})).pop());
                        this.documentOptionsChanged.next(docOptions);
                        resolve(docOptions);
                         /*
                        if (response.length == this.defaultDocOptions.length){
                            let docOptions = response.map(option => Object.keys(option).map(key => ({name: key, value: option[key] == 1 ? true: false})).pop());
                            this.documentOptionsChanged.next(docOptions);
                            resolve(docOptions);
                        }
                        else{
                            // Create doc options with default options
                            let docOptions = this.defaultDocOptions.map(option => Object.keys(option).map(key => ({name: key, value: option[key] == 1 ? true: false})).pop());
                            this.updateDocumentOptions(docOptions).then(console.log);
                            this.documentOptionsChanged.next(docOptions);
                            resolve(docOptions);
                        }
                        */
                    }
                    else{
                        // Create doc options with default options
                        this.msg.show('Error fetching documents settings, Please reload the document settings page.', 'error');
                        let docOptions = this.defaultDocOptions.map(option => Object.keys(option).map(key => ({name: key, value: option[key] == 1 ? true: false})).pop());
                        //this.updateDocumentOptions(docOptions).then(console.log);
                        this.documentOptionsChanged.next(docOptions);
                        resolve(docOptions);
                    }

                }, (err => reject(err)));
        });
    }

    getLogo(): Promise<any[]>
    {
        return new Promise((resolve, reject) => {
            this.api.getLogo()
                .subscribe((response: any) => {
                    if (response){
                        this.onGetLogoChanged.next(response);
                        resolve(response);
                    }
                }, (err => reject(err)));
        });
    }

    setLogoFile(data): Promise<any[]>
    {
        return new Promise((resolve, reject) => {
            this.api.uploadLogo(data)
                .subscribe((response: any) => {
                    this.onSetLogoChanged.next(response.msg);
                    resolve(response.msg);
                }, (err => reject(err)));
        });
    }

    getAddonLogo(): Promise<any[]>
    {
        return new Promise((resolve, reject) => {
            this.api.getAddonLogo()
                .subscribe((response: any) => {
                    if (response){
                        this.onGetAddonLogoChanged.next(response);
                        resolve(response);
                    }
                }, (err => reject(err)));
        });
    }

    setAddonLogoFile(data): Promise<any[]>
    {
        return new Promise((resolve, reject) => {
            this.api.uploadAddonLogo(data)
                .subscribe((response: any) => {
                    this.onSetAddonLogoChanged.next(response.msg);
                    resolve(response.msg);
                }, (err => reject(err)));
        });
    }
    
    /**
     * Update doc Options
     */

    updateDocumentOptions(docOptions: any[]): Promise<any>
    {
        return new Promise((resolve, reject) => {
            let updatedOptions = docOptions.map(option => {
                const obj = {};
                obj[option.name] = option.value == true ? 1:0;
                return obj;
            });
            let data  = {type: this.document, template: this.template, options: updatedOptions};
            this.api.post('/content/update-document', data)
                .subscribe((response: any) => {
                    resolve(response.status);
                }, (err => reject(err)));
        });
    }

    updateProformaDate(params: {order_id: string, date: string | Date}) {
      return this.api.updateProformaDate(params);
    }

    updateInvoiceDate(orderId,date): Promise<any>
    {
        return new Promise((resolve, reject) => {
            let data = {oId: orderId, date: date};
            this.api.updateInvoiceDate(data)
                .subscribe((res: any) => {
                    resolve(res);
                },(err => reject(err)));
        });
    }

    getAdvanceSystemConfigAll(module) : Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.api.getAdvanceSystemConfigAll({module: 'Documents'})
                .subscribe((res: any) => {
                    resolve(res);
                },(err => reject(err)));    
        });
    }
}
