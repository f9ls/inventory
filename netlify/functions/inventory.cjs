exports.handler = async (event) => {
  const LOYVERSE_TOKEN = process.env.LOYVERSE_TOKEN;

  if (!LOYVERSE_TOKEN) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "LOYVERSE_TOKEN is not configured" }),
    };
  }

  try {
    const headers = {
      Authorization: `Bearer ${LOYVERSE_TOKEN}`,
      "Content-Type": "application/json",
    };

    // سحب المخزون، والمنتجات، وآخر إيصالات المبيعات من Loyverse
    const [invRes, itemsRes, receiptsRes] = await Promise.all([
      fetch("https://api.loyverse.com/v1.0/inventory", { headers }),
      fetch("https://api.loyverse.com/v1.0/items", { headers }),
      fetch("https://api.loyverse.com/v1.0/receipts?limit=25", { headers }).catch(() => null),
    ]);

    const invData = await invRes.json();
    const itemsData = await itemsRes.json();
    const receiptsData = receiptsRes ? await receiptsRes.json().catch(() => ({})) : {};

    const inventoryLevels = invData.inventory_levels || [];
    const items = itemsData.items || [];
    const receipts = receiptsData.receipts || [];

    // ربط المنتجات بالمعرف والصور
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

    // قائمة المخزون الحي
    const liveItems = inventoryLevels.map((inv, index) => {
      const details = variantMap[inv.variant_id] || {};
      return {
        id: details.sku || (inv.variant_id ? inv.variant_id.substring(0, 8) : `${index + 1}`),
        name: details.name || `صنف #${index + 1}`,
        Stock: inv.in_stock ?? 0,
        image: details.image,
      };
    });

    // تحويل إيصالات المبيعات الحقيقية إلى طلبات
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
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ items: liveItems, orders: liveOrders }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
