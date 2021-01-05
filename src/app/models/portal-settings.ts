import { BaseModel } from './base-model';

export class PortalSettings extends BaseModel
{
  enablePortalInvitation: boolean;
  quoteLinkValidity: string

  setData(config) {
    this.setBoolean(config, 'enablePortalInvitation');
    this.setString(config, 'quoteLinkValidity');
  }
  toObject() {
    return {
      ...super.toObject(),
    }
  }
}
