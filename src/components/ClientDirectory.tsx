import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  UserPlus, 
  Mail, 
  Building2, 
  User, 
  Phone, 
  Award, 
  X,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { Client, ClientStatus, ClientTier } from '../types';

interface ClientDirectoryProps {
  clients: Client[];
  onAddClient: (newClient: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    tier: ClientTier;
    status: ClientStatus;
  }) => void;
}

export default function ClientDirectory({ clients, onAddClient }: ClientDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // New Client Form State
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState<ClientTier>('Gold');
  const [status, setStatus] = useState<ClientStatus>('Active');
  const [formError, setFormError] = useState('');

  // Filtering Logic
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || client.status === statusFilter;
    const matchesTier = tierFilter === 'All' || client.tier === tierFilter;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  const handleOpenDrawer = () => {
    // Clear form state
    setCompanyName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setTier('Gold');
    setStatus('Active');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!companyName.trim()) {
      setFormError('Company Name is required.');
      return;
    }
    if (!contactPerson.trim()) {
      setFormError('Contact Person name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('A valid Email address is required.');
      return;
    }

    onAddClient({
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim() || '+1 (555) 000-0000',
      tier,
      status
    });

    setIsDrawerOpen(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setTierFilter('All');
  };

  // Helper styles for statuses
  const getStatusBadge = (status: ClientStatus) => {
    const styles = {
      'Active': 'bg-lime-50 text-lime-700 border-lime-200',
      'Inactive': 'bg-gray-100 text-gray-600 border-gray-200',
      'Pending Approval': 'bg-amber-50 text-amber-700 border-amber-200'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-flex items-center whitespace-nowrap shadow-xs ${styles[status]}`}>
        {status}
      </span>
    );
  };

  // Helper styles for Tiers
  const getTierBadge = (tier: ClientTier) => {
    const styles = {
      'Platinum': 'bg-purple-50 text-purple-700 border-purple-200',
      'Gold': 'bg-amber-50 text-amber-800 border-amber-200',
      'Silver': 'bg-slate-50 text-slate-700 border-slate-200',
      'Bronze': 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-mono tracking-wider font-semibold uppercase rounded-md border ${styles[tier]}`}>
        {tier}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono tracking-widest text-indigo-650 uppercase block mb-1 font-semibold">
            PARTNER RELATIONSHIPS
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Client Directory
          </h1>
          <p className="text-sm font-light text-slate-500 mt-0.5">
            Registered wholesale buyers, distribution accounts, and partner profile matrices.
          </p>
        </div>
        <button
          id="add-client-drawer-trigger-button"
          onClick={handleOpenDrawer}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Add New Client
        </button>
      </div>

      {/* Search & Filtering Panel */}
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="client-search-input"
            type="text"
            placeholder="Search company, contact, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 focus:bg-white rounded-xl text-sm transition-all outline-none text-slate-900"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-405 font-mono font-semibold">STATUS:</span>
            <select
              id="client-status-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none text-slate-700 text-xs font-sans font-medium hover:bg-slate-100 transition-all cursor-pointer"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending Approval">Pending Approval</option>
            </select>
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-405 font-mono font-semibold">TIER:</span>
            <select
              id="client-tier-filter-select"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none text-slate-700 text-xs font-sans font-medium hover:bg-slate-100 transition-all cursor-pointer"
            >
              <option value="All">All Tiers</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
          </div>

          {/* Reset Action */}
          {(searchTerm !== '' || statusFilter !== 'All' || tierFilter !== 'All') && (
            <button
              id="client-reset-filters-button"
              onClick={resetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-mono font-medium ml-1"
            >
              <RefreshCcw className="h-3 w-3" />
              Reset Filt.
            </button>
          )}
        </div>
      </div>

      {/* Clients Grid / Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-16 text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-150 text-slate-400">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-sans">No Wholesalers Found</h3>
            <p className="text-sm font-light text-slate-500 mt-1 max-w-md mx-auto">
              Your search filters didn't return any buyers. Try modifying your search keywords or clearing status constraints.
            </p>
            <button
              id="clear-search-empty-state-button"
              onClick={resetFilters}
              className="mt-4 text-sm text-indigo-600 hover:underline font-mono font-semibold cursor-pointer"
            >
              Clear Workspace Filters
            </button>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50/70 text-xs font-mono tracking-wider text-slate-400 uppercase select-none">
                  <th className="py-4.5 px-6 font-medium">Company Name & Tier</th>
                  <th className="py-4.5 px-6 font-medium">Contact Person</th>
                  <th className="py-4.5 px-6 font-medium">Email & Contact</th>
                  <th className="py-4.5 px-6 font-medium">Total Orders</th>
                  <th className="py-4.5 px-6 font-medium">Total Volume Spend</th>
                  <th className="py-4.5 px-6 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <AnimatePresence initial={false}>
                  {filteredClients.map((client) => {
                    const displayDate = client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-CA') : '';
                    return (
                      <motion.tr
                        key={client._id}
                        layoutId={`client-row-${client._id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedClient(client)}
                        title="Inspect buyer details"
                        className="hover:bg-indigo-50/30 cursor-pointer transition-all duration-200 group bg-white/40"
                      >
                        {/* Name + Tier */}
                        <td className="py-4.5 px-6">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {client.company}
                            </span>
                            <div className="flex items-center gap-2">
                              {getTierBadge(client.tier)}
                              <span className="text-[10px] text-slate-400 font-mono">Added: {displayDate}</span>
                            </div>
                          </div>
                        </td>

                        {/* Contact person */}
                        <td className="py-4.5 px-6 text-slate-700 font-medium">
                          {client.name}
                        </td>

                        {/* Contact metadata */}
                        <td className="py-4.5 px-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-600 font-light text-xs flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                              {client.email}
                            </span>
                            <span className="text-slate-400 text-xs flex items-center gap-1.5 font-mono">
                              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              {client.phone}
                            </span>
                          </div>
                        </td>

                        {/* Total orders */}
                        <td className="py-4.5 px-6 font-mono text-slate-600 font-medium text-center sm:text-left">
                          {client.totalOrders}
                        </td>

                        {/* Total volume spent */}
                        <td className="py-4.5 px-6 font-sans font-bold text-slate-900">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(client.totalSpend)}
                        </td>

                        {/* Status */}
                        <td className="py-4.5 px-6">
                          {getStatusBadge(client.status)}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Right Hand Form Drawer for adding new clients */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/15 backdrop-blur-xs z-40 cursor-pointer"
            />

            {/* Slide over layout container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white/95 backdrop-blur-xl border-l border-slate-200 z-50 flex flex-col justify-between overflow-hidden shadow-2xl"
            >
              {/* Drawer Top Header */}
              <div className="p-6 bg-white/60 border-b border-slate-150 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 bg-indigo-50 text-indigo-700 flex items-center justify-center rounded-lg border border-indigo-100">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-slate-900">Register New Buyer</h2>
                    <p className="text-[10px] font-mono tracking-widest text-indigo-650 uppercase font-semibold">Apex CRM Protocol</p>
                  </div>
                </div>
                <button
                  id="add-client-drawer-close-button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 px-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Form Body - Scrollable */}
              <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                <form id="new-buyer-registration-form" onSubmit={handleSubmit} className="space-y-5">
                  
                  {formError && (
                    <div className="p-3 bg-red-50/80 border border-red-200/85 text-red-650 rounded-lg text-xs flex items-start gap-2 font-sans backdrop-blur-md">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Form fields */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                      Company Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        id="new-client-company-input"
                        type="text"
                        required
                        placeholder="e.g. Pacific Coast Premium LLC"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-xl text-sm text-slate-950 outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                      Contact Person Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        id="new-client-contact-input"
                        type="text"
                        required
                        placeholder="e.g. Rachel Adams"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-xl text-sm text-slate-950 outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                      Partner Business Email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        id="new-client-email-input"
                        type="email"
                        required
                        placeholder="buyer@clientdomain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-xl text-sm text-slate-950 outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                      Company Contact Phone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        id="new-client-phone-input"
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/70 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-xl text-sm text-slate-950 outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                        Wholesale Tier
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Award className="h-4 w-4 text-slate-400" />
                        </div>
                        <select
                          id="new-client-tier-select"
                          value={tier}
                          onChange={(e) => setTier(e.target.value as ClientTier)}
                          className="w-full pl-9 pr-3 py-2.5 bg-white/70 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-xl text-sm text-slate-900 outline-none transition-all cursor-pointer shadow-xs"
                        >
                          <option value="Bronze">Bronze Tier</option>
                          <option value="Silver">Silver Tier</option>
                          <option value="Gold">Gold Tier</option>
                          <option value="Platinum">Platinum Tier</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                        Status Model
                      </label>
                      <select
                        id="new-client-status-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ClientStatus)}
                        className="w-full px-3 py-2.5 bg-white/70 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-xl text-sm text-slate-900 outline-none transition-all cursor-pointer shadow-xs"
                      >
                        <option value="Active">Active Account</option>
                        <option value="Pending Approval">Pending Approval</option>
                        <option value="Inactive">Suspended / Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Informational callout */}
                  <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/60 rounded-xl text-indigo-950 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-indigo-600 block font-bold leading-none">
                      Cloud Database Sync
                    </span>
                    <p className="text-[11px] font-sans text-slate-600 leading-relaxed font-light">
                      This record will be persisted to MongoDB Atlas and synchronized across all connected instances via the stateless API layer.
                    </p>
                  </div>

                  <input type="submit" className="hidden" />
                </form>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-6 bg-white/50 border-t border-slate-150 flex items-center justify-end gap-3 shrink-0">
                <button
                  id="new-client-drawer-cancel-button"
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold transition-all border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="new-client-drawer-submit-button"
                  type="button"
                  onClick={handleSubmit}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-100 cursor-pointer"
                >
                  Create Buyer Account
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slide-over/Drawer Right to Review Client Details */}
      <AnimatePresence>
        {selectedClient && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClient(null)}
              className="fixed inset-0 bg-slate-900/15 backdrop-blur-xs z-40 cursor-pointer"
            />

            {/* Slide over layout container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white/95 backdrop-blur-xl border-l border-slate-200 z-50 flex flex-col justify-between overflow-hidden shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-6 bg-white/60 border-b border-slate-155 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-700 flex items-center justify-center rounded-lg border border-indigo-100">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-950 font-display tracking-tight">
                      {selectedClient.company}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      {getTierBadge(selectedClient.tier)}
                      {getStatusBadge(selectedClient.status)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-1 px-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-all shrink-0 animate-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                {/* Contact Profile Stats Card */}
                <div className="bg-slate-50/50 border border-slate-100 p-4.5 rounded-xl space-y-3 shadow-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block font-bold">
                    Primary Contact Representative
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-950 flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500 shrink-0" />
                      {selectedClient.name}
                    </h4>
                    <p className="text-xs text-slate-600 font-light flex items-center gap-1.5 mt-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {selectedClient.email}
                    </p>
                    <p className="text-xs text-slate-600 font-light flex items-center gap-1.5 mt-1.5 font-mono">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {selectedClient.phone}
                    </p>
                  </div>
                </div>

                {/* Financial Summary KPIs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono text-slate-450 uppercase tracking-wider block font-bold leading-none">Completed Orders</span>
                    <span className="text-lg font-bold text-slate-905 font-mono block mt-1">{selectedClient.totalOrders}</span>
                  </div>
                  <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono text-slate-450 uppercase tracking-wider block font-bold leading-none">Wholesale Spend</span>
                    <span className="text-lg font-bold text-indigo-600 font-mono block mt-1">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      }).format(selectedClient.totalSpend)}
                    </span>
                  </div>
                </div>

                {/* Logistics Profile Description */}
                <div className="space-y-2 bg-indigo-50/20 border border-indigo-100/40 p-4.5 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-indigo-600 block font-bold leading-none">
                    Trade Agreements
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">
                    This partner is active in <strong className="text-slate-800 font-medium">{selectedClient.status}</strong> standing, registered to receive catalog seasonal alignments. Standard shipping delivery target is configured as 3 business days from wholesale pallet logistics releases.
                  </p>
                </div>

                {/* Dynamic Timeline information */}
                <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-450 uppercase tracking-wider block font-bold">Metadata Stamp</span>
                  <span className="text-xs text-slate-700 font-mono block">Registered on: {selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString('en-CA') : 'N/A'} (Buyer ID: {selectedClient._id})</span>
                </div>

              </div>

              {/* Drawer footer close */}
              <div className="p-6 bg-slate-50/60 border-t border-slate-150 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Close Profile Sheet
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
