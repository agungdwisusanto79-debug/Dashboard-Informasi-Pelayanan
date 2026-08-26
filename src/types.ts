export type UserRole = 'KELURAHAN' | 'KECAMATAN' | 'SUDIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  province: string;
  provinceCode?: string;
  regency: string; // Kota Administrasi
  regencyCode?: string;
  district?: string; // Kecamatan
  districtCode?: string;
  village?: string; // Kelurahan
  villageCode?: string;
  scopeCode?: string; // Primary Scope Code (e.g. 31.74 / 31.74.06 / 31.74.06.1003)
  status?: UserStatus;
  createdAt?: string;
  lastLoginAt?: string;
  requirePasswordChange?: boolean;
  avatarUrl?: string;
}

export interface UserAuditLog {
  id: string;
  action: 'USER_CREATED' | 'USER_UPDATED' | 'USER_ACTIVATED' | 'USER_DEACTIVATED' | 'USER_PASSWORD_RESET' | 'USER_PASSWORD_CHANGED';
  performedById: string;
  performedByUsername: string;
  targetUserId: string;
  targetUsername: string;
  targetRole: string;
  targetRegion: string;
  details: string;
  timestamp: string;
}

export interface ServiceType {
  id: string;
  name: string;
  code: string;
  iconName: string;
  category: 'Kependudukan' | 'Pencatatan Sipil' | 'Mutasi Penduduk' | 'Identitas Digital';
}

export interface DemographicGender {
  male: number;
  female: number;
}

export interface DemographicSHDK {
  kepalaKeluarga: number;
  istri: number;
  anak: number;
  orangTua: number;
  familiLain: number;
  lainnya: number;
}

export interface ServiceReport {
  id: string;
  reportDate: string; // YYYY-MM-DD
  province: string;
  regency: string;
  district: string;
  village: string;
  serviceType: string; // One of the 11 services
  category?: string; // e.g. "Datang dari Dalam DKI", "Datang dari Luar DKI", "Pindah Dalam DKI", "Pindah Keluar DKI", or "Pelayanan Reguler"
  detailRegion?: string; // e.g. "Asal: Kab. Bogor -> Kec. Cibinong -> Kel. Pabuaran" or "Tujuan: Jakarta Barat -> Kec. Kebon Jeruk -> Kel. Duri Kepa"
  demographics?: {
    gender?: DemographicGender;
    shdk?: DemographicSHDK;
  };
  quantity: number;
  createdById: string;
  createdByUsername: string;
  createdAt: string;
}

export interface DistrictSummary {
  districtName: string;
  totalVillages: number;
  totalServices: number;
  villages: {
    villageName: string;
    totalServices: number;
    lastReportDate?: string;
  }[];
}

export interface RegionRankItem {
  name: string;
  parentDistrict?: string;
  count: number;
}

export interface ServiceRegionalRank {
  serviceName: string;
  serviceCategory?: string;
  totalServiceCount: number;
  maxDistrict?: RegionRankItem;
  minDistrict?: RegionRankItem;
  maxVillage: RegionRankItem;
  minVillage: RegionRankItem;
}

export interface TrendDataPoint {
  date: string;
  formattedDate: string;
  total: number;
  kependudukan: number;
  capil: number;
  mutasi: number;
  digital: number;
}

export interface MutationParamStat {
  param: string;
  count: number;
  percentage: number;
}

export interface MutationSummary {
  totalPindahDatang: number;
  totalPindahKeluar: number;
  netMigration: number;
  pindahDatangDetails: MutationParamStat[];
  pindahKeluarDetails: MutationParamStat[];
}

export interface RankedRegion {
  rank: number;
  name: string;
  parentDistrict?: string;
  total: number;
  percentage: number;
}

export interface AutoInsight {
  id: string;
  category: 'layanan' | 'wilayah' | 'mutasi' | 'tren';
  title: string;
  description: string;
  badgeType: 'success' | 'warning' | 'info' | 'primary';
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  color: string;
}

export interface DashboardStats {
  totalServices: number;
  totalDistricts: number;
  totalVillages: number;
  periodLabel: string;
  servicesBreakdown: {
    name: string;
    total: number;
    percentage: number;
    category?: string;
  }[];
  categoriesBreakdown: CategorySummary[];
  districtsBreakdown: {
    district: string;
    total: number;
    percentage?: number;
  }[];
  villagesBreakdown?: {
    village: string;
    district: string;
    total: number;
    percentage: number;
  }[];
  maxService: { name: string; total: number; percentage: number };
  minService: { name: string; total: number; percentage: number };
  maxDistrict?: { name: string; total: number };
  minDistrict?: { name: string; total: number };
  maxVillage?: { name: string; district?: string; total: number };
  minVillage?: { name: string; district?: string; total: number };
  rankingDistricts?: RankedRegion[];
  rankingVillages?: RankedRegion[];
  trendSeries: TrendDataPoint[];
  mutationSummary: MutationSummary;
  insights: AutoInsight[];
  regionalServiceAnalysis?: ServiceRegionalRank[];
  recentReports: ServiceReport[];
}

export interface CascadingOption {
  id: string;
  name: string;
  parentId?: string;
}
