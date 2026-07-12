// National exams — part 3 of seed data
// Generated for ExamVault v2 — 100% real data

import type {
  SeedCategory,
  SeedSubject,
  SeedTest,
  SeedQuestion,
} from './00-interfaces';

export const NATIONAL_CATEGORIES: SeedCategory[] = [
  // ===========================================================================
  // 1. UPSC CIVIL SERVICES
  // ===========================================================================
  {
    name: 'UPSC Civil Services',
    slug: 'upsc',
    icon: '🦅',
    description:
      'UPSC Civil Services Examination (CSE) — Prelims, Mains & Interview for IAS, IPS, IFS and other Group A services. Conducted annually by the Union Public Service Commission.',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    color: '#1e3a8a',
    order: 30,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'Indian Polity & Governance',
        slug: 'upsc-polity',
        icon: '⚖️',
        description:
          'Constitution, Fundamental Rights, DPSP, Parliament, Judiciary, Federalism and Panchayati Raj — aligned with the UPSC CSE Prelims GS-II syllabus.',
        order: 1,
        tests: [
          {
            title: 'UPSC CSE Prelims Polity — Mini Mock',
            slug: 'upsc-cse-prelims-polity-mini-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'HARD',
            negativeMarking: true,
            negativeMarks: 0.33,
            instructions:
              '5 questions · 2 marks each · -0.33 negative marking · 10 minutes. Modeled on the UPSC CSE Preliminary Examination (GS Paper I) pattern.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question:
                  'The Constitution of India was adopted by the Constituent Assembly on which date?',
                options: [
                  '15 August 1947',
                  '26 November 1949',
                  '26 January 1950',
                  '24 January 1950',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The Constituent Assembly adopted the Constitution on 26 November 1949, and it came into force on 26 January 1950 — celebrated as Republic Day.',
                subjectTopic: 'Constitution Making',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'Who was the Chairman of the Drafting Committee of the Constituent Assembly?',
                options: [
                  'Dr. Rajendra Prasad',
                  'Jawaharlal Nehru',
                  'Dr. B.R. Ambedkar',
                  'Sardar Vallabhbhai Patel',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'Dr. B.R. Ambedkar was the Chairman of the Drafting Committee (constituted on 29 August 1947) and is widely regarded as the "Father of the Indian Constitution".',
                subjectTopic: 'Constitution Making',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'Article 17 of the Constitution of India deals with which of the following?',
                options: [
                  'Right to Equality',
                  'Abolition of Untouchability',
                  'Right to Life',
                  'Right to Freedom of Religion',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Article 17 abolishes untouchability and forbids its practice in any form. The enforcement of any disability arising out of untouchability is an offence punishable by law.',
                subjectTopic: 'Fundamental Rights',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'Dr. B.R. Ambedkar called which Article the "heart and soul of the Constitution"?',
                options: ['Article 14', 'Article 19', 'Article 21', 'Article 32'],
                correctAnswerIndex: 3,
                explanation:
                  'Article 32 — Right to Constitutional Remedies — was called the "heart and soul" of the Constitution by Dr. Ambedkar, as it allows citizens to approach the Supreme Court directly for enforcement of Fundamental Rights.',
                subjectTopic: 'Fundamental Rights',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'Who was the first Chief Justice of independent India?',
                options: [
                  'M. Patanjali Sastri',
                  'Hiralal Kania',
                  'Sudhi Ranjan Das',
                  'B.K. Mukherjea',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Justice Harilal Kania was the first Chief Justice of India (CJI). He assumed office on 26 January 1950, the day the Supreme Court came into being.',
                subjectTopic: 'Judiciary',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
      {
        name: 'Modern Indian History',
        slug: 'upsc-modern-history',
        icon: '📜',
        description:
          'From the advent of the British (1757) to Independence (1947) — battles, acts, freedom movement, Gandhi era and constitutional developments.',
        order: 2,
        tests: [
          {
            title: 'UPSC CSE Modern History — Mini Mock',
            slug: 'upsc-cse-modern-history-mini-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'MEDIUM',
            negativeMarking: true,
            negativeMarks: 0.33,
            instructions:
              '5 questions · 2 marks each · -0.33 negative marking · 10 minutes. Aligned with UPSC CSE Prelims GS Paper I (Modern Indian History) syllabus.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question:
                  'The Battle of Plassey was fought in the year 1757 between the British East India Company and which Nawab of Bengal?',
                options: [
                  'Siraj-ud-Daulah',
                  'Mir Jafar',
                  'Mir Qasim',
                  'Shuja-ud-Daulah',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The Battle of Plassey (23 June 1757) was fought between Robert Clive (East India Company) and Nawab Siraj-ud-Daulah. The betrayal by Mir Jafar gave the British their first major foothold in India.',
                subjectTopic: 'British Conquest',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'The Revolt of 1857 began at which military station on 10 May 1857?',
                options: ['Delhi', 'Meerut', 'Lucknow', 'Kanpur'],
                correctAnswerIndex: 1,
                explanation:
                  'The 1857 Revolt began on 10 May 1857 at Meerut, when Indian sepoys of the East India Company mutinied. It soon spread across northern and central India.',
                subjectTopic: '1857 Revolt',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'The Indian National Congress was founded in 1885. Who was its first President?',
                options: [
                  'Allan Octavian Hume',
                  'Womesh Chunder Bonnerjee',
                  'Dadabhai Naoroji',
                  'Badruddin Tyabji',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The INC was founded on 28 December 1885 by A.O. Hume. W.C. Bonnerjee presided over the first session held at Gokuldas Tejpal Sanskrit College, Bombay.',
                subjectTopic: 'National Movement',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'The Partition of Bengal in 1905 was carried out by which Viceroy of India?',
                options: [
                  'Lord Curzon',
                  'Lord Minto',
                  'Lord Hardinge',
                  'Lord Ripon',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'Lord Curzon announced the partition of Bengal on 20 July 1905, taking effect on 16 October 1905. It triggered the Swadeshi Movement and was annulled in 1911.',
                subjectTopic: 'Partition of Bengal',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'The Quit India Movement was launched by Mahatma Gandhi at the Bombay session of the AICC on which date?',
                options: ['8 August 1942', '9 August 1942', '15 August 1942', '7 August 1942'],
                correctAnswerIndex: 0,
                explanation:
                  'The Quit India Resolution was passed on 8 August 1942 at the Gowalia Tank Maidan (now August Kranti Maidan), Bombay. Gandhi gave the slogan "Do or Die".',
                subjectTopic: 'Quit India Movement',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 2. SSC (Staff Selection Commission)
  // ===========================================================================
  {
    name: 'SSC',
    slug: 'ssc',
    icon: '📋',
    description:
      'Staff Selection Commission exams — CGL, CHSL, MTS, GD Constable, JE and Stenographer. Tier 1 has 4 sections: Reasoning, GA, Quant and English, 100 questions in 60 minutes.',
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
    color: '#059669',
    order: 31,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'General Intelligence & Reasoning',
        slug: 'ssc-reasoning',
        icon: '🧩',
        description:
          'Verbal and non-verbal reasoning — series, analogy, classification, coding-decoding, blood relations, syllogism and embedded figures, as asked in SSC CGL Tier 1.',
        order: 1,
        tests: [
          {
            title: 'SSC CGL Tier 1 Reasoning — Mini Mock',
            slug: 'ssc-cgl-tier-1-reasoning-mini-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 5,
            isPublished: true,
            difficulty: 'MEDIUM',
            negativeMarking: true,
            negativeMarks: 0.5,
            instructions:
              '5 questions · 2 marks each · -0.5 negative marking · 10 minutes. Modeled on the SSC CGL Tier 1 reasoning pattern (25 questions in 20 minutes).',
            year: 2025,
            examSession: 'CGL 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question:
                  'Find the next number in the series: 2, 6, 12, 20, 30, ?',
                options: ['40', '42', '44', '46'],
                correctAnswerIndex: 1,
                explanation:
                  'The differences are 4, 6, 8, 10, 12 — increasing even numbers. So 30 + 12 = 42. (Pattern: n(n+1), giving 1×2, 2×3, 3×4, 4×5, 5×6, 6×7.)',
                subjectTopic: 'Number Series',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'If in a certain code "FRIEND" is written as "GSJFOE", how will "CANDLE" be written in that code?',
                options: ['DBOEMF', 'DBOEMG', 'DCOEMF', 'DBPEMF'],
                correctAnswerIndex: 0,
                explanation:
                  'Each letter is shifted +1: F→G, R→S, I→J, E→F, N→O, D→E. Applying the same rule to CANDLE gives DBOEMF.',
                subjectTopic: 'Coding-Decoding',
                marks: 2,
                isPremium: false,
              },
              {
                question: '"Doctor" is related to "Hospital" in the same way as "Teacher" is related to —',
                options: ['Education', 'Student', 'School', 'Class'],
                correctAnswerIndex: 2,
                explanation:
                  'The relation is "professional : workplace". A doctor works in a hospital; a teacher works in a school.',
                subjectTopic: 'Analogy',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'Pointing to a man, Priya said, "He is the son of my grandfather\'s only son." How is the man related to Priya?',
                options: ['Father', 'Uncle', 'Brother', 'Cousin'],
                correctAnswerIndex: 2,
                explanation:
                  'Grandfather\'s only son = Priya\'s father. The son of Priya\'s father, referred to as "he", is Priya\'s brother.',
                subjectTopic: 'Blood Relations',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Find the odd one out: 3, 5, 11, 14, 17',
                options: ['3', '5', '14', '17'],
                correctAnswerIndex: 2,
                explanation:
                  '3, 5, 11 and 17 are prime numbers. 14 is not prime (it is divisible by 2 and 7). Hence 14 is the odd one out.',
                subjectTopic: 'Classification',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'General Awareness',
        slug: 'ssc-ga',
        icon: '🌍',
        description:
          'Static GK and current affairs — Indian polity, history, geography, economy, general science and current events of national and international importance.',
        order: 2,
        tests: [
          {
            title: 'SSC CGL GA — Mini Mock',
            slug: 'ssc-cgl-ga-mini-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 5,
            isPublished: true,
            difficulty: 'MEDIUM',
            negativeMarking: true,
            negativeMarks: 0.5,
            instructions:
              '5 questions · 2 marks each · -0.5 negative marking · 10 minutes. Modeled on the SSC CGL Tier 1 General Awareness section.',
            year: 2025,
            examSession: 'CGL 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question: 'Who was the first President of the Republic of India?',
                options: [
                  'Dr. S. Radhakrishnan',
                  'Dr. Rajendra Prasad',
                  'Dr. Zakir Husain',
                  'V.V. Giri',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Dr. Rajendra Prasad was the first President of India (1950–1962) and the only President to serve two full terms.',
                subjectTopic: 'Indian Polity',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Which is the longest river entirely within India?',
                options: ['Brahmaputra', 'Ganga', 'Godavari', 'Yamuna'],
                correctAnswerIndex: 1,
                explanation:
                  'The Ganga is the longest river in India (~2,525 km). The Indus and Brahmaputra are longer but originate outside India.',
                subjectTopic: 'Indian Geography',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Which is the highest mountain peak in India?',
                options: ['Mount K2', 'Kangchenjunga', 'Nanda Devi', ' Kamet'],
                correctAnswerIndex: 1,
                explanation:
                  'Kangchenjunga (8,586 m) is the highest peak in India and the third highest in the world. (K2 lies in Pakistan-occupied Kashmir.)',
                subjectTopic: 'Indian Geography',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Which is the largest state of India by area?',
                options: ['Madhya Pradesh', 'Uttar Pradesh', 'Rajasthan', 'Maharashtra'],
                correctAnswerIndex: 2,
                explanation:
                  'Rajasthan is the largest state in India by area (342,239 km²). It accounts for about 10.4% of the country\'s total geographical area.',
                subjectTopic: 'Indian Geography',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Which is the smallest state of India by area?',
                options: ['Sikkim', 'Goa', 'Tripura', 'Mizoram'],
                correctAnswerIndex: 1,
                explanation:
                  'Goa is the smallest state in India by area (3,702 km²). Sikkim is the second smallest.',
                subjectTopic: 'Indian Geography',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 3. BANKING
  // ===========================================================================
  {
    name: 'Banking',
    slug: 'banking',
    icon: '🏦',
    description:
      'Banking and insurance recruitment exams — IBPS PO, SBI PO, IBPS Clerk, RBI Grade B, NABARD. Common sections: Reasoning, Quant, English, GA/Financial Awareness and Computer Aptitude.',
    image:
      'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=80',
    color: '#7c3aed',
    order: 32,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'Banking Awareness',
        slug: 'banking-awareness',
        icon: '💰',
        description:
          'RBI, monetary policy, banking products, financial markets, banking history and current developments in the Indian financial system.',
        order: 1,
        tests: [
          {
            title: 'IBPS PO Banking Awareness — Mock',
            slug: 'ibps-po-banking-awareness-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 5,
            isPublished: true,
            difficulty: 'MEDIUM',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              '5 questions · 2 marks each · no negative marking · 10 minutes. Modeled on the IBPS PO Mains General/Financial Awareness section.',
            year: 2025,
            examSession: 'IBPS PO 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question:
                  'The Reserve Bank of India (RBI) was established on which date?',
                options: [
                  '1 April 1935',
                  '1 January 1949',
                  '15 August 1947',
                  '1 April 1947',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The RBI was established on 1 April 1935 under the RBI Act, 1934. It was nationalized on 1 January 1949.',
                subjectTopic: 'RBI & Banking History',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'UPI (Unified Payments Interface) was launched in India in which year?',
                options: ['2014', '2015', '2016', '2017'],
                correctAnswerIndex: 2,
                explanation:
                  'UPI was launched in April 2016 by the National Payments Corporation of India (NPCI). It has since become one of the world\'s largest real-time payment systems.',
                subjectTopic: 'Digital Banking',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'As of December 2024, who is the Governor of the Reserve Bank of India?',
                options: [
                  'Shaktikanta Das',
                  'Urjit Patel',
                  'Sanjay Malhotra',
                  'Raghuram Rajan',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'Sanjay Malhotra took charge as the 26th RBI Governor on 11 December 2024, succeeding Shaktikanta Das whose five-year term ended on 10 December 2024.',
                subjectTopic: 'Current Banking',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'What is the minimum paid-up capital required for a Small Finance Bank in India?',
                options: ['₹100 crore', '₹200 crore', '₹500 crore', '₹1000 crore'],
                correctAnswerIndex: 1,
                explanation:
                  'As per RBI guidelines, Small Finance Banks require a minimum paid-up equity capital of ₹200 crore. Payment Banks require ₹100 crore.',
                subjectTopic: 'Banking Regulation',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'How many commercial banks were nationalized in the first round of bank nationalization in 1969?',
                options: ['6', '10', '14', '20'],
                correctAnswerIndex: 2,
                explanation:
                  'On 19 July 1969, the Government of India nationalized 14 major commercial banks. A second round in 1980 nationalized 6 more banks.',
                subjectTopic: 'Banking History',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
      {
        name: 'English Language',
        slug: 'banking-english',
        icon: '📘',
        description:
          'Grammar, vocabulary, comprehension, sentence improvement, cloze test and para jumbles — aligned with SBI PO and IBPS PO Prelims/Mains English sections.',
        order: 2,
        tests: [
          {
            title: 'SBI PO English — Mock',
            slug: 'sbi-po-english-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 5,
            isPublished: true,
            difficulty: 'MEDIUM',
            negativeMarking: true,
            negativeMarks: 0.25,
            instructions:
              '5 questions · 2 marks each · -0.25 negative marking · 10 minutes. Modeled on the SBI PO Prelims English Language section.',
            year: 2025,
            examSession: 'SBI PO 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'Choose the word most nearly SAME in meaning as "ABUNDANT".',
                options: ['Scarce', 'Plentiful', 'Insufficient', 'Limited'],
                correctAnswerIndex: 1,
                explanation:
                  '"Abundant" means existing in large quantities; "plentiful" is the closest synonym. Scarce and insufficient are antonyms.',
                subjectTopic: 'Vocabulary',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Choose the word most nearly OPPOSITE in meaning to "DILIGENT".',
                options: ['Hardworking', 'Industrious', 'Lazy', 'Careful'],
                correctAnswerIndex: 2,
                explanation:
                  '"Diligent" means showing care and effort in work. Its antonym is "lazy", which denotes lack of effort.',
                subjectTopic: 'Vocabulary',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'Choose the correct preposition: "He has been working in this bank _____ 2015."',
                options: ['for', 'since', 'from', 'by'],
                correctAnswerIndex: 1,
                explanation:
                  '"Since" is used with a point of time (a year/date). "For" is used with a duration (e.g., 10 years). Hence "since 2015" is correct.',
                subjectTopic: 'Grammar',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'Identify the grammatically correct sentence.',
                options: [
                  'Neither of the two boys have passed the exam.',
                  'Neither of the two boys has passed the exam.',
                  'Neither of the two boy has passed the exam.',
                  'Neither of the two boys were passed the exam.',
                ],
                correctAnswerIndex: 1,
                explanation:
                  '"Neither of" takes a singular verb. So "Neither of the two boys has passed" is grammatically correct.',
                subjectTopic: 'Grammar',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Choose the correctly spelt word.',
                options: ['Accomodation', 'Acommodation', 'Accommodation', 'Acomodation'],
                correctAnswerIndex: 2,
                explanation:
                  'The correct spelling is "Accommodation" — with double "c" and double "m".',
                subjectTopic: 'Spelling',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 4. RAILWAY (RRB NTPC, ALP, Group D, JE)
  // ===========================================================================
  {
    name: 'Railway',
    slug: 'indian-railways',
    icon: '🚂',
    description:
      'Indian Railways recruitment — RRB NTPC, ALP, Technician, Group D, JE. Tests reasoning, mathematics, general awareness and basic science. Indian Railways is the 4th largest railway network in the world.',
    image:
      'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80',
    color: '#b91c1c',
    order: 33,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'General Awareness',
        slug: 'railway-ga',
        icon: '🛤️',
        description:
          'Indian Railways facts, Indian geography, history, polity, current affairs and static GK as asked in RRB NTPC CBT 1 and CBT 2.',
        order: 1,
        tests: [
          {
            title: 'RRB NTPC GA — Mock',
            slug: 'rrb-ntpc-ga-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 5,
            isPublished: true,
            difficulty: 'EASY',
            negativeMarking: true,
            negativeMarks: 0.33,
            instructions:
              '5 questions · 2 marks each · -0.33 negative marking · 10 minutes. Modeled on the RRB NTPC CBT 1 General Awareness section.',
            year: 2025,
            examSession: 'NTPC 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question:
                  'The first passenger train in India ran between Bombay (Bori Bunder) and Thane on which date?',
                options: [
                  '16 April 1853',
                  '16 August 1853',
                  '16 April 1857',
                  '15 August 1857',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The first passenger train in India ran on 16 April 1853, covering the 34 km distance from Bori Bunder (Bombay) to Thane. It carried 400 passengers in 14 carriages.',
                subjectTopic: 'Indian Railways History',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Which railway platform in India holds the record for being the longest in the world?',
                options: [
                  'Gorakhpur Junction',
                  'Kollam Junction',
                  'Hubballi (Sri Siddharoodha Swamiji) Station',
                  'Bilaspur Station',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'The platform at Sri Siddharoodha Swamiji Railway Station, Hubballi (Karnataka) is 1,505 m long. It became operational in February 2023 and is the longest in the world.',
                subjectTopic: 'Indian Railways Facts',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'Which is the fastest train in India, operating commercially as of 2025?',
                options: [
                  'Gatimaan Express',
                  'Rajdhani Express',
                  'Shatabdi Express',
                  'Vande Bharat Express',
                ],
                correctAnswerIndex: 3,
                explanation:
                  'Vande Bharat Express (Train 18) is India\'s fastest train, capable of reaching 180 km/h (operating at up to 160 km/h). The first service began on the Delhi–Varanasi route on 15 February 2019.',
                subjectTopic: 'Indian Railways Facts',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The Konkan Railway runs roughly along which stretch of the Indian coastline?',
                options: [
                  'Mumbai to Goa',
                  'Mangalore to Mumbai (Roha)',
                  'Chennai to Mangalore',
                  'Kolkata to Chennai',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The Konkan Railway runs 760 km between Roha (Maharashtra) and Mangalore (Karnataka) along India\'s western coast. It was fully operational from 26 January 1998.',
                subjectTopic: 'Indian Railways Facts',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Which of the following is known as the world\'s first hospital train?',
                options: [
                  'Palace on Wheels',
                  'Lifeline Express',
                  'Mahaparinirvan Express',
                  'Deccan Odyssey',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The Lifeline Express (Jeevan Rekha Express), started in 1991, is the world\'s first hospital train. It provides medical services to rural areas across India.',
                subjectTopic: 'Indian Railways Facts',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Mathematics',
        slug: 'railway-mathematics',
        icon: '➗',
        description:
          'Quantitative aptitude — number system, percentage, ratio, average, profit & loss, time & work, time-speed-distance and mensuration, as per RRB NTPC CBT 1 syllabus.',
        order: 2,
        tests: [
          {
            title: 'RRB NTPC Mathematics — Mock',
            slug: 'rrb-ntpc-mathematics-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 5,
            isPublished: true,
            difficulty: 'MEDIUM',
            negativeMarking: true,
            negativeMarks: 0.33,
            instructions:
              '5 questions · 2 marks each · -0.33 negative marking · 10 minutes. Modeled on the RRB NTPC CBT 1 Mathematics section.',
            year: 2025,
            examSession: 'NTPC 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question: 'What is 25% of 480?',
                options: ['100', '110', '120', '125'],
                correctAnswerIndex: 2,
                explanation:
                  '25% of 480 = (25/100) × 480 = 0.25 × 480 = 120. Alternatively, 25% = 1/4, so 480 ÷ 4 = 120.',
                subjectTopic: 'Percentage',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'A man buys an article for ₹500 and sells it for ₹600. What is his profit percentage?',
                options: ['10%', '15%', '20%', '25%'],
                correctAnswerIndex: 2,
                explanation:
                  'Profit = ₹600 − ₹500 = ₹100. Profit % = (Profit ÷ CP) × 100 = (100 ÷ 500) × 100 = 20%.',
                subjectTopic: 'Profit & Loss',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'If 12 men can complete a piece of work in 24 days, how many days will 18 men take to complete the same work?',
                options: ['12', '14', '16', '18'],
                correctAnswerIndex: 2,
                explanation:
                  'Work is constant, so men × days = constant. 12 × 24 = 18 × x → x = (12 × 24) ÷ 18 = 288 ÷ 18 = 16 days.',
                subjectTopic: 'Time & Work',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'What is the average of the first 10 natural numbers?',
                options: ['5.0', '5.5', '6.0', '5.25'],
                correctAnswerIndex: 1,
                explanation:
                  'First 10 natural numbers: 1, 2, 3, ..., 10. Sum = (10 × 11) ÷ 2 = 55. Average = 55 ÷ 10 = 5.5. (Average of first n natural numbers = (n + 1) / 2.)',
                subjectTopic: 'Average',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'Find the compound interest on ₹1,000 at the rate of 10% per annum for 2 years (compounded annually).',
                options: ['₹200', '₹210', '₹220', '₹100'],
                correctAnswerIndex: 1,
                explanation:
                  'A = P(1 + R/100)ⁿ = 1000 × (1.1)² = 1000 × 1.21 = ₹1,210. Compound Interest = ₹1,210 − ₹1,000 = ₹210.',
                subjectTopic: 'Compound Interest',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 5. DEFENCE (NDA, CDS, AFCAT)
  // ===========================================================================
  {
    name: 'Defence',
    slug: 'defence',
    icon: '🎖️',
    description:
      'Defence services recruitment — NDA, NA, CDS, AFCAT, TES, ACC. Conducted by UPSC (NDA/CDS) and IAF (AFCAT) for entry into the Army, Navy and Air Force.',
    image:
      'https://images.unsplash.com/photo-1542551354-86c2b3e57e75?w=800&q=80',
    color: '#4b5563',
    order: 34,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'General Knowledge',
        slug: 'defence-gk',
        icon: '🪖',
        description:
          'Static GK, current affairs, history (especially military), geography, polity and basic science as per NDA General Ability Test (Paper II).',
        order: 1,
        tests: [
          {
            title: 'NDA General Knowledge — Mock',
            slug: 'nda-general-knowledge-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 5,
            isPublished: true,
            difficulty: 'MEDIUM',
            negativeMarking: true,
            negativeMarks: 0.33,
            instructions:
              '5 questions · 2 marks each · -0.33 negative marking · 10 minutes. Modeled on the NDA General Ability Test pattern.',
            year: 2025,
            examSession: 'NDA I 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question: 'The National Defence Academy (NDA) is located at which place?',
                options: [
                  'Dehradun',
                  'Khadakwasla (Pune)',
                  'Wellington',
                  'Secunderabad',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The NDA is located at Khadakwasla, near Pune (Maharashtra). It was formally inaugurated on 7 January 1955 and is the world\'s first tri-service academy.',
                subjectTopic: 'Defence Institutions',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Who was the first recipient of the Param Vir Chakra (PVC)?',
                options: [
                  'Major Somnath Sharma',
                  'Captain Vikram Batra',
                  'Flying Officer Nirmal Jit Singh Sekhon',
                  'Second Lieutenant Arun Khetarpal',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'Major Somnath Sharma of 4 Kumaon was the first recipient of the Param Vir Chakra (posthumous) for his role in the Battle of Badgam (Kashmir) on 3 November 1947.',
                subjectTopic: 'Defence Honours',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The Indian Army was officially founded on which date?',
                options: [
                  '1 April 1895',
                  '15 August 1947',
                  '26 January 1950',
                  '8 October 1932',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The modern Indian Army traces its origin to 1 April 1895, when the British Indian Army was formally organised. Army Day is now celebrated on 15 January each year.',
                subjectTopic: 'Defence Forces',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'The Indian Air Force (IAF) was officially established on which date?',
                options: [
                  '8 October 1932',
                  '1 April 1932',
                  '15 August 1947',
                  '26 January 1950',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The Indian Air Force was officially established on 8 October 1932. IAF Day is celebrated on 8 October every year.',
                subjectTopic: 'Defence Forces',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'The Param Vir Chakra is awarded for which of the following?',
                options: [
                  'Peacetime gallantry',
                  'Acts of valour in the presence of the enemy',
                  'Distinguished service during peace',
                  'Long service and good conduct',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The Param Vir Chakra (PVC) is India\'s highest wartime gallantry award, given for "most conspicuous bravery in the presence of the enemy". The Ashoka Chakra is the equivalent peacetime gallantry award.',
                subjectTopic: 'Defence Honours',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
      {
        name: 'English & Reasoning',
        slug: 'defence-english-reasoning',
        icon: '🔤',
        description:
          'English vocabulary, grammar, comprehension and verbal reasoning — Military Aptitude Test as asked in AFCAT (Air Force Common Admission Test).',
        order: 2,
        tests: [
          {
            title: 'AFCAT English & Reasoning — Mock',
            slug: 'afcat-english-reasoning-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 5,
            isPublished: true,
            difficulty: 'MEDIUM',
            negativeMarking: true,
            negativeMarks: 1,
            instructions:
              '5 questions · 2 marks each · -1 negative marking · 10 minutes. Modeled on the AFCAT English and Military Aptitude Test sections.',
            year: 2025,
            examSession: 'AFCAT 1 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'Choose the word most nearly SAME in meaning to "VALIANT".',
                options: ['Cowardly', 'Courageous', 'Weak', 'Timid'],
                correctAnswerIndex: 1,
                explanation:
                  '"Valiant" means showing courage or determination. "Courageous" is the closest synonym.',
                subjectTopic: 'Vocabulary',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Choose the word most nearly OPPOSITE in meaning to "OBSOLETE".',
                options: ['Outdated', 'Ancient', 'Modern', 'Antique'],
                correctAnswerIndex: 2,
                explanation:
                  '"Obsolete" means no longer produced or used; out of date. Its antonym is "modern", which means current or new.',
                subjectTopic: 'Vocabulary',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'Complete the series: 1, 4, 9, 16, 25, ?',
                options: ['30', '35', '36', '49'],
                correctAnswerIndex: 2,
                explanation:
                  'The series is of perfect squares: 1², 2², 3², 4², 5², 6². Hence the next term is 36.',
                subjectTopic: 'Reasoning',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'Pen is to Write as Knife is to —',
                options: ['Sharp', 'Cut', 'Blade', 'Kitchen'],
                correctAnswerIndex: 1,
                explanation:
                  'The relation is "tool : primary function". A pen is used to write; a knife is used to cut.',
                subjectTopic: 'Reasoning',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'Choose the correctly spelt word.',
                options: ['Embarrasment', 'Embarassment', 'Embarrassment', 'Embaressment'],
                correctAnswerIndex: 2,
                explanation:
                  'The correct spelling is "Embarrassment" — double "r" and double "s".',
                subjectTopic: 'Spelling',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 6. TEACHING (CTET, TETs, DSSSB, KVS)
  // ===========================================================================
  {
    name: 'Teaching',
    slug: 'teaching',
    icon: '👨‍🏫',
    description:
      'Teacher eligibility tests — CTET, State TETs, KVS, NVS, DSSSB. Conducted by CBSE (CTET) twice a year. Paper I for classes I–V, Paper II for classes VI–VIII. CTET is now valid for lifetime.',
    image:
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
    color: '#0891b2',
    order: 35,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'Child Development & Pedagogy',
        slug: 'teaching-cdp',
        icon: '🧒',
        description:
          'Theories of Piaget, Vygotsky, Kohlberg, Bruner; learning theories; concepts of child-centred education; inclusive education and the RTE Act.',
        order: 1,
        tests: [
          {
            title: 'CTET Paper I CDP — Mock',
            slug: 'ctet-paper-i-cdp-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 6,
            isPublished: true,
            difficulty: 'MEDIUM',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              '5 questions · 2 marks each · no negative marking · 10 minutes. Modeled on the CTET Paper I Child Development & Pedagogy section (30 questions in 30 minutes).',
            year: 2025,
            examSession: 'CTET July 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question:
                  'According to Jean Piaget, which stage of cognitive development covers the age group of 0 to 2 years?',
                options: [
                  'Sensorimotor Stage',
                  'Preoperational Stage',
                  'Concrete Operational Stage',
                  'Formal Operational Stage',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'Piaget\'s four stages: Sensorimotor (0–2 years), Preoperational (2–7), Concrete Operational (7–11) and Formal Operational (11+). In the Sensorimotor stage, infants learn through senses and motor actions.',
                subjectTopic: 'Piaget\'s Theory',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'The concept of "Zone of Proximal Development (ZPD)" was propounded by which psychologist?',
                options: [
                  'Jean Piaget',
                  'Lev Vygotsky',
                  'Lawrence Kohlberg',
                  'B.F. Skinner',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Lev Vygotsky introduced the concept of ZPD — the gap between what a learner can do independently and what they can do with guidance. It underpins the idea of "scaffolding" in teaching.',
                subjectTopic: 'Vygotsky\'s Theory',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'The original Bloom\'s Taxonomy of Educational Objectives was published in which year?',
                options: ['1949', '1956', '1964', '1971'],
                correctAnswerIndex: 1,
                explanation:
                  'Benjamin Bloom and his team published the original Taxonomy in 1956, focusing on the cognitive domain (Knowledge, Comprehension, Application, Analysis, Synthesis, Evaluation). It was revised in 2001 by Anderson and Krathwohl.',
                subjectTopic: 'Bloom\'s Taxonomy',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The Right of Children to Free and Compulsory Education (RTE) Act was enacted in which year?',
                options: ['2005', '2009', '2010', '2012'],
                correctAnswerIndex: 1,
                explanation:
                  'The RTE Act was passed by Parliament in 2009 and came into force on 1 April 2010. It gives effect to Article 21A of the Constitution, making education a fundamental right for children aged 6 to 14.',
                subjectTopic: 'Education Acts',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'As per the 2021 amendment, the validity of the CTET qualifying certificate is —',
                options: ['7 years', '10 years', 'Lifetime', '5 years'],
                correctAnswerIndex: 2,
                explanation:
                  'Earlier the CTET certificate was valid for 7 years from the date of declaration of result. In 2021, the Ministry of Education extended the validity to lifetime with retrospective effect from 2011.',
                subjectTopic: 'CTET',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
      {
        name: 'Environmental Studies',
        slug: 'teaching-evs',
        icon: '🌱',
        description:
          'EVS at primary level — family and friends, food, shelter, water, travel, things we make and do; pedagogy of EVS and conceptual understanding of nature and environment.',
        order: 2,
        tests: [
          {
            title: 'CTET EVS — Mock',
            slug: 'ctet-evs-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 6,
            isPublished: true,
            difficulty: 'EASY',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              '5 questions · 2 marks each · no negative marking · 10 minutes. Modeled on the CTET Paper I Environmental Studies section.',
            year: 2025,
            examSession: 'CTET July 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question:
                  'The primary objective of teaching EVS at the primary level as per NCF 2005 is to —',
                options: [
                  'Memorise names of plants and animals',
                  'Nurture curiosity and concern about the environment',
                  'Train children as future biologists',
                  'Score high marks in exams',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'NCF 2005 emphasises that EVS at the primary stage should help children nurture curiosity about their surroundings and develop concern for environmental issues, rather than rote memorisation.',
                subjectTopic: 'EVS Pedagogy',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'The process by which green plants prepare their own food using sunlight, water and carbon dioxide is called —',
                options: [
                  'Respiration',
                  'Transpiration',
                  'Photosynthesis',
                  'Translocation',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'Photosynthesis is the process by which green plants use chlorophyll, sunlight, water (H₂O) and carbon dioxide (CO₂) to produce glucose and release oxygen. It occurs mainly in the leaves.',
                subjectTopic: 'Plants',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Which of the following is a renewable source of energy?',
                options: ['Coal', 'Petroleum', 'Solar Energy', 'Natural Gas'],
                correctAnswerIndex: 2,
                explanation:
                  'Solar energy is renewable — it can be replenished naturally in a short period of time. Coal, petroleum and natural gas are non-renewable fossil fuels that take millions of years to form.',
                subjectTopic: 'Energy & Resources',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'Which of the following processes is responsible for the formation of clouds?',
                options: ['Condensation', 'Evaporation', 'Precipitation', 'Infiltration'],
                correctAnswerIndex: 0,
                explanation:
                  'Clouds are formed by condensation — when water vapour in the air cools and turns into tiny water droplets around dust particles. Evaporation precedes condensation in the water cycle.',
                subjectTopic: 'Water Cycle',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Which of the following is the major cause of air pollution in Indian cities?',
                options: [
                  'Planting trees',
                  'Vehicular emissions',
                  'Use of solar panels',
                  'Rainwater harvesting',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Vehicular emissions — release of CO, NOₓ, PM2.5 and other pollutants — are a major cause of air pollution in Indian cities like Delhi. Other causes include industrial emissions, stubble burning and construction dust.',
                subjectTopic: 'Pollution',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 7. LIC / INSURANCE
  // ===========================================================================
  {
    name: 'LIC/Insurance',
    slug: 'lic',
    icon: '🛡️',
    description:
      'Insurance sector recruitment — LIC AAO, ADO, Assistant; GIC; UIIC; NIACL Assistant and AO. Tests reasoning, quant, English, GA and insurance awareness.',
    image:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    color: '#0d9488',
    order: 36,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'Insurance Awareness',
        slug: 'insurance-awareness',
        icon: '🛡️',
        description:
          'History of insurance in India, LIC, GIC, IRDAI, types of insurance (life, general, health), insurance products, FDI in insurance and recent developments.',
        order: 1,
        tests: [
          {
            title: 'LIC AAO Insurance Awareness — Mock',
            slug: 'lic-aao-insurance-awareness-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 5,
            isPublished: true,
            difficulty: 'MEDIUM',
            negativeMarking: true,
            negativeMarks: 0.25,
            instructions:
              '5 questions · 2 marks each · -0.25 negative marking · 10 minutes. Modeled on the LIC AAO Mains Insurance & Financial Market Awareness section.',
            year: 2025,
            examSession: 'LIC AAO 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question: 'The Life Insurance Corporation of India (LIC) was established on which date?',
                options: [
                  '1 January 1956',
                  '1 September 1956',
                  '19 July 1969',
                  '1 April 1935',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'LIC was established on 1 September 1956 under the LIC Act, 1956, after the Government of India nationalised 245 private life insurance companies and provident societies.',
                subjectTopic: 'Insurance History',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'The Insurance Regulatory and Development Authority of India (IRDAI) was established in which year?',
                options: ['1996', '1999', '2000', '2002'],
                correctAnswerIndex: 1,
                explanation:
                  'IRDAI was constituted in 1999 following the IRDA Act, 1999. Its headquarters are in Hyderabad. It regulates and develops the insurance industry in India.',
                subjectTopic: 'Insurance Regulation',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'Where are the headquarters of the Insurance Regulatory and Development Authority of India (IRDAI)?',
                options: ['New Delhi', 'Mumbai', 'Hyderabad', 'Bengaluru'],
                correctAnswerIndex: 2,
                explanation:
                  'IRDAI is headquartered at Hyderabad (Telangana). It was shifted from New Delhi to Hyderabad in 2001.',
                subjectTopic: 'Insurance Regulation',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'The FDI limit in the insurance sector was raised from 49% to 74% in which year?',
                options: ['2015', '2019', '2021', '2023'],
                correctAnswerIndex: 2,
                explanation:
                  'The Government of India raised the FDI limit in the insurance sector from 49% to 74% through the Finance Act, 2021, effective from the financial year 2021-22.',
                subjectTopic: 'Insurance Sector',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The Initial Public Offering (IPO) of LIC was launched in which year?',
                options: ['2020', '2021', '2022', '2023'],
                correctAnswerIndex: 2,
                explanation:
                  'LIC\'s IPO was launched in May 2022. It was the largest IPO in Indian capital market history, raising around ₹21,000 crore through an issue size of 3.5% stake.',
                subjectTopic: 'Insurance Sector',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
      {
        name: 'Quantitative Aptitude',
        slug: 'insurance-quant',
        icon: '🔢',
        description:
          'Quantitative aptitude — simplification, number series, percentage, ratio, average, profit & loss, time & work, mensuration and data interpretation, aligned with LIC ADO/AAO Prelims.',
        order: 2,
        tests: [
          {
            title: 'LIC ADO Quant — Mock',
            slug: 'lic-ado-quant-mock',
            type: 'MOCK',
            duration: 10,
            totalMarks: 10,
            passingMarks: 5,
            isPublished: true,
            difficulty: 'MEDIUM',
            negativeMarking: true,
            negativeMarks: 0.25,
            instructions:
              '5 questions · 2 marks each · -0.25 negative marking · 10 minutes. Modeled on the LIC ADO Prelims Numerical Ability section.',
            year: 2025,
            examSession: 'LIC ADO 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'The average of 5 consecutive even numbers is 18. What is the largest of these numbers?',
                options: ['18', '20', '22', '24'],
                correctAnswerIndex: 2,
                explanation:
                  'Let the numbers be x, x+2, x+4, x+6, x+8. Average = x + 4 = 18 → x = 14. Largest number = x + 8 = 14 + 8 = 22.',
                subjectTopic: 'Average',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'If the ratio of the ages of A and B is 5 : 3 and the sum of their ages is 48 years, what is B\'s age?',
                options: ['12 years', '15 years', '18 years', '20 years'],
                correctAnswerIndex: 2,
                explanation:
                  'Let the ages be 5x and 3x. Then 5x + 3x = 8x = 48 → x = 6. B\'s age = 3x = 18 years.',
                subjectTopic: 'Ratio & Proportion',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'A candidate scores 25% marks and fails by 30 marks, while another candidate who scores 50% marks gets 20 marks more than the passing marks. What is the maximum marks?',
                options: ['100', '150', '200', '250'],
                correctAnswerIndex: 2,
                explanation:
                  'Let maximum marks be M. Passing marks = 25% of M + 30 = 50% of M − 20. So 0.25M + 30 = 0.50M − 20 → 50 = 0.25M → M = 200.',
                subjectTopic: 'Percentage',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'If the cost price of 10 articles is equal to the selling price of 8 articles, what is the profit or loss percentage?',
                options: ['20% profit', '25% profit', '20% loss', '25% loss'],
                correctAnswerIndex: 1,
                explanation:
                  'Let CP of 1 article = ₹1. Then CP of 10 = ₹10 and SP of 8 = ₹10 → SP of 1 = ₹1.25. Profit % = (0.25 ÷ 1) × 100 = 25%.',
                subjectTopic: 'Profit & Loss',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'A train running at 72 km/h crosses a pole in 15 seconds. What is the length of the train?',
                options: ['200 m', '250 m', '300 m', '350 m'],
                correctAnswerIndex: 2,
                explanation:
                  'Speed = 72 km/h = 72 × (5/18) = 20 m/s. Length = Speed × Time = 20 × 15 = 300 m.',
                subjectTopic: 'Time, Speed & Distance',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
    ],
  },
];
