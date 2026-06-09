import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { CommonError } from 'src/common/constants/common.constants';
import { jwtConfig } from 'src/configs/configs.constants';
import { TokenTypes } from './constants/token.constant';
import { CreateTokenDto } from './dto/create-token.dto';
import { GenerateTokenInputDto } from './dto/generate-token-input.dto';
import { ResponseTokenDto } from './dto/response-login.dto';
import IJwtPayload from './payloads/jwt-payload';

@Injectable()
export class TokensService {
  constructor(public readonly jwtService: JwtService) {}

  async generateToken(createTokenDto: CreateTokenDto): Promise<ResponseTokenDto> {
    const { type, username, id, permissions, typeUser, a_supplier_id, a_customer_id } = createTokenDto;
    const { refreshExpiresIn, resetPasswordExpiresIn, expiresIn, secret } = jwtConfig;

    let expires: moment.Moment;
    const jwtOptions = {};
    if (type === TokenTypes.ACCESS) {
      expires = moment().add(expiresIn.substring(0, expiresIn.length - 1), 'minutes');
      Object.assign(jwtOptions, { secret, expiresIn });
    } else if (type === TokenTypes.REFRESH) {
      expires = moment().add(refreshExpiresIn.substring(0, refreshExpiresIn.length - 1), 'days');
      Object.assign(jwtOptions, { secret, expiresIn: refreshExpiresIn });
    } else if (type === TokenTypes.RESET_PASSWORD) {
      Object.assign(jwtOptions, { secret, expiresIn: resetPasswordExpiresIn });
      expires = moment().add(resetPasswordExpiresIn.substring(0, resetPasswordExpiresIn.length - 1), 'minutes');
    }
    const payload: IJwtPayload = {
      id,
      username,
      permissions,
      type,
      typeUser,
      a_supplier_id,
      a_customer_id,
    };
    const token = await this.jwtService.signAsync(payload, jwtOptions);

    return {
      token,
      expires: expires.toDate(),
    };
  }

  async verifyToken(token: string, type: string): Promise<any> {
    try {
      const tokenDoc = jwt.decode(token);
      if (!tokenDoc) {
        throw new HttpException(CommonError.TOKEN_NOT_FOUND, HttpStatus.UNAUTHORIZED);
      }
      return tokenDoc;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async generateAuthTokens(generateTokenInputDto: GenerateTokenInputDto) {
    const { id, username, permissions, typeUser, a_supplier_id, a_customer_id } = generateTokenInputDto;

    const accessToken = await this.generateToken({
      id,
      username,
      permissions,
      typeUser,
      a_supplier_id,
      a_customer_id,
      type: TokenTypes.ACCESS,
    });

    const refreshToken = await this.generateToken({
      id,
      username,
      permissions,
      typeUser,
      a_supplier_id,
      a_customer_id,
      type: TokenTypes.REFRESH,
    });

    return {
      access: accessToken,
      refresh: refreshToken,
    };
  }

  // async generateResetPasswordToken(username: string) {
  //   const user = await this.userService.getByUsername(username);
  //   if (!user) {
  //     throw new NotFoundException('No users found with this email');
  //   }
  //   const resetPasswordToken = await this.generateToken({
  //     roleId: user.roleId,
  //     username: user.username,
  //     type: TokenTypes.RESET_PASSWORD,
  //   });
  //   return resetPasswordToken.token;
  // }

  // async generateVerifyEmailToken(user: UserEntity) {
  //   const verifyEmailToken = await this.generateToken({
  //     roleId: user.roleId,
  //     username: user.username,
  //     type: TokenTypes.VERIFY_EMAIL,
  //   });
  //   return verifyEmailToken.token;
  // }
}
