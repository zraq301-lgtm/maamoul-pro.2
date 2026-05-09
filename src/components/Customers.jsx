import React, { useState } from 'react';
import { Users, UserPlus, Phone, MapPin, Search, ArrowRight } from 'lucide-react';

const Customers = ({ onBack, customers = [], onAddCustomer }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', phone: '', address: '' });

  const styles = {
    container: { padding: '15px', direction: 'rtl', fontFamily: 'Tajawal', backgroundColor: '#f0f9ff', minHeight: '100vh' },
    header: { display: 'flex', alignItems: 'center', gap: '10px', color: '#27ae60', marginBottom: '20px' },
    searchBox: { width: '100%', padding: '12px 40px 12px 12px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '15px', boxSizing: 'border-box' },
    custCard: { background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}><Users size={28} /> <h2>إدارة العملاء</h2></div>

      {!showAdd ? (
        <>
          <div style={{position: 'relative'}}>
            <Search style={{position: 'absolute', right: '12px', top: '12px', color: '#999'}} size={20} />
            <input style={styles.searchBox} placeholder="ابحث عن عميل..." />
          </div>
          
          <button 
            onClick={() => setShowAdd(true)}
            style={{width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#27ae60', color: 'white', fontWeight: 'bold', marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '8px'}}
          >
            <UserPlus size={20} /> إضافة عميل جديد
          </button>

          {customers.map(c => (
            <div key={c.id} style={styles.custCard}>
              <div>
                <div style={{fontWeight: 'bold'}}>{c.name}</div>
                <div style={{fontSize: '0.8rem', color: '#666'}}><Phone size={12} /> {c.phone}</div>
              </div>
              <div style={{color: '#27ae60', fontSize: '0.8rem'}}>{c.address}</div>
            </div>
          ))}
        </>
      ) : (
        <div style={{background: 'white', padding: '20px', borderRadius: '15px'}}>
          <h3>بيانات العميل الجديد</h3>
          <input style={styles.searchBox} placeholder="الاسم الكامل" onChange={e => setNewCust({...newCust, name: e.target.value})} />
          <input style={styles.searchBox} placeholder="رقم الموبايل" onChange={e => setNewCust({...newCust, phone: e.target.value})} />
          <input style={styles.searchBox} placeholder="العنوان / المنطقة" onChange={e => setNewCust({...newCust, address: e.target.value})} />
          <button 
            onClick={() => { onAddCustomer(newCust); setShowAdd(false); }}
            style={{width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#27ae60', color: 'white', fontWeight: 'bold'}}
          >حفظ البيانات</button>
          <button onClick={() => setShowAdd(false)} style={{width: '100%', background: 'none', border: 'none', marginTop: '10px', color: '#888'}}>إلغاء</button>
        </div>
      )}

      <button onClick={onBack} style={{marginTop: '20px', width: '100%', border: 'none', background: 'none', color: '#888'}}><ArrowRight size={18} /> العودة للرئيسية</button>
    </div>
  );
};

export default Customers;
