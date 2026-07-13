type HistoryRequest = {
  memberInsID: string;
  sortBy?: "new_dateofaction" | "new_description";
  pageSize?: number;
  pageNumber?: number;
  sortOrder?: "asc" | "desc";
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HistoryRequest;

    const {
      memberInsID,
      sortBy = "new_dateofaction",
      pageSize = 10,
      pageNumber = 1,
      sortOrder = "asc",
    } = body;

    if (!memberInsID?.trim()) {
      return Response.json(
        {
          success: false,
          message: "Member Subscription ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      sortBy !== "new_dateofaction" &&
      sortBy !== "new_description"
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid sort field.",
        },
        { status: 400 }
      );
    }

    if (sortOrder !== "asc" && sortOrder !== "desc") {
      return Response.json(
        {
          success: false,
          message: "Invalid sort order.",
        },
        { status: 400 }
      );
    }

    const historyUrl = process.env.GET_HISTORY_URL;
    const subscriptionKey =
      process.env.GET_HISTORY_SUBSCRIPTION_KEY;

    if (!historyUrl || !subscriptionKey) {
      return Response.json(
        {
          success: false,
          message:
            "Get History API configuration is missing.",
        },
        { status: 500 }
      );
    }

    const apiResponse = await fetch(historyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
      body: JSON.stringify({
        memberInsID: memberInsID.trim(),
        sortBy,
        pageSize,
        pageNumber,
        sortOrder,
      }),
      cache: "no-store",
    });

    const responseText = await apiResponse.text();

    let responseData: unknown;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!apiResponse.ok) {
      console.error("Get History API error:", {
        status: apiResponse.status,
        response: responseData,
      });

      return Response.json(
        {
          success: false,
          message: "Unable to retrieve history.",
          response: responseData,
        },
        { status: apiResponse.status }
      );
    }

    return Response.json(responseData, {
      status: 200,
    });
  } catch (error) {
    console.error("Get History route error:", error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown server error.",
      },
      { status: 500 }
    );
  }
}