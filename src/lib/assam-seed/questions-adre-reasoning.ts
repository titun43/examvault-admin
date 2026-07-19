// =============================================================================
// ExamVault — ADRE (Assam Direct Recruitment) Reasoning
// Bilingual question pool — Logical Reasoning (adre-reasoning)
//
// Format (CRITICAL — every field is bilingual EN + অসমীয়া):
//   question  -> "English\nঅসমীয়া"
//   option    -> "English / অসমীয়া"
//   expl      -> "English\nঅসমীয়া"
//
// adre-reasoning : 30 questions covering number series, letter series,
//                  analogy (word/number), classification (odd-one-out),
//                  coding-decoding (letter shift / reverse / number coding),
//                  blood relations, direction sense, ranking/arrangement,
//                  and syllogism — class IX-X level, ADRE Grade III & IV.
//
// correctAnswerIndex is distributed evenly (8 × 0, 8 × 1, 7 × 2, 7 × 3)
// so test slicing produces a balanced answer key.
//
// subjectTopic spread:
//   Series(6), Analogy(5), Coding(4), Blood Relations(3),
//   Direction(3), Odd One Out(4), Syllogism(3), Ranking(2)
// =============================================================================
import type { QuestionPoolMap } from './structure';

export const ADRE_POOLS_REASONING: QuestionPoolMap = {
  // ===========================================================================
  // adre-reasoning — Logical Reasoning (30)
  // ===========================================================================
  'adre-reasoning': [
    // --- Series (6) ---
    {
      question:
        "What comes next in the series: 2, 6, 12, 20, 30, ?\nশ্ৰেণীটোত পৰবৰ্তী সংখ্যাটো কোনটো: 2, 6, 12, 20, 30, ?",
      options: ['40 / 40', '42 / 42', '44 / 44', '46 / 46'],
      correctAnswerIndex: 1,
      explanation:
        "The differences increase by 2 each time (+4, +6, +8, +10, +12), so the next term is 30 + 12 = 42.\nপাৰ্থক্যবোৰ প্ৰতিবাৰ 2 কৈ বাঢ়ে (+4, +6, +8, +10, +12), গতিকে পৰবৰ্তী পদটো হৈছে 30 + 12 = 42।",
      subjectTopic: 'Series',
      marks: 1,
    },
    {
      question:
        "Find the next term: 3, 6, 12, 24, 48, ?\nপৰবৰ্তী পদটো বিচাৰক: 3, 6, 12, 24, 48, ?",
      options: ['64 / 64', '72 / 72', '96 / 96', '84 / 84'],
      correctAnswerIndex: 2,
      explanation:
        "Each term is multiplied by 2, so 48 × 2 = 96.\nপ্ৰতিটো পদক 2 ৰে পূৰণ কৰা হয়, গতিকে 48 × 2 = 96।",
      subjectTopic: 'Series',
      marks: 1,
    },
    {
      question:
        "What is the next number: 1, 4, 9, 16, 25, ?\nপৰবৰ্তী সংখ্যাটো কি: 1, 4, 9, 16, 25, ?",
      options: ['30 / 30', '36 / 36', '49 / 49', '64 / 64'],
      correctAnswerIndex: 1,
      explanation:
        "These are perfect squares (1², 2², 3², 4², 5²), so the next term is 6² = 36.\nএইবোৰ পূর্ণ বর্গ (1², 2², 3², 4², 5²), গতিকে পৰবৰ্তী পদটো হৈছে 6² = 36।",
      subjectTopic: 'Series',
      marks: 1,
    },
    {
      question:
        "Complete the letter series: ACE, GIK, MOQ, ?\nআখৰৰ শ্ৰেণী সম্পূৰ্ণ কৰক: ACE, GIK, MOQ, ?",
      options: ['SUW / SUW', 'RTV / RTV', 'TVX / TVX', 'SVY / SVY'],
      correctAnswerIndex: 0,
      explanation:
        "Within each group the letters increase by 2, and the first letter of each group jumps by 6 (A→G→M→S), giving SUW.\nপ্ৰতিটো গোটৰ ভিতৰত আখৰবোৰ 2 কৈ বাঢ়ে, আৰু প্ৰতিটো গোটৰ প্ৰথম আখৰ 6 কৈ আগবাঢ়ে (A→G→M→S), ফলত SUW পোৱা যায়।",
      subjectTopic: 'Series',
      marks: 1,
    },
    {
      question:
        "Find the next pair: BD, FH, JL, NP, ?\nপৰবৰ্তী যোৰাটো বিচাৰক: BD, FH, JL, NP, ?",
      options: ['PR / PR', 'QR / QR', 'SU / SU', 'RT / RT'],
      correctAnswerIndex: 3,
      explanation:
        "Each pair contains letters 2 apart (B→D) and the first letter of each pair increases by 4 (B→F→J→N→R), so the next pair is RT.\nপ্ৰতিটো যোৰাৰ আখৰবোৰ 2 দূৰত (B→D) আৰু প্ৰতিটো যোৰাৰ প্ৰথম আখৰ 4 কৈ বাঢ়ে (B→F→J→N→R), গতিকে পৰবৰ্তী যোৰাটো RT।",
      subjectTopic: 'Series',
      marks: 1,
    },
    {
      question:
        "Find the next term: Z1, X3, V5, T7, ?\nপৰবৰ্তী পদটো বিচাৰক: Z1, X3, V5, T7, ?",
      options: ['R9 / R9', 'S9 / S9', 'R8 / R8', 'Q9 / Q9'],
      correctAnswerIndex: 0,
      explanation:
        "Letters decrease by 2 (Z→X→V→T→R) and numbers increase by 2 (1→3→5→7→9), giving R9.\nআখৰবোৰ 2 কৈ কমে (Z→X→V→T→R) আৰু সংখ্যাবোৰ 2 কৈ বাঢ়ে (1→3→5→7→9), ফলত R9 পোৱা যায়।",
      subjectTopic: 'Series',
      marks: 1,
    },

    // --- Analogy (5) ---
    {
      question:
        "Book is to Author as Painting is to ?\nপুথি যি লেখকৰ, চিত্ৰ সেই একেই ?",
      options: [
        'Brush / ব্ৰাশ',
        'Painter / চিত্ৰশিল্পী',
        'Canvas / কেনভাচ',
        'Colour / ৰং',
      ],
      correctAnswerIndex: 1,
      explanation:
        "A book is created by an author; similarly, a painting is created by a painter.\nপুথি এখন লেখকে সৃষ্টি কৰে; একেদৰে চিত্ৰ এখন চিত্ৰশিল্পীয়ে সৃষ্টি কৰে।",
      subjectTopic: 'Analogy',
      marks: 1,
    },
    {
      question:
        "6 : 36 :: 8 : ?\n6 : 36 :: 8 : ?",
      options: ['48 / 48', '64 / 64', '56 / 56', '72 / 72'],
      correctAnswerIndex: 1,
      explanation:
        "6² = 36, so the corresponding term for 8 is 8² = 64.\n6² = 36, গতিকে 8 ৰ সংগত পদটো হৈছে 8² = 64।",
      subjectTopic: 'Analogy',
      marks: 1,
    },
    {
      question:
        "Doctor is to Hospital as Teacher is to ?\nডাক্তৰ যি চিকিৎসালয়ৰ, শিক্ষক সেই ?",
      options: [
        'School / বিদ্যালয়',
        'Student / ছাত্ৰ',
        'Class / শ্ৰেণী',
        'Book / পুথি',
      ],
      correctAnswerIndex: 0,
      explanation:
        "A doctor works in a hospital; similarly, a teacher works in a school.\nডাক্তৰে চিকিৎসালয়ত কাম কৰে; একেদৰে শিক্ষকে বিদ্যালয়ত কাম কৰে।",
      subjectTopic: 'Analogy',
      marks: 1,
    },
    {
      question:
        "Bird is to Wing as Fish is to ?\nচৰাই যি পাখিৰ, মাছ সেই ?",
      options: [
        'Water / পানী',
        'Tail / নেজ',
        'Fin / পাখনি',
        'Scale / তপচনি',
      ],
      correctAnswerIndex: 2,
      explanation:
        "A bird uses wings to fly; a fish uses fins to swim.\nচৰাইয়ে পাখিৰে উৰে; মাছে পাখনিৰে সাঁতোৰে।",
      subjectTopic: 'Analogy',
      marks: 1,
    },
    {
      question:
        "If A = 1, B = 2, C = 3, …, then what does CAB equal?\nযদি A = 1, B = 2, C = 3, …, তেন্তে CAB ৰ মান কিমান?",
      options: ['321 / 321', '123 / 123', '132 / 132', '312 / 312'],
      correctAnswerIndex: 3,
      explanation:
        "C = 3, A = 1, B = 2, so CAB = 312.\nC = 3, A = 1, B = 2, গতিকে CAB = 312।",
      subjectTopic: 'Analogy',
      marks: 1,
    },

    // --- Coding (4) ---
    {
      question:
        "In a certain code, CAT is written as DBU. How is DOG written in that code?\nএটা নির্দিষ্ট ক'ডত CAT ক DBU বুলি লেখা হয়। সেই ক'ডত DOG কেনেকৈ লেখা হ'ব?",
      options: ['FQI / FQI', 'DPH / DPH', 'EPH / EPH', 'EPI / EPI'],
      correctAnswerIndex: 2,
      explanation:
        "Each letter is shifted forward by 1 (C→D, A→B, T→U). So DOG becomes D→E, O→P, G→H, i.e., EPH.\nপ্ৰতিটো আখৰ 1 আগুৱাই যায় (C→D, A→B, T→U)। গতিকে DOG, D→E, O→P, G→H অর্থাৎ EPH হয়।",
      subjectTopic: 'Coding',
      marks: 1,
    },
    {
      question:
        "If FRIEND is coded as GSJFOE, how is TEACHER coded?\nযদি FRIEND ক GSJFOE ক'ড কৰা হয়, তেন্তে TEACHER কেনেকৈ ক'ড কৰা হ'ব?",
      options: [
        'UFBEIF / UFBEIF',
        'UFBDIF / UFBDIF',
        'UEBDIF / UEBDIF',
        'UFBDJE / UFBDJE',
      ],
      correctAnswerIndex: 1,
      explanation:
        "Each letter is shifted by +1 (F→G, R→S, I→J, E→F, N→O, D→E). Applying the same rule: T→U, E→F, A→B, C→D, H→I, E→F, giving UFBDIF.\nপ্ৰতিটো আখৰ +1 কৈ আগুৱাই যায় (F→G, R→S, I→J, E→F, N→O, D→E)। একেই নিয়ম প্রয়োগ কৰিলে: T→U, E→F, A→B, C→D, H→I, E→F, ফলত UFBDIF পোৱা যায়।",
      subjectTopic: 'Coding',
      marks: 1,
    },
    {
      question:
        "If TABLE is coded as GZYOV, how is CHAIR coded?\nযদি TABLE ক GZYOV ক'ড কৰা হয়, তেন্তে CHAIR কেনেকৈ ক'ড কৰা হ'ব?",
      options: [
        'XSZIQ / XSZIQ',
        'XSYRI / XSYRI',
        'XSZRJ / XSZRJ',
        'XSZRI / XSZRI',
      ],
      correctAnswerIndex: 3,
      explanation:
        "Each letter is replaced by its reverse-position letter in the alphabet (A↔Z, B↔Y, C↔X, …). C→X, H→S, A→Z, I→R, R→I, giving XSZRI.\nপ্ৰতিটো আখৰক বৰ্ণমালাত ইয়াৰ ওলোটা স্থানৰ আখৰেৰে প্রতিস্থাপন কৰা হয় (A↔Z, B↔Y, C↔X, …)। C→X, H→S, A→Z, I→R, R→I, ফলত XSZRI পোৱা যায়।",
      subjectTopic: 'Coding',
      marks: 1,
    },
    {
      question:
        "If 1 = 5, 2 = 25, 3 = 125, 4 = 625, then 5 = ?\nযদি 1 = 5, 2 = 25, 3 = 125, 4 = 625, তেন্তে 5 = ?",
      options: ['1 / 1', '3125 / 3125', '625 / 625', '125 / 125'],
      correctAnswerIndex: 0,
      explanation:
        "Since the first line states 1 = 5, by symmetry 5 = 1. This is a trick question.\nযিহেতু প্ৰথম শাৰীত 1 = 5 বুলি দিয়া আছে, সেয়েহে 5 = 1। এইটো এটা সঁজাতি প্ৰশ্ন।",
      subjectTopic: 'Coding',
      marks: 1,
    },

    // --- Blood Relations (3) ---
    {
      question:
        'Pointing to a photograph, a man said, "She is the daughter of my grandfather\'s only son." How is the girl related to the man?\nএজন মানুহে এখন ফটোৰ ফালে আঙুলিয়াই ক\'লে, "তেওঁ মোৰ ককাদেউতাৰ একমাত্ৰ পুত্ৰৰ জীয়েক।" ছোৱালীজনী মানুহজনৰ কিৰূপে আত্মীয়?',
      options: [
        'Mother / মাক',
        'Daughter / জীয়েক',
        'Sister / ভগ্নী',
        'Aunt / খুড়তি',
      ],
      correctAnswerIndex: 2,
      explanation:
        "The grandfather's only son is the man's father; the father's daughter is the man's sister.\nককাদেউতাৰ একমাত্ৰ পুত্ৰ হৈছে সেই মানুহজনৰ দেউতাক; দেউতাকৰ জীয়েক হৈছে সেই মানুহজনৰ ভগ্নী।",
      subjectTopic: 'Blood Relations',
      marks: 1,
    },
    {
      question:
        "A is the father of B. C is the daughter of B. D is the brother of B. How is D related to C?\nA, B ৰ দেউতাক। C, B ৰ জীয়েক। D, B ৰ ভায়েক। D, C ৰ কিৰূপে আত্মীয়?",
      options: [
        'Father / দেউতাক',
        'Uncle / খুড়া/মামা',
        'Brother / ভায়েক',
        'Nephew / ভতিজা',
      ],
      correctAnswerIndex: 1,
      explanation:
        "D is the brother of B, and B is C's parent, so D is C's uncle.\nD, B ৰ ভায়েক, আৰু B, C ৰ অভিভাৱক, গতিকে D, C ৰ খুড়া/মামা।",
      subjectTopic: 'Blood Relations',
      marks: 1,
    },
    {
      question:
        'Introducing a man, a woman said, "His wife is the only daughter of my father." How is the man related to the woman?\nএজন মানুহক পৰিচয় কৰাই দি এগৰাকী মহিলাই ক\'লে, "তেওঁৰ পত্নী মোৰ দেউতাকৰ একমাত্ৰ জীয়েক।" মানুহজন মহিলাগৰাকীৰ কিৰূপে আত্মীয়?',
      options: [
        'Brother / ভায়েক',
        'Father / দেউতাক',
        'Son / পুতেক',
        'Husband / স্বামী',
      ],
      correctAnswerIndex: 3,
      explanation:
        "The only daughter of the woman's father is the woman herself, so the man's wife is the woman — i.e., the man is her husband.\nমহিলাগৰাকীৰ দেউতাকৰ একমাত্ৰ জীয়েক হৈছে সেই মহিলাগৰাকী নিজেই, গতিকে মানুহজনৰ পত্নী হৈছে সেই মহিলাগৰাকী — অৰ্থাৎ মানুহজন তেওঁৰ স্বামী।",
      subjectTopic: 'Blood Relations',
      marks: 1,
    },

    // --- Direction (3) ---
    {
      question:
        "A man walks 5 km north, then turns right and walks 3 km, then turns right again and walks 5 km. How far is he from the starting point?\nএজন মানুহে 5 কিমি উত্তৰ দিশে খোজ কাঢ়ে, তাৰ পিছত সোঁফালে ঘুৰি 3 কিমি খোজ কাঢ়ে, আকৌ সোঁফালে ঘুৰি 5 কিমি খোজ কাঢ়ে। তেওঁ আৰম্ভণি স্থানৰ পৰা কিমান দূৰত আছে?",
      options: [
        '5 km / 5 কিমি',
        '13 km / 13 কিমি',
        '3 km / 3 কিমি',
        '8 km / 8 কিমি',
      ],
      correctAnswerIndex: 2,
      explanation:
        "He walks north 5 km, east 3 km, then south 5 km, ending 3 km east of the start, so the distance is 3 km.\nতেওঁ উত্তৰে 5 কিমি, পূবে 3 কিমি, তাৰ পিছত দক্ষিণে 5 কিমি খোজ কাঢ়ে, আৰম্ভণি স্থানৰ পৰা 3 কিমি পূবে অন্ত হয়, গতিকে দূৰত্ব 3 কিমি।",
      subjectTopic: 'Direction',
      marks: 1,
    },
    {
      question:
        "If South-East becomes North and North-East becomes West, what will West become?\nযদি দক্ষিণ-পূব উত্তৰ হয় আৰু উত্তৰ-পূব পশ্চিম হয়, তেন্তে পশ্চিম কি হ'ব?",
      options: [
        'South-West / দক্ষিণ-পশ্চিম',
        'North-West / উত্তৰ-পশ্চিম',
        'South-East / দক্ষিণ-পূব',
        'South / দক্ষিণ',
      ],
      correctAnswerIndex: 2,
      explanation:
        "Each direction is shifted by 225° clockwise (or 135° anti-clockwise). West thus becomes South-East.\nপ্ৰতিটো দিশ 225° ঘড়িৰ দিশে (বা 135° ঘড়িৰ বিপৰীত দিশে) স্থানান্তৰিত হয়। ফলত পশ্চিম দক্ষিণ-পূব হয়।",
      subjectTopic: 'Direction',
      marks: 1,
    },
    {
      question:
        "Rahul walks 10 m west, then turns left and walks 10 m, then turns left again and walks 10 m. How far is he from the starting point and in which direction?\nৰাহুলে 10 মিটাৰ পশ্চিম দিশে খোজ কাঢ়ে, তাৰ পিছত বাওঁফালে ঘুৰি 10 মিটাৰ খোজ কাঢ়ে, আকৌ বাওঁফালে ঘুৰি 10 মিটাৰ খোজ কাঢ়ে। তেওঁ আৰম্ভণি স্থানৰ পৰা কিমান দূৰত আৰু কোন দিশত আছে?",
      options: [
        '10 m South / 10 মিটাৰ দক্ষিণ',
        '10 m North / 10 মিটাৰ উত্তৰ',
        '20 m West / 20 মিটাৰ পশ্চিম',
        '10 m East / 10 মিটাৰ পূব',
      ],
      correctAnswerIndex: 0,
      explanation:
        "After going west 10 m, left (south) 10 m, and left (east) 10 m, he ends 10 m south of the start.\nপশ্চিমে 10 মিটাৰ, বাওঁ (দক্ষিণ) 10 মিটাৰ, আৰু বাওঁ (পূব) 10 মিটাৰ যোৱাৰ পিছত, তেওঁ আৰম্ভণি স্থানৰ পৰা 10 মিটাৰ দক্ষিণত অন্ত হয়।",
      subjectTopic: 'Direction',
      marks: 1,
    },

    // --- Odd One Out (4) ---
    {
      question:
        "Find the odd one out: 3, 5, 7, 9, 11, 13.\nবেলেগটো বিচাৰক: 3, 5, 7, 9, 11, 13।",
      options: ['3 / 3', '5 / 5', '9 / 9', '11 / 11'],
      correctAnswerIndex: 2,
      explanation:
        "Except 9, all the numbers are prime; 9 is divisible by 3.\n9 বাদে আন সকলোবোৰ মৌলিক সংখ্যা; 9, 3 ৰে বিভাজ্য।",
      subjectTopic: 'Odd One Out',
      marks: 1,
    },
    {
      question:
        "Find the odd one out: Mango, Apple, Banana, Carrot.\nবেলেগটো বিচাৰক: আম, আপেল, কেলা, গাজৰ।",
      options: [
        'Mango / আম',
        'Apple / আপেল',
        'Banana / কেলা',
        'Carrot / গাজৰ',
      ],
      correctAnswerIndex: 3,
      explanation:
        "Carrot is a vegetable, while the others are fruits.\nগাজৰ এবিধ শাক-পাচন, আনহাতে বাকীবোৰ ফল।",
      subjectTopic: 'Odd One Out',
      marks: 1,
    },
    {
      question:
        "Find the odd one out: Bat, Sparrow, Crow, Pigeon.\nবেলেগটো বিচাৰক: বাদুলি, চৰাই, কাউৰী, পাৰ।",
      options: [
        'Bat / বাদুলি',
        'Sparrow / চৰাই',
        'Crow / কাউৰী',
        'Pigeon / পাৰ',
      ],
      correctAnswerIndex: 0,
      explanation:
        "A bat is a mammal, while the others are birds.\nবাদুলি এবিধ স্তন্যপায়ী প্ৰাণী, আনহাতে বাকীবোৰ চৰাই।",
      subjectTopic: 'Odd One Out',
      marks: 1,
    },
    {
      question:
        "Find the odd one out: Triangle, Square, Circle, Cube.\nবেলেগটো বিচাৰক: ত্ৰিভুজ, বৰ্গ, বৃত্ত, ঘনক।",
      options: [
        'Triangle / ত্ৰিভুজ',
        'Square / বৰ্গ',
        'Circle / বৃত্ত',
        'Cube / ঘনক',
      ],
      correctAnswerIndex: 3,
      explanation:
        "Cube is a three-dimensional shape, while the others are two-dimensional figures.\nঘনক এটা ত্ৰিমাত্ৰিক আকৃতি, আনহাতে বাকীবোৰ দ্বিমাত্ৰিক আকৃতি।",
      subjectTopic: 'Odd One Out',
      marks: 1,
    },

    // --- Syllogism (3) ---
    {
      question:
        "Statement: All cats are animals. All animals are living beings. Conclusion: All cats are living beings. Does the conclusion follow?\nবক্তব্য: সকলো মেকুৰী জন্তু। সকলো জন্তু জীৱ। সিদ্ধান্ত: সকলো মেকুৰী জীৱ। সিদ্ধান্তটোৱে অনুসৰণ কৰে নেকি?",
      options: [
        'Conclusion definitely follows / সিদ্ধান্তটো নিশ্চিতভাৱে অনুসৰণ কৰে',
        'Conclusion does not follow / সিদ্ধান্তটোৱে অনুসৰণ নকৰে',
        'Conclusion is probably true / সিদ্ধান্তটো সম্ভৱতঃ সত্য',
        'Cannot be determined / নিৰ্ধাৰণ কৰিব নোৱাৰি',
      ],
      correctAnswerIndex: 0,
      explanation:
        "This is a chain syllogism: if A→B and B→C, then A→C. Hence the conclusion necessarily follows.\nএইটো এটা শৃংখল ন্যায়: যদি A→B আৰু B→C, তেন্তে A→C। গতিকে সিদ্ধান্তটো অপৰিহাৰ্যভাৱে অনুসৰণ কৰে।",
      subjectTopic: 'Syllogism',
      marks: 1,
    },
    {
      question:
        "Statements: Some pens are pencils. No pencil is an eraser. Conclusions: I. Some pens are erasers. II. No pen is an eraser. Which conclusion follows?\nবক্তব্য: কিছুমান কলম পেঞ্চিল। কোনো পেঞ্চিল ইৰেজাৰ নহয়। সিদ্ধান্ত: I. কিছুমান কলম ইৰেজাৰ। II. কোনো কলম ইৰেজাৰ নহয়। কোনটো সিদ্ধান্তই অনুসৰণ কৰে?",
      options: [
        'Only I follows / কেৱল I অনুসৰণ কৰে',
        'Only II follows / কেৱল II অনুসৰণ কৰে',
        'Both follow / দুয়োটা অনুসৰণ কৰে',
        'Neither follows / এটাও অনুসৰণ নকৰে',
      ],
      correctAnswerIndex: 3,
      explanation:
        "From 'Some pens are pencils' and 'No pencil is an eraser', we can only conclude that some pens are not erasers; neither I nor II definitely follows.\n'কিছুমান কলম পেঞ্চিল' আৰু 'কোনো পেঞ্চিল ইৰেজাৰ নহয়' ৰ পৰা আমি কেৱল এইটোৱে জানিব পাৰো যে কিছুমান কলম ইৰেজাৰ নহয়; I বা II ৰ কোনোটোৱেই নিশ্চিতভাৱে অনুসৰণ নকৰে।",
      subjectTopic: 'Syllogism',
      marks: 1,
    },
    {
      question:
        "Statements: All birds can fly. Sparrows are birds. Conclusion: Sparrows can fly. Does the conclusion follow?\nবক্তব্য: সকলো চৰাইয়ে উৰিব পাৰে। চৰাইবোৰ চৰাই। সিদ্ধান্ত: চৰাইবোৰে উৰিব পাৰে। সিদ্ধান্তটোৱে অনুসৰণ কৰে নেকি?",
      options: [
        'Conclusion follows / সিদ্ধান্তটোৱে অনুসৰণ কৰে',
        'Conclusion does not follow / সিদ্ধান্তটোৱে অনুসৰণ নকৰে',
        'Conclusion is uncertain / সিদ্ধান্তটো অনিশ্চিত',
        'Data inadequate / তথ্য অপৰ্যাপ্ত',
      ],
      correctAnswerIndex: 0,
      explanation:
        "This is a valid Barbara syllogism (All A are B, C is A, therefore C is B); the conclusion follows from the premises.\nএইটো এটা বৈধ Barbara ন্যায় (সকলো A হৈছে B, C হৈছে A, সেয়েহে C হৈছে B); সিদ্ধান্তটোৱে বক্তব্যৰ পৰা অনুসৰণ কৰে।",
      subjectTopic: 'Syllogism',
      marks: 1,
    },

    // --- Ranking (2) ---
    {
      question:
        "In a class, Amit ranks 7th from the top and 11th from the bottom. How many students are there in the class?\nএটা শ্ৰেণীত অমিত ওপৰৰ পৰা 7ম আৰু তলৰ পৰা 11তম। শ্ৰেণীটোত মুঠ কিমানজন ছাত্ৰ আছে?",
      options: ['16 / 16', '17 / 17', '18 / 18', '19 / 19'],
      correctAnswerIndex: 1,
      explanation:
        "Total students = (rank from top) + (rank from bottom) − 1 = 7 + 11 − 1 = 17.\nমুঠ ছাত্ৰ = (ওপৰৰ পৰা স্থান) + (তলৰ পৰা স্থান) − 1 = 7 + 11 − 1 = 17।",
      subjectTopic: 'Ranking',
      marks: 1,
    },
    {
      question:
        "In a row of 25 children, Riya is 8th from the left. What is her position from the right?\n25 জন ল'ৰা-ছোৱালীৰ শাৰীত ৰিয়া বাওঁফালৰ পৰা 8ম। সোঁফালৰ পৰা তেওঁৰ স্থান কিমান?",
      options: ['17 / 17', '18 / 18', '19 / 19', '16 / 16'],
      correctAnswerIndex: 1,
      explanation:
        "Position from right = (total − position from left + 1) = 25 − 8 + 1 = 18.\nসোঁফালৰ পৰা স্থান = (মুঠ − বাওঁফালৰ পৰা স্থান + 1) = 25 − 8 + 1 = 18।",
      subjectTopic: 'Ranking',
      marks: 1,
    },
  ],
};
