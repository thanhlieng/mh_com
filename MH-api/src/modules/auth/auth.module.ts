import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from 'src/configs/configs.constants';
import { RolesModule } from '../roles/roles.module';
import { UserRepository } from '../users/repositories/user.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokensService } from './token.service';
import { MhcomJwtService } from './mhcom-jwt.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
    RolesModule,
    ConfigModule,
  ],

  controllers: [AuthController],
  providers: [JwtStrategy, AuthService, TokensService, UserRepository, MhcomJwtService],
  exports: [JwtModule, AuthService, MhcomJwtService],
})
export class AuthModule {}
