'use client';

import { useEffect, useState } from 'react';
import { fetchCodes, deleteCode, addCode, DiscountCode, fetchWalletUsers, WalletUser } from '../../../lib/api/api';
import Swal from 'sweetalert2';

export default function DiscountCodesView() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [walletUsers, setWalletUsers] = useState<WalletUser[]>([]);

  useEffect(() => {
    loadCodes();
    loadWalletUsers();
  }, []);

  const loadCodes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchCodes();
      setCodes(response.codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load codes');
    } finally {
      setLoading(false);
    }
  };

  const loadWalletUsers = async () => {
    try {
      const res = await fetchWalletUsers();
      setWalletUsers(res.users || []);
    } catch (err) {
      // Not fatal for codes page; dropdown will just be empty
      console.error('Failed to load wallet users:', err);
    }
  };

  const showAddCodeModal = async (
    initialCode = '',
    initialDiscount = '',
    initialWalletUserId = '',
    initialWalletAmount = '',
    errorMessage = ''
  ) => {
    const optionsHtml =
      walletUsers.length > 0
        ? walletUsers
            .map((u) => {
              const selected = initialWalletUserId && initialWalletUserId === u.id ? 'selected' : '';
              return `<option value="${u.id}" ${selected}>${u.username} (${u.email})</option>`;
            })
            .join('')
        : '';

    const { value: formValues } = await Swal.fire({
      title: 'Add New Code',
      html: `
        <div style="text-align: left; margin-top: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Code Name</label>
          <input id="swal-code" class="swal2-input" placeholder="Enter code name" value="${initialCode}" style="margin-top: 0.5rem;">
          <label style="display: block; margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Discount (%)</label>
          <input id="swal-discount" type="number" class="swal2-input" placeholder="Enter discount percentage" value="${initialDiscount}" min="0" max="100" style="margin-top: 0.5rem;">
          <label style="display: block; margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 600; color: #111827;">Total Amount</label>
          <div style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; font-weight: 700;">£19.99</div>
          <label style="display: block; margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 600; color: #111827;">Wallet Amount (commission to wallet user)</label>
          <input id="swal-wallet-amount" type="number" class="swal2-input" placeholder="Enter wallet payout amount (max 18)" value="${initialWalletAmount}" min="0" max="18" step="0.01" style="margin-top: 0.5rem;">
          <label style="display: block; margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Assign to Wallet User (optional)</label>
          <select id="swal-wallet-user" class="swal2-input" style="margin-top: 0.5rem;">
            <option value="">-- Not assigned --</option>
            ${optionsHtml}
          </select>
          <div id="swal-error" style="color: #dc2626; margin-top: 0.5rem; font-size: 0.875rem; display: ${errorMessage ? 'block' : 'none'};">${errorMessage}</div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Add Code',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      preConfirm: () => {
        const code = (document.getElementById('swal-code') as HTMLInputElement)?.value;
        const discount = (document.getElementById('swal-discount') as HTMLInputElement)?.value;
        const walletUserId = (document.getElementById('swal-wallet-user') as HTMLSelectElement)?.value;
        const walletAmount = (document.getElementById('swal-wallet-amount') as HTMLInputElement)?.value;
        const errorDiv = document.getElementById('swal-error') as HTMLDivElement;

        if (errorDiv) {
          errorDiv.style.display = 'none';
          errorDiv.textContent = '';
        }

        if (!code || code.trim() === '') {
          if (errorDiv) {
            errorDiv.textContent = 'Code name is required';
            errorDiv.style.display = 'block';
          }
          return false;
        }

        if (!discount || isNaN(Number(discount)) || Number(discount) < 0 || Number(discount) > 100) {
          if (errorDiv) {
            errorDiv.textContent = 'Please enter a valid discount percentage (0-100)';
            errorDiv.style.display = 'block';
          }
          return false;
        }

        if (walletAmount && (isNaN(Number(walletAmount)) || Number(walletAmount) < 0 || Number(walletAmount) > 18)) {
          if (errorDiv) {
            errorDiv.textContent = 'Please enter a valid wallet amount (0 - 18)';
            errorDiv.style.display = 'block';
          }
          return false;
        }

        return {
          code: code.trim(),
          discount: Number(discount),
          walletUserId: walletUserId && walletUserId.trim() !== '' ? walletUserId : undefined,
          walletAmount: walletAmount && walletAmount.trim() !== '' ? Number(walletAmount) : undefined,
        };
      },
      didOpen: () => {
        const codeInput = document.getElementById('swal-code') as HTMLInputElement;
        const discountInput = document.getElementById('swal-discount') as HTMLInputElement;
        const walletAmountInput = document.getElementById('swal-wallet-amount') as HTMLInputElement;

        const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

        const preventInvalidNumberKeys = (e: KeyboardEvent) => {
          // Block scientific notation and signs in number inputs
          if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
            e.preventDefault();
          }
        };

        const clampOnInput = (inputEl: HTMLInputElement | null, min: number, max: number, decimals?: number) => {
          if (!inputEl) return;
          const raw = inputEl.value;
          if (raw === '') return;

          // Remove any non-numeric characters except dot
          const cleaned = raw.replace(/[^0-9.]/g, '');
          if (cleaned !== raw) inputEl.value = cleaned;

          const num = Number(inputEl.value);
          if (Number.isNaN(num)) {
            inputEl.value = String(min);
            return;
          }

          const clamped = clamp(num, min, max);
          if (decimals !== undefined) {
            inputEl.value = clamped.toFixed(decimals);
          } else {
            inputEl.value = String(clamped);
          }
        };

        const clampDiscount = () => {
          const n = Number(discountInput?.value);
          if (!discountInput) return;
          if (discountInput.value === '') return;
          if (isNaN(n)) {
            discountInput.value = '0';
            return;
          }
          discountInput.value = String(clamp(n, 0, 100));
        };

        const clampWalletAmount = () => {
          const n = Number(walletAmountInput?.value);
          if (!walletAmountInput) return;
          if (walletAmountInput.value === '') return;
          if (isNaN(n)) {
            walletAmountInput.value = '0';
            return;
          }
          walletAmountInput.value = String(clamp(n, 0, 18));
        };

        // Enforce limits while typing (not just on blur)
        discountInput?.addEventListener('keydown', preventInvalidNumberKeys);
        walletAmountInput?.addEventListener('keydown', preventInvalidNumberKeys);

        discountInput?.addEventListener('input', () => clampOnInput(discountInput, 0, 100));
        walletAmountInput?.addEventListener('input', () => clampOnInput(walletAmountInput, 0, 18));

        discountInput?.addEventListener('blur', clampDiscount);
        walletAmountInput?.addEventListener('blur', clampWalletAmount);

        if (codeInput) {
          codeInput.focus();
        }
      },
    });

    return formValues;
  };

  const handleAddCode = async () => {
    let formValues = await showAddCodeModal();

    if (!formValues) {
      return;
    }

    while (formValues) {
      try {
        await addCode(formValues.code, formValues.discount, formValues.walletUserId, formValues.walletAmount);
        Swal.close();
        await Swal.fire({
          title: 'Success!',
          text: `Code "${formValues.code}" has been added successfully.`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 3500,
          timerProgressBar: true,
        });
        await loadCodes();
        break;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add code';
        formValues = await showAddCodeModal(
          formValues.code,
          formValues.discount.toString(),
          formValues.walletUserId || '',
          formValues.walletAmount !== undefined ? String(formValues.walletAmount) : '',
          errorMessage
        );
        if (!formValues) {
          break;
        }
      }
    }
  };

  const handleDelete = async (code: DiscountCode) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the code "${code.code}"? This action is irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    });

    if (result.isDismissed) {
      Swal.fire({
        title: 'Cancelled',
        text: 'Delete action has been cancelled.',
        icon: 'info',
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(code._id);
      setError('');
      await deleteCode(code._id, code.code, code.discount);
      setCodes(codes.filter((c) => c._id !== code._id));
      Swal.fire({
        title: 'Deleted!',
        text: `The code "${code.code}" has been deleted successfully.`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete code',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage discount codes for your application
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddCode}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Code
          </button>
          <button
            onClick={loadCodes}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading && codes.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : codes.length === 0 ? (
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">No discount codes</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Get started by creating a new discount code.
          </p>
          <button
            onClick={handleAddCode}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Add Your First Code
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Wallet User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Wallet Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider hidden md:table-cell">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {codes.map((code) => (
                  <tr
                    key={code._id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-zinc-900 dark:text-white">
                        {code.code}
                      </div>
                      {code.description && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {code.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {code.assignedTo ? (
                        <div className="text-sm text-zinc-700 dark:text-zinc-300">
                          <div className="font-medium">{code.assignedTo.username || 'Wallet user'}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[220px]">
                            {code.assignedTo._id}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {code.discount}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        £{(code.walletAmount ?? 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          code.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {code.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                      {formatDate(code.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(code)}
                        disabled={deletingId === code._id}
                        className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete code"
                      >
                        {deletingId === code._id ? (
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5"
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
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {codes.length > 0 && (
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 text-center">
          Showing {codes.length} discount code{codes.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
