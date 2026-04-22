export async function GET() {
  try {
    const response = await fetch(process.env.MEDS_JSON_URL!, {
      method: "GET",
      cache: "no-store",
    });

    const text = await response.text();

    if (!response.ok) {
      return Response.json(
        { meds: [], message: `Failed to load meds file: ${response.status}`, raw: text.slice(0, 300) },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        { meds: [], message: "meds.json is not valid JSON", raw: text.slice(0, 300) },
        { status: 500 }
      );
    }

    if (Array.isArray(data?.meds)) {
      return Response.json({ meds: data.meds });
    }

    return Response.json(
      { meds: [], message: "Invalid meds.json format" },
      { status: 500 }
    );
  } catch (err) {
    return Response.json(
      { meds: [], message: "Server error: " + err.message },
      { status: 500 }
    );
  }
}