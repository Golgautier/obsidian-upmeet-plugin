import { TFile, Notice } from "obsidian";
import { PANEL_NAME, upmeetPanelView } from "../panel/panel";
import GolUpmeetPlugin from "../main";
import { getMeetings } from "../upmeet/upmeet"; // Import the getMeetings function
import { Meeting } from "../upmeet/interfaces"; // Import the Meeting interface
import { t } from "../languages/language"; // Import the translation function

// Request to update the right panel
export function updatePanel(plugin: GolUpmeetPlugin, file: TFile) {
    const leaves = plugin.app.workspace.getLeavesOfType(PANEL_NAME);
    if (leaves.length > 0) {
        const leaf = leaves[0];
        const view = leaf.view as upmeetPanelView;
        if (view) {
        // Update the panel with the new file information
        view.refreshPanel(file);
        } else {
        console.error("Failed to get Upmeet panel view.");
        }
    }
}

// Function to toggle the right panel for Upmeet
export function toggleRightPanel(plugin: GolUpmeetPlugin) {
    const leaves = plugin.app.workspace.getLeavesOfType(PANEL_NAME);

    if (leaves.length > 0) {
      // Panel is already open, we close it
      for (const leaf of leaves) {
        leaf.detach();
      }
    } else {
      // Panel is not open, we create it
      const leaf = plugin.app.workspace.getRightLeaf(false);
      
      if (leaf) {
        
        leaf.setViewState({ type: PANEL_NAME, active: true });
        // Optionnel : révéler le panneau
        plugin.app.workspace.revealLeaf(leaf);
      } else {
        console.error("Failed to get right leaf for Upmeet panel.");
      }

      // We update the content of the panel with the active file
      const activeFile = plugin.app.workspace.getActiveFile(); // Get the active file
      if (activeFile) {
        updatePanel(plugin, activeFile);
      }
    }
}

// Function to sync nodes with Upmeet
export async function syncNotes(plugin: GolUpmeetPlugin): Promise<void> {
    new Notice(t(plugin.language, 'noticeSyncStarting')); // Display a notice while syncing notes
    let lastMeetingDate: string;
    let meetingsList: Meeting[] = [];
    let templateContent: string = "";

    // If upmeetTemplate is set, read the template file and replace the placeholder
    if (plugin.settings.upmeetTemplate) {
      
      const templateFile=plugin.app.vault.getFileByPath(plugin.settings.upmeetTemplate)

      if (!templateFile) {
        console.error(`Template file not found: ${plugin.settings.upmeetTemplate}`);
        return;
      } 
      
      // Read the template file content
      templateContent = await plugin.app.vault.read(templateFile);
    } else {
      templateContent = t(plugin.language,"defaultNoteContent"); // Default template content if no template is set
    }

    // Fetch meetings from Upmeet API
    const meetingsResult = await getMeetings(plugin);
    
    // Assign results to variables
    meetingsList = meetingsResult.newMeetings;
    lastMeetingDate = meetingsResult.lastMeetingDate;

    new Notice(t(plugin.language,"noticeNewMeetingsFound")+`${meetingsList.length}`);
    console.debug(`Found ${meetingsList.length} meetings since last sync.`)

    // Now we browse meetings from Upmeet API
    for (const meeting of meetingsList) {

      // We add note property
      let noteContent = `---\n`
      noteContent += `MeetingID: ${meeting.id}\n`;
      noteContent += `MeetingDate: ${meeting.createDate}\n`;
      noteContent += `MeetingProcessDate: ${meeting.processDate}\n`;
      noteContent += `MeetingAuthor: ${meeting.author}\n`;
      noteContent += `MeetingTags: ${meeting.tags.join(", ")}\n`; // Join tags with a comma
      noteContent += `---\n`

      // We now add # for tags
      meeting.tags = meeting.tags.map(tag => `#${tag}`);

      // Replace placeholders in the template with actual meeting data
      noteContent += templateContent
        .replace("{{summary}}", meeting.summary)
        .replace("{{transcription}}", meeting.transcription)
        .replace("{{tags}}", meeting.tags.join(", ")); // Join tags with a comma
     
      // Create a new note for the meeting
      console.log(`Creating note for meeting: ${meeting.id} - ${meeting.name}`);
      createNewNote(plugin, meeting.name, noteContent);
    }


    // Update lastMeetingDate
    plugin.settings.upmeetLastSync = lastMeetingDate;
    plugin.saveSettings();
    console.info(`Last meeting date updated to: ${plugin.settings.upmeetLastSync}`);

    new Notice(t(plugin.language, 'noticeSyncCompleted')); // Display a notice when syncing is completed
}

// Function tu create a new note
async function createNewNote(plugin: GolUpmeetPlugin, title: string, content: string) {

    // Define the filename based on the title
    const filename = `${plugin.settings.upmeetFolder}/${title}.md`;
    

    // Create the full path for the new note
    const folderExists = plugin.app.vault.getAbstractFileByPath(plugin.settings.upmeetFolder);
    if (!folderExists) {
      await plugin.app.vault.createFolder(plugin.settings.upmeetFolder);
    }

    console.debug(`Creating new note: ${filename}...`);

    // Create the new note with the specified filename and content
    const existingFile = plugin.app.vault.getAbstractFileByPath(filename);
    if (existingFile) {
      if (plugin.settings.overwriteExistingNotes) {
        // If the file exists and overwrite is enabled, delete the existing file
        console.warn(`File ${filename} already exists. Overwriting...`);
        await plugin.app.vault.delete(existingFile);
      } else {
        // If the file exists and overwrite is not enabled, skip creating the note
        console.warn(`File ${filename} already exists. Skipping this meeting...`);
        new Notice(t(plugin.language,"noticeFileAltreadyExistsSkip")+filename );
        return;
      }
    }

    await plugin.app.vault.create(filename, content);
}