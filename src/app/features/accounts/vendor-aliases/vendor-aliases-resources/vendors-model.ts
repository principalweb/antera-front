import { IVendorAlias } from '../vendor-aliases-resources/vendor-alias-interface';

export class Vendors {
    vendorAliases: IVendorAlias[];


    constructor(vendorAliases: Object = {}) {
        this.vendorAliases = [];
        for (let key in vendorAliases) {

            let vendorAlias: IVendorAlias = {
                name: key,
                aliaesString: vendorAliases[key].join(),
                aliaesArray: vendorAliases[key]
            };
            this.vendorAliases.push(vendorAlias);

        }
    }
}

