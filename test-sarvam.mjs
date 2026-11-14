import "dotenv/config";
import { SarvamAIClient } from "sarvamai";

const key = process.env.SARVAM_API_KEY;
if (!key) {
  console.error("❌ SARVAM_API_KEY is not set in .env");
  process.exit(1);
}

const client = new SarvamAIClient({ apiSubscriptionKey: key });

const response = await client.chat.completions({
  model: "sarvam-105b-conversations",
  messages: [
    { role: "system", content: "You are a helpful assistant for Indian merchants." },
    { role: "user", content: "I run a chai stall in Hyderabad. What should I name it?" },
  ],
});

console.log("✅ Sarvam API response:");
console.log(response.choices?.[0]?.message?.content ?? JSON.stringify(response, null, 2));
