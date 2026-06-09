import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ECustomerStatus, Status } from 'src/common/constants/common.constants';
import { validateHash } from 'src/common/utils/bcrypt';
import { RolesService } from '../roles/roles.service';
import { ResponseUsersDto } from '../users/dto/response-users.dto';
import { UserRepository } from '../users/repositories/user.repository';
import { IUser } from '../users/user.interface';
import { TokenTypes } from './constants/token.constant';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto, ResponseRefreshTokenDto } from './dto/refresh-token.dto';
import { ResponseLogInDto } from './dto/response-login.dto';
import IJwtPayload from './payloads/jwt-payload';
import { TokensService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokensService,
    private readonly rolesService: RolesService,
  ) {}

  async mappingDataUserReponse(user: IUser): Promise<ResponseUsersDto> {
    const { username, status } = user;
    const permissions = await this.rolesService.getAllPermissionsUser(user);

    return {
      username,
      status,
      typeUser: user.type,
      permissions: permissions,
      a_supplier_id: user.a_supplier_id ?? null,
      a_customer_id: user.a_customer_id ?? null,
    };
  }

  async userLogin(data: LoginDto): Promise<ResponseLogInDto> {
    const user = await this.userRepository.findCustomerOrStaffByUsername(data.username.trim().toLowerCase());

    if (!user) {
      throw new BadRequestException('Account does not exists.');
    }
    const validatePassword = await validateHash(data.password, user.password);
    if (!validatePassword) {
      throw new BadRequestException('Invalid email or password.');
    }

    if (user?.customer?.status === ECustomerStatus.INACTIVE) {
      throw new BadRequestException('Tài khoản không hoạt động. Vui lòng liên hệ admin để được hỗ trợ.');
    }

    if (user?.staff?.status === Status.INACTIVE) {
      throw new BadRequestException('Tài khoản nhân viên đã nghỉ việc. Vui lòng liên hệ admin để được hỗ trợ');
    }

    if (user.status === Status.INACTIVE) {
      throw new BadRequestException('Please contact admin to verify account.');
    }

    const userDataReponse = await this.mappingDataUserReponse(user);
    const tokens = await this.tokenService.generateAuthTokens({
      id: user.id,
      username: user.username,
      typeUser: user.type,
      permissions: userDataReponse.permissions,
      a_supplier_id: user.a_supplier_id ?? undefined,
      a_customer_id: user.a_customer_id ?? undefined,
    });

    return {
      user: userDataReponse,
      tokens,
    };
  }

  async decodeToken(token: string, type: TokenTypes): Promise<any /*ResponseUsersDto*/> {
    const decodedToken: any = await this.tokenService.verifyToken(token, type);
    if (!decodedToken) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }
    return decodedToken;
  }

  async refreshToken({ refreshToken }: RefreshTokenDto): Promise<ResponseRefreshTokenDto> {
    const decodedToken: IJwtPayload = await this.decodeToken(refreshToken, TokenTypes.REFRESH);
    if (decodedToken.type !== TokenTypes.REFRESH) {
      throw new BadRequestException();
    }
    const userDoc = (await this.userRepository.findCustomerOrStaffByUsername(decodedToken.username)) as any;

    const newTokens = await this.tokenService.generateAuthTokens(userDoc);
    const userDataReponse = await this.mappingDataUserReponse(userDoc);

    return {
      user: userDataReponse,
      tokens: newTokens,
    };
  }
}
