import { BaseModel } from './base-model';

export class AmazonS3Settings extends BaseModel
{

  s3bucket: string;
  s3Directory: string;
  s3Key: string;
  s3Secret: string;

  setData(config) {
    this.setString(config, 's3bucket');
    this.setString(config, 's3Directory');
    this.setString(config, 's3Key');
    this.setString(config, 's3Secret');
  }
  toObject() {
    return {
      ...super.toObject(),
    }
  }
}
