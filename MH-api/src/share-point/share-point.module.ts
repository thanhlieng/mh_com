import { Module } from '@nestjs/common';
import { SharePointService } from './share-point.service';

@Module({
  providers: [SharePointService],
  exports: [SharePointService],
})
export class SharePointModule {}
