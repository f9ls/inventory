import React, { useState, useEffect } from 'react';

export default function Inventory() {
  const [inventory, setInventory] = useState({
    items: [],
    orders: [],
  });
  const [loading, setLoading] = useState(true);

  // جلب بيانات المخزون المباشرة من Loyverse عبر Netlify Function
  useEffect(() => {
    fetch('/.netlify/functions/inventory')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.inventory_levels) {
          const liveItems = data.inventory_levels.map((item, index) => ({
            id: item.variant_id ? item.variant_id.substring(0, 8) : `${index + 1}`,
            name: `صنف #${index + 1}`,
            Stock: item.in_stock ?? 0,
            image: 'prod1.jpg',
          }));
          setInventory((prev) => ({
            ...prev,
            items: liveItems,
          }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching inventory:', err);
        setLoading(false);
      });
  }, []);

  // حذف عنصر محلياً من الجدول
  const deleteItem = (id) => {
    setInventory((prevInventory) => ({
      ...prevInventory,
      items: prevInventory.items.filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="inventory mainbar">
      {/* Heading section */}
      <div className="heading">
        <div className="headingtag">Inventory</div>
      </div>
      {/* Total items count */}
      <div className="totalitems">
        {loading ? 'جاري التحميل...' : `Total Items - ${inventory.items.length}`}
      </div>
      {/* Table headers */}
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
      {/* Inventory items section */}
      <div className="inventorysection">
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#aaa' }}>
            جاري مزامنة المخزون مع كاشير Loyverse...
          </div>
        ) : inventory.items.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#aaa' }}>
            لا توجد عناصر مفعّل لها تتبع المخزون في Loyverse
          </div>
        ) : (
          inventory.items.map((item, index) => (
            <InvCard
              key={item.id}
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

  // كرت عرض كل صنف داخل الجدول
  function InvCard({ index, imgsource, id, invname, invcount, onDelete }) {
    return (
      <div className="invcard">
        <div className="invsno">{index}</div>
        <div className="invimg">
          <img src={imgsource} alt="" className="invimgimg" />
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
