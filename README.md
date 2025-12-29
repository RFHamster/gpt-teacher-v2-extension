# GPT Teacher

Extensão VSCode interativa para gerenciamento de itens com interface visual.

## Funcionalidades

### Primeira Etapa - Concluída

- **Ícone na Sidebar**: A extensão aparece como um ícone na barra lateral do VSCode
- **Lista de Itens**: Ao clicar no ícone, você verá uma lista de itens
- **Página de Detalhes**: Ao clicar em cada item, abre uma página com descrições e informações detalhadas
- **Botão de Refresh**: Atualiza a lista de itens

## Como Usar

1. Abra o VSCode
2. Clique no ícone "GPT Teacher" na barra lateral esquerda (Activity Bar)
3. Você verá uma lista com 3 itens de exemplo
4. Clique em qualquer item para ver sua página de detalhes
5. Use o botão de refresh (ícone de atualização) no topo da lista para atualizar os itens

## Estrutura do Código

- `src/extension.ts`: Ponto de entrada da extensão, registra comandos e views
- `src/ItemsProvider.ts`: Provider da TreeView, gerencia a lista de itens
- `src/ItemWebviewPanel.ts`: Gerencia o painel WebView que mostra os detalhes de cada item
- `resources/icon.svg`: Ícone da extensão na sidebar

## Desenvolvimento

Para testar a extensão:

1. Pressione F5 no VSCode para abrir uma nova janela com a extensão carregada
2. Na nova janela, procure pelo ícone "GPT Teacher" na barra lateral

## Comandos

- `npm run compile`: Compila a extensão
- `npm run watch`: Compila automaticamente ao detectar mudanças
- `npm run lint`: Executa o linter
- `npm test`: Executa os testes

## Próximos Passos

- Adicionar mais funcionalidades aos itens
- Permitir adicionar/remover itens dinamicamente
- Personalizar o conteúdo das páginas de detalhes
