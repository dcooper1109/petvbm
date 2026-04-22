export async function POST(req: Request) {
  try {
    const { lastName, policyId } = await req.json();

    if (!lastName || !policyId) {
      return Response.json({ found: false, message: "Missing parameters" });
    }

    const lookupUrl = process.env.APIM_MEMBER_LOOKUP_URL;
    const lookupKey = process.env.APIM_MEMBER_LOOKUP_KEY;

    if (!lookupUrl || !lookupKey) {
      return Response.json(
        { found: false, message: "Server configuration missing" },
        { status: 500 }
      );
    }

    const response = await fetch(lookupUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": lookupKey,
      },
      body: JSON.stringify({
        memberLast: lastName,
        memberInsID: policyId,
      }),
    });

    const text = await response.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json({ found: false, message: "Invalid JSON", raw: text });
    }

    if (data?.body && typeof data.body === "object") data = data.body;
    if (data?.body && typeof data.body === "string") {
      try {
        data = JSON.parse(data.body);
      } catch {}
    }

    if (data?.results) {
      return Response.json({ found: false, message: data.results });
    }

    if (data?.pets && Array.isArray(data.pets)) {
      return Response.json({
        found: true,
        member: data,
        pets: data.pets,
      });
    }

    if (data?.petName || data?.firstName) {
      return Response.json({
        found: true,
        member: data,
        pets: data.petName ? [data] : [],
      });
    }

    return Response.json({ found: false, message: "Member not found" });
  } catch (err: any) {
    return Response.json({
      found: false,
      message: "Server error: " + err.message,
    });
  }
}