import React, { useState, useEffect } from 'react';

export default function Inventory() {
  const [inventory, setInventory] = useState({
    items: [],
    orders: [],
  });
  const [loading, setLoading] = useState(true);

  // جلب بيانات المخزون المباشرة (الأسماء، الكميات، والصور) من Loyverse
  useEffect(() => {
    fetch('/.netlify/functions/inventory')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          setInventory((prev) => ({
            ...prev,
            items: data.items,
          }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching inventory:', err);
        setLoading(false);
      });
  }, []);

  // حذف صنف محلياً من القائمة
  const deleteItem = (id) => {
    setInventory((prevInventory) => ({
      ...prevInventory,
      items: prevInventory.items.filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="inventory mainbar">
      {/* عنوان الصفحة */}
      <div className="heading">
        <div className="headingtag">Inventory</div>
      </div>

      {/* إجمالي الأصناف */}
      <div className="totalitems">
        {loading ? 'جاري التحميل...' : `Total Items - ${inventory.items.length}`}
      </div>

      {/* عناوين الجدول */}
      <div className="inventoryheads">
        <div className="invsno">Sno.</div>
        <div className="invimg">Prod. Image</div>
        <div className="invid">Prod. ID</div>
        <div className="invname">Prod. Name</div>
        <div className="invquantity">Count</div>
        <div className="invbutton">
          <div className="deleteitem">Delete</div>
        </div>
      </div>

      {/* قائمة عناصر المخزون */}
      <div className="inventorysection">
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
            جاري مزامنة المخزون مع كاشير Loyverse...
          </div>
        ) : inventory.items.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
            لا توجد عناصر مفعّل لها تتبع المخزون في Loyverse
          </div>
        ) : (
          inventory.items.map((item, index) => (
            <InvCard
              key={item.id || index}
              index={index + 1}
              imgsource={item.image}
              id={item.id}
              invname={item.name}
              invcount={item.Stock}
              onDelete={deleteItem}
            />
          ))
        )}
      </div>
    </div>
  );

  // كرت عرض الصنف داخل الجدول
  function InvCard({ index, imgsource, id, invname, invcount, onDelete }) {
    return (
      <div className="invcard">
        <div className="invsno">{index}</div>
        <div className="invimg">
          {imgsource ? (
            <img src={imgsource} alt={invname} className="invimgimg" />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                fontSize: '18px',
              }}
            >
              📦
            </div>
          )}
        </div>
        <div className="invid">{id}</div>
        <div className="invname">{invname}</div>
        <div className="invquantity">{invcount}</div>
        <div className="invbutton">
          <button className="deleteitembutton" onClick={() => onDelete(id)}>
            Delete
          </button>
        </div>
      </div>
    );
  }
}
