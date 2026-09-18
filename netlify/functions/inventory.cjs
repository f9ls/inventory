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
    // جلب مستويات المخزون من مسار Loyverse
    const response = await fetch("https://api.loyverse.com/v1.0/inventory", {
      headers: {
        Authorization: `Bearer ${LOYVERSE_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
