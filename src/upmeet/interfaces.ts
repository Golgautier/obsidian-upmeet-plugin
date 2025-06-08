// Define the structure of a meeting object

export interface Meeting {
  name: string;
  summary: string;
  transcription: string;
  id: string;
  tags: string[];
  author: string;
  createDate: string;
  processDate: string;
}

// Define the structure of a meeting from the Upmeet API
export interface MeetingfromUpmeet {
    id: string;
    createdAt: string;
    name: string;
    summary?: {
        text: string;
    };
}