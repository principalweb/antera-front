import { BaseModel } from './base-model';

export class Artwork extends BaseModel
{
    id: string;
    identity: string;
    designId: string;
    designNo: string;
    designTypeId: string;
    designTypeName: string;
    orderId: string;
    orderNum: string;
    orderIdentity: string;
    assignedId: string;
    assignee: string;
    avatar: string;
    customerId: string;
    customerName: string;
    priority: string;
    statusId: string;
    statusName: string;
    statusLabel: string;
    category: string;
    color: string;
    url: string;
    size: string;
    notes: string;
    salesRep: string;
    salesRepId: string;
    dueDate: Date;
    createdDate: Date;
    estimated: number;
    featureImage : string;
    thumbnail : string;
    image: string;
    design: Design;
    moveArtworkFromOrder : string;
    fileName : string;
    artworkContactId: string;
    artworkContactName: string;
    artworkContactEmail: string;
    royaltyRetail: string;
    royaltyRetailAmountType: string;
    royaltyWholesale: string;
    royaltyWholesaleAmountType: string;
    projectId: string;
    projectName: string;
    pinned: boolean;
    relatedOrders: any[];
    usageStatus : string;
    dateApproved: string;
    approvedBy : string;
    

    setData(artwork) {
        this.setString(artwork, 'id');
        this.setString(artwork, 'identity');
        this.setString(artwork, 'designId')
        this.setString(artwork, 'designNo', 'Auto Generated');
        this.setString(artwork, 'designTypeId');
        this.setString(artwork, 'designTypeName');
        this.setString(artwork, 'orderId');
        this.setString(artwork, 'orderNum');
        this.setString(artwork, 'orderIdentity');
        this.setString(artwork, 'assignedId');
        this.setString(artwork, 'assignee');
        this.setString(artwork, 'avatar');
        this.setString(artwork, 'customerId');
        this.setString(artwork, 'customerName');
        this.setString(artwork, 'priority');
        this.setString(artwork, 'statusId');
        this.setString(artwork, 'statusName');
        this.setString(artwork, 'statusLabel');
        this.setString(artwork, 'category');
        this.setString(artwork, 'color');
        this.setString(artwork, 'url');
        this.setString(artwork, 'size');
        this.setString(artwork, 'notes');
        this.setString(artwork, 'salesRep');
        this.setString(artwork, 'salesRepId');
        this.setDate(artwork, 'dueDate');
        this.setDate(artwork, 'createdDate');
        this.setFloat(artwork, 'estimated');
        this.setString(artwork, 'category');
        this.setString(artwork, 'featureImage');
        this.setString(artwork, 'thumbnail');
        this.setString(artwork, 'image');
        this.setString(artwork, 'moveArtworkFromOrder');
        this.setString(artwork, 'fileName');
        this.setString(artwork, 'artworkContactId');
        this.setString(artwork, 'artworkContactName');
        this.setString(artwork, 'artworkContactEmail');
        this.setString(artwork, 'royaltyRetail');
        this.setString(artwork, 'royaltyRetailAmountType');
        this.setString(artwork, 'royaltyWholesale');
        this.setString(artwork, 'royaltyWholesaleAmountType');
        this.setString(artwork, 'projectId');
        this.setString(artwork, 'projectName');
        this.design = new Design(artwork.design || {});
        this.setBoolean(artwork, 'pinned');
        this.setArray(artwork, 'relatedOrders');
        this.setString(artwork, 'usageStatus');
        this.setString(artwork, 'dateApproved');
        this.setString(artwork, 'approvedBy');
    }

    updateBasics(data) {
        this.update(data);
        if (this.designNo === 'Auto Generated') {
            this.designNo = '';
        }
    }
}

export class ArtworkDescription extends BaseModel {
    No: number;
    Description: string;
    Stitches: number;

    setData(data) {
        this.setInt(data, 'No');
        this.setString(data, 'Description');
        this.setInt(data, 'Stitches');
    }
}

export class ColorThread extends BaseModel {
    No: number;
    Color: string;
    ThreadPMS: string;
    Description: string;

    setData(data) {
        this.setInt(data, 'No');
        this.setString(data, 'Color');
        this.setString(data, 'ThreadPMS');
        this.setString(data, 'Description');
    }
}

export class ArtworkVariation extends BaseModel {
    design_variation_unique_id: string;
    design_variation_title: string;
    itemImage: string[];
    itemImageThumbnail: string[];
    design_variation_product: string;
    design_variation_color: string;
    design_variation_location: string;
    design_color_thread_pms: ColorThread[];
    design_note: string;

    setData(data) {
        this.setString(data, 'design_variation_unique_id');
        this.setString(data, 'design_variation_title');
        this.setArray(data, 'itemImage');
        this.setArray(data, 'itemImageThumbnail');
        this.setString(data, 'design_variation_product');
        this.setString(data, 'design_variation_color');
        this.setString(data, 'design_variation_location');
        this.setString(data, 'design_note');
        this.setArray(data, 'design_color_thread_pms', (val) => new ColorThread(val));
    }
}

export class Design extends BaseModel {
    color: string;
    colorThread: number;
    customerId: string;
    customerName: string;
    dateCreated: Date;
    dateModified: Date;
    deleted: boolean;
    description: string;
    designDescriptionStitches: ArtworkDescription[];
    designFormType: string;
    designImages: string[];
    designType: string;
    decoVendorId: string;
    decoVendorName: string;
    id: string;
    isMaster: boolean;
    location: string;
    model: string;
    name: string;
    notes: string;
    orderNumbers: string;
    relatedOrders: any[];
    savedToDisk: string;
    size: string;
    stitchCount: number;
    typeFiles: string;
    url: string;
    variation: ArtworkVariation[];

    setData(data) {
        this.setString(data, 'color');
        this.setInt(data, 'colorThread');
        this.setString(data, 'customerId');
        this.setString(data, 'customerName');
        this.setDate(data, 'dateCreated');
        this.setDate(data, 'dateModified');
        this.setBoolean(data, 'deleted');
        this.setString(data, 'description');
        this.setArray(data, 'designDescriptionStitches', (val) => new ArtworkDescription(val));
        this.setString(data, 'designFormType');
        this.setArray(data, 'designImages');
        this.setArray(data, 'designImagesThumbnail');
        this.setString(data, 'designType');
        this.setString(data, 'decoVendorId');
        this.setString(data, 'decoVendorName');
        this.setString(data, 'id');
        this.setBoolean(data, 'isMaster');
        this.setString(data, 'location');
        this.setString(data, 'model');
        this.setString(data, 'name');
        this.setString(data, 'notes');
        this.setString(data, 'orderNumbers');
        this.setArray(data, 'relatedOrders');
        this.setString(data, 'savedToDisk');
        this.setString(data, 'size');
        this.setInt(data, 'stitchCount');
        this.setString(data, 'typeFiles');
        this.setString(data, 'url');
        this.setArray(data, 'variation', (val) => new ArtworkVariation(val));
    }
}
