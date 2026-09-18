import React, { useState, useEffect } from 'react';

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب الطلبات والإحصائيات الحقيقية من Netlify Function
  useEffect(() => {
    fetch('/.netlify/functions/inventory')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home mainbar">
      {/* عنوان الصفحة */}
      <div className="heading">
        <div className="headingtag">Dashboard</div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="mainbarpage">
        <Mainpagetags orders={orders} loading={loading} />
        <RecentOrdersection orders={orders} loading={loading} />
      </div>
    </div>
  );

  // بطاقات الإحصائيات العلوية
  function Mainpagetags({ orders, loading }) {
    const totalOrders = orders.length;
    const processedOrders = orders.filter((order) => order.status === 'Done').length;
    const remainingOrders = totalOrders - processedOrders;

    return (
      <div className="mainpagetags">
        {/* إجمالي الطلبات */}
        <div className="totalordertag tagcards">
          <div className="topcard">
            <img src="order.png" alt="" className="cardicon" />
            <div className="cardtoptag">Total Orders</div>
          </div>
          <div className="middlecard">
            <div className="ordernumber">{loading ? '...' : totalOrders}</div>
          </div>
          <div className="bottomcard"></div>
        </div>

        {/* الطلبات المكتملة */}
        <div className="processedordertag tagcards">
          <div className="topcard">
            <img src="done.png" alt="" className="cardicon" />
            <div className="cardtoptag">Processed Orders</div>
          </div>
          <div className="middlecard">
            <div className="ordernumber">{loading ? '...' : processedOrders}</div>
          </div>
          <div className="bottomcard"></div>
        </div>

        {/* الطلبات المتبقية */}
        <div className="remainingorderstag tagcards">
          <div className="topcard">
            <img src="remaining.png" alt="" className="cardicon" />
            <div className="cardtoptag">Remaining Orders</div>
          </div>
          <div className="middlecard">
            <div className="ordernumber">{loading ? '...' : remainingOrders}</div>
          </div>
          <div className="bottomcard"></div>
        </div>
      </div>
    );
  }

  // قسم آخر الطلبات المسجلة
  function RecentOrdersection({ orders, loading }) {
    return (
      <div className="recentorderssection">
        <div className="recentorderheading">Recent Orders</div>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
            جاري مزامنة الإحصائيات والطلبات...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
            لا توجد إيصالات حديثة مسجلة في كاشير Loyverse
          </div>
        ) : (
          orders.slice(0, 5).map((order, index) => (
            <OrderCard
              key={order.orderid || index}
              sno={index + 1}
              image={order.orderitem?.[0]?.image}
              id={order.orderid}
              itemcount={order.orderitem?.[0]?.quantity || 1}
              custname={order.customername}
              status={order.status}
            />
          ))
        )}
      </div>
    );
  }

  // كرت عرض كل طلب
  function OrderCard({ sno, image, id, itemcount, custname, status }) {
    return (
      <div className="recentordersdiv">
        <div className="sno">{sno}.</div>
        <div className="itemimage">
          {image ? (
            <img src={image} alt="product" className="productimage" />
          ) : (
            <div
              className="productimage"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
              }}
            >
              🧾
            </div>
          )}
        </div>
        <div className="itemid">Id - {id}</div>
        <div className="itemid">No - {itemcount}</div>
        <div className="itemid custname">Customer Name : {custname}</div>
        <div className={`status ${status === 'Pending' ? '' : 'greenborder'}`}>
          <div
            className={status === 'Pending' ? 'redcircle' : 'greencircle'}
          ></div>
          {status}
        </div>
      </div>
    );
  }
}
