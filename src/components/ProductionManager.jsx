import React, { useState } from 'react';
import { Factory, Save, ArrowLeft, AlertTriangle, Box, Info, Calendar, Clock } from 'lucide-react';

const ProductionManager = ({ stock, onSaveProduction, onSaveWaste, onBack, setStock }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'الأولى',
    ingredients: {
      دقيق: 0, سكر: 0, عجوة: 0, سمنة: 0, زبدة: 0, 
      سولار: 0, كهرباء: 0, لبن: 0, كارتون: 0, تغليف: 0
    },
    productionQty: 0, 
    wasteQty: 0,
    expectedCostPerUnit: 0 
  });

  const shifts = ['الأولى', 'الثانية', 'السهرة', 'إضافي'];

  const handleChange = (e, category, field) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    if (category === 'ingredients') {
      setFormData({ ...formData, ingredients: { ...formData.ingredients, [field]: value } });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleProcessProduction = () => {
    let totalActualCost = 0;
    const updatedStock = JSON.parse(JSON.stringify(stock));

    for (const [ingName, requiredQty] of Object.entries(formData.ingredients)) {
      if (requiredQty <= 0) continue;
      const stockItem = updatedStock.find(s => s.name.trim() === ingName.trim());
      const totalAvailable = stockItem ? (stockItem.balance || 0) : 0;

      if (!stockItem || totalAvailable < requiredQty) {
        alert(`⚠️ عجز في مادة: ${ingName}\nالمطلوب: ${requiredQty}\nالمتوفر: ${totalAvailable}`);
        return;
      }

      let remainingToWithdraw = requiredQty;
      if (!stockItem.batches || stockItem.batches.length === 0) {
        totalActualCost += (requiredQty * (stockItem.price || 0));
        stockItem.balance -= requiredQty;
      } else {
        while (remainingToWithdraw > 0 && stockItem.batches.length > 0) {
          const currentBatch = stockItem.batches[0];
          if (currentBatch.quantity <= remainingToWithdraw) {
            totalActualCost += (currentBatch.quantity * currentBatch.price);
            remainingToWithdraw -= currentBatch.quantity;
            stockItem.batches.shift();
          } else {
            totalActualCost += (remainingToWithdraw * currentBatch.price);
            currentBatch.quantity -= remainingToWithdraw;
            remainingToWithdraw = 0;
          }
        }
        stockItem.balance = stockItem.batches.reduce((sum, b) => sum + b.quantity, 0);
      }
    }

    const actualUnitCost = formData.productionQty > 0 ? (totalActualCost / formData.productionQty) : 0;
    const finalProductName = "معمول جاهز";
    let productItem = updatedStock.find(s => s.name.trim() === finalProductName);
    const newProductBatch = { purchaseDate: formData.date, quantity: formData.productionQty, price: actualUnitCost };

    if (productItem) {
      if (!productItem.batches) productItem.batches = [];
      productItem.batches.push(newProductBatch);
      productItem.balance = (productItem.balance || 0) + formData.productionQty;
    } else {
      updatedStock.push({
        id: Date.now(), name: finalProductName, balance: formData.productionQty, unit: 'كرتونة', batches: [newProductBatch], price: actualUnitCost
      });
    }

    setStock(updatedStock);
    onSaveProduction({ ...formData, totalActualCost: totalActualCost.toFixed(2), actualUnitCost: actualUnitCost.toFixed(2) });

    if (formData.wasteQty > 0) {
      onSaveWaste({
        id: Date.now(), date: formData.date, item: `هالك إنتاج - ${formData.shift}`, 
        quantity: formData.wasteQty, costAtLoss: (actualUnitCost * formData.wasteQty).toFixed(2), reason: "هالك تشغيل"
      });
    }

    alert(`✅ تم الترحيل بنجاح!\nالتكلفة الإجمالية: ${totalActualCost.toFixed(2)} ج.م`);
    onBack();
  };

  return (
    <div className="production-container" style={{ 
      direction: 'rtl', padding: '15px', backgroundColor: '#f8fafd', minHeight: '100vh', fontFamily: 'sans-serif' 
    }}>
      
      {/* هيدر الصفحة - مستوحى من الصورة المرفوعة */}
      <div style={{ 
        backgroundColor: '#fff', borderRadius: '25px', padding: '20px', marginBottom: '15px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b', fontWeight: '800' }}>سجل تشغيل</h1>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b', fontWeight: '800' }}>الإنتاج <Factory size={20} color="#f59e0b" style={{display:'inline'}} /></h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
             <div style={{ background: '#f1f5f9', padding: '5px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} color="#64748b" />
                <input type="date" value={formData.date} onChange={(e) => handleChange(e, 'info', 'date')} style={{ border: 'none', background: 'transparent', fontSize: '13px', color: '#475569', outline: 'none' }} />
             </div>
             <div style={{ background: '#f1f5f9', padding: '5px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={14} color="#64748b" />
                <select value={formData.shift} onChange={(e) => handleChange(e, 'info', 'shift')} style={{ border: 'none', background: 'transparent', fontSize: '13px', color: '#475569', outline: 'none' }}>
                  {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* قسم خامات التشغيل */}
        <div style={{ backgroundColor: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #fef3c7', paddingBottom: '10px' }}>
             <h3 style={{ margin: 0, color: '#f59e0b' }}>خامات التشغيل</h3>
             <span style={{ fontSize: '10px', color: '#94a3b8' }}>* أدخل الكمية المستهلكة</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {Object.keys(formData.ingredients).map(ing => {
              const inStock = stock.find(s => s.name.trim() === ing.trim())?.balance || 0;
              return (
                <div key={ing} style={{ 
                  background: '#fff7f7', padding: '12px', borderRadius: '18px', border: '1px solid #fee2e2',
                  display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>{ing}</span>
                  <input 
                    type="number" placeholder="0"
                    onChange={(e) => handleChange(e, 'ingredients', ing)}
                    style={{ width: '80%', border: 'none', background: 'transparent', borderBottom: '2px solid #cbd5e1', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', outline: 'none', padding: '5px' }} 
                  />
                  <span style={{ fontSize: '11px', color: inStock > 0 ? '#10b981' : '#ef4444', marginTop: '8px' }}>متوفر: {inStock}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* قسم الإنتاج التام */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '25px', padding: '20px', color: '#fff' }}>
          <h3 style={{ color: '#f59e0b', marginTop: 0 }}>الإنتاج التام</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', opacity: 0.8 }}>حجم الإنتاج (كرتونة):</label>
            <input type="number" onChange={(e) => handleChange(e, 'info', 'productionQty')} style={{ width: '100%', padding: '12px', borderRadius: '15px', marginTop: '5px', fontSize: '18px', border: 'none', fontWeight: 'bold' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', opacity: 0.8 }}>كمية الهالك:</label>
            <input type="number" onChange={(e) => handleChange(e, 'info', 'wasteQty')} style={{ width: '100%', padding: '12px', borderRadius: '15px', marginTop: '5px', border: 'none', color: '#ef4444' }} />
          </div>
          <button onClick={handleProcessProduction} style={{ 
            width: '100%', padding: '15px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '18px', fontWeight: '800', fontSize: '16px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}>ترحيل العملية</button>
        </div>

        {/* زر العودة للرئيسية */}
        <button onClick={onBack} style={{ 
          width: '100%', padding: '15px', background: '#fff', border: '2px solid #e2e8f0', color: '#64748b', borderRadius: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px'
        }}>
          <ArrowLeft size={20} /> العودة للوحة التحكم
        </button>

      </div>
    </div>
  );
};

export default ProductionManager;
