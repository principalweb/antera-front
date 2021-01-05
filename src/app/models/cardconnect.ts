import { FuseUtils } from '@fuse/utils';
export class CardConnectBoltCreds
{
    apikey: string;
    hsn: string;
    merchantid: string;
    username: string;
    password: string;
    enabled: boolean;
    testmode: boolean;

    constructor(bolt)
    {
        this.apikey = bolt.apikey || '';
        this.hsn = bolt.hsn || '';
        this.merchantid = bolt.merchantid || '';
        this.username = bolt.username || '';
        this.password = bolt.password || '';
        this.enabled = bolt.enabled || false;
        this.testmode = bolt.testmode || false;
   }
}

export class CardConnectGatewayCreds
{
    username: string;
    password: string;
    enabled: boolean;
    testmode: boolean;
}

export class CardConnectCreds
{
    enabled: boolean;
    merchantid: string;
    username: string;
    password: string;
    sendemail: boolean;
    sandbox: boolean;
    echeck: boolean;

    constructor(creds)
    {
        this.enabled = creds.enabled || false;
        this.merchantid = creds.merchantid || '';
        this.username = creds.username || '';
        this.password = creds.password || '';
        this.sendemail = creds.sendemail || false;
        this.sandbox= creds.sandbox || false;
        this.echeck = creds.echeck || false;
    }
}
