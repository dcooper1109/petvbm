export async function POST(req: Request) {
  try {
    const { lastName, policyId } = await req.json();

    if (!lastName || !policyId) {
      return Response.json(
        { found: false, message: "Missing parameters" },
        { status: 400 }
      );
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
      return Response.json({ found: false, message: "Invalid JSON" });
    }

    if (data?.body && typeof data.body === "object") data = data.body;
    if (data?.body && typeof data.body === "string") {
      try {
        data = JSON.parse(data.body);
      } catch {}
    }

    if (!response.ok) {
      const apiErrorMessages: Record<number, string> = {
        410: "SubscriptionID and Last Name provided are not Valid",
        420: "No pets are associated with this subscriber. Please contact support if this is unexpected.",
        480: "Error retrieving Member Subscription Record. Verify your information and try again.",
      };

      return Response.json(
        {
          found: false,
          message:
            apiErrorMessages[response.status] ||
            data?.message ||
            data?.results ||
            `Lookup API failed with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    if (data?.results) {
      return Response.json({ found: false, message: data.results });
    }

    if (data?.message && !data?.pets && !data?.first) {
      return Response.json({ found: false, message: data.message });
    }

    if (data?.pets && Array.isArray(data.pets)) {
      return Response.json({
        found: true,
        member: data,
      });
    }

    if (data?.petName || data?.first || data?.firstName) {
      return Response.json({
        found: true,
        member: {
          ...data,
          pets: data?.petName ? [data] : [],
        },
      });
    }

    return Response.json({ found: false, message: "Member not found" });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    return Response.json(
      { found: false, message: "Server error: " + message },
      { status: 500 }
    );
  }
}