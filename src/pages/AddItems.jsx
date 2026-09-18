import React, { useState } from 'react';

export default function AddItems() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    sku: '',
  });
  const [status, setStatus] = useState({ loading: false, msg: '', error: false });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setStatus({ loading: false, msg: 'يرجى كتابة اسم الصنف أولاً', error: true });
      return;
    }

    setStatus({ loading: true, msg: 'جاري إرسال الصنف لكاشير Loyverse...', error: false });

    try {
      const response = await fetch('/.netlify/functions/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ loading: false, msg: 'تمت إضافة الصنف بنجاح إلى كاشير Loyverse!', error: false });
        setFormData({ name: '', price: '', sku: '' });
      } else {
        setStatus({
          loading: false,
          msg: result.error || 'حدث خطأ أثناء حفظ الصنف في Loyverse',
          error: true,
        });
      }
    } catch (err) {
      setStatus({ loading: false, msg: 'فشل الاتصال بالخادم، يرجى المحاولة لاحقاً', error: true });
    }
  };

  return (
    <div className="additems mainbar">
      <div className="heading">
        <div className="headingtag">Add Products</div>
      </div>

      <div style={{ maxWidth: '540px', marginTop: '30px' }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* اسم الصنف */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#ccc' }}>Product Name / اسم الصنف *</label>
            <input
              type="text"
              name="name"
              placeholder="مثال: لاتيه حار / فلات وايت"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#fff',
                outline: 'none',
                fontSize: '14px',
              }}
            />
          </div>

          {/* السعر */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#ccc' }}>Price / السعر (SAR)</label>
            <input
              type="number"
              step="0.01"
              name="price"
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#fff',
                outline: 'none',
                fontSize: '14px',
              }}
            />
          </div>

          {/* الباركود أو الرمز */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#ccc' }}>SKU / رمز المنتج (اختياري)</label>
            <input
              type="text"
              name="sku"
              placeholder="مثال: CR-101"
              value={formData.sku}
              onChange={handleChange}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#fff',
                outline: 'none',
                fontSize: '14px',
              }}
            />
          </div>

          {/* رسائل التنبيه */}
          {status.msg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                background: status.error ? 'rgba(255, 68, 68, 0.12)' : 'rgba(39, 174, 96, 0.15)',
                color: status.error ? '#ff6b6b' : '#2ecc71',
                border: `1px solid ${status.error ? '#ff4444' : '#27ae60'}`,
              }}
            >
              {status.msg}
            </div>
          )}

          {/* زر الحفظ */}
          <button
            type="submit"
            disabled={status.loading}
            style={{
              marginTop: '10px',
              background: '#2ecc71',
              color: '#000',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              padding: '13px',
              cursor: status.loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: status.loading ? 0.7 : 1,
              transition: '0.2s ease',
            }}
          >
            {status.loading ? 'جاري الإضافة...' : 'Add Item to Loyverse'}
          </button>
        </form>
      </div>
    </div>
  );
}
