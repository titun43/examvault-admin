// =============================================================================
// ExamVault — Assam TET (Teacher Eligibility Test) PART B
// Bilingual question pool — English (tet-english) + Maths (tet-maths) + EVS (tet-evs)
//
// Format (CRITICAL — every field is bilingual EN + অসমীয়া):
//   question  -> "English\nঅসমীয়া"
//   option    -> "English / অসমীয়া"
//   expl      -> "English\nঅসমীয়া"
//
// tet-english : 20 questions (Grammar, Vocabulary, Comprehension, Pedagogy)
// tet-maths   : 20 questions (Number System, Fractions, Decimals, Geometry,
//                              Mensuration, Data Handling, Pedagogy)
// tet-evs     : 20 questions (Ecology, Pollution, Assam Biodiversity, Pedagogy)
// Total = 60 bilingual items — TET elementary level (NCERT classes I-VIII).
//
// Per the task spec, numeric digits stay as digits (NOT transliterated to
// Assamese numerals); surrounding words/units are translated to Assamese.
//
// correctAnswerIndex is distributed evenly (5 × 0, 5 × 1, 5 × 2, 5 × 3)
// within each subject so test slicing produces a balanced answer key.
// =============================================================================
import type { QuestionPoolMap } from './structure';

export const TET_POOLS_B: QuestionPoolMap = {
  // ===========================================================================
  // tet-english — English (20)
  // ===========================================================================
  'tet-english': [
    // --- Grammar (10) ---
    {
      question:
        'Choose the correct verb form: "She ___ to school every day."\nশুদ্ধ ক্ৰিয়াপদ বাছক: "তেওঁ প্ৰতিদিনে বিদ্যালয়লৈ ___।"',
      options: ['goes / যায়', 'go / যাওক', 'going / গৈ আছে', 'gone / গৈছে'],
      correctAnswerIndex: 0,
      explanation:
        'The subject "She" is third person singular, so the verb takes -s: "goes".\n"তেওঁ" তৃতীয় পুৰুষ একবচন, গতিকে ক্ৰিয়াৰ সৈতে -s লাগে: "যায়"।',
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Change to passive voice: "The teacher explains the lesson."\nকৰ্মবাচকলৈ পৰিৱৰ্তন কৰা: "শিক্ষকজনে পাঠদান কৰে।"',
      options: [
        'The lesson is explained by the teacher. / পাঠদানটো শিক্ষকজনৰ দ্বাৰা কৰা হয়।',
        'The lesson was explained by the teacher. / পাঠদানটো শিক্ষকজনে কৰিছিল।',
        'The lesson explains the teacher. / পাঠদানে শিক্ষকক বুজায়।',
        'The lesson has explained the teacher. / পাঠদানে শিক্ষকক বুজাইছে।',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Simple present passive: is/am/are + past participle → "The lesson is explained by the teacher."\nসাধাৰণ বৰ্তমানৰ কৰ্মবাচক: is/am/are + past participle → "পাঠদানটো শিক্ষকজনৰ দ্বাৰা কৰা হয়।"',
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Change to indirect speech: He said, "I am reading."\nপৰোক্ষ উক্তিলৈ পৰিৱৰ্তন কৰা: তেওঁ ক\'লে, "মই পঢ়িছোঁ।"',
      options: [
        'He said that he is reading. / তেওঁ ক\'লে যে তেওঁ পঢ়িছে।',
        'He says that he was reading. / তেওঁ কয় যে তেওঁ পঢ়িছিল।',
        'He said that he was reading. / তেওঁ ক\'লে যে তেওঁ পঢ়িছিল।',
        'He said that I was reading. / তেওঁ ক\'লে যে মই পঢ়িছিলোঁ।',
      ],
      correctAnswerIndex: 2,
      explanation:
        'Present continuous changes to past continuous in indirect speech: "He said that he was reading."\nবৰ্তমান চলি থকা অৱস্থা পৰোক্ত উক্তিত অতীত চলি থকা অৱস্থালৈ পৰিৱৰ্তন হয়: "তেওঁ ক\'লে যে তেওঁ পঢ়িছিল।"',
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Choose the correct article: "___ honest man is respected."\nশুদ্ধ article বাছক: "___ সৎ মানুহক সন্মান কৰা হয়।"',
      options: [
        'A / এটা',
        'The / সেই',
        'No article / কোনো article নাই',
        'An / এজন',
      ],
      correctAnswerIndex: 3,
      explanation:
        '"Honest" begins with a silent "h" (vowel sound), so "An" is used: "An honest man..."\n"Honest" ৰ আৰম্ভণিৰ "h" নীৰৱ (স্বৰধ্বনি শব্দ), গতিকে "An" ব্যৱহৃত হয়: "এজন সৎ মানুহ..."',
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Fill in the blank: "She is good ___ mathematics."\nবহুবচন বাছক: "তেওঁ গণিতত ভাল ___।"',
      options: ['at / পাৰদৰ্শী', 'in / ভিতৰত', 'on / ওপৰত', 'for / বাবে'],
      correctAnswerIndex: 0,
      explanation:
        'The correct preposition with "good" denoting skill is "at": "good at mathematics."\nদক্ষতা বুজোৱা "good" ৰ সৈতে শুদ্ধ preposition "at": "good at mathematics।"',
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Choose the correct modal: "You ___ wear a helmet while riding."\nশুদ্ধ modal বাছক: "গাড়ী চলাওঁতে তুমি হেলমেট ___ পিন্ধিব লাগে।"',
      options: [
        'can / পাৰে',
        'must / লাগিব',
        'may / পাৰে',
        'would / হ\'লহেঁতেন',
      ],
      correctAnswerIndex: 1,
      explanation:
        '"Must" expresses obligation or necessity: "You must wear a helmet..."\n"Must" এ বাধ্যবাধকতা বা আৱশ্যকতা বুজায়: "তুমি হেলমেট পিন্ধিব লাগিব..."',
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Choose the correct tense: "By the time we arrived, the train ___."\nশুদ্ধ tense বাছক: "আমি পোৱালৈকে গাড়ীখন ___।"',
      options: [
        'left / ওলাই গ\'ল',
        'has left / ওলাই গৈছে',
        'had left / ওলাই গৈছিল',
        'leaves / ওলাই যায়',
      ],
      correctAnswerIndex: 2,
      explanation:
        'For an action completed before another past action, past perfect (had + V3) is used: "had left."\nআন এটা অতীত কাৰ্য়ৰ আগতে সম্পন্ন হোৱা কাৰ্য্যৰ বাবে past perfect (had + V3) ব্যৱহৃত হয়: "had left।"',
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Change to passive voice: "Who broke the window?"\nকৰ্মবাচকলৈ পৰিৱৰ্তন কৰা: "খিৰিকিটো কোনে ভাঙিলে?"',
      options: [
        'Who was broken the window? / কোনে খিৰিকি ভাঙিছিল?',
        'By whom the window was broken? / কাৰ দ্বাৰা খিৰিকি ভাঙিছিল?',
        'Whom was the window broken? / কাক খিৰিকি ভাঙিছিল?',
        'By whom was the window broken? / কাৰ দ্বাৰা খিৰিকিটো ভাঙিছিল?',
      ],
      correctAnswerIndex: 3,
      explanation:
        'In passive interrogative with "who", use "By whom was + subject + V3": "By whom was the window broken?"\n"who" যুক্ত প্ৰশ্নবোধক কৰ্মবাচকত "By whom was + subject + V3" ব্যৱহাৰ কৰা হয়: "কাৰ দ্বাৰা খিৰিকিটো ভাঙিছিল?"',
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Change to indirect speech: She said to me, "Where do you live?"\nপৰোক্ত উক্তিলৈ পৰিৱৰ্তন কৰা: তেওঁ মোক সুধিলে, "তুমি ক\'ত থাকা?"',
      options: [
        'She asked me where I lived. / তেওঁ মোক সুধিলে মই ক\'ত থাকোঁ।',
        'She asked me where do I live. / তেওঁ মোক সুধিলে মই ক\'ত থাকোঁ?',
        'She said me where I lived. / তেওঁ মোক ক\'লে মই ক\'ত থাকোঁ।',
        'She asks me where I lived. / তেওঁ মোক সোধে মই ক\'ত থাকোঁ।',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Wh-question indirect speech: asked + wh-word + subject + verb (past). "She asked me where I lived."\nWh-প্ৰশ্নৰ পৰোক্ত উক্তি: asked + wh-word + subject + verb (past)। "তেওঁ মোক সুধিলে মই ক\'ত থাকোঁ।"',
      subjectTopic: 'Grammar',
      marks: 1,
    },
    {
      question:
        'Choose the correct articles: "___ sun rises in ___ east."\nশুদ্ধ article বাছক: "___ সূৰ্যই ___ পূবে উদয় হয়।"',
      options: [
        'A, an / এটা, এটা',
        'The, the / সেই, সেই',
        'An, the / এটা, সেই',
        'No article / কোনো article নাই',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Definite article "the" is used before unique things (sun) and directions (east): "The sun rises in the east."\nঅদ্বিতীয় বস্তু (sun) আৰু দিশ (east) ৰ আগত definite article "the" ব্যৱহৃত হয়: "সূৰ্যই পূবে উদয় হয়।"',
      subjectTopic: 'Grammar',
      marks: 1,
    },
    // --- Vocabulary (4) ---
    {
      question: 'Choose the synonym of "Abundant".\n"Abundant" ৰ সমাৰ্থক শব্দ বাছক।',
      options: ['Scarce / দুৰ্লভ', 'Empty / খালী', 'Plentiful / প্ৰচুৰ', 'Few / কম'],
      correctAnswerIndex: 2,
      explanation:
        '"Abundant" means existing in large quantities; synonym: "Plentiful".\n"Abundant" মানে প্ৰচুৰ পৰিমাণে থকা; সমাৰ্থক: "Plentiful"।',
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: 'Choose the antonym of "Ancient".\n"Ancient" ৰ বিপৰীত শব্দ বাছক।',
      options: [
        'Old / পুৰণি',
        'Historic / ঐতিহাসিক',
        'Past / অতীত',
        'Modern / আধুনিক',
      ],
      correctAnswerIndex: 3,
      explanation:
        '"Ancient" means very old; its antonym is "Modern".\n"Ancient" মানে বহু পুৰণি; ইয়াৰ বিপৰীত শব্দ "Modern"।',
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question:
        'One-word substitution: "A person who writes books."\nএটা শব্দৰ সমাৰ্থক: "যিজনে কিতাপ লিখে।"',
      options: ['Author / লেখক', 'Reader / পাঠক', 'Publisher / প্ৰকাশক', 'Seller / বিক্ৰেতা'],
      correctAnswerIndex: 0,
      explanation:
        'A person who writes books is called an "Author".\nযিজনে কিতাপ লিখে তেওঁক "Author" (লেখক) বোলা হয়।',
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    {
      question: 'The idiom "To break the ice" means:\n"To break the ice" ৰ অৰ্থ হ\'ল:',
      options: [
        'To break something / একো ভঙা',
        'To start a conversation / কথোপকথন আৰম্ভ কৰা',
        'To be silent / নীৰৱ থকা',
        'To fight / যুঁজ কৰা',
      ],
      correctAnswerIndex: 1,
      explanation:
        '"To break the ice" means to relieve tension and start a conversation.\n"To break the ice" মানে অস্বস্তি দূৰ কৰি কথোপকথন আৰম্ভ কৰা।',
      subjectTopic: 'Vocabulary',
      marks: 1,
    },
    // --- Comprehension (2) ---
    {
      question:
        'Read: "Trees give us oxygen, fruits, and shade. They also prevent soil erosion." What do trees prevent?\nপঢ়া: "গছে আমাক অক্সিজেন, ফল আৰু ছাঁয়া দিয়ে। গছে মাটিৰ ক্ষয়ো ৰোধ কৰে।" গছে কি ৰোধ কৰে?',
      options: [
        'Air pollution / বায়ু প্ৰদূষণ',
        'Water pollution / জল প্ৰদূষণ',
        'Soil erosion / মাটি ক্ষয়',
        'Noise / শব্দ',
      ],
      correctAnswerIndex: 2,
      explanation:
        'The passage states trees prevent soil erosion.\nপাঠ অনুসৰি গছে মাটি ক্ষয় ৰোধ কৰে।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
    {
      question:
        'Read: "Early to bed and early to rise makes a man healthy." What is the key idea?\nপঢ়া: "সময়মতে শুই সময়মতে উঠাই মানুহক সুস্থ কৰে।" মূল ভাৱনা কি?',
      options: [
        'Sleeping late is good / দেৰি শুৱাটো ভাল',
        'Eating more food / বেছি খোৱা',
        'Waking up late / দেৰি উঠা',
        'Disciplined lifestyle brings health / শৃংখলাবদ্ধ জীৱনে সুস্থতা আনে',
      ],
      correctAnswerIndex: 3,
      explanation:
        'The key idea is that a disciplined lifestyle (early sleeping and rising) leads to health.\nমূল ভাৱনা হ\'ল শৃংখলাবদ্ধ জীৱন (সময়মতে শুই উঠা) এ সুস্থতা আনে।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
    // --- Pedagogy (4) ---
    {
      question:
        'Which of these is NOT one of the four language skills (LSRW)?\nতলৰ কোনটো LSRW (চাৰিটা ভাষা দক্ষতা)ৰ ভিতৰত নপৰে?',
      options: [
        'Thinking / চিন্তা কৰা',
        'Listening / শুনা',
        'Speaking / কোৱা',
        'Reading / পঢ়া',
      ],
      correctAnswerIndex: 0,
      explanation:
        'The four language skills are Listening, Speaking, Reading, and Writing (LSRW). "Thinking" is not among them.\nচাৰিটা ভাষা দক্ষতা হ\'ল Listening, Speaking, Reading, আৰু Writing (LSRW)। "Thinking" ইয়াৰ ভিতৰত নাই।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
    {
      question: 'Phonics is a method of teaching:\nPhonics হ\'ল এক শিক্ষণ পদ্ধতি য\'ত শিকোৱা হয়:',
      options: [
        'Grammar rules / ব্যাকৰণৰ নিয়ম',
        'Sound-letter relationships / ধ্বনি-আখৰৰ সম্পৰ্ক',
        'Whole stories / সম্পূৰ্ণ গল্প',
        'Vocabulary lists / শব্দকোষৰ তালিকা',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Phonics teaches the relationship between sounds (phonemes) and letters (graphemes).\nPhonics এ ধ্বনি (phoneme) আৰু আখৰ (grapheme) ৰ মাজৰ সম্পৰ্ক শিকায়।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
    {
      question: 'The whole-language approach emphasizes:\nWhole-language পদ্ধতিয়ে গুৰুত্ব দিয়ে:',
      options: [
        'Isolated phonics drills / পৃথক ধ্বনি অনুশীলন',
        'Memorizing rules / নিয়ম মুখস্থ কৰা',
        'Meaningful, whole texts / অৰ্থপূৰ্ণ সম্পূৰ্ণ পাঠ',
        'Translation only / অনুবাদ কেৱল',
      ],
      correctAnswerIndex: 2,
      explanation:
        'Whole-language approach emphasizes reading meaningful, whole texts in context rather than isolated skills.\nWhole-language পদ্ধতিয়ে পৃথক দক্ষতাৰ পৰিৱৰ্তে প্ৰসংগভিত্তিক অৰ্থপূৰ্ণ সম্পূৰ্ণ পাঠ পঢ়াত গুৰুত্ব দিয়ে।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
    {
      question:
        'In language acquisition, the "silent period" refers to:\nভাষা অৰ্জনত "silent period" (নীৰৱ সময়) বুজায়:',
      options: [
        'Refusing to learn / শিকিবলৈ অমান্তি হোৱা',
        'Speaking loudly / উচ্চস্বৰে কোৱা',
        'Writing only / কেৱল লিখা',
        'Listening before speaking / কোৱাৰ আগতে শুনা',
      ],
      correctAnswerIndex: 3,
      explanation:
        'The silent period is a phase where learners absorb language through listening before they begin to speak.\nনীৰৱ সময় হ\'ল এনে এটা পৰ্যায় য\'ত শিকক কোৱাৰ আগতে শুনি ভাষা গ্ৰহণ কৰে।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
  ],

  // ===========================================================================
  // tet-maths — Mathematics (20)
  // ===========================================================================
  'tet-maths': [
    // --- Number System (4) ---
    {
      question: 'What is the place value of 5 in 85,432?\n85,432 ত 5 ৰ স্থানীয় মান কিমান?',
      options: ['5,000 / 5,000', '500 / 500', '50 / 50', '5 / 5'],
      correctAnswerIndex: 0,
      explanation:
        'In 85,432, the digit 5 is in the thousands place, so its place value is 5,000.\n85,432 ত 5 হাজাৰৰ স্থানত আছে, গতিকে ইয়াৰ স্থানীয় মান 5,000।',
      subjectTopic: 'Number System',
      marks: 1,
    },
    {
      question:
        'Using digits 0, 1, 2, 3, 4 (no leading zero), the smallest 5-digit number is:\nঅঙ্ক 0, 1, 2, 3, 4 ব্যৱহাৰ কৰি (প্ৰথম স্থানত শূন্য নহয়) আটাইতকৈ সৰু 5-অঙ্কীয় সংখ্যাটো হ\'ল:',
      options: ['01,234 / 01,234', '10,234 / 10,234', '10,432 / 10,432', '12,034 / 12,034'],
      correctAnswerIndex: 1,
      explanation:
        'To get the smallest number, place the smallest non-zero digit (1) first, then arrange the rest ascending: 10,234.\nআটাইতকৈ সৰু সংখ্যা পাবলৈ প্ৰথমে আটাইতকৈ সৰু অশূন্য অঙ্ক (1) বহাওক, তাৰ পিছত বাকীবোৰ আৰোহী ক্ৰমত সজাওক: 10,234।',
      subjectTopic: 'Number System',
      marks: 1,
    },
    {
      question: 'Which of the following is a prime number?\nতলৰ কোনটো এটা মৌলিক সংখ্যা?',
      options: ['15 / 15', '21 / 21', '17 / 17', '25 / 25'],
      correctAnswerIndex: 2,
      explanation:
        '17 has only two factors, 1 and 17, so it is prime. 15 = 3×5, 21 = 3×7, 25 = 5×5 are composite.\n17 ৰ কেৱল দুটা উৎপাদক 1 আৰু 17, গতিকে ই মৌলিক। 15 = 3×5, 21 = 3×7, 25 = 5×5 যৌগিক।',
      subjectTopic: 'Number System',
      marks: 1,
    },
    {
      question: 'The LCM of 4 and 6 is:\n4 আৰু 6 ৰ লসাগু (LCM) হ\'ল:',
      options: ['2 / 2', '10 / 10', '24 / 24', '12 / 12'],
      correctAnswerIndex: 3,
      explanation:
        'LCM is the smallest common multiple. Multiples of 4: 4,8,12,...; multiples of 6: 6,12,... → LCM = 12.\nলসাগু হ\'ল আটাইতকৈ সৰু সাধাৰণ গুণিতক। 4 ৰ গুণিতক: 4,8,12,...; 6 ৰ গুণিতক: 6,12,... → লসাগু = 12।',
      subjectTopic: 'Number System',
      marks: 1,
    },
    // --- Fractions (3) ---
    {
      question: '1/2 + 1/4 = ?\n1/2 + 1/4 = ?',
      options: ['3/4 / 3/4', '2/6 / 2/6', '1/6 / 1/6', '1/8 / 1/8'],
      correctAnswerIndex: 0,
      explanation:
        'LCM of denominators is 4. 1/2 = 2/4, so 2/4 + 1/4 = 3/4.\nহৰৰ লসাগু 4। 1/2 = 2/4, গতিকে 2/4 + 1/4 = 3/4।',
      subjectTopic: 'Fractions',
      marks: 1,
    },
    {
      question: 'Which fraction is equivalent to 2/3?\nকোনটো ভগ্নাংশ 2/3 ৰ সমান?',
      options: ['3/4 / 3/4', '4/6 / 4/6', '2/6 / 2/6', '3/6 / 3/6'],
      correctAnswerIndex: 1,
      explanation:
        'Multiplying numerator and denominator of 2/3 by 2 gives 4/6, which is equivalent.\n2/3 ৰ লৱ আৰু হৰক 2 ৰে পূৰণ কৰিলে 4/6 পোৱা যায়, যি সমান।',
      subjectTopic: 'Fractions',
      marks: 1,
    },
    {
      question: 'Which is greater: 3/5 or 2/3?\nকোনটো ডাঙৰ: 3/5 নে 2/3?',
      options: [
        'Both equal / দুয়ো সমান',
        '3/5 / 3/5',
        '2/3 / 2/3',
        'Cannot compare / তুলনা কৰিব নোৱাৰি',
      ],
      correctAnswerIndex: 2,
      explanation:
        'Cross-multiply: 3×3 = 9 vs 5×2 = 10; since 10 > 9, 2/3 > 3/5.\nছেদি পূৰণ: 3×3 = 9 আৰু 5×2 = 10; যিহেতু 10 > 9, গতিকে 2/3 > 3/5।',
      subjectTopic: 'Fractions',
      marks: 1,
    },
    // --- Decimals (2) ---
    {
      question: '0.25 expressed as a fraction is:\n0.25 ক ভগ্নাংশ হিচাপে প্ৰকাশ কৰিলে:',
      options: ['1/2 / 1/2', '1/3 / 1/3', '1/5 / 1/5', '1/4 / 1/4'],
      correctAnswerIndex: 3,
      explanation:
        '0.25 = 25/100 = 1/4 after simplifying by dividing numerator and denominator by 25.\n0.25 = 25/100 = 1/4 (লৱ আৰু হৰক 25 ৰে হৰণ কৰিলে)।',
      subjectTopic: 'Fractions',
      marks: 1,
    },
    {
      question: '2.5 + 1.25 = ?\n2.5 + 1.25 = ?',
      options: ['3.75 / 3.75', '3.5 / 3.5', '4.0 / 4.0', '3.25 / 3.25'],
      correctAnswerIndex: 0,
      explanation:
        'Aligning decimals: 2.50 + 1.25 = 3.75.\nদশমিক মিলাই: 2.50 + 1.25 = 3.75।',
      subjectTopic: 'Fractions',
      marks: 1,
    },
    // --- Geometry (3) ---
    {
      question: 'How many sides does a triangle have?\nত্ৰিভুজৰ কিমানটা বাহু থাকে?',
      options: ['4 / 4', '3 / 3', '5 / 5', '2 / 2'],
      correctAnswerIndex: 1,
      explanation:
        'A triangle is a closed polygon with exactly three sides.\nত্ৰিভুজ হ\'ল ঠিক তিনিটা বাহু থকা এটা বন্ধ বহুভুজ।',
      subjectTopic: 'Geometry',
      marks: 1,
    },
    {
      question: 'An angle of 90° is called:\n90° কোণক কোৱা হয়:',
      options: [
        'Acute angle / সূক্ষ্ম কোণ',
        'Obtuse angle / স্থূল কোণ',
        'Right angle / সমকোণ',
        'Reflex angle / প্ৰবৃদ্ধ কোণ',
      ],
      correctAnswerIndex: 2,
      explanation:
        'An angle of exactly 90° is a right angle.\nঠিক 90° কোণক সমকোণ বোলা হয়।',
      subjectTopic: 'Geometry',
      marks: 1,
    },
    {
      question: 'The sum of the angles in a triangle is:\nত্ৰিভুজৰ তিনিটা কোণৰ যোগফল হ\'ল:',
      options: ['90° / 90°', '270° / 270°', '360° / 360°', '180° / 180°'],
      correctAnswerIndex: 3,
      explanation:
        'The angle-sum property of a triangle states that the three interior angles add up to 180°.\nত্ৰিভুজৰ কোণ-যোগফল ধৰ্ম অনুসৰি তিনিটা অন্তৰ্ভাগ কোণৰ যোগফল 180° হয়।',
      subjectTopic: 'Geometry',
      marks: 1,
    },
    // --- Mensuration (3) ---
    {
      question:
        'Area of a rectangle with length 6 cm and breadth 4 cm is:\nদীঘল 6 ছেমি আৰু প্ৰস্থ 4 ছেমি থকা আয়তৰ কালি হ\'ল:',
      options: [
        '24 sq cm / 24 বৰ্গ ছেমি',
        '10 sq cm / 10 বৰ্গ ছেমি',
        '20 sq cm / 20 বর্গ ছেমি',
        '48 sq cm / 48 বর্গ ছেমি',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Area of rectangle = length × breadth = 6 × 4 = 24 sq cm.\nআয়তৰ কালি = দীঘল × প্ৰস্থ = 6 × 4 = 24 বৰ্গ ছেমি।',
      subjectTopic: 'Mensuration',
      marks: 1,
    },
    {
      question:
        'Perimeter of a square with side 5 cm is:\nবাহু 5 ছেমি থকা বৰ্গৰ পৰিসীমা হ\'ল:',
      options: [
        '10 cm / 10 ছেমি',
        '20 cm / 20 ছেমি',
        '25 cm / 25 ছেমি',
        '15 cm / 15 ছেমি',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Perimeter of a square = 4 × side = 4 × 5 = 20 cm.\nবৰ্গৰ পৰিসীমা = 4 × বাহু = 4 × 5 = 20 ছেমি।',
      subjectTopic: 'Mensuration',
      marks: 1,
    },
    {
      question:
        'Volume of a cube with side 3 cm is:\nবাহু 3 ছেমি থকা ঘনৰ আয়তন হ\'ল:',
      options: [
        '9 cubic cm / 9 ঘন ছেমি',
        '6 cubic cm / 6 ঘন ছেমি',
        '27 cubic cm / 27 ঘন ছেমি',
        '81 cubic cm / 81 ঘন ছেমি',
      ],
      correctAnswerIndex: 2,
      explanation:
        'Volume of a cube = side³ = 3³ = 3 × 3 × 3 = 27 cubic cm.\nঘনৰ আয়তন = বাহু³ = 3³ = 3 × 3 × 3 = 27 ঘন ছেমি।',
      subjectTopic: 'Mensuration',
      marks: 1,
    },
    // --- Data Handling (2) ---
    {
      question: 'The mean of 2, 4, 6, 8 is:\n2, 4, 6, 8 ৰ গড় হ\'ল:',
      options: ['4 / 4', '6 / 6', '20 / 20', '5 / 5'],
      correctAnswerIndex: 3,
      explanation:
        'Mean = sum ÷ count = (2+4+6+8) ÷ 4 = 20 ÷ 4 = 5.\nগড় = যোগফল ÷ সংখ্যা = (2+4+6+8) ÷ 4 = 20 ÷ 4 = 5।',
      subjectTopic: 'Data Handling',
      marks: 1,
    },
    {
      question:
        'Find the mode of: 2, 3, 3, 5, 5, 5, 7.\nতলৰ তথ্যৰ বহুলক (mode) বিচাৰা: 2, 3, 3, 5, 5, 5, 7।',
      options: ['5 / 5', '3 / 3', '2 / 2', '7 / 7'],
      correctAnswerIndex: 0,
      explanation:
        'Mode is the most frequent value. Here 5 appears three times — more than any other value.\nবহুলক হ\'ল আটাইতকৈ বেছি থকা মান। ইয়াত 5 তিনিবাৰ আছে — আন যিকোনো মানতকৈ বেছি।',
      subjectTopic: 'Data Handling',
      marks: 1,
    },
    // --- Pedagogy (3) ---
    {
      question:
        'At primary level, the best approach to teaching mathematics is:\nপ্ৰাথমিক স্তৰত গণিত শিক্ষণৰ শ্ৰেষ্ঠ পদ্ধতি হ\'ল:',
      options: [
        'Memorizing formulas / সূত্ৰ মুখস্থ কৰা',
        'Concrete to abstract / প্ৰত্যক্ষৰ পৰা বিমূর্তলৈ',
        'Abstract to concrete / বিমূর্তৰ পৰা প্ৰত্যক্ষলৈ',
        'Only oral learning / কেৱল মৌখিক শিক্ষণ',
      ],
      correctAnswerIndex: 1,
      explanation:
        'NCERT recommends the concrete-to-abstract progression: children learn with concrete objects first, then move to symbols.\nNCERT ৰ পৰামৰ্শ অনুসৰি প্ৰত্যক্ষ-ৰ পৰা-বিমূর্তলৈ ক্ৰম: শিশুৱে প্ৰথমে প্ৰত্যক্ষ বস্তুৰে শিকে, তাৰ পিছত চিহ্নলৈ যায়।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
    {
      question:
        'Which of the following is NOT a goal of learning mathematics at primary level?\nতলৰ কোনটো প্ৰাথমিক স্তৰত গণিত শিকাৰ লক্ষ্য নহয়?',
      options: [
        'Logical thinking / যৌক্তিক চিন্তা',
        'Problem solving / সমস্যা সমাধান',
        'Rote memorization only / কেৱল আবৃত্তি কৰা',
        'Number sense / সংখ্যা জ্ঞান',
      ],
      correctAnswerIndex: 2,
      explanation:
        'Rote memorization is not a goal of mathematics education; understanding, reasoning, and problem-solving are.\nআবৃত্তি কৰা গণিত শিক্ষাৰ লক্ষ্য নহয়; বোধগম্যতা, যুক্তি আৰু সমস্যা সমাধানহে লক্ষ্য।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
    {
      question: 'A good mathematics teacher should encourage:\nএজন ভাল গণিত শিক্ষকে উৎসাহিত কৰা উচিত:',
      options: [
        'Single method only / কেৱল এটা পদ্ধতি',
        'Silent work / নীৰৱ কাম',
        'Memorization / আবৃত্তি',
        'Multiple solution methods / একাধিক সমাধান পদ্ধতি',
      ],
      correctAnswerIndex: 3,
      explanation:
        'Encouraging multiple solution methods fosters deeper understanding and flexible thinking in mathematics.\nএকাধিক সমাধান পদ্ধতি উৎসাহিত কৰালে গণিতত গভীৰ বোধগম্যতা আৰু নমনীয় চিন্তা গঢ়ি উঠে।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
  ],

  // ===========================================================================
  // tet-evs — Environmental Studies (20)
  // ===========================================================================
  'tet-evs': [
    // --- Ecology (4) ---
    {
      question:
        'Which gas do plants absorb from the air for photosynthesis?\nউদ্ভিদে সালোকসংশ্লেষণৰ বাবে বায়ুৰ পৰা কোন গেছ শোষণ কৰে?',
      options: [
        'Carbon dioxide / কাৰ্বন ডাইঅক্সাইড',
        'Oxygen / অক্সিজেন',
        'Nitrogen / নাইট্ৰোজেন',
        'Hydrogen / হাইড্ৰোজেন',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Plants absorb carbon dioxide from the air and use it, with water and sunlight, to make food via photosynthesis.\nউদ্ভিদে বায়ুৰ পৰা কাৰ্বন ডাইঅক্সাইড শোষণ কৰি পানী আৰু সূৰ্য্যৰ পোহৰৰ সহায়ত সালোকসংশ্লেষণৰ দ্বাৰা খাদ্য তৈয়াৰ কৰে।',
      subjectTopic: 'Ecology',
      marks: 1,
    },
    {
      question:
        'What is the ultimate source of energy for all living things?\nসকলো জীৱৰ বাবে শক্তিৰ চূড়ান্ত উৎস কি?',
      options: ['Water / পানী', 'Sun / সূৰ্য্য', 'Soil / মাটি', 'Air / বায়ু'],
      correctAnswerIndex: 1,
      explanation:
        'The Sun is the ultimate source of energy for almost all living things, via photosynthesis in plants.\nপ্ৰায় সকলো জীৱৰ বাবে সূৰ্য্যই হ\'ল শক্তিৰ চূড়ান্ত উৎস, উদ্ভিদৰ সালোকসংশ্লেষণৰ জৰিয়তে।',
      subjectTopic: 'Ecology',
      marks: 1,
    },
    {
      question: 'Which of these is a non-renewable resource?\nতলৰ কোনটো অনবায়নযোগ্য সম্পদ?',
      options: [
        'Solar energy / সৌৰ শক্তি',
        'Wind energy / বায়ু শক্তি',
        'Coal / কয়লা',
        'Water / পানী',
      ],
      correctAnswerIndex: 2,
      explanation:
        'Coal takes millions of years to form and cannot be replenished quickly, so it is non-renewable.\nকয়লা গঠন হ\'বলৈ লাখ লাখ বছৰ লাগে আৰু ই সোনকালে পুনৰ পূৰণ নহ\'ব, গতিকে অনবায়নযোগ্য।',
      subjectTopic: 'Ecology',
      marks: 1,
    },
    {
      question:
        'The process by which water changes into vapour is called:\nপানী বাষ্পলৈ পৰিৱৰ্তন হোৱা প্ৰক্ৰিয়াটোক কোৱা হয়:',
      options: [
        'Condensation / ঘনীভৱন',
        'Precipitation / অৱক্ষেপন',
        'Freezing / হিমপাত',
        'Evaporation / বাষ্পীভৱন',
      ],
      correctAnswerIndex: 3,
      explanation:
        'Evaporation is the process by which water changes from liquid to vapour due to heat.\nবাষ্পীভৱন হ\'ল উত্তাপৰ বাবে পানী তৰল অৱস্থাৰ পৰা বাষ্পলৈ পৰিৱৰ্তন হোৱা প্ৰক্ৰিয়া।',
      subjectTopic: 'Ecology',
      marks: 1,
    },
    // --- Pollution (3) ---
    {
      question: 'Which gas is the main cause of global warming?\nকোন গেছ গ্ল\'বেল ৱাৰ্মিঙৰ মুখ্য কাৰণ?',
      options: [
        'Carbon dioxide / কাৰ্বন ডাইঅক্সাইড',
        'Oxygen / অক্সিজেন',
        'Nitrogen / নাইট্ৰোজেন',
        'Helium / হিলিয়াম',
      ],
      correctAnswerIndex: 0,
      explanation:
        'Carbon dioxide is a greenhouse gas that traps heat and is the main cause of global warming.\nকাৰ্বন ডাইঅক্সাইড হ\'ল এটা গ্ৰীণহাউছ গেছ যিয়ে উত্তাপ আৱদ্ধ কৰে আৰু গ্ল\'বেল ৱাৰ্মিঙৰ মুখ্য কাৰণ।',
      subjectTopic: 'Pollution',
      marks: 1,
    },
    {
      question: 'Sound pollution is mainly caused by:\nশব্দ প্ৰদূষণ মূলতঃ কাৰণে হয়:',
      options: [
        'Trees / গছ',
        'Vehicles and loudspeakers / বাহন আৰু লাউডস্পিকাৰ',
        'Rain / বৰষুণ',
        'Rivers / নদী',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Vehicles, loudspeakers, and machinery produce loud noise, which is the main source of sound pollution.\nবাহন, লাউডস্পিকাৰ আৰু যন্ত্ৰপাতিৰ পৰা হোৱা প্ৰবল শব্দই হ\'ল শব্দ প্ৰদূষণৰ মুখ্য উৎস।',
      subjectTopic: 'Pollution',
      marks: 1,
    },
    {
      question: 'Which of the following is biodegradable?\nতলৰ কোনটো জৈৱ-অৱক্ষয়ি?',
      options: [
        'Plastic bag / প্লাষ্টিকৰ থলী',
        'Glass bottle / কাঁচৰ ব\'তল',
        'Fruit peel / ফলৰ ছোলা',
        'Aluminium can / এলুমিনিয়ামৰ কেন',
      ],
      correctAnswerIndex: 2,
      explanation:
        'Fruit peels are organic waste that decomposes naturally, so they are biodegradable.\nফলৰ ছোলা হ\'ল জৈৱিক আৱৰ্জনা যি প্ৰাকৃতিকভাৱে পচি যায়, গতিকে এইটো জৈৱ-অৱক্ষয়ি।',
      subjectTopic: 'Pollution',
      marks: 1,
    },
    // --- Assam Biodiversity (8) ---
    {
      question:
        'Kaziranga National Park is famous for which animal?\nকাজিৰঙা ৰাষ্ট্ৰীয় উদ্যান কোন জন্তুৰ বাবে বিখ্যাত?',
      options: [
        'Bengal tiger / ৰয়েল বেংগল টাইগাৰ',
        'Asiatic lion / এচিয়াটিক সিংহ',
        'Snow leopard / তুষাৰ চিতা',
        'One-horned rhinoceros / একশিঙা গঁড়',
      ],
      correctAnswerIndex: 3,
      explanation:
        'Kaziranga National Park in Assam is world-famous for its population of the Indian one-horned rhinoceros.\nঅসমৰ কাজিৰঙা ৰাষ্ট্ৰীয় উদ্যান ভাৰতীয় একশিঙা গঁড়ৰ সংখ্যাৰ বাবে বিশ্ববিখ্যাত।',
      subjectTopic: 'Assam Biodiversity',
      marks: 1,
    },
    {
      question:
        'In Assamese, the Brahmaputra river is also called:\nঅসমীয়াত ব্ৰহ্মপুত্ৰ নদীক আন এটা নামেৰে কোৱা হয়:',
      options: ['Luit / লুইত', 'Borak / বৰাক', 'Subansiri / সুবাংসিৰি', 'Manas / মানাস'],
      correctAnswerIndex: 0,
      explanation:
        'The Brahmaputra is lovingly called "Luit" (লুইত) in Assamese literature.\nঅসমীয়া সাহিত্যত ব্ৰহ্মপুত্ৰ নদীক স্নেহেৰে "লুইত" বুলি কোৱা হয়।',
      subjectTopic: 'Assam Biodiversity',
      marks: 1,
    },
    {
      question: 'Majuli is the world\'s largest:\nমাজুলী হ\'ল পৃথিৱীৰ আটাইতকৈ ডাঙৰ:',
      options: [
        'Mountain / পৰ্বত',
        'River island / নদী দ্বীপ',
        'Desert / মৰু',
        'Lake / হ্ৰদ',
      ],
      correctAnswerIndex: 1,
      explanation:
        'Majuli, in the Brahmaputra river in Assam, is recognized as the world\'s largest river island.\nঅসমৰ ব্ৰহ্মপুত্ৰ নদীত থকা মাজুলীক পৃথিৱীৰ আটাইতকৈ ডাঙৰ নদী দ্বীপ হিচাপে স্বীকৃতি দিয়া হয়।',
      subjectTopic: 'Assam Biodiversity',
      marks: 1,
    },
    {
      question:
        'Which wildlife sanctuary in Assam is also a Tiger Reserve (Project Tiger)?\nঅসমৰ কোনটো অভয়াৰণ্য Project Tiger অন্তৰ্গত বাঘ সংৰক্ষিত অঞ্চল?',
      options: [
        'Kaziranga / কাজিৰঙা',
        'Pobitora / পবিতৰা',
        'Manas / মানাস',
        'Dibru-Saikhowa / দিব্ৰু-চাইকোৱা',
      ],
      correctAnswerIndex: 2,
      explanation:
        'Manas National Park in Assam is a Tiger Reserve under Project Tiger and a UNESCO World Heritage Site.\nঅসমৰ মানাস ৰাষ্ট্ৰীয় উদ্যান Project Tiger অন্তৰ্গত বাঘ সংৰক্ষিত অঞ্চল আৰু ইউনেস্কো বিশ্ব ঐতিহ্য স্থল।',
      subjectTopic: 'Assam Biodiversity',
      marks: 1,
    },
    {
      question:
        'Pobitora Wildlife Sanctuary in Assam is famous for which animal?\nঅসমৰ পবিতৰা অভয়াৰণ্য কোন জন্তুৰ বাবে বিখ্যাত?',
      options: [
        'Tiger / বাঘ',
        'Elephant / হাতী',
        'Lion / সিংহ',
        'One-horned rhinoceros / একশিঙা গঁড়',
      ],
      correctAnswerIndex: 3,
      explanation:
        'Pobitora has the highest density of one-horned rhinoceros in the world, despite its small area.\nপবিতৰাত সৰু মাটিকালিৰ ভিতৰতে বিশ্বৰ আটাইতকৈ উচ্চ ঘনত্বৰ একশিঙা গঁড় আছে।',
      subjectTopic: 'Assam Biodiversity',
      marks: 1,
    },
    {
      question:
        'The one-horned rhinoceros is the state animal of which Indian state?\nএকশিঙা গঁড় কোন ভাৰতীয় ৰাজ্যৰ ৰাজ্যিক জন্তু?',
      options: [
        'Assam / অসম',
        'West Bengal / পশ্চিম বংগ',
        'Bihar / বিহাৰ',
        'Odisha / ওড়িশা',
      ],
      correctAnswerIndex: 0,
      explanation:
        'The Indian one-horned rhinoceros (Rhinoceros unicornis) is the state animal of Assam.\nভাৰতীয় একশিঙা গঁড় (Rhinoceros unicornis) অসমৰ ৰাজ্যিক জন্তু।',
      subjectTopic: 'Assam Biodiversity',
      marks: 1,
    },
    {
      question:
        'The Brahmaputra river originates from:\nব্ৰহ্মপুত্ৰ নদী ক\'ৰ পৰা উৎপন্ন হৈছে?',
      options: [
        'Gangotri glacier / গংগোত্ৰী হিমবাহ',
        'Angsi glacier in Tibet / তিব্বতৰ আংগছি হিমবাহ',
        'Himalayas in Nepal / নেপালৰ হিমালয়',
        'Arunachal hills / অৰুণাচল পাহাৰ',
      ],
      correctAnswerIndex: 1,
      explanation:
        'The Brahmaputra originates from the Angsi glacier near Mount Kailash in Tibet, where it is called Yarlung Tsangpo.\nব্ৰহ্মপুত্ৰ তিব্বতৰ কৈলাস পৰ্বতৰ ওচৰৰ আংগছি হিমবাহৰ পৰা উৎপন্ন হয়, য\'ত ইয়াক য়াৰলুং চাংপো বোলা হয়।',
      subjectTopic: 'Assam Biodiversity',
      marks: 1,
    },
    {
      question:
        'Which is an endangered bird species found in Assam?\nঅসমত পোৱা বিপদগ্ৰস্ত চৰাই প্ৰজাতি কোনটো?',
      options: [
        'Crow / কাউৰী',
        'Pigeon / পাৰ',
        'Bengal Florican / বেংগল ফ্লোৰিকান',
        'Duck / হাঁহ',
      ],
      correctAnswerIndex: 2,
      explanation:
        'The Bengal Florican (Houbaropsis bengalensis), found in grasslands of Assam, is a critically endangered bustard.\nঅসমৰ ঘাঁহনিত পোৱা বেংগল ফ্লোৰিকান (Houbaropsis bengalensis) এটা মাৰাত্মকভাৱে বিপদগ্ৰস্ত বস্টাৰ্ড চৰাই।',
      subjectTopic: 'Assam Biodiversity',
      marks: 1,
    },
    // --- Pedagogy (5) ---
    {
      question:
        'At primary level (NCERT III-V), EVS should be taught mainly through:\nপ্ৰাথমিক স্তৰত (NCERT III-V) EVS মূলতঃ কেনেদৰে শিকোৱা উচিত?',
      options: [
        'Lectures only / কেৱল বক্তৃতা',
        'Memorizing definitions / সংজ্ঞা আবৃত্তি',
        'Textbook reading only / কেৱল পাঠ্যপুথি পঢ়া',
        'Activity-based learning / কাৰ্য্যভিত্তিক শিক্ষণ',
      ],
      correctAnswerIndex: 3,
      explanation:
        'NCERT recommends activity-based, experiential learning for EVS at the primary level.\nNCERT ৰ পৰামৰ্শ অনুসৰি প্ৰাথমিক স্তৰত EVS কাৰ্য্যভিত্তিক, অভিজ্ঞতামূলক শিক্ষণেৰে শিকোৱা উচিত।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
    {
      question:
        'The main objective of EVS at primary level is to:\nপ্ৰাথমিক স্তৰত EVS-ৰ মুখ্য উদ্দেশ্য হ\'ল:',
      options: [
        'Develop awareness about the environment / পৰিৱেশৰ বিষয়ে সজাগতা গঢ়া',
        'Memorize facts / তথ্য আবৃত্তি কৰা',
        'Pass exams / পৰীক্ষাত উত্তীৰ্ণ হোৱা',
        'Learn only definitions / কেৱল সংজ্ঞা শিকা',
      ],
      correctAnswerIndex: 0,
      explanation:
        'EVS at primary level aims to develop environmental awareness, sensitivity, and concern for the surroundings.\nপ্ৰাথমিক স্তৰত EVS-ৰ লক্ষ্য হ\'ল পৰিৱেশৰ প্ৰতি সজাগতা, সংবেদনশীলতা আৰু চিন্তা গঢ়ি তোলা।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
    {
      question: 'A key EVS skill emphasized in the NCERT curriculum is:\nNCERT পাঠ্যক্ৰমত EVS-ৰ এটা মূল দক্ষতা হ\'ল:',
      options: [
        'Memorization / আবৃত্তি',
        'Observation and recording / পৰ্যবেক্ষণ আৰু ৰেকৰ্ড কৰা',
        'Translation / অনুবাদ',
        'Drawing maps only / কেৱল মানচিত্ৰ অঁকা',
      ],
      correctAnswerIndex: 1,
      explanation:
        'NCERT EVS emphasizes observation, exploration, questioning, and recording as core skills.\nNCERT EVS-এ পৰ্যবেক্ষণ, অন্বেষণ, প্ৰশ্ন কৰা আৰু ৰেকৰ্ড কৰাক মূল দক্ষতা হিচাপে গুৰুত্ব দিয়ে।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
    {
      question:
        'EVS at primary level integrates which subjects?\nপ্ৰাথমিক স্তৰত EVS-এ কোনবোৰ বিষয় সংযোগ কৰে?',
      options: [
        'Only maths / কেৱল গণিত',
        'Only languages / কেৱল ভাষা',
        'Science and Social Science / বিজ্ঞান আৰু সমাজ বিজ্ঞান',
        'Only art / কেৱল চিত্ৰকলা',
      ],
      correctAnswerIndex: 2,
      explanation:
        'EVS is an integrated subject combining concepts from both Science and Social Science at the primary level.\nপ্ৰাথমিক স্তৰত EVS হ\'ল বিজ্ঞান আৰু সমাজ বিজ্ঞান দুয়োটাৰ ধাৰণা সংযোগ কৰা এটা সমন্বিত বিষয়।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
    {
      question: 'Field trips in EVS help children to:\nEVS-ত শিক্ষা ভ্ৰমণে শিশুক সহায় কৰে:',
      options: [
        'Memorize the textbook / পাঠ্যপুথি আবৃত্তি কৰিবলৈ',
        'Skip classes / পাঠ এৰিবলৈ',
        'Avoid teachers / শিক্ষক এৰাই চলিবলৈ',
        'Learn through direct experience / প্ৰত্যক্ষ অভিজ্ঞতাৰে শিকিবলৈ',
      ],
      correctAnswerIndex: 3,
      explanation:
        'Field trips provide first-hand, direct experience of the environment — a core EVS pedagogical tool.\nশিক্ষা ভ্ৰমণে পৰিৱেশৰ প্ৰত্যক্ষ অভিজ্ঞতা প্ৰদান কৰে — যি EVS শিক্ষণৰ এটা মূল সঁজুলি।',
      subjectTopic: 'Pedagogy',
      marks: 1,
    },
  ],
};
