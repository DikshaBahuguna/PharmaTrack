/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';

function MainApp() {
  const { currentUser } = useDatabase();

  // First page is LOGIN. After successful login, display Dashboard.
  if (!currentUser) {
    return <AuthPage />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <DatabaseProvider>
      <MainApp />
    </DatabaseProvider>
  );
}
