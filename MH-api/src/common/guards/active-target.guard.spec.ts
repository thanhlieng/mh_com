import { BadRequestException, ConflictException, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ActiveTargetGuard } from './active-target.guard';
import {
  EALinkType,
  EATarget,
  UserALinkEntity,
} from 'src/modules/users/entities/user-a-link.entity';
import { UserEntity } from 'src/modules/users/user.entity';

/**
 * Unit tests cho ActiveTargetGuard.
 *
 * Guard đọc header `X-A-Target`, query DB user_a_links, gắn
 * `req.activeContext = { target, accountType, entityIds }`.
 */

interface MockRequest {
  user?: { id?: string };
  headers?: Record<string, string>;
  activeContext?: unknown;
}

const buildExecCtx = (request: MockRequest): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('ActiveTargetGuard', () => {
  let guard: ActiveTargetGuard;
  let userALinkFind: jest.Mock;
  let userQbGetOne: jest.Mock;

  beforeEach(async () => {
    userALinkFind = jest.fn();
    userQbGetOne = jest.fn();

    const dataSourceMock = {
      getRepository: jest.fn((entity: unknown) => {
        if (entity === UserALinkEntity) {
          return { find: userALinkFind };
        }
        if (entity === UserEntity) {
          return {
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getOne: userQbGetOne,
            })),
          };
        }
        return {};
      }),
    } as unknown as DataSource;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActiveTargetGuard,
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    guard = module.get<ActiveTargetGuard>(ActiveTargetGuard);
  });

  afterEach(() => jest.clearAllMocks());

  it('throw BadRequestException khi request.user.id thiếu (JwtAuthGuard chưa chạy)', async () => {
    const ctx = buildExecCtx({ headers: { 'x-a-target': 'mhvn' } });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throw BadRequestException (400) khi header X-A-Target thiếu', async () => {
    const ctx = buildExecCtx({ user: { id: 'u1' }, headers: {} });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throw BadRequestException (400) khi header X-A-Target không hợp lệ', async () => {
    const ctx = buildExecCtx({
      user: { id: 'u1' },
      headers: { 'x-a-target': 'invalid' },
    });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throw ConflictException (409) khi user không có row link cho target', async () => {
    userALinkFind.mockResolvedValue([]);
    const ctx = buildExecCtx({
      user: { id: 'u1' },
      headers: { 'x-a-target': 'mhvn' },
    });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ConflictException);

    expect(userALinkFind).toHaveBeenCalledWith({
      where: { userId: 'u1', aTarget: EATarget.MHVN },
      select: ['aEntityId', 'linkType'],
    });
  });

  it('gắn activeContext với target=mhvn, accountType=supplier, entityIds đúng', async () => {
    userALinkFind.mockResolvedValue([
      { aEntityId: '12', linkType: EALinkType.SUPPLIER },
      { aEntityId: '18', linkType: EALinkType.SUPPLIER },
    ]);
    userQbGetOne.mockResolvedValue({ id: 'u1', accountType: EALinkType.SUPPLIER });

    const request: MockRequest = {
      user: { id: 'u1' },
      headers: { 'x-a-target': 'mhvn' },
    };
    const ctx = buildExecCtx(request);

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(request.activeContext).toEqual({
      target: EATarget.MHVN,
      accountType: EALinkType.SUPPLIER,
      entityIds: ['12', '18'],
    });
  });

  it('gắn activeContext với target=gp khi header viết hoa GP', async () => {
    userALinkFind.mockResolvedValue([
      { aEntityId: '7', linkType: EALinkType.CUSTOMER },
    ]);
    userQbGetOne.mockResolvedValue({ id: 'u1', accountType: EALinkType.CUSTOMER });

    const request: MockRequest = {
      user: { id: 'u1' },
      headers: { 'x-a-target': 'GP' },
    };
    const ctx = buildExecCtx(request);

    await guard.canActivate(ctx);
    expect(request.activeContext).toEqual({
      target: EATarget.GP,
      accountType: EALinkType.CUSTOMER,
      entityIds: ['7'],
    });
  });

  it('fallback accountType từ linkType row đầu khi user.accountType null', async () => {
    userALinkFind.mockResolvedValue([
      { aEntityId: '12', linkType: EALinkType.SUPPLIER },
    ]);
    userQbGetOne.mockResolvedValue({ id: 'u1', accountType: null });

    const request: MockRequest = {
      user: { id: 'u1' },
      headers: { 'x-a-target': 'mhvn' },
    };
    await guard.canActivate(buildExecCtx(request));
    expect((request.activeContext as { accountType: EALinkType }).accountType).toBe(
      EALinkType.SUPPLIER,
    );
  });

  it('throw ConflictException khi link tồn tại nhưng khác accountType (data lệch)', async () => {
    userALinkFind.mockResolvedValue([
      { aEntityId: '12', linkType: EALinkType.SUPPLIER },
    ]);
    userQbGetOne.mockResolvedValue({ id: 'u1', accountType: EALinkType.CUSTOMER });

    const ctx = buildExecCtx({
      user: { id: 'u1' },
      headers: { 'x-a-target': 'mhvn' },
    });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ConflictException);
  });
});
