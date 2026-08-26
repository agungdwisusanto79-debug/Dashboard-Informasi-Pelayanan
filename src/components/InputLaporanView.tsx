import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { JAKARTA_SELATAN_DISTRICTS, SERVICE_TYPES, NATIONAL_PROVINCES, DKI_JAKARTA_REGENCIES } from '../data/regionsData';
import {
  FilePlus2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  MapPin,
  Users
} from 'lucide-react';

interface InputLaporanViewProps {
  user: User;
  token: string;
  onSuccessNavigate?: () => void;
}

export const InputLaporanView: React.FC<InputLaporanViewProps> = ({ user, token, onSuccessNavigate }) => {
  // Form State
  const [province] = useState('DKI Jakarta');
  const [regency] = useState('Kota Administrasi Jakarta Selatan');

  const [district, setDistrict] = useState<string>(
    user.role === 'KELURAHAN' || user.role === 'KECAMATAN' ? user.district || '' : JAKARTA_SELATAN_DISTRICTS[0].name
  );

  const currentDistrictObj = JAKARTA_SELATAN_DISTRICTS.find(d => d.name === district) || JAKARTA_SELATAN_DISTRICTS[0];

  const [village, setVillage] = useState<string>(
    user.role === 'KELURAHAN' ? user.village || '' : currentDistrictObj.villages[0]
  );

  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Quantities for 11 services
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({
    'Kartu Keluarga': 0,
    'KTP-el': 0,
    'KIA': 0,
    'Pindah Datang': 0,
    'Pindah Keluar': 0,
    'Perubahan Data': 0,
    'IKD': 0,
    'Akta Kelahiran': 0,
    'Akta Kematian': 0,
    'Akta Perkawinan': 0,
    'Akta Perceraian': 0,
  });

  // --- PINDAH DATANG Sub-Form State ---
  const [pindahDatangCategory, setPindahDatangCategory] = useState<'Datang dari Dalam DKI' | 'Datang dari Luar DKI'>('Datang dari Dalam DKI');

  // Dalam DKI -> TUJUAN (Kota Administrasi -> Kecamatan -> Kelurahan)
  const [pdTujuanKota, setPdTujuanKota] = useState<string>('Kota Administrasi Jakarta Selatan');
  const [pdTujuanKecamatan, setPdTujuanKecamatan] = useState<string>('');
  const [pdTujuanKelurahan, setPdTujuanKelurahan] = useState<string>('');

  // Luar DKI -> ASAL (Provinsi -> Kabupaten/Kota -> Kecamatan -> Desa/Kelurahan)
  const [pdAsalProvinsi, setPdAsalProvinsi] = useState<string>('');
  const [pdAsalKabupaten, setPdAsalKabupaten] = useState<string>('');
  const [pdAsalKecamatan, setPdAsalKecamatan] = useState<string>('');
  const [pdAsalDesa, setPdAsalDesa] = useState<string>('');

  // Pindah Datang Demographics State
  const [pdGender, setPdGender] = useState<{ male: number; female: number }>({
    male: 0,
    female: 0
  });

  const [pdShdk, setPdShdk] = useState<{
    kepalaKeluarga: number;
    istri: number;
    anak: number;
    orangTua: number;
    familiLain: number;
    lainnya: number;
  }>({
    kepalaKeluarga: 0,
    istri: 0,
    anak: 0,
    orangTua: 0,
    familiLain: 0,
    lainnya: 0
  });

  // --- PINDAH KELUAR Sub-Form State ---
  const [pindahKeluarCategory, setPindahKeluarCategory] = useState<'Pindah Dalam DKI' | 'Pindah Keluar DKI'>('Pindah Dalam DKI');

  // Dalam DKI -> ASAL (Kota Administrasi -> Kecamatan -> Kelurahan)
  const [pkAsalKota, setPkAsalKota] = useState<string>('Kota Administrasi Jakarta Selatan');
  const [pkAsalKecamatan, setPkAsalKecamatan] = useState<string>('');
  const [pkAsalKelurahan, setPkAsalKelurahan] = useState<string>('');

  // Luar DKI -> TUJUAN (Provinsi -> Kabupaten/Kota -> Kecamatan -> Desa/Kelurahan)
  const [pkTujuanProvinsi, setPkTujuanProvinsi] = useState<string>('');
  const [pkTujuanKabupaten, setPkTujuanKabupaten] = useState<string>('');
  const [pkTujuanKecamatan, setPkTujuanKecamatan] = useState<string>('');
  const [pkTujuanDesa, setPkTujuanDesa] = useState<string>('');

  // Pindah Keluar Demographics State
  const [pkGender, setPkGender] = useState<{ male: number; female: number }>({
    male: 0,
    female: 0
  });

  const [pkShdk, setPkShdk] = useState<{
    kepalaKeluarga: number;
    istri: number;
    anak: number;
    orangTua: number;
    familiLain: number;
    lainnya: number;
  }>({
    kepalaKeluarga: 0,
    istri: 0,
    anak: 0,
    orangTua: 0,
    familiLain: 0,
    lainnya: 0
  });

  // Akta Kelahiran Demographics State
  const [kelahiranGender, setKelahiranGender] = useState<{ male: number; female: number }>({
    male: 0,
    female: 0
  });

  // Akta Kematian Demographics State
  const [kematianGender, setKematianGender] = useState<{ male: number; female: number }>({
    male: 0,
    female: 0
  });

  const [kematianShdk, setKematianShdk] = useState<{
    kepalaKeluarga: number;
    istri: number;
    anak: number;
    orangTua: number;
    familiLain: number;
    lainnya: number;
  }>({
    kepalaKeluarga: 0,
    istri: 0,
    anak: 0,
    orangTua: 0,
    familiLain: 0,
    lainnya: 0
  });

  // UI feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update village options when district changes
  useEffect(() => {
    if (user.role === 'KELURAHAN') {
      setDistrict(user.district || '');
      setVillage(user.village || '');
    } else if (user.role === 'KECAMATAN') {
      setDistrict(user.district || '');
      const dist = JAKARTA_SELATAN_DISTRICTS.find(d => d.name === user.district);
      if (dist && (!village || !dist.villages.includes(village))) {
        setVillage(dist.villages[0]);
      }
    } else {
      // Sudin
      const dist = JAKARTA_SELATAN_DISTRICTS.find(d => d.name === district);
      if (dist && (!village || !dist.villages.includes(village))) {
        setVillage(dist.villages[0]);
      }
    }
  }, [district, user.role, user.district, user.village]);

  const handleQuantityChange = (serviceName: string, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setQuantities(prev => ({
      ...prev,
      [serviceName]: num
    }));
  };

  const handlePdGenderChange = (field: 'male' | 'female', val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setPdGender(prev => ({
      ...prev,
      [field]: num
    }));
  };

  const handlePdShdkChange = (field: keyof typeof pdShdk, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setPdShdk(prev => ({
      ...prev,
      [field]: num
    }));
  };

  const handlePkGenderChange = (field: 'male' | 'female', val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setPkGender(prev => ({
      ...prev,
      [field]: num
    }));
  };

  const handlePkShdkChange = (field: keyof typeof pkShdk, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setPkShdk(prev => ({
      ...prev,
      [field]: num
    }));
  };

  const handleKelahiranGenderChange = (field: 'male' | 'female', val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setKelahiranGender(prev => ({
      ...prev,
      [field]: num
    }));
  };

  const handleKematianGenderChange = (field: 'male' | 'female', val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setKematianGender(prev => ({
      ...prev,
      [field]: num
    }));
  };

  const handleKematianShdkChange = (field: keyof typeof kematianShdk, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setKematianShdk(prev => ({
      ...prev,
      [field]: num
    }));
  };

  const pdTotalGender = (Number(pdGender.male) || 0) + (Number(pdGender.female) || 0);
  const pdTotalShdk =
    (Number(pdShdk.kepalaKeluarga) || 0) +
    (Number(pdShdk.istri) || 0) +
    (Number(pdShdk.anak) || 0) +
    (Number(pdShdk.orangTua) || 0) +
    (Number(pdShdk.familiLain) || 0) +
    (Number(pdShdk.lainnya) || 0);

  const pdCurrentQty = Number(quantities['Pindah Datang']) || 0;
  const isPdGenderValid = pdCurrentQty === 0 || pdTotalGender === pdCurrentQty;
  const isPdShdkValid = pdCurrentQty === 0 || pdTotalShdk === pdCurrentQty;

  const pkTotalGender = (Number(pkGender.male) || 0) + (Number(pkGender.female) || 0);
  const pkTotalShdk =
    (Number(pkShdk.kepalaKeluarga) || 0) +
    (Number(pkShdk.istri) || 0) +
    (Number(pkShdk.anak) || 0) +
    (Number(pkShdk.orangTua) || 0) +
    (Number(pkShdk.familiLain) || 0) +
    (Number(pkShdk.lainnya) || 0);

  const pkCurrentQty = Number(quantities['Pindah Keluar']) || 0;
  const isPkGenderValid = pkCurrentQty === 0 || pkTotalGender === pkCurrentQty;
  const isPkShdkValid = pkCurrentQty === 0 || pkTotalShdk === pkCurrentQty;

  const kelahiranTotalGender = (Number(kelahiranGender.male) || 0) + (Number(kelahiranGender.female) || 0);
  const kelahiranCurrentQty = Number(quantities['Akta Kelahiran']) || 0;
  const isKelahiranGenderValid = kelahiranCurrentQty === 0 || kelahiranTotalGender === kelahiranCurrentQty;

  const kematianTotalGender = (Number(kematianGender.male) || 0) + (Number(kematianGender.female) || 0);
  const kematianTotalShdk =
    (Number(kematianShdk.kepalaKeluarga) || 0) +
    (Number(kematianShdk.istri) || 0) +
    (Number(kematianShdk.anak) || 0) +
    (Number(kematianShdk.orangTua) || 0) +
    (Number(kematianShdk.familiLain) || 0) +
    (Number(kematianShdk.lainnya) || 0);

  const kematianCurrentQty = Number(quantities['Akta Kematian']) || 0;
  const isKematianGenderValid = kematianCurrentQty === 0 || kematianTotalGender === kematianCurrentQty;
  const isKematianShdkValid = kematianCurrentQty === 0 || kematianTotalShdk === kematianCurrentQty;

  // Helper for Pindah Datang Dalam DKI options
  const pdSelectedKotaObj = DKI_JAKARTA_REGENCIES.find(r => r.name === pdTujuanKota);
  const pdKotaDistricts = pdSelectedKotaObj ? pdSelectedKotaObj.districts : [];
  const pdSelectedKecObj = pdKotaDistricts.find(d => d.name === pdTujuanKecamatan);
  const pdKecVillages = pdSelectedKecObj ? pdSelectedKecObj.villages : [];

  // Helper for Pindah Datang Luar DKI options
  const pdSelectedProvObj = NATIONAL_PROVINCES.find(p => p.name === pdAsalProvinsi);
  const pdRegencies = pdSelectedProvObj ? pdSelectedProvObj.regencies : [];
  const pdSelectedRegObj = pdRegencies.find(r => r.name === pdAsalKabupaten);
  const pdDistricts = pdSelectedRegObj ? pdSelectedRegObj.districts : [];
  const pdSelectedDistObj = pdDistricts.find(d => d.name === pdAsalKecamatan);
  const pdVillages = pdSelectedDistObj ? pdSelectedDistObj.villages : [];

  // Helper for Pindah Keluar Dalam DKI options
  const pkSelectedKotaObj = DKI_JAKARTA_REGENCIES.find(r => r.name === pkAsalKota);
  const pkKotaDistricts = pkSelectedKotaObj ? pkSelectedKotaObj.districts : [];
  const pkSelectedKecObj = pkKotaDistricts.find(d => d.name === pkAsalKecamatan);
  const pkKecVillages = pkSelectedKecObj ? pkSelectedKecObj.villages : [];

  // Helper for Pindah Keluar Keluar DKI options
  const pkSelectedProvObj = NATIONAL_PROVINCES.find(p => p.name === pkTujuanProvinsi);
  const pkRegencies = pkSelectedProvObj ? pkSelectedProvObj.regencies : [];
  const pkSelectedRegObj = pkRegencies.find(r => r.name === pkTujuanKabupaten);
  const pkDistricts = pkSelectedRegObj ? pkSelectedRegObj.districts : [];
  const pkSelectedDistObj = pkDistricts.find(d => d.name === pkTujuanKecamatan);
  const pkVillages = pkSelectedDistObj ? pkSelectedDistObj.villages : [];

  const checkIsPindahDatangComplete = (): boolean => {
    if (pindahDatangCategory === 'Datang dari Dalam DKI') {
      return Boolean(pdTujuanKota && pdTujuanKecamatan && pdTujuanKelurahan);
    } else {
      return Boolean(pdAsalProvinsi && pdAsalKabupaten && pdAsalKecamatan && pdAsalDesa);
    }
  };

  const checkIsPindahKeluarComplete = (): boolean => {
    if (pindahKeluarCategory === 'Pindah Dalam DKI') {
      return Boolean(pkAsalKota && pkAsalKecamatan && pkAsalKelurahan);
    } else {
      return Boolean(pkTujuanProvinsi && pkTujuanKabupaten && pkTujuanKecamatan && pkTujuanDesa);
    }
  };

  const validateSubmission = (activeQty: { [key: string]: number } = quantities): string | null => {
    const totalServices = Object.values(activeQty).reduce((acc, q) => acc + (Number(q) || 0), 0);
    const pdQty = Number(activeQty['Pindah Datang']) || 0;
    const pkQty = Number(activeQty['Pindah Keluar']) || 0;

    const hasAnyService = totalServices > 0;
    const isPindahDatangParameterComplete = checkIsPindahDatangComplete();
    const isPindahKeluarParameterComplete = checkIsPindahKeluarComplete();

    const pindahDatangInvalid = pdQty > 0 && !isPindahDatangParameterComplete;
    const pindahKeluarInvalid = pkQty > 0 && !isPindahKeluarParameterComplete;

    if (!hasAnyService) {
      return 'Harap isi jumlah pelayanan minimal pada salah satu jenis layanan.';
    }

    if (pindahDatangInvalid) {
      return 'Harap isi parameter Pindah Datang terlebih dahulu.';
    }

    if (pdQty > 0) {
      const totalGender = (Number(pdGender.male) || 0) + (Number(pdGender.female) || 0);
      if (totalGender !== pdQty) {
        return `Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus ${pdQty}.`;
      }

      const totalShdk =
        (Number(pdShdk.kepalaKeluarga) || 0) +
        (Number(pdShdk.istri) || 0) +
        (Number(pdShdk.anak) || 0) +
        (Number(pdShdk.orangTua) || 0) +
        (Number(pdShdk.familiLain) || 0) +
        (Number(pdShdk.lainnya) || 0);

      if (totalShdk !== pdQty) {
        return `Komposisi SHDK belum lengkap. Total SHDK harus ${pdQty}.`;
      }
    }

    if (pindahKeluarInvalid) {
      return 'Harap isi parameter Pindah Keluar terlebih dahulu.';
    }

    if (pkQty > 0) {
      const totalGender = (Number(pkGender.male) || 0) + (Number(pkGender.female) || 0);
      if (totalGender !== pkQty) {
        return `Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus ${pkQty}.`;
      }

      const totalShdk =
        (Number(pkShdk.kepalaKeluarga) || 0) +
        (Number(pkShdk.istri) || 0) +
        (Number(pkShdk.anak) || 0) +
        (Number(pkShdk.orangTua) || 0) +
        (Number(pkShdk.familiLain) || 0) +
        (Number(pkShdk.lainnya) || 0);

      if (totalShdk !== pkQty) {
        return `Komposisi SHDK belum lengkap. Total SHDK harus ${pkQty}.`;
      }
    }

    const kelahiranQty = Number(activeQty['Akta Kelahiran']) || 0;
    if (kelahiranQty > 0) {
      const totalGender = (Number(kelahiranGender.male) || 0) + (Number(kelahiranGender.female) || 0);
      if (totalGender !== kelahiranQty) {
        return `Total Laki-laki + Perempuan harus sama dengan jumlah Akta Kelahiran.`;
      }
    }

    const kematianQty = Number(activeQty['Akta Kematian']) || 0;
    if (kematianQty > 0) {
      const totalGender = (Number(kematianGender.male) || 0) + (Number(kematianGender.female) || 0);
      if (totalGender !== kematianQty) {
        return `Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus ${kematianQty}.`;
      }

      const totalShdk =
        (Number(kematianShdk.kepalaKeluarga) || 0) +
        (Number(kematianShdk.istri) || 0) +
        (Number(kematianShdk.anak) || 0) +
        (Number(kematianShdk.orangTua) || 0) +
        (Number(kematianShdk.familiLain) || 0) +
        (Number(kematianShdk.lainnya) || 0);

      if (totalShdk !== kematianQty) {
        return `Komposisi SHDK belum lengkap. Total SHDK harus ${kematianQty}.`;
      }
    }

    return null;
  };

  const calculateTotalInputted = (currentQuantities = quantities): number => {
    return Object.keys(currentQuantities).reduce((acc: number, key: string) => acc + (currentQuantities[key] || 0), 0);
  };

  const handleReset = () => {
    setQuantities({
      'Kartu Keluarga': 0,
      'KTP-el': 0,
      'KIA': 0,
      'Pindah Datang': 0,
      'Pindah Keluar': 0,
      'Perubahan Data': 0,
      'IKD': 0,
      'Akta Kelahiran': 0,
      'Akta Kematian': 0,
      'Akta Perkawinan': 0,
      'Akta Perceraian': 0,
    });
    setPdGender({ male: 0, female: 0 });
    setPdShdk({
      kepalaKeluarga: 0,
      istri: 0,
      anak: 0,
      orangTua: 0,
      familiLain: 0,
      lainnya: 0
    });
    setPkGender({ male: 0, female: 0 });
    setPkShdk({
      kepalaKeluarga: 0,
      istri: 0,
      anak: 0,
      orangTua: 0,
      familiLain: 0,
      lainnya: 0
    });
    setKelahiranGender({ male: 0, female: 0 });
    setKematianGender({ male: 0, female: 0 });
    setKematianShdk({
      kepalaKeluarga: 0,
      istri: 0,
      anak: 0,
      orangTua: 0,
      familiLain: 0,
      lainnya: 0
    });
    setPdTujuanKecamatan('');
    setPdTujuanKelurahan('');
    setPdAsalProvinsi('');
    setPdAsalKabupaten('');
    setPdAsalKecamatan('');
    setPdAsalDesa('');
    setPkAsalKecamatan('');
    setPkAsalKelurahan('');
    setPkTujuanProvinsi('');
    setPkTujuanKabupaten('');
    setPkTujuanKecamatan('');
    setPkTujuanDesa('');
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // 1. Gather the latest quantities from state, with direct DOM fallback to ensure 100% sync
    const activeQuantities: { [key: string]: number } = { ...quantities };
    SERVICE_TYPES.forEach(s => {
      const el = document.getElementById(`input-qty-${s.id}`) as HTMLInputElement | null;
      if (el && el.value !== undefined && el.value !== '') {
        const parsed = parseInt(el.value, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          activeQuantities[s.name] = parsed;
        }
      }
    });

    // 2. Centralized validation check
    const validationError = validateSubmission(activeQuantities);
    if (validationError) {
      setErrorMessage(validationError);
      // STRICT RULE: Return immediately. No API call, no DB modification, no form reset.
      return;
    }

    const totalQty = Object.values(activeQuantities).reduce((acc, q) => acc + (Number(q) || 0), 0);

    setIsSubmitting(true);

    try {
      // Build items array for the 11 services
      const itemsToSubmit = SERVICE_TYPES.map(s => {
        const qty = activeQuantities[s.name] || 0;
        let category = 'Pelayanan Reguler';
        let detailRegion = '-';
        let demographics: any = undefined;

        if (s.name === 'Pindah Datang' && qty > 0) {
          category = pindahDatangCategory;
          if (pindahDatangCategory === 'Datang dari Dalam DKI') {
            detailRegion = `Tujuan: ${pdTujuanKota} -> Kec. ${pdTujuanKecamatan} -> Kel. ${pdTujuanKelurahan}`;
          } else {
            detailRegion = `Asal: ${pdAsalProvinsi} -> ${pdAsalKabupaten} -> Kec. ${pdAsalKecamatan} -> Kel. ${pdAsalDesa}`;
          }
          demographics = {
            gender: {
              male: Number(pdGender.male) || 0,
              female: Number(pdGender.female) || 0
            },
            shdk: {
              kepalaKeluarga: Number(pdShdk.kepalaKeluarga) || 0,
              istri: Number(pdShdk.istri) || 0,
              anak: Number(pdShdk.anak) || 0,
              orangTua: Number(pdShdk.orangTua) || 0,
              familiLain: Number(pdShdk.familiLain) || 0,
              lainnya: Number(pdShdk.lainnya) || 0
            }
          };
        } else if (s.name === 'Pindah Keluar' && qty > 0) {
          category = pindahKeluarCategory;
          if (pindahKeluarCategory === 'Pindah Dalam DKI') {
            detailRegion = `Asal: ${pkAsalKota} -> Kec. ${pkAsalKecamatan} -> Kel. ${pkAsalKelurahan}`;
          } else {
            detailRegion = `Tujuan: ${pkTujuanProvinsi} -> ${pkTujuanKabupaten} -> Kec. ${pkTujuanKecamatan} -> Kel. ${pkTujuanDesa}`;
          }
          demographics = {
            gender: {
              male: Number(pkGender.male) || 0,
              female: Number(pkGender.female) || 0
            },
            shdk: {
              kepalaKeluarga: Number(pkShdk.kepalaKeluarga) || 0,
              istri: Number(pkShdk.istri) || 0,
              anak: Number(pkShdk.anak) || 0,
              orangTua: Number(pkShdk.orangTua) || 0,
              familiLain: Number(pkShdk.familiLain) || 0,
              lainnya: Number(pkShdk.lainnya) || 0
            }
          };
        } else if (s.name === 'Akta Kelahiran' && qty > 0) {
          category = 'Pencatatan Sipil';
          demographics = {
            gender: {
              male: Number(kelahiranGender.male) || 0,
              female: Number(kelahiranGender.female) || 0
            },
            shdk: {
              kepalaKeluarga: 0,
              istri: 0,
              anak: qty,
              orangTua: 0,
              familiLain: 0,
              lainnya: 0
            }
          };
        } else if (s.name === 'Akta Kematian' && qty > 0) {
          category = 'Pencatatan Sipil';
          demographics = {
            gender: {
              male: Number(kematianGender.male) || 0,
              female: Number(kematianGender.female) || 0
            },
            shdk: {
              kepalaKeluarga: Number(kematianShdk.kepalaKeluarga) || 0,
              istri: Number(kematianShdk.istri) || 0,
              anak: Number(kematianShdk.anak) || 0,
              orangTua: Number(kematianShdk.orangTua) || 0,
              familiLain: Number(kematianShdk.familiLain) || 0,
              lainnya: Number(kematianShdk.lainnya) || 0
            }
          };
        }

        return {
          serviceType: s.name,
          quantity: qty,
          category,
          detailRegion,
          ...(demographics ? { demographics } : {})
        };
      }).filter(item => item.quantity > 0);

      const targetDistrict = user.role === 'KELURAHAN' ? (user.district || district) : (user.role === 'KECAMATAN' ? (user.district || district) : district);
      const targetVillage = user.role === 'KELURAHAN' ? (user.village || village) : village;

      const payload = {
        reportDate,
        province,
        regency,
        district: targetDistrict,
        village: targetVillage,
        items: itemsToSubmit
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan laporan.');
      }

      setSuccessMessage(`Sukses! ${itemsToSubmit.length} layanan dengan total ${totalQty} pelayanan berhasil disimpan untuk Kelurahan ${targetVillage}.`);
      // ONLY reset form on verified successful response
      handleReset();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan laporan.');
      // Form state is preserved
    } finally {
      setIsSubmitting(false);
    }
  };

  const validationError = validateSubmission();
  const isSubmitDisabled = isSubmitting || validationError !== null;

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FilePlus2 className="w-6 h-6 text-blue-600" />
            <span>Input Laporan Pelayanan</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Form pencatatan rekapitulasi 11 layanan kependudukan dan mutasi penduduk
          </p>
        </div>
      </div>

      {/* Alert Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start space-x-3 text-emerald-900 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">Laporan Berhasil Disimpan</p>
            <p className="text-xs text-emerald-800 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start space-x-3 text-rose-900 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">Validasi Gagal</p>
            <p className="text-xs text-rose-800 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Real-time Parameter Requirement Notice */}
      {!errorMessage && validationError && (quantities['Pindah Datang'] > 0 || quantities['Pindah Keluar'] > 0 || quantities['Akta Kelahiran'] > 0 || quantities['Akta Kematian'] > 0) && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start space-x-3 text-amber-900 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">
              {quantities['Akta Kelahiran'] > 0 && !isKelahiranGenderValid
                ? 'Komposisi Jenis Kelamin Kelahiran Belum Lengkap'
                : quantities['Akta Kematian'] > 0 && !isKematianGenderValid
                ? 'Komposisi Jenis Kelamin Kematian Belum Lengkap'
                : quantities['Akta Kematian'] > 0 && !isKematianShdkValid
                ? 'Komposisi SHDK Kematian Belum Lengkap'
                : 'Parameter / Demografi Belum Lengkap'}
            </p>
            <p className="text-xs text-amber-800 mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BAGIAN 1: INFORMASI WILAYAH & PERIODE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>1. Informasi Wilayah & Periode Laporan</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">Elemen Input Wajib</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Provinsi (Wajib: DKI Jakarta) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Provinsi
              </label>
              <input
                type="text"
                value={province}
                readOnly
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold cursor-not-allowed"
              />
            </div>

            {/* Kota Administrasi (Wajib: Kota Adm. Jakarta Selatan) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Kota Administrasi
              </label>
              <input
                type="text"
                value={regency}
                readOnly
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold cursor-not-allowed"
              />
            </div>

            {/* Kecamatan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Kecamatan <span className="text-rose-500">*</span>
              </label>
              {user.role === 'KELURAHAN' || user.role === 'KECAMATAN' ? (
                <input
                  type="text"
                  value={user.district}
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-800 text-sm font-semibold cursor-not-allowed"
                />
              ) : (
                <select
                  id="input-kecamatan-select"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {JAKARTA_SELATAN_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Kelurahan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Kelurahan <span className="text-rose-500">*</span>
              </label>
              {user.role === 'KELURAHAN' ? (
                <input
                  type="text"
                  value={user.village}
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-800 text-sm font-semibold cursor-not-allowed"
                />
              ) : (
                <select
                  id="input-kelurahan-select"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {currentDistrictObj.villages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Periode: Tanggal Laporan */}
          <div className="pt-2">
            <div className="max-w-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tanggal Laporan (Periode) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-tanggal-laporan"
                  type="date"
                  required
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: 11 JENIS PELAYANAN & INPUT JUMLAH */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>2. Rekapitulasi 11 Jenis Pelayanan</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan jumlah pelayanan yang dilakukan pada tanggal laporan
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Total Pelayanan: </span>
              <span className="text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {calculateTotalInputted().toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICE_TYPES.map((service, idx) => {
              const qty = quantities[service.name] || 0;
              const isPindah = service.name === 'Pindah Datang' || service.name === 'Pindah Keluar';

              return (
                <div
                  key={service.id}
                  className={`p-4 rounded-xl border transition ${
                    qty > 0
                      ? 'border-blue-500 bg-blue-50/40 shadow-xs ring-1 ring-blue-400/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      {idx + 1}. {service.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-600">
                      {service.category}
                    </span>
                  </div>

                  <div className="mt-2">
                    <label className="block text-[11px] text-slate-500 font-medium mb-1">
                      Jumlah Pelayanan
                    </label>
                    <input
                      id={`input-qty-${service.id}`}
                      name={`qty_${service.id}`}
                      data-service-name={service.name}
                      type="number"
                      min="0"
                      value={qty === 0 ? '' : qty}
                      onChange={(e) => handleQuantityChange(service.name, e.target.value)}
                      onInput={(e: any) => handleQuantityChange(service.name, e.target.value)}
                      placeholder="0"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
                    />
                  </div>

                  {isPindah && qty > 0 && (
                    <div className="mt-2 text-[11px] text-blue-700 font-semibold bg-blue-100/70 p-1.5 rounded flex items-center gap-1">
                      <Info className="w-3 h-3 text-blue-600" />
                      Lengkapi parameter wilayah di bawah
                    </div>
                  )}

                  {service.name === 'Akta Kelahiran' && qty > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1">
                          <Users className="w-3 h-3 text-purple-600" />
                          <span>Komposisi Jenis Kelamin</span>
                        </span>
                        <span
                          id="kelahiran-card-gender-total"
                          className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            isKelahiranGenderValid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {kelahiranTotalGender} / {qty}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                            Laki-laki <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="input-kelahiran-male"
                            type="number"
                            min="0"
                            value={kelahiranGender.male === 0 ? '' : kelahiranGender.male}
                            onChange={(e) => handleKelahiranGenderChange('male', e.target.value)}
                            placeholder="0"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                            Perempuan <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="input-kelahiran-female"
                            type="number"
                            min="0"
                            value={kelahiranGender.female === 0 ? '' : kelahiranGender.female}
                            onChange={(e) => handleKelahiranGenderChange('female', e.target.value)}
                            placeholder="0"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-purple-800 bg-purple-50/80 px-2 py-1 rounded border border-purple-200/60 font-medium">
                        <span>SHDK: <strong>Anak (Otomatis)</strong></span>
                        <span>{qty} jiwa</span>
                      </div>

                      <div className="pt-1">
                        {!isKelahiranGenderValid ? (
                          <p className="text-[10px] text-rose-700 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Total Laki-laki + Perempuan harus sama dengan {qty}.</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Komposisi sesuai ({kelahiranTotalGender} jiwa).</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {service.name === 'Akta Kematian' && qty > 0 && (
                    <div className="mt-3 pt-3 border-t border-rose-200/80 space-y-2.5">
                      {/* Gender Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1">
                          <Users className="w-3 h-3 text-rose-600" />
                          <span>Komposisi Jenis Kelamin</span>
                        </span>
                        <span
                          id="kematian-card-gender-total"
                          className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            isKematianGenderValid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {kematianTotalGender} / {qty}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                            Laki-laki <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="input-kematian-male"
                            type="number"
                            min="0"
                            value={kematianGender.male === 0 ? '' : kematianGender.male}
                            onChange={(e) => handleKematianGenderChange('male', e.target.value)}
                            placeholder="0"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                            Perempuan <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="input-kematian-female"
                            type="number"
                            min="0"
                            value={kematianGender.female === 0 ? '' : kematianGender.female}
                            onChange={(e) => handleKematianGenderChange('female', e.target.value)}
                            placeholder="0"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* SHDK Header */}
                      <div className="flex items-center justify-between pt-1 border-t border-rose-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1">
                          <Users className="w-3 h-3 text-rose-600" />
                          <span>Komposisi SHDK</span>
                        </span>
                        <span
                          id="kematian-card-shdk-total"
                          className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            isKematianShdkValid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {kematianTotalShdk} / {qty}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="block text-[9px] font-semibold text-slate-600 truncate">Kep. Kel</label>
                          <input
                            id="input-kematian-card-shdk-kk"
                            type="number"
                            min="0"
                            value={kematianShdk.kepalaKeluarga === 0 ? '' : kematianShdk.kepalaKeluarga}
                            onChange={(e) => handleKematianShdkChange('kepalaKeluarga', e.target.value)}
                            placeholder="0"
                            className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-800 text-right focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-slate-600 truncate">Istri</label>
                          <input
                            id="input-kematian-card-shdk-istri"
                            type="number"
                            min="0"
                            value={kematianShdk.istri === 0 ? '' : kematianShdk.istri}
                            onChange={(e) => handleKematianShdkChange('istri', e.target.value)}
                            placeholder="0"
                            className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-800 text-right focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-slate-600 truncate">Anak</label>
                          <input
                            id="input-kematian-card-shdk-anak"
                            type="number"
                            min="0"
                            value={kematianShdk.anak === 0 ? '' : kematianShdk.anak}
                            onChange={(e) => handleKematianShdkChange('anak', e.target.value)}
                            placeholder="0"
                            className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-800 text-right focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-slate-600 truncate">Orang Tua</label>
                          <input
                            id="input-kematian-card-shdk-ortu"
                            type="number"
                            min="0"
                            value={kematianShdk.orangTua === 0 ? '' : kematianShdk.orangTua}
                            onChange={(e) => handleKematianShdkChange('orangTua', e.target.value)}
                            placeholder="0"
                            className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-800 text-right focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-slate-600 truncate">Famili Lain</label>
                          <input
                            id="input-kematian-card-shdk-famili"
                            type="number"
                            min="0"
                            value={kematianShdk.familiLain === 0 ? '' : kematianShdk.familiLain}
                            onChange={(e) => handleKematianShdkChange('familiLain', e.target.value)}
                            placeholder="0"
                            className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-800 text-right focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-slate-600 truncate">Lainnya</label>
                          <input
                            id="input-kematian-card-shdk-lainnya"
                            type="number"
                            min="0"
                            value={kematianShdk.lainnya === 0 ? '' : kematianShdk.lainnya}
                            onChange={(e) => handleKematianShdkChange('lainnya', e.target.value)}
                            placeholder="0"
                            className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-800 text-right focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                      </div>

                      <div className="pt-1">
                        {!isKematianGenderValid ? (
                          <p className="text-[10px] text-rose-700 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Total Laki-laki + Perempuan harus sama dengan {qty}.</span>
                          </p>
                        ) : !isKematianShdkValid ? (
                          <p className="text-[10px] text-rose-700 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Total SHDK harus sama dengan {qty}.</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Komposisi sesuai ({qty} jiwa).</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BAGIAN 3: SUB-FORM PINDAH DATANG (Wajib Cascading) */}
        <div className="bg-white p-6 rounded-2xl border border-teal-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-teal-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-teal-950 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span>3. Parameter Khusus: PINDAH DATANG</span>
              </h3>
              <p className="text-xs text-teal-700 mt-0.5">
                Konfigurasi mutasi penduduk masuk (Cascading Dropdown)
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              Jumlah: {quantities['Pindah Datang'] || 0}
            </span>
          </div>

          {/* Radio Kategori: 1. Datang dari Dalam DKI, 2. Datang dari Luar DKI */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Kategori Pindah Datang <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition ${
                  pindahDatangCategory === 'Datang dari Dalam DKI'
                    ? 'border-teal-500 bg-teal-50/70 shadow-2xs font-bold text-teal-950'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="pindah_datang_cat"
                  value="Datang dari Dalam DKI"
                  checked={pindahDatangCategory === 'Datang dari Dalam DKI'}
                  onChange={() => setPindahDatangCategory('Datang dari Dalam DKI')}
                  className="w-4 h-4 text-teal-600 mr-3 focus:ring-teal-500"
                />
                <span className="text-sm">1. Datang dari Dalam DKI</span>
              </label>

              <label
                className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition ${
                  pindahDatangCategory === 'Datang dari Luar DKI'
                    ? 'border-teal-500 bg-teal-50/70 shadow-2xs font-bold text-teal-950'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="pindah_datang_cat"
                  value="Datang dari Luar DKI"
                  checked={pindahDatangCategory === 'Datang dari Luar DKI'}
                  onChange={() => setPindahDatangCategory('Datang dari Luar DKI')}
                  className="w-4 h-4 text-teal-600 mr-3 focus:ring-teal-500"
                />
                <span className="text-sm">2. Datang dari Luar DKI</span>
              </label>
            </div>
          </div>

          {/* Cascading Dropdown: JIKA Datang dari Dalam DKI -> TUJUAN (Kota Administrasi -> Kecamatan -> Kelurahan) */}
          {pindahDatangCategory === 'Datang dari Dalam DKI' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <span>TUJUAN Mutasi Dalam DKI</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Kota Administrasi */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Kota Administrasi
                  </label>
                  <select
                    id="pd-tujuan-kota"
                    value={pdTujuanKota}
                    onChange={(e) => {
                      setPdTujuanKota(e.target.value);
                      setPdTujuanKecamatan('');
                      setPdTujuanKelurahan('');
                    }}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {DKI_JAKARTA_REGENCIES.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Kecamatan (Cascading) */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Kecamatan
                  </label>
                  <select
                    id="pd-tujuan-kecamatan"
                    value={pdTujuanKecamatan}
                    onChange={(e) => {
                      setPdTujuanKecamatan(e.target.value);
                      setPdTujuanKelurahan('');
                    }}
                    disabled={!pdTujuanKota}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">-- Pilih Kecamatan --</option>
                    {pdKotaDistricts.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Kelurahan (Cascading) */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Kelurahan
                  </label>
                  <select
                    id="pd-tujuan-kelurahan"
                    value={pdTujuanKelurahan}
                    onChange={(e) => setPdTujuanKelurahan(e.target.value)}
                    disabled={!pdTujuanKecamatan}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">-- Pilih Kelurahan --</option>
                    {pdKecVillages.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Cascading Dropdown: JIKA Datang dari Luar DKI -> ASAL (Provinsi -> Kab/Kota -> Kecamatan -> Desa/Kelurahan) */}
          {pindahDatangCategory === 'Datang dari Luar DKI' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <span>ASAL Mutasi Luar DKI (Cascading Bertingkat)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Provinsi */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    1. Provinsi Asal
                  </label>
                  <select
                    id="pd-asal-provinsi"
                    value={pdAsalProvinsi}
                    onChange={(e) => {
                      setPdAsalProvinsi(e.target.value);
                      setPdAsalKabupaten('');
                      setPdAsalKecamatan('');
                      setPdAsalDesa('');
                    }}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    {NATIONAL_PROVINCES.filter(p => p.name !== 'DKI Jakarta').map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Kabupaten/Kota (Aktif setelah Provinsi dipilih) */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    2. Kabupaten/Kota Asal
                  </label>
                  <select
                    id="pd-asal-kabupaten"
                    value={pdAsalKabupaten}
                    onChange={(e) => {
                      setPdAsalKabupaten(e.target.value);
                      setPdAsalKecamatan('');
                      setPdAsalDesa('');
                    }}
                    disabled={!pdAsalProvinsi}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {pdAsalProvinsi ? '-- Pilih Kab/Kota --' : '(Pilih Provinsi Dahulu)'}
                    </option>
                    {pdRegencies.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Kecamatan (Aktif setelah Kab/Kota dipilih) */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    3. Kecamatan Asal
                  </label>
                  <select
                    id="pd-asal-kecamatan"
                    value={pdAsalKecamatan}
                    onChange={(e) => {
                      setPdAsalKecamatan(e.target.value);
                      setPdAsalDesa('');
                    }}
                    disabled={!pdAsalKabupaten}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {pdAsalKabupaten ? '-- Pilih Kecamatan --' : '(Pilih Kab/Kota Dahulu)'}
                    </option>
                    {pdDistricts.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Desa/Kelurahan (Aktif setelah Kecamatan dipilih) */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    4. Desa/Kelurahan Asal
                  </label>
                  <select
                    id="pd-asal-desa"
                    value={pdAsalDesa}
                    onChange={(e) => setPdAsalDesa(e.target.value)}
                    disabled={!pdAsalKecamatan}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {pdAsalKecamatan ? '-- Pilih Desa/Kelurahan --' : '(Pilih Kecamatan Dahulu)'}
                    </option>
                    {pdVillages.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Form Data Demografi PINDAH DATANG (Hanya muncul jika Pindah Datang > 0) */}
          {quantities['Pindah Datang'] > 0 && (
            <div className="pt-4 border-t border-teal-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-teal-50/60 p-3 rounded-xl border border-teal-200/70">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-950 flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>Data Demografi Pindah Datang</span>
                  </h4>
                  <p className="text-[11px] text-teal-700 mt-0.5">
                    Wajib memasukkan rincian Jenis Kelamin dan SHDK sesuai jumlah pelayanan ({quantities['Pindah Datang']} jiwa)
                  </p>
                </div>
                {isPdGenderValid && isPdShdkValid ? (
                  <span className="self-start sm:self-auto text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Data demografi lengkap dan sesuai jumlah Pindah Datang.</span>
                  </span>
                ) : (
                  <span className="self-start sm:self-auto text-xs font-bold text-rose-800 bg-rose-100/90 px-3 py-1 rounded-lg border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Demografi Belum Seimbang</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. Komposisi Jenis Kelamin */}
                <div
                  className={`p-4 rounded-xl border transition ${
                    isPdGenderValid
                      ? 'bg-emerald-50/30 border-emerald-200 ring-1 ring-emerald-400/20'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <span>Komposisi Jenis Kelamin</span>
                    </h5>
                    <div className="text-xs font-semibold flex items-center gap-1">
                      <span className="text-slate-500">Total:</span>
                      <span
                        id="pd-gender-total-display"
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          isPdGenderValid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {pdTotalGender} / {quantities['Pindah Datang']}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Laki-laki <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="input-pd-male"
                        type="number"
                        min="0"
                        value={pdGender.male === 0 ? '' : pdGender.male}
                        onChange={(e) => handlePdGenderChange('male', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Perempuan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="input-pd-female"
                        type="number"
                        min="0"
                        value={pdGender.female === 0 ? '' : pdGender.female}
                        onChange={(e) => handlePdGenderChange('female', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Feedback Message for Jenis Kelamin */}
                  <div className="mt-3 pt-2 border-t border-slate-200/70">
                    {!isPdGenderValid ? (
                      <p className="text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>
                          Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus {quantities['Pindah Datang']}.
                        </span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Komposisi jenis kelamin sesuai ({pdTotalGender} jiwa).</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Komposisi SHDK */}
                <div
                  className={`p-4 rounded-xl border transition ${
                    isPdShdkValid
                      ? 'bg-emerald-50/30 border-emerald-200 ring-1 ring-emerald-400/20'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <span>Komposisi SHDK</span>
                    </h5>
                    <div className="text-xs font-semibold flex items-center gap-1">
                      <span className="text-slate-500">Total:</span>
                      <span
                        id="pd-shdk-total-display"
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          isPdShdkValid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {pdTotalShdk} / {quantities['Pindah Datang']}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Kepala Keluarga
                      </label>
                      <input
                        id="input-pd-shdk-kepala-keluarga"
                        type="number"
                        min="0"
                        value={pdShdk.kepalaKeluarga === 0 ? '' : pdShdk.kepalaKeluarga}
                        onChange={(e) => handlePdShdkChange('kepalaKeluarga', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Istri
                      </label>
                      <input
                        id="input-pd-shdk-istri"
                        type="number"
                        min="0"
                        value={pdShdk.istri === 0 ? '' : pdShdk.istri}
                        onChange={(e) => handlePdShdkChange('istri', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Anak
                      </label>
                      <input
                        id="input-pd-shdk-anak"
                        type="number"
                        min="0"
                        value={pdShdk.anak === 0 ? '' : pdShdk.anak}
                        onChange={(e) => handlePdShdkChange('anak', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Orang Tua
                      </label>
                      <input
                        id="input-pd-shdk-orang-tua"
                        type="number"
                        min="0"
                        value={pdShdk.orangTua === 0 ? '' : pdShdk.orangTua}
                        onChange={(e) => handlePdShdkChange('orangTua', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Famili Lain
                      </label>
                      <input
                        id="input-pd-shdk-famili-lain"
                        type="number"
                        min="0"
                        value={pdShdk.familiLain === 0 ? '' : pdShdk.familiLain}
                        onChange={(e) => handlePdShdkChange('familiLain', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Lainnya
                      </label>
                      <input
                        id="input-pd-shdk-lainnya"
                        type="number"
                        min="0"
                        value={pdShdk.lainnya === 0 ? '' : pdShdk.lainnya}
                        onChange={(e) => handlePdShdkChange('lainnya', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Feedback Message for SHDK */}
                  <div className="mt-3 pt-2 border-t border-slate-200/70">
                    {!isPdShdkValid ? (
                      <p className="text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>
                          Komposisi SHDK belum lengkap. Total SHDK harus {quantities['Pindah Datang']}.
                        </span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Komposisi SHDK sesuai ({pdTotalShdk} jiwa).</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BAGIAN 4: SUB-FORM PINDAH KELUAR (Wajib Cascading) */}
        <div className="bg-white p-6 rounded-2xl border border-amber-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>4. Parameter Khusus: PINDAH KELUAR</span>
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Konfigurasi mutasi penduduk keluar (Cascading Dropdown)
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Jumlah: {quantities['Pindah Keluar'] || 0}
            </span>
          </div>

          {/* Radio Kategori: 1. Pindah Dalam DKI, 2. Pindah Keluar DKI */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Kategori Pindah Keluar <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition ${
                  pindahKeluarCategory === 'Pindah Dalam DKI'
                    ? 'border-amber-500 bg-amber-50/70 shadow-2xs font-bold text-amber-950'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="pindah_keluar_cat"
                  value="Pindah Dalam DKI"
                  checked={pindahKeluarCategory === 'Pindah Dalam DKI'}
                  onChange={() => setPindahKeluarCategory('Pindah Dalam DKI')}
                  className="w-4 h-4 text-amber-600 mr-3 focus:ring-amber-500"
                />
                <span className="text-sm">1. Pindah Dalam DKI</span>
              </label>

              <label
                className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition ${
                  pindahKeluarCategory === 'Pindah Keluar DKI'
                    ? 'border-amber-500 bg-amber-50/70 shadow-2xs font-bold text-amber-950'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="pindah_keluar_cat"
                  value="Pindah Keluar DKI"
                  checked={pindahKeluarCategory === 'Pindah Keluar DKI'}
                  onChange={() => setPindahKeluarCategory('Pindah Keluar DKI')}
                  className="w-4 h-4 text-amber-600 mr-3 focus:ring-amber-500"
                />
                <span className="text-sm">2. Pindah Keluar DKI</span>
              </label>
            </div>
          </div>

          {/* Cascading Dropdown: JIKA Pindah Dalam DKI -> ASAL (Kota Administrasi -> Kecamatan -> Kelurahan) */}
          {pindahKeluarCategory === 'Pindah Dalam DKI' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <span>ASAL Mutasi Dalam DKI</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Kota Administrasi */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Kota Administrasi
                  </label>
                  <select
                    id="pk-asal-kota"
                    value={pkAsalKota}
                    onChange={(e) => {
                      setPkAsalKota(e.target.value);
                      setPkAsalKecamatan('');
                      setPkAsalKelurahan('');
                    }}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {DKI_JAKARTA_REGENCIES.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Kecamatan (Cascading) */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Kecamatan
                  </label>
                  <select
                    id="pk-asal-kecamatan"
                    value={pkAsalKecamatan}
                    onChange={(e) => {
                      setPkAsalKecamatan(e.target.value);
                      setPkAsalKelurahan('');
                    }}
                    disabled={!pkAsalKota}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">-- Pilih Kecamatan --</option>
                    {pkKotaDistricts.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Kelurahan (Cascading) */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Kelurahan
                  </label>
                  <select
                    id="pk-asal-kelurahan"
                    value={pkAsalKelurahan}
                    onChange={(e) => setPkAsalKelurahan(e.target.value)}
                    disabled={!pkAsalKecamatan}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">-- Pilih Kelurahan --</option>
                    {pkKecVillages.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Cascading Dropdown: JIKA Pindah Keluar DKI -> TUJUAN (Provinsi -> Kab/Kota -> Kecamatan -> Desa/Kelurahan) */}
          {pindahKeluarCategory === 'Pindah Keluar DKI' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <span>TUJUAN Mutasi Keluar DKI (Cascading Bertingkat)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Provinsi */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    1. Provinsi Tujuan
                  </label>
                  <select
                    id="pk-tujuan-provinsi"
                    value={pkTujuanProvinsi}
                    onChange={(e) => {
                      setPkTujuanProvinsi(e.target.value);
                      setPkTujuanKabupaten('');
                      setPkTujuanKecamatan('');
                      setPkTujuanDesa('');
                    }}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    {NATIONAL_PROVINCES.filter(p => p.name !== 'DKI Jakarta').map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Kabupaten/Kota (Aktif setelah Provinsi dipilih) */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    2. Kabupaten/Kota Tujuan
                  </label>
                  <select
                    id="pk-tujuan-kabupaten"
                    value={pkTujuanKabupaten}
                    onChange={(e) => {
                      setPkTujuanKabupaten(e.target.value);
                      setPkTujuanKecamatan('');
                      setPkTujuanDesa('');
                    }}
                    disabled={!pkTujuanProvinsi}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {pkTujuanProvinsi ? '-- Pilih Kab/Kota --' : '(Pilih Provinsi Dahulu)'}
                    </option>
                    {pkRegencies.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Kecamatan (Aktif setelah Kab/Kota dipilih) */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    3. Kecamatan Tujuan
                  </label>
                  <select
                    id="pk-tujuan-kecamatan"
                    value={pkTujuanKecamatan}
                    onChange={(e) => {
                      setPkTujuanKecamatan(e.target.value);
                      setPkTujuanDesa('');
                    }}
                    disabled={!pkTujuanKabupaten}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {pkTujuanKabupaten ? '-- Pilih Kecamatan --' : '(Pilih Kab/Kota Dahulu)'}
                    </option>
                    {pkDistricts.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Desa/Kelurahan (Aktif setelah Kecamatan dipilih) */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    4. Desa/Kelurahan Tujuan
                  </label>
                  <select
                    id="pk-tujuan-desa"
                    value={pkTujuanDesa}
                    onChange={(e) => setPkTujuanDesa(e.target.value)}
                    disabled={!pkTujuanKecamatan}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {pkTujuanKecamatan ? '-- Pilih Desa/Kelurahan --' : '(Pilih Kecamatan Dahulu)'}
                    </option>
                    {pkVillages.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Form Data Demografi PINDAH KELUAR (Wajib muncul jika Pindah Keluar > 0) */}
          {quantities['Pindah Keluar'] > 0 && (
            <div className="pt-4 border-t border-amber-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200/70">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>Data Demografi Pindah Keluar</span>
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Wajib memasukkan rincian Jenis Kelamin dan SHDK sesuai jumlah pelayanan ({quantities['Pindah Keluar']} jiwa)
                  </p>
                </div>
                {isPkGenderValid && isPkShdkValid ? (
                  <span className="self-start sm:self-auto text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Data demografi lengkap dan sesuai jumlah Pindah Keluar.</span>
                  </span>
                ) : (
                  <span className="self-start sm:self-auto text-xs font-bold text-rose-800 bg-rose-100/90 px-3 py-1 rounded-lg border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Demografi Belum Seimbang</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. Komposisi Jenis Kelamin */}
                <div
                  className={`p-4 rounded-xl border transition ${
                    isPkGenderValid
                      ? 'bg-emerald-50/30 border-emerald-200 ring-1 ring-emerald-400/20'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <span>Komposisi Jenis Kelamin</span>
                    </h5>
                    <div className="text-xs font-semibold flex items-center gap-1">
                      <span className="text-slate-500">Total:</span>
                      <span
                        id="pk-gender-total-display"
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          isPkGenderValid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {pkTotalGender} / {quantities['Pindah Keluar']}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Laki-laki <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="input-pk-male"
                        type="number"
                        min="0"
                        value={pkGender.male === 0 ? '' : pkGender.male}
                        onChange={(e) => handlePkGenderChange('male', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Perempuan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="input-pk-female"
                        type="number"
                        min="0"
                        value={pkGender.female === 0 ? '' : pkGender.female}
                        onChange={(e) => handlePkGenderChange('female', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Feedback Message for Jenis Kelamin */}
                  <div className="mt-3 pt-2 border-t border-slate-200/70">
                    {!isPkGenderValid ? (
                      <p className="text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>
                          Komposisi jenis kelamin belum lengkap. Total Laki-laki + Perempuan harus {quantities['Pindah Keluar']}.
                        </span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Komposisi jenis kelamin sesuai ({pkTotalGender} jiwa).</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Komposisi SHDK */}
                <div
                  className={`p-4 rounded-xl border transition ${
                    isPkShdkValid
                      ? 'bg-emerald-50/30 border-emerald-200 ring-1 ring-emerald-400/20'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <span>Komposisi SHDK</span>
                    </h5>
                    <div className="text-xs font-semibold flex items-center gap-1">
                      <span className="text-slate-500">Total:</span>
                      <span
                        id="pk-shdk-total-display"
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          isPkShdkValid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {pkTotalShdk} / {quantities['Pindah Keluar']}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Kepala Keluarga
                      </label>
                      <input
                        id="input-pk-shdk-kepala-keluarga"
                        type="number"
                        min="0"
                        value={pkShdk.kepalaKeluarga === 0 ? '' : pkShdk.kepalaKeluarga}
                        onChange={(e) => handlePkShdkChange('kepalaKeluarga', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Istri
                      </label>
                      <input
                        id="input-pk-shdk-istri"
                        type="number"
                        min="0"
                        value={pkShdk.istri === 0 ? '' : pkShdk.istri}
                        onChange={(e) => handlePkShdkChange('istri', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Anak
                      </label>
                      <input
                        id="input-pk-shdk-anak"
                        type="number"
                        min="0"
                        value={pkShdk.anak === 0 ? '' : pkShdk.anak}
                        onChange={(e) => handlePkShdkChange('anak', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Orang Tua
                      </label>
                      <input
                        id="input-pk-shdk-orang-tua"
                        type="number"
                        min="0"
                        value={pkShdk.orangTua === 0 ? '' : pkShdk.orangTua}
                        onChange={(e) => handlePkShdkChange('orangTua', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Famili Lain
                      </label>
                      <input
                        id="input-pk-shdk-famili-lain"
                        type="number"
                        min="0"
                        value={pkShdk.familiLain === 0 ? '' : pkShdk.familiLain}
                        onChange={(e) => handlePkShdkChange('familiLain', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Lainnya
                      </label>
                      <input
                        id="input-pk-shdk-lainnya"
                        type="number"
                        min="0"
                        value={pkShdk.lainnya === 0 ? '' : pkShdk.lainnya}
                        onChange={(e) => handlePkShdkChange('lainnya', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Feedback Message for SHDK */}
                  <div className="mt-3 pt-2 border-t border-slate-200/70">
                    {!isPkShdkValid ? (
                      <p className="text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>
                          Komposisi SHDK belum lengkap. Total SHDK harus {quantities['Pindah Keluar']}.
                        </span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Komposisi SHDK sesuai ({pkTotalShdk} jiwa).</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BAGIAN 5: SUB-FORM AKTA KELAHIRAN (Wajib Muncul jika Akta Kelahiran > 0) */}
        {quantities['Akta Kelahiran'] > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-purple-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-purple-950 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>5. Parameter Khusus: AKTA KELAHIRAN</span>
                </h3>
                <p className="text-xs text-purple-700 mt-0.5">
                  Pencatatan Demografi Kelahiran (Komposisi Jenis Kelamin & SHDK Otomatis)
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                Jumlah: {quantities['Akta Kelahiran']}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-purple-50/60 p-3 rounded-xl border border-purple-200/70">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Komposisi Jenis Kelamin Kelahiran</span>
                </h4>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  Wajib memasukkan rincian Jenis Kelamin sesuai jumlah Akta Kelahiran ({quantities['Akta Kelahiran']} jiwa)
                </p>
              </div>
              {isKelahiranGenderValid ? (
                <span className="self-start sm:self-auto text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>✓ Data demografi lengkap dan sesuai jumlah Akta Kelahiran.</span>
                </span>
              ) : (
                <span className="self-start sm:self-auto text-xs font-bold text-rose-800 bg-rose-100/90 px-3 py-1 rounded-lg border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Demografi Belum Lengkap</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 1. Komposisi Jenis Kelamin */}
              <div
                className={`p-4 rounded-xl border transition ${
                  isKelahiranGenderValid
                    ? 'bg-emerald-50/30 border-emerald-200 ring-1 ring-emerald-400/20'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <span>Komposisi Jenis Kelamin</span>
                  </h5>
                  <div className="text-xs font-semibold flex items-center gap-1">
                    <span className="text-slate-500">Total:</span>
                    <span
                      id="kelahiran-section-gender-total"
                      className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        isKelahiranGenderValid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {kelahiranTotalGender} / {quantities['Akta Kelahiran']}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Laki-laki <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-kelahiran-section-male"
                      type="number"
                      min="0"
                      value={kelahiranGender.male === 0 ? '' : kelahiranGender.male}
                      onChange={(e) => handleKelahiranGenderChange('male', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Perempuan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-kelahiran-section-female"
                      type="number"
                      min="0"
                      value={kelahiranGender.female === 0 ? '' : kelahiranGender.female}
                      onChange={(e) => handleKelahiranGenderChange('female', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Feedback Message for Jenis Kelamin */}
                <div className="mt-3 pt-2 border-t border-slate-200/70">
                  {!isKelahiranGenderValid ? (
                    <p className="text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>
                        Total Laki-laki + Perempuan harus sama dengan jumlah Akta Kelahiran.
                      </span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Komposisi jenis kelamin sesuai ({kelahiranTotalGender} jiwa).</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Status Hubungan Dalam Keluarga (SHDK) Otomatis */}
              <div className="p-4 rounded-xl border bg-purple-50/30 border-purple-200 ring-1 ring-purple-400/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                      <span>Status Hubungan Keluarga (SHDK)</span>
                    </h5>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded border border-purple-200">
                      Otomatis: Anak
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    Sesuai ketentuan standar pencatatan sipil, seluruh bayi pada pelaporan <strong>Akta Kelahiran</strong> secara otomatis diklasifikasikan dengan SHDK:
                  </p>

                  <div className="p-3 bg-white rounded-lg border border-purple-200 shadow-2xs flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">1. Anak</span>
                    <span className="text-xs font-black text-purple-700 font-mono bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                      {quantities['Akta Kelahiran']} Jiwa
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-purple-200/70">
                  <p className="text-[11px] text-purple-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>SHDK otomatis tersimpan sebagai <strong>Anak</strong> untuk analitik kependudukan.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BAGIAN 6: SUB-FORM AKTA KEMATIAN (Wajib Muncul jika Akta Kematian > 0) */}
        {quantities['Akta Kematian'] > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-rose-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-rose-950 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>6. Parameter Khusus: AKTA KEMATIAN</span>
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Pencatatan Demografi Kematian (Komposisi Jenis Kelamin & Komposisi SHDK)
                </p>
              </div>
              <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                Jumlah: {quantities['Akta Kematian']}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-rose-50/60 p-3 rounded-xl border border-rose-200/70">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-950 flex items-center gap-2">
                  <Users className="w-4 h-4 text-rose-600" />
                  <span>Parameter Demografi Jenazah (Kematian)</span>
                </h4>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Wajib mengisi rincian Jenis Kelamin dan Hubungan Keluarga sesuai jumlah Akta Kematian ({quantities['Akta Kematian']} jiwa)
                </p>
              </div>
              {isKematianGenderValid && isKematianShdkValid ? (
                <span className="self-start sm:self-auto text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>✓ Data demografi lengkap dan sesuai jumlah Akta Kematian.</span>
                </span>
              ) : (
                <span className="self-start sm:self-auto text-xs font-bold text-rose-800 bg-rose-100/90 px-3 py-1 rounded-lg border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Demografi Belum Lengkap</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 1. Komposisi Jenis Kelamin */}
              <div
                className={`p-4 rounded-xl border transition ${
                  isKematianGenderValid
                    ? 'bg-emerald-50/30 border-emerald-200 ring-1 ring-emerald-400/20'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <span>Komposisi Jenis Kelamin</span>
                  </h5>
                  <div className="text-xs font-semibold flex items-center gap-1">
                    <span className="text-slate-500">Total:</span>
                    <span
                      id="kematian-section-gender-total"
                      className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        isKematianGenderValid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {kematianTotalGender} / {quantities['Akta Kematian']}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Laki-laki <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-kematian-section-male"
                      type="number"
                      min="0"
                      value={kematianGender.male === 0 ? '' : kematianGender.male}
                      onChange={(e) => handleKematianGenderChange('male', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Perempuan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-kematian-section-female"
                      type="number"
                      min="0"
                      value={kematianGender.female === 0 ? '' : kematianGender.female}
                      onChange={(e) => handleKematianGenderChange('female', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Feedback Message for Jenis Kelamin */}
                <div className="mt-3 pt-2 border-t border-slate-200/70">
                  {!isKematianGenderValid ? (
                    <p className="text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>
                        Total Laki-laki + Perempuan harus sama dengan jumlah Akta Kematian.
                      </span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Komposisi jenis kelamin sesuai ({kematianTotalGender} jiwa).</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Komposisi SHDK (Status Hubungan Dalam Keluarga) */}
              <div
                className={`p-4 rounded-xl border transition ${
                  isKematianShdkValid
                    ? 'bg-emerald-50/30 border-emerald-200 ring-1 ring-emerald-400/20'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <span>Status Hubungan Dalam Keluarga (SHDK)</span>
                  </h5>
                  <div className="text-xs font-semibold flex items-center gap-1">
                    <span className="text-slate-500">Total:</span>
                    <span
                      id="kematian-section-shdk-total"
                      className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        isKematianShdkValid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {kematianTotalShdk} / {quantities['Akta Kematian']}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Kepala Keluarga
                    </label>
                    <input
                      id="input-kematian-shdk-kk"
                      type="number"
                      min="0"
                      value={kematianShdk.kepalaKeluarga === 0 ? '' : kematianShdk.kepalaKeluarga}
                      onChange={(e) => handleKematianShdkChange('kepalaKeluarga', e.target.value)}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Istri
                    </label>
                    <input
                      id="input-kematian-shdk-istri"
                      type="number"
                      min="0"
                      value={kematianShdk.istri === 0 ? '' : kematianShdk.istri}
                      onChange={(e) => handleKematianShdkChange('istri', e.target.value)}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Anak
                    </label>
                    <input
                      id="input-kematian-shdk-anak"
                      type="number"
                      min="0"
                      value={kematianShdk.anak === 0 ? '' : kematianShdk.anak}
                      onChange={(e) => handleKematianShdkChange('anak', e.target.value)}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Orang Tua
                    </label>
                    <input
                      id="input-kematian-shdk-ortu"
                      type="number"
                      min="0"
                      value={kematianShdk.orangTua === 0 ? '' : kematianShdk.orangTua}
                      onChange={(e) => handleKematianShdkChange('orangTua', e.target.value)}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Famili Lain
                    </label>
                    <input
                      id="input-kematian-shdk-famili"
                      type="number"
                      min="0"
                      value={kematianShdk.familiLain === 0 ? '' : kematianShdk.familiLain}
                      onChange={(e) => handleKematianShdkChange('familiLain', e.target.value)}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Lainnya
                    </label>
                    <input
                      id="input-kematian-shdk-lainnya"
                      type="number"
                      min="0"
                      value={kematianShdk.lainnya === 0 ? '' : kematianShdk.lainnya}
                      onChange={(e) => handleKematianShdkChange('lainnya', e.target.value)}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Feedback Message for SHDK */}
                <div className="mt-3 pt-2 border-t border-slate-200/70">
                  {!isKematianShdkValid ? (
                    <p className="text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>
                        Komposisi SHDK belum lengkap. Total SHDK harus {quantities['Akta Kematian']}.
                      </span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Komposisi SHDK sesuai ({kematianTotalShdk} jiwa).</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Form</span>
          </button>

          <button
            id="submit-laporan-btn"
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan Pelayanan'}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};
