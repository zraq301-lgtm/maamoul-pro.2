import React, { useState } from 'react';
import { Truck, UserPlus, Phone, MapPin, Save, ArrowRight } from 'lucide-react';

const Suppliers = ({ onBack, onAddSupplier, suppliers = [] }) => {
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', address: '', material: 'دقيق' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.phone) {
      alert("يرجى إدخال اسم المورد ورقم الهاتف");
      return;
    }
    onAddSupplier({ ...newSupplier, id: Date.now() });
    setNewSupplier({ name: '', phone: '', address: '', material: 'دقيق' });
    alert("تم إضافة المورد بنجاح");
  };

  const styles = {
    container: { padding: '15px', direction: 'rtl', fontFamily: 'Tajawal', backgroundColor: '#f1f5f9', minHeight: '100vh' },
    header: { display: 'flex', alignItems: 'center', gap: '10px', color: '#34495e', marginBottom: '20px' },
    card: { background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', marginBottom: '10px', boxSizing: 'border-box' },
    label: { fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#475569' },
    btn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#34495e', color: 'white', fontWeight: 'bold' },
    listCard: { background: 'white', borderRadius: '10px', padding: '10px', marginBottom: '8px', borderRight: '5px solid #34495e' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}><Truck size={28} /> <h2>إدارة الموردين</h2></div>
      
      <div style={styles.card}>
        <h3 style={{marginTop: 0, fontSize: '1rem'}}><UserPlus size={18} /> إضافة مورد جديد</h3>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>اسم المورد / الشركة</label>
          <input style={styles.input} value={newSupplier.name} onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})} />
          
          <label style={styles.label}><Phone size={14} /> رقم التواصل</label>
          <input style={styles.input} value={newSupplier.phone} onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})} />
          
          <label style={styles.label}>المادة الموردة</label>
          <select style={styles.input} value={newSupplier.material} onChange={(e) => setNewSupplier({...newSupplier, material: e.target.value})}>
            <option value="دقيق">دقيق</option>
            <option value="سمن">سمن</option>
            <option value="عجوة">عجوة</option>
            <option value="تغليف">كراتين وتغليف</option>
          </select>

          <button type="submit" style={styles.btn}><Save size={18} /> حفظ المورد</button>
        </form>
      </div>

      <h3 style={{fontSize: '1rem'}}>قائمة الموردين الحاليين</h3>
      {suppliers.map(s => (
        <div key={s.id} style={styles.listCard}>
          <div style={{fontWeight: 'bold'}}>{s.name}</div>
          <div style={{fontSize: '0.8rem', color: '#64748b'}}>{s.material} | {s.phone}</div>
        </div>
      ))}

      <button onClick={onBack} style={{marginTop: '20px', width: '100%', border: 'none', background: 'none', color: '#888'}}><ArrowRight size={18} /> العودة للوحة التحكم</button>
    </div>
  );
};

export default Suppliers;
