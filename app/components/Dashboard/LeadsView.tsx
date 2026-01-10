'use client';

import { useState, useEffect } from 'react';
import { fetchLeads, updateLead, deleteLead, Lead, LeadsResponse } from '../../../lib/api/api';
import Swal from 'sweetalert2';

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    subscribed: 0,
    unsubscribed: 0,
    fromHero: 0,
    fromCta: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubscribed, setFilterSubscribed] = useState<boolean | undefined>(undefined);
  const [filterSource, setFilterSource] = useState<string>('');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async (search?: string, subscribed?: boolean, source?: string) => {
    try {
      setLoading(true);
      const searchQuery = search && search.trim() !== '' ? search.trim() : undefined;
      const subscribedFilter = subscribed !== undefined ? subscribed : filterSubscribed;
      const sourceFilter = source || (filterSource !== '' ? filterSource : undefined);
      
      const response: LeadsResponse = await fetchLeads(searchQuery, subscribedFilter, sourceFilter);
      setLeads(response.leads);
      
      // Calculate stats from all leads (not filtered)
      const allLeadsResponse = await fetchLeads();
      const allLeads = allLeadsResponse.leads;
      setStats({
        total: allLeadsResponse.pagination.total,
        subscribed: allLeads.filter(l => l.subscribed).length,
        unsubscribed: allLeads.filter(l => !l.subscribed).length,
        fromHero: allLeads.filter(l => l.source === 'hero').length,
        fromCta: allLeads.filter(l => l.source === 'cta').length,
      });
    } catch (err) {
      console.error('Failed to load leads:', err);
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to load leads',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadLeads(searchTerm, filterSubscribed, filterSource || undefined);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeads(searchTerm, filterSubscribed, filterSource || undefined);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterSubscribed, filterSource]);

  const handleUpdateLead = async (lead: Lead, updates: { subscribed?: boolean; notes?: string; resendEmail?: boolean }) => {
    try {
      await updateLead(lead.id, updates);
      await Swal.fire({
        title: 'Success!',
        text: updates.resendEmail ? 'Thank you email resent successfully!' : 'Lead updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true,
      });
      await loadLeads();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to update lead',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete lead "${lead.email}"? This action is irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    });

    if (result.isDismissed || !result.isConfirmed) {
      return;
    }

    try {
      await deleteLead(lead.id);
      await Swal.fire({
        title: 'Deleted!',
        text: `Lead "${lead.email}" has been deleted successfully.`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true,
      });
      await loadLeads();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete lead',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const handleResendEmail = async (lead: Lead) => {
    const result = await Swal.fire({
      title: 'Resend Thank You Email?',
      text: `Send thank you email to "${lead.email}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, resend!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isDismissed || !result.isConfirmed) {
      return;
    }

    await handleUpdateLead(lead, { resendEmail: true });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSourceBadge = (source: string) => {
    const colors = {
      hero: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      cta: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      other: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400',
    };
    return colors[source as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage email subscriptions and leads
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="flex-1 sm:flex-none min-w-[200px] px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterSubscribed === undefined ? 'all' : filterSubscribed.toString()}
            onChange={(e) => setFilterSubscribed(e.target.value === 'all' ? undefined : e.target.value === 'true')}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="true">Subscribed</option>
            <option value="false">Unsubscribed</option>
          </select>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sources</option>
            <option value="hero">Hero Section</option>
            <option value="cta">CTA Section</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={() => loadLeads()}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors text-sm font-medium disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Leads Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Leads</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {loading ? '...' : stats.total.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Subscribed</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {loading ? '...' : stats.subscribed.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Unsubscribed</p>
          <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
            {loading ? '...' : stats.unsubscribed.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">From Hero</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {loading ? '...' : stats.fromHero.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">From CTA</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {loading ? '...' : stats.fromCta.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">
            {searchTerm || filterSubscribed !== undefined || filterSource ? 'No leads found' : 'No leads yet'}
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {searchTerm || filterSubscribed !== undefined || filterSource
              ? 'Try adjusting your search or filter criteria.'
              : 'Leads will appear here once users subscribe via email forms.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider hidden md:table-cell">
                    Email Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider hidden lg:table-cell">
                    Subscribed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold shrink-0">
                          {lead.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-zinc-900 dark:text-white">
                            {lead.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceBadge(lead.source)}`}
                      >
                        {lead.source === 'hero' ? 'Hero Section' : lead.source === 'cta' ? 'CTA Section' : 'Other'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleUpdateLead(lead, { subscribed: !lead.subscribed })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          lead.subscribed
                            ? 'bg-green-600 focus:ring-green-500'
                            : 'bg-zinc-300 dark:bg-zinc-600 focus:ring-zinc-500'
                        }`}
                        role="switch"
                        aria-checked={lead.subscribed}
                        title={lead.subscribed ? 'Click to unsubscribe' : 'Click to subscribe'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            lead.subscribed ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="ml-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {lead.subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                      {lead.emailSent ? (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{formatDate(lead.emailSentAt)}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-500">Not sent</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400 hidden lg:table-cell">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResendEmail(lead)}
                          className="p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                          title="Resend thank you email"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead)}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete lead"
                        >
                          <svg
                            className="h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {leads.length > 0 && (
        <div className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
          Showing {leads.length} of {stats.total} leads
        </div>
      )}
    </div>
  );
}
