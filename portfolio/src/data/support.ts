import { SupportContact } from '../types';

export const SUPPORT_DESKS: SupportContact[] = [
  {
    id: 'support-1',
    title: 'Customer Support Desk 1',
    phone: '+91 88255 41297',
    dialPhone: '+918825541297',
    whatsapp: '918825541297',
    role: 'Orders, Purifier Sales & General Inquiries',
    hours: 'Mon – Sat: 9:00 AM – 8:00 PM',
    badge: 'Primary Desk',
  },
  {
    id: 'support-2',
    title: 'Customer Support Desk 2',
    phone: '+91 86108 76009',
    dialPhone: '+918610876009',
    whatsapp: '918610876009',
    role: 'Technician Visits, Repairs & Service Escalation',
    hours: 'Mon – Sat: 9:00 AM – 8:00 PM',
    badge: 'Service Desk',
  },
];

export const BRANCH_CONTACTS: SupportContact[] = [
  {
    id: 'branch-tambaram',
    title: 'Tambaram Main Base Hub',
    phone: '9789009889',
    dialPhone: '9789009889',
    whatsapp: '919789009889',
    role: 'Main Base Hub • Showroom, Parts & Service Desk',
    hours: 'Mon – Sun: 9:30 AM – 8:30 PM',
    badge: 'Main Base Origin',
    isMainHub: true,
    address: 'Near Tambaram Railway Station / Sanatorium, Chennai, Tamil Nadu',
    landmark: 'Central Origin for direct machine deliveries',
  },
  {
    id: 'branch-mudichur',
    title: 'Mudichur Branch',
    phone: '6383156647',
    dialPhone: '6383156647',
    whatsapp: '916383156647',
    role: 'Branch Service Station • Spares & Filter Replacement',
    hours: 'Mon – Sat: 9:30 AM – 8:00 PM',
    badge: 'Service Station',
    address: 'Mudichur Road, West Tambaram, Chennai',
    landmark: 'Authorized spares and technician hub',
  },
  {
    id: 'branch-guduvanchery',
    title: 'Guduvanchery Branch',
    phone: '8682020588',
    dialPhone: '8682020588',
    whatsapp: '918682020588',
    role: 'Branch Service Center • Technician Dispatch & Repairs',
    hours: 'Mon – Sat: 9:30 AM – 8:00 PM',
    badge: 'Service Center',
    address: 'GST Road / Station Area, Guduvanchery, Chengalpattu District',
    landmark: 'Chengalpattu region sales & quick response center',
  },
];

export const DELIVERY_ZONES = [
  {
    name: 'Chennai',
    state: 'Tamil Nadu',
    deliveryTime: 'Same Day / Next Day Delivery',
    type: 'Direct Machine Delivery + Local Dealer Spares',
  },
  {
    name: 'Chengalpattu',
    state: 'Tamil Nadu',
    deliveryTime: '24 – 48 Hours Delivery',
    type: 'Direct Machine Delivery + Local Dealer Spares',
  },
  {
    name: 'Kanchipuram',
    state: 'Tamil Nadu',
    deliveryTime: '24 – 48 Hours Delivery',
    type: 'Direct Machine Delivery + Local Dealer Spares',
  },
  {
    name: 'Pondicherry',
    state: 'Puducherry (UT)',
    deliveryTime: '48 – 72 Hours Delivery',
    type: 'Direct Machine Delivery + Local Dealer Spares',
  },
];

