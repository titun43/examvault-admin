// =============================================================================
// ExamVault — ADRE (Assam Direct Recruitment) PART B
// Bilingual question pool — Mathematics (adre-maths) + English (adre-english)
//
// Format (CRITICAL — every field is bilingual EN + অসমীয়া):
//   question  -> "English\nঅসমীয়া"
//   option    -> "English / অসমীয়া"
//   expl      -> "English\nঅসমীয়া"
//
// adre-maths   : 30 questions (Number System, LCM-HCF, Percentage, Profit-Loss,
//                                Interest, Time-Work, Ratio, Average,
//                                Mensuration — class IX-X level)
// adre-english : 30 questions (Grammar, Vocabulary, Sentence Correction)
// Total = 60 bilingual items.
//
// Per the task spec, numeric digits stay as digits (NOT transliterated to
// Assamese numerals); surrounding words/units are translated to Assamese.
//
// correctAnswerIndex is distributed evenly (8 × 0, 8 × 1, 7 × 2, 7 × 3)
// within each subject so test slicing produces a balanced answer key.
// =============================================================================
import type { QuestionPoolMap } from './structure';

export const ADRE_POOLS_B: QuestionPoolMap = {
  // ===========================================================================
  // adre-maths — Mathematics (30)
  // ===========================================================================
  'adre-maths': [
    // --- Number System (4) ---
    {
      question:
        'Find the smallest 5-digit number that is exactly divisible by 7.\n৭ দ্বাৰা সম্পূৰ্ণভাৱে বিভাজ্য আটাইতকৈ সৰু 5-অঙ্কীয় সংখ্যাটো উলিওৱা।',
      options: ['10003 / 10003', '10000 / 10000', '10001 / 10001', '10007 / 10007'],
      correctAnswerIndex: 0,
      explanation:
        '10000 ÷ 7 leaves remainder 4; next multiple is 10000 + (7 − 4) = 10003.\n10000 ÷ 7 ত ভাগশেষ 4; পৰৱৰ্তী গুণিতক = 10000 + (7 − 4) = 10003।',
      subjectTopic: 'Number System',
      marks: 1,
    },
    {
      question: 'What is the unit digit of 7^105?\n7^105 ৰ এককৰ অঙ্কটো কিমান?',
      options: ['9 / 9', '7 / 7', '3 / 3', '1 / 1'],
      correctAnswerIndex: 1,
      explanation:
        "Unit digits of powers of 7 cycle as 7, 9, 3, 1 (period 4). 105 mod 4 = 1, so unit digit = 7.\n7 ৰ ঘাতৰ এককৰ অঙ্ক 7, 9, 3, 1 (চক্ৰ 4)। 105 mod 4 = 1, গতিকে এককৰ অঙ্ক = 7।",
      subjectTopic: 'Number System',
      marks: 1,
    },
    {
      question:
        'The sum of three consecutive odd numbers is 87. What is the smallest number?\nতিনিটা ক্ৰমিক অযুগ্ম সংখ্যাৰ যোগফল 87। আটাইতকৈ সৰু সংখ্যাটো কিমান?',
      options: ['29 / 29', '31 / 31', '27 / 27', '25 / 25'],
      correctAnswerIndex: 2,
      explanation:
        'Let numbers be n, n+2, n+4. Then 3n + 6 = 87, so n = 27.\nসংখ্যাকেইটা n, n+2, n+4 হওক। তেন্তে 3n + 6 = 87, গতিকে n = 27।',
      subjectTopic: 'Number System',
      marks: 1,
    },
    {
      question: 'Which of the following is a prime number?\nতলৰ কোনটো মৌলিক সংখ্যা?',
      options: ['91 / 91', '51 / 51', '87 / 87', '97 / 97'],
      correctAnswerIndex: 3,
      explanation:
        '91 = 7 × 13, 51 = 3 × 17, 87 = 3 × 29; 97 has no divisors other than 1 and itself.\n91 = 7 × 13, 51 = 3 × 17, 87 = 3 × 29; 97 ৰ 1 আৰু নিজৰ বাহিৰে আন ভাজক নাই।',
      subjectTopic: 'Number System',
      marks: 1,
    },

    // --- LCM-HCF (4) ---
    {
      question: 'Find the LCM of 12, 15 and 20.\n12, 15 আৰু 20 ৰ লসাগু উলিওৱা।',
      options: ['60 / 60', '30 / 30', '120 / 120', '90 / 90'],
      correctAnswerIndex: 0,
      explanation:
        '12 = 2²×3, 15 = 3×5, 20 = 2²×5; LCM = 2²×3×5 = 60.\n12 = 2²×3, 15 = 3×5, 20 = 2²×5; লসাগু = 2²×3×5 = 60।',
      subjectTopic: 'LCM-HCF',
      marks: 1,
    },
    {
      question: 'Find the HCF of 24 and 36.\n24 আৰু 36 ৰ গসাগু উলিওৱা।',
      options: ['6 / 6', '12 / 12', '24 / 24', '4 / 4'],
      correctAnswerIndex: 1,
      explanation:
        '24 = 2³×3, 36 = 2²×3²; HCF = 2²×3 = 12.\n24 = 2³×3, 36 = 2²×3²; গসাগু = 2²×3 = 12।',
      subjectTopic: 'LCM-HCF',
      marks: 1,
    },
    {
      question:
        'Two numbers are in the ratio 5 : 6 and their HCF is 7. Find the numbers.\nদুটা সংখ্যাৰ অনুপাত 5 : 6 আৰু গসাগু 7। সংখ্যা দুটা উলিওৱা।',
      options: ['30, 36 / 30, 36', '28, 35 / 28, 35', '35, 42 / 35, 42', '42, 49 / 42, 49'],
      correctAnswerIndex: 2,
      explanation:
        'Numbers = 5×7 and 6×7 = 35 and 42.\nসংখ্যা দুটা = 5×7 আৰু 6×7 = 35 আৰু 42।',
      subjectTopic: 'LCM-HCF',
      marks: 1,
    },
    {
      question:
        'The LCM of two numbers is 120 and their HCF is 8. If one number is 24, find the other.\nদুটা সংখ্যাৰ লসাগু 120 আৰু গসাগু 8। যদি এটা সংখ্যা 24, আনটো উলিওৱা।',
      options: ['32 / 32', '48 / 48', '36 / 36', '40 / 40'],
      correctAnswerIndex: 3,
      explanation:
        'Product = LCM × HCF = 120 × 8 = 960. Other number = 960 ÷ 24 = 40.\nগুণফল = লসাগু × গসাগু = 120 × 8 = 960। আন সংখ্যাটো = 960 ÷ 24 = 40।',
      subjectTopic: 'LCM-HCF',
      marks: 1,
    },

    // --- Percentage (4) ---
    {
      question: 'What is 20% of 350?\n350 ৰ 20% কিমান?',
      options: ['70 / 70', '35 / 35', '65 / 65', '75 / 75'],
      correctAnswerIndex: 0,
      explanation:
        '20% of 350 = (20/100) × 350 = 70.\n350 ৰ 20% = (20/100) × 350 = 70।',
      subjectTopic: 'Percentage',
      marks: 1,
    },
    {
      question:
        'A student scored 360 marks out of 500. What is the percentage?\nএজন ছাত্ৰই 500 ৰ ভিতৰত 360 নম্বৰ পালে। শতকৰা কিমান?\n',
      options: ['70% / 70%', '72% / 72%', '75% / 75%', '68% / 68%'],
      correctAnswerIndex: 1,
      explanation:
        'Percentage = (360/500) × 100 = 72%.\nশতকৰা = (360/500) × 100 = 72%।',
      subjectTopic: 'Percentage',
      marks: 1,
    },
    {
      question:
        'If the price of an item increases by 20%, by what percentage must it be decreased to restore the original price?\nযদি এটা সামগ্ৰীৰ দাম 20% বৃদ্ধি হয়, মূল দামলৈ ঘূৰাবলৈ কিমান শতাংশ হ্ৰাস কৰিব লাগিব?',
      options: ['20% / 20%', '25% / 25%', '16.67% / 16.67%', '18% / 18%'],
      correctAnswerIndex: 2,
      explanation:
        'Required drop = (20/120) × 100 = 16.67%.\nপ্ৰয়োজনীয় হ্ৰাস = (20/120) × 100 = 16.67%।',
      subjectTopic: 'Percentage',
      marks: 1,
    },
    {
      question:
        'The population of a town is 10,000 and increases by 10% every year. What will it be after 2 years?\nএখন নগৰৰ জনসংখ্যা 10,000 আৰু প্ৰতি বছৰে 10% বৃদ্ধি হয়। 2 বছৰৰ পিছত কিমান হ\'ব?',
      options: ['12000 / 12000', '11000 / 11000', '20000 / 20000', '12100 / 12100'],
      correctAnswerIndex: 3,
      explanation:
        'Population = 10000 × (1.1)² = 10000 × 1.21 = 12100.\nজনসংখ্যা = 10000 × (1.1)² = 10000 × 1.21 = 12100।',
      subjectTopic: 'Percentage',
      marks: 1,
    },

    // --- Profit-Loss (4) ---
    {
      question:
        'A man buys an article for ₹500 and sells it for ₹600. Find his profit percentage.\nএজন মানুহে ₹500 টকাত এটা সামগ্ৰী কিনি ₹600 টকাত বিক্ৰী কৰে। লাভৰ শতাংশ উলিওৱা।',
      options: ['20% / 20%', '15% / 15%', '25% / 25%', '10% / 10%'],
      correctAnswerIndex: 0,
      explanation:
        'Profit = 600 − 500 = ₹100. Profit% = (100/500) × 100 = 20%.\nলাভ = 600 − 500 = ₹100। লাভ% = (100/500) × 100 = 20%।',
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },
    {
      question:
        'A book is sold for ₹250 at a loss of 25%. Find its cost price.\nএখন কিতাপ 25% লোকচানত ₹250 টকাত বিক্ৰী কৰা হ\'ল। ক্ৰয়মূল্য উলিওৱা।',
      options: ['₹300 / ₹300', '₹333.33 / ₹333.33', '₹312.50 / ₹312.50', '₹325 / ₹325'],
      correctAnswerIndex: 1,
      explanation:
        'CP = SP × 100/(100 − loss%) = 250 × 100/75 = ₹333.33.\nক্ৰয়মূল্য = বিক্ৰয়মূল্য × 100/(100 − লোকচান%) = 250 × 100/75 = ₹333.33।',
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },
    {
      question:
        'If the selling price of 20 articles equals the cost price of 25 articles, find the profit percentage.\nযদি 20 টা সামগ্ৰীৰ বিক্ৰয়মূল্য 25 টা সামগ্ৰীৰ ক্ৰয়মূল্যৰ সমান, লাভৰ শতাংশ উলিওৱা।',
      options: ['20% / 20%', '30% / 30%', '25% / 25%', '15% / 15%'],
      correctAnswerIndex: 2,
      explanation:
        'SP of 20 = CP of 25 ⇒ SP/CP = 25/20 = 1.25 ⇒ profit = 25%.\n20 ৰ বিক্ৰয়মূল্য = 25 ৰ ক্ৰয়মূল্য ⇒ বিক্ৰয়মূল্য/ক্ৰয়মূল্য = 25/20 = 1.25 ⇒ লাভ = 25%।',
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },
    {
      question:
        'The marked price of an article is ₹800 and a discount of 15% is given. Find the selling price.\nএটা সামগ্ৰীৰ চিহ্নিত মূল্য ₹800 আৰু 15% বাট্টা দিয়া হয়। বিক্ৰয়মূল্য উলিওৱা।',
      options: ['₹700 / ₹700', '₹640 / ₹640', '₹660 / ₹660', '₹680 / ₹680'],
      correctAnswerIndex: 3,
      explanation:
        'SP = 800 × (1 − 0.15) = 800 × 0.85 = ₹680.\nবিক্ৰয়মূল্য = 800 × (1 − 0.15) = 800 × 0.85 = ₹680।',
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },

    // --- Interest (3) ---
    {
      question:
        'Find the simple interest on ₹2000 at 5% per annum for 3 years.\n₹2000 টকাৰ ওপৰত 5% বছৰি হাৰে 3 বছৰৰ সৰল সুদ উলিওৱা।',
      options: ['₹300 / ₹300', '₹250 / ₹250', '₹350 / ₹350', '₹450 / ₹450'],
      correctAnswerIndex: 0,
      explanation:
        'SI = P × R × T / 100 = 2000 × 5 × 3 / 100 = ₹300.\nসৰল সুদ = মূলধন × হাৰ × সময় / 100 = 2000 × 5 × 3 / 100 = ₹300।',
      subjectTopic: 'Interest',
      marks: 1,
    },
    {
      question:
        'Find the amount on ₹5000 at 10% compound interest per annum for 2 years.\n₹5000 টকাৰ ওপৰত 10% বাৰ্ষিক চক্ৰবৃদ্ধি সুতে 2 বছৰৰ মুঠ পৰিমাণ উলিওৱা।',
      options: ['₹5500 / ₹5500', '₹6050 / ₹6050', '₹5750 / ₹5750', '₹6250 / ₹6250'],
      correctAnswerIndex: 1,
      explanation:
        'Amount = P(1 + R/100)^T = 5000 × (1.1)² = 5000 × 1.21 = ₹6050.\nপৰিমাণ = মূলধন(1 + হাৰ/100)^সময় = 5000 × (1.1)² = 5000 × 1.21 = ₹6050।',
      subjectTopic: 'Interest',
      marks: 1,
    },
    {
      question:
        'Find the difference between compound interest and simple interest on ₹4000 at 5% per annum for 2 years.\n₹4000 টকাৰ ওপৰত 5% হাৰে 2 বছৰৰ চক্ৰবৃদ্ধি সুদ আৰু সৰল সুদৰ পাৰ্থক্য উলিওৱা।',
      options: ['₹20 / ₹20', '₹15 / ₹15', '₹10 / ₹10', '₹8 / ₹8'],
      correctAnswerIndex: 2,
      explanation:
        'Difference = P × (R/100)² = 4000 × (5/100)² = 4000 × 0.0025 = ₹10.\nপাৰ্থক্য = মূলধন × (হাৰ/100)² = 4000 × (5/100)² = 4000 × 0.0025 = ₹10।',
      subjectTopic: 'Interest',
      marks: 1,
    },

    // --- Time-Work (3) ---
    {
      question:
        'A can do a piece of work in 15 days and B in 10 days. In how many days can they finish it together?\nA এ এটা কাম 15 দিনত আৰু B এ 10 দিনত কৰিব পাৰে। দুয়ো একেলগে কামটো কিমান দিনত শেষ কৰিব?',
      options: ['5 days / 5 দিন', '8 days / 8 দিন', '12 days / 12 দিন', '6 days / 6 দিন'],
      correctAnswerIndex: 3,
      explanation:
        'Per day work = 1/15 + 1/10 = 5/30 = 1/6. So together they take 6 days.\nদৈনিক কাম = 1/15 + 1/10 = 5/30 = 1/6। গতিকে একেলগে 6 দিন লাগে।',
      subjectTopic: 'Time-Work',
      marks: 1,
    },
    {
      question:
        'If 12 men can complete a work in 24 days, in how many days will 8 men complete it?\nযদি 12 জন মানুহে এটা কাম 24 দিনত শেষ কৰে, 8 জন মানুহে ইয়াক কিমান দিনত শেষ কৰিব?',
      options: ['36 days / 36 দিন', '32 days / 32 দিন', '40 days / 40 দিন', '30 days / 30 দিন'],
      correctAnswerIndex: 0,
      explanation:
        'Men × Days = constant. 12 × 24 = 8 × d ⇒ d = 36 days.\nমানুহ × দিন = ধ্ৰুৱক। 12 × 24 = 8 × দিন ⇒ দিন = 36।',
      subjectTopic: 'Time-Work',
      marks: 1,
    },
    {
      question:
        'A is twice as good a worker as B. Together they finish a work in 12 days. In how many days can A alone finish it?\nA, B তকৈ দুগুণ ভাল কৰ্মী। দুয়ো একেলগে এটা কাম 12 দিনত শেষ কৰে। A অকলে কামটো কিমান দিনত শেষ কৰিব?',
      options: ['24 days / 24 দিন', '18 days / 18 দিন', '36 days / 36 দিন', '9 days / 9 দিন'],
      correctAnswerIndex: 1,
      explanation:
        'Let B do 1 unit/day, A do 2 units/day. Together = 3 units/day; total work = 3 × 12 = 36 units. A alone = 36/2 = 18 days.\nB এ 1 একক/দিন, A এ 2 একক/দিন কৰে বুলি ধৰা হওক। একেলগে = 3 একক/দিন; মুঠ কাম = 3 × 12 = 36 একক। A অকলে = 36/2 = 18 দিন।',
      subjectTopic: 'Time-Work',
      marks: 1,
    },

    // --- Ratio (3) ---
    {
      question:
        'Divide ₹1500 in the ratio 2 : 3. What is the larger share?\n₹1500 টকা 2 : 3 অনুপাতে ভাগ কৰা। ডাঙৰ অংশটো কিমান?',
      options: ['₹600 / ₹600', '₹750 / ₹750', '₹900 / ₹900', '₹450 / ₹450'],
      correctAnswerIndex: 2,
      explanation:
        'Total parts = 2 + 3 = 5. Larger share = (3/5) × 1500 = ₹900.\nমুঠ ভাগ = 2 + 3 = 5। ডাঙৰ অংশ = (3/5) × 1500 = ₹900।',
      subjectTopic: 'Ratio',
      marks: 1,
    },
    {
      question:
        'The present ages of A and B are in the ratio 4 : 5. After 6 years the ratio becomes 5 : 6. Find the present age of A.\nA আৰু B ৰ বৰ্তমান বয়সৰ অনুপাত 4 : 5। 6 বছৰৰ পিছত অনুপাত 5 : 6 হ\'ল। A ৰ বৰ্তমান বয়স উলিওৱা।',
      options: ['30 / 30', '20 / 20', '18 / 18', '24 / 24'],
      correctAnswerIndex: 3,
      explanation:
        'Let ages be 4x and 5x. (4x+6)/(5x+6) = 5/6 ⇒ 6(4x+6) = 5(5x+6) ⇒ x = 6. So A = 4×6 = 24.\nবয়স 4x আৰু 5x হওক। (4x+6)/(5x+6) = 5/6 ⇒ 6(4x+6) = 5(5x+6) ⇒ x = 6। গতিকে A = 4×6 = 24।',
      subjectTopic: 'Ratio',
      marks: 1,
    },
    {
      question: 'If 8 : x :: 16 : 24, find x.\nযদি 8 : x :: 16 : 24, x উলিওৱা।',
      options: ['12 / 12', '16 / 16', '18 / 18', '10 / 10'],
      correctAnswerIndex: 0,
      explanation:
        'Product of means = product of extremes: 16x = 8 × 24 ⇒ x = 12.\nমধ্যপদৰ গুণফল = অন্তপদৰ গুণফল: 16x = 8 × 24 ⇒ x = 12।',
      subjectTopic: 'Ratio',
      marks: 1,
    },

    // --- Average (3) ---
    {
      question:
        'The average of 5 numbers is 18. If one number 24 is removed, what is the new average?\n5 টা সংখ্যাৰ গড় 18। যদি 24 সংখ্যাটো আঁতৰাওৱা হয়, নতুন গড় কিমান?',
      options: ['16 / 16', '16.5 / 16.5', '17 / 17', '15.5 / 15.5'],
      correctAnswerIndex: 1,
      explanation:
        'Sum of 5 = 5 × 18 = 90. Sum of remaining 4 = 90 − 24 = 66. New average = 66/4 = 16.5.\n5 টাৰ যোগফল = 5 × 18 = 90। বাকী 4 টাৰ যোগফল = 90 − 24 = 66। নতুন গড় = 66/4 = 16.5।',
      subjectTopic: 'Average',
      marks: 1,
    },
    {
      question:
        'The average age of 30 students is 12 years. When the teacher joins, the average becomes 13. Find the teacher\'s age.\n30 জন ছাত্ৰৰ গড় বয়স 12 বছৰ। শিক্ষক যোগ দিলে গড় 13 হয়। শিক্ষকৰ বয়স উলিওৱা।',
      options: ['42 / 42', '40 / 40', '43 / 43', '41 / 41'],
      correctAnswerIndex: 2,
      explanation:
        'Total of 30 = 30 × 12 = 360. Total of 31 = 31 × 13 = 403. Teacher = 403 − 360 = 43.\n30 জনৰ মুঠ = 30 × 12 = 360। 31 জনৰ মুঠ = 31 × 13 = 403। শিক্ষক = 403 − 360 = 43।',
      subjectTopic: 'Average',
      marks: 1,
    },
    {
      question: 'Find the average of the first 10 odd numbers.\nপ্ৰথম 10 টা অযুগ্ম সংখ্যাৰ গড় উলিওৱা।',
      options: ['11 / 11', '9 / 9', '12 / 12', '10 / 10'],
      correctAnswerIndex: 3,
      explanation:
        'First 10 odd numbers: 1, 3, 5, …, 19. Sum = n² = 100, so average = 100/10 = 10.\nপ্ৰথম 10 টা অযুগ্ম সংখ্যা: 1, 3, 5, …, 19। যোগফল = n² = 100, গতিকে গড় = 100/10 = 10।',
      subjectTopic: 'Average',
      marks: 1,
    },

    // --- Mensuration (2) ---
    {
      question:
        'Find the area of a circle of radius 7 cm. (Use π = 22/7)\nব্যাসাৰ্ধ 7 ছে.মি. বিশিষ্ট বৃত্তএটাৰ কালি উলিওৱা। (π = 22/7 ব্যৱহাৰ কৰা)',
      options: [
        '154 cm² / 154 ছে.মি.²',
        '44 cm² / 44 ছে.মি.²',
        '308 cm² / 308 ছে.মি.²',
        '22 cm² / 22 ছে.মি.²',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Area = πr² = (22/7) × 7 × 7 = 154 cm².\nকালি = πr² = (22/7) × 7 × 7 = 154 ছে.মি.²',
      subjectTopic: 'Mensuration',
      marks: 1,
    },
    {
      question:
        'Find the volume of a cuboid of dimensions 10 cm × 8 cm × 5 cm.\n10 ছে.মি. × 8 ছে.মি. × 5 ছে.মি. মাপৰ এটা ঘনাকৃতিৰ আয়তন উলিওৱা।',
      options: [
        '200 cm³ / 200 ছে.মি.³',
        '400 cm³ / 400 ছে.মি.³',
        '100 cm³ / 100 ছে.মি.³',
        '800 cm³ / 800 ছে.মি.³',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Volume = l × b × h = 10 × 8 × 5 = 400 cm³.\nআয়তন = দৈৰ্ঘ্য × প্ৰস্থ × উচ্চতা = 10 × 8 × 5 = 400 ছে.মি.³',
      subjectTopic: 'Mensuration',
      marks: 1,
    },
  ],

  // ===========================================================================
  // adre-english — English (30)
  // ===========================================================================
  'adre-english': [
    // --- Grammar: Tense (2) ---
    {
      question:
        'Choose the correct verb: "She ___ to school every day."\nশুদ্ধ verb বাছনি কৰা: "She ___ to school every day."',
      options: ['go / যাওক', 'goes / যায়', 'going / যাই আছে', 'gone / গৈছে'],
      correctAnswerIndex: 0,
      explanation:
        "Third-person singular subject 'She' takes the -s form 'goes' in the simple present.\nThird-person singular subject 'She' এ simple present ত -s ৰূপ 'goes' লয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Fill in the blank: "They ___ football when it started raining."\nখালি ঠাই পূৰ কৰা: "They ___ football when it started raining."',
      options: ['play / খেলে', 'were playing / খেলি আছিল', 'played / খেলিছিল', 'are playing / খেলি আছে'],
      correctAnswerIndex: 1,
      explanation:
        "Past continuous 'were playing' shows an action in progress when another action interrupted.\nPast continuous 'were playing' এ কোনো চলি থকা কাম আন এটা কামে ব্যাহত কৰা বুজায়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },

    // --- Grammar: Voice (2) ---
    {
      question:
        'Change to passive voice: "Rina writes a letter."\nPassive voice লৈ সলনি কৰা: "Rina writes a letter."',
      options: [
        'A letter was written by Rina / ৰিনাৰ দ্বাৰা এখন চিঠি লিখা হৈছিল',
        'A letter is being written by Rina / ৰিনাৰ দ্বাৰা এখন চিঠি লিখি থকা হৈছে',
        'A letter is written by Rina / ৰিনাৰ দ্বাৰা এখন চিঠি লিখা হয়',
        'A letter has been written by Rina / ৰিনাৰ দ্বাৰা এখন চিঠি লিখা হৈছে',
      ],
      correctAnswerIndex: 2,
      explanation:
        "Simple present active 'writes' becomes simple present passive 'is written'.\nSimple present active 'writes' এ simple present passive 'is written' হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Change to active voice: "Mangoes are liked by him."\nActive voice লৈ সলনি কৰা: "Mangoes are liked by him."',
      options: [
        'He liked mangoes / তেওঁ আম পছন্দ কৰিছিল',
        'He is liking mangoes / তেওঁ আম পছন্দ কৰি আছে',
        'He has liked mangoes / তেওঁ আম পছন্দ কৰিছে',
        'He likes mangoes / তেওঁ আম পছন্দ কৰে',
      ],
      correctAnswerIndex: 3,
      explanation:
        "Simple present passive 'are liked' becomes simple present active 'likes'.\nSimple present passive 'are liked' এ simple present active 'likes' হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },

    // --- Grammar: Narration (2) ---
    {
      question: 'Change to indirect speech: He said, "I am tired."\nIndirect speech লৈ সলনি কৰা: He said, "I am tired."',
      options: [
        'He said that he was tired / তেওঁ ক\'লে যে তেওঁ ভাগৰু আছিল',
        'He said that he is tired / তেওঁ ক\'লে যে তেওঁ ভাগৰু আছে',
        'He says that he was tired / তেওঁ কয় যে তেওঁ ভাগৰু আছিল',
        'He said I am tired / তেওঁ ক\'লে মই ভাগৰু আছো',
      ],
      correctAnswerIndex: 0,
      explanation:
        "Reporting verb in past tense shifts present 'am' to past 'was'; pronoun 'I' becomes 'he'.\nReporting verb past tense হ\'লে present 'am' পৰিণত হয় past 'was\'লৈ; pronoun 'I' হয় 'he\'।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Change to indirect speech: She said to me, "Where do you live?"\nIndirect speech লৈ সলনি কৰা: She said to me, "Where do you live?"',
      options: [
        'She asked me where do I live / তাইে মোৰ পৰা সুধিলে মই ক\'ত থাকোঁ',
        'She asked me where I lived / তাইে মোৰ পৰা সুধিলে মই ক\'ত থাকো',
        'She asked me where I live / তাইে মোৰ পৰা সুধিলে মই ক\'ত থাকোঁ',
        'She asked me where did I live / তাইে মোৰ পৰা সুধিলে মই ক\'ত থাকিলো',
      ],
      correctAnswerIndex: 1,
      explanation:
        "Wh-question in indirect speech uses statement word order: 'where I lived' (no auxiliary 'do').\nIndirect speech ত Wh-question ত statement word order ব্যৱহৃত হয়: 'where I lived' (auxiliary 'do' নাই)।",
      subjectTopic: 'Grammar',
      marks: 1,
    },

    // --- Grammar: Articles (2) ---
    {
      question: 'Fill in the blank: "He is ___ honest man."\nখালি ঠাই পূৰ কৰা: "He is ___ honest man."',
      options: ['a / এটা', 'the / টো', 'an / এজন', 'no article / কোনো প্ৰবন্ধ নাই'],
      correctAnswerIndex: 2,
      explanation:
        "'Honest' begins with a vowel sound (silent 'h'), so the article is 'an'.\n'Honest' vowel soundৰে আৰম্ভ হয় ('h' নীৰৱ), গতিকে প্ৰবন্ধ 'an'।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question: 'Fill in the blank: "___ sun rises in the east."\nখালি ঠাই পূৰ কৰা: "___ sun rises in the east."',
      options: ['A / এটা', 'An / এটা', 'No article / কোনো প্ৰবন্ধ নাই', 'The / টো'],
      correctAnswerIndex: 3,
      explanation:
        "Definite article 'the' is used before a unique object like the sun.\nUnique object যেনে sunৰ আগত definite article 'the' ব্যৱহৃত হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },

    // --- Grammar: Prepositions (3) ---
    {
      question: 'Fill in the blank: "He is fond ___ music."\nখালি ঠাই পূৰ কৰা: "He is fond ___ music."',
      options: ['of / ৰ', 'for / ৰ বাবে', 'with / ৰ সৈতে', 'in / ত'],
      correctAnswerIndex: 0,
      explanation:
        "The fixed expression is 'fond of'.\nFixed expressionটো হ\'ল 'fond of'।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Fill in the blank: "She succeeded ___ her efforts."\nখালি ঠাই পূৰ কৰা: "She succeeded ___ her efforts."',
      options: ['with / ৰ সৈতে', 'in / ত', 'by / ৰ দ্বাৰা', 'for / ৰ বাবে'],
      correctAnswerIndex: 1,
      explanation:
        "'Succeed' takes the preposition 'in' before the thing achieved.\n'Succeed' ৰ পিছত সাফল্যৰ ক্ষেত্ৰত preposition 'in' ব্যৱহৃত হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question: 'Fill in the blank: "He has been ill ___ Monday."\nখালি ঠাই পূৰ কৰা: "He has been ill ___ Monday."',
      options: ['for / ৰ বাবে', 'from / ৰ পৰা', 'since / ৰ পৰা', 'by / লৈ'],
      correctAnswerIndex: 2,
      explanation:
        "'Since' is used with a point of time; 'for' is used with a period.\n'Since' কোনো সময়বিন্দুৰ লগত, 'for' কোনো সময়সীমাৰ লগত ব্যৱহৃত হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },

    // --- Grammar: Modals (2) ---
    {
      question:
        'Fill in the blank: "You ___ not enter without permission."\nখালি ঠাই পূৰ কৰা: "You ___ not enter without permission."',
      options: ['can / পাৰে', 'may / পাৰে', 'should / উচিত', 'must / লাগিব'],
      correctAnswerIndex: 3,
      explanation:
        "'Must not' expresses prohibition.\n'Must not' এ নিষেধ বুজায়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Fill in the blank: "She ___ swim when she was five."\nখালি ঠাই পূৰ কৰা: "She ___ swim when she was five."',
      options: ['could / পাৰিছিল', 'can / পাৰে', 'must / লাগিব', 'should / উচিত'],
      correctAnswerIndex: 0,
      explanation:
        "'Could' is the past form of 'can' and shows past ability.\n'Could' হ\'ল 'can' ৰ past ৰূপ আৰু ই অতীতৰ সামৰ্থ্য বুজায়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },

    // --- Grammar: Subject-Verb Agreement (2) ---
    {
      question: 'Choose the correct verb: "Each of the boys ___ a prize."\nশুদ্ধ verb বাছনি কৰা: "Each of the boys ___ a prize."',
      options: ['get / পায়', 'gets / পায়', 'getting / পাই আছে', 'have got / পাইছে'],
      correctAnswerIndex: 1,
      explanation:
        "'Each' is singular and takes a singular verb 'gets'.\n'Each' singular আৰু ই singular verb 'gets' লয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Choose the correct verb: "Neither he nor his friends ___ coming."\nশুদ্ধ verb বাছনি কৰা: "Neither he nor his friends ___ coming."',
      options: ['is / হয়', 'was / আছিল', 'are / আছে', 'has / আছে'],
      correctAnswerIndex: 2,
      explanation:
        "With 'neither...nor', the verb agrees with the nearer subject ('friends' — plural), so 'are'.\n'neither...nor' ৰ ক্ষেত্ৰত verb ওচৰৰ subject ('friends' — plural) ৰ লগত মিলে, গতিকে 'are'।",
      subjectTopic: 'Grammar',
      marks: 1,
    },

    // --- Vocabulary: Synonyms (3) ---
    {
      question: 'Choose the synonym of "Abundant".\n"Abundant" ৰ সমাৰ্থক শব্দ বাছনি কৰা।',
      options: ['Scarce / দুৰ্লভ', 'Empty / খালী', 'Small / সৰু', 'Plentiful / প্ৰচুৰ'],
      correctAnswerIndex: 3,
      explanation:
        "'Abundant' means existing in large quantities; synonym 'Plentiful'.\n'Abundant' অৰ্থ প্ৰচুৰ পৰিমাণে থকা; সমাৰ্থক 'Plentiful'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: 'Choose the synonym of "Brave".\n"Brave" ৰ সমার্থক শব্দ বাছনি কৰা।',
      options: ['Courageous / সাহসী', 'Timid / ভীৰু', 'Cruel / নিষ্ঠুৰ', 'Weak / দুৰ্বল'],
      correctAnswerIndex: 0,
      explanation:
        "'Brave' means showing courage; synonym 'Courageous'.\n'Brave' অৰ্থ সাহসী; সমাৰ্থক 'Courageous'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: 'Choose the synonym of "Brief".\n"Brief" ৰ সমাৰ্থক শব্দ বাছনি কৰা।',
      options: ['Long / দীঘল', 'Short / চুটি', 'Detailed / বিস্তৃত', 'Clear / স্পষ্ট'],
      correctAnswerIndex: 1,
      explanation:
        "'Brief' means short in duration or length; synonym 'Short'.\n'Brief' অৰ্থ চুটি; সমাৰ্থক 'Short'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },

    // --- Vocabulary: Antonyms (3) ---
    {
      question: 'Choose the antonym of "Ancient".\n"Ancient" ৰ বিপৰীত শব্দ বাছনি কৰা।',
      options: ['Old / পুৰণি', 'Historical / ঐতিহাসিক', 'Modern / আধুনিক', 'Antique / প্ৰাচীন'],
      correctAnswerIndex: 2,
      explanation:
        "'Ancient' means very old; its opposite is 'Modern'.\n'Ancient' অৰ্থ বহু পুৰণি; ইয়াৰ বিপৰীত 'Modern'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: 'Choose the antonym of "Generous".\n"Generous" ৰ বিপৰীত শব্দ বাছনি কৰা।',
      options: ['Kind / দয়ালু', 'Charitable / দানশীল', 'Liberal / উদাৰ', 'Miserly / কৃপণ'],
      correctAnswerIndex: 3,
      explanation:
        "'Generous' means willing to give; its opposite is 'Miserly'.\n'Generous' অৰ্থ দানশীল; ইয়াৰ বিপৰীত 'Miserly'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: 'Choose the antonym of "Victory".\n"Victory" ৰ বিপৰীত শব্দ বাছনি কৰা।',
      options: ['Defeat / পৰাজয়', 'Success / সফলতা', 'Triumph / বিজয়', 'Conquest / জয়'],
      correctAnswerIndex: 0,
      explanation:
        "'Victory' means winning; its opposite is 'Defeat'.\n'Victory' অৰ্থ জয়; ইয়াৰ বিপৰীত 'Defeat'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },

    // --- Vocabulary: One-word Substitution (2) ---
    {
      question:
        'Choose one word for: "A person who writes books."\nএটা শব্দ বাছনি কৰা: "যিজন ব্যক্তিয়ে কিতাপ লিখে।"',
      options: ['Reader / পাঠক', 'Author / লেখক', 'Publisher / প্ৰকাশক', 'Seller / বিক্ৰেতা'],
      correctAnswerIndex: 1,
      explanation:
        "A person who writes books is called an 'Author'.\nযিজনে কিতাপ লিখে তেওঁক 'Author' বোলে।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question:
        'Choose one word for: "One who cannot read or write."\nএটা শব্দ বাছনি কৰা: "যিজনে পঢ়িব বা লিখিব নোৱাৰে।"',
      options: ['Educated / শিক্ষিত', 'Literate / সাক্ষৰ', 'Illiterate / নিৰক্ষৰ', 'Scholar / পণ্ডিত'],
      correctAnswerIndex: 2,
      explanation:
        "One who cannot read or write is called 'Illiterate'.\nযিজনে পঢ়িব বা লিখিব নোৱাৰে তেওঁক 'Illiterate' বোলে।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },

    // --- Vocabulary: Spelling (2) ---
    {
      question: 'Choose the correctly spelt word.\nশুদ্ধ বানানৰ শব্দটো বাছনি কৰা।',
      options: [
        'Acommodation / আৱাসন',
        'Accomodation / আৱাসন',
        'Acomodation / আৱাসন',
        'Accommodation / আৱাসন',
      ],
      correctAnswerIndex: 3,
      explanation:
        "'Accommodation' has two c's and two m's.\n'Accommodation' ত দুটাকৈ c আৰু দুটাকৈ m আছে।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: 'Choose the correctly spelt word.\nশুদ্ধ বানানৰ শব্দটো বাছনি কৰা।',
      options: [
        'Definitely / নিশ্চিতভাৱে',
        'Definately / নিশ্চিতভাৱে',
        'Definitly / নিশ্চিতভাৱে',
        'Definitley / নিশ্চিতভাৱে',
      ],
      correctAnswerIndex: 0,
      explanation:
        "'Definitely' is spelt with 'finite' in the middle.\n'Definitely' ত মাজত 'finite' বানানটো আছে।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },

    // --- Sentence Correction (5) ---
    {
      question: 'Choose the correct sentence.\nশুদ্ধ বাক্যটো বাছনি কৰা।',
      options: [
        'He not know the answer / তেওঁ উত্তৰ নাজানে',
        "He doesn't know the answer / তেওঁ উত্তৰ নাজানে",
        "He didn't knew the answer / তেওঁ উত্তৰ নাজানিছিল",
        'He no know the answer / তেওঁ উত্তৰ নাজানে',
      ],
      correctAnswerIndex: 1,
      explanation:
        "With third-person singular 'He' in present tense, use 'doesn't' + base verb 'know'.\nThird-person singular 'He' ৰ লগত present tense ত 'doesn't' + base verb 'know' ব্যৱহাৰ কৰা হয়।",
      subjectTopic: 'Sentence Correction',
      marks: 1,
    },
    {
      question: 'Choose the correct sentence.\nশুদ্ধ বাক্যটো বাছনি কৰা।',
      options: [
        'She is most tall than me / তাই মতো আটাইতকৈ ওখ',
        'She is more taller than I / তাই মতো ওখ',
        'She is taller than I / তাই মতো ওখ',
        'She is tallest than me / তাই মতো আটাইতকৈ ওখ',
      ],
      correctAnswerIndex: 2,
      explanation:
        "'Tall' is a one-syllable adjective; its comparative is 'taller' (not 'more taller').\n'Tall' এটা একাক্ষৰ বিশেষণ; ইয়াৰ comparative 'taller', 'more taller' নহয়।",
      subjectTopic: 'Sentence Correction',
      marks: 1,
    },
    {
      question: 'Choose the correct sentence.\nশুদ্ধ বাক্যটো বাছনি কৰা।',
      options: [
        'I see him yesterday / মই তেওঁক কালি দেখো',
        'I am seeing him yesterday / মই তেওঁক কালি দেখি আছো',
        'I had seen him yesterday / মই তেওঁক কালি দেখিছিলো',
        'I saw him yesterday / মই তেওঁক কালি দেখিছিলো',
      ],
      correctAnswerIndex: 3,
      explanation:
        "'Yesterday' indicates a definite past time, so the simple past 'saw' is correct.\n'Yesterday' এ নিৰ্দিষ্ট অতীত সময় বুজায়, গতিকে simple past 'saw' শুদ্ধ।",
      subjectTopic: 'Sentence Correction',
      marks: 1,
    },
    {
      question: 'Choose the correct sentence.\nশুদ্ধ বাক্যটো বাছনি কৰা।',
      options: [
        'One of my friends is ill / মোৰ বন্ধুসকলৰ এজন অসুস্থ',
        'One of my friend are ill / মোৰ বন্ধুৰ এজন অসুস্থ',
        'One of my friends are ill / মোৰ বন্ধুসকলৰ এজন অসুস্থ',
        'One of my friend is being ill / মোৰ বন্ধুৰ এজন অসুস্থ হৈছে',
      ],
      correctAnswerIndex: 0,
      explanation:
        "'One of' is followed by a plural noun, and the verb agrees with 'One' (singular) — 'is'.\n'One of' ৰ পিছত plural noun আহে, আৰু verb 'One' (singular) ৰ লগত মিলে — 'is'।",
      subjectTopic: 'Sentence Correction',
      marks: 1,
    },
    {
      question: 'Choose the correct sentence.\nশুদ্ধ বাক্যটো বাছনি কৰা।',
      options: [
        'He lives here since 2010 / তেওঁ 2010 ৰ পৰা ইয়াত থাকে',
        'He has been living here since 2010 / তেওঁ 2010 ৰ পৰা ইয়াত থাকি আছে',
        'He is living here for 2010 / তেওঁ 2010 ৰ বাবে ইয়াত থাকি আছে',
        'He was living here since 2010 / তেওঁ 2010 ৰ পৰা ইয়াত থাকিছিল',
      ],
      correctAnswerIndex: 1,
      explanation:
        "An action that began in the past (since 2010) and continues uses the present perfect continuous: 'has been living'.\nঅতীতত আৰম্ভ হৈ চলি থকা কাম (since 2010) ৰ বাবে present perfect continuous 'has been living' ব্যৱহৃত হয়।",
      subjectTopic: 'Sentence Correction',
      marks: 1,
    },
  ],
};
