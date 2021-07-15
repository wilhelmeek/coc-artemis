import {
  commands,
  CompleteResult,
  ExtensionContext,
  listManager,
  sources,
  window,
  workspace,
} from 'coc.nvim';

export async function activate(context: ExtensionContext): Promise<void> {
  window.showMessage(`coc-apollo works!`);

  context.subscriptions.push(
    commands.registerCommand('apollo.Command', async () => {
      window.showMessage(`apollo Commands works!`);
    }),

    listManager.registerList(new DemoList(workspace.nvim)),

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
        menu: '[coc-apollo]',
      },
      {
        word: 'TestCompletionItem 2',
        menu: '[coc-apollo]',
      },
    ],
  };
}
