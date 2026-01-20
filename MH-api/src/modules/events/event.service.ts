import { Injectable } from '@nestjs/common';
import { HistoryService } from '../history/history.service';

@Injectable()
export class EventService {
  constructor(private readonly historyService: HistoryService) {}

  async handleSaveHistory(data: any) {
    await this.historyService.create(data);
    return { success: true };
  }
}
