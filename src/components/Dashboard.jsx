import React from 'react';
// استدعاء التنسيقات لضمان مظهر متناسق
import '../App.css'; 
import { 
  ShoppingCart, Tag, Factory, Warehouse, Trash2, 
  Wallet, Truck, RotateCcw, BarChart3, FileText, Users 
} from 'lucide-react';

const Dashboard = ({ setActivePage }) => {
  // تعريف الأقسام بناءً على أسماء الملفات في الصورة لضمان الربط الصحيح
  const sections = [
    { id: 'purchases', title: 'المشتريات', icon: <ShoppingCart size={35} />, color: '#9b59b6' },
    { id: 'sales', title: 'المبيعات', icon: <Tag size={35} />, color: '#2ecc71' },
    { id: 'production', title: 'الإنتاج', icon: <Factory size={35} />, color: '#e67e22' },
    { id: 'inventory', title: 'المخزن', icon: <Warehouse size={35} />, color: '#3498db' },
    { id: 'waste', title: 'الهالك', icon: <Trash2 size={35} />, color: '#e74c3c' },
    { id: 'expenses', title: 'المصروفات', icon: <Wallet size={35} />, color: '#7f8c8d' },
    { id: 'suppliers', title: 'الموردين', icon: <Truck size={35} />, color: '#34495e' },
    { id: 'financials', title: 'قوائم مالية', icon: <BarChart3 size={35} />, color: '#16a085' },
    { id: 'reports', title: 'التقارير', icon: <FileText size={35} />, color: '#2980b9' },
    { id: 'customers', title: 'العملاء', icon: <Users size={35} />, color: '#27ae60' },
  ];

  return (
    <div className="page-content" style={{ padding: '15px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
      {/* رأس الصفحة */}
      <header style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#2c3e50', fontWeight: '800' }}>
          معمول <span style={{ color: '#e67e22' }}>راق</span>
        </h1>
        <p style={{ color: '#7f8c8d', marginTop: '-10px' }}>لوحة التحكم الشاملة</p>
      </header>

      {/* شبكة الأقسام - Grid */}
      <div className="grid-container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', // كرتين في الصف الواحد للموبايل
        gap: '15px'
      }}>
        {sections.map((sec) => (
          <div 
            key={sec.id} 
            className="card" 
            onClick={() => {
                console.log("فتح قسم:", sec.id); 
                setActivePage(sec.id); // هذه الدالة يجب أن تكون معرفة في App.jsx لتبديل الصفحات
            }}
            style={{ 
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '25px 10px', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
              borderTop: `6px solid ${sec.color}`,
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            // تأثير بصري بسيط عند الضغط
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ color: sec.color, marginBottom: '12px' }}>
              {sec.icon}
            </div>
            <span style={{ 
              fontSize: '1.1rem', 
              fontWeight: 'bold', 
              color: '#34495e' 
            }}>
              {sec.title}
            </span>
          </div>
        ))}
      </div>

      {/* تذييل بسيط لإعطاء مساحة في الأسفل */}
      <div style={{ height: '50px' }}></div>
    </div>
  );
};

export default Dashboard;
