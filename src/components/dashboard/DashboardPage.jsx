import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { supabase } from '../../lib/supabase';
import {
  TrendingUp, Package, ShoppingCart, Users, Factory, Wallet,
  ArrowUpRight, ArrowDownRight, Activity, Clock, Plus, BarChart3,
  Layers, Workflow, AlertCircle, ChevronLeft
} from 'lucide-react';

export default function DashboardPage({ setActivePage }) {
  const { currentOrg, currentRole, user } = useAuth();
  const { entities, workflows, fetchRecords } = useData();
  const [stats, setStats] = useState({ totalRecords: 0, totalEntities: 0, totalWorkflows: 0, recentRecords: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg) return;
    const loadStats = async () => {
      setLoading(true);
      const { count: recordCount } = await supabase
        .from('dynamic_records')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrg.id);

      const { data: recentData } = await supabase
        .from('dynamic_records')
        .select('*, dynamic_entities(name, icon, color)')
        .eq('organization_id', currentOrg.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalRecords: recordCount || 0,
        totalEntities: entities.length,
        totalWorkflows: workflows.length,
        recentRecords: recentData || [],
      });
      setLoading(false);
    };
    loadStats();
  }, [currentOrg, entities, workflows]);

  const statCards = [
    { title: 'إجمالي السجلات', value: stats.totalRecords, icon: Package, color: 'from-primary-500 to-primary-700', bg: 'bg-primary-50', textColor: 'text-primary-700' },
    { title: 'الكيانات النشطة', value: stats.totalEntities, icon: Layers, color: 'from-accent-500 to-accent-700', bg: 'bg-accent-50', textColor: 'text-accent-700' },
    { title: 'سير العمل', value: stats.totalWorkflows, icon: Workflow, color: 'from-success-500 to-success-700', bg: 'bg-success-50', textColor: 'text-success-700' },
    { title: 'أعضاء الفريق', value: 1, icon: Users, color: 'from-slate-500 to-slate-700', bg: 'bg-slate-50', textColor: 'text-slate-700' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          مرحباً، {user?.user_metadata?.full_name || 'مستخدم'}
        </h1>
        <p className="text-slate-500 mt-1">لوحة التحكم - {currentOrg?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="stat-card group cursor-pointer" onClick={() => {
              if (i === 1) setActivePage('entities');
              if (i === 2) setActivePage('workflows');
              if (i === 0) setActivePage('records');
            }}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div className="text-3xl font-bold text-slate-800">{card.value}</div>
              <div className="text-sm text-slate-500 mt-1">{card.title}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600" />
              إجراءات سريعة
            </h3>
            <div className="space-y-3">
              {[
                { label: 'إضافة كيان جديد', page: 'entities', icon: Layers, color: 'text-accent-600 bg-accent-50' },
                { label: 'إضافة سجل', page: 'records', icon: Plus, color: 'text-success-600 bg-success-50' },
                { label: 'إنشاء سير عمل', page: 'workflows', icon: Workflow, color: 'text-primary-600 bg-primary-50' },
                { label: 'عرض التقارير', page: 'reports', icon: BarChart3, color: 'text-slate-600 bg-slate-50' },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => setActivePage(action.page)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-right"
                  >
                    <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-700">{action.label}</span>
                    <ChevronLeft className="w-4 h-4 text-slate-300 mr-auto" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Records */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-600" />
                آخر السجلات
              </h3>
              <button onClick={() => setActivePage('records')} className="text-sm text-primary-600 font-bold hover:underline">
                عرض الكل
              </button>
            </div>
            {stats.recentRecords.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400">لا توجد سجلات بعد. ابدأ بإضافة بيانات!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentRecords.map(record => (
                  <div key={record.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: (record.dynamic_entities?.color || '#3b82f6') + '15' }}
                    >
                      <Package className="w-5 h-5" style={{ color: record.dynamic_entities?.color || '#3b82f6' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700 truncate">{record.name}</div>
                      <div className="text-xs text-slate-400">{record.dynamic_entities?.name}</div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(record.created_at).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Entities Overview */}
      {entities.length > 0 && (
        <div className="mt-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent-600" />
              الكيانات الخاصة بك
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {entities.map(entity => (
                <button
                  key={entity.id}
                  onClick={() => setActivePage('records')}
                  className="p-4 rounded-2xl border-2 border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-center group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: (entity.color || '#3b82f6') + '15' }}
                  >
                    <Package className="w-6 h-6" style={{ color: entity.color || '#3b82f6' }} />
                  </div>
                  <div className="text-sm font-bold text-slate-700 group-hover:text-primary-600 transition-colors">{entity.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{entity.dynamic_fields?.length || 0} حقل</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
