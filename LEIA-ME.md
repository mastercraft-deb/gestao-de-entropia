# Gestão de Conteúdo – Instagram

Sistema de demandas para Colégio Português, Colégio Paraíso e Faculdade Lusófona. Os dados ficam no Supabase (projeto `gestao-conteudo-ig`).

## Arquivos
- `index.html`: o sistema inteiro (telas, login e ligação com o Supabase). Os logos já vão embutidos.
- `hark.js`, `hark.css`, `hark-charts.css`: estilos e componentes que o index.html usa. Mantenha-os na mesma pasta.
- `fac-favicon.png`: ícone.
- `.nojekyll`: faz o GitHub Pages servir os arquivos sem alterá-los.
- `supabase/configuracao-login.sql`: script que já foi rodado no Supabase (tabela de usuários, permissões e funções). Fica só como referência. Não é preciso rodar de novo. A senha do adm aparece como `<senha>` de propósito.

## Publicar no GitHub Pages
1. Crie um repositório (ex.: `gestao-conteudo`).
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. Vá em Settings → Pages, escolha "Deploy from a branch", branch `main` e pasta `/ (root)`, e salve.
4. Em 1 ou 2 minutos o sistema fica no ar em `https://SEU-USUARIO.github.io/gestao-conteudo/`.

No endereço próprio, o login fica salvo ao atualizar a página e o navegador oferece guardar a senha.

## Segurança
- O `index.html` só leva a chave **publicável** do Supabase, que pode ficar pública. As permissões são controladas pelo banco.
- Nunca coloque a chave `service_role` nem senhas no repositório.
- Se quiser, no Supabase vá em Authentication → URL Configuration e adicione o endereço do GitHub Pages.
