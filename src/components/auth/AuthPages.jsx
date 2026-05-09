import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Layers, Mail, Lock, User, Building2, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) return <RegisterPage onBack={() => setShowRegister(false)} />;

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">RaqQ</h1>
              <p className="text-white/70">Universal Admin Engine</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-relaxed mb-6">
            منصة إدارة الأعمال
            <br />
            <span className="text-accent-300">المرنة والشاملة</span>
          </h2>
          <p className="text-lg text-white/70 leading-relaxed max-w-md">
            لوحة تحكم فائقة المرونة تتناسب مع أي مشروع - من المصانع إلى الشركات الناشئة، من الإنتاج إلى التسويق.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-md">
            {[
              { label: 'كيانات ديناميكية', desc: 'أنشئ أي نوع بيانات' },
              { label: 'سير عمل مرن', desc: 'خصص مراحل العمل' },
              { label: 'صلاحيات متقدمة', desc: '5 مستويات وصول' },
              { label: 'لوحة تحكم ذكية', desc: 'سحب وإفلات المكونات' },
            ].map((f, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="text-sm font-bold">{f.label}</div>
                <div className="text-xs text-white/60 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">RaqQ</h1>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">تسجيل الدخول</h2>
            <p className="text-slate-500 mb-8">أدخل بياناتك للوصول إلى لوحة التحكم</p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pr-12"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12 pl-12"
                    placeholder="********"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                <span>{loading ? 'جاري الدخول...' : 'تسجيل الدخول'}</span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                ليس لديك حساب؟{' '}
                <button onClick={() => setShowRegister(true)} className="text-primary-600 font-bold hover:underline">
                  إنشاء حساب جديد
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage({ onBack }) {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', orgName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp(form.email, form.password, form.name);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50" dir="rtl">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">تم إنشاء الحساب</h2>
          <p className="text-slate-500 mb-6">يمكنك الآن تسجيل الدخول والبدء في إعداد منشأتك</p>
          <button onClick={onBack} className="btn-primary w-full">تسجيل الدخول</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50" dir="rtl">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">إنشاء حساب</h1>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field pr-12"
                  placeholder="أحمد محمد"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pr-12"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-12"
                  placeholder="6 أحرف على الأقل"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">اسم المنشأة / الشركة</label>
              <div className="relative">
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={form.orgName}
                  onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                  className="input-field pr-12"
                  placeholder="مثال: مصنع المعمول"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span>{loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              لديك حساب بالفعل؟{' '}
              <button onClick={onBack} className="text-primary-600 font-bold hover:underline">
                تسجيل الدخول
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
