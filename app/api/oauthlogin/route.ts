import { NextResponse } from "next/server";
import { auth0 } from "../../../lib/auth0";

export async function POST() {
  try {
    const session = await auth0.getSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { authorized: false, petvbmAccess: false, message: "Not logged in" },
        { status: 401 }
      );
    }

    const response = await fetch(process.env.APIM_OAUTH_LOGIN_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key":
          process.env.APIM_OAUTH_LOGIN_KEY || "",
      },
      body: JSON.stringify({
        userID: session.user.email,
        oauthSub: session.user.sub,
      }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        authorized: false,
        petvbmAccess: false,
        message: error instanceof Error ? error.message : "OAuth access check failed",
      },
      { status: 500 }
    );
  }
}