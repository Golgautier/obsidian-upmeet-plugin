import { App, addIcon, Plugin, Setting,PluginSettingTab, TFile, Notice, MarkdownView,WorkspaceLeaf,debounce  } from 'obsidian';
import { getMeetings } from './upmeet/upmeet'; // Import the test function from functions.ts
import { Meeting } from './upmeet/interfaces'; // Import the Meeting interface
import { PANEL_NAME, upmeetPanelView } from './panel/panel';
import { CUSTOM_ICON_ID, CUSTOM_ICON_SVG } from './main/icon';
import { updatePanel, toggleRightPanel } from './main/mainfunctions'; // Import the updatePanel and toggleRightPanel functions
import moment from "moment";
import { t } from './languages/language'; // Import the translation function

interface MyPluginSettings {
	upmeetToken: string; // Token for Upmeet API access
  upmeetFolder: string; // Folder where Upmeet notes will be stored
  upmeetLastSync: string; // ISO date string
  upmeetTemplate: string; // Template for new notes
  overwriteExistingNotes: boolean; // Optional setting to overwrite existing notes 
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	upmeetToken: 'default',
  upmeetFolder: 'Upmeet',
  upmeetLastSync: '2000-01-01T00:00:00Z', // Default date in the past
  upmeetTemplate: '', // Template for new notes
  overwriteExistingNotes: false, // Default to not overwriting existing notes
}

export default class GolUpmeetPlugin extends Plugin {
  settings!: MyPluginSettings;
  private currentFile: TFile | null = null;
  language: string ; // Initialize language to null

  constructor(app: App, manifest: any) {
    super(app, manifest);
    this.language = ""; // Initialize currentFile to null
  }

  

  async onload() { 

    // Configure resources needed by the plugin.
    console.debug(`Loading plugin GolUpmeetPlugin`); 

    // Load settings
    await this.loadSettings();

    // Set the language based on the user's language setting
    const obsidianLanguage = moment.locale();
    this.language = obsidianLanguage === 'fr' ? 'fr' : 'en'; // Default to English if not French
    
    // Create panel
    if (!this.app.workspace.getLeavesOfType(PANEL_NAME).length) {
      console.debug(`Initializing Upmeet panel view on load`);
      this.registerView(PANEL_NAME, (leaf) => new upmeetPanelView(leaf, this));      
    }

    // Register event change for active leaf
    if(this) {
      this.registerEvent(
        this.app.workspace.on(
          "active-leaf-change", debounce((leaf) => {
          if (leaf?.view?.getViewType() === "markdown") {
            const file = (leaf.view as MarkdownView).file;
            if (file && file !== this.currentFile) {
              this.currentFile = file;
              updatePanel(this, file);
            }
          }
        }, 100, true))
      )    
    }

    // AddIcon is a method to add an icon to the Obsidian UI.
    addIcon(CUSTOM_ICON_ID, CUSTOM_ICON_SVG); // Insert actual SVG path here

    // Add the Upmeet.ai icon with SVG content
    this.addRibbonIcon(CUSTOM_ICON_ID, 'Upmeet', () => { toggleRightPanel(this);  });

    // This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

  }

  async onunload() {
  }

  async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}


class SampleSettingTab extends PluginSettingTab {
	plugin: GolUpmeetPlugin;

	constructor(app: App, plugin: GolUpmeetPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

    new Setting(containerEl)
      .setName(t(this.plugin.language, 'upmeetToken'))
      .setDesc(t(this.plugin.language, 'upmeetTokenDesc'))
      .addText(text => {
        text
          .setPlaceholder(t(this.plugin.language, 'upmeetTokenPlaceholder'))
          .setValue(this.plugin.settings.upmeetToken)
          .onChange(async (value) => {
            this.plugin.settings.upmeetToken = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.setAttribute('type', 'password'); // Hide input as password
      })
        

    new Setting(containerEl)
			.setName(t(this.plugin.language, 'upmeetFolder'))
			.setDesc(t(this.plugin.language, 'upmeetFolderDesc'))
			.addText(text => text
				.setPlaceholder(t(this.plugin.language, 'upmeetFolderPlaceholder'))
				.setValue(this.plugin.settings.upmeetFolder)
				.onChange(async (value) => {
					this.plugin.settings.upmeetFolder = value;
					await this.plugin.saveSettings();
				}));

    new Setting(containerEl)
      .setName(t(this.plugin.language, 'upmeetLastSyncDate'))
      .setDesc(t(this.plugin.language, 'upmeetLastSyncDateDesc'))
      .addText(text => {
        text
          .setPlaceholder(t(this.plugin.language, 'upmeetLastSyncDatePlaceholder'))
          .setValue(this.plugin.settings.upmeetLastSync)
          .onChange(async (value) => {
            this.plugin.settings.upmeetLastSync = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(t(this.plugin.language, 'upmeetTemplate'))
      .setDesc(t(this.plugin.language, 'upmeetTemplateDesc'))
      .addTextArea(text => {
        text
          .setPlaceholder(t(this.plugin.language, 'upmeetTemplatePlaceholder'))
          .setValue(this.plugin.settings.upmeetTemplate)
          .onChange(async (value) => {
            this.plugin.settings.upmeetTemplate = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(t(this.plugin.language, 'upmeetOverwrite'))
      .setDesc(t(this.plugin.language, 'upmeetOverwriteDesc'))
      .addToggle(toggle => {  
        toggle
          .setValue(this.plugin.settings.overwriteExistingNotes)
          .onChange(async (value) => {
            this.plugin.settings.overwriteExistingNotes = value;
            await this.plugin.saveSettings();
          });
      }
      );
  }
}