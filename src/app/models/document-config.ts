import { BaseModel } from './base-model';

export class DocumentConfig extends BaseModel
{
  artworkProofEmailAddress: string;
  artworkProofFax: string;

  setData(config) {
    this.setString(config, 'artworkProofEmailAddress');
    this.setString(config, 'artworkProofFax');
  }

}
