// =============================================================================
// ExamVault — Assam Police PART B
// Bilingual question pool — Quantitative Aptitude (police-quant) + English (police-english)
//
// Format (CRITICAL — every field is bilingual EN + অসমীয়া):
//   question  -> "English\nঅসমীয়া"
//   option    -> "English / অসমীয়া"
//   expl      -> "English\nঅসমীয়া"
//
// police-quant   : 30 questions (Percentage, Profit-Loss, Interest, Time-Work,
//                                   Ratio, Average, Mensuration — class X level)
// police-english : 30 questions (Grammar, Vocabulary, Sentence Correction)
// Total = 60 bilingual items.
//
// Per the task spec, numeric digits stay as digits (NOT transliterated to
// Assamese numerals); surrounding words/units are translated to Assamese.
//
// correctAnswerIndex is distributed evenly (8 × 0, 8 × 1, 7 × 2, 7 × 3)
// within each subject so test slicing produces a balanced answer key.
// =============================================================================
import type { QuestionPoolMap } from './structure';

export const POLICE_POOLS_B: QuestionPoolMap = {
  // ===========================================================================
  // police-quant — Quantitative Aptitude (30)
  // ===========================================================================
  'police-quant': [
    // --- Percentage (5) ---
    {
      question: 'What is 25% of 240?\n240 ৰ 25% কিমান?',
      options: ['60 / 60', '50 / 50', '55 / 55', '65 / 65'],
      correctAnswerIndex: 0,
      explanation:
        '25% of 240 = (25/100) × 240 = 60.\n240 ৰ 25% = (25/100) × 240 = 60।',
      subjectTopic: 'Percentage',
      marks: 1,
    },
    {
      question:
        'If 35% of a number is 70, what is the number?\nযদি কোনো সংখ্যাৰ 35% হয় 70, তেন্তে সংখ্যাটো কিমান?',
      options: ['150 / 150', '200 / 200', '250 / 250', '245 / 245'],
      correctAnswerIndex: 1,
      explanation:
        'Let the number be x. Then 35% of x = 70, so x = 70 × 100 / 35 = 200.\nসংখ্যাটো x হওক। তেন্তে x ৰ 35% = 70, গতিকে x = 70 × 100 / 35 = 200।',
      subjectTopic: 'Percentage',
      marks: 1,
    },
    {
      question:
        'A man spends 75% of his income. If he saves ₹4,000, what is his income?\nএজন মানুহে তেওঁৰ আয়ৰ 75% খৰচ কৰে। যদি তেওঁ ₹4,000 পূজি কৰে, তেন্তে তেওঁৰ আয় কিমান?',
      options: [
        '₹12,000 / 12,000 টকা',
        '₹14,000 / 14,000 টকা',
        '₹16,000 / 16,000 টকা',
        '₹18,000 / 18,000 টকা',
      ],
      correctAnswerIndex: 2,
      explanation:
        'If 75% is spent, 25% is saved. 25% of income = ₹4,000, so income = 4,000 × 100 / 25 = ₹16,000.\nযদি 75% খৰচ হয়, তেন্তে 25% পূজি হয়। আয়ৰ 25% = ₹4,000, গতিকে আয় = 4,000 × 100 / 25 = ₹16,000।',
      subjectTopic: 'Percentage',
      marks: 1,
    },
    {
      question:
        'A candidate got 450 votes out of 900. What percentage of votes did he get?\nএজন প্ৰাৰ্থীয়ে 900 ৰ ভিতৰত 450 ভোট পালে। তেওঁ কিমান শতাংশ ভোট পালে?',
      options: ['45% / 45%', '40% / 40%', '55% / 55%', '50% / 50%'],
      correctAnswerIndex: 3,
      explanation:
        'Percentage = (450 / 900) × 100 = 50%.\nশতাংশ = (450 / 900) × 100 = 50%।',
      subjectTopic: 'Percentage',
      marks: 1,
    },
    {
      question: 'What is 12.5% of 80?\n80 ৰ 12.5% কিমান?',
      options: ['10 / 10', '8 / 8', '12 / 12', '16 / 16'],
      correctAnswerIndex: 0,
      explanation:
        '12.5% of 80 = (12.5 / 100) × 80 = 10.\n80 ৰ 12.5% = (12.5 / 100) × 80 = 10।',
      subjectTopic: 'Percentage',
      marks: 1,
    },

    // --- Profit-Loss (5) ---
    {
      question:
        'A man buys a watch for ₹500 and sells it for ₹600. What is his profit percentage?\nএজন মানুহে ₹500 ত এটা ঘড়ি কিনি ₹600 ত বিক্ৰী কৰে। তেওঁৰ লাভৰ শতাংশ কিমান?',
      options: ['15% / 15%', '20% / 20%', '25% / 25%', '10% / 10%'],
      correctAnswerIndex: 1,
      explanation:
        'Profit = 600 − 500 = ₹100. Profit % = (100 / 500) × 100 = 20%.\nলাভ = 600 − 500 = ₹100। লাভ % = (100 / 500) × 100 = 20%।',
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },
    {
      question:
        'An article bought for ₹800 is sold for ₹680. Find the loss percentage.\n₹800 ত কিনা এটা সামগ্ৰী ₹680 ত বিক্ৰী কৰা হ’ল। লোকচানৰ শতাংশ নিৰ্ণয় কৰা।',
      options: ['20% / 20%', '25% / 25%', '15% / 15%', '10% / 10%'],
      correctAnswerIndex: 2,
      explanation:
        'Loss = 800 − 680 = ₹120. Loss % = (120 / 800) × 100 = 15%.\nলোকচান = 800 − 680 = ₹120। লোকচান % = (120 / 800) × 100 = 15%।',
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },
    {
      question:
        'A pen is sold for ₹1,100 at a profit of 10%. What is its cost price?\nএটা কলম 10% লাভত ₹1,100 ত বিক্ৰী কৰা হয়। ইয়াৰ ক্ৰয়মূল্য কিমান?',
      options: [
        '₹990 / 990 টকা',
        '₹1,010 / 1,010 টকা',
        '₹1,110 / 1,110 টকা',
        '₹1,000 / 1,000 টকা',
      ],
      correctAnswerIndex: 3,
      explanation:
        'CP = SP × 100 / (100 + profit%) = 1100 × 100 / 110 = ₹1,000.\nক্ৰয়মূল্য = বিক্ৰয়মূল্য × 100 / (100 + লাভ%) = 1100 × 100 / 110 = ₹1,000।',
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },
    {
      question:
        'A book is bought for ₹120 and sold for ₹150. What is the profit?\nএখন কিতাপ ₹120 ত কিনি ₹150 ত বিক্ৰী কৰা হ’ল। লাভ কিমান?',
      options: [
        '₹30 / 30 টকা',
        '₹25 / 25 টকা',
        '₹35 / 35 টকা',
        '₹20 / 20 টকা',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Profit = SP − CP = 150 − 120 = ₹30.\nলাভ = বিক্ৰয়মূল্য − ক্ৰয়মূল্য = 150 − 120 = ₹30।',
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },
    {
      question:
        'An article costing ₹250 is sold at a loss of 20%. What is the selling price?\n₹250 মূল্যৰ এটা সামগ্ৰী 20% লোকচানত বিক্ৰী কৰা হ’ল। বিক্ৰয়মূল্য কিমান?',
      options: [
        '₹220 / 220 টকা',
        '₹200 / 200 টকা',
        '₹210 / 210 টকা',
        '₹180 / 180 টকা',
      ],
      correctAnswerIndex: 1,
      explanation:
        'SP = CP × (100 − loss%) / 100 = 250 × 80 / 100 = ₹200.\nবিক্ৰয়মূল্য = ক্ৰয়মূল্য × (100 − লোকচান%) / 100 = 250 × 80 / 100 = ₹200।',
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },

    // --- Interest (4) ---
    {
      question:
        'Find the simple interest on ₹2,000 at 5% per annum for 3 years.\n₹2,000 ৰ ওপৰত 5% বাৰ্ষিক হাৰত 3 বছৰৰ সৰল সুদ নিৰ্ণয় কৰা।',
      options: [
        '₹250 / 250 টকা',
        '₹350 / 350 টকা',
        '₹300 / 300 টকা',
        '₹400 / 400 টকা',
      ],
      correctAnswerIndex: 2,
      explanation:
        'SI = P × R × T / 100 = 2000 × 5 × 3 / 100 = ₹300.\nসৰল সুদ = মূলধন × হাৰ × সময় / 100 = 2000 × 5 × 3 / 100 = ₹300।',
      subjectTopic: 'Interest',
      marks: 1,
    },
    {
      question:
        'The simple interest on a sum is ₹480 at 8% per annum for 3 years. Find the principal.\nএটা মূলধনৰ ওপৰত 8% বাৰ্ষিক হাৰত 3 বছৰত সৰল সুদ ₹480 হয়। মূলধন উলিওৱা।',
      options: [
        '₹1,800 / 1,800 টকা',
        '₹2,200 / 2,200 টকা',
        '₹1,500 / 1,500 টকা',
        '₹2,000 / 2,000 টকা',
      ],
      correctAnswerIndex: 3,
      explanation:
        'P = SI × 100 / (R × T) = 480 × 100 / (8 × 3) = ₹2,000.\nমূলধন = সুদ × 100 / (হাৰ × সময়) = 480 × 100 / (8 × 3) = ₹2,000।',
      subjectTopic: 'Interest',
      marks: 1,
    },
    {
      question:
        'Find the simple interest on ₹5,000 at 6% per annum for 1 year.\n₹5,000 ৰ ওপৰত 6% বাৰ্ষিক হাৰত 1 বছৰৰ সৰল সুদ নিৰ্ণয় কৰা।',
      options: [
        '₹300 / 300 টকা',
        '₹250 / 250 টকা',
        '₹350 / 350 টকা',
        '₹600 / 600 টকা',
      ],
      correctAnswerIndex: 0,
      explanation:
        'SI = P × R × T / 100 = 5000 × 6 × 1 / 100 = ₹300.\nসৰল সুদ = 5000 × 6 × 1 / 100 = ₹300।',
      subjectTopic: 'Interest',
      marks: 1,
    },
    {
      question:
        'At what rate will ₹1,000 amount to ₹1,200 in 2 years (simple interest)?\nকিমান হাৰত ₹1,000 টকাই 2 বছৰত ₹1,200 হ’ব (সৰল সুদ)?',
      options: ['8% / 8%', '10% / 10%', '12% / 12%', '5% / 5%'],
      correctAnswerIndex: 1,
      explanation:
        'SI = 1200 − 1000 = ₹200. R = SI × 100 / (P × T) = 200 × 100 / (1000 × 2) = 10% per annum.\nসুদ = 1200 − 1000 = ₹200। হাৰ = 200 × 100 / (1000 × 2) = 10% বাৰ্ষিক।',
      subjectTopic: 'Interest',
      marks: 1,
    },

    // --- Time-Work (4) ---
    {
      question:
        'A can do a piece of work in 10 days and B in 15 days. How many days will they take together?\nA এ 10 দিনত আৰু B এ 15 দিনত এটা কাম কৰিব পাৰে। দুয়ো একেলগে কিমান দিন ল’ব?',
      options: [
        '5 days / 5 দিন',
        '8 days / 8 দিন',
        '6 days / 6 দিন',
        '12 days / 12 দিন',
      ],
      correctAnswerIndex: 2,
      explanation:
        'Together: 1/10 + 1/15 = 1/6 per day, so they finish in 6 days.\nএকেলগে: 1/10 + 1/15 = 1/6 প্ৰতিদিন, গতিকে 6 দিনত সম্পূৰ্ণ কৰে।',
      subjectTopic: 'Time-Work',
      marks: 1,
    },
    {
      question:
        'A does 1/4 of a work in 5 days. In how many days will he finish the whole work?\nA এ 5 দিনত এটা কামৰ 1/4 অংশ কৰে। সম্পূৰ্ণ কামটো কিমান দিনত শেষ কৰিব?',
      options: [
        '15 days / 15 দিন',
        '25 days / 25 দিন',
        '10 days / 10 দিন',
        '20 days / 20 দিন',
      ],
      correctAnswerIndex: 3,
      explanation:
        '1/4 work in 5 days, so whole work in 5 × 4 = 20 days.\n5 দিনত 1/4 কাম, গতিকে সম্পূৰ্ণ কাম 5 × 4 = 20 দিনত।',
      subjectTopic: 'Time-Work',
      marks: 1,
    },
    {
      question:
        'If 12 men finish a job in 6 days, how many days will 8 men take?\nযদি 12 জন মানুহে 6 দিনত এটা কাম শেষ কৰে, তেন্তে 8 জন মানুহে কিমান দিন ল’ব?',
      options: [
        '9 days / 9 দিন',
        '8 days / 8 দিন',
        '10 days / 10 দিন',
        '12 days / 12 দিন',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Men × days = constant. 12 × 6 = 8 × d, so d = 72 / 8 = 9 days.\nমানুহ × দিন = ধ্ৰুৱক। 12 × 6 = 8 × d, গতিকে d = 72 / 8 = 9 দিন।',
      subjectTopic: 'Time-Work',
      marks: 1,
    },
    {
      question:
        'A and B together finish a task in 4 days; A alone in 6 days. In how many days will B alone finish it?\nA আৰু B একেলগে 4 দিনত এটা কাম শেষ কৰে; A অকলে 6 দিনত। B অকলে কিমান দিনত শেষ কৰিব?',
      options: [
        '10 days / 10 দিন',
        '12 days / 12 দিন',
        '8 days / 8 দিন',
        '15 days / 15 দিন',
      ],
      correctAnswerIndex: 1,
      explanation:
        "B's 1-day work = 1/4 − 1/6 = 1/12, so B alone takes 12 days.\nB ৰ এদিনৰ কাম = 1/4 − 1/6 = 1/12, গতিকে B অকলে 12 দিন লয়।",
      subjectTopic: 'Time-Work',
      marks: 1,
    },

    // --- Ratio (4) ---
    {
      question:
        'Two numbers are in the ratio 3:5 and their sum is 64. Find the smaller number.\nদুটা সংখ্যা 3:5 অনুপাতত আছে আৰু তেওঁলোকৰ যোগফল 64। সৰু সংখ্যাটো উলিওৱা।',
      options: ['18 / 18', '20 / 20', '24 / 24', '30 / 30'],
      correctAnswerIndex: 2,
      explanation:
        'Smaller = (3 / 8) × 64 = 24.\nসৰু সংখ্যা = (3 / 8) × 64 = 24।',
      subjectTopic: 'Ratio',
      marks: 1,
    },
    {
      question:
        'Divide ₹1,200 between A and B in the ratio 2:3. What is A’s share?\n₹1,200 টকা A আৰু B ৰ মাজত 2:3 অনুপাতত ভগাওক। A ৰ অংশ কিমান?',
      options: [
        '₹400 / 400 টকা',
        '₹500 / 500 টকা',
        '₹720 / 720 টকা',
        '₹480 / 480 টকা',
      ],
      correctAnswerIndex: 3,
      explanation:
        "A's share = (2 / 5) × 1200 = ₹480.\nA ৰ অংশ = (2 / 5) × 1200 = ₹480।",
      subjectTopic: 'Ratio',
      marks: 1,
    },
    {
      question:
        'If 5 pens cost ₹75, what is the cost of 8 pens?\nযদি 5 টা কলমৰ মূল্য ₹75, তেন্তে 8 টা কলমৰ মূল্য কিমান?',
      options: [
        '₹120 / 120 টকা',
        '₹100 / 100 টকা',
        '₹125 / 125 টকা',
        '₹150 / 150 টকা',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Cost of 1 pen = 75 / 5 = ₹15; cost of 8 pens = 15 × 8 = ₹120.\n1 টা কলমৰ মূল্য = 75 / 5 = ₹15; 8 টাৰ মূল্য = 15 × 8 = ₹120।',
      subjectTopic: 'Ratio',
      marks: 1,
    },
    {
      question:
        'Two numbers are in the ratio 4:7 and their difference is 21. Find the larger number.\nদুটা সংখ্যা 4:7 অনুপাতত আছে আৰু তেওঁলোকৰ পাৰ্থক্য 21। ডাঙৰ সংখ্যাটো উলিওৱা।',
      options: ['28 / 28', '49 / 49', '35 / 35', '42 / 42'],
      correctAnswerIndex: 1,
      explanation:
        'Difference of ratio parts = 7 − 4 = 3. Larger = (7 / 3) × 21 = 49.\nঅনুপাতৰ পাৰ্থক্য = 7 − 4 = 3। ডাঙৰ সংখ্যা = (7 / 3) × 21 = 49।',
      subjectTopic: 'Ratio',
      marks: 1,
    },

    // --- Average (4) ---
    {
      question: 'Find the average of 5, 10, 15, 20 and 25.\n5, 10, 15, 20 আৰু 25 ৰ গড় উলিওৱা।',
      options: ['12 / 12', '18 / 18', '15 / 15', '20 / 20'],
      correctAnswerIndex: 2,
      explanation:
        'Average = (5 + 10 + 15 + 20 + 25) / 5 = 75 / 5 = 15.\nগড় = (5 + 10 + 15 + 20 + 25) / 5 = 75 / 5 = 15।',
      subjectTopic: 'Average',
      marks: 1,
    },
    {
      question:
        'The average of 6 numbers is 12. What is their sum?\n6 টা সংখ্যাৰ গড় 12। তেওঁলোকৰ যোগফল কিমান?',
      options: ['60 / 60', '70 / 70', '75 / 75', '72 / 72'],
      correctAnswerIndex: 3,
      explanation:
        'Sum = average × count = 12 × 6 = 72.\nযোগফল = গড় × সংখ্যা = 12 × 6 = 72।',
      subjectTopic: 'Average',
      marks: 1,
    },
    {
      question:
        'The average weight of 8 boys is 50 kg. What is their total weight?\n8 টা ল’ৰাৰ গড় ওজন 50 কিলোগ্ৰাম। তেওঁলোকৰ মুঠ ওজন কিমান?',
      options: [
        '400 kg / 400 কিলোগ্ৰাম',
        '360 kg / 360 কিলোগ্ৰাম',
        '440 kg / 440 কিলোগ্ৰাম',
        '380 kg / 380 কিলোগ্ৰাম',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Total weight = average × count = 50 × 8 = 400 kg.\nমুঠ ওজন = গড় × সংখ্যা = 50 × 8 = 400 কিলোগ্ৰাম।',
      subjectTopic: 'Average',
      marks: 1,
    },
    {
      question:
        'Find the average of 10, 20, 30, 40, 50 and 60.\n10, 20, 30, 40, 50 আৰু 60 ৰ গড় উলিওৱা।',
      options: ['30 / 30', '35 / 35', '40 / 40', '45 / 45'],
      correctAnswerIndex: 1,
      explanation:
        'Average = (10 + 20 + 30 + 40 + 50 + 60) / 6 = 210 / 6 = 35.\nগড় = (10 + 20 + 30 + 40 + 50 + 60) / 6 = 210 / 6 = 35।',
      subjectTopic: 'Average',
      marks: 1,
    },

    // --- Mensuration (4) ---
    {
      question:
        'Find the area of a rectangle 12 m long and 8 m broad.\n12 মিটাৰ দীঘল আৰু 8 মিটাৰ বহল এটা আয়তৰ কালি উলিওৱা।',
      options: [
        '40 m² / 40 বৰ্গ মিটাৰ',
        '80 m² / 80 বৰ্গ মিটাৰ',
        '96 m² / 96 বৰ্গ মিটাৰ',
        '100 m² / 100 বৰ্গ মিটাৰ',
      ],
      correctAnswerIndex: 2,
      explanation:
        'Area = length × breadth = 12 × 8 = 96 m².\nকালি = দৈৰ্ঘ্য × প্ৰস্থ = 12 × 8 = 96 বৰ্গ মিটাৰ।',
      subjectTopic: 'Mensuration',
      marks: 1,
    },
    {
      question:
        'Find the volume of a cube of side 5 cm.\nবাহু 5 চে.মি. থকা এটা ঘনকৰ আয়তন উলিওৱা।',
      options: [
        '25 cm³ / 25 ঘন চে.মি.',
        '75 cm³ / 75 ঘন চে.মি.',
        '100 cm³ / 100 ঘন চে.মি.',
        '125 cm³ / 125 ঘন চে.মি.',
      ],
      correctAnswerIndex: 3,
      explanation:
        'Volume of cube = side³ = 5³ = 125 cm³.\nঘনকৰ আয়তন = বাহু³ = 5³ = 125 ঘন চে.মি.।',
      subjectTopic: 'Mensuration',
      marks: 1,
    },
    {
      question:
        'Find the area of a circle of radius 7 cm (use π = 22/7).\nব্যাসাৰ্ধ 7 চে.মি. থকা এটা বৃত্তৰ কালি উলিওৱা (π = 22/7 ব্যৱহাৰ কৰা)।',
      options: [
        '154 cm² / 154 বৰ্গ চে.মি.',
        '144 cm² / 144 বৰ্গ চে.মি.',
        '121 cm² / 121 বৰ্গ চে.মি.',
        '49 cm² / 49 বৰ্গ চে.মি.',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Area = πr² = (22/7) × 7² = (22/7) × 49 = 154 cm².\nকালি = πr² = (22/7) × 7² = (22/7) × 49 = 154 বৰ্গ চে.মি.।',
      subjectTopic: 'Mensuration',
      marks: 1,
    },
    {
      question:
        'Find the perimeter of a square of side 9 cm.\nবাহু 9 চে.মি. থকা এটা বৰ্গৰ পৰিসীমা উলিওৱা।',
      options: [
        '81 cm / 81 চে.মি.',
        '36 cm / 36 চে.মি.',
        '18 cm / 18 চে.মি.',
        '27 cm / 27 চে.মি.',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Perimeter of square = 4 × side = 4 × 9 = 36 cm.\nবৰ্গৰ পৰিসীমা = 4 × বাহু = 4 × 9 = 36 চে.মি.।',
      subjectTopic: 'Mensuration',
      marks: 1,
    },
  ],

  // ===========================================================================
  // police-english — English (30)
  // ===========================================================================
  'police-english': [
    // --- Grammar (12) ---
    {
      question:
        'Choose the correct article: "___ honest man is respected."\nশুদ্ধ article বাছনি কৰা: "___ honest man is respected."',
      options: ['An / An', 'A / A', 'The / The', 'No article / কোনো article নহয়'],
      correctAnswerIndex: 0,
      explanation:
        "'Honest' begins with a vowel sound (silent 'h'), so 'An' is used.\n'প্ৰকৃত' শব্দটো স্বৰবৰ্ণৰ ধ্বনিৰে আৰম্ভ হয় (নিঃশব্দ 'h'), গতিকে 'An' ব্যৱহাৰ কৰা হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Fill in the blank with the correct preposition: "He is fond ___ music."\nশুদ্ধ preposition ৰে খালী ঠাই পূৰ কৰা: "He is fond ___ music."',
      options: ['with / ৰ সৈতে', 'of / ৰ', 'to / লৈ', 'for / ৰ বাবে'],
      correctAnswerIndex: 1,
      explanation:
        "'Fond of' is the correct prepositional phrase meaning 'liking'.\n'Fond of' হৈছে 'ভাল পোৱা' অৰ্থৰ শুদ্ধ prepositional phrase।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Choose the correct tense form: "She ___ a letter yesterday."\nশুদ্ধ tense বাছনি কৰা: "She ___ a letter yesterday."',
      options: [
        'writes / লিখে',
        'has written / লিখিছে',
        'wrote / লিখিছিল',
        'will write / লিখিব',
      ],
      correctAnswerIndex: 2,
      explanation:
        "'Yesterday' indicates past time, so the simple past 'wrote' is used.\n'Yesterday' অতীত কাল বুজায়, গতিকে simple past 'wrote' ব্যৱহৃত হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Change into passive voice: "He writes a letter."\nPassive voice লৈ পৰিবৰ্তন কৰা: "He writes a letter."',
      options: [
        'A letter is being written by him. / A letter is being written by him.',
        'A letter was written by him. / A letter was written by him.',
        'A letter has been written by him. / A letter has been written by him.',
        'A letter is written by him. / A letter is written by him.',
      ],
      correctAnswerIndex: 3,
      explanation:
        "Simple present active 'writes' becomes 'is written' in passive.\nSimple present active 'writes' পৰা passive ত 'is written' হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Change into indirect speech: He said, "I am happy."\nIndirect speech লৈ পৰিবৰ্তন কৰা: He said, "I am happy."',
      options: [
        'He said that he was happy. / He said that he was happy.',
        'He said that he is happy. / He said that he is happy.',
        'He says that he was happy. / He says that he was happy.',
        'He told that he is happy. / He told that he is happy.',
      ],
      correctAnswerIndex: 0,
      explanation:
        "Present tense 'am' becomes past tense 'was' in indirect speech; 'said' stays.\nIndirect speech ত present tense 'am' পৰিণত হয় past tense 'was' লৈ; 'said' অপৰিবৰ্তিত থাকে।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Choose the correct modal: "You ___ smoke here." (prohibition)\nশুদ্ধ modal বাছনি কৰা: "You ___ smoke here." (নিষেধ)',
      options: [
        'should / উচিত',
        'must not / নালাগে',
        'can / পাৰে',
        'will / হ’ব',
      ],
      correctAnswerIndex: 1,
      explanation:
        "'Must not' expresses prohibition.\n'Must not' এ নিষেধ বুজায়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Fill in the blank with the correct article: "___ sun rises in the east."\nশুদ্ধ article ৰে খালী ঠাই পূৰ কৰা: "___ sun rises in the east."',
      options: ['A / A', 'An / An', 'The / The', 'No article / কোনো article নহয়'],
      correctAnswerIndex: 2,
      explanation:
        "The definite article 'The' is used before unique things like the sun.\nসূৰ্যৰ দৰে অদ্বিতীয় বস্তুৰ আগত definite article 'The' ব্যৱহৃত হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Fill in the blank with the correct preposition: "She has been living here ___ 2010."\nশুদ্ধ preposition ৰে খালী ঠাই পূৰ কৰা: "She has been living here ___ 2010."',
      options: ['for / for', 'from / from', 'in / in', 'since / since'],
      correctAnswerIndex: 3,
      explanation:
        "'Since' is used with a point of time (2010) in perfect continuous tense.\n'Since' এ নিৰ্দিষ্ট সময়বিন্দু (2010) ৰ লগত perfect continuous tense ত ব্যৱহৃত হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Choose the correct tense form: "They ___ football now."\nশুদ্ধ tense বাছনি কৰা: "They ___ football now."',
      options: [
        'are playing / খেলি আছে',
        'play / খেলে',
        'played / খেলিছিল',
        'have played / খেলিছে',
      ],
      correctAnswerIndex: 0,
      explanation:
        "'Now' indicates present continuous action, so 'are playing' is correct.\n'Now' এ present continuous ক্ৰিয়া বুজায়, গতিকে 'are playing' শুদ্ধ।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Change into passive voice: "She sings a song."\nPassive voice লৈ পৰিবৰ্তন কৰা: "She sings a song."',
      options: [
        'A song is being sung by her. / A song is being sung by her.',
        'A song is sung by her. / A song is sung by her.',
        'A song was sung by her. / A song was sung by her.',
        'A song sung by her. / A song sung by her.',
      ],
      correctAnswerIndex: 1,
      explanation:
        "Simple present 'sings' becomes 'is sung' in passive voice.\nSimple present 'sings' পৰা passive voice ত 'is sung' হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Change into indirect speech: She said, "I will come."\nIndirect speech লৈ পৰিবৰ্তন কৰা: She said, "I will come."',
      options: [
        'She said that she will come. / She said that she will come.',
        'She said that she comes. / She said that she comes.',
        'She said that she would come. / She said that she would come.',
        'She told that she will come. / She told that she will come.',
      ],
      correctAnswerIndex: 2,
      explanation:
        "'Will' changes to 'would' in indirect speech.\nIndirect speech ত 'will' পৰিণত হয় 'would' লৈ।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Choose the correct modal: "___ I borrow your pen, please?"\nশুদ্ধ modal বাছনি কৰা: "___ I borrow your pen, please?"',
      options: ['Will / Will', 'Should / Should', 'Would / Would', 'May / May'],
      correctAnswerIndex: 3,
      explanation:
        "'May' is used for polite requests seeking permission.\nভদ্ৰভাৱে অনুমতি বিচৰাত 'May' ব্যৱহৃত হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },

    // --- Vocabulary (12): synonyms 4, antonyms 4, one-word 2, spelling 2 ---
    {
      question: "Choose the synonym of 'Abundant'.\n'Abundant' ৰ সমাৰ্থক শব্দ বাছনি কৰা।",
      options: [
        'Plentiful / প্ৰচুৰ',
        'Scarce / দুৰ্লভ',
        'Empty / খালী',
        'Poor / দুখীয়া',
      ],
      correctAnswerIndex: 0,
      explanation:
        "'Abundant' means existing in large quantities, i.e. 'Plentiful'.\n'Abundant' মানে প্ৰচুৰ পৰিমাণে থকা, অৰ্থাৎ 'Plentiful'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: "Choose the synonym of 'Brave'.\n'Brave' ৰ সমার্থক শব্দ বাছনি কৰা।",
      options: [
        'Cowardly / ভীৰু',
        'Courageous / সাহসী',
        'Fearful / ভয়াল',
        'Weak / দুৰ্বল',
      ],
      correctAnswerIndex: 1,
      explanation:
        "'Brave' means showing courage; synonym is 'Courageous'.\n'Brave' মানে সাহসী; সমাৰ্থক শব্দ 'Courageous'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: "Choose the synonym of 'Ancient'.\n'Ancient' ৰ সমাৰ্থক শব্দ বাছনি কৰা।",
      options: [
        'Modern / আধুনিক',
        'New / নতুন',
        'Old / পুৰণি',
        'Recent / শেহতীয়া',
      ],
      correctAnswerIndex: 2,
      explanation:
        "'Ancient' means very old; synonym is 'Old'.\n'Ancient' মানে অতি পুৰণি; সমাৰ্থক শব্দ 'Old'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: "Choose the synonym of 'Begin'.\n'Begin' ৰ সমাৰ্থক শব্দ বাছনি কৰা।",
      options: [
        'End / শেষ কৰা',
        'Stop / ৰোৱা',
        'Close / বন্ধ কৰা',
        'Start / আৰম্ভ কৰা',
      ],
      correctAnswerIndex: 3,
      explanation:
        "'Begin' means to start; synonym is 'Start'.\n'Begin' মানে আৰম্ভ কৰা; সমাৰ্থক শব্দ 'Start'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: "Choose the antonym of 'Hot'.\n'Hot' ৰ বিপৰীত শব্দ বাছনি কৰা।",
      options: [
        'Cold / ঠাণ্ডা',
        'Warm / উষ্ণ',
        'Boiling / উতলন',
        'Heated / গৰম',
      ],
      correctAnswerIndex: 0,
      explanation:
        "'Cold' is the opposite of 'Hot'.\n'Cold' হৈছে 'Hot' ৰ বিপৰীত শব্দ।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: "Choose the antonym of 'Victory'.\n'Victory' ৰ বিপৰীত শব্দ বাছনি কৰা।",
      options: [
        'Win / জয়',
        'Defeat / পৰাজয়',
        'Success / সফলতা',
        'Triumph / বিজয়',
      ],
      correctAnswerIndex: 1,
      explanation:
        "'Defeat' is the opposite of 'Victory'.\n'Defeat' হৈছে 'Victory' ৰ বিপৰীত শব্দ।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: "Choose the antonym of 'Generous'.\n'Generous' ৰ বিপৰীত শব্দ বাছনি কৰা।",
      options: [
        'Kind / দয়ালু',
        'Giving / দানশীল',
        'Mean / কৃপণ',
        'Charitable / পৰোপকাৰী',
      ],
      correctAnswerIndex: 2,
      explanation:
        "'Mean' (miserly) is the opposite of 'Generous'.\n'Mean' (কৃপণ) হৈছে 'Generous' ৰ বিপৰীত শব্দ।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: "Choose the antonym of 'Arrive'.\n'Arrive' ৰ বিপৰীত শব্দ বাছনি কৰা।",
      options: [
        'Come / অহা',
        'Reach / পোৱা',
        'Stay / থকা',
        'Depart / ওলাই যোৱা',
      ],
      correctAnswerIndex: 3,
      explanation:
        "'Depart' (leave) is the opposite of 'Arrive'.\n'Depart' (ওলাই যোৱা) হৈছে 'Arrive' ৰ বিপৰীত শব্দ।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question:
        "Choose the one-word substitution for: 'A person who treats sick animals.'\nএটা শব্দৰ পৰিবৰ্তন বাছনি কৰা: 'যিজনে অসুস্থ জন্তুৰ চিকিৎসা কৰে।'",
      options: [
        'Veterinarian / পশুচিকিৎসক',
        'Doctor / চিকিৎসক',
        'Surgeon / শল্যচিকিৎসক',
        'Dentist / দন্তচিকিৎসক',
      ],
      correctAnswerIndex: 0,
      explanation:
        "A 'Veterinarian' is a doctor who treats sick animals.\n'Veterinarian' হৈছে অসুস্থ জন্তুৰ চিকিৎসা কৰা চিকিৎসক।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question:
        "Choose the one-word substitution for: 'A place where books are kept.'\nএটা শব্দৰ পৰিবৰ্তন বাছনি কৰা: 'য'ত কিতাপ ৰখা হয়।'",
      options: [
        'Museum / সংগ্ৰহালয়',
        'Library / পুথিভঁৰাল',
        'School / বিদ্যালয়',
        'Hospital / চিকিৎসালয়',
      ],
      correctAnswerIndex: 1,
      explanation:
        "A 'Library' is a place where books are kept.\n'Library' হৈছে কিতাপ ৰখা ঠাই।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: 'Choose the correctly spelt word.\nশুদ্ধ বানানৰ শব্দটো বাছনি কৰা।',
      options: [
        'Accomodation / Accomodation',
        'Acommodation / Acommodation',
        'Accommodation / Accommodation',
        'Accommodasion / Accommodasion',
      ],
      correctAnswerIndex: 2,
      explanation:
        "The correct spelling is 'Accommodation' (double c, double m).\nশুদ্ধ বানান হৈছে 'Accommodation' (দুটাকৈ c, দুটাকৈ m)।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: 'Choose the correctly spelt word.\nশুদ্ধ বানানৰ শব্দটো বাছনি কৰা।',
      options: [
        'Definately / Definately',
        'Definitley / Definitley',
        'Definitle / Definitle',
        'Definitely / Definitely',
      ],
      correctAnswerIndex: 3,
      explanation:
        "The correct spelling is 'Definitely'.\nশুদ্ধ বানান হৈছে 'Definitely'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },

    // --- Sentence Correction (6) ---
    {
      question: 'Choose the correct sentence.\nশুদ্ধ বাক্যটো বাছনি কৰা।',
      options: [
        'He goes to school every day. / He goes to school every day.',
        'He going to school every day. / He going to school every day.',
        'He gone to school every day. / He gone to school every day.',
        'He is go to school every day. / He is go to school every day.',
      ],
      correctAnswerIndex: 0,
      explanation:
        "With third person singular subject 'He' in simple present, the verb takes '-es': 'goes'.\nThird person singular 'He' ৰ সৈতে simple present ত ক্ৰিয়াই '-es' লয়: 'goes'।",
      subjectTopic: 'Sentence Correction',
      marks: 1,
    },
    {
      question: 'Choose the correct sentence.\nশুদ্ধ বাক্যটো বাছনি কৰা।',
      options: [
        'She not like tea. / She not like tea.',
        "She doesn't like tea. / She doesn't like tea.",
        "She don't likes tea. / She don't likes tea.",
        "She isn't like tea. / She isn't like tea.",
      ],
      correctAnswerIndex: 1,
      explanation:
        "With third person singular, the negative is 'doesn't + base verb': 'She doesn't like tea.'\nThird person singular ৰ ক্ষেত্ৰত negative হয় 'doesn't + মূল ক্ৰিয়া': 'She doesn't like tea.'",
      subjectTopic: 'Sentence Correction',
      marks: 1,
    },
    {
      question: 'Choose the correct sentence.\nশুদ্ধ বাক্যটো বাছনি কৰা।',
      options: [
        'I am living here for 2010. / I am living here for 2010.',
        'I was living here since 2010. / I was living here since 2010.',
        'I have been living here since 2010. / I have been living here since 2010.',
        'I lived here since 2010. / I lived here since 2010.',
      ],
      correctAnswerIndex: 2,
      explanation:
        "An action that began in the past and continues uses present perfect continuous with 'since': 'I have been living here since 2010.'\nঅতীতত আৰম্ভ হৈ চলি থকা ক্ৰিয়াৰ ক্ষেত্ৰত 'since' ৰ সৈতে present perfect continuous ব্যৱহৃত হয়: 'I have been living here since 2010.'",
      subjectTopic: 'Sentence Correction',
      marks: 1,
    },
    {
      question: 'Choose the correct sentence.\nশুদ্ধ বাক্যটো বাছনি কৰা।',
      options: [
        'One of my friend is a doctor. / One of my friend is a doctor.',
        'One of my friends are a doctor. / One of my friends are a doctor.',
        'One of my friend was a doctor. / One of my friend was a doctor.',
        'One of my friends is a doctor. / One of my friends is a doctor.',
      ],
      correctAnswerIndex: 3,
      explanation:
        "'One of' is followed by a plural noun and singular verb: 'One of my friends is a doctor.'\n'One of' ৰ পিছত plural noun আৰু singular verb ব্যৱহৃত হয়: 'One of my friends is a doctor.'",
      subjectTopic: 'Sentence Correction',
      marks: 1,
    },
    {
      question: 'Choose the correct sentence.\nশুদ্ধ বাক্যটো বাছনি কৰা।',
      options: [
        'He is taller than me. / He is taller than me.',
        'He is more taller than me. / He is more taller than me.',
        'He is tallest than me. / He is tallest than me.',
        'He is much tall than me. / He is much tall than me.',
      ],
      correctAnswerIndex: 0,
      explanation:
        "'Tall' is a one-syllable adjective; its comparative is 'taller', not 'more taller'.\n'Tall' এটা একাক্ষৰ বিশেষণ; ইয়াৰ comparative 'taller', 'more taller' নহয়।",
      subjectTopic: 'Sentence Correction',
      marks: 1,
    },
    {
      question: 'Choose the correct sentence.\nশুদ্ধ বাক্যটো বাছনি কৰা।',
      options: [
        'Neither of the boys were present. / Neither of the boys were present.',
        'Neither of the boys was present. / Neither of the boys was present.',
        'Neither of the boy were present. / Neither of the boy were present.',
        'Neither of the boys is being present. / Neither of the boys is being present.',
      ],
      correctAnswerIndex: 1,
      explanation:
        "'Neither of' takes a singular verb: 'Neither of the boys was present.'\n'Neither of' ৰ লগত singular verb ব্যৱহৃত হয়: 'Neither of the boys was present.'",
      subjectTopic: 'Sentence Correction',
      marks: 1,
    },
  ],
};
