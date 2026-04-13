import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock exchange rates (MNT to target)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1 / 3400,
  KRW: 0.38,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  KRW: "₩",
  MNT: "₮",
};

export async function POST(req: Request) {
  try {
    const { fromLocale, toLocale, toCurrency, snapshot } = await req.json();

    if (!snapshot || !snapshot.texts || !snapshot.prices) {
      return NextResponse.json({ error: "Invalid snapshot" }, { status: 400 });
    }

    // 1. Handle Currency Conversion (Server-side calculation)
    const translatedPrices = snapshot.prices.map((p: any) => {
      const rate = EXCHANGE_RATES[toCurrency] || 1;
      const amount = Math.round(p.amount * rate);
      const symbol = CURRENCY_SYMBOLS[toCurrency] || toCurrency;
      
      let formatted = `${symbol}${amount.toLocaleString()}`;
      if (toCurrency === "USD") formatted = `$${amount}`;
      
      return {
        id: p.id,
        amount,
        currency: toCurrency,
        formatted,
      };
    });

    // 2. Handle Text Translation (OpenAI)
    let translatedTexts = [];
    
    if (toLocale !== fromLocale) {
      const systemPrompt = `You are a high-end cultural travel expert for "GerBook Travel" (malchincamp.mn). 
Your goal is to translate Mongolian tourism content into ${toLocale} with a professional, evocative, and luxurious tone.

CRITICAL INSTRUCTIONS:
1. "Малчны жинхэнэ амьдралыг мэдэрье" is our brand tagline. It should NOT be translated literally. It should mean something like "Experience the authentic nomadic lifestyle" or "Immerse yourself in true nomadic culture".
2. Preservation: Keep the soul of the nomad culture. Use sophisticated vocabulary.
3. Formatting: Return ONLY a JSON object with a single key "texts" which is an array of { id, text }.
4. Completeness: Translate every single item in the provided list. Do not skip any.
5. Names: If an ID looks like a person's name (e.g., host.name), transliterate it naturally into the target script (e.g., Hangul for Korean).`;

      const userPrompt = JSON.stringify(snapshot.texts);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Translate this text array for our travel website. Target language: ${toLocale}. JSON format: { "texts": [...] }. Input: ${userPrompt}` },
        ],
        temperature: 0.2, // Lower temperature for more consistent JSON and terminology
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      translatedTexts = result.texts || [];
    } else {
      translatedTexts = snapshot.texts;
    }

    return NextResponse.json({
      texts: translatedTexts,
      prices: translatedPrices,
    });
  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
