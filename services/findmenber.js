export async function POST(req) {

  const body = await req.json();

  const response = await fetch("https://exouzamaxapis.azure-api.net/petmemberid", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": process.env.APIM_KEY_1
    },
    body: JSON.stringify({
      memberLast: body.lastName,
      memberInsID: body.policyId
    })
  });

  const data = await response.json();

  return Response.json(data);
}