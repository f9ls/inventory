exports.handler = async (event) => {
  const LOYVERSE_TOKEN = process.env.LOYVERSE_TOKEN;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (!LOYVERSE_TOKEN) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "LOYVERSE_TOKEN is not configured" }),
    };
  }

  const authHeaders = {
    Authorization: `Bearer ${LOYVERSE_TOKEN}`,
    "Content-Type": "application/json",
  };

  // معالجة إضافة صنف جديد إلى Loyverse
  if (event.httpMethod === "POST") {
    try {
      const payload = JSON.parse(event.body || "{}");
      const { name, price, sku } = payload;

      if (!name) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "اسم الصنف مطلوب" }),
        };
      }

      const itemBody = {
        item_name: name,
        variants: [
          {
            sku: sku || undefined,
            price: Number(price) || 0,
            track_inventory: true,
            default_pricing_type: "FIXED",
          },
        ],
      };

      const res = await fetch("https://api.loyverse.com/v1.0/items", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(itemBody),
      });

      const responseData = await res.json();

      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify(responseData),
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: err.message }),
      };
    }
  }

  // معالجة جلب البيانات الحالية (GET)
  try {
    const [invRes, itemsRes, receiptsRes] = await Promise.all([
      fetch("https://api.loyverse.com/v1.0/inventory", { headers: authHeaders }),
      fetch("https://api.loyverse.com/v1.0/items", { headers: authHeaders }),
      fetch("https://api.loyverse.com/v1.0/receipts?limit=25", { headers: authHeaders }).catch(() => null),
    ]);

    const invData = await invRes.json();
    const itemsData = await itemsRes.json();
    const receiptsData = receiptsRes ? await receiptsRes.json().catch(() => ({})) : {};

    const inventoryLevels = invData.inventory_levels || [];
    const items = itemsData.items || [];
    const receipts = receiptsData.receipts || [];

    const variantMap = {};
    items.forEach((item) => {
      if (item.variants) {
        item.variants.forEach((v) => {
          const displayName = v.option1_value
            ? `${item.item_name} (${v.option1_value})`
            : item.item_name;
          variantMap[v.variant_id] = {
            name: displayName,
            image: item.image_url || null,
            sku: v.sku || item.id,
          };
        });
      }
    });

    const liveItems = inventoryLevels.map((inv, index) => {
      const details = variantMap[inv.variant_id] || {};
      return {
        id: details.sku || (inv.variant_id ? inv.variant_id.substring(0, 8) : `${index + 1}`),
        name: details.name || `صنف #${index + 1}`,
        Stock: inv.in_stock ?? 0,
        image: details.image,
      };
    });

    const liveOrders = receipts.map((r, idx) => {
      const firstItem = r.line_items && r.line_items[0] ? r.line_items[0] : null;
      const totalQty = r.line_items
        ? r.line_items.reduce((sum, item) => sum + (item.quantity || 0), 0)
        : 1;

      return {
        orderid: r.receipt_number || `${idx + 1}`,
        customername: r.customer_id ? "عميل مسجل" : "عميل كاشير",
        status: r.receipt_type === "REFUND" ? "Refunded" : "Done",
        orderitem: [
          {
            id: firstItem ? firstItem.variant_id : `${idx + 1}`,
            name: firstItem ? firstItem.item_name : "طلب كاشير",
            quantity: totalQty,
            image: firstItem && variantMap[firstItem.variant_id] ? variantMap[firstItem.variant_id].image : null,
          },
        ],
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ items: liveItems, orders: liveOrders }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
