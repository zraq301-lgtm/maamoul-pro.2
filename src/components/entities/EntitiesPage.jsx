import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import {
  Plus, Package, Settings, Trash2, Edit3, X, Layers,
  Type, Hash, DollarSign, Calendar, ToggleLeft, List,
  Link, FileText, Save, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';

const FIELD_TYPES = [
  { value: 'text', label: 'نص', icon: Type },
  { value: 'number', label: 'رقم', icon: Hash },
  { value: 'currency', label: 'عملة', icon: DollarSign },
  { value: 'date', label: 'تاريخ', icon: Calendar },
  { value: 'boolean', label: 'نعم/لا', icon: ToggleLeft },
  { value: 'select', label: 'قائمة', icon: List },
  { value: 'relation', label: 'علاقة', icon: Link },
  { value: 'json', label: 'JSON', icon: FileText },
];

const ENTITY_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'];

export default function EntitiesPage() {
  const { entities, createEntity, deleteEntity, updateEntity } = useData();
  const { hasPermission } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '', slug: '', icon: 'Package', color: '#3b82f6', description: '',
    fields: [{ name: 'الاسم', slug: 'name', field_type: 'text', required: true }],
  });

  const resetForm = () => {
    setForm({
      name: '', slug: '', icon: 'Package', color: '#3b82f6', description: '',
      fields: [{ name: 'الاسم', slug: 'name', field_type: 'text', required: true }],
    });
    setShowCreate(false);
    setEditingId(null);
  };

  const handleNameChange = (name) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0621-\u064F-]/g, '');
    setForm({ ...form, name, slug });
  };

  const addField = () => {
    setForm({
      ...form,
      fields: [...form.fields, { name: '', slug: '', field_type: 'text', required: false }],
    });
  };

  const updateField = (index, key, value) => {
    const updated = [...form.fields];
    updated[index] = { ...updated[index], [key]: value };
    if (key === 'name') {
      updated[index].slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0621-\u064F-]/g, '');
    }
    setForm({ ...form, fields: updated });
  };

  const removeField = (index) => {
    setForm({ ...form, fields: form.fields.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateEntity(editingId, {
          name: form.name, slug: form.slug, icon: form.icon,
          color: form.color, description: form.description,
        });
      } else {
        await createEntity(form);
      }
      resetForm();
    } catch (err) {
      console.error('Entity save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكيان؟ سيتم حذف جميع السجلات المرتبطة به.')) return;
    try {
      await deleteEntity(id);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">إدارة الكيانات</h1>
          <p className="text-slate-500 mt-1">تعريف أنواع البيانات والحقول الخاصة بمنشأتك</p>
        </div>
        {hasPermission('manager') && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> كيان جديد
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreate && (
        <div className="glass-card p-6 mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              {editingId ? 'تعديل الكيان' : 'إنشاء كيان جديد'}
            </h2>
            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">اسم الكيان</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input-field"
                  placeholder="مثال: المنتجات، الطلبات، المهام"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">المعرف (Slug)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="input-field"
                  placeholder="products"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">اللون</label>
              <div className="flex gap-2 flex-wrap">
                {ENTITY_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-10 h-10 rounded-xl transition-all ${form.color === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">الوصف</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
                placeholder="وصف مختصر للكيان"
              />
            </div>

            {/* Fields Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-slate-600">الحقول</label>
                <button type="button" onClick={addField} className="text-sm text-primary-600 font-bold hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> إضافة حقل
                </button>
              </div>
              <div className="space-y-3">
                {form.fields.map((field, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(i, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      placeholder="اسم الحقل"
                      required
                    />
                    <select
                      value={field.field_type}
                      onChange={(e) => updateField(i, 'field_type', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                    >
                      {FIELD_TYPES.map(ft => (
                        <option key={ft.value} value={ft.value}>{ft.label}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-xs text-slate-500">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(i, 'required', e.target.checked)}
                        className="rounded"
                      />
                      مطلوب
                    </label>
                    {form.fields.length > 1 && (
                      <button type="button" onClick={() => removeField(i)} className="p-1 rounded hover:bg-danger-50 text-slate-400 hover:text-danger-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-5 h-5" /> {editingId ? 'تحديث' : 'إنشاء الكيان'}
              </button>
              <button type="button" onClick={resetForm} className="btn-ghost">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* Entities List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {entities.map(entity => (
          <div key={entity.id} className="glass-card p-6 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: (entity.color || '#3b82f6') + '15' }}
                >
                  <Package className="w-6 h-6" style={{ color: entity.color || '#3b82f6' }} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{entity.name}</h3>
                  <p className="text-xs text-slate-400">{entity.slug}</p>
                </div>
              </div>
              {hasPermission('admin') && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setForm({
                        name: entity.name, slug: entity.slug, icon: entity.icon,
                        color: entity.color, description: entity.description || '',
                        fields: entity.dynamic_fields || [],
                      });
                      setEditingId(entity.id);
                      setShowCreate(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entity.id)}
                    className="p-1.5 rounded-lg hover:bg-danger-50 text-slate-400 hover:text-danger-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {entity.description && (
              <p className="text-sm text-slate-500 mb-3">{entity.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {(entity.dynamic_fields || []).map(field => (
                <span
                  key={field.id}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600"
                >
                  {field.name}
                  <span className="text-slate-400 mr-1">({FIELD_TYPES.find(t => t.value === field.field_type)?.label || field.field_type})</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {entities.length === 0 && !showCreate && (
        <div className="text-center py-20">
          <Layers className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400 mb-2">لا توجد كيانات بعد</h3>
          <p className="text-slate-400 mb-6">ابدأ بإنشاء كيانات لتنظيم بيانات منشأتك</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" /> إنشاء أول كيان
          </button>
        </div>
      )}
    </div>
  );
}
