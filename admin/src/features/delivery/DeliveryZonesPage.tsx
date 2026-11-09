/**
 * Water Shell Admin — Authorized Delivery Zones Management
 * Full CRUD management of Authorized Delivery Zones stored in Cloud Firestore.
 * Supports adding new zones, editing zone coverage (cities, PIN codes, localities, transit time),
 * toggling active status, and deleting zones with confirmation dialog.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Clock,
  Check,
  Building,
  Hash,
} from 'lucide-react';
import {
  AdminDeliveryService,
  SUPPORTED_DELIVERY_ZONES,
  type DeliveryZoneConfig,
} from '../../services/deliveryService';
import { useAdminAuth } from '../../services/authContext';
import './DeliveryZonesPage.css';

interface ZoneFormData {
  id: string;
  name: string;
  district: string;
  state: string;
  transitTime: string;
  description: string;
  citiesInput: string;
  pincodesInput: string;
  localitiesInput: string;
  active: boolean;
}

const DEFAULT_FORM_DATA: ZoneFormData = {
  id: '',
  name: '',
  district: '',
  state: 'Tamil Nadu',
  transitTime: '1–2 Business Days',
  description: '',
  citiesInput: '',
  pincodesInput: '',
  localitiesInput: '',
  active: true,
};

export function DeliveryZonesPage() {
  const { user } = useAdminAuth();
  const [zones, setZones] = useState<DeliveryZoneConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<ZoneFormData>(DEFAULT_FORM_DATA);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deletingZone, setDeletingZone] = useState<DeliveryZoneConfig | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    setLoading(true);
    setSaveError(null);
    try {
      const data = await AdminDeliveryService.getDeliveryZones();
      setZones(data && data.length > 0 ? data : SUPPORTED_DELIVERY_ZONES);
    } catch (err: any) {
      console.error('Error fetching delivery zones from Firestore:', err);
      setSaveError(err.message || 'Failed to load delivery zones from Firestore.');
      setZones(SUPPORTED_DELIVERY_ZONES);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse comma / newline separated tokens
  const parseTokens = (text: string): string[] => {
    return text
      .split(/[,\n]+/)
      .map((t) => t.trim())
      .filter(Boolean);
  };

  // Quick toggle active status on card
  const handleToggleZone = async (zone: DeliveryZoneConfig) => {
    const updatedStatus = !zone.active;
    const previousZones = [...zones];

    // Optimistic UI update
    setZones((prev) =>
      prev.map((z) => (z.id === zone.id ? { ...z, active: updatedStatus } : z))
    );

    try {
      const res = await AdminDeliveryService.updateDeliveryZone(
        zone.id,
        { active: updatedStatus },
        user?.email || undefined
      );
      if (res.cloudSaved) {
        setSaveSuccess(`Zone "${zone.name}" is now ${updatedStatus ? 'Active' : 'Disabled'}.`);
      } else {
        setSaveSuccess(`Zone "${zone.name}" is now ${updatedStatus ? 'Active' : 'Disabled'} (Saved locally).`);
      }
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error toggling zone status:', err);
      setZones(previousZones);
      setSaveError(err.message || 'Failed to update zone status.');
    }
  };

  // Open modal for Adding
  const handleOpenAddModal = () => {
    setFormData(DEFAULT_FORM_DATA);
    setFormError(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEditModal = (zone: DeliveryZoneConfig) => {
    setFormData({
      id: zone.id,
      name: zone.name,
      district: zone.district || '',
      state: zone.state || 'Tamil Nadu',
      transitTime: zone.transitTime || '1–2 Business Days',
      description: zone.description || '',
      citiesInput: (zone.cityAliases || []).join(', '),
      pincodesInput: (zone.pincodePrefixes || []).join(', '),
      localitiesInput: (zone.localities || []).join(', '),
      active: zone.active !== false,
    });
    setFormError(null);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(DEFAULT_FORM_DATA);
    setFormError(null);
  };

  // Auto-generate ID slug when typing zone name in Add mode
  const handleNameChange = (val: string) => {
    if (modalMode === 'add') {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-');
      setFormData((prev) => ({
        ...prev,
        name: val,
        id: generatedSlug,
        district: prev.district || val,
      }));
    } else {
      setFormData((prev) => ({ ...prev, name: val }));
    }
  };

  // Save Add/Edit form
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = formData.name.trim();
    if (!name) {
      setFormError('Zone Name is required.');
      return;
    }

    const transitTime = formData.transitTime.trim();
    if (!transitTime) {
      setFormError('Transit Time is required (e.g. "1–2 Business Days").');
      return;
    }

    const cityAliases = parseTokens(formData.citiesInput);
    if (cityAliases.length === 0) {
      setFormError('Please enter at least one city or city alias.');
      return;
    }

    const pincodePrefixes = parseTokens(formData.pincodesInput);
    if (pincodePrefixes.length === 0) {
      setFormError('Please enter at least one PIN code or PIN prefix.');
      return;
    }

    const localities = parseTokens(formData.localitiesInput);

    setSaving(true);
    try {
      if (modalMode === 'add') {
        const zoneId = formData.id.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const res = await AdminDeliveryService.addDeliveryZone(
          {
            id: zoneId,
            name,
            district: formData.district.trim() || name,
            state: formData.state.trim() || 'Tamil Nadu',
            transitTime,
            description: formData.description.trim(),
            cityAliases,
            pincodePrefixes,
            localities,
            active: formData.active,
          },
          user?.email || undefined
        );

        setZones((prev) => [...prev.filter((z) => z.id !== res.zone.id), res.zone]);
        if (res.cloudSaved) {
          setSaveSuccess(`Delivery zone "${name}" created successfully and saved to Firebase.`);
        } else {
          setSaveSuccess(`Delivery zone "${name}" added successfully in Admin Panel. Note: To sync with Cloud Firestore, paste the settings rule into Firebase Console.`);
        }
      } else {
        // Edit mode
        const res = await AdminDeliveryService.updateDeliveryZone(
          formData.id,
          {
            name,
            district: formData.district.trim() || name,
            state: formData.state.trim() || 'Tamil Nadu',
            transitTime,
            description: formData.description.trim(),
            cityAliases,
            pincodePrefixes,
            localities,
            active: formData.active,
          },
          user?.email || undefined
        );

        setZones((prev) =>
          prev.map((z) =>
            z.id === formData.id
              ? {
                  ...z,
                  name,
                  district: formData.district.trim() || name,
                  state: formData.state.trim() || 'Tamil Nadu',
                  transitTime,
                  description: formData.description.trim(),
                  cityAliases,
                  pincodePrefixes,
                  localities,
                  active: formData.active,
                }
              : z
          )
        );
        if (res.cloudSaved) {
          setSaveSuccess(`Delivery zone "${name}" updated successfully and saved to Firebase.`);
        } else {
          setSaveSuccess(`Delivery zone "${name}" updated in Admin Panel. Note: To sync with Cloud Firestore, paste the settings rule into Firebase Console.`);
        }
      }

      setTimeout(() => setSaveSuccess(null), 5000);
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving zone:', err);
      setFormError(err.message || 'Failed to save delivery zone. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Confirmation handler
  const handleConfirmDelete = async () => {
    if (!deletingZone) return;

    setDeleteInProgress(true);
    try {
      const res = await AdminDeliveryService.deleteDeliveryZone(deletingZone.id, user?.email || undefined);
      setZones((prev) => prev.filter((z) => z.id !== deletingZone.id));
      if (res.cloudSaved) {
        setSaveSuccess(`Delivery zone "${deletingZone.name}" was deleted successfully.`);
      } else {
        setSaveSuccess(`Delivery zone "${deletingZone.name}" removed from Admin Panel.`);
      }
      setTimeout(() => setSaveSuccess(null), 5000);
      setDeletingZone(null);
    } catch (err: any) {
      console.error('Error deleting zone:', err);
      setSaveError(err.message || 'Failed to delete zone.');
    } finally {
      setDeleteInProgress(false);
    }
  };

  // Computed filtered list
  const filteredZones = useMemo(() => {
    return zones.filter((zone) => {
      // Status filter
      if (statusFilter === 'active' && !zone.active) return false;
      if (statusFilter === 'inactive' && zone.active) return false;

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const inName = zone.name.toLowerCase().includes(q);
      const inDistrict = (zone.district || '').toLowerCase().includes(q);
      const inState = (zone.state || '').toLowerCase().includes(q);
      const inDescription = (zone.description || '').toLowerCase().includes(q);
      const inCities = (zone.cityAliases || []).some((c) => c.toLowerCase().includes(q));
      const inPins = (zone.pincodePrefixes || []).some((p) => p.includes(q));
      const inLocalities = (zone.localities || []).some((l) => l.toLowerCase().includes(q));

      return inName || inDistrict || inState || inDescription || inCities || inPins || inLocalities;
    });
  }, [zones, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = zones.length;
    const activeCount = zones.filter((z) => z.active).length;
    const inactiveCount = total - activeCount;

    // Collect all unique cities across active zones
    const allCities = new Set<string>();
    zones.forEach((z) => {
      if (z.active) {
        (z.cityAliases || []).forEach((c) => allCities.add(c.toLowerCase()));
      }
    });

    // Collect all unique PIN prefixes
    const allPins = new Set<string>();
    zones.forEach((z) => {
      if (z.active) {
        (z.pincodePrefixes || []).forEach((p) => allPins.add(p));
      }
    });

    return {
      total,
      activeCount,
      inactiveCount,
      totalCities: allCities.size,
      totalPins: allPins.size,
    };
  }, [zones]);

  return (
    <div className="delivery-zones-page">
      {/* Top Header */}
      <header className="dz-header">
        <div className="dz-header-info">
          <div className="dz-header-title-row">
            <h1>Authorized Delivery Zones</h1>
            <span className="dz-active-badge">
              <CheckCircle2 size={14} /> {stats.activeCount} Active of {stats.total}
            </span>
          </div>
          <p className="dz-subtitle">
            Manage authorized regions for direct water purifier and dispenser fulfillment. Configure
            coverage cities, postal PIN codes, transit speeds, and delivery status.
          </p>
        </div>

        <div className="dz-header-actions">
          <button
            type="button"
            className="btn btn-secondary dz-refresh-btn"
            onClick={loadZones}
            disabled={loading}
            title="Refresh from Firebase"
          >
            <RefreshCw size={15} className={loading ? 'dz-spinning' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-primary dz-add-zone-btn"
            onClick={handleOpenAddModal}
          >
            <Plus size={17} />
            <span>Add Delivery Zone</span>
          </button>
        </div>
      </header>

      {/* Alert Notices */}
      {saveSuccess && (
        <div className="dz-alert dz-alert-success" role="alert">
          <CheckCircle2 size={18} className="dz-alert-icon" />
          <span className="dz-alert-text">{saveSuccess}</span>
          <button
            type="button"
            className="dz-alert-close"
            onClick={() => setSaveSuccess(null)}
            aria-label="Dismiss notice"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {saveError && (
        <div className="dz-alert dz-alert-error" role="alert">
          <AlertTriangle size={18} className="dz-alert-icon" />
          <span className="dz-alert-text">{saveError}</span>
          <button
            type="button"
            className="dz-alert-close"
            onClick={() => setSaveError(null)}
            aria-label="Dismiss error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Metrics / Stats Ribbon */}
      <div className="dz-stats-grid">
        <div className="dz-stat-card">
          <div className="dz-stat-icon-wrap primary">
            <MapPin size={20} />
          </div>
          <div className="dz-stat-data">
            <div className="dz-stat-value">{stats.total}</div>
            <div className="dz-stat-label">Total Delivery Zones</div>
          </div>
        </div>

        <div className="dz-stat-card">
          <div className="dz-stat-icon-wrap success">
            <Check size={20} />
          </div>
          <div className="dz-stat-data">
            <div className="dz-stat-value">{stats.activeCount}</div>
            <div className="dz-stat-label">Active Operational Zones</div>
          </div>
        </div>

        <div className="dz-stat-card">
          <div className="dz-stat-icon-wrap info">
            <Building size={20} />
          </div>
          <div className="dz-stat-data">
            <div className="dz-stat-value">{stats.totalCities}</div>
            <div className="dz-stat-label">Cities & Suburbs Covered</div>
          </div>
        </div>

        <div className="dz-stat-card">
          <div className="dz-stat-icon-wrap warning">
            <Hash size={20} />
          </div>
          <div className="dz-stat-data">
            <div className="dz-stat-value">{stats.totalPins}</div>
            <div className="dz-stat-label">PIN Prefixes Recognized</div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Count */}
      <div className="dz-toolbar">
        <div className="dz-search-box">
          <Search size={16} className="dz-search-icon" />
          <input
            type="text"
            className="dz-search-input"
            placeholder="Search zones by name, city, PIN code, district, or locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="dz-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="dz-filters-row">
          <div className="dz-status-tabs">
            <button
              type="button"
              className={`dz-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Zones ({stats.total})
            </button>
            <button
              type="button"
              className={`dz-tab-btn ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              Active ({stats.activeCount})
            </button>
            <button
              type="button"
              className={`dz-tab-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
              onClick={() => setStatusFilter('inactive')}
            >
              Disabled ({stats.inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Delivery Zones Grid */}
      {loading ? (
        <div className="dz-loading-container">
          <RefreshCw size={28} className="dz-spinning dz-spinner-icon" />
          <p>Loading authorized delivery zones from Firebase...</p>
        </div>
      ) : filteredZones.length === 0 ? (
        <div className="dz-empty-state">
          <div className="dz-empty-icon-wrap">
            <MapPin size={36} />
          </div>
          <h3>No delivery zones match your criteria</h3>
          <p>
            {searchQuery
              ? `No results found for "${searchQuery}". Try modifying your search or clear filters.`
              : 'No delivery zones are currently configured. Click below to add your first zone.'}
          </p>
          <div className="dz-empty-actions">
            {searchQuery && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenAddModal}
            >
              <Plus size={16} /> Add Delivery Zone
            </button>
          </div>
        </div>
      ) : (
        <div className="dz-zones-grid">
          {filteredZones.map((zone) => {
            const isZoneActive = zone.active !== false;

            return (
              <div
                key={zone.id}
                className={`dz-card ${isZoneActive ? 'is-active' : 'is-disabled'}`}
              >
                {/* Zone Card Header */}
                <div className="dz-card-top">
                  <div className="dz-card-header-left">
                    <div className="dz-zone-avatar">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div className="dz-card-title-line">
                        <h2 className="dz-card-zone-name">{zone.name}</h2>
                        <span className="dz-zone-id-tag">#{zone.id}</span>
                      </div>
                      <div className="dz-card-location-meta">
                        {zone.district ? `${zone.district}, ` : ''}
                        {zone.state || 'Tamil Nadu'}
                      </div>
                    </div>
                  </div>

                  {/* Active toggle switch */}
                  <div className="dz-card-toggle-wrap">
                    <label
                      className="dz-switch-label"
                      title={isZoneActive ? 'Click to disable delivery to this zone' : 'Click to enable direct delivery'}
                    >
                      <input
                        type="checkbox"
                        checked={isZoneActive}
                        onChange={() => handleToggleZone(zone)}
                      />
                      <span className="dz-slider" />
                    </label>
                    <span className={`dz-status-text ${isZoneActive ? 'active' : 'inactive'}`}>
                      {isZoneActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Transit time & description */}
                <div className="dz-card-transit-row">
                  <div className="dz-transit-badge">
                    <Clock size={13} />
                    <span>{zone.transitTime || '1–2 Business Days'}</span>
                  </div>
                  {!isZoneActive && (
                    <span className="dz-disabled-tag">Direct Delivery Suspended</span>
                  )}
                </div>

                {zone.description && (
                  <p className="dz-card-description">{zone.description}</p>
                )}

                {/* Cities Coverage Section */}
                <div className="dz-card-section">
                  <div className="dz-card-section-header">
                    <span className="dz-section-title">
                      Covered Cities & Aliases ({zone.cityAliases?.length || 0})
                    </span>
                  </div>
                  <div className="dz-chips-container">
                    {(zone.cityAliases || []).map((city, idx) => (
                      <span key={idx} className="dz-chip dz-chip-city">
                        {city}
                      </span>
                    ))}
                    {(!zone.cityAliases || zone.cityAliases.length === 0) && (
                      <span className="dz-chip-empty">No cities specified</span>
                    )}
                  </div>
                </div>

                {/* PIN Code Prefixes Section */}
                <div className="dz-card-section">
                  <div className="dz-card-section-header">
                    <span className="dz-section-title">
                      Supported PIN Codes / Prefixes ({zone.pincodePrefixes?.length || 0})
                    </span>
                  </div>
                  <div className="dz-chips-container">
                    {(zone.pincodePrefixes || []).map((pin, idx) => (
                      <span key={idx} className="dz-chip dz-chip-pin">
                        {pin.length < 6 ? `${pin}xxxx` : pin}
                      </span>
                    ))}
                    {(!zone.pincodePrefixes || zone.pincodePrefixes.length === 0) && (
                      <span className="dz-chip-empty">No PIN prefixes specified</span>
                    )}
                  </div>
                </div>

                {/* Localities & Coverage Hubs Section */}
                <div className="dz-card-section">
                  <div className="dz-card-section-header">
                    <span className="dz-section-title">
                      Delivery Coverage Localities ({zone.localities?.length || 0})
                    </span>
                  </div>
                  <div className="dz-chips-container">
                    {(zone.localities || []).map((loc, idx) => (
                      <span key={idx} className="dz-chip dz-chip-locality">
                        {loc}
                      </span>
                    ))}
                    {(!zone.localities || zone.localities.length === 0) && (
                      <span className="dz-chip-empty">Coverage across all municipal localities</span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="dz-card-footer">
                  <button
                    type="button"
                    className="btn btn-secondary dz-btn-card-action dz-edit-btn"
                    onClick={() => handleOpenEditModal(zone)}
                  >
                    <Edit3 size={15} />
                    <span>Edit Zone</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger-outline dz-btn-card-action dz-delete-btn"
                    onClick={() => setDeletingZone(zone)}
                    title={`Delete ${zone.name} zone`}
                  >
                    <Trash2 size={15} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Zone Modal */}
      {isModalOpen && (
        <div className="dz-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="dz-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dz-modal-title"
          >
            <div className="dz-modal-header">
              <div>
                <h3 id="dz-modal-title" className="dz-modal-title">
                  {modalMode === 'add' ? 'Add New Delivery Zone' : `Edit Delivery Zone: ${formData.name}`}
                </h3>
                <p className="dz-modal-subtitle">
                  {modalMode === 'add'
                    ? 'Define a new authorized delivery zone with valid cities, postal PIN codes, and transit speed.'
                    : 'Update coverage cities, postal PIN codes, transit time, and status for this delivery zone.'}
                </p>
              </div>
              <button
                type="button"
                className="dz-modal-close"
                onClick={handleCloseModal}
                disabled={saving}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="dz-modal-error">
                <AlertTriangle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="dz-modal-form">
              <div className="dz-modal-body">
                {/* Row 1: Name and ID */}
                <div className="dz-modal-row">
                  <div className="dz-modal-field flex-2">
                    <label htmlFor="dz-input-name">
                      Zone Name <span className="dz-required">*</span>
                    </label>
                    <input
                      id="dz-input-name"
                      type="text"
                      className="input"
                      placeholder="e.g. Coimbatore, Salem, Madurai"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="dz-modal-field flex-1">
                    <label htmlFor="dz-input-id">
                      Zone Identifier (Slug)
                    </label>
                    <input
                      id="dz-input-id"
                      type="text"
                      className="input"
                      placeholder="e.g. coimbatore"
                      value={formData.id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
                        })
                      }
                      disabled={modalMode === 'edit'}
                      title={modalMode === 'edit' ? 'Identifier cannot be modified after creation' : ''}
                    />
                  </div>
                </div>

                {/* Row 2: District, State, Transit Time */}
                <div className="dz-modal-row">
                  <div className="dz-modal-field flex-1">
                    <label htmlFor="dz-input-district">District</label>
                    <input
                      id="dz-input-district"
                      type="text"
                      className="input"
                      placeholder="e.g. Coimbatore District"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                  </div>

                  <div className="dz-modal-field flex-1">
                    <label htmlFor="dz-input-state">State / Territory</label>
                    <input
                      id="dz-input-state"
                      type="text"
                      className="input"
                      placeholder="e.g. Tamil Nadu"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>

                  <div className="dz-modal-field flex-1">
                    <label htmlFor="dz-input-transit">
                      Standard Transit Time <span className="dz-required">*</span>
                    </label>
                    <input
                      id="dz-input-transit"
                      type="text"
                      className="input"
                      placeholder="e.g. 1–2 Business Days"
                      value={formData.transitTime}
                      onChange={(e) => setFormData({ ...formData, transitTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="dz-modal-field">
                  <label htmlFor="dz-input-desc">Zone Description / Scope</label>
                  <input
                    id="dz-input-desc"
                    type="text"
                    className="input"
                    placeholder="e.g. Greater Coimbatore Metropolitan area, industrial hubs & outer bypass"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Cities / Aliases */}
                <div className="dz-modal-field">
                  <div className="dz-field-label-row">
                    <label htmlFor="dz-input-cities">
                      Cities & City Aliases <span className="dz-required">*</span>
                    </label>
                    <span className="dz-label-hint">Comma-separated</span>
                  </div>
                  <textarea
                    id="dz-input-cities"
                    className="textarea"
                    rows={2}
                    placeholder="e.g. coimbatore, pollachi, mettupalayam, annur, sulur"
                    value={formData.citiesInput}
                    onChange={(e) => setFormData({ ...formData, citiesInput: e.target.value })}
                    required
                  />
                  {formData.citiesInput.trim() && (
                    <div className="dz-preview-chips">
                      <span className="dz-preview-label">Parsed Cities:</span>
                      {parseTokens(formData.citiesInput).map((c, i) => (
                        <span key={i} className="dz-chip dz-chip-city">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* PIN Code Prefixes / Codes */}
                <div className="dz-modal-field">
                  <div className="dz-field-label-row">
                    <label htmlFor="dz-input-pins">
                      Supported PIN Code Prefixes / PINs <span className="dz-required">*</span>
                    </label>
                    <span className="dz-label-hint">
                      Enter 4-digit prefixes (e.g. 6410) or full 6-digit PIN codes
                    </span>
                  </div>
                  <textarea
                    id="dz-input-pins"
                    className="textarea"
                    rows={2}
                    placeholder="e.g. 6410, 6411, 641001, 641002, 641018"
                    value={formData.pincodesInput}
                    onChange={(e) => setFormData({ ...formData, pincodesInput: e.target.value })}
                    required
                  />
                  {formData.pincodesInput.trim() && (
                    <div className="dz-preview-chips">
                      <span className="dz-preview-label">Parsed PINs:</span>
                      {parseTokens(formData.pincodesInput).map((p, i) => (
                        <span key={i} className="dz-chip dz-chip-pin">
                          {p.length < 6 ? `${p}xxxx` : p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Localities & Coverage Hubs */}
                <div className="dz-modal-field">
                  <div className="dz-field-label-row">
                    <label htmlFor="dz-input-localities">
                      Key Delivery Coverage Localities
                    </label>
                    <span className="dz-label-hint">Comma-separated</span>
                  </div>
                  <textarea
                    id="dz-input-localities"
                    className="textarea"
                    rows={2}
                    placeholder="e.g. gandhipuram, rs puram, peelamedu, singanallur, saibaba colony"
                    value={formData.localitiesInput}
                    onChange={(e) => setFormData({ ...formData, localitiesInput: e.target.value })}
                  />
                  {formData.localitiesInput.trim() && (
                    <div className="dz-preview-chips">
                      <span className="dz-preview-label">Parsed Localities:</span>
                      {parseTokens(formData.localitiesInput).map((l, i) => (
                        <span key={i} className="dz-chip dz-chip-locality">
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active switch */}
                <div className="dz-modal-active-row">
                  <label className="dz-switch-label">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <span className="dz-slider" />
                  </label>
                  <div>
                    <strong className="dz-active-toggle-title">
                      {formData.active ? 'Zone is Active for Direct Delivery' : 'Zone is Disabled'}
                    </strong>
                    <p className="dz-active-toggle-desc">
                      {formData.active
                        ? 'Customers and dealers with addresses in this zone will be approved for direct machine shipment.'
                        : 'Direct fulfillment to this zone will be blocked at checkout and service booking.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="dz-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary dz-save-submit-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={15} className="dz-spinning" />
                      <span>Saving to Firebase...</span>
                    </>
                  ) : (
                    <span>{modalMode === 'add' ? 'Create Delivery Zone' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingZone && (
        <div className="dz-modal-backdrop" onClick={() => !deleteInProgress && setDeletingZone(null)}>
          <div
            className="dz-delete-dialog"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="dz-delete-title"
          >
            <div className="dz-delete-icon-box">
              <Trash2 size={28} />
            </div>

            <h3 id="dz-delete-title" className="dz-delete-title">
              Delete Delivery Zone?
            </h3>

            <p className="dz-delete-message">
              Are you sure you want to permanently delete{' '}
              <strong>"{deletingZone.name}"</strong> (#{deletingZone.id})?
            </p>

            <div className="dz-delete-warning-box">
              <AlertTriangle size={18} className="dz-delete-warning-icon" />
              <div>
                <strong>Warning:</strong> Customers and dealers in {deletingZone.name} will no longer
                be eligible for direct machine delivery from the base hub. This change will be saved
                permanently in Cloud Firestore.
              </div>
            </div>

            <div className="dz-delete-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeletingZone(null)}
                disabled={deleteInProgress}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger dz-confirm-delete-btn"
                onClick={handleConfirmDelete}
                disabled={deleteInProgress}
              >
                {deleteInProgress ? (
                  <>
                    <RefreshCw size={15} className="dz-spinning" />
                    <span>Deleting Zone...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
