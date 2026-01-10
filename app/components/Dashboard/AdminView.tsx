'use client';

import { useState, useEffect } from 'react';
import { getUser } from '../../../lib/api/auth';
import { createAdmin, fetchAdmins, deleteAdmin, Admin, fetchAdminStats, fetchRecentActivity, Activity } from '../../../lib/api/api';
import Swal from 'sweetalert2';

export default function AdminView() {
  const [user, setUser] = useState(getUser());
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    changes: {
      users: '0%',
      subscriptions: '0%',
      revenue: '0%',
      monthlyRevenue: '0%',
    },
  });

  useEffect(() => {
    loadStats();
    loadActivities();
    loadAdmins();
  }, []);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetchAdminStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await fetchRecentActivity();
      setActivities(response.activities);
    } catch (err) {
      console.error('Failed to load activities:', err);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetchAdmins();
      setAdmins(response.admins);
    } catch (err) {
      console.error('Failed to load admins:', err);
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to load admins',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  const showAddAdminModal = async (initialUsername = '', initialEmail = '', initialPassword = '', errorMessage = '') => {
    const { value: formValues } = await Swal.fire({
      title: 'Add New Admin',
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
      confirmButtonText: 'Add Admin',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      preConfirm: () => {
        const username = (document.getElementById('swal-username') as HTMLInputElement)?.value;
        const email = (document.getElementById('swal-email') as HTMLInputElement)?.value;
        const password = (document.getElementById('swal-password') as HTMLInputElement)?.value;
        const errorDiv = document.getElementById('swal-error') as HTMLDivElement;

        // Clear previous error
        if (errorDiv) {
          errorDiv.style.display = 'none';
          errorDiv.textContent = '';
        }

        // Validation
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

  const handleAddAdmin = async () => {
    let formValues = await showAddAdminModal();

    if (!formValues) {
      return; // User cancelled
    }

    while (formValues) {
      try {
        await createAdmin(formValues.username, formValues.email, formValues.password);
        
        // Close the modal first
        Swal.close();
        
        // Show success message
        await Swal.fire({
          title: 'Success!',
          text: `Admin "${formValues.username}" has been created successfully.`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 3500,
          timerProgressBar: true,
        });

        // Reload admins list
        await loadAdmins();
        break; // Exit loop on success
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create admin';
        
        // Show modal again with error (don't close it)
        formValues = await showAddAdminModal(
          formValues.username,
          formValues.email,
          '',
          errorMessage
        );
        
        if (!formValues) {
          break; // User cancelled
        }
      }
    }
  };

  const handleDeleteAdmin = async (admin: Admin) => {
    // Don't allow deleting yourself
    if (admin.id === user?.id) {
      Swal.fire({
        title: 'Cannot Delete',
        text: 'You cannot delete your own admin account.',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete admin "${admin.username}" (${admin.email})? This action is irreversible.`,
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
      await deleteAdmin(admin.id);
      await Swal.fire({
        title: 'Deleted!',
        text: `Admin "${admin.username}" has been deleted successfully.`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true,
      });
      // Reload admins list
      await loadAdmins();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete admin',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
  };

  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case 'add':
        return (
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'check':
        return (
          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: statsLoading ? '...' : stats.totalUsers.toLocaleString(),
      icon: '👥',
      color: 'bg-blue-500',
      change: stats.changes.users,
    },
    {
      title: 'Active Subscriptions',
      value: statsLoading ? '...' : stats.activeSubscriptions.toLocaleString(),
      icon: '✅',
      color: 'bg-green-500',
      change: stats.changes.subscriptions,
    },
    {
      title: 'Total Revenue',
      value: statsLoading ? '...' : `£${stats.totalRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'bg-purple-500',
      change: stats.changes.revenue,
    },
    {
      title: 'Monthly Revenue',
      value: statsLoading ? '...' : `£${stats.monthlyRevenue.toLocaleString()}`,
      icon: '📈',
      color: 'bg-orange-500',
      change: stats.changes.monthlyRevenue,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold mb-2">Welcome, {user?.username || 'Admin'}!</h3>
            <p className="text-blue-100">
              Here's an overview of your platform's performance and key metrics.
            </p>
          </div>
          <button
            onClick={handleAddAdmin}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
          >
            <svg
              className="w-5 h-5"
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
            Add New Admin
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg text-2xl`}>{stat.icon}</div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {stat.change}
              </span>
            </div>
            <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              {stat.title}
            </h4>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Activity
          </h3>
          <button
            onClick={loadActivities}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs font-medium"
          >
            Refresh
          </button>
        </div>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  activity.icon === 'add' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  activity.icon === 'check' ? 'bg-green-100 dark:bg-green-900/30' :
                  'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  {getActivityIcon(activity.icon)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admins Management Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Admin Users
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Manage all admin accounts in the system
            </p>
          </div>
          <button
            onClick={loadAdmins}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
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

        {loading && admins.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12">
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
              No admins found
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Get started by creating your first admin account.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider hidden md:table-cell">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                      admin.id === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shrink-0">
                          {admin.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-zinc-900 dark:text-white">
                            {admin.username}
                            {admin.id === user?.id && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            Admin
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {admin.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                      {formatDate(admin?.createdAt || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {admin.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete admin"
                        >
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
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {admins.length > 0 && (
          <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 text-center">
            Showing {admins.length} admin{admins.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
