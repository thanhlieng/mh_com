import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { MhvnIntegrationService } from './mhvn-integration.service';
import { MhcomJwtService } from '../auth/mhcom-jwt.service';
import {
  EALinkType,
  EATarget,
} from '../users/entities/user-a-link.entity';
import { ActiveAContext } from 'src/common/guards/active-target.guard';

/**
 * Unit tests cho MhvnIntegrationService.
 *
 * Verify multi-target routing:
 *   - target=mhvn → baseUrl MHVN, mint supplier/customer token với
 *     supplier_ids/customer_ids đúng activeContext.entityIds.
 *   - target=gp → baseUrl GP, token cache không bị share giữa target.
 */

const MHVN_URL = 'https://api.mhvn.local';
const GP_URL = 'https://api.gp.local';

const buildConfigMock = () => {
  return {
    get: jest.fn((key: string) => {
      const env: Record<string, string> = {
        MHVN_API_BASE_URL_MHVN: MHVN_URL,
        MHVN_API_BASE_URL_GP: GP_URL,
      };
      return env[key];
    }),
  } as unknown as ConfigService;
};

const buildJwtServiceMock = () => {
  // Token trả về encode target + accountType + ids để verify trong assert.
  // Format: `tok:{target}:{type}:{ids}`
  return {
    issueSupplierToken: jest.fn(
      (ids: string[], target: EATarget) => `tok:${target}:supplier:${ids.join(',')}`,
    ),
    issueCustomerToken: jest.fn(
      (ids: string[], target: EATarget) => `tok:${target}:customer:${ids.join(',')}`,
    ),
    issueServiceToken: jest.fn(
      (target: EATarget) => `tok:${target}:service:_`,
    ),
  } as unknown as MhcomJwtService;
};

const buildHttpMock = () => {
  return {
    get: jest.fn(() => of({ data: { ok: true } })),
    post: jest.fn(() => of({ data: { ok: true } })),
    put: jest.fn(() => of({ data: { ok: true } })),
    delete: jest.fn(() => of({ data: { ok: true } })),
    patch: jest.fn(() => of({ data: { ok: true } })),
  } as unknown as HttpService;
};

describe('MhvnIntegrationService — multi-target routing', () => {
  let service: MhvnIntegrationService;
  let httpService: HttpService;
  let jwtService: MhcomJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MhvnIntegrationService,
        { provide: HttpService, useValue: buildHttpMock() },
        { provide: ConfigService, useValue: buildConfigMock() },
        { provide: MhcomJwtService, useValue: buildJwtServiceMock() },
      ],
    }).compile();

    service = module.get<MhvnIntegrationService>(MhvnIntegrationService);
    httpService = module.get<HttpService>(HttpService);
    jwtService = module.get<MhcomJwtService>(MhcomJwtService);
  });

  afterEach(() => jest.clearAllMocks());

  it('callMhvn target=mhvn → URL MHVN, token supplier với ids đúng', async () => {
    const activeContext: ActiveAContext = {
      target: EATarget.MHVN,
      accountType: EALinkType.SUPPLIER,
      entityIds: ['12', '18'],
    };

    await service.callMhvn({
      method: 'GET',
      endpoint: '/api/supplier/transactions',
      activeContext,
    });

    expect(jwtService.issueSupplierToken).toHaveBeenCalledWith(
      ['12', '18'],
      EATarget.MHVN,
    );
    expect(httpService.get).toHaveBeenCalledWith(
      `${MHVN_URL}/api/supplier/transactions`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok:mhvn:supplier:12,18',
        }),
      }),
    );
  });

  it('callMhvn target=gp → URL GP, token supplier với ids đúng', async () => {
    const activeContext: ActiveAContext = {
      target: EATarget.GP,
      accountType: EALinkType.SUPPLIER,
      entityIds: ['7'],
    };

    await service.callMhvn({
      method: 'GET',
      endpoint: '/api/supplier/transactions',
      activeContext,
    });

    expect(jwtService.issueSupplierToken).toHaveBeenCalledWith(
      ['7'],
      EATarget.GP,
    );
    expect(httpService.get).toHaveBeenCalledWith(
      `${GP_URL}/api/supplier/transactions`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok:gp:supplier:7',
        }),
      }),
    );
  });

  it('callMhvn với customer accountType → mint customer token', async () => {
    const activeContext: ActiveAContext = {
      target: EATarget.GP,
      accountType: EALinkType.CUSTOMER,
      entityIds: ['9', '10'],
    };

    await service.callMhvn({
      method: 'GET',
      endpoint: '/api/bangke',
      activeContext,
    });

    expect(jwtService.issueCustomerToken).toHaveBeenCalledWith(
      ['9', '10'],
      EATarget.GP,
    );
    expect(jwtService.issueSupplierToken).not.toHaveBeenCalled();
    expect(httpService.get).toHaveBeenCalledWith(
      `${GP_URL}/api/bangke`,
      expect.any(Object),
    );
  });

  it('callMhvn không activeContext nhưng có target → dùng service token', async () => {
    await service.callMhvn({
      method: 'GET',
      endpoint: '/api/directory/suppliers',
      target: EATarget.MHVN,
    });

    expect(jwtService.issueServiceToken).toHaveBeenCalledWith(EATarget.MHVN);
    expect(httpService.get).toHaveBeenCalledWith(
      `${MHVN_URL}/api/directory/suppliers`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok:mhvn:service:_',
        }),
      }),
    );
  });

  it('callMhvn thiếu cả activeContext và target → throw BadRequest', async () => {
    await expect(
      service.callMhvn({
        method: 'GET',
        endpoint: '/api/anything',
      }),
    ).rejects.toThrow();
  });

  it('POST với data đi qua đúng baseUrl và token theo target', async () => {
    const activeContext: ActiveAContext = {
      target: EATarget.GP,
      accountType: EALinkType.SUPPLIER,
      entityIds: ['5'],
    };

    await service.callMhvn({
      method: 'POST',
      endpoint: '/api/supplier/change-requests',
      data: { foo: 'bar' },
      activeContext,
    });

    expect(httpService.post).toHaveBeenCalledWith(
      `${GP_URL}/api/supplier/change-requests`,
      { foo: 'bar' },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok:gp:supplier:5',
        }),
      }),
    );
  });

  it('gọi mhvn và gp liên tiếp KHÔNG share token (verify route đúng theo target)', async () => {
    const ctxMhvn: ActiveAContext = {
      target: EATarget.MHVN,
      accountType: EALinkType.SUPPLIER,
      entityIds: ['12'],
    };
    const ctxGp: ActiveAContext = {
      target: EATarget.GP,
      accountType: EALinkType.SUPPLIER,
      entityIds: ['7'],
    };

    await service.callMhvn({
      method: 'GET',
      endpoint: '/api/x',
      activeContext: ctxMhvn,
    });
    await service.callMhvn({
      method: 'GET',
      endpoint: '/api/x',
      activeContext: ctxGp,
    });

    // 2 lần gọi với target khác — token Authorization khác.
    const calls = (httpService.get as jest.Mock).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toBe(`${MHVN_URL}/api/x`);
    expect(calls[0][1].headers.Authorization).toBe('Bearer tok:mhvn:supplier:12');
    expect(calls[1][0]).toBe(`${GP_URL}/api/x`);
    expect(calls[1][1].headers.Authorization).toBe('Bearer tok:gp:supplier:7');
  });
});

describe('MhvnIntegrationService — config validation', () => {
  it('throw khi thiếu MHVN_API_BASE_URL_MHVN (và không có legacy)', async () => {
    await expect(
      Test.createTestingModule({
        providers: [
          MhvnIntegrationService,
          { provide: HttpService, useValue: buildHttpMock() },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((k: string) =>
                k === 'MHVN_API_BASE_URL_GP' ? GP_URL : undefined,
              ),
            },
          },
          { provide: MhcomJwtService, useValue: buildJwtServiceMock() },
        ],
      }).compile(),
    ).rejects.toThrow(/MHVN_API_BASE_URL_MHVN/);
  });

  it('cho phép fallback dùng MHVN_API_BASE_URL legacy cho cả 2 target', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MhvnIntegrationService,
        { provide: HttpService, useValue: buildHttpMock() },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((k: string) =>
              k === 'MHVN_API_BASE_URL' ? 'https://legacy.local' : undefined,
            ),
          },
        },
        { provide: MhcomJwtService, useValue: buildJwtServiceMock() },
      ],
    }).compile();

    const svc = moduleRef.get<MhvnIntegrationService>(MhvnIntegrationService);
    const http = moduleRef.get<HttpService>(HttpService);

    await svc.callMhvn({
      method: 'GET',
      endpoint: '/x',
      target: EATarget.MHVN,
    });
    await svc.callMhvn({
      method: 'GET',
      endpoint: '/x',
      target: EATarget.GP,
    });

    const calls = (http.get as jest.Mock).mock.calls;
    expect(calls[0][0]).toBe('https://legacy.local/x');
    expect(calls[1][0]).toBe('https://legacy.local/x');
  });
});
