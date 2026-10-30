import { type ClinicalModuleData } from '../types/clinical';
export interface TeachBackGuideContent {
    videoTitle: string;
    videoUrl: string;
    imageUrl?: string;
    introText: string[];
    purposes: string[];
    steps: { title: string; subPoints: string[] }[];
    exampleQuestions: string[];
    conditionQuestions: { condition: string; questions: string[] }[];
}
export const CLINICAL_MODULES: Record<string, ClinicalModuleData & { guideContent?: TeachBackGuideContent }> = {
    CLD: {
        id: 'CLD',
        title: 'Chronic Lung Disease',
        subtitle: 'Click any condition, question, or symptom button to append.',
        articles: [
            { title: 'COPD', url: 'https://url.uk.m.mimecastprotect.com/s/sYLuCWjmjC50M2VNT6fkkioAeT3?domain=healthwise.net' },
            { title: 'Asthma', url: 'https://url.uk.m.mimecastprotect.com/s/nSNPCXknkCXm81WkUVhLLiWdcgh?domain=healthwise.net' },
            { title: 'Pulmonary Fibrosis', url: 'https://url.uk.m.mimecastprotect.com/s/-wmYCYl0ltL5nQwjf9iJJixix-F?domain=healthwise.net' },
            { title: 'Pulmonary Hypertension', url: 'https://url.uk.m.mimecastprotect.com/soqEVCZmpmC5zkE0XTysVViBTfLt?domain=healthwise.net' }
        ],
        quickDiffHeader: 'CHRONIC CONDITIONS',
        quickDiff: [
            { condition: 'Asthma', pattern: 'Comes & goes, triggered, inhaler helps fast' },
            { condition: 'Chronic Bronchitis', pattern: 'Daily cough with mucus for months' },
            { condition: 'Pulmonary Fibrosis', pattern: 'Progressive, "can\'t take deep breath," worse over time' },
            { condition: 'Pulmonary Hypertension', pattern: 'Fatigue, dizziness, swelling, activity intolerance' }
        ],
        probing: [
            {
                condition: 'Member may show signs of an ASTHMA pattern.',
                question: 'Do your breathing symptoms come and go, get worse with triggers like smoke, weather, exercise, or allergies, improve with an inhaler, or happen more at night or early morning?',
                symptoms: ['Breathing problems happen at certain times', 'Triggered by smoke/weather/allergies', 'Improve with an inhaler']
            },
            {
                condition: 'Member may show signs of a CHRONIC BRONCHITIS pattern.',
                question: 'Do you cough most days, cough up mucus or phlegm, or have a cough lasting for months or comes back often?',
                symptoms: ['Cough most days', 'Mucus or phlegm', 'Lasts a long time', 'Keeps coming back']
            },
            {
                condition: 'Member may show signs of a PULMONARY FIBROSIS pattern.',
                question: "Do you feel like you can't take a full deep breath, get short of breath with light activity, or have breathing that has gotten worse over time?",
                symptoms: ['Breathing gets worse over time', 'Breathing feels tight/limited  during light activity']
            },
            {
                condition: 'Member may show signs of a PULMONARY HYPERTENSION pattern.',
                question: 'Do you feel very tired, dizzy, swollen in your legs or feet, or short of breath with activity even without a cough?',
                symptoms: ['Shortness of breath with tiredness', 'Dizziness', 'Swelling', 'No heavy cough']
            }
        ]
    },
    CHF: {
        id: 'CHF',
        title: 'Chronic Heart Failure',
        subtitle: 'Click any condition, question, or symptom button to append.',
        articles: [
            { title: 'Heart Failure', url: 'https://url.uk.m.mimecastprotect.com/s/GhV4C4Y4YhBrDyqRTNFGGi4E85V?domain=healthwise.net' },
            { title: 'Watching Your Fluids', url: 'https://url.uk.m.mimecastprotect.com/s/2OO-C5131hZAXo2wF4HqqikhFKq?domain=healthwise.net' },
            { title: 'Checking Your Weight', url: 'https://url.uk.m.mimecastprotect.com/s/SFw4C6z2zCrXpEqZCjI77i5bV56?domain=healthwise.net' },
            { title: 'Compensation by the Heart and Body', url: 'https://url.uk.m.mimecastprotect.com/s/Ik4CC7WOWfAL8vwnIrS33iojtFS?domain=healthwise.net' }
        ],
        quickDiffHeader: 'CONDITION',
        quickDiff: [
            { condition: 'Fluid buildup (heart failure key sign)', pattern: 'Swelling + rapid weight gain' },
            { condition: 'Heart failure-specific breathing pattern', pattern: 'SOB lying flat / waking at night' },
            { condition: 'Poor heart pumping function', pattern: 'Fatigue + reduced activity' },
            { condition: 'Common in heart failure', pattern: 'On diuretics ("water pills")' }
        ],
        probing: [
            {
                condition: 'FLUID BUILD UP/RETENTION',
                question: "Can you tell me about any swelling, sudden weight changes, or tightness in your clothes, shoes, or socks that you've noticed recently?",
                symptoms: ['swelling', 'sudden weight gain', 'shortness of breath', 'needing extra pillows', 'waking up at night feeling short of breath', 'less appetite of feeling full quickly']
            },
            {
                condition: 'HEART FAILURE BREATHING PATTERN',
                question: "Can you tell me about any trouble you've had with breathing during the day or while sleeping?",
                symptoms: ['coughing or wheezing', 'waking up at night feeling short of breath', 'fast labored breathing']
            },
            {
                condition: 'FATIGUE AND ACTIVITY INTOLERANCE',
                question: "Can you tell me about any changes in your energy level, breathing, or ability to do your normal daily activities?",
                symptoms: ['getting worn out with normal daily activities', 'feeling short of breath or exhausted when doing activities of daily living (ADLs)', 'tasks are harder than it used to be']
            },
            {
                condition: 'MONITORING AND MANAGEMENT',
                question: "Can you tell me about your daily routine for weighing yourself, taking your medications, and following any weight, fluid, or salt instructions from your provider?",
                symptoms: ['not weighing self daily', 'not knowing when to call the doctor', 'missing medications or not taking as prescribed', 'not knowing early warning signs', 'frequent hospital or ER visits']
            }
        ]
    },
    Diabetes: {
        id: 'Diabetes',
        title: 'Diabetes',
        subtitle: 'Click any condition, question, or symptom button to append.',
        articles: [
            { title: 'Symptoms of High Blood Sugar', url: 'https://url.uk.m.mimecastprotect.com/s/RskWC1BQBUM8P1lLuYtppiVY5hx?domain=healthwise.net' },
            { title: 'Related High/Low Blood Sugar Levels', url: 'https://url.uk.m.mimecastprotect.com/s/gJEyC21O1hp7Bvg0cMu33i57qQu?domain=healthwise.net' },
            { title: 'Diabetes Complecations', url: 'https://url.uk.m.mimecastprotect.com/s/LT93C3KOKIpZywOWcYCZZiQ7XgX?domain=healthwise.net' }
        ],
        quickDiffHeader: 'CONDITION',
        quickDiff: [
            { condition: 'High Blood Sugar', pattern: 'Thirst + frequent urination + fatigue' },
            { condition: 'Low Blood Sugar', pattern: 'Shaky, sweaty, better after eating' },
            { condition: 'Long-term Diabetes effects', pattern: 'Numbness, slow healing wounds' },
            { condition: 'Confirmed/Diagnosed with Diabetes', pattern: 'On insulin/meds' }
        ],
        probing: [
            {
                condition: 'CLASSIC HIGH BLOOD SUGAR SYMPTOMS',
                question: "Can you tell me about any changes you've noticed with your thirst, urination, energy level, vision, or weight?\nHave you noticed feeling more thirsty than usual, going to the bathroom more often, feeling extra tired, having blurry vision, or any changes in your weight?",
                symptoms: ['thirsty than usual', 'urinating more often', 'blurred vision', 'more hungry than usual', 'dry mouth', 'slow healing wounds', 'more frequent infections']
            },
            {
                condition: 'LOW BLOOD SUGAR EPISODES',
                question: "Have you ever felt shaky, sweaty, dizzy, confused, or like you might pass out—and do you feel better after eating or drinking something sweet?\nCan you tell me about any times you've felt shaky, sweaty, dizzy, confused, or like you might pass out, and what helped you feel better?",
                symptoms: ['shaky', 'sweating', 'dizzy or lightheaded', 'fast heartbeat', 'feeling nervous or anxious', 'headache', 'feeling like you might pass out']
            },
            {
                condition: 'LONG-TERM DIABETES EFFECTS',
                question: "Have you had numbness, tingling, or burning in your hands or feet, slow-healing wounds on your feet or legs, frequent infections, or any doctor-diagnosed nerve, eye, or kidney problems related to blood sugar?\nCan you tell me about any numbness, tingling, burning, slow-healing sores, frequent infections, or any nerve, eye, or kidney problems your doctor has linked to your blood sugar?",
                symptoms: ['numbness', 'tingling burning or pain often in hands or feet', 'slow healing wounds', 'vision changes', 'more frequent infections', 'kidney damage or kidney disease']
            },
            {
                condition: 'MANAGEMENT PATTERN',
                question: "Can you walk me through how you take care of your blood sugar each day—like any medicine or insulin you take, what you eat, if you ever miss doses, and any recent blood sugar or A1C numbers you remember?",
                symptoms: ['missed doses', 'not checking blood sugar as advised', 'not knowing A1C results', 'trouble with following a healthy diet', 'not getting enough physical activity', 'financial constraints in affording medications, supplies or healthy food', 'not knowing normal blood sugar ranges']
            },
            {
                condition: 'RISK FACTOR OR SUPPORT IF DIAGNOSIS IS UNCLEAR',
                question: "Can you tell me if diabetes runs in your family, or if a doctor has ever said you have prediabetes?",
                symptoms: []
            }
        ]
    },
    Cardio: {
        id: 'Cardio',
        title: 'Cardiovascular Disease',
        subtitle: 'Click any condition, question, or symptom button to append.',
        articles: [
            { title: 'Coronary Artery Disease', url: 'https://url.uk.m.mimecastprotect.com/s/YJlJC8BOBU692lEBsKTggiysHd8?domain=healthwise.net' },
            { title: 'Heart Rhythm Problems: Symptoms', url: 'https://url.uk.m.mimecastprotect.com/s/G3PGC9LOLHk8lvDrI2UNNiqECce?domain=healthwise.net' },
            { title: 'Peripheral Arterial Disease', url: 'https://url.uk.m.mimecastprotect.com/s/-RvMC0XOXSGj7KpYhjcPPi9aVNQ?domain=healthwise.net' },
            { title: 'Venous Insufficiency', url: 'https://url.uk.m.mimecastprotect.com/s/fARgCgQ6QsA8orD4I8fkki4aA2E?domain=healthwise.net' }
        ],
        quickDiffHeader: 'CONDITION',
        quickDiff: [
            { condition: 'Arrhythmia', pattern: 'Irregular heartbeat, fluttering, dizziness' },
            { condition: 'Coronary Artery Disease', pattern: 'Chest pain with activity, relieved by rest' },
            { condition: 'Peripheral Arterial Disease', pattern: 'Leg pain when walking, better with rest' },
            { condition: 'Chronic Venous Disorders', pattern: 'Swelling, heaviness, history of clots' }
        ],
        probing: [
            {
                condition: 'CARDIAC ARRYTHMIA (IRREGULAR HEARTBEAT)',
                question: 'Can you tell me about any times your heart felt like it was racing, fluttering, or skipping beats? What was going on, and did you feel dizzy, lightheaded, or like you might pass out?',
                symptoms: ['irregular rhythm sensations', 'sudden episodes of symptoms', 'dizziness', 'possible fainting']
            },
            {
                condition: 'CORONARY ARTERY DISEASE',
                question: "• Can you tell me about any chest pain, pressure, or tightness you've felt—like when it happens, what you're doing when it starts, and whether resting makes it feel better?\n• Have you ever been told you had a heart attack, blocked arteries, a stent, or any heart procedure?",
                symptoms: ['chest discomfort with activity', 'relief with rest', 'history of blockages or procedures related to it (ex. Angiogram)']
            },
            {
                condition: 'PERIPHERAL ARTERY DISEASE',
                question: "Can you tell me about any pain, cramping, tiredness, coldness, numbness, or slow-healing sores you've noticed in your legs or feet—especially when walking or after you rest?",
                symptoms: ['pain with walking', 'relief with rest', 'circulation issues in legs']
            },
            {
                condition: 'CHRONIC VENOUS DISORDER/ DEEP VEIN THROMBOSIS',
                question: "Can you tell me about any swelling, heaviness, aching, tightness, skin color changes, or sores you've noticed in your legs—especially if you've ever had a blood clot or were told to take blood thinners?\n(Blood thinner examples: Aspirin, Plavix, Warfarin, Brillinta, Eliquis)",
                symptoms: ['history of clots', 'ongoing swelling', 'skin color changes']
            }
        ]
    },
    ESRD: {
        id: 'ESRD',
        title: 'End Stage Renal Disease',
        subtitle: 'Click any condition, question, or symptom button to append.',
        articles: [
            { title: 'End-Stage Renal Disease', url: 'https://url.uk.m.mimecastprotect.com/s/8wlaCjOLOingB2VZTzhAAimKqEY?domain=healthwise.net' },
            { title: 'Stages of Chronic Kidney Disease', url: 'https://url.uk.m.mimecastprotect.com/s/5s6MCkODOiOgK7Poh3inniGmS9m?domain=healthwise.net' },
            { title: 'Chronic Kidney Disease', url: 'https://url.uk.m.mimecastprotect.com/s/PijZClMDMh2LVyj6hJsMMizRZ9D?domain=healthwise.net' },
            { title: 'Kidney Failure: When Do I Start Dialysis?', url: 'https://url.uk.m.mimecastprotect.com/s/3E3rCmMGMhjvgZ9kukt88iRljqo?domain=healthwise.net' }
        ],
        quickDiffHeader: 'CONDITION',
        quickDiff: [
            { condition: 'Fluid overload', pattern: 'swelling in legs, ankles, feet, shortness of breath, rapid weight gain, high blood pressure' },
            { condition: 'Uremia', pattern: 'nausea, vomiting, fatigue, confusion, itching, metallic taste, poor appetite' },
            { condition: 'Peripheral edema', pattern: 'swollen legs, ankles, feet, hands, or face' },
            { condition: 'Neuropathy', pattern: 'numbness, tingling, burning pain, weakness, restless legs' },
            { condition: 'Pulmonary edema', pattern: 'severe shortness of breath, cough, difficulty lying flat, wheezing' }
        ],
        probing: [
            {
                condition: 'FLUID OVERLOAD',
                question: "Can you tell me about any recent changes you've noticed related to swelling, weight, breathing, sleep, fluid intake, or your dialysis treatments?",
                symptoms: ['swelling in legs, ankles, feet', 'shortness of breath', 'rapid weight gain', 'high blood pressure']
            },
            {
                condition: 'UREMIA',
                question: "Can you tell me about any recent changes you've noticed in your appetite, digestion, energy, thinking, itching or urine output?",
                symptoms: ['nausea', 'vomiting', 'fatigue', 'confusion', 'itching', 'metallic taste', 'poor appetite']
            },
            {
                condition: 'PULMONARY EDEMA',
                question: "Can you tell me about any recent changes in your breathing, chest symptoms, cough, oxygen needs, swelling, weight, or dialysis treatments?",
                symptoms: ['severe shortness of breath', 'cough', 'difficulty lying flat', 'wheezing']
            },
            {
                condition: 'MINERAL AND BONE DISORDER',
                question: "Can you tell me about any recent changes you've noticed in your bones, joints, muscles, itching, medication adherence, lab results, or symptoms such as fractures, numbness, tingling, or muscle spasms?",
                symptoms: ['bone pain', 'joint pain', 'muscle spasms', 'fractures', 'numbness', 'tingling']
            },
            {
                condition: 'DIALYSIS ACCESS PROBLEMS',
                question: "Can you tell me about your dialysis access and any recent changes or concerns, such as redness, swelling, pain, drainage, fever, problems during dialysis, changes in the thrill, or bleeding from the access site?",
                symptoms: ['redness', 'swelling', 'pain', 'drainage', 'fever', 'changes in the thrill', 'bleeding from access site']
            },
            {
                condition: 'INFECTION CONCERNS',
                question: "Can you tell me about any recent symptoms or concerns that might suggest an infection, such as fever, chills, weakness, changes at your dialysis access site, other signs of illness, recent hospitalizations or antibiotic use, or exposure to someone who is sick?",
                symptoms: ['fever', 'chills', 'weakness', 'access site changes', 'recent hospitalization', 'antibiotic use']
            }
        ],
        redFlags: [
            'Can you describe any chest pain, pressure, or discomfort you may be experiencing?',
            'Can you tell me about any changes in your breathing or shortness of breath?',
            'Can you describe any recent episodes of confusion, dizziness, fainting, or difficulty staying awake?',
            "Can you tell Me about any severe weakness, palpitations, Or changes in your heart rhythm that you've noticed?",
            'Can you describe any symptoms such As fever, chills, Or changes around your dialysis catheter Or access site?',
            "Can you tell Me about any abdominal pain, changes in your peritoneal dialysis fluid, or other abdominal symptoms you've experienced?",
            "Can you describe any missed dialysis treatments and how you've been feeling since then?"
        ]
    },
    Pain: {
        id: 'Pain',
        title: 'Pain',
        subtitle: 'Click any condition, question, or symptom button to append.',
        articles: [
            { title: 'Pain Management', url: 'https://url.uk.m.mimecastprotect.com/s/QMn8CnN8Ni7nPzkrFXuQQiJ1C-e?domain=healthwise.net' },
            { title: 'Chronic Pain', url: 'https://url.uk.m.mimecastprotect.com/s/Ec7VCo676trkgMQ6C9Cqqip7qBN?domain=healthwise.net' },
            { title: 'Cancer Pain', url: 'https://url.uk.m.mimecastprotect.com/s/cMFWCpX7XSn5VG7pTWF22iGwIaJ?domain=healthwise.net' },
            { title: 'Questions to Ask About Your Medicines', url: 'https://url.uk.m.mimecastprotect.com/s/4NjkCqMDMh89EDVJi3HKKiEihlN?domain=healthwise.net' },
            { title: 'Arthritis: Shots for Knee Pain', url: 'https://url.uk.m.mimecastprotect.com/s/te-CCrMXMh8xkpW4iBI66i4ntSY?domain=healthwise.net' }
        ],
        quickDiffHeader: 'DESCRIPTION',
        quickDiff: [
            { condition: 'Aching', pattern: 'Dull, persistent discomfort; often muscle, joint or generalized pain' },
            { condition: 'Sharp', pattern: 'Sudden or intense pain with a pointed sensation' },
            { condition: 'Stabbing', pattern: 'Severe, knife-like pain that may come and go' },
            { condition: 'Burning', pattern: 'Hot, fiery, or irritating sensation; may suggest nerve-related pain' },
            { condition: 'Throbbing', pattern: 'Pulsating pain that comes in waves' },
            { condition: 'Cramping', pattern: 'Tight, squeezing, or spasmodic pain' },
            { condition: 'Shooting', pattern: 'Pain that travels quickly along a path, often nerve-like' },
            { condition: 'Radiating', pattern: 'Pain that spreads from one area to another' },
            { condition: 'Tingling', pattern: 'Pins-and-needles sensation, often nerve-related' },
            { condition: 'Numb', pattern: 'Loss or reduction of sensation, sometimes occurring with pain' },
            { condition: 'Pressure-like', pattern: 'Heavy, squeezing, or fullness sensation' },
            { condition: 'Tender', pattern: 'Painful when touched or pressed' },
            { condition: 'Sore', pattern: 'Generalized discomfort, often after strain, injury, or inflammation' },
            { condition: 'Dull', pattern: 'Low-grade, less intense pain that may be persistent' },
            { condition: 'Gnawing', pattern: 'Deep, persistent discomfort, sometimes used for abdominal pain' },
            { condition: 'Tearing', pattern: 'Severe ripping sensation; requires urgent evaluation depending on location' },
            { condition: 'Electric shock-like', pattern: 'Sudden, jolting nerve-type pain' }
        ],
        probing: [
            {
                condition: '0 - 3',
                question: 'No pain to Mild pain; noticeable but usually does not significantly limit activity',
                symptoms: ['Mild pain', 'No limitation']
            },
            {
                condition: '4 - 6',
                question: 'Moderate pain; interferes with activities, concentration, or sleep',
                symptoms: ['Moderate pain', 'Interferes with sleep', 'Interferes with activities']
            },
            {
                condition: '7 - 10',
                question: 'Severe pain; significantly limits function or may be disabling',
                symptoms: ['Severe pain', 'Disabling', 'Limits function']
            }
        ],
        redFlags: [
            'Chest pain with shortness of breath, sweating, nausea, or radiation to arm/jaw',
            'Sudden severe headache, especially "worst headache of life"',
            'New weakness, facial droop, confusion, or difficulty speaking',
            'Severe abdominal pain with fever, persistent vomiting, fainting, or rigid abdomen',
            'Back pain with loss of bowel or bladder control',
            'Pain after major trauma',
            'Severe pain with a cold, pale, numb, or swollen limb',
            'Sudden severe tearing chest, back, or abdominal pain'
        ],
        imageAfterQuickDiff: 'ReportsPain.png',
        imageAfterRedFlags: 'PQRST.png'

    },
    TeachBack: {
        id: 'TeachBack',
        title: 'Teach Back Method',
        subtitle: 'Click any condition, question, or symptom button to append.',
        articles: [
            { title: 'Teach back - a technique for clear communication', url: 'https://url.uk.m.mimecastprotect.com/s/1u2oCv9D9s7vYGRrFJSlliQHFKT?domain=youtu.be' }
        ],
        quickDiffHeader: 'TEACH-BACK VERIFICATION PROMPTS',
        quickDiff: [
            { condition: 'Comprehension Check', pattern: 'Asking the member to explain the care plan in their own words' },
            { condition: 'Re-education', pattern: 'Clarifying misunderstood steps without assigning blame' }
        ],
        probing: [
            {
                condition: 'GENERAL TEACH BACK',
                question: 'Just so I know I explained it well, can you tell in your own words what we discussed today?',
                symptoms: ['explained clearly', 'needs clarification', 'demonstrated understanding']
            },
            {
                condition: 'DIABETES TEACH BACK',
                question: 'How will you check your blood sugar at home? What will you do if your blood sugar is too high or too low?',
                symptoms: ['checked blood sugar', 'high/low plan understood']
            },
            {
                condition: 'HYPERTENSION TEACH BACK',
                question: 'How will you monitor your blood pressure at home? When should you contact your doctor about your readings?',
                symptoms: ['monitored BP', 'contact criteria understood']
            }
        ],
        guideContent: {
            videoTitle: 'Teach back - a technique for clear communication',
            videoUrl: 'https://url.uk.m.mimecastprotect.com/s/1u2oCv9D9s7vYGRrFJSlliQHFKT?domain=youtu.be',
            imageUrl: 'TeachBack.png',
            introText: [
                'Teach-back, also known as the "show-me" method, is a health communication strategy used to ensure that patients or caregivers understand medical information or instructions.',
                'Rather than asking "Do you understand?", the healthcare provider/associate asks the patient to explain information back in their own words.'
            ],
            purposes: [
                'Improve patient understanding',
                'Increase adherence to treatment plans',
                'Improve patient safety and health outcomes',
                'Identify and correct misunderstandings immediately'
            ],
            steps: [
                {
                    title: '1. Explain the information',
                    subPoints: ['Use simple, clear language', 'Focus on 1-3 key points at a time']
                },
                {
                    title: '2. Ask patient to teach it back.',
                    subPoints: [
                        '"To make sure I explained it clearly, can you tell me what you will do when you attend your appointment?"',
                        '"What symptoms would make you call the clinic or go to the emergency room?"'
                    ]
                },
                {
                    title: '3. Assess understanding, listen for inaccuracies or missing information.',
                    subPoints: []
                },
                {
                    title: '4. Clarify and re-teach if needed. Re-explain areas that were misunderstood.',
                    subPoints: []
                },
                {
                    title: '5. Confirm understanding again. Ask patient to teach it once more.',
                    subPoints: []
                }
            ],
            exampleQuestions: [
                '"Just so I know I explained it well, can you tell in your own words what we discussed today?"',
                '"I want to make sure I explained this clearly. Can you tell me in your own words what you\'ll do next?"',
                '"What are the most important things you are taking away from today\'s call?"',
                '"I want to make sure I explained this clearly. Can you tell me in your own words..."',
                '"Just so I know I did a good job explaining..."',
                '"To be sure we\'re on the same page..."',
                '"Can you walk me through how you\'ll do this at home?"'
            ],
            conditionQuestions: [
                {
                    condition: 'Diabetes',
                    questions: [
                        '"How will you check your blood sugar at home?"',
                        '"What will you do if your blood sugar is too high or too low?"',
                        '"Can you explain your meal plan to me?"'
                    ]
                },
                {
                    condition: 'Hypertension',
                    questions: [
                        '"How will you monitor your blood pressure at home?"',
                        '"When should you contact your doctor about your blood pressure readings?"'
                    ]
                },
                {
                    condition: 'Patient Safety',
                    questions: [
                        '"What precautions will you take to prevent falls at home?"',
                        '"How will you use your medical equipment safely?"',
                        '"Can you tell me how you will use the inhaler/device?"'
                    ]
                }
            ]
        }
    }
};