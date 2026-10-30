import React from 'react';
import { type ClinicalModuleData } from '../types/clinical';

interface TeachBackViewProps {
    module: ClinicalModuleData & { guideContent?: any };
    appendToActiveCard: (text: string) => void;
}

export const TeachBackView: React.FC<TeachBackViewProps> = ({ module, appendToActiveCard }) => {
    const guide = module.guideContent;

    return (
        <div className="space-y-6">
            {/* ================= HEADER SECTION (Matching OneNote Screenshot) ================= */}
            <div className="border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-900">Teach Back Method</h1>
                <p className="text-xs text-slate-400 mt-1">Friday, September 18, 2026 10:59 AM</p>
            </div>

            {/* ================= VIDEO LINK ================= */}
            {guide?.videoUrl && (
                <div className="flex items-center space-x-3 text-sm py-1">
                    <span className="font-bold text-slate-800">Sample Teach-back video:</span>
                    <a
                        href={guide.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        {guide.videoTitle}
                    </a>
                </div>
            )}

            {/* ================= IMAGE BANNER ================= */}
            <div className="flex justify-center w-full my-4">
                <img
                    src={guide?.imageUrl || 'TeachBack.png'}
                    alt="Teach Back Method Graphic"
                    className="max-h-80 w-auto object-contain rounded-lg shadow-sm border border-slate-100"
                    onError={(e) => {
                        // Fallback placeholder if image asset is missing
                        const target = e.target as HTMLElement;
                        if (target.parentElement) {
                            target.parentElement.style.display = 'none';
                        }
                    }}
                />
            </div>

            {/* ================= INTRODUCTION TEXT ================= */}
            <div className="space-y-2 text-sm text-slate-800 leading-relaxed">
                {guide?.introText.map((paragraph: string, idx: number) => (
                    <p key={idx}>
                        {idx === 0 ? (
                            <>
                                Teach-back, also known as the <strong className="italic">"show-me"</strong> method, is a health communication strategy used to ensure that patients or caregivers understand medical information or instructions.
                            </>
                        ) : (
                            paragraph
                        )}
                    </p>
                ))}
            </div>

            {/* ================= PURPOSE OF TEACH BACK ================= */}
            <div className="space-y-2">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">PURPOSE OF TEACH BACK</h2>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 pl-2">
                    {guide?.purposes.map((purpose: string, idx: number) => (
                        <li key={idx} className="hover:text-blue-600 cursor-pointer" onClick={() => appendToActiveCard(purpose)}>
                            {purpose}
                        </li>
                    ))}
                </ul>
            </div>

            {/* ================= HOW IT WORKS ================= */}
            <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">HOW IT WORKS:</h2>
                <div className="space-y-2 text-sm text-slate-800">
                    {guide?.steps.map((step: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                            <p
                                className="font-semibold cursor-pointer hover:text-blue-600"
                                onClick={() => appendToActiveCard(step.title)}
                            >
                                {step.title}
                            </p>
                            {step.subPoints.length > 0 && (
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 pl-6">
                                    {step.subPoints.map((sub: string, sIdx: number) => (
                                        <li
                                            key={sIdx}
                                            className="cursor-pointer hover:text-blue-600 italic"
                                            onClick={() => appendToActiveCard(sub)}
                                        >
                                            {sub}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ================= EXAMPLE TEACH BACK QUESTIONS ================= */}
            <div className="space-y-2 border-t border-slate-200 pt-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">EXAMPLE TEACH BACK QUESTIONS:</h2>
                <div className="space-y-1 pl-2">
                    {guide?.exampleQuestions.map((q: string, idx: number) => (
                        <div
                            key={idx}
                            onClick={() => appendToActiveCard(q)}
                            className="text-sm text-slate-700 hover:bg-blue-50 p-1.5 rounded cursor-pointer border border-transparent hover:border-blue-200 transition"
                        >
                            • <span className="italic">{q}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ================= CONDITION-SPECIFIC QUESTIONS ================= */}
            <div className="space-y-4 border-t border-slate-200 pt-4">
                {guide?.conditionQuestions.map((condGroup: any, idx: number) => (
                    <div key={idx} className="space-y-1.5">
                        <h3 className="text-sm font-bold text-slate-900">{condGroup.condition}</h3>
                        <div className="space-y-1 pl-2">
                            {condGroup.questions.map((q: string, qIdx: number) => (
                                <div
                                    key={qIdx}
                                    onClick={() => appendToActiveCard(q)}
                                    className="text-sm text-slate-700 hover:bg-blue-50 p-1.5 rounded cursor-pointer border border-transparent hover:border-blue-200 transition"
                                >
                                    • <span className="italic">{q}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};