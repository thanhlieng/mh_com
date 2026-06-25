import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { decode, verify } from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { MhcomJwtService } from './mhcom-jwt.service';
import { EATarget } from '../users/entities/user-a-link.entity';

/**
 * Unit tests cho MhcomJwtService.
 *
 * Mục tiêu: verify multi-target JWT minting — claim mảng
 * (`supplier_ids`/`customer_ids`), service token cache theo target,
 * và fallback legacy `MHCOM_PRIVATE_KEY_PATH` khi không có per-target key.
 */

// Helper sinh RSA key tạm thời để test (tránh phụ thuộc cert có sẵn).
const generateRsaKeyPair = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crypto = require('crypto');
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  }) as { publicKey: string; privateKey: string };
};

const writeKeyToTmp = (key: string, name: string): string => {
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'mhcom-jwt-'));
  const file = path.join(dir, name);
  fs.writeFileSync(file, key, 'utf-8');
  return file;
};

interface KeyPaths {
  mhvnPriv: string;
  mhvnPub: string;
  gpPriv: string;
  gpPub: string;
}

const setupKeys = (): KeyPaths => {
  const mhvn = generateRsaKeyPair();
  const gp = generateRsaKeyPair();
  return {
    mhvnPriv: writeKeyToTmp(mhvn.privateKey, 'mhvn-priv.pem'),
    mhvnPub: mhvn.publicKey,
    gpPriv: writeKeyToTmp(gp.privateKey, 'gp-priv.pem'),
    gpPub: gp.publicKey,
  };
};

const buildConfigMock = (env: Record<string, string | undefined>): ConfigService => {
  return {
    get: jest.fn((key: string) => env[key]),
  } as unknown as ConfigService;
};

describe('MhcomJwtService', () => {
  let keys: KeyPaths;

  beforeAll(() => {
    keys = setupKeys();
  });

  describe('with per-target keys (MHVN + GP)', () => {
    let service: MhcomJwtService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MhcomJwtService,
          {
            provide: ConfigService,
            useValue: buildConfigMock({
              MHCOM_PRIVATE_KEY_PATH_MHVN: keys.mhvnPriv,
              MHCOM_PRIVATE_KEY_PATH_GP: keys.gpPriv,
            }),
          },
        ],
      }).compile();

      service = module.get<MhcomJwtService>(MhcomJwtService);
    });

    it('issueSupplierToken trả về JWT với claim supplier_ids đúng, sub=id đầu, aud=mhvn', () => {
      const token = service.issueSupplierToken(['12', '18'], EATarget.MHVN);
      const decoded = decode(token) as Record<string, unknown>;

      expect(decoded.iss).toBe('mhcom');
      expect(decoded.aud).toBe('mhvn');
      expect(decoded.type).toBe('supplier');
      expect(decoded.sub).toBe('12');
      expect(decoded.supplier_ids).toEqual(['12', '18']);
      expect(typeof decoded.exp).toBe('number');
    });

    it('issueCustomerToken trả về JWT với claim customer_ids đúng', () => {
      const token = service.issueCustomerToken(['7'], EATarget.GP);
      const decoded = decode(token) as Record<string, unknown>;

      expect(decoded.iss).toBe('mhcom');
      expect(decoded.aud).toBe('mhvn');
      expect(decoded.type).toBe('customer');
      expect(decoded.sub).toBe('7');
      expect(decoded.customer_ids).toEqual(['7']);
    });

    it('supplier token issued cho target mhvn verify bằng public key mhvn, không verify bằng public key gp', () => {
      const token = service.issueSupplierToken(['12'], EATarget.MHVN);
      expect(() =>
        verify(token, keys.mhvnPub, { algorithms: ['RS256'] }),
      ).not.toThrow();
      expect(() =>
        verify(token, keys.gpPub, { algorithms: ['RS256'] }),
      ).toThrow();
    });

    it('supplier token issued cho target gp verify bằng public key gp, không verify bằng public key mhvn', () => {
      const token = service.issueSupplierToken(['7'], EATarget.GP);
      expect(() =>
        verify(token, keys.gpPub, { algorithms: ['RS256'] }),
      ).not.toThrow();
      expect(() =>
        verify(token, keys.mhvnPub, { algorithms: ['RS256'] }),
      ).toThrow();
    });

    it('issueServiceToken cache theo target — gọi 2 lần cùng target trả cùng token', () => {
      const t1 = service.issueServiceToken(EATarget.MHVN);
      const t2 = service.issueServiceToken(EATarget.MHVN);
      expect(t1).toBe(t2);
    });

    it('issueServiceToken trả về token KHÁC giữa các target (cache key riêng)', () => {
      const tMhvn = service.issueServiceToken(EATarget.MHVN);
      const tGp = service.issueServiceToken(EATarget.GP);
      expect(tMhvn).not.toBe(tGp);

      // Cross-verify: token mhvn không verify được bằng key gp và ngược lại.
      expect(() => verify(tMhvn, keys.gpPub, { algorithms: ['RS256'] })).toThrow();
      expect(() => verify(tGp, keys.mhvnPub, { algorithms: ['RS256'] })).toThrow();
    });

    it('issueSupplierToken throw ConflictException khi mảng id rỗng', () => {
      expect(() => service.issueSupplierToken([], EATarget.MHVN)).toThrow(
        /chưa được liên kết với supplier/i,
      );
    });

    it('issueCustomerToken throw ConflictException khi mảng id rỗng', () => {
      expect(() => service.issueCustomerToken([], EATarget.MHVN)).toThrow(
        /chưa được liên kết với khách hàng/i,
      );
    });

    it('loại bỏ id rỗng / whitespace trước khi mint (`["12", " ", ""]` → sub=12)', () => {
      const token = service.issueSupplierToken(['12', ' ', ''], EATarget.MHVN);
      const decoded = decode(token) as Record<string, unknown>;
      expect(decoded.supplier_ids).toEqual(['12']);
      expect(decoded.sub).toBe('12');
    });
  });

  describe('with legacy MHCOM_PRIVATE_KEY_PATH (fallback)', () => {
    let service: MhcomJwtService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MhcomJwtService,
          {
            provide: ConfigService,
            useValue: buildConfigMock({
              MHCOM_PRIVATE_KEY_PATH: keys.mhvnPriv, // dùng chung 1 key
            }),
          },
        ],
      }).compile();

      service = module.get<MhcomJwtService>(MhcomJwtService);
    });

    it('không throw khi chỉ có legacy key — cả 2 target dùng cùng key', () => {
      const tMhvn = service.issueSupplierToken(['12'], EATarget.MHVN);
      const tGp = service.issueSupplierToken(['7'], EATarget.GP);

      // Cả hai đều verify được bằng cùng 1 public key.
      expect(() =>
        verify(tMhvn, keys.mhvnPub, { algorithms: ['RS256'] }),
      ).not.toThrow();
      expect(() =>
        verify(tGp, keys.mhvnPub, { algorithms: ['RS256'] }),
      ).not.toThrow();
    });
  });

  describe('with missing key config', () => {
    it('throw khi không có bất kỳ env nào cho mhvn', async () => {
      await expect(
        Test.createTestingModule({
          providers: [
            MhcomJwtService,
            {
              provide: ConfigService,
              useValue: buildConfigMock({
                // chỉ set gp, thiếu cả mhvn + legacy
                MHCOM_PRIVATE_KEY_PATH_GP: keys.gpPriv,
              }),
            },
          ],
        }).compile(),
      ).rejects.toThrow(/MHCOM_PRIVATE_KEY_PATH_MHVN/);
    });
  });
});
