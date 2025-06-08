import { Plugin, Notice } from 'obsidian';
import axios, { Axios } from 'axios';

// Define the structure of a meeting object

export interface Meeting {
  name: string;
  date: string;
  summary: string;
  transcription: string;
  id: string;
  tags: string[];
}

// Define the structure of a meeting from the Upmeet API

interface MeetingfronUpmeet {
    id: string;
    createdAt: string;
    name: string;
    summary?: {
        text: string;
    };
}

async function getMeetingSummary(meetingId: string, upmeetToken: string): Promise<string> {
    const url = `https://api.upmeet.ai/meetings/${meetingId}`;
    const headers = {
        'Accept': "application/json",
        'X-Api-Token': upmeetToken
    };

    try {
        const response = await axios.get(url, { headers });
        const meetingData = response.data;

        const summary = meetingData.meeting.summary?.text || "No summary available";

        return summary;
    } catch (error) {
        console.error(`Error making summary request for meeting ${meetingId}: ${error}`);
        return "No summary available";
    }
}

async function getMeetingTranscription(meetingId: MeetingfronUpmeet, upmeetToken: string): Promise<string> {
    const url = `https://api.upmeet.ai/meetings/${meetingId}/transcriptions`;
    const headers = {
        'Accept': "application/json",
        'X-Api-Token': upmeetToken
    };

    try {
        const response = await axios.get(url, { headers });
        const transcriptionData = response.data;

        return transcriptionData.transcriptions.map((tmp: any) => {
            const speakerName = tmp.speaker ? tmp.speaker.name : "Unknown";
            return `${speakerName} : ${tmp.text}  \n`;
        }).join('');
    } catch (error) {
        console.error(`Error making request for meeting ${meetingId}: ${error}`);
        return "No transcription available";
    }
}

// Define the 'getMeetings' function to fetch meetings from the Upmeet API
export async function getMeetings(
  plugin: Plugin,
  upmeetToken: string,
  startingDate: string
): Promise<{ newMeetings: Meeting[]; lastMeetingDate: string }> {
    let returnedMeetings: Meeting[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let lastMeeting = "";
    let response: any

    const url = "https://api.upmeet.ai/meetings";
    const headers = {
        'Accept': "application/json",
        'X-Api-Token': upmeetToken
    };

    while (currentPage <= totalPages) {
        try {
            // Check if the token is valid by making a test request
            response = await axios.get(`${url}?page=${currentPage}`, { headers });
        }
        catch (error) {
            console.error(`Error fetching meetings from Upmeet API: ${error}`);
            new Notice("Failed to fetch meetings from Upmeet API. Please look at console for more details.");
            return { newMeetings: [], lastMeetingDate: lastMeeting };
        }

        const data = response.data;
        let tmpMeeting: Meeting;

        totalPages = data.totalPages;

        for (const meeting of data.meetings) {
            if (!lastMeeting) {
                lastMeeting = meeting.createdAt;
            }

            if (meeting.createdAt > startingDate) {

                // Handling Tags
                let tagList=[];

                for (const tagtmp in meeting.tags) {
                    tagList.push(meeting.tags[tagtmp].name);
                }

                // Handlling transcription
                let meetingTranscription = await getMeetingTranscription(meeting.id, upmeetToken);
                let meetingSummary = await getMeetingSummary(meeting.id, upmeetToken);

                tmpMeeting = {
                    name: meeting.name,
                    date: meeting.createdAt,
                    summary: meetingSummary,
                    transcription: meetingTranscription,
                    id: meeting.id,
                    tags: tagList 
                };


                returnedMeetings.push(tmpMeeting);
            } else {
                console.log(`Stopping at meeting #${meeting.id} created at ${meeting.createdAt}, which is not newer than lastCollect ${lastMeeting}.`);
                return { newMeetings: returnedMeetings, lastMeetingDate: lastMeeting };
            }
        }

        currentPage++;
    }

    return { newMeetings: returnedMeetings, lastMeetingDate: lastMeeting };
  
}