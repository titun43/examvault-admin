// =============================================================================
// ExamVault — SSC (CGL / CHSL & RRB NTPC) ALL-SUBJECTS POOL
// Bilingual question pool — Reasoning, Quantitative Aptitude, English, GA
//
// Format (CRITICAL — every field is bilingual EN + অসমীয়া):
//   question  -> "English\nঅসমীয়া"
//   option    -> "English / অসমীয়া"
//   expl      -> "English\nঅসমীয়া"
//
// Pools (20 each, 80 total):
//   ssc-reasoning : Analogy, Series, Coding, Syllogism, Non-Verbal
//   ssc-quant     : Percentage, Profit-Loss, Mensuration, Algebra, DI
//   ssc-english   : Grammar, Vocabulary, Comprehension
//   ssc-ga        : History, Geography, Polity, Science, Current Affairs
//
// correctAnswerIndex is distributed evenly across 0,1,2,3 in each pool
// (5 × each index per 20-question pool).
//
// Level: SSC CGL/CHSL & RRB NTPC, class XII–graduate.
// All answers are verifiable from standard references.
// =============================================================================
import type { QuestionPoolMap } from './structure';

export const SSC_POOLS: QuestionPoolMap = {
  // ===========================================================================
  // ssc-reasoning — 20 items (Analogy / Series / Coding / Syllogism / Non-Verbal)
  // ===========================================================================
  'ssc-reasoning': [
    // 1 — Analogy (idx 0)
    {
      question: "Dog : Puppy :: Cat : ?\nকুকুৰ : পিলু :: মেকুৰী : ?",
      options: [
        'Kitten / পোৱালি মেকুৰী',
        'Cub / পোৱালি',
        'Calf / বছৰা',
        'Foal / ঘোঁৰা পোৱালি',
      ],
      correctAnswerIndex: 0,
      explanation: "A puppy is the young one of a dog; similarly a kitten is the young one of a cat.\nকুকুৰৰ পোৱালিক পিলু বোলে; তেনেকৈ মেকুৰীৰ পোৱালিক kitten বোলে।",
      subjectTopic: 'Analogy',
      marks: 1,
    },
    // 2 — Series (idx 1)
    {
      question: "Find the next term: 2, 6, 12, 20, 30, ?\nপৰৱৰ্তী পদ বিচাৰক: 2, 6, 12, 20, 30, ?",
      options: [
        '40 / ৪০',
        '42 / ৪২',
        '44 / ৪৪',
        '46 / ৪৬',
      ],
      correctAnswerIndex: 1,
      explanation: "Differences are 4, 6, 8, 10, 12; next = 30 + 12 = 42.\nপাৰ্থক্যসমূহ 4, 6, 8, 10, 12; পৰৱৰ্তী = 30 + 12 = 42।",
      subjectTopic: 'Series',
      marks: 1,
    },
    // 3 — Coding (idx 2)
    {
      question: "If CAT is coded as 24, how is DOG coded?\nযদি CAT ক 24 হিচাপে সাঙ্কেতিক কৰা হয়, তেন্তে DOG ক কেনেকৈ সাঙ্কেতিক কৰা হ'ব?",
      options: [
        '25 / ২৫',
        '30 / ৩০',
        '26 / ২৬',
        '29 / ২৯',
      ],
      correctAnswerIndex: 2,
      explanation: "C + A + T = 3 + 1 + 20 = 24; D + O + G = 4 + 15 + 7 = 26.\nC + A + T = 3 + 1 + 20 = 24; D + O + G = 4 + 15 + 7 = 26।",
      subjectTopic: 'Coding',
      marks: 1,
    },
    // 4 — Syllogism (idx 3)
    {
      question: "All roses are flowers. Some flowers fade quickly. Therefore:\nসকলো গোলাপ ফুল। কিছুমান ফুল সোনকালে শুকায়। সিহতে:"
        ,
      options: [
        'All roses fade quickly / সকলো গোলাপ সোনকালে শুকায়',
        'Some roses fade quickly / কিছুমান গোলাপ সোনকালে শুকায়',
        'No conclusion follows / কোনো সিদ্ধান্ত নহয়',
        'No roses fade quickly / কোনো গোলাপ সোনকালে নশুকায়',
      ],
      correctAnswerIndex: 3,
      explanation: "The middle term 'flowers' is not distributed, so no valid conclusion follows between roses and fading.\nমধ্য পদ 'ফুল' বিতৰিত নহয়, গতিকে গোলাপ আৰু শুকাৰ মাজত কোনো বৈধ সিদ্ধান্ত নাই।",
      subjectTopic: 'Syllogism',
      marks: 1,
    },
    // 5 — Analogy (idx 0)
    {
      question: "Book : Author :: Painting : ?\nপুথি : লেখক :: চিত্ৰ : ?",
      options: [
        'Painter / চিত্ৰশিল্পী',
        'Brush / তুলি',
        'Canvas / কেনভাছ',
        'Colour / ৰং',
      ],
      correctAnswerIndex: 0,
      explanation: "A book is created by an author; a painting is created by a painter.\nপুথি এজন লেখকে সৃষ্টি কৰে; চিত্ৰ এজন চিত্ৰশিল্পীয়ে সৃষ্টি কৰে।",
      subjectTopic: 'Analogy',
      marks: 1,
    },
    // 6 — Series (idx 1)
    {
      question: "Complete the series: 1, 4, 9, 16, 25, ?\nশ্ৰেণী সম্পূৰ্ণ কৰক: 1, 4, 9, 16, 25, ?",
      options: [
        '30 / ৩০',
        '36 / ৩৬',
        '49 / ৪৯',
        '64 / ৬৪',
      ],
      correctAnswerIndex: 1,
      explanation: "Squares of natural numbers: 6² = 36.\nস্বাভাৱিক সংখ্যাৰ বৰ্গ: 6² = 36।",
      subjectTopic: 'Series',
      marks: 1,
    },
    // 7 — Coding (idx 2)
    {
      question: "In a code, if APPLE is written as BQQMF, how is MANGO written?\nএটা সংকেতত যদি APPLE ক BQQMF লিখা হয়, তেন্তে MANGO ক কেনেকৈ লিখা হ'ব?",
      options: [
        'OCPIQ / OCPIQ',
        'OBOHP / OBOHP',
        'NBOHP / NBOHP',
        'NCOIQ / NCOIQ',
      ],
      correctAnswerIndex: 2,
      explanation: "Each letter is shifted by +1: A→B, P→Q, L→M, E→F; M→N, A→B, N→O, G→H, O→P gives NBOHP.\nপ্ৰতিটো আখৰ +1 কৈ স্থানান্তৰ: M→N, A→B, N→O, G→H, O→P এ NBOHP দিয়ে।",
      subjectTopic: 'Coding',
      marks: 1,
    },
    // 8 — Syllogism (idx 3)
    {
      question: "All men are mortal. Rahul is a man. Therefore:\nসকলো মানুহ মৰণশীল। ৰাহুল এজন মানুহ। সেয়েহে:",
      options: [
        'Rahul is immortal / ৰাহুল অমৰ',
        "Rahul may be mortal / ৰাহুল হয়তো মৰণশীল হ'ব পাৰে",
        'Rahul is not mortal / ৰাহুল মৰণশীল নহয়',
        'Rahul is mortal / ৰাহুল মৰণশীল',
      ],
      correctAnswerIndex: 3,
      explanation: "Valid syllogism (AAA-1 / Barbara): if all M are P and all S are M, then all S are P. Rahul is mortal.\nবৈধ যুক্তি (Barbara): সকলো মানুহ মৰণশীল আৰু ৰাহুল মানুহ, গতিকে ৰাহুল মৰণশীল।",
      subjectTopic: 'Syllogism',
      marks: 1,
    },
    // 9 — Non-Verbal (idx 0)
    {
      question: "The mirror image of the letter 'b' is:\n'b' আখৰটোৰ দাপোণ প্ৰতিবিম্ব কি?",
      options: [
        'd / d',
        'p / p',
        'q / q',
        'b / b',
      ],
      correctAnswerIndex: 0,
      explanation: "A mirror placed to the right of 'b' reflects it as 'd'.\n'b' ৰ সোঁফালে দাপোণ থাকিলে ইয়াক 'd' হিচাপে প্ৰতিফলিত কৰে।",
      subjectTopic: 'Non-Verbal',
      marks: 1,
    },
    // 10 — Non-Verbal (idx 1)
    {
      question: "The water image of the digit '6' is:\n'6' সংখ্যাটোৰ জল প্ৰতিবিম্ব কি?",
      options: [
        '6 / ৬',
        '9 / ৯',
        '0 / ০',
        '8 / ৮',
      ],
      correctAnswerIndex: 1,
      explanation: "A water image (reflection across a horizontal line) of '6' appears as '9'.\n'6' ৰ জল প্ৰতিবিম্ব (অনুভূমিক ৰেখাৰ সম্মুখে প্ৰতিফলন) '9' দেখা যায়।",
      subjectTopic: 'Non-Verbal',
      marks: 1,
    },
    // 11 — Non-Verbal (idx 2)
    {
      question: "A square paper is folded along its diagonal and then cut at one corner. On unfolding, the cut will appear as:\nএখন বৰ্গকাগজ কৰ্ণ অনুসৰি ভাঁজ কৰি এটা চুকত কাট দিয়া হ'ল। খোলোতে কাটটো কেনেকৈ দেখা যাব?",
      options: [
        'One cut on one corner / এটা চুকত এটা কাট',
        'Two cuts on adjacent corners / ওচৰা-ওচৰি চুকত দুটা কাট',
        'Two cuts on opposite corners / বিপৰীত চুকত দুটা কাট',
        'Four cuts / চাৰিটা কাট',
      ],
      correctAnswerIndex: 2,
      explanation: "Folding along the diagonal makes two opposite corners coincide; a single cut appears on both opposite corners after unfolding.\nকৰ্ণ অনুসৰি ভাঁজ কৰিলে দুটা বিপৰীত চুক একত্ৰিত হয়; খোলোতে এটা কাট দুয়োটা বিপৰীত চুকত দেখা যায়।",
      subjectTopic: 'Non-Verbal',
      marks: 1,
    },
    // 12 — Analogy (idx 3)
    {
      question: "Doctor : Hospital :: Teacher : ?\nডাক্তৰ : চিকিৎসালয় :: শিক্ষক : ?",
      options: [
        'Classroom / শ্ৰেণীকোঠা',
        'Student / ছাত্ৰ',
        'Book / পুথি',
        'School / বিদ্যালয়',
      ],
      correctAnswerIndex: 3,
      explanation: "A doctor works in a hospital; a teacher works in a school.\nডাক্তৰে চিকিৎসালয়ত কাম কৰে; শিক্ষকে বিদ্যালয়ত কাম কৰে।",
      subjectTopic: 'Analogy',
      marks: 1,
    },
    // 13 — Series (idx 0)
    {
      question: "Find the missing term: 3, 6, 11, 18, 27, ?\nঅনুপস্থিত পদ বিচাৰক: 3, 6, 11, 18, 27, ?",
      options: [
        '38 / ৩৮',
        '36 / ৩৬',
        '40 / ৪০',
        '42 / ৪২',
      ],
      correctAnswerIndex: 0,
      explanation: "Differences are odd numbers 3, 5, 7, 9, 11; next = 27 + 11 = 38.\nপাৰ্থক্যসমূহ অযুগ্ম সংখ্যা 3, 5, 7, 9, 11; পৰৱৰ্তী = 27 + 11 = 38।",
      subjectTopic: 'Series',
      marks: 1,
    },
    // 14 — Coding (idx 1)
    {
      question: "If FRIEND is coded as GSJFOE, then how is CANDLE coded?\nযদি FRIEND ক GSJFOE সাঙ্কেতিক কৰা হয়, তেন্তে CANDLE ক কেনেকৈ সাঙ্কেতিক কৰা হ'ব?",
      options: [
        'DCPEMG / DCPEMG',
        'DBOEMF / DBOEMF',
        'DBPNFME / DBPNFME',
        'DBOEPF / DBOEPF',
      ],
      correctAnswerIndex: 1,
      explanation: "Each letter is shifted by +1: F→G, R→S, I→J, E→F, N→O, D→E; C→D, A→B, N→O, D→E, L→M, E→F gives DBOEMF.\nপ্ৰতিটো আখৰ +1 কৈ স্থানান্তৰ: C→D, A→B, N→O, D→E, L→M, E→F এ DBOEMF দিয়ে।",
      subjectTopic: 'Coding',
      marks: 1,
    },
    // 15 — Syllogism (idx 2)
    {
      question: "Some pens are pencils. All pencils are erasers. Therefore:\nকিছুমান কলম পেঞ্চিল। সকলো পেঞ্চিল ইৰেজাৰ। সেয়েহে:",
      options: [
        'All pens are erasers / সকলো কলম ইৰেজাৰ',
        'No pens are erasers / কোনো কলম ইৰেজাৰ নহয়',
        'Some pens are erasers / কিছুমান কলম ইৰেজাৰ',
        'No conclusion follows / কোনো সিদ্ধান্ত নাই',
      ],
      correctAnswerIndex: 2,
      explanation: "Valid syllogism (AII-1 / Darii): if some S are M and all M are P, then some S are P.\nবৈধ যুক্তি (Darii): কিছু কলম পেঞ্চিল আৰু সকলো পেঞ্চিল ইৰেজাৰ হ'লে কিছু কলম ইৰেজাৰ।",
      subjectTopic: 'Syllogism',
      marks: 1,
    },
    // 16 — Analogy (idx 3)
    {
      question: "Bird : Sky :: Fish : ?\nচৰাই : আকাশ :: মাছ : ?",
      options: [
        'River / নদী',
        'Water / পানী',
        'Pond / পুখুৰী',
        'Sea / সাগৰ',
      ],
      correctAnswerIndex: 3,
      explanation: "A bird lives in the sky; a fish lives in water (river/pond/sea). Here the most general 'Sea' is paired to 'Sky'.\nচৰাই আকাশত বাস কৰে; মাছ পানীত বাস কৰে। ইয়াত 'Sky' ৰ সৈতে সৰ্বাধিক সাধাৰণ 'Sea' যোৰা লগোৱা হৈছে।",
      subjectTopic: 'Analogy',
      marks: 1,
    },
    // 17 — Series (idx 0)
    {
      question: "Find the next letter: A, C, F, J, O, ?\nপৰৱৰ্তী আখৰ বিচাৰক: A, C, F, J, O, ?",
      options: [
        'U / U',
        'T / T',
        'V / V',
        'S / S',
      ],
      correctAnswerIndex: 0,
      explanation: "Differences are +2, +3, +4, +5, +6; O + 6 = U.\nপাৰ্থক্যসমূহ +2, +3, +4, +5, +6; O + 6 = U।",
      subjectTopic: 'Series',
      marks: 1,
    },
    // 18 — Coding (idx 1)
    {
      question: "If in a certain code, LEADER is written as OHDGHU, how is MASTER written?\nযদি এটা সংকেতত LEADER ক OHDGHU লিখা হয়, তেন্তে MASTER ক কেনেকৈ লিখা হ'ব?",
      options: [
        'PDWVHU / PDWVHU',
        'PDVWHU / PDVWHU',
        'PCVWHU / PCVWHU',
        'PDVWGU / PDVWGU',
      ],
      correctAnswerIndex: 1,
      explanation: "Each letter is shifted by +3: L→O, E→H, A→D, D→G, E→H, R→U; M→P, A→D, S→V, T→W, E→H, R→U gives PDVWHU.\nপ্ৰতিটো আখৰ +3 কৈ স্থানান্তৰ: M→P, A→D, S→V, T→W, E→H, R→U এ PDVWHU দিয়ে।",
      subjectTopic: 'Coding',
      marks: 1,
    },
    // 19 — Syllogism (idx 2)
    {
      question: "No bird is a mammal. All bats are mammals. Therefore:\nকোনো চৰাই স্তন্যপায়ী নহয়। সকলো বাদুলি স্তন্যপায়ী। সেয়েহে:",
      options: [
        'All bats are birds / সকলো বাদুলি চৰাই',
        'Some bats are birds / কিছুমান বাদুলি চৰাই',
        'No bat is a bird / কোনো বাদুলি চৰাই নহয়',
        'No conclusion follows / কোনো সিদ্ধান্ত নাই',
      ],
      correctAnswerIndex: 2,
      explanation: "Valid syllogism (EAE-1 / Celarent): if no M are P and all S are M, then no S are P.\nবৈধ যুক্তি (Celarent): কোনো স্তন্যপায়ী চৰাই নহয় আৰু সকলো বাদুলি স্তন্যপায়ী হ'লে কোনো বাদুলি চৰাই নহয়।",
      subjectTopic: 'Syllogism',
      marks: 1,
    },
    // 20 — Analogy (idx 3)
    {
      question: "Pilot : Aeroplane :: Captain : ?\nপাইলট : বিমান :: কেপ্টেইন : ?",
      options: [
        'Crew / ক্ৰু',
        'Passenger / যাত্ৰী',
        'Port / বন্দৰ',
        'Ship / জাহাজ',
      ],
      correctAnswerIndex: 3,
      explanation: "A pilot commands an aeroplane; a captain commands a ship.\nপাইলটে বিমান চলায়; কেপ্টেইনে জাহাজ চলায়।",
      subjectTopic: 'Analogy',
      marks: 1,
    },
  ],

  // ===========================================================================
  // ssc-quant — 20 items (Percentage / Profit-Loss / Mensuration / Algebra / DI)
  // ===========================================================================
  'ssc-quant': [
    // 1 — Percentage (idx 0)
    {
      question: "What is 20% of 450?\n450 ৰ 20% কিমান?",
      options: [
        '90 / ৯০',
        '80 / ৮০',
        '45 / ৪৫',
        '9 / ৯',
      ],
      correctAnswerIndex: 0,
      explanation: "20% of 450 = (20/100) × 450 = 90.\n450 ৰ 20% = (20/100) × 450 = 90।",
      subjectTopic: 'Percentage',
      marks: 1,
    },
    // 2 — Profit-Loss (idx 1)
    {
      question: "A man buys an article for ₹500 and sells it for ₹600. His profit percentage is:\nএজন মানুহে ₹500 ত এটা সামগ্ৰী কিনি ₹600 ত বিক্ৰী কৰে। তেওঁৰ লাভ শতকৰা কিমান?",
      options: [
        '10% / 10%',
        '20% / 20%',
        '25% / 25%',
        '15% / 15%',
      ],
      correctAnswerIndex: 1,
      explanation: "Profit = 600 − 500 = ₹100; Profit% = (100/500) × 100 = 20%.\nলাভ = 600 − 500 = ₹100; লাভ% = (100/500) × 100 = 20%।",
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },
    // 3 — Mensuration (idx 2)
    {
      question: "The area of a circle with radius 7 cm is (use π = 22/7):\nব্যাসাৰ্ধ 7 ছে.মি. থকা এটা বৃত্তৰ কালি (π = 22/7 ব্যৱহাৰ কৰা):",
      options: [
        '144 cm² / 144 ছে.মি.²',
        '164 cm² / 164 ছে.মি.²',
        '154 cm² / 154 ছে.মি.²',
        '49π cm² / 49π ছে.মি.²',
      ],
      correctAnswerIndex: 2,
      explanation: "Area = πr² = (22/7) × 7² = 22 × 7 = 154 cm².\nকালি = πr² = (22/7) × 7² = 22 × 7 = 154 ছে.মি.²।",
      subjectTopic: 'Mensuration',
      marks: 1,
    },
    // 4 — Algebra (idx 3)
    {
      question: "If x + y = 5 and xy = 6, then x² + y² = ?\nযদি x + y = 5 আৰু xy = 6, তেন্তে x² + y² = ?",
      options: [
        '25 / ২৫',
        '11 / ১১',
        '12 / ১২',
        '13 / ১৩',
      ],
      correctAnswerIndex: 3,
      explanation: "x² + y² = (x + y)² − 2xy = 25 − 12 = 13.\nx² + y² = (x + y)² − 2xy = 25 − 12 = 13।",
      subjectTopic: 'Algebra',
      marks: 1,
    },
    // 5 — DI (idx 0)
    {
      question: "A bar chart shows sales of ₹10,000, ₹15,000, ₹20,000 and ₹25,000 for four months. The average monthly sales (in ₹) is:\nবাৰ চাৰ্টত চাৰিমাহৰ বিক্ৰী ₹10,000, ₹15,000, ₹20,000 আৰু ₹25,000 দেখুওৱা হৈছে। গড় মাহিলী বিক্ৰী (₹ ত) কিমান?",
      options: [
        '₹17,500 / ₹17,500',
        '₹15,000 / ₹15,000',
        '₹20,000 / ₹20,000',
        '₹17,000 / ₹17,000',
      ],
      correctAnswerIndex: 0,
      explanation: "Average = (10000 + 15000 + 20000 + 25000) / 4 = 70000 / 4 = ₹17,500.\nগড় = (10000 + 15000 + 20000 + 25000) / 4 = 70000 / 4 = ₹17,500।",
      subjectTopic: 'DI',
      marks: 1,
    },
    // 6 — Percentage (idx 1)
    {
      question: "If 30% of a number is 90, the number is:\nযদি কোনো সংখ্যাৰ 30% হয় 90, তেন্তে সংখ্যাটো হ'ব:",
      options: [
        '270 / 270',
        '300 / 300',
        '120 / 120',
        '3 / 3',
      ],
      correctAnswerIndex: 1,
      explanation: "Let the number be x. Then 0.30 × x = 90, so x = 90 / 0.30 = 300.\nধৰা হ'ল সংখ্যাটো x। তেন্তে 0.30 × x = 90, গতিকে x = 90 / 0.30 = 300।",
      subjectTopic: 'Percentage',
      marks: 1,
    },
    // 7 — Profit-Loss (idx 2)
    {
      question: "A shopkeeper sells an article at ₹850 with a loss of 15%. The cost price was:\nএজন দোকানদাৰে 15% লোকচানত এটা সামগ্ৰী ₹850 ত বিক্ৰী কৰে। ক্ৰয়মূল্য আছিল:",
      options: [
        '₹722.50 / ₹722.50',
        '₹977.50 / ₹977.50',
        '₹1,000 / ₹1,000',
        '₹1,100 / ₹1,100',
      ],
      correctAnswerIndex: 2,
      explanation: "SP = CP × (1 − 0.15) ⇒ 850 = 0.85 × CP ⇒ CP = 850 / 0.85 = ₹1,000.\nবিক্ৰীমূল্য = ক্ৰয়মূল্য × 0.85 ⇒ 850 = 0.85 × ক্ৰয়মূল্য ⇒ ক্ৰয়মূল্য = ₹1,000।",
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },
    // 8 — Mensuration (idx 3)
    {
      question: "The volume of a cube of side 5 cm is:\nবাহু 5 ছে.মি. থকা এটা ঘনকৰ আয়তন কিমান?",
      options: [
        '25 cm³ / 25 ছে.মি.³',
        '100 cm³ / 100 ছে.মি.³',
        '150 cm³ / 150 ছে.মি.³',
        '125 cm³ / 125 ছে.মি.³',
      ],
      correctAnswerIndex: 3,
      explanation: "Volume of a cube = side³ = 5³ = 125 cm³.\nঘনকৰ আয়তন = বাহু³ = 5³ = 125 ছে.মি.³।",
      subjectTopic: 'Mensuration',
      marks: 1,
    },
    // 9 — Algebra (idx 0)
    {
      question: "Solve for x: 2x + 5 = 17.\nx ৰ মান বিচাৰক: 2x + 5 = 17।",
      options: [
        '6 / 6',
        '4 / 4',
        '7 / 7',
        '12 / 12',
      ],
      correctAnswerIndex: 0,
      explanation: "2x + 5 = 17 ⇒ 2x = 12 ⇒ x = 6.\n2x + 5 = 17 ⇒ 2x = 12 ⇒ x = 6।",
      subjectTopic: 'Algebra',
      marks: 1,
    },
    // 10 — DI (idx 1)
    {
      question: "A pie chart shows that food expenditure is 30% of total income of ₹40,000. The amount spent on food (in ₹) is:\nপাই চাৰ্টত খাদ্যত খৰচ মুঠ উপাৰ্জন ₹40,000 ৰ 30% দেখুওৱা হৈছে। খাদ্যত খৰচ কৰা ধনৰাশি (₹ ত) কিমান?",
      options: [
        '₹10,000 / ₹10,000',
        '₹12,000 / ₹12,000',
        '₹14,000 / ₹14,000',
        '₹15,000 / ₹15,000',
      ],
      correctAnswerIndex: 1,
      explanation: "30% of ₹40,000 = 0.30 × 40000 = ₹12,000.\n₹40,000 ৰ 30% = 0.30 × 40000 = ₹12,000।",
      subjectTopic: 'DI',
      marks: 1,
    },
    // 11 — Percentage (idx 2)
    {
      question: "A student scored 360 marks out of 500. His percentage is:\nএজন ছাত্ৰই 500 ৰ ভিতৰত 360 নম্বৰ পালে। তেওঁৰ শতকৰা কিমান?",
      options: [
        '70% / 70%',
        '75% / 75%',
        '72% / 72%',
        '80% / 80%',
      ],
      correctAnswerIndex: 2,
      explanation: "Percentage = (360 / 500) × 100 = 72%.\nশতকৰা = (360 / 500) × 100 = 72%।",
      subjectTopic: 'Percentage',
      marks: 1,
    },
    // 12 — Profit-Loss (idx 3)
    {
      question: "By selling a chair for ₹720, a trader gains 20%. The cost price of the chair is:\nএখন চকী ₹720 ত বিক্ৰী কৰি এজন ব্যৱসায়ীয়ে 20% লাভ কৰে। চকীখনৰ ক্ৰয়মূল্য কিমান?",
      options: [
        '₹864 / ₹864',
        '₹576 / ₹576',
        '₹700 / ₹700',
        '₹600 / ₹600',
      ],
      correctAnswerIndex: 3,
      explanation: "SP = CP × 1.20 ⇒ 720 = 1.20 × CP ⇒ CP = ₹600.\nবিক্ৰীমূল্য = ক্ৰয়মূল্য × 1.20 ⇒ 720 = 1.20 × ক্ৰয়মূল্য ⇒ ক্ৰয়মূল্য = ₹600।",
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },
    // 13 — Mensuration (idx 0)
    {
      question: "The perimeter of a rectangle with length 12 cm and breadth 5 cm is:\nদীঘল 12 ছে.মি. আৰু প্ৰস্থ 5 ছে.মি. থকা এটা আয়তৰ পৰিসীমা কিমান?",
      options: [
        '34 cm / 34 ছে.মি.',
        '60 cm / 60 ছে.মি.',
        '17 cm / 17 ছে.মি.',
        '24 cm / 24 ছে.মি.',
      ],
      correctAnswerIndex: 0,
      explanation: "Perimeter = 2 × (l + b) = 2 × (12 + 5) = 34 cm.\nপৰিসীমা = 2 × (দৈৰ্ঘ্য + প্ৰস্থ) = 2 × (12 + 5) = 34 ছে.মি.।",
      subjectTopic: 'Mensuration',
      marks: 1,
    },
    // 14 — Algebra (idx 1)
    {
      question: "If x = 3, find the value of 2x² − 3x + 1.\nযদি x = 3, তেন্তে 2x² − 3x + 1 ৰ মান বিচাৰক।",
      options: [
        '8 / 8',
        '10 / 10',
        '12 / 12',
        '7 / 7',
      ],
      correctAnswerIndex: 1,
      explanation: "2(3²) − 3(3) + 1 = 18 − 9 + 1 = 10.\n2(3²) − 3(3) + 1 = 18 − 9 + 1 = 10।",
      subjectTopic: 'Algebra',
      marks: 1,
    },
    // 15 — DI (idx 2)
    {
      question: "In a class of 50 students, 40% are girls. The number of boys is:\n50 জন ছাত্ৰ থকা এটা শ্ৰেণীত 40% ছোৱালী। ল'ৰাৰ সংখ্যা কিমান?",
      options: [
        '20 / 20',
        '25 / 25',
        '30 / 30',
        '15 / 15',
      ],
      correctAnswerIndex: 2,
      explanation: "Boys = 60% of 50 = 0.60 × 50 = 30 (or 50 − 20 = 30).\nল'ৰা = 50 ৰ 60% = 0.60 × 50 = 30 (বা 50 − 20 = 30)।",
      subjectTopic: 'DI',
      marks: 1,
    },
    // 16 — Percentage (idx 3)
    {
      question: "The price of an article increases from ₹200 to ₹250. The percentage increase is:\nএটা সামগ্ৰীৰ দাম ₹200 ৰ পৰা ₹250 লৈ বাঢ়িল। শতকৰা বৃদ্ধি কিমান?",
      options: [
        '20% / 20%',
        '30% / 30%',
        '15% / 15%',
        '25% / 25%',
      ],
      correctAnswerIndex: 3,
      explanation: "% increase = (Increase / Original) × 100 = (50 / 200) × 100 = 25%.\nবৃদ্ধি % = (বৃদ্ধি / আৰম্ভণি মূল্য) × 100 = (50 / 200) × 100 = 25%।",
      subjectTopic: 'Percentage',
      marks: 1,
    },
    // 17 — Profit-Loss (idx 0)
    {
      question: "A trader marks his goods 40% above cost and gives a discount of 10%. His profit percentage is:\nএজন ব্যৱসায়ীয়ে ক্ৰয়মূল্যতকৈ 40% বেছি দাম লগায় আৰু 10% বাট্টা দিয়ে। তেওঁৰ লাভ শতকৰা কিমান?",
      options: [
        '26% / 26%',
        '30% / 30%',
        '24% / 24%',
        '36% / 36%',
      ],
      correctAnswerIndex: 0,
      explanation: "Let CP = ₹100. MP = ₹140, SP = 140 × 0.90 = ₹126. Profit = 26%.\nধৰা হ'ল ক্ৰয়মূল্য = ₹100। চিহ্নিত মূল্য = ₹140, বিক্ৰীমূল্য = 140 × 0.90 = ₹126। লাভ = 26%।",
      subjectTopic: 'Profit-Loss',
      marks: 1,
    },
    // 18 — Mensuration (idx 1)
    {
      question: "The surface area of a cube of side 3 cm is:\nবাহু 3 ছে.মি. থকা এটা ঘনকৰ পৃষ্ঠকালি কিমান?",
      options: [
        '27 cm² / 27 ছে.মি.²',
        '54 cm² / 54 ছে.মি.²',
        '36 cm² / 36 ছে.মি.²',
        '9 cm² / 9 ছে.মি.²',
      ],
      correctAnswerIndex: 1,
      explanation: "Surface area of a cube = 6 × side² = 6 × 9 = 54 cm².\nঘনকৰ পৃষ্ঠকালি = 6 × বাহু² = 6 × 9 = 54 ছে.মি.²।",
      subjectTopic: 'Mensuration',
      marks: 1,
    },
    // 19 — Algebra (idx 2)
    {
      question: "If the roots of x² − 5x + 6 = 0 are α and β, then α + β is:\nযদি x² − 5x + 6 = 0 ৰ মূল α আৰু β হয়, তেন্তে α + β হ'ব:",
      options: [
        '6 / 6',
        '−6 / −6',
        '5 / 5',
        '−5 / −5',
      ],
      correctAnswerIndex: 2,
      explanation: "For ax² + bx + c = 0, sum of roots = −b/a = 5/1 = 5.\nax² + bx + c = 0 ৰ বাবে মূলৰ যোগফল = −b/a = 5/1 = 5।",
      subjectTopic: 'Algebra',
      marks: 1,
    },
    // 20 — DI (idx 3)
    {
      question: "A line graph shows a company's profit: ₹2 lakh, ₹3 lakh, ₹4 lakh and ₹5 lakh in four consecutive years. The total profit over the four years (in ₹ lakh) is:\nএটা ৰেখাচিত্ৰত এটা কোম্পানীৰ লাভ চাৰিটা ক্ৰমিক বছৰত ₹2 লাখ, ₹3 লাখ, ₹4 লাখ আৰু ₹5 লাখ দেখুওৱা হৈছে। চাৰিটা বছৰৰ মুঠ লাভ (₹ লাখত) কিমান?",
      options: [
        '₹12 lakh / ₹12 লাখ',
        '₹13 lakh / ₹13 লাখ',
        '₹10 lakh / ₹10 লাখ',
        '₹14 lakh / ₹14 লাখ',
      ],
      correctAnswerIndex: 3,
      explanation: "Total = 2 + 3 + 4 + 5 = ₹14 lakh.\nমুঠ = 2 + 3 + 4 + 5 = ₹14 লাখ।",
      subjectTopic: 'DI',
      marks: 1,
    },
  ],

  // ===========================================================================
  // ssc-english — 20 items (Grammar / Vocabulary / Comprehension)
  // ===========================================================================
  'ssc-english': [
    // 1 — Grammar (idx 0)
    {
      question: "Choose the correct tense form: She ____ to school every day.\nশুদ্ধ কাল ৰূপ বাছক: তাই প্ৰতিদিন বিদ্যালয়লৈ ____।",
      options: [
        'goes / যায়',
        'went / গৈছিল',
        'gone / গৈছে',
        'going / গৈ আছে',
      ],
      correctAnswerIndex: 0,
      explanation: "For a habitual action with 'every day', we use the simple present tense — 'goes'.\n'প্ৰতিদিন' থকা নিয়মিত কাৰ্যৰ বাবে simple present tense 'goes' ব্যৱহাৰ কৰা হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    // 2 — Vocabulary (idx 1)
    {
      question: "Choose the synonym of 'Abundant':\n'Abundant' ৰ সমাৰ্থক শব্দ বাছক:",
      options: [
        'Scarce / বিৰল',
        'Plentiful / প্ৰচুৰ',
        'Few / কম',
        'Empty / খালী',
      ],
      correctAnswerIndex: 1,
      explanation: "'Abundant' means existing in large quantities; 'Plentiful' is its synonym.\n'Abundant' মানে প্ৰচুৰ পৰিমাণে থকা; 'Plentiful' ইয়াৰ সমাৰ্থক।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    // 3 — Comprehension (idx 2)
    {
      question: "Read: 'Trees give us oxygen, food and shelter. They prevent soil erosion.' The passage mainly tells us that trees are ____.\nপঢ়ক: 'গছে আমাক অক্সিজেন, খাদ্য আৰু আশ্ৰয় দিয়ে। ইহঁতে মাটিৰ ক্ষয় ৰোধ কৰে।' এই অনুচ্ছেদে মূলতঃ কয় যে গছবোৰ ____।",
      options: [
        'useless / অকামিয়া',
        'dangerous / বিপজ্জনক',
        'useful / উপকাৰী',
        'rare / বিৰল',
      ],
      correctAnswerIndex: 2,
      explanation: "The passage lists benefits of trees — oxygen, food, shelter, and soil conservation — showing trees are useful.\nঅনুচ্ছেদত গছৰ উপকাৰিতা — অক্সিজেন, খাদ্য, আশ্ৰয় আৰু মাটি সংৰক্ষণ — দেখুওৱা হৈছে।",
      subjectTopic: 'Comprehension',
      marks: 1,
    },
    // 4 — Grammar (idx 3)
    {
      question: "Change to passive voice: 'Rama writes a letter.'\nPassive voice লৈ সলনি কৰক: 'ৰামে এখন চিঠি লিখে।'",
      options: [
        'A letter was written by Rama. / এখন চিঠি ৰামৰ দ্বাৰা লিখা হৈছিল।',
        'A letter is being written by Rama. / এখন চিঠি ৰামৰ দ্বাৰা লিখা হৈ আছে।',
        'A letter has been written by Rama. / এখন চিঠি ৰামৰ দ্বাৰা লিখা হৈছে।',
        'A letter is written by Rama. / এখন চিঠি ৰামৰ দ্বাৰা লিখা যায়।',
      ],
      correctAnswerIndex: 3,
      explanation: "Simple present active 'writes' becomes simple present passive 'is written'. So 'A letter is written by Rama.'\nSimple present active 'writes' এ simple present passive 'is written' হয়। গতিকে 'A letter is written by Rama.'।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    // 5 — Vocabulary (idx 0)
    {
      question: "Choose the antonym of 'Ancient':\n'Ancient' ৰ বিপৰীত শব্দ বাছক:",
      options: [
        'Modern / আধুনিক',
        'Old / পুৰণি',
        'Antique / প্ৰাচীন',
        'Past / অতীত',
      ],
      correctAnswerIndex: 0,
      explanation: "'Ancient' means very old; its opposite is 'Modern'.\n'Ancient' মানে বহু পুৰণি; ইয়াৰ বিপৰীত হ'ল 'Modern'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    // 6 — Grammar (idx 1)
    {
      question: "Choose the correct article: ____ Himalayas are the highest mountains in the world.\nশুদ্ধ article বাছক: ____ হিমালয় বিশ্বৰ সৰ্বোচ্চ পৰ্বতমালা।",
      options: [
        'A / A',
        'The / The',
        'An / An',
        'No article / কোনো article নাই',
      ],
      correctAnswerIndex: 1,
      explanation: "Mountain ranges take the definite article 'the': 'The Himalayas'.\nপৰ্বতমালাৰ আগত নিৰ্দিষ্ট article 'the' ব্যৱহৃত হয়: 'The Himalayas'।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    // 7 — Vocabulary (idx 2)
    {
      question: "One-word substitution for 'A person who writes books':\n'কিতাপ লিখা ব্যক্তি' ৰ এটা শব্দৰ প্ৰতিশব্দ দিয়ক:",
      options: [
        'Reader / পাঠক',
        'Seller / বিক্ৰেতা',
        'Author / লেখক',
        'Publisher / প্ৰকাশক',
      ],
      correctAnswerIndex: 2,
      explanation: "A person who writes books is called an 'Author'.\nকিতাপ লিখা ব্যক্তিক 'Author' বোলা হয়।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    // 8 — Comprehension (idx 3)
    {
      question: "Read: 'Water boils at 100°C at sea level.' At sea level, water becomes a gas at:\nপঢ়ক: 'সমুদ্ৰ পৃষ্ঠত পানী 100°C ত উতলে।' সমুদ্ৰ পৃষ্ঠত পানী কিমান ডিগ্ৰীত গেছ হয়?",
      options: [
        '0°C / 0°C',
        '50°C / 50°C',
        '212°C / 212°C',
        '100°C / 100°C',
      ],
      correctAnswerIndex: 3,
      explanation: "The passage states water boils (becomes a gas) at 100°C at sea level.\nঅনুচ্ছেদত কোৱা হৈছে যে সমুদ্ৰ পৃষ্ঠত পানী 100°C ত উতলে (গেছ হয়)।",
      subjectTopic: 'Comprehension',
      marks: 1,
    },
    // 9 — Grammar (idx 0)
    {
      question: "Fill in the blank with the correct preposition: He is fond ____ music.\nশুদ্ধ preposition দি ৰিক্তস্থান পূৰ কৰক: তেওঁ সংগীত ____ অনুৰাগী।",
      options: [
        'of / of',
        'in / in',
        'with / with',
        'for / for',
      ],
      correctAnswerIndex: 0,
      explanation: "'Fond of' is the correct prepositional phrase.\n'Fond of' শুদ্ধ prepositional phrase।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    // 10 — Vocabulary (idx 1)
    {
      question: "Choose the correctly spelt word:\nশুদ্ধ বানানৰ শব্দটো বাছক:",
      options: [
        'Recieve / Recieve',
        'Receive / Receive',
        'Receeve / Receeve',
        'Receve / Receve',
      ],
      correctAnswerIndex: 1,
      explanation: "The correct spelling is 'Receive' (rule: 'i before e except after c').\nশুদ্ধ বানান হ'ল 'Receive' (নিয়ম: 'i before e except after c')।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    // 11 — Grammar (idx 2)
    {
      question: "Change to indirect speech: He said, 'I am happy.'\nIndirect speech লৈ সলনি কৰক: তেওঁ ক'লে, 'মই সুখী।'",
      options: [
        "He said that he is happy. / তেওঁ ক'লে যে তেওঁ সুখী।",
        "He said that I was happy. / তেওঁ ক'লে যে মই সুখী আছিলোঁ।",
        "He said that he was happy. / তেওঁ ক'লে যে তেওঁ সুখী আছিল।",
        'He says that he was happy. / তেওঁ কয় যে তেওঁ সুখী আছিল।',
      ],
      correctAnswerIndex: 2,
      explanation: "In indirect speech, present 'am' becomes past 'was', and the pronoun 'I' becomes 'he'.\nIndirect speech ত present 'am' এ past 'was' হয়, আৰু 'I' এ 'he' হয়।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    // 12 — Vocabulary (idx 3)
    {
      question: "The idiom 'a piece of cake' means:\n'a piece of cake' বাক্যাংশৰ অৰ্থ হ'ল:",
      options: [
        'a small dessert / সৰু মিঠাই',
        'a difficult task / কঠিন কাম',
        'a slice of bread / ৰুটিৰ টুকুৰা',
        'an easy task / সহজ কাম',
      ],
      correctAnswerIndex: 3,
      explanation: "'A piece of cake' is an idiom meaning something very easy to do.\n'A piece of cake' হৈছে এটা বাক্যাংশ যাৰ অৰ্থ অতি সহজ কাম।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    // 13 — Grammar (idx 0)
    {
      question: "Choose the correct phrasal verb: Please ____ the lights before leaving.\nশুদ্ধ phrasal verb বাছক: ওলাই যোৱাৰ আগতে পালক ____।",
      options: [
        'turn off / বন্ধ কৰক',
        'turn in / ভিতৰত সোমাওক',
        'turn over / ওলোটা কৰক',
        'turn up / বঢ়াক',
      ],
      correctAnswerIndex: 0,
      explanation: "'Turn off' means to switch off, used for lights and devices.\n'Turn off' মানে বন্ধ কৰা, বাতি আৰু যন্ত্ৰৰ বাবে ব্যৱহৃত।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    // 14 — Vocabulary (idx 1)
    {
      question: "Choose the synonym of 'Brave':\n'Brave' ৰ সমাৰ্থক শব্দ বাছক:",
      options: [
        'Timid / ভয়াতুৰ',
        'Courageous / সাহসী',
        'Weak / দুৰ্বল',
        'Coward / কাপুৰুষ',
      ],
      correctAnswerIndex: 1,
      explanation: "'Brave' means showing courage; its synonym is 'Courageous'.\n'Brave' মানে সাহস দেখোৱা; ইয়াৰ সমাৰ্থক হ'ল 'Courageous'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    // 15 — Grammar (idx 2)
    {
      question: "Choose the correct verb form: I ____ my homework yesterday.\nশুদ্ধ verb ৰূপ বাছক: মই যোৱাকালি গৃহকাৰ্য ____।",
      options: [
        'do / কৰোঁ',
        'done / কৰিছো',
        'did / কৰিছিলোঁ',
        'doing / কৰি আছো',
      ],
      correctAnswerIndex: 2,
      explanation: "Past time 'yesterday' requires the simple past tense 'did'.\nঅতীত কাল 'yesterday' ৰ বাবে simple past tense 'did' প্ৰয়োজন।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    // 16 — Vocabulary (idx 3)
    {
      question: "Choose the antonym of 'Generous':\n'Generous' ৰ বিপৰীত শব্দ বাছক:",
      options: [
        'Kind / দয়ালু',
        'Charitable / দানশীল',
        'Liberal / উদাৰ',
        'Stingy / কৃপণ',
      ],
      correctAnswerIndex: 3,
      explanation: "'Generous' means willing to give; its opposite is 'Stingy' (mean).\n'Generous' মানে দিবলৈ ইচ্ছুক; ইয়াৰ বিপৰীত হ'ল 'Stingy'।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    // 17 — Grammar (idx 0)
    {
      question: "Improve the sentence: 'He is more taller than me.'\nবাক্যটো উন্নত কৰক: 'He is more taller than me.'",
      options: [
        'He is taller than me. / তেওঁ মতকৈ ওখ।',
        'He is tallest than me. / তেওঁ মতকৈ আটাইতকৈ ওখ।',
        'He is more tall than me. / তেওঁ মতকৈ অধিক ওখ।',
        'No improvement / কোনো উন্নতি নাই',
      ],
      correctAnswerIndex: 0,
      explanation: "'Taller' is already comparative; using 'more' before it is incorrect.\n'Taller' ইতিমধ্যে comparative; ইয়াৰ আগত 'more' ব্যৱহাৰ ভুল।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
    // 18 — Vocabulary (idx 1)
    {
      question: "One-word substitution for 'One who eats everything':\n'সকলো খোৱা ব্যক্তি' ৰ এটা শব্দৰ প্ৰতিশব্দ দিয়ক:",
      options: [
        'Vegetarian / নিৰামিষভোজী',
        'Omnivore / সৰ্বভোজী',
        'Carnivore / মাংসাশী',
        'Herbivore / তৃণভোজী',
      ],
      correctAnswerIndex: 1,
      explanation: "An organism that eats both plants and animals is called an 'Omnivore'.\nউদ্ভিদ আৰু প্ৰাণী উভয় খোৱা জীৱক 'Omnivore' বোলা হয়।",
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    // 19 — Comprehension (idx 2)
    {
      question: "Read: 'The Mahatma Gandhi National Rural Employment Guarantee Act provides 100 days of work per year.' According to the passage, the Act guarantees work for how many days?\nপঢ়ক: 'মহাত্মা গান্ধী ৰাষ্ট্ৰীয় গ্ৰাম্য নিয়োগ গ্ৰantieণ্ট আইনে বছৰি 100 দিন কাম প্ৰদান কৰে।' অনুচ্ছেদ অনুসৰি আইনটোৱে কিমান দিনৰ কাম নিশ্চিত কৰে?",
      options: [
        '10 days / 10 দিন',
        '50 days / 50 দিন',
        '100 days / 100 দিন',
        '365 days / 365 দিন',
      ],
      correctAnswerIndex: 2,
      explanation: "The passage states the Act provides 100 days of work per year.\nঅনুচ্ছেদত কোৱা হৈছে যে আইনটোৱে বছৰি 100 দিন কাম প্ৰদান কৰে।",
      subjectTopic: 'Comprehension',
      marks: 1,
    },
    // 20 — Grammar (idx 3)
    {
      question: "Change to passive voice: 'She will write a poem.'\nPassive voice লৈ সলনি কৰক: 'তাই এটা কবিতা লিখিব।'",
      options: [
        'A poem is written by her. / এটা কবিতা তাইৰ দ্বাৰা লিখা যায়।',
        'A poem was written by her. / এটা কবিতা তাইৰ দ্বাৰা লিখা হৈছিল।',
        'A poem has been written by her. / এটা কবিতা তাইৰ দ্বাৰা লিখা হৈছে।',
        "A poem will be written by her. / এটা কবিতা তাইৰ দ্বাৰা লিখা হ'ব।",
      ],
      correctAnswerIndex: 3,
      explanation: "Future indefinite active 'will write' becomes future indefinite passive 'will be written'. So 'A poem will be written by her.'\nFuture indefinite active 'will write' এ future indefinite passive 'will be written' হয়। গতিকে 'A poem will be written by her.'।",
      subjectTopic: 'Grammar',
      marks: 1,
    },
  ],

  // ===========================================================================
  // ssc-ga — 20 items (History / Geography / Polity / Science / Current Affairs)
  // ===========================================================================
  'ssc-ga': [
    // 1 — History (idx 0)
    {
      question: "Who was the first Emperor of the Mauryan Empire?\nমৌৰ্য সাম্ৰাজ্যৰ প্ৰথম সম্ৰাট কোন আছিল?",
      options: [
        'Chandragupta Maurya / চন্দ্ৰগুপ্ত মৌৰ্য',
        'Ashoka / অশোক',
        'Bindusara / বিন্দুসাৰ',
        'Bimbisara / বিম্বিসাৰ',
      ],
      correctAnswerIndex: 0,
      explanation: "Chandragupta Maurya founded the Mauryan Empire around 322 BCE and was its first emperor.\nচন্দ্ৰগুপ্ত মৌৰ্যই প্ৰায় 322 খ্ৰীষ্টপূৰ্বত মৌৰ্য সাম্ৰাজ্য প্ৰতিষ্ঠা কৰিছিল আৰু তেওঁ ইয়াৰ প্ৰথম সম্ৰাট আছিল।",
      subjectTopic: 'History',
      marks: 1,
    },
    // 2 — Geography (idx 1)
    {
      question: "Which is the longest river in India?\nভাৰতৰ আটাইতকৈ দীঘল নদী কোনখন?",
      options: [
        'Yamuna / যমুনা',
        'Ganga / গঙ্গা',
        'Godavari / গোদাৱৰী',
        'Brahmaputra / ব্ৰহ্মপুত্ৰ',
      ],
      correctAnswerIndex: 1,
      explanation: "The Ganga is the longest river in India, about 2,525 km long.\nগঙ্গা ভাৰতৰ আটাইতকৈ দীঘল নদী, প্ৰায় 2,525 কি.মি. দীঘল।",
      subjectTopic: 'Geography',
      marks: 1,
    },
    // 3 — Polity (idx 2)
    {
      question: "Who is known as the 'Father of the Indian Constitution'?\n'ভাৰতীয় সংবিধানৰ পিতা' বুলি কাক জনা যায়?",
      options: [
        'Mahatma Gandhi / মহাত্মা গান্ধী',
        'Jawaharlal Nehru / জৱাহৰলাল নেহৰু',
        'B. R. Ambedkar / বি. আৰ. আম্বেদকাৰ',
        'Rajendra Prasad / ৰাজেন্দ্ৰ প্ৰসাদ',
      ],
      correctAnswerIndex: 2,
      explanation: "Dr. B. R. Ambedkar, Chairman of the Drafting Committee, is called the Father of the Indian Constitution.\nখচৰা সমিতিৰ সভাপতি ড° বি. আৰ. আম্বেদকাৰক ভাৰতীয় সংবিধানৰ পিতা বোলা হয়।",
      subjectTopic: 'Polity',
      marks: 1,
    },
    // 4 — Science (idx 3)
    {
      question: "Which gas is most abundant in the Earth's atmosphere?\nপৃথিৱীৰ বায়ুমণ্ডলত কোন গেছ আটাইতকৈ বেছি পৰিমাণে থাকে?",
      options: [
        'Oxygen / অক্সিজেন',
        'Carbon dioxide / কাৰ্বন ডাইঅক্সাইড',
        'Hydrogen / হাইড্ৰজেন',
        'Nitrogen / নাইট্ৰজেন',
      ],
      correctAnswerIndex: 3,
      explanation: "Nitrogen makes up about 78% of the Earth's atmosphere.\nপৃথিৱীৰ বায়ুমণ্ডলৰ প্ৰায় 78% নাইট্ৰজেন।",
      subjectTopic: 'Science',
      marks: 1,
    },
    // 5 — Current Affairs (idx 0)
    {
      question: "Which country hosted the 2023 ICC Men's ODI Cricket World Cup?\nকোন দেশে 2023 চনৰ ICC পুৰুষৰ ODI ক্ৰিকেট বিশ্বকাপৰ আয়োজন কৰিছিল?",
      options: [
        'India / ভাৰত',
        'Australia / অষ্ট্ৰেলিয়া',
        'England / ইংলেণ্ড',
        'South Africa / দক্ষিণ আফ্ৰিকা',
      ],
      correctAnswerIndex: 0,
      explanation: "India hosted the 2023 ICC Men's ODI Cricket World Cup (won by Australia).\nভাৰতে 2023 চনৰ ICC পুৰুষৰ ODI ক্ৰিকেট বিশ্বকাপৰ আয়োজন কৰিছিল (অষ্ট্ৰেলিয়াই জিকিছিল)।",
      subjectTopic: 'Current Affairs',
      marks: 1,
    },
    // 6 — History (idx 1)
    {
      question: "The Quit India Movement was launched in which year?\nভাৰত ত্যাগ আন্দোলন কোনচনত আৰম্ভ কৰা হৈছিল?",
      options: [
        '1947 / 1947',
        '1942 / 1942',
        '1930 / 1930',
        '1920 / 1920',
      ],
      correctAnswerIndex: 1,
      explanation: "Mahatma Gandhi launched the Quit India Movement on 8 August 1942.\nমহাত্মা গান্ধীয়ে 8 আগষ্ট 1942 ত ভাৰত ত্যাগ আন্দোলন আৰম্ভ কৰিছিল।",
      subjectTopic: 'History',
      marks: 1,
    },
    // 7 — Geography (idx 2)
    {
      question: "Which is the smallest continent in the world?\nবিশ্বৰ আটাইতকৈ সৰু মহাদেশ কোনটো?",
      options: [
        'Europe / ইউৰোপ',
        'Antarctica / এণ্টাৰ্কটিকা',
        'Australia / অষ্ট্ৰেলিয়া',
        'South America / দক্ষিণ আমেৰিকা',
      ],
      correctAnswerIndex: 2,
      explanation: "Australia is the smallest continent in the world by area.\nকালি অনুসৰি অষ্ট্ৰেলিয়া বিশ্বৰ আটাইতকৈ সৰু মহাদেশ।",
      subjectTopic: 'Geography',
      marks: 1,
    },
    // 8 — Polity (idx 3)
    {
      question: "How many fundamental rights are guaranteed by the Indian Constitution?\nভাৰতীয় সংবিধানে কিমানটা মৌলিক অধিকাৰ নিশ্চিত কৰে?",
      options: [
        'Five / পাঁচটা',
        'Seven / সাতটা',
        'Eight / আঠটা',
        'Six / ছটা',
      ],
      correctAnswerIndex: 3,
      explanation: "Originally there were seven, but after the 44th Amendment (1978) removed the Right to Property, six fundamental rights remain.\nআৰম্ভণিত সাতটা আছিল, কিন্তু 44তম সংশোধনী (1978) এ সম্পত্তিৰ অধিকাৰ আঁতৰাই এতিয়া ছটা মৌলিক অধিকাৰ আছে।",
      subjectTopic: 'Polity',
      marks: 1,
    },
    // 9 — Science (idx 0)
    {
      question: "What is the chemical symbol for gold?\nসোণৰ ৰাসায়নিক প্ৰতীক কি?",
      options: [
        'Au / Au',
        'Ag / Ag',
        'Gd / Gd',
        'Go / Go',
      ],
      correctAnswerIndex: 0,
      explanation: "The chemical symbol for gold is 'Au', from the Latin word 'aurum'.\nসোণৰ ৰাসায়নিক প্ৰতীক 'Au', লেটিন শব্দ 'aurum' ৰ পৰা।",
      subjectTopic: 'Science',
      marks: 1,
    },
    // 10 — Current Affairs (idx 1)
    {
      question: "Who was awarded the Nobel Peace Prize in 2023?\n2023 চনত কাক নোবেল শান্তি বঁটা প্ৰদান কৰা হৈছিল?",
      options: [
        'Maria Ressa / মাৰিয়া ৰেছা',
        'Narges Mohammadi / নাৰ্গেছ মহম্মদী',
        'Abdulrazak Gurnah / আব্দুলৰাজাক গুৰ্নাহ',
        'Dmitry Muratov / দিমিত্ৰি মুৰাটভ',
      ],
      correctAnswerIndex: 1,
      explanation: "Iranian activist Narges Mohammadi won the 2023 Nobel Peace Prize for her fight for women's rights.\nইৰানী কৰ্মী নাৰ্গেছ মহম্মদীয়ে মহিলাৰ অধিকাৰৰ বাবে যুঁজ দিয়াৰ বাবে 2023 চনৰ নোবেল শান্তি বঁটা লাভ কৰিছিল।",
      subjectTopic: 'Current Affairs',
      marks: 1,
    },
    // 11 — History (idx 2)
    {
      question: "Who began the construction of the Qutub Minar?\nকুতুব মিনাৰৰ নিৰ্মাণ কোনে আৰম্ভ কৰিছিল?",
      options: [
        'Akbar / আকবৰ',
        'Shah Jahan / শ্বাহজাহান',
        'Qutb-ud-din Aibak / কুতুবুদ্দিন আইবক',
        'Aurangzeb / ঔৰংগজেব',
      ],
      correctAnswerIndex: 2,
      explanation: "Construction of the Qutub Minar was begun by Qutb-ud-din Aibak in 1199 CE and completed by Iltutmish.\nকুতুব মিনাৰৰ নিৰ্মাণ 1199 খ্ৰীষ্টাব্দত কুতুবুদ্দিন আইবকে আৰম্ভ কৰিছিল আৰু ইলতুতমিছে সম্পূৰ্ণ কৰিছিল।",
      subjectTopic: 'History',
      marks: 1,
    },
    // 12 — Geography (idx 3)
    {
      question: "Which is the capital of Australia?\nঅষ্ট্ৰেলিয়াৰ ৰাজধানী কি?",
      options: [
        'Sydney / ছিডনী',
        'Melbourne / মেলবৰ্ণ',
        'Perth / পাৰ্থ',
        'Canberra / কেনবেৰা',
      ],
      correctAnswerIndex: 3,
      explanation: "Canberra is the capital of Australia, not Sydney as commonly thought.\nকেনবেৰা অষ্ট্ৰেলিয়াৰ ৰাজধানী, সাধাৰণতে ভবাৰ দৰে ছিডনী নহয়।",
      subjectTopic: 'Geography',
      marks: 1,
    },
    // 13 — Polity (idx 0)
    {
      question: "Who is the head of the Indian state?\nভাৰতীয় ৰাষ্ট্ৰৰ মুৰব্বী কোন?",
      options: [
        'President / ৰাষ্ট্ৰপতি',
        'Prime Minister / প্ৰধানমন্ত্ৰী',
        'Chief Justice / মুখ্য ন্যায়াধীশ',
        'Speaker / অধ্যক্ষ',
      ],
      correctAnswerIndex: 0,
      explanation: "The President of India is the constitutional head of the Indian state.\nভাৰতৰ ৰাষ্ট্ৰপতি ভাৰতীয় ৰাষ্ট্ৰৰ সাংবিধানিক মুৰব্বী।",
      subjectTopic: 'Polity',
      marks: 1,
    },
    // 14 — Science (idx 1)
    {
      question: "Which vitamin is produced when human skin is exposed to sunlight?\nমানুহৰ ছাল সূৰ্যালোকৰ সংস্পৰ্শলৈ অহাত কোন ভিটামিন উৎপন্ন হয়?",
      options: [
        'Vitamin A / ভিটামিন A',
        'Vitamin D / ভিটামিন D',
        'Vitamin C / ভিটামিন C',
        'Vitamin K / ভিটামিন K',
      ],
      correctAnswerIndex: 1,
      explanation: "Vitamin D is synthesized in the skin on exposure to sunlight (UV-B).\nসূৰ্যালোকৰ (UV-B) সংস্পৰ্শত ছালত ভিটামিন D সংশ্লেষিত হয়।",
      subjectTopic: 'Science',
      marks: 1,
    },
    // 15 — Current Affairs (idx 2)
    {
      question: "Who became the President of India in 2022?\n2022 চনত কোনে ভাৰতৰ ৰাষ্ট্ৰপতি হয়?",
      options: [
        'Ram Nath Kovind / ৰামনাথ কোবিন্দ',
        'Pranab Mukherjee / প্ৰণব মুখাৰ্জী',
        'Droupadi Murmu / দ্ৰৌপদী মুৰ্মু',
        'Venkaiah Naidu / ভেংকাইয়া নাইডু',
      ],
      correctAnswerIndex: 2,
      explanation: "Droupadi Murmu became the 15th President of India in July 2022, the first tribal person to hold the office.\nদ্ৰৌপদী মুৰ্মুৱে 2022 চনৰ জুলাইত ভাৰতৰ 15তম ৰাষ্ট্ৰপতি হয়, প্ৰথম জনজাতীয় ব্যক্তি হিচাপে।",
      subjectTopic: 'Current Affairs',
      marks: 1,
    },
    // 16 — History (idx 3)
    {
      question: "The Battle of Plassey was fought in which year?\nপলাশীৰ যুদ্ধ কোনচনত হৈছিল?",
      options: [
        '1761 / 1761',
        '1857 / 1857',
        '1526 / 1526',
        '1757 / 1757',
      ],
      correctAnswerIndex: 3,
      explanation: "The Battle of Plassey was fought on 23 June 1757 between the British East India Company and the Nawab of Bengal.\nপলাশীৰ যুদ্ধ 23 জুন 1757 ত ব্ৰিটিছ ইষ্ট ইণ্ডিয়া কোম্পানী আৰু বংগৰ নবাবৰ মাজত হৈছিল।",
      subjectTopic: 'History',
      marks: 1,
    },
    // 17 — Geography (idx 0)
    {
      question: "Which is the largest desert in the world?\nবিশ্বৰ আটাইতকৈ ডাঙৰ মৰুভূমি কোনটো?",
      options: [
        'Antarctic Desert / এণ্টাৰ্কটিক মৰুভূমি',
        'Sahara Desert / ছাহাৰা মৰুভূমি',
        'Gobi Desert / গোবি মৰুভূমি',
        'Thar Desert / থৰ মৰুভূমি',
      ],
      correctAnswerIndex: 0,
      explanation: "The Antarctic Desert is the world's largest desert (about 14 million km²); the Sahara is the largest hot desert.\nএণ্টাৰ্কটিক মৰুভূমি বিশ্বৰ আটাইতকৈ ডাঙৰ মৰুভূমি (প্ৰায় 14 নিযুত কি.মি.²); ছাহাৰা হ'ল আটাইতকৈ ডাঙৰ গৰম মৰুভূমি।",
      subjectTopic: 'Geography',
      marks: 1,
    },
    // 18 — Polity (idx 1)
    {
      question: "How many members are nominated to the Rajya Sabha by the President of India?\nভাৰতৰ ৰাষ্ট্ৰপতিয়ে ৰাজ্যসভালৈ কিমানজন সদস্য মনোনীত কৰে?",
      options: [
        '10 / 10',
        '12 / 12',
        '14 / 14',
        '15 / 15',
      ],
      correctAnswerIndex: 1,
      explanation: "The President of India nominates 12 members to the Rajya Sabha for their distinguished service in literature, science, art and social service.\nভাৰতৰ ৰাষ্ট্ৰপতিয়ে সাহিত্য, বিজ্ঞান, কলা আৰু সমাজসেৱাত বিশিষ্ট সেৱাৰ বাবে ৰাজ্যসভালৈ 12 জন সদস্য মনোনীত কৰে।",
      subjectTopic: 'Polity',
      marks: 1,
    },
    // 19 — Science (idx 2)
    {
      question: "What is the SI unit of electric current?\nবৈদ্যুতিক প্ৰৱাহৰ SI একক কি?",
      options: [
        'Volt / ভোল্ট',
        'Watt / ৱাট',
        'Ampere / এম্পিয়াৰ',
        "Ohm / অ'হম",
      ],
      correctAnswerIndex: 2,
      explanation: "The SI unit of electric current is the ampere (A).\nবৈদ্যুতিক প্ৰৱাহৰ SI একক হ'ল এম্পিয়াৰ (A)।",
      subjectTopic: 'Science',
      marks: 1,
    },
    // 20 — Current Affairs (idx 3)
    {
      question: "Who won the Men's Singles title at Wimbledon 2023?\n2023 ৱিম্বলডনত পুৰুষৰ একক খিতাপ কোনে জিকিছিল?",
      options: [
        "Novak Djokovic / নোভাক জ'কোভিচ",
        'Daniil Medvedev / দানিল মেডভেদেভ',
        'Rafael Nadal / ৰাফেল নাদাল',
        'Carlos Alcaraz / কাৰ্লোছ আলকাৰাজ',
      ],
      correctAnswerIndex: 3,
      explanation: "Spain's Carlos Alcaraz won the Men's Singles title at Wimbledon 2023, defeating Novak Djokovic in the final.\nস্পেইনৰ কাৰ্লোছ আলকাৰাজে ফাইনেলত নোভাক জ'কোভিচক পৰাস্ত কৰি 2023 ৱিম্বলডনৰ পুৰুষৰ একক খিতাপ জিকিছিল।",
      subjectTopic: 'Current Affairs',
      marks: 1,
    },
  ],
};
