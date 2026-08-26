import nationalWilayahRaw from './national_wilayah.json';

// Official Administrative Regions Data (Kemendagri / BPS Standard)

export interface VillageData {
  name: string;
  code: string;
}

export interface OfficialDistrictData {
  name: string;
  code: string;
  villages: VillageData[];
}

export const JAKARTA_SELATAN_OFFICIAL_HIERARCHY: OfficialDistrictData[] = [
  {
    name: 'Tebet',
    code: '31.74.01',
    villages: [
      { name: 'Tebet Barat', code: '31.74.01.1001' },
      { name: 'Tebet Timur', code: '31.74.01.1002' },
      { name: 'Kebon Baru', code: '31.74.01.1003' },
      { name: 'Bukit Duri', code: '31.74.01.1004' },
      { name: 'Manggarai', code: '31.74.01.1005' },
      { name: 'Manggarai Selatan', code: '31.74.01.1006' },
      { name: 'Menteng Dalam', code: '31.74.01.1007' },
    ]
  },
  {
    name: 'Setiabudi',
    code: '31.74.02',
    villages: [
      { name: 'Setiabudi', code: '31.74.02.1001' },
      { name: 'Karet', code: '31.74.02.1002' },
      { name: 'Karet Semanggi', code: '31.74.02.1003' },
      { name: 'Karet Kuningan', code: '31.74.02.1004' },
      { name: 'Kuningan Timur', code: '31.74.02.1005' },
      { name: 'Menteng Atas', code: '31.74.02.1006' },
      { name: 'Pasar Manggis', code: '31.74.02.1007' },
      { name: 'Guntur', code: '31.74.02.1008' },
    ]
  },
  {
    name: 'Mampang Prapatan',
    code: '31.74.03',
    villages: [
      { name: 'Kuningan Barat', code: '31.74.03.1001' },
      { name: 'Pela Mampang', code: '31.74.03.1002' },
      { name: 'Bangka', code: '31.74.03.1003' },
      { name: 'Tegal Parang', code: '31.74.03.1004' },
      { name: 'Mampang Prapatan', code: '31.74.03.1005' },
    ]
  },
  {
    name: 'Pasar Minggu',
    code: '31.74.04',
    villages: [
      { name: 'Pejaten Barat', code: '31.74.04.1001' },
      { name: 'Pejaten Timur', code: '31.74.04.1002' },
      { name: 'Pasar Minggu', code: '31.74.04.1003' },
      { name: 'Kebagusan', code: '31.74.04.1004' },
      { name: 'Jati Padang', code: '31.74.04.1005' },
      { name: 'Ragunan', code: '31.74.04.1006' },
      { name: 'Cilandak Timur', code: '31.74.04.1007' },
    ]
  },
  {
    name: 'Kebayoran Lama',
    code: '31.74.05',
    villages: [
      { name: 'Grogol Utara', code: '31.74.05.1001' },
      { name: 'Grogol Selatan', code: '31.74.05.1002' },
      { name: 'Cipulir', code: '31.74.05.1003' },
      { name: 'Kebayoran Lama Utara', code: '31.74.05.1004' },
      { name: 'Kebayoran Lama Selatan', code: '31.74.05.1005' },
      { name: 'Pondok Pinang', code: '31.74.05.1006' },
    ]
  },
  {
    name: 'Cilandak',
    code: '31.74.06',
    villages: [
      { name: 'Cipete Selatan', code: '31.74.06.1001' },
      { name: 'Gandaria Selatan', code: '31.74.06.1002' },
      { name: 'Cilandak Barat', code: '31.74.06.1003' },
      { name: 'Lebak Bulus', code: '31.74.06.1004' },
      { name: 'Pondok Labu', code: '31.74.06.1005' },
    ]
  },
  {
    name: 'Kebayoran Baru',
    code: '31.74.07',
    villages: [
      { name: 'Selong', code: '31.74.07.1001' },
      { name: 'Gunung', code: '31.74.07.1002' },
      { name: 'Kramat Pela', code: '31.74.07.1003' },
      { name: 'Gandaria Utara', code: '31.74.07.1004' },
      { name: 'Cipete Utara', code: '31.74.07.1005' },
      { name: 'Pulo', code: '31.74.07.1006' },
      { name: 'Melawai', code: '31.74.07.1007' },
      { name: 'Petogogan', code: '31.74.07.1008' },
      { name: 'Rawa Barat', code: '31.74.07.1009' },
      { name: 'Senayan', code: '31.74.07.1010' },
    ]
  },
  {
    name: 'Pancoran',
    code: '31.74.08',
    villages: [
      { name: 'Kalibata', code: '31.74.08.1001' },
      { name: 'Rawajati', code: '31.74.08.1002' },
      { name: 'Duren Tiga', code: '31.74.08.1003' },
      { name: 'Cikoko', code: '31.74.08.1004' },
      { name: 'Pengadegan', code: '31.74.08.1005' },
      { name: 'Pancoran', code: '31.74.08.1006' },
    ]
  },
  {
    name: 'Jagakarsa',
    code: '31.74.09',
    villages: [
      { name: 'Tanjung Barat', code: '31.74.09.1001' },
      { name: 'Lenteng Agung', code: '31.74.09.1002' },
      { name: 'Jagakarsa', code: '31.74.09.1003' },
      { name: 'Ciganjur', code: '31.74.09.1004' },
      { name: 'Srengseng Sawah', code: '31.74.09.1005' },
      { name: 'Cipedak', code: '31.74.09.1006' },
    ]
  },
  {
    name: 'Pesanggrahan',
    code: '31.74.10',
    villages: [
      { name: 'Ulujami', code: '31.74.10.1001' },
      { name: 'Petukangan Utara', code: '31.74.10.1002' },
      { name: 'Petukangan Selatan', code: '31.74.10.1003' },
      { name: 'Pesanggrahan', code: '31.74.10.1004' },
      { name: 'Bintaro', code: '31.74.10.1005' },
    ]
  },
];

export interface DistrictData {
  name: string;
  code?: string;
  villages: string[];
}

export interface RegencyData {
  name: string;
  code?: string;
  districts: DistrictData[];
}

export interface ProvinceData {
  name: string;
  code?: string;
  regencies: RegencyData[];
}

// 10 Kecamatan & 65 Kelurahan Resmi Jakarta Selatan
export const JAKARTA_SELATAN_DISTRICTS: DistrictData[] = [
  {
    name: 'Cilandak',
    villages: [
      'Cilandak Barat',
      'Cipete Selatan',
      'Gandaria Selatan',
      'Lebak Bulus',
      'Pondok Labu'
    ]
  },
  {
    name: 'Jagakarsa',
    villages: [
      'Ciganjur',
      'Cipedak',
      'Jagakarsa',
      'Lenteng Agung',
      'Srengseng Sawah',
      'Tanjung Barat'
    ]
  },
  {
    name: 'Kebayoran Baru',
    villages: [
      'Cipete Utara',
      'Gandaria Utara',
      'Gunung',
      'Kramat Pela',
      'Melawai',
      'Petogogan',
      'Pulo',
      'Rawa Barat',
      'Selong',
      'Senayan'
    ]
  },
  {
    name: 'Kebayoran Lama',
    villages: [
      'Cipulir',
      'Grogol Selatan',
      'Grogol Utara',
      'Kebayoran Lama Selatan',
      'Kebayoran Lama Utara',
      'Pondok Pinang'
    ]
  },
  {
    name: 'Mampang Prapatan',
    villages: [
      'Bangka',
      'Kuningan Barat',
      'Mampang Prapatan',
      'Pela Mampang',
      'Tegal Parang'
    ]
  },
  {
    name: 'Pancoran',
    villages: [
      'Cikoko',
      'Duren Tiga',
      'Kalibata',
      'Pancoran',
      'Pengadegan',
      'Rawajati'
    ]
  },
  {
    name: 'Pasar Minggu',
    villages: [
      'Cilandak Timur',
      'Jati Padang',
      'Kebagusan',
      'Pasar Minggu',
      'Pejaten Barat',
      'Pejaten Timur',
      'Ragunan'
    ]
  },
  {
    name: 'Pesanggrahan',
    villages: [
      'Bintaro',
      'Pesanggrahan',
      'Petukangan Selatan',
      'Petukangan Utara',
      'Ulujami'
    ]
  },
  {
    name: 'Setiabudi',
    villages: [
      'Guntur',
      'Karet',
      'Karet Kuningan',
      'Karet Semanggi',
      'Kuningan Timur',
      'Menteng Atas',
      'Pasar Manggis',
      'Setiabudi'
    ]
  },
  {
    name: 'Tebet',
    villages: [
      'Bukit Duri',
      'Kebon Baru',
      'Manggarai',
      'Manggarai Selatan',
      'Menteng Dalam',
      'Tebet Barat',
      'Tebet Timur'
    ]
  }
];

// All DKI Jakarta Regencies / Administrative Cities for "Dalam DKI" cascading
export const DKI_JAKARTA_REGENCIES: RegencyData[] = [
  {
    name: 'Kota Administrasi Jakarta Selatan',
    districts: JAKARTA_SELATAN_DISTRICTS
  },
  {
    name: 'Kota Administrasi Jakarta Timur',
    districts: [
      {
        name: 'Matraman',
        villages: ['Pisangan Baru', 'Utan Kayu Selatan', 'Utan Kayu Utara', 'Kayu Manis', 'Pal Matriam', 'Kebon Manggis']
      },
      {
        name: 'Pulo Gadung',
        villages: ['Pisangan Timur', 'Cipinang', 'Jatinegara Kaum', 'Rawamangun', 'Penggilingan', 'Kayu Putih']
      },
      {
        name: 'Jatinegara',
        villages: ['Bali Mester', 'Kampung Melayu', 'Bidaracina', 'Cipinang Cempedak', 'Rawa Bunga', 'Cipinang Besar Utara']
      },
      {
        name: 'Duren Sawit',
        villages: ['Pondok Bambu', 'Duren Sawit', 'Pondok Kelapa', 'Pondok Kopi', 'Malaka Jaya', 'Malaka Sari', 'Klender']
      },
      {
        name: 'Kramat Jati',
        villages: ['Kramat Jati', 'Batu Ampar', 'Balekambang', 'Kampung Tengah', 'Dukuh', 'Cawang', 'Cililitan']
      },
      {
        name: 'Makasar',
        villages: ['Pinang Ranti', 'Makasar', 'Halim Perdanakusuma', 'Cipinang Melayu', 'Kebon Pala']
      },
      {
        name: 'Pasar Rebo',
        villages: ['Pekayon', 'Kampung Gedong', 'Cijantung', 'Kampung Baru', 'Kalisari']
      },
      {
        name: 'Ciracas',
        villages: ['Cibubur', 'Kelapa Dua Wetan', 'Ciracas', 'Susukan', 'Rambutan']
      },
      {
        name: 'Cipayung',
        villages: ['Lubang Buaya', 'Ceger', 'Cipayung', 'Munjul', 'Pondok Ranggon', 'Cilangkap', 'Setu', 'Bambu Apus']
      },
      {
        name: 'Cakung',
        villages: ['Cakung Barat', 'Cakung Timur', 'Rawa Terate', 'Jatinegara', 'Penggilingan', 'Pulogebang', 'Ujung Menteng']
      }
    ]
  },
  {
    name: 'Kota Administrasi Jakarta Barat',
    districts: [
      {
        name: 'Kebon Jeruk',
        villages: ['Duri Kepa', 'Kedoya Selatan', 'Kedoya Utara', 'Kebon Jeruk', 'Sukabumi Utara', 'Kelapa Dua', 'Sukabumi Selatan']
      },
      {
        name: 'Grogol Petamburan',
        villages: ['Tomang', 'Grogol', 'Jelambar', 'Jelambar Baru', 'Wijaya Kusuma', 'Tanjung Duren Utara', 'Tanjung Duren Selatan']
      },
      {
        name: 'Kembangan',
        villages: ['Kembangan Barat', 'Kembangan Timur', 'Meruya Utara', 'Srengseng', 'Joglo', 'Meruya Selatan']
      },
      {
        name: 'Palmerah',
        villages: ['Slipi', 'Kota Bambu Utara', 'Kota Bambu Selatan', 'Palmerah', 'Kemanggisan', 'Jatipulo']
      },
      {
        name: 'Cengkareng',
        villages: ['Kedaung Kali Angke', 'Kapuk', 'Cengkareng Barat', 'Cengkareng Timur', 'Rawa Buaya', 'Duri Kosambi']
      },
      {
        name: 'Kalideres',
        villages: ['Kamal', 'Tegal Alur', 'Pegadungan', 'Kalideres', 'Semanan']
      },
      {
        name: 'Tambora',
        villages: ['Tanah Sereal', 'Tambora', 'Roa Malaka', 'Pekojan', 'Jembatan Lima', 'Krendang', 'Duri Utara', 'Duri Selatan', 'Kalianyar', 'Jembatan Besi', 'Angke']
      },
      {
        name: 'Taman Sari',
        villages: ['Pinangsia', 'Glodok', 'Keagungan', 'Krukut', 'Maphar', 'Tangki', 'Mangga Besar']
      }
    ]
  },
  {
    name: 'Kota Administrasi Jakarta Pusat',
    districts: [
      {
        name: 'Menteng',
        villages: ['Menteng', 'Pegangsaan', 'Cikini', 'Kebon Sirih', 'Gondangdia']
      },
      {
        name: 'Gambir',
        villages: ['Gambir', 'Kebon Kelapa', 'Petojo Selatan', 'Duri Pulo', 'Petojo Utara', 'Cideng']
      },
      {
        name: 'Kemayoran',
        villages: ['Gunung Sahari Selatan', 'Kemayoran', 'Kebon Kosong', 'Harapan Mulya', 'Cempaka Baru', 'Utan Panjang', 'Sumur Batu', 'Serdang']
      },
      {
        name: 'Tanah Abang',
        villages: ['Bendungan Hilir', 'Karet Tengsin', 'Kebon Melati', 'Kebon Kacang', 'Kampung Bali', 'Petamburan', 'Gelora']
      },
      {
        name: 'Senen',
        villages: ['Senen', 'Kenari', 'Paseban', 'Kramat', 'Kwitang', 'Bungur']
      },
      {
        name: 'Cempaka Putih',
        villages: ['Cempaka Putih Timur', 'Cempaka Putih Barat', 'Rawasari']
      },
      {
        name: 'Johar Baru',
        villages: ['Johar Baru', 'Kampung Rawa', 'Galur', 'Tanah Tinggi']
      },
      {
        name: 'Sawah Besar',
        villages: ['Pasar Baru', 'Gunung Sahari Utara', 'Mangga Dua Selatan', 'Karang Anyar', 'Kartini']
      }
    ]
  },
  {
    name: 'Kota Administrasi Jakarta Utara',
    districts: [
      {
        name: 'Kelapa Gading',
        villages: ['Kelapa Gading Barat', 'Kelapa Gading Timur', 'Pegangsaan Dua']
      },
      {
        name: 'Tanjung Priok',
        villages: ['Tanjung Priok', 'Kebon Bawang', 'Sungai Bambu', 'Papanggo', 'Warakas', 'Sunter Agung', 'Sunter Jaya']
      },
      {
        name: 'Penjaringan',
        villages: ['Penjaringan', 'Pluit', 'Pejagalan', 'Kapuk Muara', 'Kamal Muara']
      },
      {
        name: 'Koja',
        villages: ['Koja', 'Rawa Badak Utara', 'Rawa Badak Selatan', 'Tugu Utara', 'Tugu Selatan', 'Lagoa']
      },
      {
        name: 'Cilincing',
        villages: ['Kali Baru', 'Cilincing', 'Semper Barat', 'Semper Timur', 'Sukapura', 'Rorotan', 'Marunda']
      },
      {
        name: 'Pademangan',
        villages: ['Pademangan Timur', 'Pademangan Barat', 'Ancol']
      }
    ]
  },
  {
    name: 'Kabupaten Administrasi Kepulauan Seribu',
    districts: [
      {
        name: 'Kepulauan Seribu Selatan',
        villages: ['Pulau Untung Jawa', 'Pulau Pari', 'Pulau Tidung']
      },
      {
        name: 'Kepulauan Seribu Utara',
        villages: ['Pulau Panggang', 'Pulau Kelapa', 'Pulau Harapan']
      }
    ]
  }
];

// National Master Database with Official 38 Indonesian Provinces, 514 Kab/Kota, 7,265 Kecamatan, 83,345 Desa/Kelurahan
// Source: Kepmendagri No 300.2.2-2430 Tahun 2025 / Kemendagri Ditjen Bina Adwil
export const NATIONAL_PROVINCES: ProvinceData[] = nationalWilayahRaw as unknown as ProvinceData[];

// Helper counts calculated directly from dataset
export const getNationalWilayahCounts = () => {
  let totalProvinces = NATIONAL_PROVINCES.length;
  let totalRegencies = 0;
  let totalDistricts = 0;
  let totalVillages = 0;

  NATIONAL_PROVINCES.forEach(p => {
    totalRegencies += p.regencies.length;
    p.regencies.forEach(r => {
      totalDistricts += r.districts.length;
      r.districts.forEach(d => {
        totalVillages += d.villages.length;
      });
    });
  });

  return {
    totalProvinces,
    totalRegencies,
    totalDistricts,
    totalVillages
  };
};

// 11 Mandatory Services
export const SERVICE_TYPES = [
  { id: 'kk', name: 'Kartu Keluarga', code: 'KK', category: 'Kependudukan', iconName: 'Users' },
  { id: 'ktp', name: 'KTP-el', code: 'KTP-EL', category: 'Kependudukan', iconName: 'CreditCard' },
  { id: 'kia', name: 'KIA', code: 'KIA', category: 'Kependudukan', iconName: 'Smile' },
  { id: 'pindah_datang', name: 'Pindah Datang', code: 'SKPWNI-IN', category: 'Mutasi Penduduk', iconName: 'UserCheck' },
  { id: 'pindah_keluar', name: 'Pindah Keluar', code: 'SKPWNI-OUT', category: 'Mutasi Penduduk', iconName: 'UserMinus' },
  { id: 'perubahan_data', name: 'Perubahan Data', code: 'UBAH-DATA', category: 'Kependudukan', iconName: 'FileEdit' },
  { id: 'ikd', name: 'IKD', code: 'IKD-APP', category: 'Identitas Digital', iconName: 'Smartphone' },
  { id: 'akta_lahir', name: 'Akta Kelahiran', code: 'AKTA-LAHIR', category: 'Pencatatan Sipil', iconName: 'Baby' },
  { id: 'akta_mati', name: 'Akta Kematian', code: 'AKTA-MATI', category: 'Pencatatan Sipil', iconName: 'FileText' },
  { id: 'akta_kawin', name: 'Akta Perkawinan', code: 'AKTA-KAWIN', category: 'Pencatatan Sipil', iconName: 'HeartHandshake' },
  { id: 'akta_cerai', name: 'Akta Perceraian', code: 'AKTA-CERAI', category: 'Pencatatan Sipil', iconName: 'Scissors' },
] as const;
