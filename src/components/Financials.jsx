import React from 'react';
import { BarChart3, ArrowRight, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

const Financials = ({ onBack, stats = { income: 0, expenses: 0, wasteValue: 0 } }) => {
  const netProfit = stats.income - (stats.expenses + stats.wasteValue);

  const styles = {
    container: { padding: '15px', direction: 'rtl', fontFamily: 'Tajawal', backgroundColor: '#f0fdf4', minHeight: '100vh' },
    header: { display: 'flex', alignItems: 'center', gap: '10px', color: '#16a085', marginBottom: '20px' },
    card: { background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
    profitArea: { marginTop: '20px', padding: '20px', borderRadius: '12px', backgroundColor: netProfit >= 0 ? '#dcfce7' : '#fee2e2', textAlign: 'center' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}><BarChart3 size={28} /> <h2>القوائم المالية</h2></div>
      
      <div style={styles.card}>
        <div style={styles.statRow}>
          <span><TrendingUp size={16} color="green" /> إجمالي الإيرادات</span>
          <span style={{fontWeight: 'bold', color: 'green'}}>{stats.income} ج.م</span>
        </div>
        <div style={styles.statRow}>
          <span><TrendingDown size={16} color="red" /> إجمالي المصروفات</span>
          <span style={{fontWeight: 'bold', color: 'red'}}>{stats.expenses} ج.م</span>
        </div>
        <div style={styles.statRow}>
          <span><PieChart size={16} color="orange" /> قيمة الهالك</span>
          <span style={{fontWeight: 'bold', color: 'orange'}}>{stats.wasteValue} ج.م</span>
        </div>

        <div style={styles.profitArea}>
          <div style={{fontSize: '0.9rem', color: '#666'}}>صافي الأرباح</div>
          <div style={{fontSize: '1.8rem', fontWeight: 'bold', color: netProfit >= 0 ? '#166534' : '#991b1b'}}>
            {netProfit} ج.م
          </div>
        </div>
      </div>

      <button onClick={onBack} style={{marginTop: '10px', width: '100%', border: 'none', background: 'none', color: '#888'}}><ArrowRight size={18} /> العودة للوحة التحكم</button>
    </div>
  );
};

export default Financials;
