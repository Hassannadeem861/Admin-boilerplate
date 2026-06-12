import React from 'react';
import {
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  CarOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

export const getMenuItems = (role) => {
  const commonItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
  ];

  // ========== ADMIN - Full Access ==========
  const adminItems = [
    ...commonItems,
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Users Management',
      children: [
        { key: 'all-users', label: 'All Users' },
      ],
    },
    {
      key: 'recovery-questions',
      icon: <QuestionCircleOutlined />,
      label: 'Recovery Questions',
      children: [
        { key: 'all-recovery-questions', label: 'All Questions' },
        { key: 'add-recovery-question', label: 'Add Question' },
      ],
    },
  ];

  // Return based on role
  if (role === 'admin') {
    return adminItems;
  }

  // Default return for any other role (just dashboard)
  return commonItems;
};

// Flattened menu for mobile (no nested children)
export const getFlatMenuItems = (role) => {
  const commonItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
  ];

  const adminFlat = [
    ...commonItems,
    {
      key: 'all-users',
      icon: <TeamOutlined />,
      label: 'Users Management',
    },
    {
      key: 'all-recovery-questions',
      icon: <QuestionCircleOutlined />,
      label: 'Recovery Questions',
    },
  ];

  if (role === 'admin') {
    return adminFlat;
  }

  return commonItems;
};