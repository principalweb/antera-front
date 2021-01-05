import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { Injectable } from '@angular/core';

export class CxmlEnabled {
    asn: boolean;
    invoice: boolean;
    po: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CxmlService {
  enabled: CxmlEnabled = {
    asn: false,
    invoice: false,
    po: false
  };
  cxmlStatus: BehaviorSubject<CxmlEnabled> = new BehaviorSubject(this.enabled);

  constructor(
    private api: ApiService,
  ) {
    this.setCxmlEnabled();
  }

  setCxmlEnabled() {
    return this.api.get('/api/v1/cxml-actions/get-status')
      .subscribe((res: any) => {
        if (res.status === 'success') {
          this.enabled = res.enabled;
          this.cxmlStatus.next(this.enabled);
        } else {
          this.enabled = {
            asn: false,
            invoice: false,
            po: false
          };
          this.cxmlStatus.next(this.enabled);
        }
      }, (error) => {
        this.enabled = {
          asn: false,
          invoice: false,
          po: false
        };
        this.cxmlStatus.next(this.enabled);
      });
  }

  asnEnabled() {
    return this.enabled.asn;
  }

  sendAsn(orderId) {
    return this.api.get('/api/v1/cxml-actions/orders/' + orderId + '/send-asn');
  }

  sendInvoice(orderId) {
    return this.api.get('/api/v1/cxml-actions/orders/' + orderId + '/send-invoice');
  }
}
