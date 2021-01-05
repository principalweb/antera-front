import { BaseModel } from './base-model';

export class Logistic extends BaseModel {
    id: string;
    [x: string]: any;
    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'orderId');
        this.setString(data, 'orderNo');
        this.setString(data, 'accountId');
        this.setString(data, 'accountName');
        this.setString(data, 'trackingNumber');
        this.setString(data, 'accountName');
        this.setString(data, 'accountId');
        this.setString(data, 'status');
        this.setBoolean(data, 'customsCleared');
        this.setBoolean(data, 'customsAvailable');
        this.setBoolean(data, 'inRoute');
        this.setDate(data, 'cutOffDate');
        this.setDate(data, 'ETD');
        this.setDate(data, 'ETA');
        this.setDate(data, 'ADT');
        this.setDate(data, 'ISF');
        this.setDate(data, 'FRD');
        this.setDate(data, 'ATA');
        this.setDate(data, 'CCD');
        this.setDate(data, 'PUD');
        this.setDate(data, 'PDD');
        this.setDate(data, 'ADD');
        this.setInt(data, 'expectedCartonCount');
        this.setInt(data, 'expectedPieceCount');
        this.setBoolean(data, 'bookingConfirmation');
        this.setDate(data, 'freightAvailableDate');
        this.setDate(data, 'plannedDeliveryDate');
        this.setDate(data, 'actualDeliveryDate');
        this.setString(data, 'comments');
        this.setBoolean(data, 'POD');
        this.setBoolean(data, 'logoRelease');
        this.setBoolean(data, 'qualityExpectationRetail');
        this.setBoolean(data, 'qualityExpectationPromotional');
        this.setString(data, 'cartonMarkings');
        this.setString(data, 'countryOfOriginPlacement');
        this.setString(data, 'modifiedByName');
        this.setString(data, 'modifiedById');
    }
}

export const LogisticStates: ILogisticState[] = [
    {
        stage: 'Pending',
        stageKey: 'Pending'
    },
    {
        stage: 'Confirmed Booked',
        stageKey: 'ConfirmedBooked'
    },
    {
        stage: 'InTransit',
        stageKey: 'InTransit'
    },
    {
        stage: 'Customs',
        stageKey: 'Customs'
    },
    {
        stage: 'Dispatched',
        stageKey: 'Dispatched'
    },
    {
        stage: 'Delivered',
        stageKey: 'Delivered'
    },
];

export interface ILogisticState {
    stage: string;
    stageKey: string;
}