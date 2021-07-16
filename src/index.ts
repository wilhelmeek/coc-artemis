import {
  commands,
  CompleteResult,
  ExtensionContext,
  sources,
  window,
  workspace,
} from 'coc.nvim';

export async function activate(context: ExtensionContext): Promise<void> {
  window.showMessage(`coc-artemis works!`);

  context.subscriptions.push(
    commands.registerCommand('apollo.Command', async () => {
      window.showMessage(`apollo Commands works!`);
    }),

    sources.createSource({
      name: 'apollo completion source', // unique id
      doComplete: async () => {
        const items = await getCompletionItems();
        return items;
      },
    }),

    workspace.registerKeymap(
      ['n'],
      'apollo-keymap',
      async () => {
        window.showMessage(`registerKeymap`);
      },
      { sync: false }
    ),

    workspace.registerAutocmd({
      event: 'InsertLeave',
      request: true,
      callback: () => {
        window.showMessage(`registerAutocmd on InsertLeave`);
      },
    })
  );
}

async function getCompletionItems(): Promise<CompleteResult> {
  return {
    items: [
      {
        word: 'TestCompletionItem 1',
        menu: '[coc-artemis]',
      },
      {
        word: 'TestCompletionItem 2',
        menu: '[coc-artemis]',
      },
    ],
  };
}
