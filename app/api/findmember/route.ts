// app/api/findmember/route.js

export async function POST(req: Request) {
  try {
    const { lastName, policyId } = await req.json();

    if (!lastName || !policyId) {
      return Response.json({ found: false, message: "Missing parameters" });
    }

    const response = await fetch(process.env.APIM_MEMBER_LOOKUP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.APIM_MEMBER_LOOKUP_KEY
      },
      body: JSON.stringify({
        memberLast: lastName,
        memberInsID: policyId
      })
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json({ found: false, message: "Invalid JSON", raw: text });
    }

    // unwrap Power Automate / APIM envelope
    if (data?.body && typeof data.body === "object") data = data.body;
    if (data?.body && typeof data.body === "string") {
      try { data = JSON.parse(data.body); } catch {}
    }

    if (data?.results) {
      return Response.json({ found: false, message: data.results });
    }

    if (data?.pets && Array.isArray(data.pets)) {
      return Response.json({
        found: true,
        member: data,
        pets: data.pets
      });
    }

    if (data?.petName || data?.firstName) {
      return Response.json({
        found: true,
        member: data,
        pets: data.petName ? [data] : []
      });
    }

    return Response.json({ found: false, message: "Member not found" });

  } catch (err) {
    return Response.json({
      found: false,
      message: "Server error: " + err.message
    });
  }
}