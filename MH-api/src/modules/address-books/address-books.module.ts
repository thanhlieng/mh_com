import { Module } from '@nestjs/common';
import { AddressBookService } from './address-books.service';
import { AddressBookController } from './address-books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressBookEntity } from './entities/address-books.entity';
import { CustomerModule } from '../customers/customers.module';

@Module({
  imports: [TypeOrmModule.forFeature([AddressBookEntity]), CustomerModule],
  providers: [AddressBookService],
  controllers: [AddressBookController],
})
export class AddressBookModule {}
