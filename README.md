# Pro Discord Support Suite

Bot profissional para Discord com:

- 🎫 Tickets com painel, categorias e botões
- 🔨 Assumir ticket: ao assumir, a IA para automaticamente
- 🤖 IA de suporte dentro dos tickets
- 👥 Adicionar/remover membros do ticket
- ⭐ Avaliação de atendimento
- 📄 Transcript em HTML
- 🛒 Sistema de vendas com catálogo, carrinho e pedidos
- 🎟️ Cupons
- 📦 Estoque
- 🛡️ Anti-raid e segurança
- 🔐 Lockdown
- 📋 Logs e auditoria
- ⚙️ Configuração por servidor
- 🌐 Estrutura pronta para dashboard

## Instalação

1. Instale Node.js 20+.
2. Crie uma aplicação/bot no Discord Developer Portal.
3. Ative `Server Members Intent` e `Message Content Intent`.
4. Copie `.env.example` para `.env` e preencha os valores.
5. Crie um PostgreSQL e coloque `DATABASE_URL`.
6. Rode:

```bash
npm install
npm run deploy
npm start
```

## Permissões recomendadas

O bot precisa, conforme os módulos utilizados:

- Manage Channels
- Manage Roles
- Manage Messages
- View Audit Log
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Add Reactions
- Manage Webhooks (somente se o seu fluxo precisar)

Não dê Administrator por padrão.

## Comandos principais

- `/setup tickets`
- `/setup vendas`
- `/setup seguranca`
- `/ticket painel`
- `/ticket assumir`
- `/ticket fechar`
- `/ticket adicionar`
- `/ticket remover`
- `/ticket ia`
- `/ticket avaliar`
- `/produto criar`
- `/produto listar`
- `/produto estoque`
- `/pedido consultar`
- `/cupom criar`
- `/security status`
- `/security lockdown`

## IA

A IA só responde em canais de ticket que estejam com `ai_enabled = true`.
Quando um staff usa `/ticket assumir`, o bot muda `ai_enabled` para `false`.

Para produção, coloque limites de custo/rate limit e uma base de conhecimento própria.

## Pagamentos

O módulo de vendas deste projeto cria catálogo, carrinho, pedidos e checkout interno. Não inclui processamento real de cartão. Para pagamentos reais, conecte um PSP (Stripe, Mercado Pago, PayPal, etc.) no serviço de checkout e valide webhooks no backend.

## Segurança

O Anti-Raid usa heurísticas locais: velocidade de entrada, spam, menções e ações administrativas suspeitas. Ele é uma camada de proteção, não substitui as configurações de segurança do próprio Discord.


## Créditos
**Bot feito por V4** ⚡
