import crypto from 'crypto';
import { JAKARTA_SELATAN_DISTRICTS, JAKARTA_SELATAN_OFFICIAL_HIERARCHY, NATIONAL_PROVINCES, SERVICE_TYPES } from '../src/data/regionsData';
import { User, ServiceReport, UserAuditLog, UserStatus } from '../src/types';

// Relational DB User with Official Kemendagri Scope Codes and Security Fields
export interface DBUser extends User {
  passwordHash: string;
  passwordSalt?: string;
}

// Secure HMAC-SHA256 password hashing helper
export function hashPassword(password: string, salt: string = 'dip_jaksel_salt_2026'): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

// Default hash for legacy demo accounts
export const DEFAULT_DEMO_PASSWORD_HASH = hashPassword('123456');

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

// Generate all 76 official users (65 Kelurahan, 10 Kecamatan, 1 Sudin)
export function generateAllUsers(): DBUser[] {
  const users: DBUser[] = [];
  let kelCounter = 1;
  let kecCounter = 1;
  const initialCreatedDate = '2026-01-01T00:00:00.000Z';

  // 1. SUDIN Administrator
  users.push({
    id: 'user-sudin-1',
    username: 'sudin',
    passwordHash: DEFAULT_DEMO_PASSWORD_HASH,
    name: 'Administrator Sudin Dukcapil Jaksel',
    role: 'SUDIN',
    province: 'DKI Jakarta',
    provinceCode: '31',
    regency: 'Kota Administrasi Jakarta Selatan',
    regencyCode: '31.74',
    scopeCode: '31.74',
    status: 'ACTIVE',
    createdAt: initialCreatedDate,
    lastLoginAt: '2026-08-26T08:30:00.000Z'
  });

  // 2. 10 Kecamatan Users
  JAKARTA_SELATAN_OFFICIAL_HIERARCHY.forEach(dist => {
    const slug = toSlug(dist.name);
    users.push({
      id: `user-kec-${kecCounter++}`,
      username: `kec_${slug}`,
      passwordHash: DEFAULT_DEMO_PASSWORD_HASH,
      name: `Koordinator Pelayanan Kec. ${dist.name}`,
      role: 'KECAMATAN',
      province: 'DKI Jakarta',
      provinceCode: '31',
      regency: 'Kota Administrasi Jakarta Selatan',
      regencyCode: '31.74',
      district: dist.name,
      districtCode: dist.code,
      scopeCode: dist.code,
      status: 'ACTIVE',
      createdAt: initialCreatedDate,
      lastLoginAt: '2026-08-26T07:15:00.000Z'
    });
  });

  // 3. 65 Kelurahan Users
  JAKARTA_SELATAN_OFFICIAL_HIERARCHY.forEach(dist => {
    dist.villages.forEach(vil => {
      const slug = toSlug(vil.name);
      users.push({
        id: `user-kel-${kelCounter++}`,
        username: `kel_${slug}`,
        passwordHash: DEFAULT_DEMO_PASSWORD_HASH,
        name: `Petugas Kelurahan ${vil.name}`,
        role: 'KELURAHAN',
        province: 'DKI Jakarta',
        provinceCode: '31',
        regency: 'Kota Administrasi Jakarta Selatan',
        regencyCode: '31.74',
        district: dist.name,
        districtCode: dist.code,
        village: vil.name,
        villageCode: vil.code,
        scopeCode: vil.code,
        status: 'ACTIVE',
        createdAt: initialCreatedDate,
        lastLoginAt: '2026-08-26T06:45:00.000Z'
      });
    });
  });

  return users;
}

export const usersTable: DBUser[] = generateAllUsers();

// Audit log table for officer management actions
export const auditLogsTable: UserAuditLog[] = [
  {
    id: 'audit-init-1',
    action: 'USER_CREATED',
    performedById: 'user-system',
    performedByUsername: 'system_master',
    targetUserId: 'user-sudin-1',
    targetUsername: 'sudin',
    targetRole: 'SUDIN',
    targetRegion: 'Kota Administrasi Jakarta Selatan (31.74)',
    details: 'Inisialisasi akun Administrator Sudin Dukcapil Jaksel',
    timestamp: '2026-01-01T00:00:00.000Z'
  }
];

// Reports table: cleanly initialized with 0 records after dummy data cleanup
export const reportsTable: ServiceReport[] = [];

