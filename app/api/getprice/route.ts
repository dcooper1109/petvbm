import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const partnerName = requestBody?.partnerName?.trim();

    if (!partnerName) {
      return NextResponse.json(
        {
          success: false,
          message: "Partner Name is required.",
        },
        { status: 400 }
      );
    }

    const getPriceUrl = process.env.GET_PRICE_URL;
    const getPriceKey = process.env.GET_PRICE_SUBSCRIPTION_KEY;

    if (!getPriceUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "GET_PRICE_URL is not configured.",
        },
        { status: 500 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (getPriceKey) {
      headers["Ocp-Apim-Subscription-Key"] = getPriceKey;
    }

    const apiResponse = await fetch(getPriceUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        partnerName,
      }),
      cache: "no-store",
    });

    const responseText = await apiResponse.text();

    let apiData: any;

    try {
      apiData = JSON.parse(responseText);
    } catch {
      apiData = responseText;
    }

    let responseBody =
      apiData && typeof apiData === "object"
        ? apiData.body ?? apiData
        : apiData;

    if (typeof responseBody === "string") {
      try {
        responseBody = JSON.parse(responseBody);
      } catch {
        // Keep plain-text responses unchanged.
      }
    }

    const subscriptionOptions =
      responseBody?.subscriptionOptions;

    if (
      !apiResponse.ok ||
      !Array.isArray(subscriptionOptions)
    ) {
      const errorMessage =
        responseBody?.results ||
        responseBody?.message ||
        apiData?.results ||
        apiData?.message ||
        (typeof responseBody === "string"
          ? responseBody
          : "") ||
        "Unable to retrieve subscription pricing.";

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          response: apiData,
        },
        {
          status: apiResponse.ok
            ? 500
            : apiResponse.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
      subscriptionOptions,
    });
  } catch (error) {
    console.error("Get price route error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error retrieving subscription pricing.",
      },
      { status: 500 }
    );
  }
}