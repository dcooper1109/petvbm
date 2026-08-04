import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedSubjects = new Set([
  "Account Question",
  "Billing Question",
  "Medication Request Question",
  "Other",
]);

function getApiMessage(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    const message =
      objectValue.message || objectValue.error || objectValue.results;

    if (typeof message === "string") return message;

    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return String(value);
}

export async function POST(request: Request) {
  try {
    const sendEmailApiUrl = process.env.SEND_EMAIL_API_URL;
    const sendEmailApiKey = process.env.SEND_EMAIL_API_KEY;

    if (!sendEmailApiUrl) {
      console.error("SEND_EMAIL_API_URL is not configured.");

      return NextResponse.json(
        {
          success: false,
          message: "The email API URL is not configured.",
        },
        { status: 500 }
      );
    }

    if (!sendEmailApiKey) {
      console.error("SEND_EMAIL_API_KEY is not configured.");

      return NextResponse.json(
        {
          success: false,
          message: "The email API key is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const memberLast =
      typeof body?.memberLast === "string" ? body.memberLast.trim() : "";
    const subject =
      typeof body?.subject === "string" ? body.subject.trim() : "";
    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : "";
    const memberInsID =
      typeof body?.memberInsID === "string"
        ? body.memberInsID.trim()
        : "";

    if (!memberLast || !subject || !description || !memberInsID) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Member last name, subject, description, and Subscription ID are required.",
        },
        { status: 400 }
      );
    }

    if (!allowedSubjects.has(subject)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid subject.",
        },
        { status: 400 }
      );
    }

    if (description.length > 5500) {
      return NextResponse.json(
        {
          success: false,
          message: "The description is too long.",
        },
        { status: 400 }
      );
    }

    const apiResponse = await fetch(sendEmailApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": sendEmailApiKey,
      },
      body: JSON.stringify({
        memberLast,
        subject,
        description,
        memberInsID,
      }),
      cache: "no-store",
    });

    const responseText = await apiResponse.text();
    let responseData: unknown = null;

    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }
    }

    if (!apiResponse.ok) {
      console.error("Send email APIM error:", {
        status: apiResponse.status,
        response: responseData,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            getApiMessage(responseData) ||
            `The email API returned status ${apiResponse.status}.`,
        },
        { status: apiResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        getApiMessage(responseData) || "Your message was sent successfully.",
      results: responseData,
    });
  } catch (error) {
    console.error("Send email route error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to send the message.",
      },
      { status: 500 }
    );
  }
}