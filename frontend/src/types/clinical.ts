export interface HealthwiseArticle {
    title: string;
    url: string;
}

export interface QuickDiffRow {
    condition: string;
    pattern: string;
}

export interface ProbingRow {
    condition: string;
    question: string;
    symptoms: string[];
}

export interface ClinicalModuleData {
    id: string;
    title: string;
    subtitle: string;
    articles: HealthwiseArticle[];
    quickDiffHeader: string;
    quickDiff: QuickDiffRow[];
    probing: ProbingRow[];
    redFlags?: string[];
    imageAfterQuickDiff?: string;
    imageAfterRedFlags?: string;
}

export interface NoteCardItem {
    id: string;
    title: string;
    items: string[];
}