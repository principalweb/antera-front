import { BaseModel } from './base-model';

export class Royalty extends BaseModel {
    id: string;
    reportName: string;
    franchiseId: string;
    month: string;
    data: string;
    createdBy: string;
    dateCreated: string;
    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'reportName');
        this.setString(data, 'franchiseId');
        this.setString(data, 'url');
        this.setString(data, 'data');
        this.setString(data, 'createdBy');
        this.setString(data, 'dateCreated');
    }
}

export class Franchise extends BaseModel {
    id: string;
    franchiseName: string;
    franchiseNumber: string;
    url: string;
    capId: string;
    capCode: string;
    deleted: boolean;
    techFee: number;
    liveDate: string;
    setData(data) {
        this.setString(data, 'id');
        this.setBoolean(data, 'deleted');
        this.setString(data, 'franchiseName');
        this.setString(data, 'capId');
        this.setString(data, 'capCode');
        this.setString(data, 'franchiseNumber');
        this.setString(data, 'url');
        this.setFloat(data, 'techFee');
        this.setString(data, 'liveDate');
    }
}

export class FranchiseDetails extends BaseModel {
    id: string;
    franchiseName: string;
    franchiseNumber: string;
    url: string;
    capId: string;
    capCode: string;
    deleted: boolean;
    techFee: number;
    liveDate: string;
    setData(data) {
        this.setString(data, 'id');
        this.setBoolean(data, 'deleted');
        this.setString(data, 'franchiseName');
        this.setString(data, 'franchiseNumber');
        this.setString(data, 'capId');
        this.setString(data, 'capCode');
        this.setString(data, 'url');
        this.setFloat(data, 'techFee');
        this.setString(data, 'liveDate');
    }
}

export class CapDetails extends BaseModel {
    id: string;
    capCode: string;
    capCycle: string;
    capPercent: number;
    capMin: number;
    capMax: number;
    adPercent: number;
    adMin: number;
    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'capCode');
        this.setString(data, 'capCycle');
        this.setFloat(data, 'capPercent');
        this.setFloat(data, 'capMin');
        this.setFloat(data, 'capMax');
        this.setFloat(data, 'adPercent');
        this.setFloat(data, 'adMin');
    }
}

export class FranchiseCap extends BaseModel {
    id: string;
    franchiseId: string;
    capId: string;
    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'franchiseId');
        this.setString(data, 'capId');
    }
}


export class InvoiceRoyalty extends BaseModel {
    franchiseName: string;
    franchiseNumber: string;
    reportName: string;
    month: string;
    data: string;
    setData(data) {
        this.setString(data, 'franchiseName');
        this.setString(data, 'franchiseNumber');
        this.setString(data, 'reportName');
        this.setString(data, 'month');
        this.setString(data, 'data');
    }
}

export class AdjustedVoidRoyalty extends BaseModel {
    franchiseName: string;
    franchiseNumber: string;
    reportName: string;
    month: string;
    data: string;
    setData(data) {
        this.setString(data, 'franchiseName');
        this.setString(data, 'franchiseNumber');
        this.setString(data, 'reportName');
        this.setString(data, 'month');
        this.setString(data, 'data');
    }
}

export class OpenOrderRoyalty extends BaseModel {
    franchiseName: string;
    franchiseNumber: string;
    reportName: string;
    month: string;
    data: string;
    setData(data) {
        this.setString(data, 'franchiseName');
        this.setString(data, 'franchiseNumber');
        this.setString(data, 'reportName');
        this.setString(data, 'month');
        this.setString(data, 'data');
    }
}

export class FranchiseVendorRoyalty extends BaseModel {
    franchiseName: string;
    franchiseNumber: string;
    reportName: string;
    month: string;
    data: string;
    setData(data) {
        this.setString(data, 'franchiseName');
        this.setString(data, 'franchiseNumber');
        this.setString(data, 'reportName');
        this.setString(data, 'month');
        this.setString(data, 'data');
    }
}

export class SummaryRoyalty extends BaseModel {
    franchiseName: string;
    franchiseNumber: string;
    reportName: string;
    month: string;
    data: string;
    setData(data) {
        this.setString(data, 'franchiseName');
        this.setString(data, 'franchiseNumber');
        this.setString(data, 'reportName');
        this.setString(data, 'month');
        this.setString(data, 'data');
    }
}
