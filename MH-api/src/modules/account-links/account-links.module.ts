import { Module } from '@nestjs/common';
import { ActiveLinkModule } from 'src/common/services/active-link.module';
import { AuthModule } from '../auth/auth.module';
import { AccountLinksController } from './account-links.controller';
import { AdminAccountLinksController } from './admin-account-links.controller';

@Module({
  imports: [ActiveLinkModule, AuthModule],
  controllers: [AccountLinksController, AdminAccountLinksController],
})
export class AccountLinksModule {}
