import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import bcrypt from "bcrypt";
import {
  CommonError,
  CommonResponse,
  ETypeUser,
  Status,
} from "src/common/constants/common.constants";
import { UsersRole } from "src/common/constants/user-role.constants";
import { ResponsePagination } from "src/common/dto/response-pagination.dto";
import { CommonPagination } from "src/common/helper/common-pagination";
import { commonResponse } from "src/common/helper/common-response";
import { CommonUpdate } from "src/common/helper/common-update";
import { randomString } from "src/common/helper/helper";
// import { sendRawMessageToEmail } from "src/common/helper/helper"; // Commented out - AWS SES removed
import { generateHash } from "src/common/utils/bcrypt";
import {
  acfConfig,
  // awsConfig, // Commented out - AWS config removed
  nodeEnvConfig,
} from "src/configs/configs.constants";
import { DeleteResult } from "typeorm";
import IJwtPayload, { IHistoryInfo } from "../auth/payloads/jwt-payload";
import { CustomersEntity } from "../customers/entities/customers.entity";
import { EVENT_CONST } from "../events/event.const";
import { HistoryAction, HistoryType } from "../history/history.const";
import { RoleRepository } from "../roles/repositories/role.repository";
import { StaffsEntity } from "../staffs/entities/staffs.entity";
import { AdminResetPassDto, ChangePasswordDto } from "./dto";
import { ChangeRoleDto } from "./dto/change-role.dto";
import { ChangeStatusDto } from "./dto/change-status-user.dto";
import { CreateAccountCustomerDto } from "./dto/create-customer.dto";
import { CreateAccountStaffDto } from "./dto/create-staff.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { EditUserDto } from "./dto/edit-user.dto";
import { GetUsersDto } from "./dto/get-users.dto";
import { UserRepository } from "./repositories/user.repository";
import { UserEntity } from "./user.entity";
import { IUser } from "./user.interface";
import { UsersMessage } from "./users.constants";
import {
  ETemplateEmail,
  GetTemplateEmail,
} from "@constants/templates/get_template_email";
import dayjs from "dayjs";

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UserRepository,
    private roleRepository: RoleRepository,

    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Admin reset password for users.
   */
  async adminResetPassword({ password, userId }: AdminResetPassDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(CommonError.NOT_FOUND_USER);
    }

    const hashPassword = await bcrypt.hash(password, user.salt);
    user.password = hashPassword;
    await user.save();
    return commonResponse(CommonResponse.SUCCESS, null);
  }

  /**
   * Get all users.
   */
  async getUsers(
    getUsersDto: GetUsersDto
  ): Promise<ResponsePagination<UserEntity>> {
    const { search, roleId } = getUsersDto;
    const query = this.usersRepository.createQueryBuilder("user");
    if (roleId) {
      query.andWhere("user.roleId = :roleId", { roleId });
    }
    if (search) {
      query.andWhere("user.username ILIKE :search", { search: `%${search}%` });
    }

    query.addOrderBy("user.createdAt", "DESC");
    return CommonPagination(getUsersDto, query);
  }

  async getUsersFilter(filter: any): Promise<UserEntity[]> {
    return this.usersRepository.find(filter);
  }

  /**
   * Get an User by ID.
   * @param id User ID.
   */
  async findCustomerOrStaffById(id: string): Promise<UserEntity> {
    if (!id) {
      throw new NotFoundException(CommonError.NOT_FOUND_USER);
    }

    const user = await this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndMapOne(
        "user.customer",
        "customers",
        "c",
        "c.user_id = user.id"
      )
      .leftJoinAndMapOne("user.staff", "staffs", "s", "s.user_id = user.id")
      .where("user.id = :id", { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(CommonError.NOT_FOUND_USER);
    }
    return user;
  }

  async findCustomerOrStaffByUsername(username: string): Promise<IUser> {
    const user = await this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndMapOne(
        "user.customer",
        "customers",
        "c",
        "c.user_id = user.id"
      )
      .leftJoinAndMapOne("user.staff", "staffs", "s", "s.user_id = user.id")
      .where("user.username = :username", { username })
      .getOne();

    return user as IUser;
  }

  async getById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException();

    return user;
  }

  /**
   * Get an user by email.
   * @param email User email.
   */
  async getByUsername(username: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      return null;
    }
    return user;
  }

  /**
   * Update an user by ID.
   * @param id User ID.
   * @param editUserDto EditUserDto.
   */
  async update(id: string, editUserDto: EditUserDto): Promise<UserEntity> {
    let existUser = await this.usersRepository.findOne({ where: { id } });
    existUser = CommonUpdate(existUser, editUserDto);
    await existUser.save();
    return existUser;
  }

  /**
   * Create a new user.
   * @param createUserDto CreateUserDto.
   */
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { password, username, roleId } = createUserDto;

    let newUser = new UserEntity();
    newUser.username = username;
    newUser.roleId = roleId;
    newUser.status = Status.ACTIVE;
    if (!newUser.roleId) {
      const roleUser = await this.roleRepository.findByRoleName(UsersRole.USER);
      newUser.roleId = roleUser.id;
    }
    const { salt, hashPassword } = await generateHash(password);
    newUser.salt = salt;
    newUser.password = hashPassword;

    try {
      const user = this.usersRepository.create(newUser);
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === "23505") {
        // Duplicate username.
        throw new ConflictException(UsersMessage.USERNAME_EXIST);
      }
      throw new InternalServerErrorException(error);
    }
  }

  async createCustomer(createAccountCustomerDto: CreateAccountCustomerDto) {
    const roleUser = await this.roleRepository.findByRoleName(UsersRole.USER);
    const createUserDto: CreateUserDto = {
      username: createAccountCustomerDto.username.toLowerCase(),
      password: createAccountCustomerDto.password,
      roleId: roleUser.id,
    };

    const { salt, hashPassword } = await generateHash(
      createAccountCustomerDto.password
    );

    const userEntity = new UserEntity();

    Object.assign(userEntity, createUserDto);
    userEntity.password = hashPassword;
    userEntity.salt = salt;

    const user = await this.usersRepository.save(userEntity);

    const customerEntity = new CustomersEntity();
    Object.assign(customerEntity, createAccountCustomerDto);
    customerEntity.userId = user.id;
    const customer = await customerEntity.save();

    const result = {
      ...customer,
      user,
    };

    return result;
  }

  async createAccountCustomer(
    createAccountCustomerDto: CreateAccountCustomerDto
  ) {
    const roleUser = await this.roleRepository.findByRoleName(UsersRole.USER);

    const createUserDto: CreateUserDto = {
      username: createAccountCustomerDto.username.toLowerCase(),
      password: createAccountCustomerDto.password,
      roleId: roleUser.id,
    };

    const { salt, hashPassword } = await generateHash(
      createAccountCustomerDto.password
    );

    const userEntity = new UserEntity();

    Object.assign(userEntity, createUserDto);
    userEntity.password = hashPassword;
    userEntity.salt = salt;
    userEntity.status = Status.ACTIVE;

    const user = await userEntity.save();

    const customerEntity = new CustomersEntity();
    Object.assign(customerEntity, createAccountCustomerDto);
    customerEntity.userId = user.id;

    const customer = await customerEntity.save();

    const result = {
      ...customer,
      user,
    };

    return result;
  }

  async sendMailAccountToCustomer(
    staffName: string,
    username: string,
    password: string,
    joinDate: string,
    emails: string[]
  ) {
    const html = GetTemplateEmail(ETemplateEmail.MAIL_SEND_CREATE_STAFF, {
      staffName: staffName.toUpperCase(),
      username,
      password,
      joinDate,
    });

    // Email sending commented out - AWS SES removed
    // const params = {
    //   from: awsConfig.emailSend,
    //   to: emails.filter((v) => v).join(","),
    //   subject: `${
    //     nodeEnvConfig === "develop" ? "[MH GREAT SUN-DEVELOP]" : "[MH GREAT SUN]"
    //   } THÔNG TIN NHÂN VIÊN - ${username} - ${staffName}`,
    //   html: html,
    // };

    // await sendRawMessageToEmail(params);
  }

  async createStaff(
    createAccountStaffDto: CreateAccountStaffDto,
    info: IHistoryInfo
  ) {
    const countStaff = await this.usersRepository.count({
      where: {
        type: ETypeUser.STAFF,
      },
    });
    const str = "" + (countStaff + 1);
    const pad = "00000";
    const username = pad.substring(0, pad.length - str.length) + str;
    const password = randomString(10);
    let roleId = createAccountStaffDto.roleId;

    if (!roleId) {
      const roleStaff = await this.roleRepository.findByRoleName(
        UsersRole.STAFF
      );
      roleId = roleStaff.id;
    }

    const { salt, hashPassword } = await generateHash(password);
    const userEntity = this.usersRepository.create({
      username: username,
      roleId: roleId,
    });
    userEntity.password = hashPassword;
    userEntity.salt = salt;
    userEntity.status = createAccountStaffDto.status
      ? createAccountStaffDto.status
      : Status.ACTIVE;
    userEntity.type = ETypeUser.STAFF;
    const user = await userEntity.save();

    const staffEntity = new StaffsEntity();
    Object.assign(staffEntity, createAccountStaffDto);
    staffEntity.userId = user.id;
    staffEntity.staffCode = username;

    const staff = await staffEntity.save();

    const result = {
      ...staff,
      user,
    };

    try {
      this.sendMailAccountToCustomer(
        createAccountStaffDto.fullName,
        username,
        password,
        dayjs(staffEntity.issueInsuranceDate ?? staffEntity.createdAt).format("DD/MM/YYYY"),
        [
          createAccountStaffDto.email,
          createAccountStaffDto.emailCompany,
          'staff@mhgreatsun.vn'
        ]
      );
    } catch (err) {
      console.log("Error send mail create staff", err);
    }

    this.eventEmitter.emit(EVENT_CONST.SAVE_HISTORY, {
      ...info,
      type: HistoryType.Staff,
      action: HistoryAction.Create,
      newItem: staff,
    });

    return result;
  }

  async changePassword(
    payload: IJwtPayload,
    changePasswordDto: ChangePasswordDto
  ) {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(CommonError.PASSWORD_NOT_MATCH);
    }

    const user = await this.getByUsername(payload.username);

    if (!user) {
      throw new NotFoundException(CommonError.NOT_FOUND_USER);
    }

    if (await bcrypt.compare(oldPassword, user.password)) {
      const hashPassword = await bcrypt.hash(newPassword, user.salt);
      user.password = hashPassword;
      await user.save();
      return commonResponse(
        CommonResponse.SUCCESS,
        "Change password successfully"
      );
    } else {
      throw new BadRequestException(CommonError.WRONG_PASSWORD);
    }
  }

  async changeStatus(id: string, changeStatusDto: ChangeStatusDto) {
    const { status } = changeStatusDto;
    const result = await this.usersRepository.update(id, {
      status,
    });

    return result;
  }

  async changeRole(changeRoleDto: ChangeRoleDto) {
    const { roleId, userId } = changeRoleDto;

    const user = await this.getById(userId);
    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
      },
    });

    user.roleId = role.id;

    return await user.save();
  }

  async deleteUserById(id: string): Promise<DeleteResult> {
    const result = await this.usersRepository.delete(id);
    if (result.affected !== 1) {
      throw new NotFoundException(CommonError.NOT_FOUND_USER);
    }
    return result;
  }

  async resetPasswordStaff() {
    const staffs = await this.usersRepository.find({
      where: {
        type: ETypeUser.STAFF,
      },
      order: {
        createdAt: "ASC",
      },
    });

    await Promise.all(
      staffs.map(async (staff) => {
        const newPassword = randomString(10);

        const hashPassword = await bcrypt.hash(newPassword, staff.salt);
        staff.password = hashPassword;
        await staff.save();
      })
    );
  }
}
