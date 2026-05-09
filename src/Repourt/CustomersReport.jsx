import React from 'react';
import * as XLSX from 'xlsx';
import { Users, Download, ArrowRight, Star } from 'lucide-react';

export default function CustomersReport({ salesData = [], onBack }) {
  
  const exportCustomersExcel = () => {
    if (salesData.length === 0) return alert("لا توجد عمليات مبيعات مسجلة");

    const data = salesData.map(sale => ({
      "تاريخ العملية": sale.date,
      "اسم العميل": sale.customerName || 'عميل نقدي',
      "إجمالي المشتريات": sale.total,
      "نوع العملية": sale.isOrder ? 'طلب مسبق' : 'بيع مباشر',
      "ملاحظات": sale.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تقرير حركة العملاء");
    XLSX.writeFile(wb, "Customers_Report_2026.xlsx");
  };

  return (
    <div style={{ padding: '15px', direction: 'rtl', fontFamily: 'Tajawal' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ border: 'none', background: '#eee', padding: '8px', borderRadius: '50%' }}><ArrowRight size={20} /></button>
        <h2 style={{ margin: 0 }}>تقرير العملاء</h2>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRight: '6px solid #27ae60', textAlign: 'center' }}>
        <Star size={50} color="#27ae60" style={{ margin: '0 auto 15px' }} />
        <h3>كشف مسحوبات العملاء</h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>تقرير مفصل يوضح أكثر العملاء شراءً وحجم التعاملات معهم.</p>
        <button onClick={exportCustomersExcel} style={{ width: '100%', backgroundColor: '#27ae60', color: '#fff', padding: '14px', borderRadius: '15px', border: 'none', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' }}>
          <Download size={20} style={{ marginLeft: '8px' }} /> تحميل سجل العملاء (Excel)
        </button>
      </div>
    </div>
  );
}
