import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { find } from 'lodash';
import { fieldLabel } from 'app/utils/utils';
import { ApiService } from 'app/core/services/api.service';
import { EMPTY as empty ,  of ,  forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
    selector: 'antera-gc-po-confirmation',
    templateUrl: './gc-po-confirmation.component.html',
    styleUrls: ['./gc-po-confirmation.component.scss'],
    animations: fuseAnimations
})
export class AnteraGcPoConfirmationComponent implements OnChanges, OnInit {
    @Input() order: any;
    @Input() docOptions: any[];
    @Input() docDefaultOptions: any[];
    @Input() logoUrl: string;
    @Input() lineItems: any[];
    @Input() docLabels: any;
    @Input() isAdmin = false;
    @Input() paymentList: any[] = [];
    @Input() docSettings: any;
    @Input() creditTerms: any[] = [];
    @Input() sysConfig: any;
    @Input() fields = [];

    sysconfigOrderFormCostDecimalUpto: string;
    sysconfigOrderFormQtyDecimalUpto: string;
    sysconfigOrderFormTotalDecimalUpto: string;

    fieldLabel = fieldLabel;
    sourceSubmission: any;
    logistics: any;

    constructor(private api: ApiService) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.order) {
            this.fetchAdditionalInfo(changes.order.currentValue);
        }
    }

    getSourceSubmission(order) {
        const sourceParams = {
            'limit': 50,
            'offset': 0,
            'order': 'dateEntered',
            'orient': 'desc',
            'term': {
                'quoteId': order.id
            }
        };
        return this.api.getSourcingSubmissionsList(sourceParams).pipe(
            switchMap((res: any[]) => {
                if (!res.length) {
                    return of([]);
                }

                return this.api.getSourcingSubmissionsDetails(res[0].id).pipe(
                    switchMap((submission: any) => {
                        return this.api.getSourcingDetailsBySourcingId(submission.sourcingId).pipe(
                            map((source: any) => {
                                submission.source = source;
                                return submission;
                            }),
                        );
                    })
                );
            }),
        );
    }
    getOrderLogistics(order) {
        const logisticsParams = {
            'limit': 50,
            'offset': 0,
            'order': 'orderId',
            'orient': 'desc',
            'term': {
                'orderId': order.id
            }
        }


        return this.api.getLogisticsList(logisticsParams)
    }
    fetchAdditionalInfo(order): any {

        const requests = [
            this.getOrderLogistics(order),
            this.getSourceSubmission(order)
        ];

        forkJoin(requests).subscribe((res: any) => {
            if (res[0].length) {
                this.logistics = res[0][0];
            }
            this.sourceSubmission = res[1];
        });
    }

    ngOnInit() {
        this.sysconfigOrderFormCostDecimalUpto = '1.2-' + this.sysConfig.sysconfigOrderFormCostDecimalUpto;
        this.sysconfigOrderFormQtyDecimalUpto = '1.0-' + this.sysConfig.sysconfigOrderFormQtyDecimalUpto;
        this.sysconfigOrderFormTotalDecimalUpto = '1.2-2';
    }

    get paymentUrl(): string {
        return window.location.origin + `/protected/payment.html?method=none&oId=${this.order.id}&amount=${this.order.finalGrandTotalPrice == '' ? '0' : this.order.finalGrandTotalPrice}`;
    }

    groupSizeQuantity(product) {
        return product.sizeList.map(s => s.quantity + ' ' + s.size).join(', ');
    }

    checkValid(value) {
        if (!value)
            return false;
        if (parseFloat(value) == 0)
            return false;
        if (parseFloat(value) > 0)
            return true;
    }

    calculateSubTotal() {
        return this.calculateTotalPrice() -
            parseFloat(this.order.taxAmount) -
            parseFloat(this.order.discount)
    }

    checkValidSubtotal() {
        return (parseFloat(this.order.finalGrandTotalPrice) - this.calculateSubTotal()) > 0;
    }

    calculateTotalPrice() {
        let totalPrice = 0;
        this.lineItems.forEach((product) => {
            totalPrice += parseFloat(product.price) * parseFloat(product.quantity);

            if (product.addonCharges) {
                product.addonCharges.forEach((addonCharge) => {
                    if (addonCharge.matchOrderQty)
                        totalPrice += parseFloat(addonCharge.price) * parseFloat(product.matchOrderQty);
                    else
                        totalPrice += parseFloat(addonCharge.price) * parseFloat(addonCharge.quantity);
                });
            }

            if (product.decoVendors) {
                product.decoVendors.forEach((decoVendor) => {
                    totalPrice += parseFloat(decoVendor.price) * parseFloat(decoVendor.quantity);
                });
            }
        });
        return totalPrice;
    }

    checkDocOptions() {
        const turnOnOffOptions = [this.docOptions[14].value, this.docOptions[15].value, this.docOptions[16].value];
        let countTrue = 0;
        turnOnOffOptions.forEach((option) => {
            if (option == true)
                countTrue += 1;
        });
        return countTrue;
    }

    getLabelForFirstColumn() {
        if (this.docOptions[14].value && this.docOptions[15].value)
            return this.docLabels.image || 'Image';
        if (!this.docOptions[14].value)
            return this.docLabels.image || 'Image';
        return this.docLabels.item || 'Item';
    }

    hasDecoVendors(product) {
        return product.decoVendors && product.decoVendors.length > 0;
    }

    hasAddonCharges(product) {
        return product.addonCharges && product.addonCharges.length > 0;
    }

    calculateBalanceAmount() {
        let paymentAmount = 0;
        this.paymentList.forEach((payment) => {
            paymentAmount += parseFloat(payment.amount);
        });
        return parseFloat(this.order.finalGrandTotalPrice) - paymentAmount;
    }

    displayCreditTerm(value) {
        const creditTerm = find(this.creditTerms, { value: value });
        if (!creditTerm) return '';
        return creditTerm.label;
    }

    displaydocDefaultOptions(name) {
        const option = find(this.docDefaultOptions, {name: name});
        if (!option) return '';
        return option.description;
    }

}
