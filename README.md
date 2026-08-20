# Link Net Fibra — Sistema de Sorteio

Site estático, responsivo e pronto para publicar no GitHub Pages.

## Como usar
1. Abra `index.html` no navegador para testar.
2. Importe participantes em `.txt`, `.xlsx` ou `.xls`.
3. Também é possível adicionar nomes manualmente.
4. Clique em **Realizar sorteio**.
5. Use **Configurar** para editar título, prêmio e descrição.

## Publicar no GitHub Pages
1. Crie um novo repositório no GitHub.
2. Envie todos os arquivos mantendo a estrutura de pastas.
3. No repositório, abra **Settings > Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/ (root)`.
6. Salve e aguarde a publicação.

## Estrutura
- `index.html`
- `style.css`
- `script.js`
- `assets/`
  - Logos originais fornecidas
  - Banner promocional

A importação de Excel utiliza a biblioteca SheetJS por CDN, então a página precisa de conexão com a internet para ler `.xlsx` e `.xls`.
