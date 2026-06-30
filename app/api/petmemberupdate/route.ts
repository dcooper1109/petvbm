// app/api/petmemberupdate/route.ts

import { NextResponse } from "next/server";

function parsePossibleJson(value: any) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const url = process.env.AUCTION_PET_MEMBER_UPDATE;
    const subscriptionKey = process.env.AUCTION_PET_MEMBER_UPDATE_KEY;

    if (!url || !subscriptionKey) {
      return NextResponse.json(
        {
          success: false,
          message: "PetMemberUpdate API is not configured.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    let result: any = parsePossibleJson(responseText);

    if (result?.body) {
      result = {
        ...result,
        body: parsePossibleJson(result.body),
      };
    }

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch (error: any) {
    console.error("PetMemberUpdate route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}
