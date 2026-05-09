import React from 'react';
import * as XLSX from 'xlsx';
import { Wallet, Download, Calendar, ArrowRight, PieChart, FileSpreadsheet } from 'lucide-react';

// نمرر مصفوفة المصروفات (expensesData) من المكون الرئيسي App.jsx
export default function ExpenseReports({ expensesData = [], onBack }) {
  
  // وظيفة تصدير تقرير المصروفات إلى إكسل
  const exportExpensesExcel = () => {
    if (!expensesData || expensesData.length === 0) {
      alert("لا توجد بيانات مصروفات لتصديرها حالياً");
      return;
    }

    // تجهيز البيانات لتناسب جدول الإكسل المحاسبي
    const data = expensesData.map(exp => ({
      "التاريخ": exp.date,
      "بند المصروف": exp.category || 'غير مصنف', // مثل: كهرباء، إيجار، صيانة
      "البيان / التفاصيل": exp.description || '',
      "المبلغ": parseFloat(exp.amount || 0),
      "طريقة الدفع": exp.paymentMethod || 'نقداً',
      "المسؤول": exp.addedBy || 'المدير'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "سجل المصروفات التفصيلي");
    
    // حفظ الملف باسم الشهر الحالي
    const fileName = `Expenses_Report_${new Date().getMonth() + 1}_2026.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // حساب إجمالي المصروفات الحالية للعرض السريع
  const totalExpenses = expensesData.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  const styles = {
    wrapper: { padding: '15px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' },
    header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
    card: {
      backgroundColor: '#ffffff',
      padding: '25px',
      borderRadius: '22px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      borderRight: '6px solid #7f8c8d', // لون المصروفات الرمادي من لوحة التحكم
      textAlign: 'center'
    },
    totalBox: {
      background: '#f8fafc',
      padding: '15px',
      borderRadius: '15px',
      marginTop: '15px',
      border: '1px dashed #cbd5e1'
    },
    btn: {
      width: '100%',
      backgroundColor: '#34495e', // لون غامق احترافي للمصروفات
      color: '#fff',
      padding: '14px',
      borderRadius: '15px',
      border: 'none',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      cursor: 'pointer',
      marginTop: '20px',
      transition: '0.3s'
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* رأس الصفحة */}
      <div style={styles.header}>
        <button onClick={onBack} style={{border: 'none', background: '#eee', padding: '8px', borderRadius: '50%', cursor: 'pointer'}}>
          <ArrowRight size={20} />
        </button>
        <h2 style={{margin: 0}}>تقرير المصروفات</h2>
      </div>

      {/* بطاقة التقرير الرئيسية */}
      <div style={styles.card}>
        <div style={{color: '#7f8c8d', marginBottom: '15px'}}>
          <Wallet size={50} style={{margin: '0 auto'}} />
        </div>
        <h3 style={{margin: '0 0 10px 0'}}>كشف المصروفات والمنصرفات</h3>
        <p style={{fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6'}}>
          استخراج سجل كامل للمصروفات النثرية، الفواتير، والالتزامات المالية
          <br />
          (مرتب حسب التاريخ والقيمة والبيان)
        </p>

        <div style={styles.totalBox}>
          <span style={{fontSize: '0.9rem', color: '#64748b'}}>إجمالي المصروفات المسجلة:</span>
          <div style={{fontSize: '1.5rem', fontWeight: '800', color: '#e74c3c'}}>
            {totalExpenses.toLocaleString()} <small style={{fontSize: '0.8rem'}}>ج.م</small>
          </div>
        </div>

        <button 
          onClick={exportExpensesExcel} 
          style={styles.btn}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2c3e50'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#34495e'}
        >
          <FileSpreadsheet size={20} />
          تحميل كشف المصروفات (Excel)
        </button>
      </div>

      {/* عرض آخر 5 عمليات مصروفات تحت البطاقة */}
      <div style={{marginTop: '25px'}}>
        <h4 style={{marginBottom: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <PieChart size={18} /> آخر العمليات المسجلة:
        </h4>
        {expensesData.length === 0 ? (
          <p style={{color: '#94a3b8', textAlign: 'center', marginTop: '20px'}}>لا توجد مصروفات مسجلة حتى الآن</p>
        ) : (
          expensesData.slice(-5).reverse().map((exp, index) => (
            <div key={index} style={{
              background: '#fff', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              marginBottom: '10px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{fontWeight: 'bold', fontSize: '0.95rem'}}>{exp.category}</div>
                <div style={{fontSize: '0.75rem', color: '#94a3b8'}}>{exp.date}</div>
              </div>
              <div style={{fontWeight: 'bold', color: '#e74c3c'}}>
                -{parseFloat(exp.amount).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
