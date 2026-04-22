export async function POST(req) {

  const body = await req.json();

  const response = await fetch(process.env.AZURE_API_URL_SUBMIT_MED_REQUEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": process.env.AZURE_API_KEY_SUBMIT_MED_REQUEST
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  return Response.json(data);
}