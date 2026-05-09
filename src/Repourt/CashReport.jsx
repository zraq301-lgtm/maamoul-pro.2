import React from 'react';
import * as XLSX from 'xlsx';
import { BadgeDollarSign, Download, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

export default function CashReport({ salesData = [], inventory = [], expenses = [], onBack }) {
  
  const exportCashFlowExcel = () => {
    // تجميع كل الحركات المالية في جدول واحد
    const cashIn = salesData.map(s => ({ "التاريخ": s.date, "البيان": "مبيعات", "وارد (+)": s.total, "صادر (-)": 0 }));
    const cashOutPurchases = inventory.filter(p => p.paymentMethod === 'كاش').map(p => ({ "التاريخ": p.date, "البيان": `شراء: ${p.item}`, "وارد (+)": 0, "صادر (-)": p.total }));
    const cashOutExpenses = expenses.map(e => ({ "التاريخ": e.date, "البيان": `مصروف: ${e.category}`, "وارد (+)": 0, "صادر (-)": e.amount }));

    const allTransactions = [...cashIn, ...cashOutPurchases, ...cashOutExpenses].sort((a, b) => new Date(a.التاريخ) - new Date(b.التاريخ));

    const ws = XLSX.utils.json_to_sheet(allTransactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "حركة الخزينة");
    XLSX.writeFile(wb, "Cash_Flow_Report_2026.xlsx");
  };

  const totalIn = salesData.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalOut = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) + 
                   inventory.filter(p => p.paymentMethod === 'كاش').reduce((sum, p) => sum + (p.total || 0), 0);

  return (
    <div style={{ padding: '15px', direction: 'rtl', fontFamily: 'Tajawal' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ border: 'none', background: '#eee', padding: '8px', borderRadius: '50%' }}><ArrowRight size={20} /></button>
        <h2 style={{ margin: 0 }}>التقرير النقدي (الخزينة)</h2>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRight: '6px solid #e67e22', textAlign: 'center' }}>
        <BadgeDollarSign size={50} color="#e67e22" style={{ margin: '0 auto 15px' }} />
        <h3>ملخص التدفق النقدي</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
          <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '12px' }}>
            <TrendingUp size={16} color="#27ae60" />
            <div style={{ fontSize: '0.8rem' }}>إجمالي الوارد</div>
            <strong style={{ color: '#27ae60' }}>{totalIn}</strong>
          </div>
          <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '12px' }}>
            <TrendingDown size={16} color="#e74c3c" />
            <div style={{ fontSize: '0.8rem' }}>إجمالي المنصرف</div>
            <strong style={{ color: '#e74c3c' }}>{totalOut}</strong>
          </div>
        </div>

        <button onClick={exportCashFlowExcel} style={{ width: '100%', backgroundColor: '#e67e22', color: '#fff', padding: '14px', borderRadius: '15px', border: 'none', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' }}>
          تحميل تقرير الخزينة الموحد (Excel)
        </button>
      </div>
    </div>
  );
}
