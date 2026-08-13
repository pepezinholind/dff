require("dotenv").config();

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variável ${name} não configurada.`);
  return value;
}

module.exports = {
  token: required("DISCORD_TOKEN"),
  clientId: required("CLIENT_ID"),
  guildId: required("GUILD_ID"),
  openaiKey: process.env.OPENAI_API_KEY?.trim() || "",
  openaiModel: process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
  aiEnabled: process.env.AI_ENABLED !== "false",
  supportRoleId: process.env.SUPPORT_ROLE_ID?.trim() || "",
  salesRoleId: process.env.SALES_ROLE_ID?.trim() || "",
  ticketCategoryId: process.env.TICKET_CATEGORY_ID?.trim() || "",
  salesCategoryId: process.env.SALES_CATEGORY_ID?.trim() || "",
  logChannelId: process.env.LOG_CHANNEL_ID?.trim() || "",
  securityLogChannelId: process.env.SECURITY_LOG_CHANNEL_ID?.trim() || "",
  port: Number(process.env.PORT || 3000)
};
