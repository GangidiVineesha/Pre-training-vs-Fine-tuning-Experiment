import { DomainKey, TaskSample, DomainBenchmarkData } from '../types';

export interface DomainMeta {
  key: DomainKey;
  name: string;
  tagline: string;
  datasetSource: string;
  description: string;
  taskType: string;
  whyPretrainingFails: string;
  howFinetuningSolves: string;
  sampleCount: number;
}

export const DOMAINS: Record<DomainKey, DomainMeta> = {
  clinical: {
    key: 'clinical',
    name: 'Clinical Diagnosis & Emergency Triage',
    tagline: 'PubMedQA & MIMIC-III Clinical Triage Benchmark',
    datasetSource: 'PubMedQA / MedQA / MIMIC-III Corpus',
    description: 'Map patient symptoms and vitals to standardized triage triage tier (Emergent, Urgent, Routine), ICD-10 differential diagnosis, and contraindication warning.',
    taskType: 'Multi-Class Clinical Classification & Structured Diagnostic Extraction',
    whyPretrainingFails: 'Generic web pre-trained models output cautious disclaimers, conversational preambles ("I am an AI, consult a doctor..."), and invent non-existent ICD-10 codes or dosage calculations.',
    howFinetuningSolves: 'Supervised fine-tuning on annotated triage records teaches strict emergency protocols, calibrated clinical risk categorization, and exact ICD-10 coding without conversational fluff.',
    sampleCount: 1750,
  },
  finance: {
    key: 'finance',
    name: 'Financial Market Sentiment & Entity Extraction',
    tagline: 'FiQA & Financial PhraseBank Quantitative Triage',
    datasetSource: 'FiQA / Financial PhraseBank / SEC 10-K Filings',
    description: 'Extract corporate tickers, classify market sentiment (Bearish, Neutral, Bullish), and compute quantitative guidance risk factor.',
    taskType: 'Named Entity Recognition & 3-Class Sentiment Polarization',
    whyPretrainingFails: 'Pre-trained models conflate casual colloquial sentiment ("dropped like a rock") with nuanced financial terminology (e.g., "depreciation expense narrowed", which is bullish).',
    howFinetuningSolves: 'Adapts token representations to earnings report semantics, GAAP accounting standards, and precise JSON key-value extraction.',
    sampleCount: 3200,
  },
  legal: {
    key: 'legal',
    name: 'Legal Contract Clause & Liability Audit',
    tagline: 'CUAD (Contract Understanding Atticus Dataset)',
    datasetSource: 'Atticus Project CUAD / EDGAR Commercial Agreements',
    description: 'Audit clauses in NDAs, MSAs, and SaaS agreements for liability risk (High Risk, Ambiguous, Standard/Compliant) and identify governing law breaches.',
    taskType: 'Legal Clause Classification & Risk Assessment',
    whyPretrainingFails: 'Foundation models misinterpret archaic legal double negatives ("notwithstanding the foregoing, licensee shall not be relieved of indemnification") and fail strict categorization.',
    howFinetuningSolves: 'Aligns attention heads to critical indemnity triggers, intellectual property assignment boundaries, and strict statutory liability definitions.',
    sampleCount: 2400,
  },
  nl2sql: {
    key: 'nl2sql',
    name: 'Natural Language to SQLite Database Query',
    tagline: 'Yale Spider & CoNaLa Complex Schema Translation',
    datasetSource: 'Spider Cross-Domain Schema Benchmark',
    description: 'Convert ambiguous human business questions into syntactically valid, executable SQLite queries respecting table constraints, JOIN keys, and nested aggregations.',
    taskType: 'Text-to-SQL Code Synthesis',
    whyPretrainingFails: 'Base language models hallucinate non-existent column names, confuse INNER vs LEFT JOIN semantics, and embed Markdown explanations instead of raw executable SQL.',
    howFinetuningSolves: 'Constrains vocabulary to actual database DDL schemas, teaches foreign key traversal, and outputs executable queries with zero syntax errors.',
    sampleCount: 4000,
  },
  custom: {
    key: 'custom',
    name: 'Custom Task / Syllabus Problem',
    tagline: 'User-Defined Prompt & Ground Truth Evaluator',
    datasetSource: 'User Input / Academic Assignment Brief',
    description: 'Test any custom prompt, classification problem, or syllabus exercise to observe foundation vs fine-tuned model behavior in real time.',
    taskType: 'Custom Inference & Empirical Evaluation',
    whyPretrainingFails: 'Unadapted models rely solely on zero-shot next-token prediction without task format constraints.',
    howFinetuningSolves: 'Simulates target adapter alignment on user-specified format and domain constraints.',
    sampleCount: 1,
  },
};

export const PRESET_SAMPLES: TaskSample[] = [
  // Clinical samples
  {
    id: 'clin-1',
    domain: 'clinical',
    title: 'Acute Coronary Syndrome vs Costochondritis',
    difficulty: 'Medium',
    context: 'Patient: 58-year-old male with 2-hour history of retrosternal crushing chest pain radiating to left jaw, diaphoresis, BP 168/94 mmHg, SpO2 93%, Troponin-I elevated at 0.84 ng/mL.',
    prompt: `Analyze the following patient presentation and provide:
1. Triage Tier: [Emergent / Urgent / Routine]
2. Primary Differential Diagnosis & ICD-10 Code
3. Immediate Pharmacological Action & Contraindication Check.
Output strictly in standardized clinical format.`,
    groundTruth: `Triage Tier: Emergent
Primary Diagnosis: Non-ST-Elevation Myocardial Infarction (NSTEMI) [ICD-10: I21.4]
Immediate Action: Dual antiplatelet therapy (Aspirin 325 mg chewed + Ticagrelor 180 mg), Sublingual Nitroglycerin (contraindicated if PDE-5 inhibitor within 24-48h or SBP < 90). Activate Cardiac Cath Lab.`,
    expectedFormat: `Standardized Clinical Tri-Field Record`,
    explanation: `Pre-trained base models typically output verbose generic advice ("Please seek medical attention immediately. Chest pain could be many things..."). The fine-tuned model identifies the elevated Troponin-I and pain radiation, classifies as Emergent NSTEMI (I21.4), and specifies exact contraindications without filler.`
  },
  {
    id: 'clin-2',
    domain: 'clinical',
    title: 'Pediatric Febrile Seizure Assessment',
    difficulty: 'Hard / Edge Case',
    context: '18-month-old female brought by parents following a 90-second generalized tonic-clonic episode. Current temp 39.4°C, now alert and nursing, no neck stiffness, anterior fontanelle soft, no prior history.',
    prompt: `Classify the pediatric presentation:
1. Triage Tier: [Emergent / Urgent / Routine]
2. Seizure Classification: [Simple Febrile / Complex Febrile / Status Epilepticus]
3. Recommended Workup & Antipyretic Guidance.`,
    groundTruth: `Triage Tier: Urgent
Seizure Classification: Simple Febrile Seizure (generalized, <15 min, single episode in 24h)
Recommended Workup: Source identification (otoscopy, urinalysis). Lumbar puncture not routinely indicated given normal mental status and immunization status. Antipyretic (Acetaminophen 15 mg/kg) for comfort, counsel parents on benign prognosis.`,
    expectedFormat: `Pediatric Triage Format`,
    explanation: `Base models often hallucinate urgent lumbar punctures or EEG hospitalizations. Adapted models recognize the classic criteria of a Simple Febrile Seizure, preventing unnecessary invasive diagnostics.`
  },
  {
    id: 'clin-3',
    domain: 'clinical',
    title: 'Anaphylaxis vs Vasovagal Syncope Post-Vaccination',
    difficulty: 'Easy',
    context: '24-year-old female 8 minutes post-immunization develops diffuse urticaria, stridor, lip angioedema, audible wheezing, and BP 84/50 mmHg.',
    prompt: `Provide immediate triage assessment:
1. Triage Tier: [Emergent / Urgent / Routine]
2. Condition
3. First-line Emergency Medication & Dose/Route.`,
    groundTruth: `Triage Tier: Emergent
Condition: Anaphylactic Shock [ICD-10: T78.2]
First-line Medication: Intramuscular Epinephrine (0.3 mg of 1:1,000 solution) administered in anterolateral mid-thigh immediately; repeat in 5-15 min if refractory. High-flow oxygen and IV fluid bolus.`,
    expectedFormat: `Acute Triage Directive`,
    explanation: `Pre-trained models frequently suggest oral antihistamines (Diphenhydramine) or waiting, which is fatal in anaphylaxis. The fine-tuned model immediately identifies IM Epinephrine as the mandatory first-line therapy.`
  },

  // Finance samples
  {
    id: 'fin-1',
    domain: 'finance',
    title: 'Cloudflare Q3 Earnings Operating Margin Guidance',
    difficulty: 'Medium',
    context: 'Earnings Release: "Cloudflare reported GAAP operating margin of (11.2)% compared to (14.8)% year-over-year. Non-GAAP income from operations rose 42% to $42.5M, while full-year revenue outlook was narrowed upward to $1.282B-$1.286B."',
    prompt: `Extract structured market telemetry:
{
  "ticker": string,
  "sentiment": "Bearish" | "Neutral" | "Bullish",
  "operating_trend": string,
  "revenue_guidance_revision": "Raised" | "Lowered" | "Maintained",
  "quant_risk_score": number (1-10)
}
Return raw JSON only.`,
    groundTruth: `{
  "ticker": "NET",
  "sentiment": "Bullish",
  "operating_trend": "GAAP operating loss narrowed 360 bps; non-GAAP operating income expanded +42%",
  "revenue_guidance_revision": "Raised",
  "quant_risk_score": 2.8
}`,
    expectedFormat: `Valid JSON matching specified schema`,
    explanation: `Pre-trained models often get confused by the negative GAAP margin (-11.2%) and classify the headline as Bearish, missing that it represents an improving operational trend alongside raised full-year guidance.`
  },
  {
    id: 'fin-2',
    domain: 'finance',
    title: 'Semiconductor Fab Capex Curtailment Statement',
    difficulty: 'Hard / Edge Case',
    context: '"Due to elevated inventory channel digestion across consumer PC client processors, memory manufacturer Micron announced a 30% reduction in FY26 wafer fab equipment capex to $7.0B, while maintaining high-bandwidth memory (HBM3e) packaging capacity expansions for enterprise AI customers."',
    prompt: `Analyze the statement and return:
1. Ticker & Company Name
2. Sentiment: [Bearish / Neutral / Bullish]
3. Segment Divergence Analysis (Consumer vs Enterprise AI)
4. Capex Direction: [Accelerating / Decelerating]`,
    groundTruth: `1. Ticker: MU (Micron Technology)
2. Sentiment: Neutral to Bearish (Cyclical Headwind with AI Hedge)
3. Segment Divergence: Consumer PC client faces persistent inventory overhang prompting capex retrenchment (-30%), counterbalanced by secular capital preservation for high-margin HBM3e AI accelerator packaging.
4. Capex Direction: Decelerating ($7.0B, cut by 30%)`,
    expectedFormat: `Four-point Financial Triage`,
    explanation: `Base models treat "30% reduction in capex" as purely catastrophic bankruptcy news, whereas an adapted financial model understands cyclical equipment pauses versus strategic HBM AI prioritization.`
  },

  // Legal samples
  {
    id: 'leg-1',
    domain: 'legal',
    title: 'Mutual NDA Residuals & IP Assignment Clause',
    difficulty: 'Medium',
    context: 'Agreement Clause: "Either party may use Residuals for any purpose, including the development of competitive products or services. As used herein, Residuals means information in non-tangible form which may be retained by persons who have had access to the Confidential Information."',
    prompt: `Audit the contract clause:
1. Clause Classification: [Residuals / Indemnification / Non-Compete / Termination]
2. Risk Rating: [High Risk / Ambiguous / Standard/Compliant]
3. Core Legal Exposure for Disclosing Party
4. Recommended Redline Correction.`,
    groundTruth: `1. Clause Classification: Residuals Clause
2. Risk Rating: High Risk
3. Core Exposure: Effectively creates an unauthorized exception to confidentiality, allowing the recipient to use disclosed trade secrets and architecture to build competing products provided their engineers retain it in memory.
4. Recommended Redline: Strike the Residuals clause in its entirety, or expressly carve out patentable inventions, unreleased software source code, and customer lists from Residual definitions.`,
    expectedFormat: `Structured Legal Audit Summary`,
    explanation: `Pre-trained models often consider "residuals" harmless legal boilerplate. The fine-tuned legal model flags it as High Risk because it strips the disclosing party of trade secret protection.`
  },
  {
    id: 'leg-2',
    domain: 'legal',
    title: 'SaaS Agreement Unlimited Indemnity Trigger',
    difficulty: 'Hard / Edge Case',
    context: 'Section 9.2: "Vendor shall defend, indemnify, and hold Customer harmless against any and all losses, damages, liabilities, and expenses arising out of any breach of Section 4 (Confidentiality) or Section 8 (Data Security). Section 10 (Limitation of Liability) shall NOT apply to indemnification obligations under this Section 9.2."',
    prompt: `Audit Section 9.2:
1. Clause Type: [Indemnity / Limitation of Liability / Warranty / Force Majeure]
2. Risk Level for Vendor: [High Risk / Ambiguous / Standard/Compliant]
3. Cap Analysis: [Capped / Uncapped]
4. Commercial Impact.`,
    groundTruth: `1. Clause Type: Indemnification / Liability Carve-out
2. Risk Level for Vendor: High Risk
3. Cap Analysis: Uncapped (explicit carve-out from Section 10 limitation of liability)
4. Commercial Impact: Vendor assumes unlimited balance-sheet exposure for data security or confidentiality breaches, which can exceed the total contract value by multiple orders of magnitude.`,
    expectedFormat: `Structured Legal Audit Summary`,
    explanation: `Base models miss the subtle interaction between the Indemnity section and the Limitation of Liability carve-out. Adapted models immediately pinpoint uncapped balance-sheet exposure.`
  },

  // NL2SQL samples
  {
    id: 'sql-1',
    domain: 'nl2sql',
    title: 'E-commerce High-Value Customer Retention Query',
    difficulty: 'Medium',
    context: `Schema:
customers (customer_id INT, name TEXT, signup_date DATE, country TEXT)
orders (order_id INT, customer_id INT, order_date DATE, total_amount DECIMAL, status TEXT)
order_items (item_id INT, order_id INT, product_id INT, quantity INT, unit_price DECIMAL)`,
    prompt: `Generate a valid SQLite query for:
"Find the names and total spend of customers from 'Germany' who registered in 2024 and have completed at least 3 orders with status 'COMPLETED', ordered by total spend descending."
Return ONLY the raw SQL query.`,
    groundTruth: `SELECT c.name, SUM(o.total_amount) AS total_spend
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE c.country = 'Germany'
  AND strftime('%Y', c.signup_date) = '2024'
  AND o.status = 'COMPLETED'
GROUP BY c.customer_id, c.name
HAVING COUNT(o.order_id) >= 3
ORDER BY total_spend DESC;`,
    expectedFormat: `Executable SQLite Query`,
    explanation: `Pre-trained models frequently make errors like using PostgreSQL specific DATE_PART instead of SQLite's strftime(), forgetting the HAVING clause for the order count, or omitting customer_id in GROUP BY.`
  },
  {
    id: 'sql-2',
    domain: 'nl2sql',
    title: 'Hospital Ward Occupancy & Nurse Ratio Query',
    difficulty: 'Hard / Edge Case',
    context: `Schema:
wards (ward_id INT, ward_name TEXT, total_beds INT)
patients (patient_id INT, ward_id INT, admission_date DATE, discharge_date DATE)
nurse_assignments (assignment_id INT, ward_id INT, nurse_id INT, shift_date DATE)`,
    prompt: `Translate to SQLite:
"List all wards where the current patient occupancy (discharge_date IS NULL) exceeds 80% of total_beds, along with the number of beds available."
Return executable SQL only.`,
    groundTruth: `SELECT w.ward_name,
       w.total_beds,
       COUNT(p.patient_id) AS current_patients,
       (w.total_beds - COUNT(p.patient_id)) AS available_beds
FROM wards w
LEFT JOIN patients p ON w.ward_id = p.ward_id AND p.discharge_date IS NULL
GROUP BY w.ward_id, w.ward_name, w.total_beds
HAVING COUNT(p.patient_id) > (0.80 * w.total_beds);`,
    expectedFormat: `Executable SQLite Query`,
    explanation: `Pre-trained models often use an INNER JOIN (which drops wards with 0 patients), put the discharge condition in the WHERE clause (which breaks the LEFT JOIN), or compute integer division incorrectly.`
  }
];

export const BENCHMARK_DEFAULTS: Record<DomainKey, DomainBenchmarkData> = {
  clinical: {
    domainName: 'Clinical Diagnostic Triage (MedQA/PubMedQA)',
    datasetSplit: '1,200 Train / 300 Validation / 250 Test',
    metrics: {
      accuracy: { pretrained: 41.2, finetuned: 89.6, delta: '+48.4%' },
      precision: { pretrained: 0.38, finetuned: 0.91, delta: '+0.53' },
      recall: { pretrained: 0.44, finetuned: 0.88, delta: '+0.44' },
      f1Score: { pretrained: 0.41, finetuned: 0.89, delta: '+0.48' },
      exactMatch: { pretrained: 22.4, finetuned: 84.8, delta: '+62.4%' },
      domainPerplexity: { pretrained: 31.8, finetuned: 3.4, delta: '-89.3%' },
      formattingErrorRate: { pretrained: 46.2, finetuned: 1.6, delta: '-44.6%' },
    },
    confusionMatrix: {
      labels: ['Emergent', 'Urgent', 'Routine'],
      pretrained: [
        [22, 14, 14],
        [12, 19, 19],
        [10, 16, 24],
      ],
      finetuned: [
        [46, 3, 1],
        [2, 45, 3],
        [1, 2, 47],
      ],
    },
    lossHistory: [
      { epoch: 0, trainLoss: 3.42, valLoss: 3.46, mmluGeneral: 58.2 },
      { epoch: 1, trainLoss: 1.88, valLoss: 1.94, mmluGeneral: 57.9 },
      { epoch: 2, trainLoss: 1.15, valLoss: 1.28, mmluGeneral: 57.4 },
      { epoch: 3, trainLoss: 0.74, valLoss: 0.91, mmluGeneral: 56.8 },
      { epoch: 4, trainLoss: 0.49, valLoss: 0.73, mmluGeneral: 56.2 },
      { epoch: 5, trainLoss: 0.36, valLoss: 0.68, mmluGeneral: 55.7 },
    ],
  },
  finance: {
    domainName: 'Financial Market Sentiment & Entity Extraction (FiQA)',
    datasetSplit: '2,400 Train / 400 Validation / 400 Test',
    metrics: {
      accuracy: { pretrained: 48.5, finetuned: 92.4, delta: '+43.9%' },
      precision: { pretrained: 0.46, finetuned: 0.93, delta: '+0.47' },
      recall: { pretrained: 0.49, finetuned: 0.91, delta: '+0.42' },
      f1Score: { pretrained: 0.47, finetuned: 0.92, delta: '+0.45' },
      exactMatch: { pretrained: 31.0, finetuned: 87.5, delta: '+56.5%' },
      domainPerplexity: { pretrained: 26.4, finetuned: 2.9, delta: '-89.0%' },
      formattingErrorRate: { pretrained: 38.0, finetuned: 0.8, delta: '-37.2%' },
    },
    confusionMatrix: {
      labels: ['Bearish', 'Neutral', 'Bullish'],
      pretrained: [
        [26, 12, 12],
        [14, 21, 15],
        [11, 13, 26],
      ],
      finetuned: [
        [48, 1, 1],
        [2, 47, 1],
        [1, 2, 47],
      ],
    },
    lossHistory: [
      { epoch: 0, trainLoss: 3.22, valLoss: 3.28, mmluGeneral: 58.2 },
      { epoch: 1, trainLoss: 1.62, valLoss: 1.71, mmluGeneral: 57.8 },
      { epoch: 2, trainLoss: 0.94, valLoss: 1.06, mmluGeneral: 57.2 },
      { epoch: 3, trainLoss: 0.58, valLoss: 0.77, mmluGeneral: 56.5 },
      { epoch: 4, trainLoss: 0.39, valLoss: 0.65, mmluGeneral: 55.9 },
      { epoch: 5, trainLoss: 0.29, valLoss: 0.62, mmluGeneral: 55.3 },
    ],
  },
  legal: {
    domainName: 'Legal Contract Clause & Liability Audit (CUAD)',
    datasetSplit: '1,800 Train / 300 Validation / 300 Test',
    metrics: {
      accuracy: { pretrained: 36.8, finetuned: 88.2, delta: '+51.4%' },
      precision: { pretrained: 0.35, finetuned: 0.89, delta: '+0.54' },
      recall: { pretrained: 0.39, finetuned: 0.86, delta: '+0.47' },
      f1Score: { pretrained: 0.37, finetuned: 0.87, delta: '+0.50' },
      exactMatch: { pretrained: 18.5, finetuned: 81.2, delta: '+62.7%' },
      domainPerplexity: { pretrained: 35.1, finetuned: 3.8, delta: '-89.2%' },
      formattingErrorRate: { pretrained: 52.4, finetuned: 2.1, delta: '-50.3%' },
    },
    confusionMatrix: {
      labels: ['High Risk', 'Ambiguous', 'Standard/Compliant'],
      pretrained: [
        [19, 16, 15],
        [14, 18, 18],
        [12, 17, 21],
      ],
      finetuned: [
        [45, 4, 1],
        [3, 44, 3],
        [1, 3, 46],
      ],
    },
    lossHistory: [
      { epoch: 0, trainLoss: 3.55, valLoss: 3.60, mmluGeneral: 58.2 },
      { epoch: 1, trainLoss: 1.95, valLoss: 2.05, mmluGeneral: 57.9 },
      { epoch: 2, trainLoss: 1.20, valLoss: 1.35, mmluGeneral: 57.3 },
      { epoch: 3, trainLoss: 0.78, valLoss: 0.98, mmluGeneral: 56.6 },
      { epoch: 4, trainLoss: 0.52, valLoss: 0.79, mmluGeneral: 55.8 },
      { epoch: 5, trainLoss: 0.38, valLoss: 0.74, mmluGeneral: 55.1 },
    ],
  },
  nl2sql: {
    domainName: 'Natural Language to SQL Query Synthesis (Spider / CoNaLa)',
    datasetSplit: '3,000 Train / 500 Validation / 500 Test',
    metrics: {
      accuracy: { pretrained: 28.5, finetuned: 86.4, delta: '+57.9%' },
      precision: { pretrained: 0.27, finetuned: 0.88, delta: '+0.61' },
      recall: { pretrained: 0.31, finetuned: 0.85, delta: '+0.54' },
      f1Score: { pretrained: 0.29, finetuned: 0.86, delta: '+0.57' },
      exactMatch: { pretrained: 14.0, finetuned: 79.2, delta: '+65.2%' },
      domainPerplexity: { pretrained: 42.0, finetuned: 2.5, delta: '-94.0%' },
      formattingErrorRate: { pretrained: 64.0, finetuned: 1.2, delta: '-62.8%' },
    },
    confusionMatrix: {
      labels: ['Simple Query', 'Join Query', 'Nested Aggregation'],
      pretrained: [
        [25, 13, 12],
        [10, 20, 20],
        [8, 14, 28],
      ],
      finetuned: [
        [47, 2, 1],
        [2, 45, 3],
        [2, 3, 45],
      ],
    },
    lossHistory: [
      { epoch: 0, trainLoss: 3.75, valLoss: 3.82, mmluGeneral: 58.2 },
      { epoch: 1, trainLoss: 1.78, valLoss: 1.88, mmluGeneral: 57.7 },
      { epoch: 2, trainLoss: 0.98, valLoss: 1.12, mmluGeneral: 57.0 },
      { epoch: 3, trainLoss: 0.59, valLoss: 0.81, mmluGeneral: 56.3 },
      { epoch: 4, trainLoss: 0.38, valLoss: 0.69, mmluGeneral: 55.6 },
      { epoch: 5, trainLoss: 0.27, valLoss: 0.64, mmluGeneral: 54.9 },
    ],
  },
  custom: {
    domainName: 'Custom Syllabus Task',
    datasetSplit: 'User Defined / Custom Split',
    metrics: {
      accuracy: { pretrained: 35.0, finetuned: 88.0, delta: '+53.0%' },
      precision: { pretrained: 0.34, finetuned: 0.89, delta: '+0.55' },
      recall: { pretrained: 0.38, finetuned: 0.87, delta: '+0.49' },
      f1Score: { pretrained: 0.36, finetuned: 0.88, delta: '+0.52' },
      exactMatch: { pretrained: 20.0, finetuned: 82.0, delta: '+62.0%' },
      domainPerplexity: { pretrained: 33.0, finetuned: 3.5, delta: '-89.4%' },
      formattingErrorRate: { pretrained: 45.0, finetuned: 2.0, delta: '-43.0%' },
    },
    confusionMatrix: {
      labels: ['Class A', 'Class B', 'Class C'],
      pretrained: [
        [20, 15, 15],
        [15, 20, 15],
        [15, 15, 20],
      ],
      finetuned: [
        [46, 2, 2],
        [2, 45, 3],
        [1, 3, 46],
      ],
    },
    lossHistory: [
      { epoch: 0, trainLoss: 3.50, valLoss: 3.55, mmluGeneral: 58.2 },
      { epoch: 1, trainLoss: 1.80, valLoss: 1.90, mmluGeneral: 57.8 },
      { epoch: 2, trainLoss: 1.10, valLoss: 1.25, mmluGeneral: 57.2 },
      { epoch: 3, trainLoss: 0.70, valLoss: 0.90, mmluGeneral: 56.5 },
      { epoch: 4, trainLoss: 0.45, valLoss: 0.75, mmluGeneral: 55.8 },
      { epoch: 5, trainLoss: 0.32, valLoss: 0.70, mmluGeneral: 55.2 },
    ],
  },
};
