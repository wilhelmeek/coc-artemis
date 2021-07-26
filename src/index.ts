import { join } from 'path';
import { ApolloConfig } from 'apollo-language-server';
import {
  ExtensionContext,
  services,
  LanguageClient,
  TransportKind,
  window,
  workspace,
  ServerOptions,
  LanguageClientOptions,
} from 'coc.nvim';

const { version } = require('../package.json');

const artemis = 'coc-artemis';

function decorate(m: string): string {
  return `[${artemis}] ${m}`;
}

type Config = Partial<{
  enabled: boolean;
}>;

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration().get<Config>(artemis, {});
  if (!config.enabled) {
    return;
  }

  const serverModule = context.asAbsolutePath(
    join('node_modules/apollo-language-server/lib', 'server.js')
  );

  const env = {
    APOLLO_CLIENT_NAME: artemis,
    APOLLO_CLIENT_VERSION: version,
    APOLLO_CLIENT_REFERENCE_ID: version,
    NODE_TLS_REJECT_UNAUTHORIZED: 0,
  };

  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { env },
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { env, execArgv: ['--nolazy', '--inspect=6009'] },
    },
  };

  const outputChannel = window.createOutputChannel(artemis);

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      'graphql',
      'javascript',
      'typescript',
      'javascriptreact',
      'typescriptreact',
      'vue',
      'python',
      'ruby',
      'dart',
      'reason',
      'elixir',
    ],
    synchronize: {
      fileEvents: [
        workspace.createFileSystemWatcher('**/.env?(.local)'),
        workspace.createFileSystemWatcher(
          '**/*.{graphql,js,ts,jsx,tsx,vue,py,rb,dart,re,ex,exs}'
        ),
      ],
    },
    outputChannel,
  };

  const client = new LanguageClient(
    artemis,
    artemis,
    serverOptions,
    clientOptions
  );

  client.onReady().then(() => {
    client.onNotification('apollographql/configFilesFound', (resp: string) => {
      const configs: Array<ApolloConfig> = JSON.parse(resp);

      const schemaNames = new Array<string>();
      configs.forEach((c) => {
        if (typeof c.client?.service === 'string') {
          schemaNames.push(c.client.service);
        } else if (typeof c.client?.service?.name === 'string') {
          schemaNames.push(c.client.service.name);
        }
      });

      if (schemaNames.length > 0) {
        const joined = schemaNames.join(', ');
        window.showMessage(decorate(`found schemas [${joined}]`));
      } else {
        window.showWarningMessage(decorate('no schemas found'));
      }
    });
  });

  services.registLanguageClient(client);
}
