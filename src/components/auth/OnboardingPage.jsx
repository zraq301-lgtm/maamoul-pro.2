import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Building2, Factory, ShoppingBag, Truck, Stethoscope, GraduationCap, Briefcase, Layers, ArrowLeft, Check, Loader2 } from 'lucide-react';

const INDUSTRIES = [
  { id: 'manufacturing', label: 'تصنيع وإنتاج', icon: Factory, color: 'from-amber-500 to-orange-600' },
  { id: 'retail', label: 'تجارة ومتاجر', icon: ShoppingBag, color: 'from-emerald-500 to-green-600' },
  { id: 'logistics', label: 'نقل ولوجستيات', icon: Truck, color: 'from-blue-500 to-indigo-600' },
  { id: 'healthcare', label: 'رعاية صحية', icon: Stethoscope, color: 'from-rose-500 to-red-600' },
  { id: 'education', label: 'تعليم وتدريب', icon: GraduationCap, color: 'from-violet-500 to-purple-600' },
  { id: 'services', label: 'خدمات مهنية', icon: Briefcase, color: 'from-cyan-500 to-teal-600' },
];

const TEMPLATES = {
  manufacturing: {
    entities: [
      { name: 'المنتجات', slug: 'products', icon: 'Package', color: '#f59e0b', fields: [
        { name: 'الاسم', slug: 'name', field_type: 'text', required: true },
        { name: 'الكمية', slug: 'quantity', field_type: 'number', required: true },
        { name: 'سعر التكلفة', slug: 'cost_price', field_type: 'currency' },
        { name: 'سعر البيع', slug: 'sell_price', field_type: 'currency' },
        { name: 'الوحدة', slug: 'unit', field_type: 'select', options: ['كيلو', 'كرتونة', 'قطعة', 'لتر'] },
      ]},
      { name: 'المواد الخام', slug: 'raw_materials', icon: 'Layers', color: '#3b82f6', fields: [
        { name: 'الاسم', slug: 'name', field_type: 'text', required: true },
        { name: 'الكمية', slug: 'quantity', field_type: 'number', required: true },
        { name: 'السعر', slug: 'price', field_type: 'currency' },
        { name: 'المورد', slug: 'supplier', field_type: 'text' },
      ]},
      { name: 'العملاء', slug: 'customers', icon: 'Users', color: '#22c55e', fields: [
        { name: 'الاسم', slug: 'name', field_type: 'text', required: true },
        { name: 'الهاتف', slug: 'phone', field_type: 'text' },
        { name: 'العنوان', slug: 'address', field_type: 'text' },
      ]},
    ],
    workflows: [
      { name: 'دورة الإنتاج', type: 'kanban', stages: [
        { name: 'مخطط', slug: 'planned', color: '#6b7280', is_initial: true },
        { name: 'قيد التنفيذ', slug: 'in_progress', color: '#f59e0b' },
        { name: 'مراجعة', slug: 'review', color: '#3b82f6' },
        { name: 'مكتمل', slug: 'completed', color: '#22c55e', is_final: true },
      ]},
    ],
  },
  retail: {
    entities: [
      { name: 'المنتجات', slug: 'products', icon: 'Package', color: '#f59e0b', fields: [
        { name: 'الاسم', slug: 'name', field_type: 'text', required: true },
        { name: 'السعر', slug: 'price', field_type: 'currency', required: true },
        { name: 'المخزون', slug: 'stock', field_type: 'number' },
        { name: 'الفئة', slug: 'category', field_type: 'select', options: ['إلكترونيات', 'ملابس', 'أغذية', 'أخرى'] },
      ]},
      { name: 'الطلبات', slug: 'orders', icon: 'ShoppingCart', color: '#3b82f6', fields: [
        { name: 'العميل', slug: 'customer', field_type: 'text', required: true },
        { name: 'الإجمالي', slug: 'total', field_type: 'currency' },
        { name: 'التاريخ', slug: 'date', field_type: 'date' },
      ]},
    ],
    workflows: [
      { name: 'حالة الطلب', type: 'sequential', stages: [
        { name: 'جديد', slug: 'new', color: '#6b7280', is_initial: true },
        { name: 'قيد التجهيز', slug: 'processing', color: '#f59e0b' },
        { name: 'تم الشحن', slug: 'shipped', color: '#3b82f6' },
        { name: 'تم التسليم', slug: 'delivered', color: '#22c55e', is_final: true },
      ]},
    ],
  },
  services: {
    entities: [
      { name: 'المشاريع', slug: 'projects', icon: 'Briefcase', color: '#3b82f6', fields: [
        { name: 'الاسم', slug: 'name', field_type: 'text', required: true },
        { name: 'العميل', slug: 'client', field_type: 'text' },
        { name: 'الميزانية', slug: 'budget', field_type: 'currency' },
        { name: 'الموعد النهائي', slug: 'deadline', field_type: 'date' },
      ]},
      { name: 'المهام', slug: 'tasks', icon: 'CheckSquare', color: '#22c55e', fields: [
        { name: 'العنوان', slug: 'title', field_type: 'text', required: true },
        { name: 'المشروع', slug: 'project', field_type: 'relation' },
        { name: 'الأولوية', slug: 'priority', field_type: 'select', options: ['عالية', 'متوسطة', 'منخفضة'] },
      ]},
    ],
    workflows: [
      { name: 'حالة المشروع', type: 'kanban', stages: [
        { name: 'قيد الانتظار', slug: 'backlog', color: '#6b7280', is_initial: true },
        { name: 'قيد التنفيذ', slug: 'active', color: '#3b82f6' },
        { name: 'مراجعة', slug: 'review', color: '#f59e0b' },
        { name: 'مكتمل', slug: 'done', color: '#22c55e', is_final: true },
      ]},
    ],
  },
};

export default function OnboardingPage() {
  const { user } = useAuth();
  const { createOrganization, createEntity, createWorkflow } = useData();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const org = await createOrganization({ name: orgName, industry });
      const template = TEMPLATES[industry] || TEMPLATES.services;

      for (const entityDef of template.entities) {
        await createEntity({
          name: entityDef.name,
          slug: entityDef.slug,
          icon: entityDef.icon,
          color: entityDef.color,
          fields: entityDef.fields,
        });
      }

      for (const wfDef of template.workflows) {
        await createWorkflow(wfDef);
      }

      window.location.reload();
    } catch (err) {
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-1 rounded-full ${step > s ? 'bg-primary-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          {/* Step 1: Organization Name */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">اسم المنشأة</h2>
              <p className="text-slate-500 text-center mb-8">أدخل اسم شركتك أو مصنعك أو مشروعك</p>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="input-field text-center text-lg"
                placeholder="مثال: مصنع المعمول الفاخر"
                autoFocus
              />
              <button
                onClick={() => setStep(2)}
                disabled={!orgName.trim()}
                className="btn-primary w-full mt-6"
              >
                التالي
              </button>
            </div>
          )}

          {/* Step 2: Industry */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">نوع النشاط</h2>
              <p className="text-slate-500 text-center mb-8">اختر المجال الأقرب لنشاطك لتخصيص النظام تلقائياً</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {INDUSTRIES.map(ind => {
                  const Icon = ind.icon;
                  return (
                    <button
                      key={ind.id}
                      onClick={() => { setIndustry(ind.id); setStep(3); }}
                      className={`p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${
                        industry === ind.id
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ind.color} flex items-center justify-center mx-auto mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-sm font-bold text-slate-700">{ind.label}</div>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep(1)} className="btn-ghost w-full mt-6 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> السابق
              </button>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="animate-fade-in text-center">
              <div className="w-16 h-16 rounded-2xl bg-success-100 flex items-center justify-center mx-auto mb-6">
                <Layers className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">جاهز للانطلاق!</h2>
              <p className="text-slate-500 mb-6">سيتم إنشاء منشأتك مع القوالب المناسبة لنشاطك</p>

              <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-right">
                <div className="flex justify-between mb-3">
                  <span className="text-slate-500">المنشأة:</span>
                  <span className="font-bold text-slate-800">{orgName}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-slate-500">النشاط:</span>
                  <span className="font-bold text-slate-800">{INDUSTRIES.find(i => i.id === industry)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الكيانات:</span>
                  <span className="font-bold text-slate-800">{(TEMPLATES[industry] || TEMPLATES.services).entities.length} كيانات جاهزة</span>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={loading}
                className="btn-success w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                <span>{loading ? 'جاري الإنشاء...' : 'إنشاء وبدء الاستخدام'}</span>
              </button>
              <button onClick={() => setStep(2)} className="btn-ghost w-full mt-3 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> السابق
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
