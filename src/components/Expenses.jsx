import React, { useState } from 'react';
import { Wallet, ArrowRight, Save, Receipt, Calendar, Info } from 'lucide-react';

const Expenses = ({ onBack, onSaveExpense }) => {
  const [expense, setExpense] = useState({
    category: 'إيجار',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['إيجار', 'كهرباء', 'مياه', 'سولار', 'نقل', 'صيانة', 'عمالة يومية', 'أخرى'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expense.amount || !expense.description) {
      alert("يرجى إدخال المبلغ والبيان");
      return;
    }
    onSaveExpense({ ...expense, id: Date.now() });
    alert("تم تسجيل المصروف بنجاح");
    onBack();
  };

  const styles = {
    container: { padding: '15px', direction: 'rtl', fontFamily: 'Tajawal', backgroundColor: '#f9fafb', minHeight: '100vh' },
    card: { background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    header: { display: 'flex', alignItems: 'center', gap: '10px', color: '#7f8c8d', marginBottom: '20px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '15px', fontSize: '1rem', boxSizing: 'border-box' },
    label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px', color: '#555' },
    btn: { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: '#7f8c8d', color: 'white', fontWeight: 'bold', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}><Wallet size={28} /> <h2>تسجيل مصروفات</h2></div>
      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}><Receipt size={18} /> نوع المصروف</label>
          <select style={styles.input} value={expense.category} onChange={(e) => setExpense({...expense, category: e.target.value})}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <label style={styles.label}><Info size={18} /> البيان / التفاصيل</label>
          <input style={styles.input} placeholder="مثال: فاتورة كهرباء شهر مايو" value={expense.description} onChange={(e) => setExpense({...expense, description: e.target.value})} />

          <label style={styles.label}>المبلغ</label>
          <input type="number" style={styles.input} placeholder="0.00" value={expense.amount} onChange={(e) => setExpense({...expense, amount: e.target.value})} />

          <label style={styles.label}><Calendar size={18} /> التاريخ</label>
          <input type="date" style={styles.input} value={expense.date} onChange={(e) => setExpense({...expense, date: e.target.value})} />

          <button type="submit" style={styles.btn}><Save size={20} /> حفظ المصروف</button>
        </form>
      </div>
      <button onClick={onBack} style={{marginTop: '20px', width: '100%', border: 'none', background: 'none', color: '#888'}}><ArrowRight size={18} /> العودة للوحة التحكم</button>
    </div>
  );
};

export default Expenses;
