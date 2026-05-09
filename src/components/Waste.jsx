import React, { useState } from 'react';
import { Trash2, ArrowRight, Save, AlertTriangle, Package, Layers } from 'lucide-react';

const Waste = ({ onBack, onSaveWaste, inventory = [] }) => {
  const [wasteEntry, setWasteEntry] = useState({
    type: 'raw_material', // خام أو منتج نهائي
    itemName: '',
    quantity: '',
    unit: 'كيلو',
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!wasteEntry.itemName || !wasteEntry.quantity) {
      alert("يرجى تحديد الصنف والكمية الهالكة");
      return;
    }

    // إرسال البيانات للعقل المدبر App.jsx لخصمها من المخزن وحساب الخسارة
    onSaveWaste({
      ...wasteEntry,
      id: Date.now(),
      timestamp: new Date().toLocaleString()
    });

    alert("تم تسجيل الهالك وتحديث المخزن");
    onBack();
  };

  const styles = {
    container: {
      padding: '15px',
      direction: 'rtl',
      fontFamily: "'Tajawal', sans-serif",
      backgroundColor: '#fff5f5', // لون مائل للأحمر للتنبيه
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
      color: '#e74c3c'
    },
    card: {
      background: 'white',
      borderRadius: '15px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid #feb2b2'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.85rem',
      fontWeight: 'bold',
      color: '#c53030',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #cbd5e0',
      fontSize: '0.95rem',
      marginBottom: '15px',
      boxSizing: 'border-box'
    },
    typeSelector: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px'
    },
    typeBtn: (active) => ({
      flex: 1,
      padding: '10px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: active ? '#e74c3c' : '#edf2f7',
      color: active ? 'white' : '#4a5568',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '0.85rem'
    }),
    submitBtn: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '10px',
      width: '100%',
      fontSize: '1rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Trash2 size={28} />
        <h2 style={{ margin: 0 }}>تسجيل الهالك / التالف</h2>
      </div>

      <div style={styles.card}>
        <div style={styles.typeSelector}>
          <button 
            style={styles.typeBtn(wasteEntry.type === 'raw_material')}
            onClick={() => setWasteEntry({...wasteEntry, type: 'raw_material', unit: 'كيلو'})}
          >
            مواد خام
          </button>
          <button 
            style={styles.typeBtn(wasteEntry.type === 'product')}
            onClick={() => setWasteEntry({...wasteEntry, type: 'product', unit: 'كرتونة'})}
          >
            منتج نهائي
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}><Package size={16} /> اسم الصنف</label>
          <input 
            style={styles.input}
            placeholder="مثال: دقيق، عجوة، أو معمول تمر"
            value={wasteEntry.itemName}
            onChange={(e) => setWasteEntry({...wasteEntry, itemName: e.target.value})}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={styles.label}><Layers size={16} /> الكمية</label>
              <input 
                type="number"
                style={styles.input}
                placeholder="0.00"
                value={wasteEntry.quantity}
                onChange={(e) => setWasteEntry({...wasteEntry, quantity: e.target.value})}
              />
            </div>
            <div>
              <label style={styles.label}>الوحدة</label>
              <input 
                style={{...styles.input, backgroundColor: '#f7fafc'}}
                value={wasteEntry.unit}
                readOnly
              />
            </div>
          </div>

          <label style={styles.label}><AlertTriangle size={16} /> سبب الهالك</label>
          <select 
            style={styles.input}
            value={wasteEntry.reason}
            onChange={(e) => setWasteEntry({...wasteEntry, reason: e.target.value})}
          >
            <option value="">اختر السبب...</option>
            <option value="سوء تخزين">سوء تخزين</option>
            <option value="انتهاء صلاحية">انتهاء صلاحية</option>
            <option value="خطأ تصنيع">خطأ تصنيع (محروق/تالف)</option>
            <option value="أخرى">أخرى</option>
          </select>

          <button type="submit" style={styles.submitBtn}>
            <Save size={20} /> تأكيد وخصم من المخزن
          </button>
        </form>
      </div>

      <button 
        onClick={onBack} 
        style={{
          marginTop: '20px',
          background: 'none',
          border: 'none',
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <ArrowRight size={18} /> العودة للوحة التحكم
      </button>
    </div>
  );
};

export default Waste;
