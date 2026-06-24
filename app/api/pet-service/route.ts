import { auth0 } from "@/lib/auth0";

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();

    const addSubscriptionKey = process.env.APIM_ADD_MEMBER_SUBSCRIPTION_KEY;
    const serviceUpdateSubscriptionKey =
      process.env.APIM_PET_SERVICE_UPDATE_SUBSCRIPTION_KEY;

    const addMemberUrl = process.env.ADD_MEMBER_AND_PET_URL;
    const serviceUpdateUrl = process.env.PET_SERVICE_UPDATE_URL;

    let url = "";
    let subscriptionKey = "";

    if (action === "addMemberAndPet") {
      url = addMemberUrl ?? "";
      subscriptionKey = addSubscriptionKey ?? "";
    }

    if (
      action === "addSubsequentPet" ||
      action === "removePet" ||
      action === "cancelService" ||
      action === "reactivateService"
    ) {
      url = serviceUpdateUrl ?? "";
      subscriptionKey = serviceUpdateSubscriptionKey ?? "";
    }

    if (!url || !subscriptionKey) {
      return Response.json(
        { success: false, message: "Missing API URL or subscription key." },
        { status: 500 }
      );
    }

    if (!payload) {
      return Response.json(
        { success: false, message: "Missing request payload." },
        { status: 400 }
      );
    }

    const apiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
      body: JSON.stringify(payload),
    });

    const text = await apiResponse.text();

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    const cancelServiceApiSucceeded = apiResponse.ok;

    if (action === "cancelService" && cancelServiceApiSucceeded) {
      const session = await auth0.getSession();

      if (!session?.user?.sub) {
        return Response.json(
          {
            success: false,
            message: "Service was canceled, but no Auth0 session was found.",
          },
          { status: 401 }
        );
      }

      const auth0UserId = session.user.sub;

      const tokenRes = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: process.env.AUTH0_MGMT_CLIENT_ID,
            client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
            audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
            grant_type: "client_credentials",
          }),
        }
      );

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.access_token) {
        return Response.json(
          {
            success: false,
            message:
              "Service was canceled, but Auth0 Management token could not be created.",
            auth0TokenError: tokenData,
          },
          { status: 500 }
        );
      }

      const managementToken = tokenData.access_token;

      const deleteRes = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(
          auth0UserId
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${managementToken}`,
          },
        }
      );

      if (!deleteRes.ok) {
        const deleteText = await deleteRes.text();

        return Response.json(
          {
            success: false,
            message:
              "Service was canceled, but Auth0 user could not be deleted.",
            auth0DeleteError: deleteText,
          },
          { status: 500 }
        );
      }
    }

    return Response.json(
      {
        success: apiResponse.ok,
        status: apiResponse.status,
        sentBody: payload,
        response: data,
      },
      { status: apiResponse.status }
    );
  } catch (err) {
    return Response.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}