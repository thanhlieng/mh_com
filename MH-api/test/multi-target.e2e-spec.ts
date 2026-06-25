import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';
import request = require('supertest');
import { of } from 'rxjs';

import { SupplierTransactionsController } from '../src/modules/supplier-transactions/supplier-transactions.controller';
import { SupplierCostStatementExportController } from '../src/modules/supplier-transactions/supplier-cost-statement-export.controller';
import { SupplierTransactionsService } from '../src/modules/supplier-transactions/supplier-transactions.service';
import { AccountLinksController } from '../src/modules/account-links/account-links.controller';
import { ActiveLinkService } from '../src/common/services/active-link.service';
import { MhvnIntegrationService } from '../src/modules/mhvn-integration/mhvn-integration.service';
import { MhcomJwtService } from '../src/modules/auth/mhcom-jwt.service';
import { ActiveTargetGuard } from '../src/common/guards/active-target.guard';
import { JwtAuthGuard } from '../src/common/guards/jwt.guard';
import {
  EALinkType,
  EATarget,
  UserALinkEntity,
} from '../src/modules/users/entities/user-a-link.entity';
import { UserEntity } from '../src/modules/users/user.entity';

/**
 * Integration tests cho multi-target A integration.
 *
 * Mục tiêu: chứng minh end-to-end (HTTP → controller → guard → service → A proxy)
 * rằng `X-A-Target` route đúng baseUrl + token, và 400/409 trả về đúng case.
 *
 * Lưu ý: không boot full AppModule (yêu cầu PostgreSQL thật). Thay vào đó dựng
 * mini-module với DataSource và HttpService được mock + override JwtAuthGuard.
 */

// Test fixture: 1 user supplier liên kết mhvn=[12,18] và gp=[7].
const TEST_USER_ID = 'user-supplier-1';

interface SeededLink {
  userId: string;
  aTarget: EATarget;
  linkType: EALinkType;
  aEntityId: string;
}

const buildSeed = (): SeededLink[] => [
  { userId: TEST_USER_ID, aTarget: EATarget.MHVN, linkType: EALinkType.SUPPLIER, aEntityId: '12' },
  { userId: TEST_USER_ID, aTarget: EATarget.MHVN, linkType: EALinkType.SUPPLIER, aEntityId: '18' },
  { userId: TEST_USER_ID, aTarget: EATarget.GP, linkType: EALinkType.SUPPLIER, aEntityId: '7' },
];

const buildDataSourceMock = (seed: SeededLink[]): DataSource => {
  return {
    getRepository: (entity: unknown) => {
      if (entity === UserALinkEntity) {
        return {
          find: async (opts: { where: { userId: string; aTarget?: EATarget } }) => {
            const { userId, aTarget } = opts.where;
            return seed
              .filter((r) => r.userId === userId && (!aTarget || r.aTarget === aTarget))
              .map((r) => ({
                aTarget: r.aTarget,
                aEntityId: r.aEntityId,
                linkType: r.linkType,
              }));
          },
        };
      }
      if (entity === UserEntity) {
        return {
          createQueryBuilder: () => ({
            select: function () {
              return this;
            },
            where: function () {
              return this;
            },
            getOne: async () => ({
              id: TEST_USER_ID,
              accountType: EALinkType.SUPPLIER,
            }),
          }),
        };
      }
      return {};
    },
  } as unknown as DataSource;
};

// Stub JwtAuthGuard: gắn user fix sẵn vào request.
class StubJwtAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    req.user = { id: TEST_USER_ID };
    return true;
  }
}

describe('Multi-target A integration (e2e)', () => {
  let app: INestApplication;
  let httpMock: { get: jest.Mock; post: jest.Mock; put: jest.Mock; delete: jest.Mock; patch: jest.Mock };
  let dataSource: DataSource;

  const buildApp = async (seed: SeededLink[]) => {
    dataSource = buildDataSourceMock(seed);
    httpMock = {
      get: jest.fn(() => of({ data: { ok: true, source: 'mock' } })),
      post: jest.fn(() => of({ data: { ok: true } })),
      put: jest.fn(() => of({ data: { ok: true } })),
      delete: jest.fn(() => of({ data: { ok: true } })),
      patch: jest.fn(() => of({ data: { ok: true } })),
    };

    const jwtServiceMock = {
      issueSupplierToken: jest.fn(
        (ids: string[], target: EATarget) => `supplier-${target}-${ids.join(',')}`,
      ),
      issueCustomerToken: jest.fn(
        (ids: string[], target: EATarget) => `customer-${target}-${ids.join(',')}`,
      ),
      issueServiceToken: jest.fn((target: EATarget) => `service-${target}`),
    };

    const mhvnIntegrationMock = new MhvnIntegrationService(
      httpMock as unknown as HttpService,
      // ConfigService mock cho 2 baseUrl khác nhau
      {
        get: (k: string) =>
          ({
            MHVN_API_BASE_URL_MHVN: 'https://api.mhvn.local',
            MHVN_API_BASE_URL_GP: 'https://api.gp.local',
          })[k],
      } as never,
      jwtServiceMock as unknown as MhcomJwtService,
    );

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [
        SupplierTransactionsController,
        SupplierCostStatementExportController,
        AccountLinksController,
      ],
      providers: [
        SupplierTransactionsService,
        ActiveLinkService,
        ActiveTargetGuard,
        { provide: DataSource, useValue: dataSource },
        { provide: MhvnIntegrationService, useValue: mhvnIntegrationMock },
        { provide: MhcomJwtService, useValue: jwtServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(StubJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  };

  afterEach(async () => {
    if (app) await app.close();
    jest.clearAllMocks();
  });

  describe('GET /api/account/a-targets', () => {
    it('trả 200 với account_type=supplier và 2 target mhvn+gp', async () => {
      await buildApp(buildSeed());

      const res = await request(app.getHttpServer())
        .get('/api/account/a-targets')
        .expect(200);

      expect(res.body).toEqual({
        account_type: 'supplier',
        targets: expect.arrayContaining([
          { a_target: 'mhvn', entity_ids: ['12', '18'] },
          { a_target: 'gp', entity_ids: ['7'] },
        ]),
      });
      expect(res.body.targets).toHaveLength(2);
    });
  });

  describe('GET /api/supplier/transactions — X-A-Target routing', () => {
    it('400 khi thiếu header X-A-Target', async () => {
      await buildApp(buildSeed());

      await request(app.getHttpServer())
        .get('/api/supplier/transactions')
        .expect(400);

      expect(httpMock.get).not.toHaveBeenCalled();
    });

    it('400 khi header X-A-Target không hợp lệ', async () => {
      await buildApp(buildSeed());

      await request(app.getHttpServer())
        .get('/api/supplier/transactions')
        .set('X-A-Target', 'invalid')
        .expect(400);
    });

    it('X-A-Target=mhvn → request đi đúng baseUrl mhvn với supplier_ids [12,18]', async () => {
      await buildApp(buildSeed());

      const res = await request(app.getHttpServer())
        .get('/api/supplier/transactions')
        .set('X-A-Target', 'mhvn')
        .expect(200);

      expect(res.body.ok).toBe(true);
      expect(httpMock.get).toHaveBeenCalledTimes(1);
      const [calledUrl, calledCfg] = httpMock.get.mock.calls[0];
      expect(calledUrl).toBe(
        'https://api.mhvn.local/api/mhcom/supplier/transactions/',
      );
      expect(calledCfg.headers.Authorization).toBe('Bearer supplier-mhvn-12,18');
    });

    it('X-A-Target=gp → request đi đúng baseUrl gp với supplier_ids [7]', async () => {
      await buildApp(buildSeed());

      await request(app.getHttpServer())
        .get('/api/supplier/transactions')
        .set('X-A-Target', 'gp')
        .expect(200);

      expect(httpMock.get).toHaveBeenCalledTimes(1);
      const [calledUrl, calledCfg] = httpMock.get.mock.calls[0];
      expect(calledUrl).toBe(
        'https://api.gp.local/api/mhcom/supplier/transactions/',
      );
      expect(calledCfg.headers.Authorization).toBe('Bearer supplier-gp-7');
    });

    it('409 khi user gửi X-A-Target=gp nhưng KHÔNG có link gp', async () => {
      // Seed chỉ có mhvn — không có gp.
      const seedMhvnOnly: SeededLink[] = [
        {
          userId: TEST_USER_ID,
          aTarget: EATarget.MHVN,
          linkType: EALinkType.SUPPLIER,
          aEntityId: '12',
        },
      ];
      await buildApp(seedMhvnOnly);

      await request(app.getHttpServer())
        .get('/api/supplier/transactions')
        .set('X-A-Target', 'gp')
        .expect(409);

      expect(httpMock.get).not.toHaveBeenCalled();
    });

    it('query string được forward qua endpoint A đúng', async () => {
      await buildApp(buildSeed());

      await request(app.getHttpServer())
        .get('/api/supplier/transactions?start_date=2026-01-01&end_date=2026-01-31&q=ABC')
        .set('X-A-Target', 'mhvn')
        .expect(200);

      const [calledUrl] = httpMock.get.mock.calls[0];
      expect(calledUrl).toContain('start_date=2026-01-01');
      expect(calledUrl).toContain('end_date=2026-01-31');
      expect(calledUrl).toContain('q=ABC');
    });
  });
});
