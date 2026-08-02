export type Transcript = {
    id: number;
    project_id: number;
    title: string;
    file_url: string;
    parsed_content: TranscriptContent[];
};

export type TranscriptMetaTypes = "mor" | "gra" | "com";

export type TranscriptContent = {
    utterance?: string;
    speaker?: string;
    [key: string]: string;
};
