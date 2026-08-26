import React, { useState, useEffect } from 'react';
import { User, ServiceReport } from '../types';
import { JAKARTA_SELATAN_DISTRICTS, SERVICE_TYPES } from '../data/regionsData';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Calendar,
  RefreshCw,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';

interface DataLaporanViewProps {
  user: User;
  token: string;
}

export const DataLaporanView: React.FC<DataLaporanViewProps> = ({ user, token }) => {
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(
    user.role === 'KELURAHAN' || user.role === 'KECAMATAN' ? user.district || '' : ''
  );
  const [selectedVillage, setSelectedVillage] = useState(
    user.role === 'KELURAHAN' ? user.village || '' : ''
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (selectedVillage) params.append('village', selectedVillage);
      if (selectedService) params.append('serviceType', selectedService);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Gagal mengambil data laporan');
      const data = await res.json();
      setReports(data.reports || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedDistrict, selectedVillage, selectedService, startDate, endDate, searchTerm]);

  // District options
  const availableDistricts = user.role === 'SUDIN'
    ? JAKARTA_SELATAN_DISTRICTS
    : JAKARTA_SELATAN_DISTRICTS.filter(d => d.name === user.district);

  const currentDistrictObj = JAKARTA_SELATAN_DISTRICTS.find(d => d.name === selectedDistrict);
  const availableVillages = currentDistrictObj
    ? (user.role === 'KELURAHAN'
        ? currentDistrictObj.villages.filter(v => v === user.village)
        : currentDistrictObj.villages)
    : [];

  // Export CSV
  const handleExportCSV = () => {
    if (reports.length === 0) return;

    const headers = [
      'Tanggal',
      'Provinsi',
      'Kota Administrasi',
      'Kecamatan',
      'Kelurahan',
      'Jenis Pelayanan',
      'Kategori',
      'Detail Wilayah',
      'Jumlah'
    ];

    const csvRows = [
      headers.join(','),
      ...reports.map(r => [
        `"${r.reportDate}"`,
        `"${r.province}"`,
        `"${r.regency}"`,
        `"${r.district}"`,
        `"${r.village}"`,
        `"${r.serviceType}"`,
        `"${r.category || 'Pelayanan Reguler'}"`,
        `"${(r.detailRegion || '-').replace(/"/g, '""')}"`,
        r.quantity
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Data_Laporan_Pelayanan_Dukcapil_Jaksel_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination calculation
  const totalPages = Math.ceil(reports.length / itemsPerPage) || 1;
  const paginatedReports = reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalVolume = reports.reduce((acc, r) => acc + r.quantity, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>Data Laporan Pelayanan</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Daftar lengkap pelayanan resmi yang terdata di sistem
          </p>
        </div>

        {/* Stats & Export */}
        <div className="flex items-center space-x-3">
          <div className="text-right px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Total Pelayanan: </span>
            <span className="text-sm font-black text-blue-700">
              {totalVolume.toLocaleString('id-ID')} Pelayanan
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={reports.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kecamatan, kelurahan, layanan..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Filter Jenis Pelayanan */}
          <div>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Semua Layanan (11)</option>
              {SERVICE_TYPES.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Kecamatan (Scoped by Role) */}
          <div>
            {user.role === 'SUDIN' ? (
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedVillage('');
                }}
                className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Semua Kecamatan</option>
                {JAKARTA_SELATAN_DISTRICTS.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={`Kec. ${user.district}`}
                readOnly
                disabled
                className="w-full py-2 px-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600"
              />
            )}
          </div>

          {/* Filter Kelurahan (Scoped by Role) */}
          <div>
            {user.role === 'KELURAHAN' ? (
              <input
                type="text"
                value={`Kel. ${user.village}`}
                readOnly
                disabled
                className="w-full py-2 px-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600"
              />
            ) : (
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                disabled={!selectedDistrict && user.role === 'SUDIN'}
                className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">Semua Kelurahan</option>
                {availableVillages.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            )}
          </div>

          {/* Date Filter Start/End */}
          <div className="flex items-center space-x-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Dari"
              className="w-1/2 py-2 px-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Sampai"
              className="w-1/2 py-2 px-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Table (Strict Column Layout per Prompt Baseline) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-white uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">1. Tanggal</th>
                <th className="py-3.5 px-4">2. Provinsi</th>
                <th className="py-3.5 px-4">3. Kota Administrasi</th>
                <th className="py-3.5 px-4">4. Kecamatan</th>
                <th className="py-3.5 px-4">5. Kelurahan</th>
                <th className="py-3.5 px-4">6. Jenis Pelayanan</th>
                <th className="py-3.5 px-4">7. Kategori</th>
                <th className="py-3.5 px-4">8. Detail Wilayah</th>
                <th className="py-3.5 px-4 text-right">9. Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Memuat data laporan...
                  </td>
                </tr>
              ) : paginatedReports.length > 0 ? (
                paginatedReports.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/40 transition">
                    {/* 1. Tanggal */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {r.reportDate}
                    </td>

                    {/* 2. Provinsi */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {r.province}
                    </td>

                    {/* 3. Kota Administrasi */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {r.regency}
                    </td>

                    {/* 4. Kecamatan */}
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {r.district}
                    </td>

                    {/* 5. Kelurahan */}
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {r.village}
                    </td>

                    {/* 6. Jenis Pelayanan */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-bold text-blue-700">
                        {r.serviceType}
                      </span>
                    </td>

                    {/* 7. Kategori */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {r.category || 'Pelayanan Reguler'}
                      </span>
                    </td>

                    {/* 8. Detail Wilayah */}
                    <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate" title={r.detailRegion}>
                      {r.detailRegion || '-'}
                    </td>

                    {/* 9. Jumlah */}
                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                      {r.quantity.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada data laporan yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {reports.length > itemsPerPage && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, reports.length)} dari {reports.length} data
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-xs font-bold text-slate-700 bg-white rounded-lg border border-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
