import { TranscriptContent } from "../model/transcript.types";

export const transcriptToArray = (transcript: string) => {
    return transcript.split("\n");
};

export const removeTranscriptMetadata = (transcriptArray: string[]) => {
    const newArray = [...transcriptArray];

    for (const line of transcriptArray) {
        if (line.startsWith("@")) {
            newArray.shift();
        } else {
            break;
        }
    }

    return newArray;
};

export const compileTranscript = (transcript: string[]): any[] => {
    const transcriptBuilder: TranscriptContent[] = [];

    let currentTranscript: TranscriptContent = {};

    for (const [i, line] of transcript.entries()) {
        const [type, content] = line.split("\t");

        if (!type || !content) {
            continue;
        }

        if (type.charAt(0) === "*") {
            if (i !== 0) {
                transcriptBuilder.push(currentTranscript);
                currentTranscript = {};
            }

            currentTranscript.speaker = type.replace("*", "").replace(":", "");
            currentTranscript.utterance = content;
        } else if (type.charAt(0) === "%") {
            currentTranscript[type.replace("%", "").replace(":", "")] = content;
        }
    }

    return transcriptBuilder;
};

export const sliceTranscript = (
    transcript: TranscriptContent[],
    page: number,
    pageSize: number,
) => {
    return transcript.slice(page * pageSize, (page + 1) * pageSize);
};
