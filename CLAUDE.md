# FCosta Corretor de Imóveis — guia do projeto

Site estático (HTML/CSS/JS puro) publicado no Netlify em **fcostacorretor.com**.
Cada envio para a branch `main` no GitHub publica automaticamente.
Os dados dos imóveis vêm do Firebase Realtime Database. As fotos ficam no **Cloudinary**; o Supabase está desativado e não deve ser usado para novas fotos.
Responder e escrever textos sempre em **português do Brasil**.

## Identidade visual: "Preto e Champanhe" (portal de luxo, desde 22/11/2026)

Escolhida pelo Sérgio em 22/11/2026. Toda página pública nova ou alterada deve seguir este padrão.
O visual vem de camadas CSS carregadas por último (só aparência, sem mexer na lógica).

### Cores
| Uso | Cor |
|---|---|
| Fundo | `#0C0C0C` (superfícies `#141412`, `#121211`) |
| Champanhe (destaque) | `#C9A96E` · claro `#E3CFA4` / `#E8D3A2` |
| Texto | `#EDE8DF` (secundário `#A39D91`) |
| Bordas | `rgba(237,232,223,.10)` |
| Caixa de busca e selos sobre foto | branco `#fff` com texto `#0C0C0C` |
| WhatsApp | `#25D366` |

### Tipografia (escolha dele: opção 2)
- Títulos e preços: **Playfair Display** 600, `letter-spacing:-.005em`, números alinhados (`lining-nums`).
- Texto: **Inter** 400–700.
- Não usar letra fina/espaçada (Cormorant) nem caixa alta espaçada: ele rejeitou.

### Padrão de layout (inspirado em Zillow/Compass, sem copiar marca)
- Abertura com camada escura forte sobre foto/vídeo, texto branco com sombra, busca grande branca com abas.
- Cartões: foto grande (4:3), preço em destaque, "3 quartos | 2 banheiros | 2 vagas" numa linha, cantos de 14px.
- Página do imóvel: no celular a foto vem primeiro e ocupa a largura toda; no computador, mosaico (1 grande + 4).
- Setas das fotos com 60px; deslizar com o dedo nas listas (`toque-fotos.js`).
- Ícones: traço fino dourado (`icones.js` troca emojis por SVG). Não usar emojis como ícone.
- Botões com cantos suaves (10px), texto normal (sem caixa alta).
- Celular primeiro; respeitar `prefers-reduced-motion`.

### Arquivos
- `estilo-noir.css` + `estilo-portal.css`: página inicial.
- `estilo-noir-paginas.css` + `estilo-portal-paginas.css`: Comprar, Alugar, Lançamentos, `imovel.html` e páginas geradas `comprar-*/` e `lancamento-*/`.
- `estilo-noir-geral.css`: demais páginas públicas (financiamento, legislação, blog, galeria etc.) + botão fixo "Início" (`.fc-home`).
- `icones.js` e `toque-fotos.js`: ícones e deslizar.
- `painel_adm.html`: a função `estatico()` já inclui esses arquivos nas páginas que gera.
- Ao mudar um CSS, aumentar o `?v=` nos links para limpar o cache.
- Cuidado: arquivos HTML usam CRLF; ao editar por script, preservar as quebras de linha. Em comentário CSS nunca escrever `*/` dentro do texto.
- `tema-ouro.css` (tema antigo Preto & Ouro) continua carregado por baixo; as camadas novas vêm depois.

## Regras de trabalho
- Celular primeiro: nenhuma página pode ter rolagem horizontal em 375px.
- Ferramentas internas e geradores de documento (PIX, contratos, PTAM, laudo, financeiro, agenda, agente, lucro) mantêm o visual próprio por causa da impressão/PDF; não aplicar o tema nelas sem pedir.
- Nunca colocar senhas ou chaves no código.
