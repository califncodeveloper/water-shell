/**
 * AquaPure Admin — Service & Maintenance Help Desk
 * 100% Live Real-Time Data from Cloud Firestore.
 * Dispatches technicians, updates service states, records resolution notes, zero mock data.
 */

import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  Clock,
  UserCheck,
  AlertCircle,
  ChevronRight,
  X,
  MapPin,
  CalendarClock,
  Inbox,
  Radio,
  RefreshCw,
  Ban,
  Phone,
  Save,
  Truck,
} from 'lucide-react';
import { db } from '../../services/firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import type { ServiceBooking, ServiceStatus } from '../../types';
import { DeliveryService } from '../../services/deliveryService';
import './ServicePage.css';

const SERVICE_FLOW: ServiceStatus[] = [
  'requested',
  'confirmed',
  'in_progress',
  'completed',
];

function parseBookingDate(val: unknown): Date | null {
  if (!val) return null;
  if (typeof (val as Record<string, unknown>)?.toDate === 'function') {
    return ((val as Record<string, unknown>).toDate as () => Date)();
  }
  if (typeof (val as Record<string, unknown>)?.seconds === 'number') {
    return new Date(((val as Record<string, unknown>).seconds as number) * 1000);
  }
  const d = new Date(val as string | number);
  return isNaN(d.getTime()) ? null : d;
}

function formatBookingDate(val: unknown): string {
  const d = parseBookingDate(val);
  if (!d) return 'Recently';
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatBookingDateTime(val: unknown): string {
  const d = parseBookingDate(val);
  if (!d) return 'Recently';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ServicePage() {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Technician & Resolution notes state inside drawer
  const [technicianInput, setTechnicianInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Derived selected booking (prevents state desynchronization and typing loss)
  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || null;

  // Real-Time subscription to Firestore service_bookings
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'service_bookings'),
      (snapshot) => {
        const list = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as ServiceBooking)
        );
        // Client-side sort by createdAt descending
        list.sort((a, b) => {
          const tA = parseBookingDate(a.createdAt)?.getTime() || 0;
          const tB = parseBookingDate(b.createdAt)?.getTime() || 0;
          return tB - tA;
        });
        setBookings(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore service bookings sync error:', err);
        setError(`Failed to connect to Firestore service bookings: ${err.message}`);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleOpenBooking = (b: ServiceBooking) => {
    setSelectedBookingId(b.id);
    setNotesInput(b.notes || '');
    setTechnicianInput(b.assignedTechnician || '');
  };

  const handleCloseBooking = () => {
    setSelectedBookingId(null);
  };

  // Drawer keyboard / scroll management
  useEffect(() => {
    if (!selectedBookingId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedBookingId(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedBookingId]);

  // Status Progression Handler
  const handleAdvanceStatus = async (
    bookingId: string,
    currentStatus: ServiceStatus
  ) => {
    const currentIndex = SERVICE_FLOW.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= SERVICE_FLOW.length - 1) return;
    const nextStatus = SERVICE_FLOW[currentIndex + 1];
    await handleSetStatus(bookingId, nextStatus);
  };

  // Direct Status Update Handler
  const handleSetStatus = async (bookingId: string, nextStatus: ServiceStatus) => {
    setUpdatingStatusId(bookingId);
    try {
      await updateDoc(doc(db, 'service_bookings', bookingId), {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });
      setActionNotice(`Service ticket ${bookingId.slice(0, 8)} status set to ${nextStatus.toUpperCase()}`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database update failed';
      alert(`Could not update service status in Firestore: ${msg}`);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Save technician resolution notes & technician assignment
  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    setSavingNotes(true);
    try {
      await updateDoc(doc(db, 'service_bookings', selectedBooking.id), {
        notes: notesInput.trim(),
        assignedTechnician: technicianInput.trim(),
        updatedAt: new Date().toISOString(),
      });
      setActionNotice('Technician dispatch & resolution log updated in Firestore');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Notes save failed';
      alert(`Could not save dispatch record: ${msg}`);
    } finally {
      setSavingNotes(false);
    }
  };

  const SERVICE_TYPE_LABELS: Record<string, string> = {
    leakage: 'Leakage',
    low_flow: 'Low Flow',
    filter_change: 'Filter Change',
    general_service: 'General Service',
    // Preserved history mappings
    installation: 'Installation',
    maintenance: 'Maintenance',
    repair: 'Repair',
    filter_replacement: 'Filter Replacement',
    general_inquiry: 'General Inquiry',
  };

  const typeLabel = (t: string) =>
    SERVICE_TYPE_LABELS[t] || (t || 'Service').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const getBookingZone = (b: ServiceBooking): string => {
    if (b.deliveryZone) return b.deliveryZone;
    if (b.address) {
      const res = DeliveryService.validateDeliveryAddress(b.address);
      if (res.isSupported && res.zoneName) return `${res.zoneName} Zone`;
    }
    return 'Chennai Zone';
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    // Status filter
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;

    // Type filter
    if (typeFilter !== 'all' && b.serviceType !== typeFilter) return false;

    // Zone filter
    if (zoneFilter !== 'all') {
      const bookingZone = getBookingZone(b).toLowerCase();
      if (!bookingZone.includes(zoneFilter.toLowerCase())) return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const idMatch = b.id.toLowerCase().includes(q);
      const nameMatch = (b.address?.fullName || '').toLowerCase().includes(q);
      const phoneMatch = (b.address?.phone || '').includes(q);
      const rawType = b.serviceType || '';
      const friendlyType = typeLabel(rawType).toLowerCase();
      const typeMatch = rawType.toLowerCase().includes(q) || friendlyType.includes(q);
      const zoneMatch = getBookingZone(b).toLowerCase().includes(q);
      const notesMatch = (b.notes || '').toLowerCase().includes(q);
      const techMatch = (b.assignedTechnician || '').toLowerCase().includes(q);
      const cityMatch = (b.address?.city || '').toLowerCase().includes(q);
      return idMatch || nameMatch || phoneMatch || typeMatch || zoneMatch || notesMatch || techMatch || cityMatch;
    }

    return true;
  });

  const getStatusBadgeClass = (status: ServiceStatus) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'in_progress':
        return 'badge-info';
      case 'confirmed':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  const getNextStatus = (status: ServiceStatus): ServiceStatus | null => {
    const idx = SERVICE_FLOW.indexOf(status);
    return idx >= 0 && idx < SERVICE_FLOW.length - 1 ? SERVICE_FLOW[idx + 1] : null;
  };

  const statusLabel = (s: string) => (s || 'requested').replace(/_/g, ' ').toUpperCase();

  // KPIs
  const requestedCount = bookings.filter((b) => b.status === 'requested').length;
  const inProgressCount = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="service-page">
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1>Service Desk & Field Dispatches</h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 9px',
                borderRadius: '999px',
                fontSize: 12,
                fontWeight: 600,
                background: 'rgba(22, 128, 61, 0.12)',
                color: '#16803D',
              }}
            >
              <Radio size={12} className="spin" style={{ animationDuration: '3s' }} /> Live Firestore
            </span>
          </div>
          <p className="text-secondary" style={{ marginTop: 4 }}>
            Coordinate technician appointments, filter maintenance, system repair, and installation requests
          </p>
        </div>

        {actionNotice && (
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            ✓ {actionNotice}
          </div>
        )}
      </header>

      {error && (
        <div
          className="card"
          style={{
            background: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            padding: 16,
            marginBottom: 20,
          }}
        >
          <strong>Database Notice:</strong> {error}
        </div>
      )}

      {/* KPI Counters */}
      <div className="service-kpis">
        <div className="card service-kpi-card">
          <div className="sp-kpi-icon sp-kpi-icon-warning">
            <AlertCircle size={22} />
          </div>
          <div className="sp-kpi-text">
            <div className="sp-kpi-value">{requestedCount}</div>
            <div className="sp-kpi-label">Pending Requests</div>
          </div>
        </div>

        <div className="card service-kpi-card">
          <div className="sp-kpi-icon sp-kpi-icon-info">
            <Clock size={22} />
          </div>
          <div className="sp-kpi-text">
            <div className="sp-kpi-value">{inProgressCount}</div>
            <div className="sp-kpi-label">Active Dispatches</div>
          </div>
        </div>

        <div className="card service-kpi-card">
          <div className="sp-kpi-icon sp-kpi-icon-success">
            <UserCheck size={22} />
          </div>
          <div className="sp-kpi-text">
            <div className="sp-kpi-value">{completedCount}</div>
            <div className="sp-kpi-label">Completed Services</div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="card sp-controls" style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div className="sp-search" style={{ flex: '1 1 240px' }}>
            <Search size={18} className="sp-search-icon" />
            <input
              type="text"
              className="input sp-search-input"
              placeholder="Search by Ticket ID, customer name, phone, notes, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Service Type Dropdown */}
          <div style={{ minWidth: 180 }}>
            <select
              className="select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: '100%', height: 42 }}
              aria-label="Filter by service type"
            >
              <option value="all">All Service Types</option>
              <option value="leakage">Leakage</option>
              <option value="low_flow">Low Flow</option>
              <option value="filter_change">Filter Change</option>
              <option value="general_service">General Service</option>
            </select>
          </div>

          {/* Delivery Zone Dropdown Filter */}
          <div style={{ minWidth: 170 }}>
            <select
              className="select"
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              style={{ width: '100%', height: 42 }}
              aria-label="Filter by delivery zone"
            >
              <option value="all">All Delivery Zones</option>
              <option value="Chennai">Chennai Zone</option>
              <option value="Chengalpattu">Chengalpattu Zone</option>
              <option value="Kanchipuram">Kanchipuram Zone</option>
              <option value="Pondicherry">Pondicherry Zone</option>
            </select>
          </div>

          {(search || statusFilter !== 'all' || typeFilter !== 'all' || zoneFilter !== 'all') && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setTypeFilter('all');
                setZoneFilter('all');
              }}
            >
              Reset
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <div className="service-tabs" style={{ marginTop: 14 }}>
          <button
            type="button"
            className={`service-tab ${statusFilter === 'all' ? 'service-tab-active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Bookings ({bookings.length})
          </button>
          {SERVICE_FLOW.map((s) => (
            <button
              key={s}
              type="button"
              className={`service-tab ${statusFilter === s ? 'service-tab-active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {statusLabel(s)} ({bookings.filter((b) => b.status === s).length})
            </button>
          ))}
          <button
            type="button"
            className={`service-tab ${statusFilter === 'cancelled' ? 'service-tab-active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            CANCELLED ({bookings.filter((b) => b.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
          <div>Loading service tickets from Cloud Firestore...</div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card sp-empty">
          <Inbox size={36} />
          <p className="sp-empty-title">No service bookings found</p>
          <p className="text-secondary">
            {bookings.length === 0
              ? 'No service bookings currently recorded in Firestore.'
              : 'No bookings match the selected filters or search query.'}
          </p>
        </div>
      ) : (
        <div className="card table-card sp-table-view">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service Type</th>
                  <th>Customer / Location</th>
                  <th>Scheduled Slot</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const nextStatus = getNextStatus(b.status);
                  const name = b.address?.fullName || 'Customer';
                  const city = b.address?.city || 'India';
                  const phone = b.address?.phone || '';

                  return (
                    <tr
                      key={b.id}
                      tabIndex={0}
                      onClick={() => handleOpenBooking(b)}
                      className={`sp-row ${selectedBooking?.id === b.id ? 'row-selected' : ''}`}
                    >
                      <td>
                        <span className="booking-id-badge">{b.id.slice(0, 10)}</span>
                        <div className="booking-time">
                          {formatBookingDate(b.createdAt)}
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-info">{typeLabel(b.serviceType)}</span>
                      </td>

                      <td>
                        <div className="customer-name">{name}</div>
                        <div className="customer-city">
                          {city} {phone ? `• ${phone}` : ''}
                        </div>
                        <div style={{ marginTop: 3 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: '#EDE9FE',
                              color: '#6D28D9',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            📍 {getBookingZone(b)}
                          </span>
                        </div>
                        {b.assignedTechnician && (
                          <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <UserCheck size={12} /> {b.assignedTechnician}
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="slot-date">{b.preferredDate || 'Flexible'}</div>
                        <div className="slot-time">{b.preferredTime || 'Anytime'}</div>
                      </td>

                      <td>
                        <span className={`badge ${getStatusBadgeClass(b.status)}`}>
                          {statusLabel(b.status)}
                        </span>
                      </td>

                      <td>
                        {nextStatus ? (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm sp-action-btn"
                            disabled={updatingStatusId === b.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdvanceStatus(b.id, b.status);
                            }}
                          >
                            {updatingStatusId === b.id ? (
                              <RefreshCw size={13} className="spin" />
                            ) : (
                              <>
                                Mark {statusLabel(nextStatus)}
                                <ChevronRight size={14} />
                              </>
                            )}
                          </button>
                        ) : b.status === 'completed' ? (
                          <span className="sp-closed">
                            <CheckCircle size={14} />
                            Completed
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER */}
      {selectedBooking && (
        <div className="op-overlay" onClick={handleCloseBooking}>
          <div className="op-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <div>
                <span className="booking-id-badge" style={{ fontSize: 13 }}>
                  {selectedBooking.id}
                </span>
                <h3 style={{ marginTop: 6 }}>
                  {typeLabel(selectedBooking.serviceType)} Dispatch
                </h3>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  Submitted on {formatBookingDateTime(selectedBooking.createdAt)}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCloseBooking}
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              {/* Service Type Overview */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'var(--color-surface-muted)',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Service Requested
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginTop: 2 }}>
                    {typeLabel(selectedBooking.serviceType)}
                  </div>
                </div>
                <span className="badge badge-info" style={{ fontSize: 12, padding: '4px 10px' }}>
                  {typeLabel(selectedBooking.serviceType)}
                </span>
              </div>

              {/* Delivery Zone & Fulfillment Routing */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(30, 77, 183, 0.04) 0%, rgba(30, 77, 183, 0.08) 100%)',
                  border: '1px solid rgba(30, 77, 183, 0.2)',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#1E4DB7' }}>
                  <Truck size={16} />
                  DELIVERY & SERVICE ZONE ROUTING
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>Base Origin:</span>
                  <strong>{selectedBooking.baseOrigin || 'Tambaram Main Branch'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>Delivery Zone:</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: '#EDE9FE',
                      color: '#6D28D9',
                    }}
                  >
                    📍 {getBookingZone(selectedBooking)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Dispatch Mode:</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>
                    Direct Field Technician Visit
                  </span>
                </div>
              </div>

              {/* Status Stepper */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  DISPATCH PIPELINE
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {SERVICE_FLOW.map((s, idx) => {
                    const currentIdx = SERVICE_FLOW.indexOf(selectedBooking.status);
                    const isDone = currentIdx >= idx && selectedBooking.status !== 'cancelled';
                    const isCurrent = selectedBooking.status === s;

                    return (
                      <span
                        key={s}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          background: isCurrent
                            ? 'var(--color-primary)'
                            : isDone
                            ? 'rgba(22, 128, 61, 0.12)'
                            : 'var(--color-surface-muted)',
                          color: isCurrent
                            ? '#fff'
                            : isDone
                            ? '#16803D'
                            : 'var(--color-text-secondary)',
                        }}
                      >
                        {idx + 1}. {statusLabel(s)}
                      </span>
                    );
                  })}
                  {selectedBooking.status === 'cancelled' && (
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        background: 'rgba(180, 35, 24, 0.12)',
                        color: 'var(--color-error)',
                      }}
                    >
                      CANCELLED
                    </span>
                  )}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {getNextStatus(selectedBooking.status) && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={updatingStatusId === selectedBooking.id}
                    onClick={() => handleAdvanceStatus(selectedBooking.id, selectedBooking.status)}
                  >
                    {updatingStatusId === selectedBooking.id ? (
                      <RefreshCw size={13} className="spin" />
                    ) : (
                      <>Advance to {statusLabel(getNextStatus(selectedBooking.status)!)}</>
                    )}
                  </button>
                )}

                {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={updatingStatusId === selectedBooking.id}
                    onClick={() => handleSetStatus(selectedBooking.id, 'completed')}
                  >
                    <CheckCircle size={14} /> Quick Mark Completed
                  </button>
                )}

                {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: 'rgba(180, 35, 24, 0.1)', color: '#B42318', border: 'none' }}
                    onClick={() => {
                      if (confirm('Cancel this service request?')) {
                        handleSetStatus(selectedBooking.id, 'cancelled');
                      }
                    }}
                  >
                    <Ban size={14} /> Cancel Ticket
                  </button>
                )}
              </div>

              {/* Scheduled Appointment */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: 'var(--color-surface-muted)',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                  <CalendarClock size={16} style={{ color: 'var(--color-primary)' }} />
                  SCHEDULED SLOT
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {selectedBooking.preferredDate || 'Flexible Schedule'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {selectedBooking.preferredTime || 'Customer will confirm time slot'}
                </div>
              </div>

              {/* Customer Service Location */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: 'var(--color-surface-muted)',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                  <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                  CUSTOMER & ON-SITE ADDRESS
                </div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {selectedBooking.address?.fullName || 'Customer'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {selectedBooking.address?.addressLine1}
                  {selectedBooking.address?.addressLine2 ? `, ${selectedBooking.address.addressLine2}` : ''}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {selectedBooking.address?.city}, {selectedBooking.address?.state} - {selectedBooking.address?.pincode}
                </div>
                {selectedBooking.address?.phone && (
                  <div style={{ fontSize: 13, marginTop: 8 }}>
                    <a
                      href={`tel:${selectedBooking.address.phone}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        background: 'rgba(33, 4, 64, 0.08)',
                        padding: '4px 10px',
                        borderRadius: 6,
                      }}
                    >
                      <Phone size={13} /> {selectedBooking.address.phone} (Call Customer)
                    </a>
                  </div>
                )}
              </div>

              {/* Assigned Field Technician */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UserCheck size={14} style={{ color: 'var(--color-primary)' }} />
                  ASSIGNED FIELD TECHNICIAN
                </div>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Ramesh Kumar (Water Shell Certified Specialist)"
                  value={technicianInput}
                  onChange={(e) => setTechnicianInput(e.target.value)}
                  style={{ width: '100%', fontSize: 13, marginBottom: 6 }}
                />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['Ramesh Kumar (Tech #101)', 'Sunil Sharma (RO Specialist)', 'Vikram Verma (Installation Lead)'].map((tech) => (
                    <button
                      key={tech}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, padding: '2px 8px' }}
                      onClick={() => setTechnicianInput(tech)}
                    >
                      + {tech.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Request Notes */}
              {selectedBooking.notes && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                    CUSTOMER SYMPTOMS / NOTES
                  </div>
                  <div
                    style={{
                      padding: 12,
                      background: 'rgba(255, 186, 0, 0.08)',
                      border: '1px solid rgba(255, 186, 0, 0.3)',
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  >
                    {selectedBooking.notes}
                  </div>
                </div>
              )}

              {/* Technician Notes & Resolution Record */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  FIELD TECHNICIAN RESOLUTION LOG
                </div>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Record filter replacement batch, TDS measurements, membrane pressure, or resolution notes..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  style={{ width: '100%', resize: 'vertical', fontSize: 13, marginBottom: 8 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Save size={14} />
                  {savingNotes ? 'Saving to Firestore...' : 'Save Resolution & Technician Log'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}