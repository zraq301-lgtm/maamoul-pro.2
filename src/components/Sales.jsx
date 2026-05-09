import React, { useState } from 'react';
import { Tag, User, Hash, DollarSign, Save, ArrowRight, ClipboardList } from 'lucide-react';

const Sales = ({ onBack, onSaveSale, customers = [] }) => {
  const [sale, setSale] = useState({
    customerName: '',
    productName: 'معمول تمر', // افتراضي بناءً على المشروع
    quantity: '',
    pricePerUnit: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sale.customerName || !sale.quantity || !sale.pricePerUnit) {
      alert("يرجى إكمال بيانات البيع");
      return;
    }
    
    // إرسال البيانات للعقل المدبر App.jsx للربط مع الحسابات والمخزن
    onSaveSale({
      ...sale,
      total: parseFloat(sale.quantity) * parseFloat(sale.pricePerUnit),
      id: Date.now()
    });

    alert("تم تسجيل عملية البيع بنجاح");
    onBack(); // العودة للوحة التحكم
  };

  const styles = {
    container: {
      padding: '15px',
      direction: 'rtl',
      fontFamily: "'Tajawal', sans-serif",
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '20px',
      color: '#2ecc71'
    },
    card: {
      background: 'white',
      borderRadius: '15px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      marginBottom: '15px'
    },
    inputGroup: {
      marginBottom: '15px'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      color: '#444',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      fontSize: '1rem',
      boxSizing: 'border-box'
    },
    footer: {
      marginTop: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    submitBtn: {
      backgroundColor: '#2ecc71',
      color: 'white',
      border: 'none',
      padding: '15px',
      borderRadius: '12px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    backBtn: {
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      padding: '12px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Tag size={30} />
        <h2 style={{margin: 0}}>تسجيل مبيعات</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.card}>
          {/* اسم العميل */}
          <div style={styles.inputGroup}>
            <label style={styles.label}><User size={18} color="#2ecc71" /> اسم العميل / المحل</label>
            <input 
              style={styles.input}
              placeholder="مثال: سوبر ماركت الأمانة"
              value={sale.customerName}
              onChange={(e) => setSale({...sale, customerName: e.target.value})}
              list="customers-list"
            />
            <datalist id="customers-list">
              {customers.map((c, i) => <option key={i} value={c.name} />)}
            </datalist>
          </div>

          {/* المنتج */}
          <div style={styles.inputGroup}>
            <label style={styles.label}><ClipboardList size={18} color="#2ecc71" /> الصنف</label>
            <select 
              style={styles.input}
              value={sale.productName}
              onChange={(e) => setSale({...sale, productName: e.target.value})}
            >
              <option value="معمول تمر">معمول تمر</option>
              <option value="معمول فستق">معمول فستق</option>
              <option value="معمول سادة">معمول سادة</option>
            </select>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            {/* الكمية */}
            <div style={styles.inputGroup}>
              <label style={styles.label}><Hash size={18} color="#2ecc71" /> الكمية</label>
              <input 
                type="number"
                style={styles.input}
                placeholder="عدد الكراتين"
                value={sale.quantity}
                onChange={(e) => setSale({...sale, quantity: e.target.value})}
              />
            </div>

            {/* سعر الوحدة */}
            <div style={styles.inputGroup}>
              <label style={styles.label}><DollarSign size={18} color="#2ecc71" /> السعر</label>
              <input 
                type="number"
                style={styles.input}
                placeholder="سعر الكرتونة"
                value={sale.pricePerUnit}
                onChange={(e) => setSale({...sale, pricePerUnit: e.target.value})}
              />
            </div>
          </div>

          {/* الإجمالي التلقائي */}
          {sale.quantity && sale.pricePerUnit && (
            <div style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#ecfdf5',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#065f46',
              fontWeight: 'bold'
            }}>
              إجمالي البيع: {parseFloat(sale.quantity) * parseFloat(sale.pricePerUnit)} جنيه
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button type="submit" style={styles.submitBtn}>
            <Save size={20} /> حفظ العملية
          </button>
          <button type="button" onClick={onBack} style={styles.backBtn}>
            <ArrowRight size={18} /> العودة للرئيسية
          </button>
        </div>
      </form>
    </div>
  );
};

export default Sales;
