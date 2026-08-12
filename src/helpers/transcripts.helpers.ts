import { TranscriptContent, TranscriptMor, TranscriptGra } from "../model/transcript.types";

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
            const parsedType = type.replace("%", "").replace(":", "").toLowerCase();

            if (parsedType === "mor") {
                currentTranscript[parsedType] = compileMor(content);
            } else if (parsedType === "gra") {
                currentTranscript[parsedType] = compileGra(content);
            } else {
                currentTranscript[parsedType] = content;
            }
        }
    }

    return transcriptBuilder;
};

const compileMor = (line: string) => {
    const morBuilder: TranscriptMor[] = [];

    for (const mor of line.split(" ")) {
        const [wordClass, word] = mor.split("|");

        if (!wordClass || !word) {
            continue;
        }

        morBuilder.push({ word_class: wordClass, word });
    }

    return morBuilder;
};

const compileGra = (line: string) => {
    const graBuilder: TranscriptGra[] = [];

    for (const gra of line.split(" ")) {
        const [position, head, relation] = gra.split("|");

        if (!position || !head || !relation) {
            continue;
        }

        graBuilder.push({
            position: Number(position),
            head: Number(head),
            relation,
        });
    }

    return graBuilder;
};
