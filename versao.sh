#!/bin/sh
# Gera versao-dados.js a cada publicacao no Netlify (numero = total de envios no GitHub)
n=$(git rev-list --count HEAD 2>/dev/null)
if [ "$(git rev-parse --is-shallow-repository 2>/dev/null)" = "true" ] || [ -z "$n" ]; then
  n=$(TZ=America/Sao_Paulo date +%y%m%d.%H%M)
fi
d=$(TZ=America/Sao_Paulo date +%d/%m/%Y)
echo "window.FC_VERSAO={n:'$n',d:'$d'};" > versao-dados.js
echo "Versao $n ($d)"
