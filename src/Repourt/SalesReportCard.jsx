import React from 'react';
import * as XLSX from 'xlsx';
import { Tag, Download } from 'lucide-react';

const SalesReportCard = ({ salesData = [] }) => {
  const exportSalesExcel = () => {
    if (salesData.length === 0) return alert("لا توجد بيانات مبيعات");

    const data = salesData.map(sale => ({
      "التاريخ": sale.date,
      "العميل": sale.customerName || 'عميل نقدي',
      "الأصناف": sale.items?.map(i => i.name).join(' - '),
      "الإجمالي": sale.total,
      "الحالة": sale.isOrder ? "طلب (Order)" : "بيع مباشر"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "سجل المبيعات");
    XLSX.writeFile(wb, `Sales_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: '20px', padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRight: '6px solid #2ecc71'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Tag color="#2ecc71" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>تقرير المبيعات والطلبات</h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
        تقرير مزدوج يشمل المبيعات المباشرة وطلبات العملاء قيد التنفيذ.
      </p>
      <button onClick={exportSalesExcel} style={{
        width: '100%', padding: '12px', marginTop: '15px', borderRadius: '12px',
        border: 'none', color: '#fff', fontWeight: 'bold', backgroundColor: '#2ecc71',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
      }}>
        <Download size={18} /> تحميل سجل المبيعات (Excel)
      </button>
    </div>
  );
};

export default SalesReportCard;
