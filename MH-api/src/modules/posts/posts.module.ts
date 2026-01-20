import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsEntity } from './entities/posts.entity';
import { RolesModule } from '../roles/roles.module';
import { CategoriesPostEntity } from './entities/categories-post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsEntity, CategoriesPostEntity]),
    RolesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
