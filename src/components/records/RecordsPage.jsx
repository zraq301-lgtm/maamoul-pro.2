import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Plus, Package, Search, Filter, Trash2, Edit3, X, Save,
  Eye, ChevronDown, Loader2, Layers, ArrowRight, LayoutGrid, List as ListIcon
} from 'lucide-react';

export default function RecordsPage() {
  const { entities, fetchRecords, createRecord, updateRecord, deleteRecord } = useData();
  const { hasPermission } = useAuth();
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', values: {} });

  const loadRecords = useCallback(async () => {
    if (!selectedEntity) return;
    setLoading(true);
    const data = await fetchRecords(selectedEntity.id);
    setRecords(data || []);
    setLoading(false);
  }, [selectedEntity, fetchRecords]);

  useEffect(() => {
    if (entities.length > 0 && !selectedEntity) {
      setSelectedEntity(entities[0]);
    }
  }, [entities]);

  useEffect(() => {
    loadRecords();
  }, [selectedEntity, loadRecords]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createRecord(selectedEntity.id, formData);
      setShowCreate(false);
      setFormData({ name: '', values: {} });
      loadRecords();
    } catch (err) {
      console.error('Create record error:', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateRecord(editingRecord.id, formData);
      setEditingRecord(null);
      setFormData({ name: '', values: {} });
      loadRecords();
    } catch (err) {
      console.error('Update record error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    try {
      await deleteRecord(id);
      loadRecords();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const startEdit = (record) => {
    const values = {};
    (record.record_values || []).forEach(rv => {
      values[rv.field_id] = rv.value_text || rv.value_number || rv.value_boolean || rv.value_date || rv.value_json || '';
    });
    setFormData({ name: record.name, values });
    setEditingRecord(record);
  };

  const getFieldValue = (record, fieldId) => {
    const rv = (record.record_values || []).find(v => v.field_id === fieldId);
    if (!rv) return '-';
    return rv.value_text || rv.value_number || rv.value_boolean || rv.value_date || rv.value_json || '-';
  };

  const fields = selectedEntity?.dynamic_fields || [];
  const filteredRecords = records.filter(r =>
    !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">السجلات</h1>
          <p className="text-slate-500 mt-1">عرض وإدارة بيانات الكيانات</p>
        </div>
        {selectedEntity && hasPermission('member') && (
          <button onClick={() => { setShowCreate(true); setFormData({ name: '', values: {} }); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> سجل جديد
          </button>
        )}
      </div>

      {/* Entity Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
        {entities.map(entity => (
          <button
            key={entity.id}
            onClick={() => setSelectedEntity(entity)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              selectedEntity?.id === entity.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            {entity.name}
            <span className={`px-1.5 py-0.5 rounded-md text-xs ${
              selectedEntity?.id === entity.id ? 'bg-white/20' : 'bg-slate-100'
            }`}>
              {records.length}
            </span>
          </button>
        ))}
      </div>

      {selectedEntity && (
        <>
          {/* Search & View Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pr-12"
                placeholder="بحث في السجلات..."
              />
            </div>
            <div className="flex bg-white rounded-xl border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-slate-400'}`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-slate-400'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Create Form Modal */}
          {(showCreate || editingRecord) && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    {editingRecord ? 'تعديل السجل' : `إضافة ${selectedEntity.name}`}
                  </h2>
                  <button
                    onClick={() => { setShowCreate(false); setEditingRecord(null); setFormData({ name: '', values: {} }); }}
                    className="p-2 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={editingRecord ? handleUpdate : handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">اسم السجل</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      placeholder="اسم مميز للسجل"
                      required
                    />
                  </div>

                  {fields.map(field => (
                    <div key={field.id}>
                      <label className="block text-sm font-bold text-slate-600 mb-2">
                        {field.name}
                        {field.required && <span className="text-danger-500 mr-1">*</span>}
                      </label>
                      {field.field_type === 'text' && (
                        <input
                          type="text"
                          value={formData.values[field.id] || ''}
                          onChange={(e) => setFormData({ ...formData, values: { ...formData.values, [field.id]: e.target.value } })}
                          className="input-field"
                          required={field.required}
                        />
                      )}
                      {field.field_type === 'number' && (
                        <input
                          type="number"
                          value={formData.values[field.id] || ''}
                          onChange={(e) => setFormData({ ...formData, values: { ...formData.values, [field.id]: e.target.value } })}
                          className="input-field"
                          required={field.required}
                        />
                      )}
                      {field.field_type === 'currency' && (
                        <input
                          type="number"
                          step="0.01"
                          value={formData.values[field.id] || ''}
                          onChange={(e) => setFormData({ ...formData, values: { ...formData.values, [field.id]: e.target.value } })}
                          className="input-field"
                          placeholder="0.00"
                          required={field.required}
                        />
                      )}
                      {field.field_type === 'date' && (
                        <input
                          type="date"
                          value={formData.values[field.id] || ''}
                          onChange={(e) => setFormData({ ...formData, values: { ...formData.values, [field.id]: e.target.value } })}
                          className="input-field"
                          required={field.required}
                        />
                      )}
                      {field.field_type === 'boolean' && (
                        <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.values[field.id] || false}
                            onChange={(e) => setFormData({ ...formData, values: { ...formData.values, [field.id]: e.target.checked } })}
                            className="w-5 h-5 rounded border-slate-300 text-primary-600"
                          />
                          <span className="text-sm text-slate-600">نعم</span>
                        </label>
                      )}
                      {field.field_type === 'select' && (
                        <select
                          value={formData.values[field.id] || ''}
                          onChange={(e) => setFormData({ ...formData, values: { ...formData.values, [field.id]: e.target.value } })}
                          className="input-field"
                          required={field.required}
                        >
                          <option value="">اختر...</option>
                          {(field.options || []).map((opt, i) => (
                            <option key={i} value={typeof opt === 'string' ? opt : opt.value}>{typeof opt === 'string' ? opt : opt.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary flex items-center gap-2 flex-1">
                      <Save className="w-5 h-5" /> {editingRecord ? 'تحديث' : 'حفظ'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCreate(false); setEditingRecord(null); setFormData({ name: '', values: {} }); }}
                      className="btn-ghost"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Records Display */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">لا توجد سجلات</h3>
              <p className="text-slate-400">ابدأ بإضافة سجلات لهذا الكيان</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-right px-4 py-3 text-sm font-bold text-slate-500">الاسم</th>
                      {fields.slice(0, 4).map(field => (
                        <th key={field.id} className="text-right px-4 py-3 text-sm font-bold text-slate-500">{field.name}</th>
                      ))}
                      <th className="text-right px-4 py-3 text-sm font-bold text-slate-500">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map(record => (
                      <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-bold text-slate-700">{record.name}</td>
                        {fields.slice(0, 4).map(field => (
                          <td key={field.id} className="px-4 py-3 text-sm text-slate-600">
                            {getFieldValue(record, field.id)}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {hasPermission('member') && (
                              <button onClick={() => startEdit(record)} className="p-1.5 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600">
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            {hasPermission('manager') && (
                              <button onClick={() => handleDelete(record.id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-slate-400 hover:text-danger-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map(record => (
                <div key={record.id} className="glass-card p-5 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-slate-800">{record.name}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(record)} className="p-1 rounded hover:bg-primary-50 text-slate-400 hover:text-primary-600">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(record.id)} className="p-1 rounded hover:bg-danger-50 text-slate-400 hover:text-danger-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {fields.slice(0, 3).map(field => (
                      <div key={field.id} className="flex justify-between text-sm">
                        <span className="text-slate-400">{field.name}</span>
                        <span className="font-medium text-slate-700">{getFieldValue(record, field.id)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                    {new Date(record.created_at).toLocaleDateString('ar-EG')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {entities.length === 0 && (
        <div className="text-center py-20">
          <Layers className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400 mb-2">لا توجد كيانات</h3>
          <p className="text-slate-400">أنشئ كيانات أولاً لتتمكن من إضافة السجلات</p>
        </div>
      )}
    </div>
  );
}
