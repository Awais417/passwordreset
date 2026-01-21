'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createWalletUser,
  deleteWalletUser,
  fetchMyWallet,
  fetchWalletUsers,
  requestWithdraw,
  WalletTxn,
  WalletUser,
  WalletUsersResponse,
} from '../../../lib/api/api';
import { getUser } from '../../../lib/api/auth';
import Swal from 'sweetalert2';

export default function WalletView() {
  const [users, setUsers] = useState<WalletUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser] = useState(getUser());
  const isWalletUser = (currentUser?.userType || '').toLowerCase() === 'wallet';

  // Wallet dashboard state (for wallet users)
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [txns, setTxns] = useState<WalletTxn[]>([]);

  useEffect(() => {
    if (isWalletUser) {
      loadMyWallet();
    } else {
      loadWalletUsers();
    }
  }, []);

  const loadMyWallet = async () => {
    if (!currentUser?.id) return;
    try {
      setWalletLoading(true);
      const res = await fetchMyWallet(currentUser.id);
      setWalletBalance(res.wallet.balance || 0);
      setTotalSales(res.wallet.totalSales || 0);
      setTotalEarned(res.wallet.totalEarned || 0);
      setTotalWithdrawn(res.wallet.totalWithdrawn || 0);
      setTxns(res.transactions || []);
    } catch (err) {
      console.error('Failed to load wallet:', err);
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to load wallet',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setWalletLoading(false);
    }
  };

  const loadWalletUsers = async (search?: string) => {
    try {
      setLoading(true);
      const searchQuery = search && search.trim() !== '' ? search.trim() : undefined;
      const response: WalletUsersResponse = await fetchWalletUsers(searchQuery);
      setUsers(response.users);
    } catch (err) {
      console.error('Failed to load wallet users:', err);
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to load wallet users',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (isWalletUser) return;
    const timer = setTimeout(() => {
      loadWalletUsers(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const showCreateWalletModal = async (initialUsername = '', initialEmail = '', initialPassword = '', errorMessage = '') => {
    if (isWalletUser) return;
    const { value: formValues } = await Swal.fire({
      title: 'Create Wallet Account',
      html: `
        <div style="text-align: left; margin-top: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Username</label>
          <input id="swal-username" class="swal2-input" placeholder="Enter username" value="${initialUsername}" style="margin-top: 0.5rem;">
          <label style="display: block; margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Email Address</label>
          <input id="swal-email" type="email" class="swal2-input" placeholder="Enter email address" value="${initialEmail}" style="margin-top: 0.5rem;">
          <label style="display: block; margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Password</label>
          <input id="swal-password" type="password" class="swal2-input" placeholder="Enter password (min 6 characters)" value="${initialPassword}" style="margin-top: 0.5rem;">
          <div id="swal-error" style="color: #dc2626; margin-top: 0.5rem; font-size: 0.875rem; display: ${errorMessage ? 'block' : 'none'};">${errorMessage}</div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Create Account',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      preConfirm: () => {
        const username = (document.getElementById('swal-username') as HTMLInputElement)?.value;
        const email = (document.getElementById('swal-email') as HTMLInputElement)?.value;
        const password = (document.getElementById('swal-password') as HTMLInputElement)?.value;
        const errorDiv = document.getElementById('swal-error') as HTMLDivElement;

        if (errorDiv) {
          errorDiv.style.display = 'none';
          errorDiv.textContent = '';
        }

        if (!username || username.trim() === '') {
          if (errorDiv) {
            errorDiv.textContent = 'Username is required';
            errorDiv.style.display = 'block';
          }
          return false;
        }

        if (!email || !email.includes('@')) {
          if (errorDiv) {
            errorDiv.textContent = 'Valid email address is required';
            errorDiv.style.display = 'block';
          }
          return false;
        }

        if (!password || password.length < 6) {
          if (errorDiv) {
            errorDiv.textContent = 'Password must be at least 6 characters';
            errorDiv.style.display = 'block';
          }
          return false;
        }

        return { username: username.trim(), email: email.trim(), password };
      },
    });

    if (formValues) {
      try {
        await createWalletUser(formValues.username, formValues.email, formValues.password);
        Swal.fire({
          title: 'Created!',
          text: 'Wallet account created successfully',
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
        loadWalletUsers(searchTerm);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create wallet account';
        await showCreateWalletModal(formValues.username, formValues.email, formValues.password, message);
      }
    }
  };

  const handleDelete = async (user: WalletUser) => {
    if (isWalletUser) return;
    const result = await Swal.fire({
      title: 'Delete wallet account?',
      text: `This will permanently delete ${user.email}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteWalletUser(user.id);
      Swal.fire({
        title: 'Deleted!',
        text: 'Wallet account deleted successfully',
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 1500,
        timerProgressBar: true,
      });
      loadWalletUsers(searchTerm);
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete wallet account',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const currencyFmt = useMemo(() => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }), []);

  const handleWithdraw = async () => {
    if (!currentUser?.id) return;

    const { value: amount } = await Swal.fire({
      title: 'Withdraw',
      html: `
        <div style="text-align:left; margin-top: 1rem;">
          <p style="margin: 0 0 0.5rem 0; color:#374151; font-size: 0.9rem;">
            Available balance: <strong>${currencyFmt.format(walletBalance)}</strong>
          </p>
          <label style="display:block; margin-top: 0.75rem; margin-bottom: 0.5rem; font-weight: 600; color:#111827;">Amount</label>
          <input id="swal-withdraw-amount" type="number" class="swal2-input" placeholder="Enter amount" min="0.01" step="0.01" style="margin-top:0.25rem;">
          <div style="margin-top: 0.75rem; font-size: 0.85rem; color:#6b7280;">
            Note: Card/bank payouts require Stripe Connect onboarding. This will create a withdrawal request.
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Request Withdraw',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const input = document.getElementById('swal-withdraw-amount') as HTMLInputElement;
        const val = Number(input?.value || 0);
        if (!val || isNaN(val) || val <= 0) return false;
        if (val > walletBalance) return false;
        return val;
      },
    });

    if (!amount) return;

    try {
      await requestWithdraw(currentUser.id, amount);
      await Swal.fire({
        title: 'Requested!',
        text: 'Your withdrawal request has been created.',
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 2500,
        timerProgressBar: true,
      });
      await loadMyWallet();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to request withdrawal',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  // Wallet user dashboard (read-only)
  if (isWalletUser) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">My Wallet</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Earnings from your discount code sales</p>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={walletLoading || walletBalance <= 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-md dark:bg-zinc-900">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Balance</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{currencyFmt.format(walletBalance)}</div>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-md dark:bg-zinc-900">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Total Sales</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{totalSales}</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Total price is £19.99 (discount may apply)</div>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-md dark:bg-zinc-900">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Earned</div>
            <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{currencyFmt.format(totalEarned)}</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Withdrawn: {currencyFmt.format(totalWithdrawn)}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Recent activity</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">You got</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {walletLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-sm text-zinc-600 dark:text-zinc-400">
                      Loading...
                    </td>
                  </tr>
                ) : txns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-sm text-zinc-600 dark:text-zinc-400">
                      No wallet activity yet.
                    </td>
                  </tr>
                ) : (
                  txns.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/40">
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">
                        {t.type === 'credit' ? 'Sale' : 'Withdraw'}
                        {t.status === 'pending' ? ' (pending)' : ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{t.code?.code || '—'}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {t.paidAmount !== null ? currencyFmt.format(t.paidAmount) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        {t.type === 'credit' ? '+' : '-'} {currencyFmt.format(t.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Wallet Accounts</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {isWalletUser ? 'View wallet user accounts' : 'Create and manage wallet user accounts'}
          </p>
        </div>

        {!isWalletUser && (
          <button
            onClick={() => showCreateWalletModal()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <span className="text-base">+</span>
            Create Account
          </button>
        )}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-md dark:bg-zinc-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search wallet users..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Username</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hidden md:table-cell">Created</th>
                {!isWalletUser && (
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-zinc-600 dark:text-zinc-400" colSpan={isWalletUser ? 3 : 4}>
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-zinc-600 dark:text-zinc-400" colSpan={isWalletUser ? 3 : 4}>
                    No wallet users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/40">
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">{u.username}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                    </td>
                    {!isWalletUser && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(u)}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

