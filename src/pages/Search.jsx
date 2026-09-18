import React, { useState, useEffect } from 'react';

export default function Search() {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // جلب المنتجات الحية من دالة Loyverse
  useEffect(() => {
    fetch('/.netlify/functions/inventory')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          setAllItems(data.items);
          setFilteredItems(data.items);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching inventory for search:', err);
        setLoading(false);
      });
  }, []);

  // فلترة المنتجات بالاسم أو برمز الصنف
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = allItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(value) ||
        String(item.id)?.toLowerCase().includes(value)
    );
    setFilteredItems(filtered);
  };

  // حذف صنف من القائمة محلياً
  const deleteItem = (id) => {
    setAllItems((prev) => prev.filter((item) => item.id !== id));
    setFilteredItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="search mainbar">
      {/* عنوان الصفحة */}
      <div className="heading">
        <div className="headingtag">Search Items</div>
      </div>

      {/* حقل البحث */}
      <div className="searchbardiv">
        <div className="group">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
            </g>
          </svg>
          <input
            className="input"
            type="search"
            placeholder="ابحث باسم الصنف أو رمزه..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
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

      {/* قائمة النتائج */}
      <div className="inventorysection">
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
            جاري تحميل الأصناف...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
            {searchTerm ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد أصناف مضافة في Loyverse'}
          </div>
        ) : (
          filteredItems.map((item, index) => (
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

  // كرت العرض
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
