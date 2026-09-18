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

    // جلب مستويات المخزون وتفاصيل المنتجات في نفس الوقت
    const [invRes, itemsRes] = await Promise.all([
      fetch("https://api.loyverse.com/v1.0/inventory", { headers }),
      fetch("https://api.loyverse.com/v1.0/items", { headers }),
    ]);

    const invData = await invRes.json();
    const itemsData = await itemsRes.json();

    const inventoryLevels = invData.inventory_levels || [];
    const items = itemsData.items || [];

    // مطابقة كل صنف باسمه وصورته من Loyverse
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

    // دمج الكميات مع الأسماء والصور
    const liveItems = inventoryLevels.map((inv, index) => {
      const details = variantMap[inv.variant_id] || {};
      return {
        id: details.sku || (inv.variant_id ? inv.variant_id.substring(0, 8) : `${index + 1}`),
        name: details.name || `صنف #${index + 1}`,
        Stock: inv.in_stock ?? 0,
        image: details.image,
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ items: liveItems }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
