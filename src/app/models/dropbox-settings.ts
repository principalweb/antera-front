import { BaseModel } from './base-model';

export class DropboxSettings extends BaseModel
{

  enableDropbox: string;
  dropboxApiKey: string;
  dropboxSecret: string;
  dropboxToken: string;

  setData(config) {
    this.setBoolean(config, 'enableDropbox');
    this.setString(config, 'dropboxApiKey');
    this.setString(config, 'dropboxSecret');
    this.setString(config, 'dropboxToken');
  }
  toObject() {
    return {
      ...super.toObject(),
    }
  }
}
