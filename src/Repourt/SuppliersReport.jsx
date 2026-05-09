import React from 'react';
import * as XLSX from 'xlsx';
import { Truck, Download, ArrowRight, UserCheck } from 'lucide-react';

export default function SuppliersReport({ suppliersData = [], inventory = [], onBack }) {
  
  const exportSuppliersExcel = () => {
    if (inventory.length === 0) return alert("لا توجد عمليات شراء مسجلة للموردين");

    const data = inventory.map(op => ({
      "التاريخ": op.date,
      "اسم المورد": op.supplier || 'غير محدد',
      "الصنف المورد": op.item,
      "الكمية": op.quantity,
      "إجمالي القيمة": op.total,
      "حالة السداد": op.paymentMethod // كاش أم أجل
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "سجل تعاملات الموردين");
    XLSX.writeFile(wb, "Suppliers_Transactions_2026.xlsx");
  };

  return (
    <div style={{ padding: '15px', direction: 'rtl', fontFamily: 'Tajawal' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ border: 'none', background: '#eee', padding: '8px', borderRadius: '50%' }}><ArrowRight size={20} /></button>
        <h2 style={{ margin: 0 }}>تقرير الموردين</h2>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRight: '6px solid #34495e', textAlign: 'center' }}>
        <Truck size={50} color="#34495e" style={{ margin: '0 auto 15px' }} />
        <h3>كشف حساب الموردين</h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>تحميل كافة فواتير المشتريات مجمعة حسب كل مورد وحالة مديونياته.</p>
        <button onClick={exportSuppliersExcel} style={{ width: '100%', backgroundColor: '#34495e', color: '#fff', padding: '14px', borderRadius: '15px', border: 'none', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' }}>
          <Download size={20} style={{ marginLeft: '8px' }} /> تحميل سجل الموردين (Excel)
        </button>
      </div>
    </div>
  );
}
