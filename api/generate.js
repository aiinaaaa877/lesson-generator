// Эта функция работает на сервере, не в браузере пользователя.
// Она единственная, кто знает секретный ключ Groq — сайт его не видит.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не поддерживается" });
  }

  try {
    const { prompt, maxTokens, model } = req.body;
    const safeMaxTokens = Math.max(500, Math.min(8000, Number(maxTokens) || 4000));
    const safeModel = model === "quality" ? "openai/gpt-oss-120b" : "openai/gpt-oss-20b";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: safeModel,
        max_tokens: safeMaxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data, status: response.status });
    }

    // Приводим ответ к простому виду: { text: "..." }
    const text = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
