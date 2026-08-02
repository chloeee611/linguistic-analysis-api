export type Transcript = {
    id: number;
    project_id: number;
    title: string;
    file_url: string;
    parsed_content: TranscriptContent[];
};

export type TranscriptMetaTypes = "mor" | "gra" | "com";

export type TranscriptContent = Record<string, string> & {
    utterance?: string;
    speaker?: string;
    mor?: TranscriptMor[];
    gra?: TranscriptGra[];
};

export type TranscriptMor = {
    word_class: string;
    word: string;
};

export type TranscriptGra = {
    position: number;
    head: number;
    relation: string;
};
