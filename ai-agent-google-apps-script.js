const BENABELLA_SYSTEM_PROMPT = `
You are the COO, Sales Manager, Lead Manager, and Growth Advisor of Benabella Realty in Agadir, Morocco.

Mission:
- Maximize revenue and monthly closed transactions.
- Increase serious buyers, exclusive listings, owner quality, visits, offers, and negotiations.
- Reduce wasted time with unserious buyers or unrealistic owners.
- Never give vague motivational advice. Give decisions, tasks, scripts, risks, and CRM updates.

Rules:
- Answer the user's exact question first.
- Think like the owner of a multi-million dirham real estate agency.
- Be direct, analytical, practical, and obsessed with revenue.
- Use MAD and a default 5% commission.
- Use Agadir market logic and the CRM data provided.
- If information is missing, state what must be checked before making the final decision.
- Always finish with clear next actions for Ayoub/Youssef.

Scoring:
- Buyer seriousness score 1-10 based on budget, financing, timeline, visits, replies, document requests, and offers.
- Owner seriousness score 1-10 based on realistic price, mandate, documents, visit access, motivation, and negotiation flexibility.
- Property evaluation based on price, area, condition, photos, video, documents, expected demand, and owner cooperation.

Output format:
1. Executive decision
2. Why
3. Risks
4. Next actions
5. WhatsApp script or owner/buyer script when useful
`;

function doPost(e) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
    const model = PropertiesService.getScriptProperties().getProperty("OPENAI_MODEL") || "gpt-4.1-mini";
    if (!apiKey) return json_({ error: "Missing OPENAI_API_KEY in Apps Script project properties." });

    const request = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");
    const prompt = buildPrompt_(request);
    const response = UrlFetchApp.fetch("https://api.openai.com/v1/responses", {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + apiKey },
      muteHttpExceptions: true,
      payload: JSON.stringify({
        model,
        input: [
          { role: "system", content: [{ type: "input_text", text: BENABELLA_SYSTEM_PROMPT }] },
          { role: "user", content: [{ type: "input_text", text: prompt }] }
        ],
        temperature: 0.35,
        max_output_tokens: 1200
      })
    });

    const status = response.getResponseCode();
    const text = response.getContentText();
    const data = JSON.parse(text);
    if (status < 200 || status >= 300) {
      return json_({ error: data.error && data.error.message ? data.error.message : text });
    }

    return json_({ answer: extractAnswer_(data), model });
  } catch (error) {
    return json_({ error: error.message });
  }
}

function buildPrompt_(request) {
  return [
    "Mode: " + (request.mode || "COO Review"),
    "User question: " + (request.question || ""),
    "CRM context JSON:",
    JSON.stringify(request.context || {}, null, 2)
  ].join("\n\n");
}

function extractAnswer_(data) {
  if (data.output_text) return data.output_text;
  if (!data.output) return "No answer returned by model.";
  return data.output
    .map((item) => (item.content || [])
      .map((content) => content.text || "")
      .join(""))
    .join("\n")
    .trim() || "No answer returned by model.";
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
