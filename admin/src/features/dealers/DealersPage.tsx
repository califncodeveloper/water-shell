/**
 * AquaPure Admin — Customers & Dealers Account Management
 * 100% Live Real-Time Data from Cloud Firestore.
 * Supports dealer approval/rejection workflows, dealer shop details management,
 * geographical coordinate management (GPS lat/long), account activation/deactivation,
 * and customer profiles with zero mock data.
 */

import { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  Search,
  Clock,
  ShieldCheck,
  Mail,
  Phone,
  Inbox,
  Radio,
  Building,
  X,
  RefreshCw,
  Edit3,
  AlertTriangle,
  Power,
  Navigation,
} from 'lucide-react';
import { db } from '../../services/firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import type { UserProfile, DealerStatus, Order } from '../../types';
import './DealersPage.css';

type AccountTab = 'all' | 'dealers_pending' | 'dealers_approved' | 'dealers_rejected' | 'customers' | 'admins';

export function DealersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AccountTab>('all');
  const [search, setSearch] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Dealer Details & Coordinates Edit Form
  const [isEditingDealer, setIsEditingDealer] = useState(false);
  const [editForm, setEditForm] = useState({
    shopName: '',
    displayName: '',
    phone: '',
    whatsapp: '',
    email: '',
    shopAddress: '',
    city: '',
    pincode: '',
    zoneId: 'chennai',
    latitude: '',
    longitude: '',
  });

  // Real-Time subscription to users collection
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
        // Sort by createdAt descending
        list.sort((a, b) => {
          const tA = new Date(a.createdAt || 0).getTime();
          const tB = new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });
        setUsers(list);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore users sync error:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Real-Time subscription to orders for user spend calculation
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            orderNumber: data?.orderNumber || d.id.slice(0, 8),
            orderType: data?.orderType === 'dealer' ? 'dealer' : 'customer',
            orderStatus: data?.orderStatus || 'placed',
            total: Number(data?.total || 0),
            customerId: data?.customerId || '',
            dealerId: data?.dealerId || '',
            items: Array.isArray(data?.items) ? data.items : [],
            createdAt: data?.createdAt || new Date().toISOString(),
          } as Order;
        });
        setOrders(list);
      },
      (err) => console.warn('Orders sync in accounts warning:', err)
    );
    return () => unsub();
  }, []);

  // Keep selected user in sync with real-time updates and populate edit form
  useEffect(() => {
    if (selectedUser) {
      const updated = users.find((u) => u.uid === selectedUser.uid);
      if (updated) {
        setSelectedUser(updated);
        setEditForm({
          shopName: updated.shopName || updated.businessName || '',
          displayName: updated.displayName || '',
          phone: updated.phone || '',
          whatsapp: updated.whatsapp || updated.phone || '',
          email: updated.email || '',
          shopAddress: updated.shopAddress || '',
          city: updated.city || '',
          pincode: updated.pincode || '',
          zoneId: updated.zoneId || 'chennai',
          latitude: updated.latitude !== undefined && updated.latitude !== null ? String(updated.latitude) : '',
          longitude: updated.longitude !== undefined && updated.longitude !== null ? String(updated.longitude) : '',
        });
      }
    }
  }, [users]);

  // Open User Detail Drawer & reset edit form
  const handleSelectUser = (u: UserProfile) => {
    setSelectedUser(u);
    setIsEditingDealer(false);
    setEditForm({
      shopName: u.shopName || u.businessName || '',
      displayName: u.displayName || '',
      phone: u.phone || '',
      whatsapp: u.whatsapp || u.phone || '',
      email: u.email || '',
      shopAddress: u.shopAddress || '',
      city: u.city || '',
      pincode: u.pincode || '',
      zoneId: u.zoneId || 'chennai',
      latitude: u.latitude !== undefined && u.latitude !== null ? String(u.latitude) : '',
      longitude: u.longitude !== undefined && u.longitude !== null ? String(u.longitude) : '',
    });
  };

  // Approve / Reject Dealer Status
  const handleUpdateDealerStatus = async (uid: string, newStatus: DealerStatus) => {
    setActionInProgress(true);
    try {
      await updateDoc(doc(db, 'users', uid), {
        dealerStatus: newStatus,
        updatedAt: new Date().toISOString(),
      });
      const target = users.find((u) => u.uid === uid);
      setActionNotice(
        `Dealer ${target?.businessName || target?.displayName || uid} set to ${newStatus.toUpperCase()}`
      );
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database update failed';
      alert(`Could not update dealer status in Firestore: ${msg}`);
    } finally {
      setActionInProgress(false);
    }
  };

  // Activate / Deactivate Dealer Account
  const handleToggleActiveStatus = async (uid: string, currentActive: boolean) => {
    setActionInProgress(true);
    try {
      const newActive = !currentActive;
      await updateDoc(doc(db, 'users', uid), {
        isActive: newActive,
        updatedAt: new Date().toISOString(),
      });
      const target = users.find((u) => u.uid === uid);
      setActionNotice(
        `Dealer account ${target?.shopName || target?.displayName || uid} is now ${
          newActive ? 'ACTIVE (Visible in Customer Locator)' : 'DEACTIVATED (Hidden from Customer Locator)'
        }`
      );
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed';
      alert(`Could not toggle dealer active status in Firestore: ${msg}`);
    } finally {
      setActionInProgress(false);
    }
  };

  // Save Dealer Shop Details & GPS Coordinates
  const handleSaveDealerDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionInProgress(true);

    try {
      let lat: number | null = null;
      let lng: number | null = null;

      if (editForm.latitude.trim()) {
        const parsedLat = parseFloat(editForm.latitude.trim());
        if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
          throw new Error('Latitude must be a valid number between -90 and 90');
        }
        lat = parsedLat;
      }

      if (editForm.longitude.trim()) {
        const parsedLng = parseFloat(editForm.longitude.trim());
        if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
          throw new Error('Longitude must be a valid number between -180 and 180');
        }
        lng = parsedLng;
      }

      const updateData: Record<string, any> = {
        shopName: editForm.shopName.trim(),
        businessName: editForm.shopName.trim(),
        displayName: editForm.displayName.trim(),
        phone: editForm.phone.trim(),
        whatsapp: editForm.whatsapp.trim(),
        email: editForm.email.trim(),
        shopAddress: editForm.shopAddress.trim(),
        city: editForm.city.trim(),
        pincode: editForm.pincode.trim(),
        zoneId: editForm.zoneId,
        latitude: lat,
        longitude: lng,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'users', selectedUser.uid), updateData);
      setActionNotice('Dealer shop details and geographical coordinates updated successfully.');
      setTimeout(() => setActionNotice(null), 3500);
      setIsEditingDealer(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save dealer';
      alert(`Could not save dealer details: ${msg}`);
    } finally {
      setActionInProgress(false);
    }
  };

  // Change User Role
  const handleChangeRole = async (uid: string, newRole: 'customer' | 'dealer' | 'admin') => {
    setActionInProgress(true);
    try {
      const updateData: Record<string, any> = {
        role: newRole,
        updatedAt: new Date().toISOString(),
      };
      if (newRole === 'dealer') {
        updateData.dealerStatus = 'approved';
      }
      await updateDoc(doc(db, 'users', uid), updateData);
      setActionNotice(`User role updated to ${newRole.toUpperCase()}`);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Role change failed';
      alert(`Could not update user role: ${msg}`);
    } finally {
      setActionInProgress(false);
    }
  };

  // Filter accounts
  const filteredUsers = users.filter((u) => {
    // Tab filter
    if (tab === 'dealers_pending') {
      if (u.role !== 'dealer' || u.dealerStatus !== 'pending') return false;
    } else if (tab === 'dealers_approved') {
      if (u.role !== 'dealer' || u.dealerStatus !== 'approved') return false;
    } else if (tab === 'dealers_rejected') {
      if (u.role !== 'dealer' || u.dealerStatus !== 'rejected') return false;
    } else if (tab === 'customers') {
      if (u.role !== 'customer' && u.role !== undefined) return false;
    } else if (tab === 'admins') {
      if (u.role !== 'admin') return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const nameMatch = (u.displayName || '').toLowerCase().includes(q);
      const emailMatch = (u.email || '').toLowerCase().includes(q);
      const businessMatch = (u.businessName || '').toLowerCase().includes(q);
      const shopMatch = (u.shopName || '').toLowerCase().includes(q);
      const cityMatch = (u.city || '').toLowerCase().includes(q);
      const pincodeMatch = (u.pincode || '').includes(q);
      const phoneMatch = (u.phone || '').includes(q);
      const gstMatch = (u.gstNumber || '').toLowerCase().includes(q);
      const uidMatch = u.uid.toLowerCase().includes(q);
      return nameMatch || emailMatch || businessMatch || shopMatch || cityMatch || pincodeMatch || phoneMatch || gstMatch || uidMatch;
    }

    return true;
  });

  // Calculate user's order history
  const getUserOrders = (uid: string) => {
    return orders.filter((o) => o.customerId === uid || o.dealerId === uid);
  };

  const getUserTotalSpend = (uid: string) => {
    return getUserOrders(uid).reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  };

  const pendingCount = users.filter((u) => u.role === 'dealer' && u.dealerStatus === 'pending').length;
  const approvedCount = users.filter((u) => u.role === 'dealer' && u.dealerStatus === 'approved').length;
  const customersCount = users.filter((u) => u.role === 'customer' || !u.role).length;

  return (
    <div className="dealers-page">
      <header className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1>Customer & Dealer Accounts</h1>
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
            Verify wholesale trade dealer applications, manage shop details, update GPS coordinates, and monitor lifetime purchase activity.
          </p>
        </div>
      </header>

      {actionNotice && (
        <div className="card notice-banner">
          <CheckCircle size={20} className="text-success" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="dealer-kpis">
        <div className="card dealer-kpi-card">
          <div className="dp-kpi-icon dp-kpi-icon-warning">
            <Clock size={24} />
          </div>
          <div className="dp-kpi-text">
            <div className="dp-kpi-value">{pendingCount}</div>
            <div className="dp-kpi-label">Pending Dealer Review</div>
          </div>
        </div>

        <div className="card dealer-kpi-card">
          <div className="dp-kpi-icon dp-kpi-icon-success">
            <ShieldCheck size={24} />
          </div>
          <div className="dp-kpi-text">
            <div className="dp-kpi-value">{approvedCount}</div>
            <div className="dp-kpi-label">Approved Trade Dealers</div>
          </div>
        </div>

        <div className="card dealer-kpi-card">
          <div className="dp-kpi-icon dp-kpi-icon-info">
            <Users size={24} />
          </div>
          <div className="dp-kpi-text">
            <div className="dp-kpi-value">{customersCount}</div>
            <div className="dp-kpi-label">Registered Customers</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="card controls-card" style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrap" style={{ flex: '1 1 260px' }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="input search-input"
              placeholder="Search by name, email, shop, city, PIN, phone, GST..."
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

          <div className="status-tabs" style={{ margin: 0 }}>
            <button
              type="button"
              className={`status-tab ${tab === 'all' ? 'status-tab-active' : ''}`}
              onClick={() => setTab('all')}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              className={`status-tab ${tab === 'dealers_pending' ? 'status-tab-active' : ''}`}
              onClick={() => setTab('dealers_pending')}
            >
              Pending Dealers ({pendingCount})
            </button>
            <button
              type="button"
              className={`status-tab ${tab === 'dealers_approved' ? 'status-tab-active' : ''}`}
              onClick={() => setTab('dealers_approved')}
            >
              Approved Dealers ({approvedCount})
            </button>
            <button
              type="button"
              className={`status-tab ${tab === 'customers' ? 'status-tab-active' : ''}`}
              onClick={() => setTab('customers')}
            >
              Customers ({customersCount})
            </button>
            <button
              type="button"
              className={`status-tab ${tab === 'admins' ? 'status-tab-active' : ''}`}
              onClick={() => setTab('admins')}
            >
              Admins ({users.filter((u) => u.role === 'admin').length})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
          <div>Loading user accounts from Cloud Firestore...</div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card op-empty">
          <Inbox size={36} />
          <p className="op-empty-title">No accounts found</p>
          <p className="text-secondary">
            {users.length === 0
              ? 'No user documents currently exist in Firestore.'
              : 'No users match the selected tab filter or search query.'}
          </p>
        </div>
      ) : (
        <div className="card table-card op-table-view">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User / Business</th>
                  <th>Role</th>
                  <th>Contact Info</th>
                  <th>Dealer & Active Status</th>
                  <th>Location & GPS</th>
                  <th>Orders / Spend</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const userOrders = getUserOrders(u.uid);
                  const totalSpend = getUserTotalSpend(u.uid);
                  const hasCoordinates = typeof u.latitude === 'number' && typeof u.longitude === 'number';
                  const isDealerActive = u.isActive !== false;

                  return (
                    <tr
                      key={u.uid}
                      tabIndex={0}
                      onClick={() => handleSelectUser(u)}
                      className={`op-row ${selectedUser?.uid === u.uid ? 'row-selected' : ''}`}
                    >
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {u.shopName || u.businessName || u.displayName || 'User'}
                        </div>
                        {(u.shopName || u.businessName) && (
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Building size={12} /> {u.shopName || u.businessName}
                          </div>
                        )}
                        {u.shopAddress && (
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                            📍 {u.shopAddress}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          UID: {u.uid.slice(0, 10)}...
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            u.role === 'admin'
                              ? 'badge-error'
                              : u.role === 'dealer'
                              ? 'badge-info'
                              : 'badge-neutral'
                          }`}
                        >
                          {(u.role || 'CUSTOMER').toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Mail size={12} style={{ color: 'var(--color-text-secondary)' }} />
                          {u.email || 'No email registered'}
                        </div>
                        {u.phone && (
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <Phone size={12} /> {u.phone}
                          </div>
                        )}
                      </td>

                      <td>
                        {u.role === 'dealer' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span
                              className={`badge ${
                                u.dealerStatus === 'approved'
                                  ? 'badge-success'
                                  : u.dealerStatus === 'pending'
                                  ? 'badge-warning'
                                  : 'badge-error'
                              }`}
                            >
                              {(u.dealerStatus || 'PENDING').toUpperCase()}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: isDealerActive ? '#16803D' : '#DC2626',
                              }}
                            >
                              {isDealerActive ? '● Active' : '○ Deactivated'}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>—</span>
                        )}
                      </td>

                      <td>
                        {u.role === 'dealer' ? (
                          <div style={{ fontSize: 12 }}>
                            <div>{u.city ? `${u.city} ${u.pincode ? `(${u.pincode})` : ''}` : 'No City/PIN'}</div>
                            {hasCoordinates ? (
                              <div style={{ fontSize: 11, color: '#16803D', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Navigation size={11} /> {u.latitude?.toFixed(3)}, {u.longitude?.toFixed(3)}
                              </div>
                            ) : (
                              <div style={{ fontSize: 11, color: '#D97706', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <AlertTriangle size={11} /> No GPS Coords
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            {u.addresses?.length ? `${u.addresses.length} address(es)` : '—'}
                          </span>
                        )}
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {userOrders.length} order(s)
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                          ₹{totalSpend.toLocaleString('en-IN')} total
                        </div>
                      </td>

                      <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div
                          style={{ display: 'inline-flex', gap: 6 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {u.role === 'dealer' && u.dealerStatus !== 'approved' && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleUpdateDealerStatus(u.uid, 'approved')}
                              disabled={actionInProgress}
                              style={{ padding: '4px 10px', fontSize: 12 }}
                            >
                              Approve
                            </button>
                          )}

                          {u.role === 'dealer' && u.dealerStatus !== 'rejected' && (
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{ background: 'rgba(180, 35, 24, 0.1)', color: '#B42318', border: 'none', padding: '4px 8px', fontSize: 12 }}
                              onClick={() => handleUpdateDealerStatus(u.uid, 'rejected')}
                              disabled={actionInProgress}
                            >
                              Reject
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleSelectUser(u)}
                            style={{ padding: '4px 8px', fontSize: 12 }}
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USER DETAILS DRAWER */}
      {selectedUser && (
        <div className="op-overlay" onClick={() => setSelectedUser(null)}>
          <div className="op-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <div>
                <span className="order-id-badge" style={{ fontSize: 13 }}>
                  {(selectedUser.role || 'CUSTOMER').toUpperCase()}
                </span>
                <h3 style={{ marginTop: 6 }}>
                  {selectedUser.shopName || selectedUser.businessName || selectedUser.displayName || 'Account Profile'}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  UID: {selectedUser.uid}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedUser(null)}
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              {/* Dealer Status & Activation Control */}
              {selectedUser.role === 'dealer' && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    background:
                      selectedUser.dealerStatus === 'approved'
                        ? 'rgba(22, 128, 61, 0.08)'
                        : selectedUser.dealerStatus === 'pending'
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'rgba(180, 35, 24, 0.08)',
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                    TRADE DEALER STATUS & VISIBILITY
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span
                        className={`badge ${
                          selectedUser.dealerStatus === 'approved'
                            ? 'badge-success'
                            : selectedUser.dealerStatus === 'pending'
                            ? 'badge-warning'
                            : 'badge-error'
                        }`}
                        style={{ fontSize: 13, padding: '4px 10px' }}
                      >
                        {(selectedUser.dealerStatus || 'PENDING').toUpperCase()}
                      </span>

                      <span
                        className={`badge ${selectedUser.isActive !== false ? 'badge-success' : 'badge-neutral'}`}
                        style={{ fontSize: 12, padding: '4px 8px' }}
                      >
                        {selectedUser.isActive !== false ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {selectedUser.dealerStatus !== 'approved' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUpdateDealerStatus(selectedUser.uid, 'approved')}
                          disabled={actionInProgress}
                        >
                          Approve Dealer
                        </button>
                      )}
                      {selectedUser.dealerStatus !== 'rejected' && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ background: 'rgba(180, 35, 24, 0.1)', color: '#B42318', border: 'none' }}
                          onClick={() => handleUpdateDealerStatus(selectedUser.uid, 'rejected')}
                          disabled={actionInProgress}
                        >
                          Reject Application
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                        onClick={() => handleToggleActiveStatus(selectedUser.uid, selectedUser.isActive !== false)}
                        disabled={actionInProgress}
                      >
                        <Power size={13} />
                        {selectedUser.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8, lineHeight: 1.4 }}>
                    {selectedUser.dealerStatus === 'approved' && selectedUser.isActive !== false ? (
                      <span style={{ color: '#16803D' }}>
                        ✓ Approved & Active: This dealer record is visible to customers in the mobile Dealer Locator.
                      </span>
                    ) : (
                      <span style={{ color: '#D97706' }}>
                        Notice: Unapproved or deactivated dealers are strictly excluded from the customer-side Dealer Locator.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Dealer Shop Information & GPS Coordinates */}
              {selectedUser.role === 'dealer' && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    background: 'var(--color-surface-muted)',
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                      SHOP DETAILS & GEOGRAPHICAL COORDINATES
                    </div>
                    {!isEditingDealer && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsEditingDealer(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 8px' }}
                      >
                        <Edit3 size={13} /> Edit Details
                      </button>
                    )}
                  </div>

                  {isEditingDealer ? (
                    <form onSubmit={handleSaveDealerDetails}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Shop Name *</label>
                          <input
                            type="text"
                            className="input"
                            style={{ width: '100%', fontSize: 13 }}
                            value={editForm.shopName}
                            onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Contact Person Name *</label>
                          <input
                            type="text"
                            className="input"
                            style={{ width: '100%', fontSize: 13 }}
                            value={editForm.displayName}
                            onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Phone *</label>
                          <input
                            type="text"
                            className="input"
                            style={{ width: '100%', fontSize: 13 }}
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>WhatsApp Number</label>
                          <input
                            type="text"
                            className="input"
                            style={{ width: '100%', fontSize: 13 }}
                            value={editForm.whatsapp}
                            onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                            placeholder="e.g. +91 98400 12345"
                          />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Shop Address *</label>
                          <input
                            type="text"
                            className="input"
                            style={{ width: '100%', fontSize: 13 }}
                            value={editForm.shopAddress}
                            onChange={(e) => setEditForm({ ...editForm, shopAddress: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>City *</label>
                          <input
                            type="text"
                            className="input"
                            style={{ width: '100%', fontSize: 13 }}
                            value={editForm.city}
                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                            placeholder="e.g. Chennai, Chengalpattu"
                            required
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>PIN Code *</label>
                          <input
                            type="text"
                            className="input"
                            style={{ width: '100%', fontSize: 13 }}
                            value={editForm.pincode}
                            onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                            placeholder="6-digit PIN code"
                            required
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Delivery Zone</label>
                          <select
                            className="input"
                            style={{ width: '100%', fontSize: 13 }}
                            value={editForm.zoneId}
                            onChange={(e) => setEditForm({ ...editForm, zoneId: e.target.value })}
                          >
                            <option value="chennai">Chennai Zone</option>
                            <option value="chengalpattu">Chengalpattu Zone</option>
                            <option value="kanchipuram">Kanchipuram Zone</option>
                            <option value="pondicherry">Pondicherry Zone</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Latitude (GPS)</label>
                          <input
                            type="text"
                            className="input"
                            style={{ width: '100%', fontSize: 13 }}
                            value={editForm.latitude}
                            onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                            placeholder="e.g. 12.9249"
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Longitude (GPS)</label>
                          <input
                            type="text"
                            className="input"
                            style={{ width: '100%', fontSize: 13 }}
                            value={editForm.longitude}
                            onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                            placeholder="e.g. 80.1472"
                          />
                        </div>
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 12, lineHeight: 1.4 }}>
                        * Coordinates are used for GPS distance calculation in the customer-facing locator. If exact coordinates are not known, leave them blank (do not invent coordinates).
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={actionInProgress}>
                          Save Changes
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setIsEditingDealer(false)}
                          disabled={actionInProgress}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                      <div>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Shop Name: </span>
                        <strong>{selectedUser.shopName || selectedUser.businessName || '—'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Contact Person: </span>
                        <strong>{selectedUser.displayName || '—'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Shop Address: </span>
                        <strong>{selectedUser.shopAddress || '—'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-secondary)' }}>City & PIN: </span>
                        <strong>{selectedUser.city || '—'} {selectedUser.pincode ? `(${selectedUser.pincode})` : ''}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Phone: </span>
                        <strong>{selectedUser.phone || '—'}</strong>
                      </div>
                      {selectedUser.whatsapp && (
                        <div>
                          <span style={{ color: 'var(--color-text-secondary)' }}>WhatsApp: </span>
                          <strong>{selectedUser.whatsapp}</strong>
                        </div>
                      )}
                      {selectedUser.gstNumber && (
                        <div>
                          <span style={{ color: 'var(--color-text-secondary)' }}>GSTIN: </span>
                          <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedUser.gstNumber}</strong>
                        </div>
                      )}
                      <div style={{ paddingTop: 6, borderTop: '1px solid var(--color-border)', marginTop: 4 }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Geographical Coordinates: </span>
                        {typeof selectedUser.latitude === 'number' && typeof selectedUser.longitude === 'number' ? (
                          <strong style={{ color: '#16803D' }}>
                            📍 {selectedUser.latitude}, {selectedUser.longitude} (Proximity Enabled)
                          </strong>
                        ) : (
                          <strong style={{ color: '#D97706' }}>
                            ⚠️ Missing GPS Coordinates (Searchable by City & PIN Code only)
                          </strong>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Regular Customer Contact Information */}
              {selectedUser.role !== 'dealer' && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    background: 'var(--color-surface-muted)',
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                    CONTACT INFORMATION
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Full Name: </span>
                      <strong>{selectedUser.displayName || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Email: </span>
                      <strong>{selectedUser.email || '—'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Phone: </span>
                      <strong>{selectedUser.phone || '—'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Role Management */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: 'var(--color-surface-muted)',
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  ASSIGN SYSTEM ROLE
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${selectedUser.role === 'customer' || !selectedUser.role ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleChangeRole(selectedUser.uid, 'customer')}
                    disabled={actionInProgress}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${selectedUser.role === 'dealer' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleChangeRole(selectedUser.uid, 'dealer')}
                    disabled={actionInProgress}
                  >
                    Dealer
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${selectedUser.role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleChangeRole(selectedUser.uid, 'admin')}
                    disabled={actionInProgress}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Saved Delivery Addresses */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                  SAVED ADDRESSES ({selectedUser.addresses?.length || 0})
                </div>
                {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedUser.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: 12,
                          border: '1px solid var(--color-border)',
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      >
                        <strong>{addr.label || 'Address'}</strong> — {addr.fullName}
                        <div style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                        </div>
                        <div style={{ color: 'var(--color-text-secondary)' }}>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          Phone: {addr.phone}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    No delivery addresses stored in user profile.
                  </div>
                )}
              </div>

              {/* Recent Orders placed by this user */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                  PURCHASE HISTORY ({getUserOrders(selectedUser.uid).length})
                </div>
                {getUserOrders(selectedUser.uid).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {getUserOrders(selectedUser.uid).map((order) => (
                      <div
                        key={order.id}
                        style={{
                          padding: 10,
                          border: '1px solid var(--color-border)',
                          borderRadius: 8,
                          fontSize: 13,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong>{order.orderNumber || order.id.slice(0, 10)}</strong>
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-IN')} • {order.items?.length || 0} items
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong>₹{Number(order.total || 0).toLocaleString('en-IN')}</strong>
                          <div>
                            <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                              {(order.orderStatus || 'placed').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    No orders linked to this UID yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const AccountsPage = DealersPage;