# obsidian-upmeet-plugin

[Upmeet.ai](https://upmeet.ai) is a amazing tool to do transcripts and summaries of your meetings with a strong AI engine. But you may need to syncrhonize upmeet data with your [Obsidian](https://obsidian.md/) vault.
This plugin is dediacted to this task.


## Features

- Synchronize your **new** notes with your obsidian Vault
- Use default format or use your own template
- Leverage Obsidian note properties
- Multilingual support (`fr` and `en`)

## Installation

1. Download the latest release from the [Releases](https://github.com/Golgautier/obsidian-upmeet-plugin/releases) page.
2. Copy the `.zip` file into your Obsidian vault's `plugins` folder.
3. Unzip and enable the plugin from Obsidian's settings.

## Usage

- Activate your plugin in `Upmeet settings > Community plugins > Unofficial Upmeet plugin`
- You now have a new icon in your toolbar, click on it and a right panel will be displayed
- Click on the refresh button to download all your meeting notes

### Template usage
If you have selected your own template, you can use the following variables in your template, they will be replaced by your meeting content :
- {{summary}}
- {{transcription}}
- {{tags}}

## Configuration

Access plugin settings from the Obsidian settings panel to customize templates and default behaviors.

Note : You'll need an API key you can request to Upmeet team


## Contributing

Contributions are welcome! Please open issues or pull requests on [GitHub](https://github.com/Golgautier/obsidian-upmeet-plugin).

## License

MIT License
