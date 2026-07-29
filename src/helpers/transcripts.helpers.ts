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

export const spliceTranscript = (
    transcript: string[],
    page: number,
    pageSize: number,
) => {
    return transcript.slice(page * pageSize, (page + 1) * pageSize);
};
