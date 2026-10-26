import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import AdminNavbar from './components/AdminNavbar';
import AdminSidebar from './components/AdminSidebar';
import DashboardOverview from './components/DashboardOverview';
import TripManagement from './components/TripManagement';
import VehicleManagement from './components/VehicleManagement';
import RouteManagement from './components/RouteManagement';
import DriverManagement from './components/DriverManagement';
import MaintenanceManagement from './components/MaintenanceManagement';
import ReportManagement from './components/ReportManagement';
import CreateEntityModal from './components/CreateEntityModal';
import ConfirmMaintenanceModal from './components/ConfirmMaintenanceModal';
import { api } from './services/api';

const EMPTY_DATA = {
  trips: [], routes: [], overdue: [], safe: [], history: [],
  revenues: [], salaries: [], vehicles: [], drivers: []
};

// Tải toàn bộ dữ liệu từ backend; API nào lỗi thì giữ dữ liệu cũ và báo lỗi trên banner
async function fetchAllData() {
  const sources = {
    trips: api.getTrips(),
    routes: api.getRoutes(),
    overdue: api.getOverdueMaintenances(),
    safe: api.getSafeMaintenances(),
    history: api.getMaintenanceHistory(),
    revenues: api.getRevenues(),
    salaries: api.getSalaries(),
    vehicles: api.getAllVehicles(),
    drivers: api.getAllDrivers()
  };
  const keys = Object.keys(sources);
  const results = await Promise.allSettled(Object.values(sources));

  const loaded = {};
  let firstError = '';
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') loaded[keys[i]] = r.value;
    else firstError ||= r.reason.message;
  });
  return { loaded, firstError };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'trips' | 'vehicles' | 'routes' | 'drivers' | 'maintenance' | 'reports'
  const [data, setData] = useState(EMPTY_DATA);
  const [loadError, setLoadError] = useState('');

  // Modal thêm / sửa: null = đóng; key đổi mỗi lần mở để form khởi tạo lại
  const [entityModal, setEntityModal] = useState(null);
  const [vehicleToConfirm, setVehicleToConfirm] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const applyData = useCallback(({ loaded, firstError }) => {
    setData(prev => ({ ...prev, ...loaded }));
    setLoadError(firstError);
  }, []);
  const loadAllData = useCallback(() => fetchAllData().then(applyData), [applyData]);

  useEffect(() => {
    fetchAllData().then(applyData);
  }, [applyData]);

  const openEntityModal = (tab = 'trip', entity = null) => setEntityModal({ tab, entity, key: Date.now() });

  const deleteWithConfirm = async (question, action) => {
    if (!window.confirm(question)) return;
    try {
      await action();
      await loadAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTrip = (id) => deleteWithConfirm(`Xác nhận xóa chuyến xe #${id}?`, () => api.deleteTrip(id));
  const handleDeleteVehicle = (bienSo) => deleteWithConfirm(`Xác nhận xóa phương tiện ${bienSo}?`, () => api.deleteVehicle(bienSo));
  const handleDeleteDriver = (id) => deleteWithConfirm(`Xác nhận xóa hồ sơ tài xế #${id}?`, () => api.deleteDriver(id));
  const handleDeleteRoute = (id) => deleteWithConfirm(`Xác nhận xóa tuyến đường #${id}?`, () => api.deleteRoute(id));

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">

      {/* Top Admin Header */}
      <AdminNavbar
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        overdueCount={data.overdue.length}
        onNavigateTab={setActiveTab}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">

        {loadError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex flex-col sm:flex-row sm:items-center gap-3" role="alert">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <span className="flex-1">Không tải được dữ liệu từ máy chủ: {loadError}</span>
            <button
              onClick={loadAllData}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer self-start"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        <main className="w-full">

          {activeTab === 'dashboard' && (
            <DashboardOverview
              trips={data.trips}
              vehicles={data.vehicles}
              routes={data.routes}
              drivers={data.drivers}
              overdueVehicles={data.overdue}
              safeVehicles={data.safe}
              onNavigateTab={setActiveTab}
              onOpenCreate={openEntityModal}
              onConfirmMaintenance={setVehicleToConfirm}
            />
          )}

          {activeTab === 'trips' && (
            <TripManagement
              trips={data.trips}
              onOpenCreate={openEntityModal}
              onEditTrip={(trip) => openEntityModal('trip', trip)}
              onDeleteTrip={handleDeleteTrip}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehicleManagement
              vehicles={data.vehicles}
              overdueList={data.overdue}
              onOpenCreate={openEntityModal}
              onEditVehicle={(vehicle) => openEntityModal('vehicle', vehicle)}
              onConfirmMaintenance={setVehicleToConfirm}
              onDeleteVehicle={handleDeleteVehicle}
            />
          )}

          {activeTab === 'routes' && (
            <RouteManagement
              routes={data.routes}
              onOpenCreate={openEntityModal}
              onEditRoute={(route) => openEntityModal('route', route)}
              onDeleteRoute={handleDeleteRoute}
            />
          )}

          {activeTab === 'drivers' && (
            <DriverManagement
              drivers={data.drivers}
              salaries={data.salaries}
              onOpenCreate={openEntityModal}
              onEditDriver={(driver) => openEntityModal('driver', driver)}
              onDeleteDriver={handleDeleteDriver}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceManagement
              overdueVehicles={data.overdue}
              safeVehicles={data.safe}
              maintenanceHistory={data.history}
              onConfirmSuccess={loadAllData}
            />
          )}

          {activeTab === 'reports' && (
            <ReportManagement
              initialRevenues={data.revenues}
              initialSalaries={data.salaries}
            />
          )}

        </main>
      </div>

      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
          setIsSidebarOpen(false);
        }}
        overdueCount={data.overdue.length}
        tripsCount={data.trips.length}
        vehiclesCount={data.vehicles.length}
      />

      {vehicleToConfirm && (
        <ConfirmMaintenanceModal
          key={vehicleToConfirm.bienSo}
          onClose={() => setVehicleToConfirm(null)}
          vehicle={vehicleToConfirm}
          onSuccess={loadAllData}
        />
      )}

      {entityModal && (
        <CreateEntityModal
          key={entityModal.key}
          onClose={() => setEntityModal(null)}
          initialTab={entityModal.tab}
          editEntity={entityModal.entity}
          routes={data.routes}
          vehicles={data.vehicles}
          drivers={data.drivers}
          onSaved={loadAllData}
        />
      )}

    </div>
  );
}
