import { Module } from '@nestjs/common';
import { ActiveLinkModule } from 'src/common/services/active-link.module';
import { AccountLinksController } from './account-links.controller';

@Module({
  imports: [ActiveLinkModule],
  controllers: [AccountLinksController],
})
export class AccountLinksModule {}
