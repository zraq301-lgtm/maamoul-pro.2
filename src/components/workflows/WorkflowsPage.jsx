import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Plus, Workflow, Trash2, Edit3, X, Save, Loader2,
  ArrowRight, GripVertical, ChevronDown, ChevronUp
} from 'lucide-react';

const STAGE_COLORS = ['#6b7280', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function WorkflowsPage() {
  const { workflows, createWorkflow, fetchWorkflows } = useData();
  const { hasPermission } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'kanban',
    stages: [
      { name: 'جديد', slug: 'new', color: '#6b7280', is_initial: true, is_final: false },
      { name: 'قيد التنفيذ', slug: 'in_progress', color: '#f59e0b', is_initial: false, is_final: false },
      { name: 'مكتمل', slug: 'completed', color: '#22c55e', is_initial: false, is_final: true },
    ],
  });

  const resetForm = () => {
    setForm({
      name: '', type: 'kanban',
      stages: [
        { name: 'جديد', slug: 'new', color: '#6b7280', is_initial: true, is_final: false },
        { name: 'قيد التنفيذ', slug: 'in_progress', color: '#f59e0b', is_initial: false, is_final: false },
        { name: 'مكتمل', slug: 'completed', color: '#22c55e', is_initial: false, is_final: true },
      ],
    });
    setShowCreate(false);
  };

  const addStage = () => {
    setForm({
      ...form,
      stages: [...form.stages, { name: '', slug: '', color: '#3b82f6', is_initial: false, is_final: false }],
    });
  };

  const updateStage = (index, key, value) => {
    const updated = [...form.stages];
    updated[index] = { ...updated[index], [key]: value };
    if (key === 'name') {
      updated[index].slug = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }
    if (key === 'is_initial' && value) {
      updated.forEach((s, i) => { if (i !== index) s.is_initial = false; });
    }
    if (key === 'is_final' && value) {
      updated.forEach((s, i) => { if (i !== index) s.is_final = false; });
    }
    setForm({ ...form, stages: updated });
  };

  const removeStage = (index) => {
    setForm({ ...form, stages: form.stages.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createWorkflow(form);
      resetForm();
    } catch (err) {
      console.error('Workflow create error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف سير العمل هذا؟')) return;
    await supabase.from('workflows').delete().eq('id', id);
    fetchWorkflows();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">سير العمل</h1>
          <p className="text-slate-500 mt-1">إدارة وتخصيص مراحل العمل والعمليات</p>
        </div>
        {hasPermission('manager') && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> سير عمل جديد
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="glass-card p-6 mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">إنشاء سير عمل</h2>
            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">اسم سير العمل</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="مثال: دورة الإنتاج"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">النوع</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="input-field"
                >
                  <option value="kanban">كانبان</option>
                  <option value="sequential">متسلسل</option>
                  <option value="parallel">متوازي</option>
                  <option value="custom">مخصص</option>
                </select>
              </div>
            </div>

            {/* Stages */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-slate-600">المراحل</label>
                <button type="button" onClick={addStage} className="text-sm text-primary-600 font-bold hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> إضافة مرحلة
                </button>
              </div>
              <div className="space-y-3">
                {form.stages.map((stage, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <GripVertical className="w-5 h-5 text-slate-300" />
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) => updateStage(i, 'name', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        placeholder="اسم المرحلة"
                        required
                      />
                      <select
                        value={stage.color}
                        onChange={(e) => updateStage(i, 'color', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                      >
                        {STAGE_COLORS.map(c => (
                          <option key={c} value={c}>
                            {c === '#6b7280' ? 'رمادي' : c === '#ef4444' ? 'أحمر' : c === '#f59e0b' ? 'أصفر' : c === '#22c55e' ? 'أخضر' : c === '#3b82f6' ? 'أزرق' : c === '#8b5cf6' ? 'بنفسجي' : c === '#ec4899' ? 'وردي' : 'سماوي'}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={stage.is_initial}
                          onChange={(e) => updateStage(i, 'is_initial', e.target.checked)}
                          className="rounded"
                        />
                        بداية
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={stage.is_final}
                          onChange={(e) => updateStage(i, 'is_final', e.target.checked)}
                          className="rounded"
                        />
                        نهاية
                      </label>
                    </div>
                    {form.stages.length > 1 && (
                      <button type="button" onClick={() => removeStage(i)} className="p-1 rounded hover:bg-danger-50 text-slate-400 hover:text-danger-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-5 h-5" /> إنشاء سير العمل
              </button>
              <button type="button" onClick={resetForm} className="btn-ghost">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* Workflows List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {workflows.map(wf => (
          <div key={wf.id} className="glass-card p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{wf.name}</h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{wf.type}</span>
              </div>
              {hasPermission('admin') && (
                <button onClick={() => handleDelete(wf.id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-slate-400 hover:text-danger-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Stages Flow */}
            <div className="flex items-center gap-2 flex-wrap">
              {(wf.workflow_stages || [])
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((stage, i) => (
                  <React.Fragment key={stage.id}>
                    <div
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                      style={{ backgroundColor: stage.color }}
                    >
                      {stage.name}
                      {stage.is_initial && <span className="mr-1 text-xs opacity-70">(بداية)</span>}
                      {stage.is_final && <span className="mr-1 text-xs opacity-70">(نهاية)</span>}
                    </div>
                    {i < (wf.workflow_stages || []).length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    )}
                  </React.Fragment>
                ))}
            </div>
          </div>
        ))}
      </div>

      {workflows.length === 0 && !showCreate && (
        <div className="text-center py-20">
          <Workflow className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400 mb-2">لا توجد سير عمل</h3>
          <p className="text-slate-400 mb-6">أنشئ سير عمل لتنظيم مراحل عملياتك</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" /> إنشاء سير عمل
          </button>
        </div>
      )}
    </div>
  );
}
