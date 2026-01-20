import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { Injectable } from '@nestjs/common';
import { sharePointConfig } from 'src/configs/configs.constants';
import 'isomorphic-fetch';

@Injectable()
export class SharePointService {
  private client: Client;

  constructor() {
    const creds = new ClientSecretCredential(
      sharePointConfig.tenantId,
      sharePointConfig.clientId,
      sharePointConfig.clientSecret,
    );

    this.client = Client.init({
      authProvider: async () => {
        const token = await creds.getToken(
          'https://graph.microsoft.com/.default',
        );
        console.log(token);
        return token.token;
      },
    });
  }

  async uploadFileToSharePoint(
    fileData: any,
    siteId: string,
    filePath: string,
  ): Promise<void> {
    console.log(this.client);

    const response = await this.client
      .api(`/sites/${siteId}/drive/root:/${filePath}:/content`)
      .put(fileData);
    console.log(response);

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Upload failed: ${errorBody.error.message}`);
    }
    console.log('File uploaded successfully');
  }
}
