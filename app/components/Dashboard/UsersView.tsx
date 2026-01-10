'use client';

import { useState, useEffect } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser, User, UsersResponse } from '../../../lib/api/api';
import Swal from 'sweetalert2';

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    freeUsers: 0,
    newThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (search?: string) => {
    try {
      setLoading(true);
      // Only pass search if it's a non-empty string, otherwise pass undefined for "all users"
      const searchQuery = search && search.trim() !== '' ? search.trim() : undefined;
      const response: UsersResponse = await fetchUsers(searchQuery);
      setUsers(response.users);
      setStats(response.stats);
    } catch (err) {
      console.error('Failed to load users:', err);
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to load users',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      // If search is cleared, reload all users
      loadUsers(undefined);
    } else {
      loadUsers(searchTerm.trim());
    }
  };

  // Handle search on input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() === '') {
        loadUsers(undefined);
      } else {
        loadUsers(searchTerm.trim());
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const showAddUserModal = async (initialUsername = '', initialEmail = '', initialPassword = '', errorMessage = '') => {
    const { value: formValues } = await Swal.fire({
      title: 'Add New User',
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
      confirmButtonText: 'Add User',
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

        return {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password: password,
        };
      },
      didOpen: () => {
        const usernameInput = document.getElementById('swal-username') as HTMLInputElement;
        if (usernameInput) {
          usernameInput.focus();
        }
      },
    });

    return formValues;
  };

  const handleAddUser = async () => {
    let formValues = await showAddUserModal();

    if (!formValues) {
      return;
    }

    while (formValues) {
      try {
        await createUser(formValues.username, formValues.email, formValues.password);
        Swal.close();
        await Swal.fire({
          title: 'Success!',
          text: `User "${formValues.username}" has been created successfully.`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 3500,
          timerProgressBar: true,
        });
        await loadUsers();
        break;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
        formValues = await showAddUserModal(
          formValues.username,
          formValues.email,
          '',
          errorMessage
        );
        if (!formValues) {
          break;
        }
      }
    }
  };

  const handleUpdatePaymentStatus = async (user: User, newStatus: boolean) => {
    try {
      await updateUser(user.id, {
        paymentStatus: newStatus,
      });
      await Swal.fire({
        title: 'Success!',
        text: `Payment status updated for "${user.username}".`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true,
      });
      await loadUsers();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to update payment status',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete user "${user.username}" (${user.email})? This action is irreversible.`,
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
      await deleteUser(user.id);
      await Swal.fire({
        title: 'Deleted!',
        text: `User "${user.username}" has been deleted successfully.`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true,
      });
      await loadUsers();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete user',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const filteredUsers = users;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage and monitor all registered users
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none relative">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="w-full px-4 py-2 pr-10 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  loadUsers(undefined);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors rounded"
                title="Clear search"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add User
          </button>
          <button
            onClick={() => loadUsers()}
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

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {loading ? '...' : stats.totalUsers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Active Subscriptions</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {loading ? '...' : stats.activeSubscriptions.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Free Users</p>
          <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
            {loading ? '...' : stats.freeUsers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">New This Month</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {loading ? '...' : stats.newThisMonth.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">
            {searchTerm ? 'No users found' : 'No users yet'}
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'Users will appear here once they register.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider hidden md:table-cell">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shrink-0">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-zinc-900 dark:text-white">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.paymentStatus
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {user.paymentStatus ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.subscriptionStatus === 'active'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {user.subscriptionStatus === 'active' ? 'Active' : 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-3">
                        {/* Toggle Button */}
                        <button
                          onClick={() => handleUpdatePaymentStatus(user, !user.paymentStatus)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            user.paymentStatus
                              ? 'bg-green-600 focus:ring-green-500'
                              : 'bg-zinc-300 dark:bg-zinc-600 focus:ring-zinc-500'
                          }`}
                          role="switch"
                          aria-checked={user.paymentStatus}
                          title={user.paymentStatus ? 'Click to deactivate payment' : 'Click to activate payment'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              user.paymentStatus ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 min-w-[70px]">
                          {user.paymentStatus ? 'Active' : 'Inactive'}
                        </span>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete user"
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

      {filteredUsers.length > 0 && (
        <div className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
          Showing {filteredUsers.length} of {stats.totalUsers} users
        </div>
      )}
    </div>
  );
}
