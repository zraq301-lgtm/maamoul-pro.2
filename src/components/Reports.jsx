import React, { useState } from 'react';
import { ArrowRight, LayoutGrid } from 'lucide-react';

// تصحيح المسار للسحب من src/Repourt مباشرة باستخدام ../
import CashReport from '../Repourt/CashReport';
import CustomersReport from '../Repourt/CustomersReport';
import ExpenseReports from '../Repourt/ExpenseReports';
import PurchaseReportCard from '../Repourt/PurchaseReportCard';
import SalesReportCard from '../Repourt/SalesReportCard';
import StaffReports from '../Repourt/StaffReports';
import SuppliersReport from '../Repourt/SuppliersReport';

const Reports = ({ inventory = [], salesData = [], expenses = [], staffData = [], onBack }) => {
  // الحالة للتحكم في التقرير المعروض حالياً
  const [activeSubReport, setActiveSubReport] = useState('main');

  // مصفوفة تنظيم الكروت مع تمرير البيانات المخصصة لكل تخصص
  const reportCards = [
    { 
      id: 'cash', 
      title: 'تقرير النقدي', 
      icon: '💰', 
      color: '#e67e22', 
      component: CashReport,
      props: { salesData, inventory, expenses } // يحتاج الثلاثة لحساب الخزينة
    },
    { 
      id: 'purchases', 
      title: 'تقرير المشتريات', 
      icon: '🛒', 
      color: '#9b59b6', 
      component: PurchaseReportCard,
      props: { inventory } 
    },
    { 
      id: 'sales', 
      title: 'تقرير المبيعات', 
      icon: '📈', 
      color: '#2ecc71', 
      component: SalesReportCard,
      props: { salesData } 
    },
    { 
      id: 'expenses', 
      title: 'تقرير المصروفات', 
      icon: '💸', 
      color: '#e74c3c', 
      component: ExpenseReports,
      props: { expensesData: expenses } 
    },
    { 
      id: 'staff', 
      title: 'تقرير العمال', 
      icon: '👷', 
      color: '#27ae60', 
      component: StaffReports,
      props: { staffData } 
    },
    { 
      id: 'customers', 
      title: 'تقرير العملاء', 
      icon: '👥', 
      color: '#3498db', 
      component: CustomersReport,
      props: { salesData } // لفلترة مبيعات كل عميل
    },
    { 
      id: 'suppliers', 
      title: 'تقرير الموردين', 
      icon: '🚛', 
      color: '#34495e', 
      component: SuppliersReport,
      props: { inventory } // لفلترة مشتريات الموردين
    },
  ];

  const goBackToMenu = () => setActiveSubReport('main');

  // عرض التقرير المختار وتمرير بياناته الخاصة
  if (activeSubReport !== 'main') {
    const selected = reportCards.find(r => r.id === activeSubReport);
    const ReportComponent = selected.component;

    return (
      <ReportComponent 
        {...selected.props} // تمرير البيانات المحددة لهذا التخصص فقط
        onBack={goBackToMenu} 
      />
    );
  }

  return (
    <div style={{ padding: '15px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
        <button onClick={onBack} style={{ border: 'none', background: '#eee', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
          <ArrowRight size={20} />
        </button>
        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>مركز التقارير المحاسبية</h2>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', // مناسب جداً لعرض الموبايل
        gap: '12px' 
      }}>
        {reportCards.map((card) => (
          <div 
            key={card.id}
            onClick={() => setActiveSubReport(card.id)}
            style={{
              background: 'white',
              padding: '15px 5px',
              borderRadius: '18px',
              textAlign: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              borderBottom: `4px solid ${card.color}`
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontWeight: 'bold', color: '#34495e', fontSize: '0.85rem' }}>{card.title}</div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '25px', 
        padding: '12px', 
        background: 'rgba(255,255,255,0.5)', 
        borderRadius: '12px', 
        textAlign: 'center',
        border: '1px dashed #ccc'
      }}>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
          يتم سحب البيانات حياً من النظام وتصديرها Excel.
        </p>
      </div>
    </div>
  );
};

export default Reports;
