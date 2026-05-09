import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*, organizations(*)')
        .eq('user_id', userId);

      if (error) {
        console.warn('Fetch profile error:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const validOrgs = data.filter(d => d.organizations).map(d => d.organizations);
        setOrganizations(validOrgs);
        const savedOrgId = localStorage.getItem('currentOrgId');
        const org = savedOrgId
          ? data.find(d => d.organization_id === savedOrgId)?.organizations || validOrgs[0]
          : validOrgs[0];
        if (org) {
          setCurrentOrg(org);
          const member = data.find(d => d.organization_id === org.id);
          setCurrentRole(member?.role || 'member');
          setProfile({ ...data[0], organization_id: data[0].organization_id });
          localStorage.setItem('currentOrgId', org.id);
        }
      }
    } catch (err) {
      console.warn('Fetch profile exception:', err.message);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: sess } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(sess);
        setUser(sess?.user ?? null);

        if (sess?.user) {
          await fetchProfile(sess.user.id);
        }
      } catch (err) {
        console.warn('Init auth error:', err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      if (!mounted) return;
      (async () => {
        try {
          setSession(sess);
          setUser(sess?.user ?? null);
          if (sess?.user) {
            await fetchProfile(sess.user.id);
          } else {
            setProfile(null);
            setOrganizations([]);
            setCurrentOrg(null);
            setCurrentRole(null);
          }
        } catch (err) {
          console.warn('Auth state change error:', err.message);
        } finally {
          setLoading(false);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const switchOrganization = useCallback(async (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    if (!org) return;
    setCurrentOrg(org);
    localStorage.setItem('currentOrgId', orgId);
    try {
      const { data } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', orgId)
        .maybeSingle();
      setCurrentRole(data?.role || 'member');
    } catch (err) {
      console.warn('Switch org error:', err.message);
    }
  }, [organizations, user]);

  const signUp = useCallback(async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.warn('Sign out error:', err.message);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setOrganizations([]);
    setCurrentOrg(null);
    setCurrentRole(null);
  }, []);

  const hasPermission = useCallback((requiredRole) => {
    if (!currentRole) return false;
    const requiredLevel = ROLES[requiredRole]?.level || 0;
    const userLevel = ROLES[currentRole]?.level || 0;
    return userLevel >= requiredLevel;
  }, [currentRole]);

  const value = {
    user, session, loading, profile, organizations, currentOrg, currentRole,
    signUp, signIn, signOut, switchOrganization, hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
