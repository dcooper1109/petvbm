// app/api/submitmedrequestvbm/route.js

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const requiredFields = [
      "memberLast",
      "memberInsID",
      "medicationName",
      "medicationDose",
      "medicationFrequency",
      "medicationMethod",
      "medicationQuantity",
      "medicationRefill"
    ];

    for (const f of requiredFields) {
      if (!payload[f]) {
        return Response.json({
          success: false,
          message: `Missing required field: ${f}`
        });
      }
    }

    const targetUrl = process.env.AUCTION_PARTNER_FLOW_URL;

    console.log("submitmedrequestvbm targetUrl =", targetUrl);
    console.log("submitmedrequestvbm payload =", payload);

    if (!targetUrl) {
      return Response.json({
        success: false,
        message: "Missing AUCTION_PARTNER_FLOW_URL in .env.local"
      });
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.APIM_MED_REQUEST_KEY!
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    console.log("Remote status =", response.status, response.statusText);
    console.log("Remote raw response =", text);

    if (!response.ok) {
      return Response.json({
        success: false,
        message: `Remote API error: ${response.status} ${response.statusText}`,
        raw: text
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json({
        success: false,
        message: "Remote API returned non-JSON",
        raw: text
      });
    }

    // unwrap body if needed
    if (data?.body && typeof data.body === "object") data = data.body;
    if (data?.body && typeof data.body === "string") {
      try {
        data = JSON.parse(data.body);
      } catch {}
    }

    // if API explicitly returned an error
    if (data?.error) {
      return Response.json({
        success: false,
        message: data.error.message || "API returned an error",
        data
      });
    }

    // require at least one real result field
    const hasRealResult =
      data?.partnerURL ||
      data?.company ||
      data?.discountPCT ||
      data?.discountCode ||
      data?.results;

    if (!hasRealResult) {
      return Response.json({
        success: false,
        message: "API returned no partner data",
        data
      });
    }

    return Response.json({
      success: true,
      partnerURL: data?.partnerURL || "",
      company: data?.company || "",
      discountPCT: data?.discountPCT || "",
      discountCode: data?.discountCode || "",
      results: data?.results || ""
    });

  } catch (err) {
    console.error("submitmedrequestvbm route error:", err);

    return Response.json({
      success: false,
      message: "Server error: " + err.message,
      errorName: err.name,
      errorCause: err.cause?.message || null
    });
  }
}