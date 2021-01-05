import { FuseUtils } from '@fuse/utils';
import { assign } from 'lodash';

import { TaxCategory } from './tax-category';

export class ProductDetails {
    id: string;
    anteraId: string;
    productName: string;
    vendorName: string;
    vendorId: string;
    inhouseId: string;
    productId: string;
    description: string;
    imprintinfo: string;
    colorsAlias: string;
    productionTime: string;
    package: string;
    packaging: string;
    usefulLinks: string;
    collection: string;
    priceRange: string;
    additionalInfo: string;
    source: string;
    shell: string;
    division: string;
    dimension: string;
    weight: string;
    taxEnabled: string;
    price: string;
    pricingErr: string;
    specialPrice: string;
    extraInfo: string;
    extraBooleans: string;
    lot: string;
    poType: string;
    productType: string;
    taxJarCat: string;
    taxJarObj: TaxCategory;
    itemCode: string;
    rebate: string;
    coop: string;
    cloneId: string;
    rank: number;
    assignedUserId: string;
    assignedUserName: string;
    expirationDate: string;
    currencyCode: string;

    MediaContent = [];
    ProductPartArray: any;
    KitArray: any;
    RelatedProductArray: any;
    CustomerMarginArray: any;

    // BasicInfo fields not available in product-detail api
    qbExpenseAccount: string;
    qbIncomeAccount: string;
    qbAssetAccount: string;
    production: string;
    sequence: string;
    uomSetRef: string;
    uomDetails: any;

    ProductCategoryArray = [];
    AvailableCharges = [];
    StoreArray = [];
    SystemEventArray = [];
    DescriptionArray = [];

    // Shipping fields all not available in product-detail api
    width: string;
    height: string;
    depth: string;
    calculatorType: string;
    showColor: boolean;
    showSize: boolean;
    extraShippingFee: string;
    LocationArray?: {
        Location?: any[];
    };
    SupplierLocationArray?: {
        Location?: any[];
    };

    ChargeArray?: {
        Charge?: any[];
    };
    hideOnOrder: boolean;
    orderMinPricebreak: boolean;
    tariffCode: string;
    msrp: string;
    prodStatus: string;
    prodKind: string;
    countryOrigin: string;
    
    constructor(product?) {
        product = product || {};
        this.id = product.id || '';
        this.anteraId = product.anteraId || FuseUtils.generateGUID();
        this.productId = product.productId || '';
        this.productName = product.productName || '';
        this.vendorName = product.vendorName || '';
        this.vendorId = product.vendorId || '';
        this.inhouseId = product.inhouseId || '';
        this.description = product.description || '';
        this.imprintinfo = product.imprintinfo || '';
        this.colorsAlias = product.colorsAlias || '';
        this.productionTime = product.productionTime || '';
        this.package = product.package || '';
        this.packaging = product.packaging || '';
        this.usefulLinks = product.usefulLinks || '';
        this.collection = product.collection || '';
        this.priceRange = product.priceRange || '';
        this.additionalInfo = product.additionalInfo || '';
        this.source = product.source || '1';
        this.shell = product.shell || '';
        this.division = product.division || '';
        this.dimension = product.dimension || '';
        this.weight = product.weight || '';
        this.taxEnabled = product.taxEnabled || true;
        this.price = product.price || '';
        this.pricingErr = product.pricingErr || '';
        this.specialPrice = product.specialPrice || '';
        this.extraInfo = product.extraInfo || '';
        this.extraBooleans = product.extraBooleans || '';
        this.lot = product.lot || '';
        this.currencyCode = product.currencyCode || '';
        this.poType = product.poType || '';
        this.productType = product.productType || '';
        this.taxJarCat = product.taxJarCat || '0';
        this.setObject(product.taxJarObj, 'taxJarObj', TaxCategory);
        this.itemCode = product.itemCode || FuseUtils.generateGUID();
        this.rebate = product.rebate || '';
        this.MediaContent = product.MediaContent || [];
        this.coop = product.coop || '';
        this.cloneId = product.cloneId || '0';
        this.rank = product.rank || 0;
        this.ProductPartArray = product.ProductPartArray || {};
        this.KitArray = product.KitArray || [];
        this.RelatedProductArray = product.RelatedProductArray || [];
        this.CustomerMarginArray = product.CustomerMarginArray || [];
        this.LocationArray = product.LocationArray || [];
        this.ChargeArray = product.ChargeArray || {'Charge': []};
        this.AvailableCharges = product.AvailableCharges || [];

        // BasicInfo fields not available in product-detail api
        this.qbExpenseAccount = product.qbExpenseAccount || '';
        this.qbIncomeAccount = product.qbIncomeAccount || '';
        this.qbAssetAccount = product.qbAssetAccount || '';
        this.production = product.production || '';
        this.sequence = product.sequence || '';
        this.uomSetRef = product.uomSetRef || '';
        this.uomDetails = product.uomDetails || null;
        this.ProductCategoryArray = product.ProductCategoryArray || [];
        this.StoreArray = product.StoreArray || [];
        this.SystemEventArray = product.SystemEventArray || [];
        this.DescriptionArray = product.DescriptionArray || [];

        // Shipping fields all not available in product-detail api
        this.width = product.width || '';
        this.height = product.height || '';
        this.depth = product.depth || '';
        this.calculatorType = product.calculatorType || '0';
        this.showColor = product.showColor || false;
        this.showSize = product.showSize || false;
        this.extraShippingFee = product.extraShippingFee || '';
        this.assignedUserId = product.assignedUserId || '';
        this.assignedUserName = product.assignedUserName || '';
        this.expirationDate = product.expirationDate || '';
        this.hideOnOrder = product.hideOnOrder == "1" ? true : false || false;
        this.orderMinPricebreak = product.orderMinPricebreak || false;
        this.tariffCode = product.tariffCode || "";
        this.countryOrigin = product.countryOrigin || "";
        this.msrp = product.msrp || "";
        this.prodStatus = product.prodStatus || "";
        this.prodKind = product.prodKind || "";
    }

    removeDuplicates(objArr, prop) {
        return objArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }

    removeDuplicatesColors(arr) {
        let unique_array = Array.from(new Set(arr))
        return unique_array
    }

    update(obj) {
        assign(this, obj);
    }

    removeCategory(category) {
        const index = this.ProductCategoryArray.indexOf(category);

        if (index >= 0) {
            this.ProductCategoryArray.splice(index, 1);
        }
    }

    removeLocation(location) {
        const index = this.LocationArray.Location.findIndex(loc => loc.locationId == location.locationId);

        if (index >= 0) {
            this.LocationArray.Location.splice(index, 1);
        }
    }

    removeStore(store) {
        const index = this.StoreArray.indexOf(store);

        if (index >= 0) {
            this.StoreArray.splice(index, 1);
        }
    }

    setObject(data, field, modelType = null) {
        this[field] = {};
        if (modelType) {
            this[field] = new modelType(data);
        } else {
            this[field] = data;
        }
    }

}

export class Category {
    id: string;
    category: string;
}

export class CategoryDetail {
    id: string;
    category: string;
    taxJarCat: string;
    qbExpenseAccount: string;
    qbIncomeAccount: string;
    qbAssetAccount: string;
    qbClass: string;
    locations: string[];
    taxJarObj: TaxCategory;
}

export class CategoryLocations {
    id: string;
    item: string;
}

export class StoreDataSource
{
    id:string;
    storeId:string;
    store:string;
    margin:string;
    Attributes:any;
}

export class RelatedProductDataSource
{
    id: string;
    pId: string;
    productId: string;
    productName: string;
    vendorName: string;
    vendorId: string;
    type: boolean;
    MediaContent: any;
}

export class CustomerMarginProductDataSource
{
    id: string;
    pId: string;
    customer_id: string;
    customer_name: string;
    margin: string;
}

export class KitDataSource
{
    kitId:string;
    kitKey:string;
    pId:string;
    productName:string;
    productId:string;
    hide:string;
    productType:string;
    sku:string;
    color:string;
    size:string;
    quantity:string;
    image:string;
    matrixId:string;
    key:string;
    setting:boolean;
}

export class SizeLabel
{
    id: string;
    name: string;
}
