import React from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* Profile Section */}
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>This information will be displayed publicly so be careful what you share.</p>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={user?.email}
                        disabled
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="role"
                        id="role"
                        value={user?.role}
                        disabled
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="pt-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Preferences</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Configure your notification and display preferences.</p>
                </div>
                <div className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="email_notifications"
                          name="email_notifications"
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="email_notifications" className="font-medium text-gray-700">
                          Email notifications
                        </label>
                        <p className="text-gray-500">Receive email notifications about roster updates.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <Button variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 