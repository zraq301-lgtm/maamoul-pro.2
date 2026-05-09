import React, { useState } from 'react';
import { useAuth, ROLES } from '../contexts/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Factory, Trash2,
  Wallet, Truck, BarChart3, FileText, Users, Settings, ChevronLeft,
  Menu, LogOut, Building2, ChevronDown, Plus, Workflow, Layers,
  Bell, Search, Moon, Sun, X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, color: 'text-primary-600' },
  { id: 'entities', label: 'الكيانات', icon: Layers, color: 'text-accent-600' },
  { id: 'workflows', label: 'سير العمل', icon: Workflow, color: 'text-warning-600' },
  { id: 'records', label: 'السجلات', icon: Package, color: 'text-success-600' },
  { id: 'sales', label: 'المبيعات', icon: Tag, color: 'text-success-600' },
  { id: 'purchases', label: 'المشتريات', icon: ShoppingCart, color: 'text-primary-600' },
  { id: 'production', label: 'الإنتاج', icon: Factory, color: 'text-accent-600' },
  { id: 'inventory', label: 'المخزن', icon: Package, color: 'text-primary-600' },
  { id: 'waste', label: 'الهالك', icon: Trash2, color: 'text-danger-600' },
  { id: 'expenses', label: 'المصروفات', icon: Wallet, color: 'text-slate-600' },
  { id: 'suppliers', label: 'الموردين', icon: Truck, color: 'text-slate-700' },
  { id: 'customers', label: 'العملاء', icon: Users, color: 'text-success-600' },
  { id: 'financials', label: 'قوائم مالية', icon: BarChart3, color: 'text-teal-600' },
  { id: 'reports', label: 'التقارير', icon: FileText, color: 'text-primary-700' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, color: 'text-slate-500' },
];

export default function Layout({ activePage, setActivePage, children }) {
  const { user, currentOrg, currentRole, organizations, switchOrganization, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgDropdown, setOrgDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const roleInfo = ROLES[currentRole] || ROLES.viewer;

  return (
    <div className="flex h-screen bg-slate-50 font-tajawal" dir="rtl">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50 w-72 bg-white/90 backdrop-blur-xl
        border-l border-slate-200/60 flex flex-col transition-transform duration-300
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800"> RaqQ</h1>
                <p className="text-xs text-slate-400">Universal Admin</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Org Switcher */}
        {organizations.length > 0 && (
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <button
                onClick={() => setOrgDropdown(!orgDropdown)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm font-bold text-slate-700 truncate">{currentOrg?.name}</div>
                  <div className={`text-xs ${roleInfo.color}`}>{roleInfo.label}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${orgDropdown ? 'rotate-180' : ''}`} />
              </button>
              {orgDropdown && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-scale-in">
                  {organizations.map(org => (
                    <button
                      key={org.id}
                      onClick={() => { switchOrganization(org.id); setOrgDropdown(false); }}
                      className={`w-full px-4 py-2.5 text-right text-sm hover:bg-slate-50 transition-colors ${org.id === currentOrg?.id ? 'bg-primary-50 text-primary-700 font-bold' : 'text-slate-600'}`}
                    >
                      {org.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
          <div className="space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                  className={isActive ? 'sidebar-link-active w-full' : 'sidebar-link w-full'}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-700 truncate">{user?.user_metadata?.full_name || user?.email}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
            <button onClick={signOut} className="p-2 rounded-lg hover:bg-danger-50 text-slate-400 hover:text-danger-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 w-72">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث..."
                  className="bg-transparent border-none outline-none text-sm text-slate-600 placeholder-slate-400 w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-400" />}
              </button>
              <button className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
