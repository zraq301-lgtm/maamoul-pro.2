import React, { useState } from 'react';
import { useAuth, ROLES, ROLE_LIST } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { supabase } from '../../lib/supabase';
import {
  Settings as SettingsIcon, Building2, Users, Shield, Palette,
  Bell, Link, Save, Plus, Trash2, Loader2, Mail, User, ChevronDown,
  Check, X, Globe, Key, Database, Zap
} from 'lucide-react';

export default function SettingsPage() {
  const { currentOrg, currentRole, user, hasPermission } = useAuth();
  const { createOrganization } = useData();
  const [activeTab, setActiveTab] = useState('general');
  const [orgName, setOrgName] = useState(currentOrg?.name || '');
  const [orgIndustry, setOrgIndustry] = useState(currentOrg?.industry || '');
  const [saving, setSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);

  React.useEffect(() => {
    if (!currentOrg) return;
    const loadMembers = async () => {
      const { data } = await supabase
        .from('organization_members')
        .select('*, user:user_id(email, raw_user_meta_data)')
        .eq('organization_id', currentOrg.id);
      setMembers(data || []);
    };
    const loadInvitations = async () => {
      const { data } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .is('accepted_at', null);
      setInvitations(data || []);
    };
    loadMembers();
    loadInvitations();
  }, [currentOrg]);

  const handleSaveOrg = async () => {
    setSaving(true);
    try {
      await supabase
        .from('organizations')
        .update({ name: orgName, industry: orgIndustry })
        .eq('id', currentOrg.id);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await supabase.from('invitations').insert({
        organization_id: currentOrg.id,
        email: inviteEmail,
        role: inviteRole,
        invited_by: user.id,
      });
      setInviteEmail('');
      const { data } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .is('accepted_at', null);
      setInvitations(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'general', label: 'عام', icon: Building2 },
    { id: 'team', label: 'الفريق', icon: Users },
    { id: 'roles', label: 'الصلاحيات', icon: Shield },
    { id: 'integrations', label: 'التكاملات', icon: Link },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">الإعدادات</h1>
        <p className="text-slate-500 mt-1">إدارة إعدادات المنشأة والفريق والصلاحيات</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="glass-card p-3">
            <div className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 font-bold'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />
                معلومات المنشأة
              </h2>
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">اسم المنشأة</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">النشاط</label>
                  <input
                    type="text"
                    value={orgIndustry}
                    onChange={(e) => setOrgIndustry(e.target.value)}
                    className="input-field"
                    placeholder="مثال: تصنيع غذائي"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">المعرف</label>
                  <input
                    type="text"
                    value={currentOrg?.slug || ''}
                    className="input-field bg-slate-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">خطة الاشتراك</label>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-50 border border-accent-200">
                    <Zap className="w-5 h-5 text-accent-600" />
                    <span className="font-bold text-accent-700">{currentOrg?.plan || 'free'}</span>
                  </div>
                </div>
                <button onClick={handleSaveOrg} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  حفظ التغييرات
                </button>
              </div>
            </div>
          )}

          {/* Team Management */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  أعضاء الفريق
                </h2>
                <div className="space-y-3">
                  {members.map(member => {
                    const roleInfo = ROLES[member.role] || ROLES.viewer;
                    return (
                      <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                          {(member.user?.raw_user_meta_data?.full_name || member.user?.email || '?')[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-700 truncate">
                            {member.user?.raw_user_meta_data?.full_name || member.user?.email}
                          </div>
                          <div className="text-xs text-slate-400">{member.user?.email}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${roleInfo.bg} ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Invite */}
              {hasPermission('admin') && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-accent-600" />
                    دعوة عضو جديد
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="input-field flex-1"
                      placeholder="email@example.com"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="input-field w-32"
                    >
                      {ROLE_LIST.filter(r => r !== 'owner').map(role => (
                        <option key={role} value={role}>{ROLES[role].label}</option>
                      ))}
                    </select>
                    <button onClick={handleInvite} className="btn-accent flex items-center gap-2">
                      <Plus className="w-5 h-5" /> دعوة
                    </button>
                  </div>

                  {invitations.length > 0 && (
                    <div className="mt-6 space-y-2">
                      <h4 className="text-sm font-bold text-slate-500">الدعوات المعلقة</h4>
                      {invitations.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                          <div>
                            <span className="text-sm text-slate-700">{inv.email}</span>
                            <span className={`mr-2 px-2 py-0.5 rounded text-xs ${ROLES[inv.role]?.bg} ${ROLES[inv.role]?.color}`}>
                              {ROLES[inv.role]?.label}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            تنتهي {new Date(inv.expires_at).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Roles & Permissions */}
          {activeTab === 'roles' && (
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                مستويات الصلاحيات
              </h2>
              <div className="space-y-4">
                {ROLE_LIST.map(role => {
                  const info = ROLES[role];
                  return (
                    <div key={role} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${info.bg} ${info.color}`}>
                          {info.label}
                        </span>
                        <span className="text-xs text-slate-400">مستوى {info.level}/5</span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {role === 'owner' && 'صلاحيات كاملة - إدارة المنشأة والفريق والبيانات'}
                        {role === 'admin' && 'إدارة الفريق والكيانات والتكاملات'}
                        {role === 'manager' && 'إنشاء وتعديل الكيانات والسجلات وسير العمل'}
                        {role === 'member' && 'إضافة وتعديل السجلات'}
                        {role === 'viewer' && 'عرض البيانات فقط بدون تعديل'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Link className="w-5 h-5 text-primary-600" />
                التكاملات
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { type: 'whatsapp', label: 'واتساب بوت', desc: 'إرسال التقارير عبر واتساب', color: 'bg-green-50 text-green-700' },
                  { type: 'telegram', label: 'تيليجرام', desc: 'إشعارات فورية عبر تيليجرام', color: 'bg-blue-50 text-blue-700' },
                  { type: 'webhook', label: 'Webhook', desc: 'ربط مع أي نظام خارجي', color: 'bg-slate-50 text-slate-700' },
                  { type: 'email', label: 'بريد إلكتروني', desc: 'إشعارات عبر البريد', color: 'bg-amber-50 text-amber-700' },
                ].map(int => (
                  <div key={int.type} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${int.color}`}>
                        {int.type}
                      </span>
                      <h3 className="font-bold text-slate-700">{int.label}</h3>
                    </div>
                    <p className="text-sm text-slate-400">{int.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-600" />
                إعدادات الإشعارات
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'إشعارات نقص المخزون', desc: 'تنبيه عند انخفاض رصيد أي صنف' },
                  { label: 'إشعارات الطلبات الجديدة', desc: 'تنبيه عند إنشاء طلب جديد' },
                  { label: 'إشعارات سير العمل', desc: 'تنبيه عند تغيير مرحلة أي سجل' },
                  { label: 'التقارير اليومية', desc: 'ملخص يومي للنشاطات' },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-700 text-sm">{notif.label}</div>
                      <div className="text-xs text-slate-400">{notif.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
