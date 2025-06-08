import {  WorkspaceLeaf, ItemView, addIcon, base64ToArrayBuffer,setIcon,TFile  } from 'obsidian';
import UpmeetPlugin from '../main';
import { CUSTOM_ICON_ID } from '../main/icon';
import { updatePanel, createPanel } from './panelfunctions';
import GolUpmeetPlugin from '../main';

export const PANEL_NAME = 'upmeetPanel'; // Name of the panel view

export class upmeetPanelView extends ItemView {
  plugin: GolUpmeetPlugin;
  language: string = "en"; // Default language, can be set from the plugin

  constructor(leaf: WorkspaceLeaf, plugin: UpmeetPlugin) {
    // Call the parent constructor with the leaf and plugin
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return PANEL_NAME
  }

  getDisplayText() {
    return "Upmeet Panel";
  }

  // Assign a custom icon to the panel
  getIcon() {
    return CUSTOM_ICON_ID; // Use the custom icon ID defined in icon.ts
  }

  refreshPanel(file?: TFile) {
    updatePanel(this, file);
  }

  // This method is called when the panel is opened
  async onOpen() {
    this.language = this.plugin.language; // Set the language from the plugin
    createPanel(this);
  }

  async onClose() {
    // cleanup when the panel is closed
    this.containerEl.empty();
  }
}
