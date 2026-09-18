import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState({});
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // جلب الطلبات والإيصالات الحقيقية من Loyverse
  useEffect(() => {
    fetch('/.netlify/functions/inventory')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
          const initialStatuses = data.orders.reduce((acc, order) => {
            acc[order.orderid] = order.status;
            return acc;
          }, {});
          setOrderStatuses(initialStatuses);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching orders:', err);
        setLoading(false);
      });
  }, []);

  const handleMarkAsDone = (orderId) => {
    setOrderStatuses((prevStatuses) => ({
      ...prevStatuses,
      [orderId]: 'Done',
    }));
  };

  const handleFilterToggle = () => {
    setShowPendingOnly((prev) => !prev);
  };

  const filteredOrders = showPendingOnly
    ? orders.filter((order) => orderStatuses[order.orderid] === 'Pending')
    : orders;

  return (
    <div className="order mainbar">
      {/* رأس الصفحة */}
      <div className="heading orderheading">
        <div className="headingtag orderheadingtag">
          {loading ? 'Orders' : `All Orders (${filteredOrders.length})`}
        </div>
        <div className="filter" onClick={handleFilterToggle}>
          {showPendingOnly ? 'Show All Orders' : 'Show Pending Orders'}
        </div>
      </div>

      {/* عرض الطلبات */}
      <div className="ordersection">
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
            جاري تحميل طلبات ومبيعات الكاشير...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#aaa' }}>
            لا توجد إيصالات أو طلبات مسجلة في Loyverse
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <Orderpagecard
              key={order.orderid}
              orderid={order.orderid}
              customername={order.customername}
              orderitem={order.orderitem[0]}
              status={orderStatuses[order.orderid] || order.status}
              index={index + 1}
              onMarkAsDone={() => handleMarkAsDone(order.orderid)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// كرت تفاصيل الطلب
function Orderpagecard({
  orderid,
  customername,
  orderitem,
  status,
  index,
  onMarkAsDone,
}) {
  return (
    <Link to={`/Order/${orderid}`} className="ordercardlink">
      <div className={`orderpagecard ${status === 'Done' ? 'border-green' : ''}`}>
        <div className="snoimage">
          <div className="sno">{index}.</div>
          {orderitem?.image ? (
            <img
              src={orderitem.image}
              alt={orderitem?.name}
              className="prodimageorderpage"
            />
          ) : (
            <div
              className="prodimageorderpage"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.08)',
                fontSize: '28px',
                borderRadius: '10px',
              }}
            >
              🧾
            </div>
          )}
        </div>

        <div className="idquantity">
          <div className="orderpageid">ID - {orderid}</div>
          <div className="quantity">
            {orderitem?.name || 'صنف'} × {orderitem?.quantity || 1}
          </div>
        </div>

        <div className="custnameorderpage idquantity">
          <div className="orderpageid">Customer</div>
          <div className="quantity">{customername}</div>
        </div>

        <div className="buttonsection">
          <div className={`status ${status === 'Done' ? 'border-green' : ''}`}>
            <div
              className={status === 'Pending' ? 'redcircle' : 'greencircle'}
            ></div>{' '}
            {status}
          </div>

          {status === 'Pending' && (
            <div
              className="markasdonebutton"
              onClick={(e) => {
                e.preventDefault();
                onMarkAsDone();
              }}
            >
              Mark Done
            </div>
          )}

          <div
            className={`rejectorderbutton ${
              status === 'Done' ? 'hidebutton' : ''
            }`}
          >
            Reject Order
          </div>
        </div>
      </div>
    </Link>
  );
}
