# Pro Ticket Bot

Base profissional para Discord com:

- 🎫 Tickets por departamento
- 🤖 IA configurável dentro dos tickets
- 👤 Assumir ticket: pausa a IA
- ➕ Adicionar membro ao ticket
- ⭐ Avaliação de atendimento
- 🔒 Fechamento e transcript
- 🛒 Estrutura inicial para vendas
- 🛡️ Anti-spam, anti-raid e anti-nuke básicos
- 📋 Logs
- ⚙️ Configuração por `.env`

## Instalação

1. Instale Node.js 20+.
2. Execute `npm install`.
3. Copie `.env.example` para `.env`.
4. Preencha `DISCORD_TOKEN`, `CLIENT_ID` e `GUILD_ID`.
5. Execute `npm start`.

## IA

A integração de IA está preparada em `src/ai.js`. Configure `OPENAI_API_KEY` e `AI_MODEL` para ativá-la. Sem chave, o bot continua funcionando e informa que a IA não está configurada.

## Segurança

O módulo de segurança mantém estado em memória para o protótipo. Para produção multi-servidor, recomenda-se PostgreSQL/Redis e persistência de configurações.

## Importante

Este é um starter funcional e extensível, não uma solução pronta para produção de grande escala. Revise permissões, limites, armazenamento e políticas do seu servidor antes de colocar em produção.
