import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const ROLES = {
  owner: { label: 'المالك', level: 5, color: 'text-amber-600', bg: 'bg-amber-50' },
  admin: { label: 'مدير', level: 4, color: 'text-primary-600', bg: 'bg-primary-50' },
  manager: { label: 'مدير تنفيذي', level: 3, color: 'text-accent-600', bg: 'bg-accent-50' },
  member: { label: 'عضو', level: 2, color: 'text-success-600', bg: 'bg-success-50' },
  viewer: { label: 'مشاهد', level: 1, color: 'text-slate-600', bg: 'bg-slate-50' },
};

export const ROLE_LIST = ['owner', 'admin', 'manager', 'member', 'viewer'];

const DEMO_ORG = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'منشأتي',
  slug: 'my-org',
  industry: '',
  plan: 'free',
};

const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'admin@raqq.app',
  user_metadata: { full_name: 'المدير' },
};

export function AuthProvider({ children }) {
  const [currentOrg, setCurrentOrg] = useState(DEMO_ORG);
  const [currentRole] = useState('owner');
  const [organizations] = useState([DEMO_ORG]);

  const switchOrganization = useCallback(async () => {}, []);

  const hasPermission = useCallback((requiredRole) => {
    const requiredLevel = ROLES[requiredRole]?.level || 0;
    const userLevel = ROLES[currentRole]?.level || 0;
    return userLevel >= requiredLevel;
  }, [currentRole]);

  const value = {
    user: DEMO_USER,
    session: null,
    loading: false,
    profile: null,
    organizations,
    currentOrg,
    currentRole,
    switchOrganization,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
