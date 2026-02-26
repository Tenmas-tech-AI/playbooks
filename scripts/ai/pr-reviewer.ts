import "dotenv/config";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const llm = new ChatAnthropic({
  model: "claude-haiku-4-5-20251001",
  temperature: 0,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Eres un code reviewer técnico. Analiza el diff de PR y responde en español con:
1. Resumen de cambios (2-3 líneas)
2. Riesgos detectados (si los hay)
3. Sugerencia de mejora más importante (solo una)

Sé directo y conciso.`,
  ],
  ["human", "Diff del PR:\n\n{diff}"],
]);

const chain = prompt.pipe(llm).pipe(new StringOutputParser());

async function reviewPR(diff: string): Promise<string> {
  return chain.invoke({ diff });
}

// Diff de prueba — SQL injection intencional para verificar que el agent lo detecta
const testDiff = `
+++ b/src/auth/login.ts
@@ -10,6 +10,12 @@ export async function login(email: string, password: string) {
+  const user = await db.query('SELECT * FROM users WHERE email = ' + email);
+  if (!user) throw new Error('User not found');
+  return generateToken(user);
`;

console.log("Analizando diff con LangChain + Claude...\n");

reviewPR(testDiff)
  .then((result) => {
    console.log(result);
    console.log("\n✅ LangChain + Anthropic funcionando correctamente");
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
