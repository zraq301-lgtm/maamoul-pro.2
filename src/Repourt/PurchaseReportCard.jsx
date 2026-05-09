import React from 'react';
import * as XLSX from 'xlsx';
import { ShoppingBag, Download } from 'lucide-react';

const PurchaseReportCard = ({ inventory = [] }) => {
  const exportPurchasesExcel = () => {
    if (inventory.length === 0) return alert("لا توجد بيانات مشتريات");

    const data = inventory.map(op => ({
      "التاريخ": op.date,
      "اسم الصنف": op.item,
      "الوحدة": op.unit,
      "الكمية": op.quantity,
      "سعر الوحدة": op.price,
      "الإجمالي": op.total,
      "المورد": op.supplier || 'غير محدد',
      "طريقة السداد": op.paymentMethod || 'كاش'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "سجل المشتريات");
    XLSX.writeFile(wb, `Purchases_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: '20px', padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRight: '6px solid #9b59b6'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShoppingBag color="#9b59b6" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>تقرير المشتريات التفصيلي</h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
        يشمل الصنف، الوحدة، السعر الإجمالي، وطريقة السداد (كاش/آجل).
      </p>
      <button onClick={exportPurchasesExcel} style={{
        width: '100%', padding: '12px', marginTop: '15px', borderRadius: '12px',
        border: 'none', color: '#fff', fontWeight: 'bold', backgroundColor: '#9b59b6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
      }}>
        <Download size={18} /> تحميل سجل المشتريات (Excel)
      </button>
    </div>
  );
};

export default PurchaseReportCard;
