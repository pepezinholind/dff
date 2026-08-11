require("dotenv").config();

module.exports = {
  token: process.env.TOKEN,
  guildId: process.env.GUILD_ID,
  staffRoleId: process.env.STAFF_ROLE_ID,
  ticketCategoryId: process.env.TICKET_CATEGORY_ID,
  ticketPanelChannelId: process.env.TICKET_PANEL_CHANNEL_ID,
  logChannelId: process.env.LOG_CHANNEL_ID,
  ratingChannelId: process.env.RATING_CHANNEL_ID,
  serverPanelChannelId: process.env.SERVER_PANEL_CHANNEL_ID,
  serverStatusChannelId: process.env.SERVER_STATUS_CHANNEL_ID,
  announcementChannelId: process.env.ANNOUNCEMENT_CHANNEL_ID,
  eventChannelId: process.env.EVENT_CHANNEL_ID,
  reportChannelId: process.env.REPORT_CHANNEL_ID,
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID,
  autoRoleId: process.env.AUTO_ROLE_ID,
  maxOpenTickets: Number(process.env.MAX_OPEN_TICKETS || 2),
  colors: {
    primary: 0x5865F2,
    success: 0x57F287,
    danger: 0xED4245,
    warning: 0xFEE75C,
    info: 0x3498DB,
    purple: 0x9B59B6,
    dark: 0x111318
  },
  categories: {
    suporte: ["🧰", "Suporte", "Ajuda, dúvidas e problemas técnicos."],
    compras: ["🛒", "Compras", "Pedidos, pagamentos e produtos."],
    denuncia: ["🚨", "Denúncia", "Reporte uma situação para análise da equipe."],
    parceria: ["🤝", "Parceria", "Propostas e colaborações."],
    vip: ["💎", "VIP", "Benefícios, VIP e assuntos especiais."]
  }
};