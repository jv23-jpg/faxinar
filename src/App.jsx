import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../Home';
import AdminDashboard from '../AdminDashboard';
import AdminUsers from '../AdminUsers';
import AdminCreateUser from '../AdminCreateUser';
import AdminBulkInvite from '../AdminBulkInvite';
import CleanerOnboarding from '../CleanerOnboarding';
import CleanerProfile from '../CleanerProfile';
import Tasks from './Tasks';
import Layout from '../Layout';
import LeidySignup from '../LeidySignup';

export default function App() {
  return (
    <Layout currentPageName="">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/create-user" element={<AdminCreateUser />} />
        <Route path="/admin/bulk-invite" element={<AdminBulkInvite />} />
        <Route path="/onboarding" element={<CleanerOnboarding />} />
        <Route path="/profile" element={<CleanerProfile />} />
        <Route path="/leidy-signup" element={<LeidySignup />} />
        <Route path="/tasks" element={<Tasks />} />
      </Routes>
    </Layout>
  );
}
