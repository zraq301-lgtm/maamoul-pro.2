import React from 'react';
import * as XLSX from 'xlsx';
import { Users, Download, Calendar, Clock, ArrowRight } from 'lucide-react';

// نمرر مصفوفة العمال (staffData) من المكون الرئيسي
export default function StaffReports({ staffData = [], onBack }) {
  
  const exportStaffExcel = () => {
    if (!staffData || staffData.length === 0) {
      alert("لا توجد بيانات عمال لتصديرها");
      return;
    }

    // تجهيز البيانات لتناسب جدول الإكسل
    const data = staffData.flatMap(worker => 
      (worker.attendanceRecords || []).map(record => ({
        "اسم العامل": worker.name,
        "التاريخ": record.date,
        "حالة الحضور": record.status === 'present' ? 'حاضر' : 'غائب',
        "عدد ساعات السهر": record.overtimeHours || 0,
        "الإضافي (مبلغ/ساعة)": record.extraPay || 0,
        "ملاحظات": record.note || '',
        "الشهر": new Date(record.date).getMonth() + 1
      }))
    );

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تقرير العمال المفصل");
    
    // حفظ الملف باسم الشهر الحالي
    const fileName = `Staff_Report_${new Date().getMonth() + 1}_2026.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const styles = {
    wrapper: { padding: '15px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' },
    header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
    card: {
      backgroundColor: '#ffffff',
      padding: '25px',
      borderRadius: '22px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      borderRight: '6px solid #27ae60',
      textAlign: 'center'
    },
    btn: {
      width: '100%',
      backgroundColor: '#27ae60',
      color: '#fff',
      padding: '14px',
      borderRadius: '15px',
      border: 'none',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      cursor: 'pointer',
      marginTop: '20px'
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <button onClick={onBack} style={{border: 'none', background: '#eee', padding: '8px', borderRadius: '50%'}}>
          <ArrowRight size={20} />
        </button>
        <h2 style={{margin: 0}}>تقارير شؤون العمال</h2>
      </div>

      <div style={styles.card}>
        <div style={{color: '#27ae60', marginBottom: '15px'}}>
          <Users size={50} style={{margin: '0 auto'}} />
        </div>
        <h3 style={{margin: '0 0 10px 0'}}>كشف حضور وإضافي العمال</h3>
        <p style={{fontSize: '0.9rem', color: '#666', lineHeight: '1.6'}}>
          استخراج تقرير شامل لكل عامل يشمل:
          <br />
          (أيام الحضور، التواريخ، السهرات، والمكافآت الإضافية)
        </p>

        <button onClick={exportStaffExcel} style={styles.btn}>
          <Download size={20} />
          تحميل كشف العمال (Excel)
        </button>
      </div>

      {/* عرض ملخص سريع في الصفحة قبل التحميل */}
      <div style={{marginTop: '20px'}}>
        <h4 style={{marginBottom: '10px', color: '#34495e'}}>ملخص الحضور الحالي:</h4>
        {staffData.length === 0 ? (
          <p style={{color: '#999', textAlign: 'center'}}>لا توجد بيانات مسجلة</p>
        ) : (
          staffData.map(worker => (
            <div key={worker.id} style={{background: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span>{worker.name}</span>
              <span style={{fontSize: '0.8rem', backgroundColor: '#eefcf3', color: '#27ae60', padding: '4px 10px', borderRadius: '8px'}}>
                {worker.attendanceRecords?.length || 0} يوم حضور
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
