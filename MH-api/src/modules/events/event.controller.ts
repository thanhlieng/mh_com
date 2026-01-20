import { Controller } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventService } from './event.service';
import { EVENT_CONST } from './event.const';
import { ApiTags } from '@nestjs/swagger';

@Controller('event')
@ApiTags('Handle Event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @OnEvent(EVENT_CONST.SAVE_HISTORY)
  handleSaveHistory(data: any) {
    return this.eventService.handleSaveHistory(data);
  }
}
