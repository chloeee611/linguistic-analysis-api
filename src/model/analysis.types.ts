export type Analysis = {
    id: number;
    type: string;
};

export type AnalysisType = "kwal" | "mlu" | "freq" | "lexrare";

export type LexRareReturn = {
    [code: string]: {
        code: string;
        num_rare_words: number;
        num_total_words: number;
        num_common_words: number;
        percent_rare_words: number;
    };
};

export type AnalysisArgs = {
    kwal: {
        search_utterance?: string[];
        mor_filters?: string[];
        gra_filters?: string[];
    };
    mlu: {};
    freq: {
        search?: string;
    };
    lexrare: {
        target_tier: "mor" | "utt";
    };
};
