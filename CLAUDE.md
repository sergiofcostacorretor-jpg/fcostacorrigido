# FCosta Corretor de Imóveis — guia do projeto

Site estático (HTML/CSS/JS puro) publicado no Netlify em **fcostacorretor.com**.
Cada envio para a branch `main` no GitHub publica automaticamente.
Os dados dos imóveis vêm do Firebase Realtime Database. As fotos ficam no **Cloudinary**; o Supabase está desativado e não deve ser usado para novas fotos.
Responder e escrever textos sempre em **português do Brasil**.

## Identidade visual: tema "Preto & Ouro"

Toda página nova ou alterada deve seguir este padrão.

### Cores
| Uso | Cor |
|---|---|
| Fundo principal (preto tinta) | `#0A0B0F` |
| Superfícies / cartões | `#111218` · `#16171D` |
| Bordas | `#2C2D35` ou `rgba(255,255,255,.08)` |
| Ouro principal | `#D6B266` |
| Ouro claro | `#F2DCA4` |
| Ouro escuro | `#A78340` |
| Ouro profundo (fundos de destaque) | `#7A5F2C` |
| Marfim (seções claras) | `#F6F1E7` |
| Texto sobre o escuro | `#F4F1EA` (secundário `#8A877F`) |
| WhatsApp (só o ícone/selo) | `#25D366` |

Degradê dourado (botões, preços, destaques):
```css
linear-gradient(135deg,#F2DCA4 0%,#D6B266 45%,#A78340 100%)
```
Texto sobre botão dourado: sempre `#0A0B0F`.

**Não usar**: o amarelo antigo `#FFD400`/`#FFE24D`, azul-marinho (`#003da5`, `#0D2B45`…) nem a fonte Anton/Bebas Neue.

### Tipografia
- Títulos: **Fraunces** (serifada), peso 600, sem caixa alta forçada, `letter-spacing:-.3px`.
- Texto: **Inter**, 400–700.
- Google Fonts:
  `https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@400;500;600;700&display=swap`
- Destaque de palavra em título: mesma fonte, cor ouro ou degradê (ex.: "Alugar na **Zona Leste**").

### Componentes
- **Topo**: vidro escuro `rgba(10,11,15,.8)` + `backdrop-filter:blur(16px)` + filete inferior `rgba(214,178,102,.18)`.
- **Botões principais**: degradê dourado, formato pílula (`border-radius:999px`), sombra `0 8px 22px rgba(214,178,102,.22)`, sobe 1px no hover.
- **Botões secundários**: fundo transparente, borda `rgba(214,178,102,.35)`, pílula.
- **Cartões**: cantos de 16–18px, fundo `#111218`, no hover sobem 3px e ganham contorno dourado.
- **Preços**: Fraunces 600 com o degradê dourado aplicado ao texto.
- **Abertura (hero)**: fundo `#0A0B0F` com brilho radial dourado suave (`rgba(214,178,102,.2)`).
- **Selos/etiquetas**: pílula com borda dourada fina.
- **Barra de rolagem**: trilho `#0A0B0F`, alça `#2C2D35` (hover `#A78340`).
- Respeitar `prefers-reduced-motion`.

### Arquivos de referência
- `tema-ouro.css`: camada compartilhada; incluir `<link rel="stylesheet" href="/tema-ouro.css"/>` antes de `</head>` em páginas públicas novas.
- `index.html`: referência completa do tema (variáveis `--ink`, `--gold`, `--goldg`, `--serif`, `--sans`…).
- `painel_adm.html`: painel com o mesmo tema; a função `estatico()` gera as páginas `comprar-*/` e `lancamento-*/` no padrão escuro/dourado.

## Regras de trabalho
- Celular primeiro: nenhuma página pode ter rolagem horizontal em 375px.
- Ferramentas internas e geradores de documento (PIX, contratos, PTAM, laudo, financeiro, agenda, agente, lucro) mantêm o visual próprio por causa da impressão/PDF; não aplicar o tema nelas sem pedir.
- Nunca colocar senhas ou chaves no código.
