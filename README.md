# Whatsapp Bot

Whatsapp bot for community and group management.

## Environment Variables

We validate the environment variables using `zod`. Get the schema from `src/env.ts`. See the example at `env.example`.

| Variable           | Required | Default                        | Description                                                          |
| ------------------ | -------- | ------------------------------ | -------------------------------------------------------------------- |
| ADMIN_PHONE_NUMBER | Yes      |                                | The phone number of the admin in E.164 format.                       |
| LANGUAGE           | No       | en                             | Specify the language for the templates, e.g., en, he.                |
| COMMAND_PREFIX     | No       | !                              | The prefix for triggering the commands, e.g., !, /, .                |
| LOG_FILE           | No       | ./logs/bot.log                 | The file to log the bot's activity.                                  |
| LOG_LEVEL          | No       | info                           | The log level: `error`, `warn`, `info`, `verbose`, `debug`, `silly`. |
| SESSION_PATH       | No       | ./session                      | The path to store the session data.                                  |
| CMD_TIMEOUT        | No       | `30s`                          | Timeout for the command to be dispatched (avoid stale commands).     |
| DATABASE_URL       | No       | `file:../data/database.sqlite` | The URL of the database to use, in SQLite file path format.          |

## Commands Available

| Command  | Description                          | Parameters               |
| -------- | ------------------------------------ | ------------------------ |
| welcome  | Welcome a new user joining the group |                          |
| poll     | Create a poll in the group           | `question`, ...`options` |
| ping     | Ping the bot to check if it's alive  |                          |

## Templates Guide

The templates are placed in the `templates` folder. Each subfolder is the language code, e.g., `en` for English, `he` for Hebrew. The templates' names should be the same as the command name in kebab case, e.g., `say-hi.md` for the `SayHi` command.

Generate a command with templates using the command:

```bash
npm run generate:command <command-name>
```

**Important**:

- The templates follow the Whatsapp Markdown format. See the [Whatsapp documentation](https://faq.whatsapp.com/539178204879377/?cms_platform=web&helpref=platform_switcher&locale=en_US) for more information.
- Use the ICU templating format for variables and pluralization. See the [ICU documentation](https://messageformat.github.io/messageformat/guide/) for more information.

## Commands Guide

Each command class must be placed in the `src/commands` folder. The command class should extend the `CommandBase` class and have templates in each language of the `templates` folders.

### Command Configuration

| Property     | Default | Description                                                                                      |
| ------------ | ------- | ------------------------------------------------------------------------------------------------ |
| name         |         | The name of the command, used to trigger the command.                                            |
| aliases      | [name]  | The aliases of the command, used to trigger the command.                                         |
| description  |         | The description of the command, used in the help command.                                        |
| access       | staff   | The minimum access level required to use the command. Possible values: `admin`, `staff`, `user`. |
| templateName | `name`  | The name of the template file in the `templates` folder, used to render the template.            |

## Development

### Monitoring Events

You can monitor the events emitted by the Baileys library using the `monitor-event` script. This will help you understand what events are available and how to handle them.

Run the script with:

```bash
npm run events:monitor <event-name1 event-name2 ... or `all`>
```

Where `<event-name>` is the name of the event you want to monitor.

Here is a summary of the available events:

| Event Name                  | Description                                                                    |
| --------------------------- | ------------------------------------------------------------------------------ |
| `connection.update`         | Connection state has been updated (e.g., WS closed, opened, connecting, etc.). |
| `creds.update`              | Credentials updated (e.g., metadata, keys, or other information).              |
| `messaging-history.set`     | Set chats (history sync), including chats, contacts, and messages.             |
| `chats.upsert`              | Add or update chats.                                                           |
| `chats.update`              | Update the given chats.                                                        |
| `chats.phoneNumberShare`    | Share phone number in a chat.                                                  |
| `chats.delete`              | Delete chats with the given ID.                                                |
| `presence.update`           | Update the presence of a contact in a chat.                                    |
| `contacts.upsert`           | Add or update contacts.                                                        |
| `contacts.update`           | Update the given contacts.                                                     |
| `messages.delete`           | Delete messages by keys or all messages in a chat.                             |
| `messages.update`           | Update the given messages.                                                     |
| `messages.media-update`     | Update media associated with messages.                                         |
| `messages.upsert`           | Add or update messages (e.g., received while online or from the phone).        |
| `messages.reaction`         | React to a message or remove a reaction.                                       |
| `message-receipt.update`    | Update message receipt information.                                            |
| `groups.upsert`             | Add or update group metadata.                                                  |
| `groups.update`             | Update group metadata.                                                         |
| `group-participants.update` | Apply an action to participants in a group (e.g., add, remove).                |
| `group.join-request`        | Handle a join request for a group.                                             |
| `blocklist.set`             | Set the blocklist.                                                             |
| `blocklist.update`          | Update the blocklist (e.g., add or remove entries).                            |
| `call`                      | Receive updates on calls (e.g., received, rejected, accepted).                 |
| `labels.edit`               | Edit a label.                                                                  |
| `labels.association`        | Add or remove a label association.                                             |

### Database

You can use Prisma Studio to inspect the records in the database. Run the following command:

```bash
npm run prisma:studio
```

Now you can open your browser and go to `http://localhost:5555` to see the records in the database.
