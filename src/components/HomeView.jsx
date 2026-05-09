import React from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Factory, 
  AlertCircle,
  ChevronLeft
} from 'lucide-react';

const HomeView = ({ categories }) => {
  // حسابات سريعة للمؤشرات
  const totalStock = categories.reduce((acc, cat) => acc + cat.balance, 0);
  const totalOperations = categories.reduce((acc, cat) => acc + cat.operations.length, 0);
  const lowStockAlerts = categories.filter(cat => cat.balance < 10).length;

  const stats = [
    { title: 'إجمالي المخزون', value: totalStock, icon: <Package size={30} />, color: '#3b82f6', bg: '#eff6ff' },
    { title: 'عمليات المشتريات', value: totalOperations, icon: <ShoppingCart size={30} />, color: '#8b5cf6', bg: '#f5f3ff' },
    { title: 'أوامر الإنتاج', value: 'نشط', icon: <Factory size={30} />, color: '#f59e0b', bg: '#fffbeb' },
    { title: 'تنبيهات النقص', value: lowStockAlerts, icon: <AlertCircle size={30} />, color: '#ef4444', bg: '#fef2f2' },
  ];

  return (
    <div className="space-y-6" style={{ direction: 'rtl', fontFamily: "'Tajawal', sans-serif" }}>
      {/* الترحيب والمؤشر العلوي */}
      <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', padding: '30px', borderRadius: '24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>مرحباً بك في نظام المعمول</h1>
          <p style={{ opacity: 0.8 }}>حالة المنشأة مستقرة اليوم، لديك {totalStock} وحدة في المخازن.</p>
        </div>
        <TrendingUp size={120} style={{ position: 'absolute', left: '-20px', bottom: '-20px', opacity: 0.1, color: '#fff' }} />
      </div>

      {/* شبكة الأيقونات والمؤشرات (Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {stats.map((item, index) => (
          <div key={index} style={{ 
            background: '#fff', 
            padding: '20px', 
            borderRadius: '20px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{ backgroundColor: item.bg, color: item.color, padding: '15px', borderRadius: '18px', marginBottom: '12px' }}>
              {item.icon}
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>{item.title}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* مؤشر الأداء الدائري المبسط */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#334155' }}>مؤشر تدفق المواد</h3>
        <div style={{ 
          width: '150px', 
          height: '150px', 
          borderRadius: '50%', 
          border: '12px solid #f1f5f9', 
          borderTop: '12px solid #3b82f6', 
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>85%</span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>كفاءة التشغيل</span>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
