import { TFile, setIcon } from "obsidian";
import { upmeetPanelView } from './panel';
import { t } from "../languages/language";
import { syncNotes } from "../main/mainfunctions"; // Import the syncNotes function


function updateDetailsfromPanel(item: upmeetPanelView, file?: TFile) {
    
    // Get details panel to update it
    const detailsDiv = item.containerEl.querySelector('.my-panel-details');
    
    // If the detailsDiv exists, we update it with the file information
    if (detailsDiv) {
        detailsDiv.empty(); // Clear the existing content
        detailsDiv.createEl("h4", { text: t(item.language,"panelDetailsTitle") });
        let detailsContentDiv = detailsDiv.createDiv( {cls: "my-panel-details-text"});
        
        // Check if a file is provided, if not, we display a message
        if(!file) {
            detailsContentDiv.createEl('small', { text: t(item.language,"panelNoNoteSelected")});
            return;
        }

        // Check if the file is a meeting note from Upmeet
        const cache = item.app.metadataCache.getFileCache(file);
        const frontmatter = cache?.frontmatter;

        if (! frontmatter?.MeetingID ) {
            detailsContentDiv.createEl('small', { text: t(item.language,"panelNotAUpmeetNote")});;
            return;
        }

        detailsContentDiv.createEl('p', { text: t(item.language,"panelDetailMeetingID" )+`${frontmatter?.MeetingID ?? "Not Set"}`,cls: 'my-panel-details-text' });;
        detailsContentDiv.createEl('p', { text: t(item.language,"panelDetailAuthor" )+`${frontmatter?.MeetingAuthor ?? "Not set"}`,cls: 'my-panel-details-text'});;
        detailsContentDiv.createEl('p', { text: t(item.language,"panelDetailCreated" )+`${frontmatter?.MeetingDate ?? "Not set"}`,cls: 'my-panel-details-text'});;
        detailsContentDiv.createEl('p', { text: t(item.language,"panelDetailProcessed" )+`${frontmatter?.MeetingProcessDate ?? "Not set"}`,cls: 'my-panel-details-text'});;
        detailsContentDiv.createEl('p', { text: t(item.language,"panelDetailTags" )+`${frontmatter?.MeetingTags ?? "No tags"}`,cls: 'my-panel-details-text'});;
        
    } else {
        console.error("Details div not found in the panel container, shoud be there.")
    }
}

// This method is called to update the content of the panel
export function updatePanel(item: upmeetPanelView, file?: TFile) {
// This method is called to update the content of the panel
const container = item.containerEl.children[1];
    updateDetailsfromPanel(item, file);
}

// This method is called to create the panel
export function createPanel(item: upmeetPanelView) {
    // This method is called when the panel is opened
    const container = item.containerEl.children[1];
    container.empty(); // Clear the container to ensure it's empty before adding new content

    // Create the main container for the panel
    const header = container.createDiv({ cls: "my-panel-header" });

    // Title of the panel
    header.createEl("h3", { text: "Upmeet" });

    // Refresh Button
    const btn = header.createEl("button");
    btn.setAttr("aria-label", t(item.language,"panelButtonSync"));
    setIcon(btn, "refresh-cw"); // or your custom icon id

    btn.onclick = () => {
        syncNotes(item.plugin);        
    };

    // Now we display meeting details
    const details=container.createDiv({ cls: "my-panel-details" });
    details.createEl("h4", { text: t(item.language,"panelDetailsTitle") });
    const name = item.app.workspace.getActiveFile()?.name ?? t(item.language,"panelNoNoteSelected");


    updatePanel(item); // Call the updatePanel method to populate the panel with content
}