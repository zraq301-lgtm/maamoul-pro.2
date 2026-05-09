import React, { useState } from 'react';
import { 
  Package, Truck, Calendar, Hash, DollarSign, 
  ArrowRight, Save, ShoppingCart, Clock, AlertCircle 
} from 'lucide-react';

const PurchasesManager = ({ onPurchaseComplete, onBack, stock = [], onOrderTrigger }) => {
  const [activeView, setActiveView] = useState('menu'); // menu, entry, orderRequest
  const [formData, setFormData] = useState({
    item: '', unit: '', quantity: '', price: '', supplier: '', 
    paymentMethod: 'كاش', date: new Date().toISOString().split('T')[0]
  });

  const [orderRequest, setOrderRequest] = useState({
    item: '', currentStock: 0, daysLeft: 0, neededQty: 0
  });

  // تحديث بيانات الطلب بناءً على الصنف المختار من المخزن
  const handleItemSelect = (itemName) => {
    const itemInStock = stock.find(s => s.name === itemName);
    const balance = itemInStock ? itemInStock.balance : 0;
    // تقدير الأيام: الرصيد / 2 (كمتوسط استهلاك يومي افتراضي)
    const estimatedDays = Math.floor(balance / 2); 
    
    setOrderRequest({
      ...orderRequest,
      item: itemName,
      currentStock: balance,
      daysLeft: estimatedDays
    });
  };

  const handleSendToSuppliers = (e) => {
    e.preventDefault();
    const orderData = {
      ...orderRequest,
      id: Date.now(),
      status: 'في الانتظار',
      requestDate: new Date().toLocaleDateString()
    };
    
    // إرسال الطلب لقائمة انتظار الموردين في App.jsx
    if (onOrderTrigger) onOrderTrigger(orderData);
    
    alert(`تم إرسال طلب (${orderRequest.item}) إلى قائمة انتظار الموردين`);
    setActiveView('menu');
  };

  const handleSave = (e) => {
    e.preventDefault();
    const total = formData.quantity * formData.price;
    const finalData = { ...formData, total, id: Date.now() };
    onPurchaseComplete(finalData);
    alert(`تم تسجيل الشراء: ${formData.item} وإضافته للمخزن`);
    setFormData({ item: '', unit: '', quantity: '', price: '', supplier: '', paymentMethod: 'كاش', date: new Date().toISOString().split('T')[0] });
    setActiveView('menu');
  };

  const styles = {
    wrapper: { padding: '15px', direction: 'rtl', fontFamily: 'Tajawal', backgroundColor: '#f8f9fa', minHeight: '100vh' },
    mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '15px', marginTop: '20px' },
    actionCard: { 
      background: 'white', padding: '25px', borderRadius: '20px', textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderBottom: '5px solid #9b59b6', cursor: 'pointer'
    },
    orderCard: { borderBottom: '5px solid #f39c12' },
    formCard: { background: 'white', borderRadius: '25px', padding: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
    input: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '15px', fontSize: '1rem', outline: 'none' },
    label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#444', marginBottom: '5px', fontWeight: 'bold' },
    submitBtn: { width: '100%', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#9b59b6', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '10px' },
    infoBox: { background: '#fff8ed', padding: '15px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #feebc8' }
  };

  // --- 1. واجهة القائمة الرئيسية (كارتين فقط) ---
  if (activeView === 'menu') {
    return (
      <div style={styles.wrapper}>
        <div style={{textAlign: 'center', marginBottom: '20px'}}>
           <h2 style={{color: '#2c3e50'}}>إدارة المشتريات</h2>
        </div>

        <div style={styles.mainGrid}>
          {/* كارت عملية شراء (الأصلي) */}
          <div style={styles.actionCard} onClick={() => setActiveView('entry')}>
            <Save size={35} color="#9b59b6" />
            <h3 style={{marginTop: '10px'}}>عملية شراء</h3>
            <p style={{fontSize: '0.8rem', color: '#888'}}>إضافة أصناف جديدة للمخزن</p>
          </div>

          {/* كارت طلب شراء (الجديد) */}
          <div style={{...styles.actionCard, ...styles.orderCard}} onClick={() => setActiveView('orderRequest')}>
            <ShoppingCart size={35} color="#f39c12" />
            <h3 style={{marginTop: '10px'}}>طلب شراء</h3>
            <p style={{fontSize: '0.8rem', color: '#888'}}>إرسال احتياج لقسم الموردين</p>
          </div>
        </div>

        <button onClick={onBack} style={{marginTop: '30px', width: '100%', background: 'none', border: 'none', color: '#9b59b6', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
          <ArrowRight size={18} /> العودة للوحة التحكم
        </button>
      </div>
    );
  }

  // --- 2. واجهة طلب الشراء (الاحتياج) ---
  if (activeView === 'orderRequest') {
    return (
      <div style={styles.wrapper}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
           <button onClick={() => setActiveView('menu')} style={{border: 'none', background: '#eee', padding: '8px', borderRadius: '50%'}}><ArrowRight size={20} /></button>
           <h3 style={{margin: 0}}>إنشاء طلب احتياج</h3>
        </div>

        <div style={styles.formCard}>
          <form onSubmit={handleSendToSuppliers}>
            <label style={styles.label}>اختر الصنف</label>
            <select style={styles.input} required onChange={e => handleItemSelect(e.target.value)}>
              <option value="">اختر صنف من المخزن...</option>
              {stock.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>

            <div style={styles.infoBox}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                <span><Package size={14}/> الرصيد الحالي:</span>
                <strong>{orderRequest.currentStock}</strong>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', color: orderRequest.daysLeft < 3 ? '#e74c3c' : '#2c3e50'}}>
                <span><Clock size={14}/> يكفي لمدة تقريبية:</span>
                <strong>{orderRequest.daysLeft} يوم</strong>
              </div>
            </div>

            <label style={styles.label}><Hash size={16}/> الكمية المطلوبة</label>
            <input 
              type="number" 
              style={styles.input} 
              placeholder="الكمية المراد طلبها" 
              required 
              onChange={e => setOrderRequest({...orderRequest, neededQty: e.target.value})}
            />

            <button type="submit" style={{...styles.submitBtn, backgroundColor: '#f39c12'}}>
              <Truck size={20} /> تنفيذ الطلب (إرسال للموردين)
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 3. واجهة نموذج الشراء الأصلي (بكامل تفاصيله) ---
  if (activeView === 'entry') {
    return (
      <div style={styles.wrapper}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
           <button onClick={() => setActiveView('menu')} style={{border: 'none', background: '#eee', padding: '8px', borderRadius: '50%'}}><ArrowRight size={20} /></button>
           <h3 style={{margin: 0}}>تسجيل فاتورة شراء</h3>
        </div>

        <div style={styles.formCard}>
          <form onSubmit={handleSave}>
            <label style={styles.label}><Package size={16} /> اسم الصنف</label>
            <input style={styles.input} placeholder="مثال: دقيق" required onChange={e => setFormData({...formData, item: e.target.value})} />

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <div>
                <label style={styles.label}>الوحدة</label>
                <input style={styles.input} placeholder="كيلو/كرتونة" onChange={e => setFormData({...formData, unit: e.target.value})} />
              </div>
              <div>
                <label style={styles.label}><Hash size={16} /> الكمية</label>
                <input type="number" style={styles.input} required onChange={e => setFormData({...formData, quantity: e.target.value})} />
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <div>
                <label style={styles.label}><DollarSign size={16} /> سعر الوحدة</label>
                <input type="number" style={styles.input} required onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label style={styles.label}>طريقة السداد</label>
                <select style={styles.input} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                  <option value="كاش">كاش</option>
                  <option value="آجل">آجل</option>
                </select>
              </div>
            </div>

            <label style={styles.label}><Truck size={16} /> اسم المورد</label>
            <input style={styles.input} placeholder="اختياري" onChange={e => setFormData({...formData, supplier: e.target.value})} />

            <label style={styles.label}><Calendar size={16} /> التاريخ</label>
            <input type="date" style={styles.input} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />

            <div style={{background: '#f0eef6', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center'}}>
              <span style={{fontSize: '0.9rem'}}>إجمالي الفاتورة: </span>
              <strong style={{fontSize: '1.2rem', color: '#9b59b6'}}>{formData.quantity * formData.price}</strong>
            </div>

            <button type="submit" style={styles.submitBtn}>
              <Save size={20} /> تسجيل وإضافة للمخزن
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default PurchasesManager;
