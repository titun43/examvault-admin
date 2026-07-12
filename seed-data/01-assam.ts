// Assam categories — part 1 of seed data
// Generated for ExamVault v2 — 100% real data

export const ASSAM_CATEGORIES: SeedCategory[] = [
  // ===========================================================================
  // 1. APSC CCE (Assam Public Service Commission - Combined Competitive Exam)
  // ===========================================================================
  {
    name: 'APSC CCE',
    slug: 'assam-apsc',
    icon: '🏛️',
    description:
      'Assam Public Service Commission Combined Competitive Examination — Prelims & Mains preparation covering General Studies, Assam History, Polity and Culture.',
    image:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80',
    color: '#0d9488',
    order: 10,
    isPremium: true,
    premiumPrice: 499,
    premiumDurationMonths: 6,
    subjects: [
      {
        name: 'General Studies-I',
        slug: 'apsc-gs-1',
        icon: '📘',
        description:
          'Indian Polity, History and Geography syllabus as per APSC CCE Prelims GS-I paper.',
        order: 1,
        tests: [
          {
            title: 'APSC CCE Prelims GS-I — Mini Mock',
            slug: 'apsc-cce-prelims-gs-1-mini-mock',
            type: 'mock',
            duration: 30,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'hard',
            negativeMarking: true,
            negativeMarks: 0.25,
            instructions:
              'This mini mock contains 5 questions on Indian Polity, History and Geography. Each question carries 1 mark. 0.25 marks will be deducted for every wrong answer. Total time: 30 minutes.',
            year: 2025,
            examSession: 'Prelims',
            isPremium: true,
            price: 49,
            questions: [
              {
                question:
                  'Article 17 of the Indian Constitution deals with which of the following?',
                options: [
                  'Abolition of untouchability',
                  'Right to equality before law',
                  'Right to freedom of speech',
                  'Right to constitutional remedies',
                ],
                correctAnswerIndex: 0,
                explanation:
                  "Article 17 abolishes 'untouchability' and forbids its practice in any form. The enforcement of any disability arising out of untouchability is an offence punishable by law.",
                subjectTopic: 'Indian Polity',
                marks: 1,
                isPremium: true,
              },
              {
                question: 'The Battle of Plassey was fought in which year?',
                options: ['1757', '1761', '1764', '1857'],
                correctAnswerIndex: 0,
                explanation:
                  'The Battle of Plassey was fought on 23 June 1757 between the British East India Company under Robert Clive and Siraj-ud-Daula, the Nawab of Bengal. It marked the beginning of British political rule in India.',
                subjectTopic: 'Indian History',
                marks: 1,
                isPremium: true,
              },
              {
                question: 'Which is the longest river in India?',
                options: ['Godavari', 'Yamuna', 'Ganga', 'Brahmaputra'],
                correctAnswerIndex: 2,
                explanation:
                  'The Ganga is the longest river in India with a length of approximately 2,525 km. It originates from the Gangotri Glacier in Uttarakhand and flows through several states before emptying into the Bay of Bengal.',
                subjectTopic: 'Indian Geography',
                marks: 1,
                isPremium: true,
              },
              {
                question: 'Who was the first President of India?',
                options: [
                  'Dr. S. Radhakrishnan',
                  'Dr. Rajendra Prasad',
                  'C. Rajagopalachari',
                  'Jawaharlal Nehru',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Dr. Rajendra Prasad served as the first President of India from 1950 to 1962. He was elected by the Constituent Assembly in 1950 and re-elected in 1952 and 1957.',
                subjectTopic: 'Indian Polity',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'The Directive Principles of State Policy are enshrined in which Part of the Indian Constitution?',
                options: ['Part III', 'Part IV', 'Part V', 'Part IVA'],
                correctAnswerIndex: 1,
                explanation:
                  'The Directive Principles of State Policy (DPSP) are contained in Part IV (Articles 36–51) of the Indian Constitution. They are guidelines for the government to establish social and economic democracy.',
                subjectTopic: 'Indian Polity',
                marks: 1,
                isPremium: true,
              },
            ],
          },
        ],
      },
      {
        name: 'Assam History & Culture',
        slug: 'apsc-assam-history-culture',
        icon: '🪕',
        description:
          'History of Assam from the Ahom kingdom to modern times, Bihu, Sattras, Sankardev and Assamese literature.',
        order: 2,
        tests: [
          {
            title: 'APSC Assam History & Culture — Mini Mock',
            slug: 'apsc-assam-history-culture-mini-mock',
            type: 'mock',
            duration: 30,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: true,
            negativeMarks: 0.25,
            instructions:
              'This mock test covers Assam history, culture, festivals, literature and important personalities. 5 questions × 1 mark. Negative marking: 0.25 per wrong answer.',
            year: 2025,
            examSession: 'Mains',
            isPremium: true,
            price: 49,
            questions: [
              {
                question:
                  'Srimanta Sankardev was a 15th-16th century saint who propagated which religious movement in Assam?',
                options: [
                  'Shaivism',
                  'Neo-Vaishnavite movement',
                  'Tantrism',
                  'Buddhism',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Srimanta Sankardev (1449–1568) was the principal saint-reformer of the Neo-Vaishnavite (Ekasarana Dharma) movement in Assam. He preached devotion to a single God (Krishna) and established Sattras (monasteries).',
                subjectTopic: 'Assam History',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'Which was the first Assamese newspaper and in which year was it first published?',
                options: [
                  'Orunodoi, 1846',
                  'Jonaki, 1889',
                  'Asam Bandhu, 1885',
                  'Asamiya, 1918',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'Orunodoi was the first Assamese newspaper/journal, first published in January 1846 from Sibsagar by the American Baptist Missionary Press. It played a crucial role in the Assamese language renaissance.',
                subjectTopic: 'Assam Literature',
                marks: 1,
                isPremium: true,
              },
              {
                question: 'Who was the first Chief Minister of Assam?',
                options: [
                  'Bishnuram Medhi',
                  'Gopinath Bordoloi',
                  'Sarat Chandra Sinha',
                  'Bimala Prasad Chaliha',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Gopinath Bordoloi was the first Chief Minister of Assam (1946–1950). He played a pivotal role in securing Assam’s place in India during Partition and was awarded the Bharat Ratna posthumously in 1999.',
                subjectTopic: 'Assam History',
                marks: 1,
                isPremium: true,
              },
              {
                question: 'Which was the first Assamese film and who directed it?',
                options: [
                  'Piyoli Phukan, Phani Sarma',
                  'Joymoti, Jyotiprasad Agarwala',
                  'Puberun, Bhupen Hazarika',
                  'Maa, Bhabendra Nath Saikia',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Joymoti (1935), directed by Jyotiprasad Agarwala, was the first Assamese film. Jyotiprasad Agarwala is regarded as the father of Assamese cinema and was also a playwright, composer and freedom fighter.',
                subjectTopic: 'Assam Culture',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'Which of the following is the Assamese New Year festival celebrated in mid-April?',
                options: [
                  'Kongali Bihu',
                  'Bhogali Bihu',
                  'Rongali Bihu',
                  'Me-Dam-Me-Phi',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'Rongali Bihu (Bohag Bihu) is celebrated in mid-April, marking the Assamese New Year and the arrival of spring. The other two Bihus are Kongali Bihu (Kati, October) and Bhogali Bihu (Magh, January — the harvest festival).',
                subjectTopic: 'Assam Culture',
                marks: 1,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 2. ADRE Grade III (Assam Direct Recruitment Examination)
  // ===========================================================================
  {
    name: 'ADRE Grade III',
    slug: 'assam-adre-grade-3',
    icon: '📋',
    description:
      'Assam Direct Recruitment Examination Grade III — recruitment for various state government departments covering Graduate/HSSLC level posts.',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    color: '#059669',
    order: 11,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'General Awareness',
        slug: 'adre-grade-3-general-awareness',
        icon: '🌍',
        description:
          'General awareness including Assam state symbols, geography, current affairs and Indian polity.',
        order: 1,
        tests: [
          {
            title: 'ADRE Grade III General Awareness — Mock',
            slug: 'adre-grade-3-general-awareness-mock',
            type: 'mock',
            duration: 30,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: true,
            negativeMarks: 0.25,
            instructions:
              'Mock test for ADRE Grade III General Awareness section. 5 questions × 1 mark. Negative marking: 0.25 per wrong answer. Time: 30 minutes.',
            year: 2025,
            examSession: 'Recruitment',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'What is the capital of Assam?',
                options: ['Dibrugarh', 'Guwahati', 'Dispur', 'Tezpur'],
                correctAnswerIndex: 2,
                explanation:
                  'Dispur, a locality in Guwahati, is the capital of Assam. It became the state capital in 1973 after Shillong became the capital of the newly formed state of Meghalaya in 1972.',
                subjectTopic: 'Assam Geography',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'Which of the following is the state flower of Assam?',
                options: [
                  'Rhododendron',
                  'Foxtail orchid (Kopou Phul)',
                  'Lotus',
                  'Shiuli (Night-flowering Jasmine)',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The Foxtail Orchid (Rhynchostylis retusa), locally known as Kopou Phul, is the state flower of Assam. It is extensively used by Assamese women to decorate their hair during Rongali Bihu.',
                subjectTopic: 'Assam State Symbols',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'Kaziranga National Park in Assam is most famous for which of the following?',
                options: [
                  'Asiatic lion',
                  'Bengal tiger only',
                  'One-horned rhinoceros',
                  'Snow leopard',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'Kaziranga National Park, a UNESCO World Heritage Site in Assam, hosts the world’s largest population of the Indian one-horned rhinoceros. It was also declared a Tiger Reserve in 2006.',
                subjectTopic: 'Assam Geography',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'Which is the world’s largest river island, located in Assam?',
                options: ['Umananda', 'Majuli', 'Pateshwari', 'Peacock Island'],
                correctAnswerIndex: 1,
                explanation:
                  'Majuli, located in the Brahmaputra river in Assam, is recognised as the world’s largest river island. It became India’s first island district in 2016 and is a major hub of Vaishnavite Sattra culture.',
                subjectTopic: 'Assam Geography',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'Where was the first oil well drilled in Asia?',
                options: [
                  'Bombay High',
                  'Digboi, Assam',
                  'Ankleshwar, Gujarat',
                  'Nahorkatiya, Assam',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Digboi, in the Tinsukia district of Assam, is where the first commercial oil well in Asia was drilled in 1889. The Digboi refinery, commissioned in 1901, is the oldest continuously operating oil refinery in India.',
                subjectTopic: 'Assam Economy',
                marks: 1,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Quantitative Aptitude & Reasoning',
        slug: 'adre-grade-3-quant-reasoning',
        icon: '🔢',
        description:
          'Quantitative aptitude and logical reasoning — profit/loss, interest, time & work, ratio, series, and analytical reasoning.',
        order: 2,
        tests: [
          {
            title: 'ADRE Grade III Quant & Reasoning — Mock',
            slug: 'adre-grade-3-quant-reasoning-mock',
            type: 'mock',
            duration: 30,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: true,
            negativeMarks: 0.25,
            instructions:
              'Mock test for ADRE Grade III Quantitative Aptitude & Reasoning. 5 questions × 1 mark. Negative marking: 0.25 per wrong answer. Time: 30 minutes. Show working on rough sheet.',
            year: 2025,
            examSession: 'Recruitment',
            isPremium: true,
            price: 49,
            questions: [
              {
                question:
                  'A shopkeeper buys an article for ₹500 and sells it at a profit of 20%. What is the selling price?',
                options: ['₹550', '₹600', '₹625', '₹700'],
                correctAnswerIndex: 1,
                explanation:
                  'Cost price = ₹500. Profit = 20% of ₹500 = ₹100. Selling Price = Cost Price + Profit = 500 + 100 = ₹600.',
                subjectTopic: 'Profit & Loss',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'Find the simple interest on ₹2,000 at 5% per annum for 3 years.',
                options: ['₹200', '₹250', '₹300', '₹350'],
                correctAnswerIndex: 2,
                explanation:
                  'Simple Interest = (Principal × Rate × Time) / 100 = (2000 × 5 × 3) / 100 = ₹300.',
                subjectTopic: 'Simple Interest',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'A can do a piece of work in 10 days and B in 15 days. Working together, how many days will they take to complete the work?',
                options: ['5 days', '6 days', '8 days', '12 days'],
                correctAnswerIndex: 1,
                explanation:
                  "A's 1-day work = 1/10, B's 1-day work = 1/15. Combined 1-day work = 1/10 + 1/15 = (3+2)/30 = 5/30 = 1/6. So, together they complete the work in 6 days.",
                subjectTopic: 'Time & Work',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'The ratio of two numbers is 3:5 and their sum is 64. Find the smaller number.',
                options: ['18', '24', '30', '40'],
                correctAnswerIndex: 1,
                explanation:
                  'Let the numbers be 3x and 5x. Sum = 3x + 5x = 8x = 64, so x = 8. Smaller number = 3x = 3 × 8 = 24.',
                subjectTopic: 'Ratio & Proportion',
                marks: 1,
                isPremium: true,
              },
              {
                question: 'What is 25% of 480?',
                options: ['100', '110', '120', '130'],
                correctAnswerIndex: 2,
                explanation:
                  '25% of 480 = (25/100) × 480 = 0.25 × 480 = 120. Alternatively, 25% = 1/4, so 1/4 of 480 = 120.',
                subjectTopic: 'Percentage',
                marks: 1,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 3. ADRE Grade IV (Class VIII level)
  // ===========================================================================
  {
    name: 'ADRE Grade IV',
    slug: 'assam-adre-grade-4',
    icon: '📝',
    description:
      'Assam Direct Recruitment Examination Grade IV — Class VIII level recruitment for Class III/IV posts in various state government departments.',
    image:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
    color: '#16a34a',
    order: 12,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'General Awareness (Class VIII level)',
        slug: 'adre-grade-4-general-awareness',
        icon: '🌱',
        description:
          'Class VIII level general awareness covering Assam state symbols, geography, rivers and national parks.',
        order: 1,
        tests: [
          {
            title: 'ADRE Grade IV General Awareness — Mock',
            slug: 'adre-grade-4-general-awareness-mock',
            type: 'mock',
            duration: 25,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'easy',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Mock test for ADRE Grade IV General Awareness (Class VIII level). 5 questions × 1 mark. No negative marking. Time: 25 minutes.',
            year: 2025,
            examSession: 'Recruitment',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'What is the state animal of Assam?',
                options: [
                  'One-horned rhinoceros',
                  'Asian elephant',
                  'Hoolock gibbon',
                  'Royal Bengal tiger',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The Indian one-horned rhinoceros (Rhinoceros unicornis) is the state animal of Assam. Kaziranga National Park hosts the majority of the world’s population of this species.',
                subjectTopic: 'Assam State Symbols',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'The Brahmaputra river is known by which name in Tibet?',
                options: ['Padma', 'Jamuna', 'Tsangpo', 'Meghna'],
                correctAnswerIndex: 2,
                explanation:
                  'The Brahmaputra is known as Yarlung Tsangpo in Tibet, where it originates near Mount Kailash. In India it is called Brahmaputra, and in Bangladesh it is called Jamuna before merging with the Padma.',
                subjectTopic: 'Brahmaputra',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'Which is the largest city in Assam?',
                options: ['Dibrugarh', 'Silchar', 'Guwahati', 'Jorhat'],
                correctAnswerIndex: 2,
                explanation:
                  'Guwahati is the largest city in Assam and the major metropolis of Northeast India. It is also known as the "Gateway to North East India" and houses the state capital Dispur.',
                subjectTopic: 'Assam Geography',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'Assam is globally renowned for the production of which of the following?',
                options: ['Coffee', 'Tea', 'Rubber', 'Coconut'],
                correctAnswerIndex: 1,
                explanation:
                  'Assam is the world’s largest tea-growing region, producing over 50% of India’s tea. The tea industry in Assam began in the 1830s, and the region is famous for its strong, malty black tea.',
                subjectTopic: 'Assam Economy',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'Which is the major river flowing through Assam?',
                options: ['Ganga', 'Brahmaputra', 'Godavari', 'Krishna'],
                correctAnswerIndex: 1,
                explanation:
                  'The Brahmaputra is the major river of Assam, flowing east to west through the state’s heartland. It is one of the longest rivers in the world and is known for its massive braided channel.',
                subjectTopic: 'Brahmaputra',
                marks: 1,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'English & Maths (Class VIII level)',
        slug: 'adre-grade-4-english-maths',
        icon: '📚',
        description:
          'Class VIII level English grammar and basic mathematics including fractions, LCM, average and vocabulary.',
        order: 2,
        tests: [
          {
            title: 'ADRE Grade IV English & Maths — Mock',
            slug: 'adre-grade-4-english-maths-mock',
            type: 'mock',
            duration: 25,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'easy',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Mock test for ADRE Grade IV English & Mathematics (Class VIII level). 5 questions × 1 mark. No negative marking. Time: 25 minutes.',
            year: 2025,
            examSession: 'Recruitment',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: "Choose the antonym of 'Ancient'.",
                options: ['Old', 'Modern', 'Vintage', 'Historic'],
                correctAnswerIndex: 1,
                explanation:
                  "'Ancient' refers to something very old, belonging to the distant past. The antonym is 'Modern', which means relating to the present or recent times.",
                subjectTopic: 'English Vocabulary',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  "Choose the correct verb form: 'He ___ to school every day.'",
                options: ['go', 'goes', 'going', 'gone'],
                correctAnswerIndex: 1,
                explanation:
                  "In the present simple tense, third person singular subjects (he, she, it) take the verb with an -s/-es ending. Therefore, 'He goes to school every day' is correct.",
                subjectTopic: 'English Grammar',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'Find the LCM of 6 and 8.',
                options: ['12', '16', '24', '48'],
                correctAnswerIndex: 2,
                explanation:
                  'Multiples of 6: 6, 12, 18, 24, 30, ... Multiples of 8: 8, 16, 24, 32, ... The smallest common multiple is 24. Therefore, LCM(6, 8) = 24.',
                subjectTopic: 'LCM & HCF',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'Find the average of 10, 20, 30, 40 and 50.',
                options: ['25', '30', '35', '40'],
                correctAnswerIndex: 1,
                explanation:
                  'Average = Sum of all numbers ÷ Number of numbers. Sum = 10+20+30+40+50 = 150. Number of terms = 5. Average = 150 ÷ 5 = 30.',
                subjectTopic: 'Average',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'What is 1/2 + 1/4?',
                options: ['1/6', '2/6', '3/4', '1/8'],
                correctAnswerIndex: 2,
                explanation:
                  'To add fractions, find a common denominator. LCM of 2 and 4 is 4. So, 1/2 = 2/4, and 2/4 + 1/4 = 3/4.',
                subjectTopic: 'Fractions',
                marks: 1,
                isPremium: false,
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 4. Assam Police (SI & Constable)
  // ===========================================================================
  {
    name: 'Assam Police',
    slug: 'assam-police',
    icon: '👮',
    description:
      'Assam Police recruitment for Sub-Inspector (SI) and Constable posts — written examination covering GK, reasoning and quantitative aptitude.',
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
    color: '#dc2626',
    order: 13,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'General Knowledge & Current Affairs',
        slug: 'assam-police-gk-current-affairs',
        icon: '📰',
        description:
          'Assam-specific and national general knowledge, current affairs, polity and history relevant for Assam Police SI exam.',
        order: 1,
        tests: [
          {
            title: 'Assam Police SI Written Exam — Mock',
            slug: 'assam-police-si-written-exam-mock',
            type: 'mock',
            duration: 25,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: true,
            negativeMarks: 0.25,
            instructions:
              'Mock test for Assam Police Sub-Inspector Written Exam. 5 questions × 1 mark. Negative marking: 0.25 per wrong answer. Time: 25 minutes.',
            year: 2025,
            examSession: 'Recruitment',
            isPremium: true,
            price: 49,
            questions: [
              {
                question: 'The Assam Accord was signed in which year?',
                options: ['1979', '1985', '1990', '2005'],
                correctAnswerIndex: 1,
                explanation:
                  'The Assam Accord was signed on 15 August 1985 between the Government of India, the Government of Assam and the leaders of the Assam Movement (AASU). It ended the six-year anti-foreigner agitation.',
                subjectTopic: 'Assam History',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'Who is the Chief Minister of Assam as of 2025?',
                options: [
                  'Sarbananda Sonowal',
                  'Himanta Biswa Sarma',
                  'Tarun Gogoi',
                  'Prafulla Kumar Mahanta',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Dr. Himanta Biswa Sarma became the 15th Chief Minister of Assam on 10 May 2021, succeeding Sarbananda Sonowal. He continues to serve as the Chief Minister as of 2025.',
                subjectTopic: 'Assam Current Affairs',
                marks: 1,
                isPremium: true,
              },
              {
                question: 'Which is the state bird of Assam?',
                options: [
                  'Great Hornbill',
                  'White-winged wood duck',
                  'Indian peacock',
                  'Black-necked crane',
                ],
                correctAnswerIndex: 1,
                explanation:
                  "The White-winged Wood Duck (Asarcornis scutulata), locally known as 'Deo Hans', is the state bird of Assam. It is an endangered species found primarily in the tropical forests of Assam and parts of Southeast Asia.",
                subjectTopic: 'Assam State Symbols',
                marks: 1,
                isPremium: true,
              },
              {
                question: 'Who is the Governor of Assam as of 2025?',
                options: [
                  'Gulab Chand Kataria',
                  'Lakshman Prasad Acharya',
                  'Jagdish Mukhi',
                  'Banwarilal Purohit',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Lakshman Prasad Acharya became the Governor of Assam (with additional charge of Manipur) in July 2024, succeeding Gulab Chand Kataria. He continues to serve as the Governor of Assam as of 2025.',
                subjectTopic: 'Assam Current Affairs',
                marks: 1,
                isPremium: true,
              },
              {
                question: 'How many Lok Sabha seats are there in Assam?',
                options: ['12', '14', '16', '18'],
                correctAnswerIndex: 1,
                explanation:
                  'Assam has 14 Lok Sabha (Parliamentary) constituencies. These include seats reserved for Scheduled Tribes (Autonomous, Diphu, Kokrajhar) and one for Scheduled Castes (Karimganj).',
                subjectTopic: 'Indian Polity',
                marks: 1,
                isPremium: true,
              },
            ],
          },
        ],
      },
      {
        name: 'Reasoning & Quantitative Aptitude',
        slug: 'assam-police-reasoning-quant',
        icon: '🧩',
        description:
          'Logical reasoning, series, coding-decoding, direction sense and quantitative aptitude for Assam Police Constable exam.',
        order: 2,
        tests: [
          {
            title: 'Assam Police Constable Written Exam — Mock',
            slug: 'assam-police-constable-written-exam-mock',
            type: 'mock',
            duration: 25,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: true,
            negativeMarks: 0.25,
            instructions:
              'Mock test for Assam Police Constable Written Exam. 5 questions × 1 mark. Negative marking: 0.25 per wrong answer. Time: 25 minutes.',
            year: 2025,
            examSession: 'Recruitment',
            isPremium: false,
            price: 0,
            questions: [
              {
                question:
                  'Find the next number in the series: 2, 6, 12, 20, 30, ?',
                options: ['40', '42', '44', '46'],
                correctAnswerIndex: 1,
                explanation:
                  'The pattern is +4, +6, +8, +10, +12. So, 30 + 12 = 42. Alternatively, the series is 1×2, 2×3, 3×4, 4×5, 5×6, 6×7 = 42.',
                subjectTopic: 'Number Series',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'The average of 5 consecutive numbers is 12. What is the largest number?',
                options: ['12', '13', '14', '15'],
                correctAnswerIndex: 2,
                explanation:
                  'For 5 consecutive numbers with average 12, the numbers are 10, 11, 12, 13, 14. The middle (3rd) number equals the average = 12. So the largest is 14.',
                subjectTopic: 'Average',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'Find the compound interest on ₹1,000 at 10% per annum for 2 years.',
                options: ['₹200', '₹210', '₹220', '₹230'],
                correctAnswerIndex: 1,
                explanation:
                  'Amount A = P(1+R/100)^n = 1000 × (1+10/100)² = 1000 × (1.1)² = 1000 × 1.21 = ₹1,210. Compound Interest = A − P = 1,210 − 1,000 = ₹210.',
                subjectTopic: 'Compound Interest',
                marks: 1,
                isPremium: false,
              },
              {
                question: "If 'CAT' is coded as '24', then how will 'DOG' be coded?",
                options: ['22', '24', '26', '28'],
                correctAnswerIndex: 2,
                explanation:
                  "The code is the sum of the alphabetical positions of each letter. CAT = C(3) + A(1) + T(20) = 24. Similarly, DOG = D(4) + O(15) + G(7) = 26.",
                subjectTopic: 'Coding-Decoding',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'A man walks 3 km north, then turns right and walks 4 km. How far is he from the starting point?',
                options: ['5 km', '7 km', '1 km', '12 km'],
                correctAnswerIndex: 0,
                explanation:
                  'The man walks 3 km north and then 4 km east (after a right turn). These form two sides of a right triangle. Distance from start = √(3² + 4²) = √(9+16) = √25 = 5 km.',
                subjectTopic: 'Direction Sense',
                marks: 1,
                isPremium: false,
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 5. Assam TET (Teachers' Eligibility Test)
  // ===========================================================================
  {
    name: 'Assam TET',
    slug: 'assam-tet',
    icon: '👨‍🏫',
    description:
      'Assam Teachers’ Eligibility Test (TET) for Lower Primary (LP) and Upper Primary (UP) levels, conducted by the Axom Sarba Shiksha Abhiyan Mission.',
    image:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    color: '#7c3aed',
    order: 14,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'Child Development & Pedagogy',
        slug: 'assam-tet-cdp',
        icon: '🧠',
        description:
          'Theories of child development (Piaget, Vygotsky, Gardner), learning theories, motivation and inclusive education for LP TET.',
        order: 1,
        tests: [
          {
            title: 'Assam TET LP Child Development & Pedagogy — Mock',
            slug: 'assam-tet-lp-cdp-mock',
            type: 'mock',
            duration: 25,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Mock test for Assam TET (LP) Child Development & Pedagogy. 5 questions × 1 mark. No negative marking. Time: 25 minutes. Pass mark for TET: 60% (this mock pass mark is 40%).',
            year: 2025,
            examSession: 'TET',
            isPremium: false,
            price: 0,
            questions: [
              {
                question:
                  'According to Jean Piaget, the stage of cognitive development in children aged 7-11 years is called:',
                options: [
                  'Sensorimotor stage',
                  'Preoperational stage',
                  'Concrete operational stage',
                  'Formal operational stage',
                ],
                correctAnswerIndex: 2,
                explanation:
                  "According to Piaget, children aged 7-11 years are in the 'Concrete Operational Stage'. During this stage, children develop logical thinking about concrete events and understand concepts like conservation, classification and reversibility.",
                subjectTopic: 'Piaget’s Stages',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'Which concept, introduced by Vygotsky, refers to the difference between what a learner can do independently and what they can do with guidance?',
                options: [
                  'Critical period',
                  'Zone of Proximal Development',
                  'Scaffolding only',
                  'Multiple intelligences',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Lev Vygotsky introduced the concept of Zone of Proximal Development (ZPD), which is the distance between what a learner can achieve independently and what they can achieve with guidance from a more knowledgeable person.',
                subjectTopic: 'Vygotsky’s Theory',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'Inclusive education primarily means:',
                options: [
                  'Separate schools for children with disabilities',
                  'Education of all children together in the same classroom regardless of differences',
                  'Only children from similar backgrounds studying together',
                  'Private tutoring for slow learners',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Inclusive education is an approach where all students, regardless of their physical, intellectual, social, emotional or linguistic differences, learn together in the same classroom with appropriate support. It opposes segregation in education.',
                subjectTopic: 'Inclusive Education',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'Which theory proposes multiple types of intelligence, including linguistic, logical-mathematical and musical?',
                options: [
                  "Spearman's two-factor theory",
                  "Gardner's Theory of Multiple Intelligences",
                  "Sternberg's Triarchic theory",
                  "Thurstone's Primary Mental Abilities",
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Howard Gardner proposed the Theory of Multiple Intelligences in 1983, identifying distinct types of intelligence such as linguistic, logical-mathematical, spatial, musical, bodily-kinesthetic, interpersonal, intrapersonal and naturalistic.',
                subjectTopic: 'Theories of Intelligence',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'Which of the following is an example of intrinsic motivation?',
                options: [
                  'Studying to get a reward',
                  'Studying to avoid punishment',
                  'Studying because of curiosity and interest in the subject',
                  'Studying to please parents',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'Intrinsic motivation comes from within the individual — driven by personal interest, curiosity or enjoyment in the task itself. The other options reflect extrinsic motivation where behaviour is driven by external rewards or pressures.',
                subjectTopic: 'Motivation',
                marks: 1,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Environmental Science (EVS)',
        slug: 'assam-tet-evs',
        icon: '🌿',
        description:
          'Environmental Science for LP TET — Assam biodiversity, national parks, pollution, conservation and renewable energy.',
        order: 2,
        tests: [
          {
            title: 'Assam TET LP Environmental Science — Mock',
            slug: 'assam-tet-lp-evs-mock',
            type: 'mock',
            duration: 25,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'easy',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Mock test for Assam TET (LP) Environmental Science (EVS). 5 questions × 1 mark. No negative marking. Time: 25 minutes.',
            year: 2025,
            examSession: 'TET',
            isPremium: true,
            price: 49,
            questions: [
              {
                question:
                  'Which National Park in Assam is also a Tiger Reserve and a UNESCO World Heritage Site?',
                options: [
                  'Orang National Park',
                  'Manas National Park',
                  'Dibru-Saikhowa National Park',
                  'Nameri National Park',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Manas National Park, located in western Assam, is a UNESCO World Heritage Site, a Tiger Reserve, an Elephant Reserve and a Biosphere Reserve. It is known for rare species like the Assam roofed turtle and the golden langur.',
                subjectTopic: 'Assam Biodiversity',
                marks: 1,
                isPremium: true,
              },
              {
                question: 'Which gas is the main cause of global warming?',
                options: [
                  'Oxygen',
                  'Nitrogen',
                  'Carbon dioxide',
                  'Hydrogen',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'Carbon dioxide (CO₂) is the primary greenhouse gas responsible for global warming. Excessive CO₂ emissions from burning fossil fuels, deforestation and industrial activities trap heat in the atmosphere, leading to climate change.',
                subjectTopic: 'Environmental Pollution',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'Which of the following is the major agricultural crop of Assam?',
                options: ['Wheat', 'Rice', 'Maize', 'Bajra'],
                correctAnswerIndex: 1,
                explanation:
                  'Rice is the staple food and the most important agricultural crop of Assam. The state cultivates a wide variety of rice including Sali, Ahu and Bao rice, suited to different agro-climatic conditions.',
                subjectTopic: 'Assam Agriculture',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'Which of the following is a renewable source of energy?',
                options: [
                  'Coal',
                  'Petroleum',
                  'Solar energy',
                  'Natural gas',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'Solar energy is a renewable source of energy as it comes from the sun, which is continuously available. Coal, petroleum and natural gas are non-renewable fossil fuels formed over millions of years and are finite in supply.',
                subjectTopic: 'Renewable Energy',
                marks: 1,
                isPremium: true,
              },
              {
                question: 'Project Tiger was launched in India in which year?',
                options: ['1972', '1973', '1975', '1980'],
                correctAnswerIndex: 1,
                explanation:
                  'Project Tiger was launched on 1 April 1973 by the Government of India to protect Bengal tigers from extinction. The first nine tiger reserves included Manas in Assam, along with Corbett, Kanha, Melghat, Palamau, Ranthambore, Similipal and Sundarbans.',
                subjectTopic: 'Wildlife Conservation',
                marks: 1,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 6. SEBA HSLC (Class X Board Exam)
  // ===========================================================================
  {
    name: 'SEBA HSLC',
    slug: 'assam-seba-hslc',
    icon: '🎓',
    description:
      'Board of Secondary Education, Assam (SEBA) High School Leaving Certificate (HSLC) examination — Class X board exam practice.',
    image:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    color: '#ea580c',
    order: 15,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'General Mathematics',
        slug: 'seba-hslc-mathematics',
        icon: '📐',
        description:
          'Class X Mathematics — algebra, geometry, trigonometry, statistics and quadratic equations as per SEBA HSLC syllabus.',
        order: 1,
        tests: [
          {
            title: 'SEBA HSLC Mathematics — Practice Mock',
            slug: 'seba-hslc-mathematics-practice-mock',
            type: 'practice',
            duration: 30,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Practice mock test for SEBA HSLC Mathematics. 5 questions × 1 mark. No negative marking. Time: 30 minutes. Show all working clearly.',
            year: 2025,
            examSession: 'Annual',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'Find the roots of the equation x² − 5x + 6 = 0.',
                options: [
                  'x = 2, x = 3',
                  'x = −2, x = −3',
                  'x = 1, x = 6',
                  'x = −1, x = −6',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'x² − 5x + 6 = 0 can be factored as (x − 2)(x − 3) = 0. Therefore, x = 2 or x = 3. Verification: 2² − 5(2) + 6 = 4 − 10 + 6 = 0; 3² − 5(3) + 6 = 9 − 15 + 6 = 0. Both roots satisfy the equation.',
                subjectTopic: 'Quadratic Equations',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'The sum of all interior angles of a triangle is:',
                options: ['90°', '180°', '270°', '360°'],
                correctAnswerIndex: 1,
                explanation:
                  'According to the Angle Sum Property of a triangle, the sum of all three interior angles is always 180°. This is a fundamental result in Euclidean geometry.',
                subjectTopic: 'Geometry',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'If 2x + 3 = 11, find the value of x.',
                options: ['2', '3', '4', '5'],
                correctAnswerIndex: 2,
                explanation:
                  '2x + 3 = 11 → 2x = 11 − 3 = 8 → x = 8 ÷ 2 = 4. Verification: 2(4) + 3 = 8 + 3 = 11 ✓.',
                subjectTopic: 'Linear Equations',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'The value of sin 30° is:',
                options: ['0', '1/2', '√3/2', '1'],
                correctAnswerIndex: 1,
                explanation:
                  'sin 30° = 1/2 = 0.5. This is one of the standard trigonometric values. In a right triangle with a 30° angle, the ratio of the side opposite to the angle to the hypotenuse equals 1/2.',
                subjectTopic: 'Trigonometry',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'Find the mean of the following numbers: 4, 6, 8, 10, 12.',
                options: ['6', '7', '8', '10'],
                correctAnswerIndex: 2,
                explanation:
                  'Mean = Sum of all values ÷ Number of values. Sum = 4+6+8+10+12 = 40. Number of values = 5. Mean = 40 ÷ 5 = 8.',
                subjectTopic: 'Statistics',
                marks: 1,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'General Science',
        slug: 'seba-hslc-general-science',
        icon: '⚗️',
        description:
          'Class X General Science — physics, chemistry and biology as per SEBA HSLC syllabus.',
        order: 2,
        tests: [
          {
            title: 'SEBA HSLC General Science — Practice Mock',
            slug: 'seba-hslc-general-science-practice-mock',
            type: 'practice',
            duration: 30,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Practice mock test for SEBA HSLC General Science. 5 questions × 1 mark. No negative marking. Time: 30 minutes.',
            year: 2025,
            examSession: 'Annual',
            isPremium: false,
            price: 0,
            questions: [
              {
                question:
                  'Which pigment is responsible for photosynthesis in plants?',
                options: [
                  'Hemoglobin',
                  'Melanin',
                  'Chlorophyll',
                  'Carotene',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'Chlorophyll is the green pigment found in the chloroplasts of plants, responsible for absorbing sunlight and converting it into chemical energy through photosynthesis. It primarily absorbs red and blue light, reflecting green light, which gives plants their green colour.',
                subjectTopic: 'Photosynthesis',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'Which is the largest organ in the human body?',
                options: ['Heart', 'Liver', 'Skin', 'Brain'],
                correctAnswerIndex: 2,
                explanation:
                  'The skin is the largest organ of the human body, with an average surface area of about 1.5–2 square metres in adults. It serves as a protective barrier against pathogens, regulates body temperature and contains sensory receptors.',
                subjectTopic: 'Human Body',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'The pH value of a neutral solution is:',
                options: ['0', '7', '14', '1'],
                correctAnswerIndex: 1,
                explanation:
                  'On the pH scale (0–14), a value of 7 indicates a neutral solution, like pure water. Values below 7 indicate acidic solutions, while values above 7 indicate basic (alkaline) solutions.',
                subjectTopic: 'Acids, Bases & pH',
                marks: 1,
                isPremium: false,
              },
              {
                question: 'Which is the SI unit of electric current?',
                options: ['Volt', 'Watt', 'Ampere', 'Ohm'],
                correctAnswerIndex: 2,
                explanation:
                  'The Ampere (symbol: A) is the SI unit of electric current, named after the French physicist André-Marie Ampère. One ampere is defined as the flow of one coulomb of electric charge per second.',
                subjectTopic: 'Physics — Units',
                marks: 1,
                isPremium: false,
              },
              {
                question: "Which gas is called 'laughing gas'?",
                options: [
                  'Nitrogen dioxide',
                  'Nitrous oxide',
                  'Nitric oxide',
                  'Nitrogen',
                ],
                correctAnswerIndex: 1,
                explanation:
                  "Nitrous oxide (N₂O) is commonly known as 'laughing gas' due to the euphoric effect it produces when inhaled. It is used as an anaesthetic and analgesic in medicine, particularly in dentistry and surgery.",
                subjectTopic: 'Chemistry — Gases',
                marks: 1,
                isPremium: false,
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 7. DME/PNRD Assam (Panchayat & Rural Development / Directorate of Medical Education)
  // ===========================================================================
  {
    name: 'DME/PNRD Assam',
    slug: 'assam-dme-pnrd',
    icon: '🏥',
    description:
      'Directorate of Medical Education (DME) and Panchayat & Rural Development (PNRD) Assam recruitment exams — Jr Assistant, GA, computer and rural development topics.',
    image:
      'https://images.unsplash.com/photo-1576091160550-2187d80a18f3?w=800&q=80',
    color: '#0891b2',
    order: 16,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'General Knowledge (Panchayat & Rural Development)',
        slug: 'pnrd-assam-general-knowledge',
        icon: '🏡',
        description:
          'Panchayati Raj system, MGNREGA, rural development schemes and Assam-specific rural governance topics.',
        order: 1,
        tests: [
          {
            title: 'PNRD Assam GA — Mock',
            slug: 'pnrd-assam-ga-mock',
            type: 'mock',
            duration: 25,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: true,
            negativeMarks: 0.25,
            instructions:
              'Mock test for PNRD Assam General Awareness (Panchayat & Rural Development). 5 questions × 1 mark. Negative marking: 0.25 per wrong answer. Time: 25 minutes.',
            year: 2025,
            examSession: 'Recruitment',
            isPremium: true,
            price: 49,
            questions: [
              {
                question:
                  'The Panchayati Raj system in India was constitutionally recognised by which Amendment?',
                options: [
                  '42nd Amendment',
                  '73rd Amendment',
                  '74th Amendment',
                  '86th Amendment',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The 73rd Constitutional Amendment Act, 1992 gave constitutional status to the Panchayati Raj system in rural India. It added Part IX (Articles 243 to 243-O) and the 11th Schedule to the Constitution.',
                subjectTopic: 'Panchayati Raj',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'How many tiers are there in the Panchayati Raj system in India?',
                options: ['1', '2', '3', '4'],
                correctAnswerIndex: 2,
                explanation:
                  'The Panchayati Raj system in India has three tiers: Gram Panchayat (village level), Panchayat Samiti (block level) and Zilla Parishad (district level). However, states with a population below 20 lakh may have only two tiers.',
                subjectTopic: 'Panchayati Raj',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'The Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) was enacted in which year?',
                options: ['2005', '2009', '2010', '2014'],
                correctAnswerIndex: 0,
                explanation:
                  'MGNREGA was enacted on 7 September 2005. It guarantees 100 days of wage employment per year to every rural household whose adult members volunteer to do unskilled manual work. It is the largest social security scheme in the world.',
                subjectTopic: 'Rural Development Schemes',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'In Assam, the Gaon Panchayat corresponds to which level of Panchayati Raj?',
                options: [
                  'District level',
                  'Block level',
                  'Village level',
                  'State level',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'In Assam, the Gaon Panchayat is the village-level tier of the Panchayati Raj system, equivalent to the Gram Panchayat. The three-tier system in Assam consists of Gaon Panchayat, Anchalik Panchayat (block) and Zilla Parishad (district).',
                subjectTopic: 'Assam Panchayat',
                marks: 1,
                isPremium: true,
              },
              {
                question:
                  'Which scheme is the flagship programme for rural housing in India?',
                options: [
                  'PMAY-G (Pradhan Mantri Awas Yojana – Gramin)',
                  'Swachh Bharat Mission',
                  'National Rural Health Mission',
                  'Mid-Day Meal Scheme',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'Pradhan Mantri Awas Yojana – Gramin (PMAY-G), earlier called Indira Awaas Yojana, is the flagship rural housing scheme of the Government of India. Launched in 2016, it aims to provide pucca houses with basic amenities to all homeless households and those living in kutcha houses.',
                subjectTopic: 'Rural Development Schemes',
                marks: 1,
                isPremium: true,
              },
            ],
          },
        ],
      },
      {
        name: 'Reasoning & Computer Knowledge',
        slug: 'dme-assam-reasoning-computer',
        icon: '💻',
        description:
          'Computer fundamentals, MS Office, internet basics and logical reasoning for DME Assam Jr Assistant recruitment.',
        order: 2,
        tests: [
          {
            title: 'DME Assam Jr Assistant — Mock',
            slug: 'dme-assam-jr-assistant-mock',
            type: 'mock',
            duration: 25,
            totalMarks: 5,
            passingMarks: 2,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: true,
            negativeMarks: 0.25,
            instructions:
              'Mock test for DME Assam Junior Assistant recruitment — Reasoning & Computer Knowledge. 5 questions × 1 mark. Negative marking: 0.25 per wrong answer. Time: 25 minutes.',
            year: 2025,
            examSession: 'Recruitment',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'Which of the following is the brain of the computer?',
                options: ['RAM', 'Hard disk', 'CPU', 'Monitor'],
                correctAnswerIndex: 2,
                explanation:
                  "The Central Processing Unit (CPU) is often called the 'brain' of the computer. It performs arithmetic, logical and input/output operations, and controls the functioning of all other components of the computer.",
                subjectTopic: 'Computer Basics',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'Which keyboard shortcut is used to copy selected text in MS Windows?',
                options: ['Ctrl + V', 'Ctrl + X', 'Ctrl + C', 'Ctrl + Z'],
                correctAnswerIndex: 2,
                explanation:
                  'In Microsoft Windows and most applications, Ctrl + C is used to copy the selected text or item. The copied content is stored in the clipboard and can be pasted using Ctrl + V.',
                subjectTopic: 'MS Office Shortcuts',
                marks: 1,
                isPremium: false,
              },
              {
                question: "What does 'WWW' stand for?",
                options: [
                  'World Wide Web',
                  'World Web Wide',
                  'Wide World Web',
                  'Web World Wide',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'WWW stands for "World Wide Web", commonly known as the Web. It is an information system where documents and other web resources are identified by URLs, interlinked by hypertext and accessible over the Internet. It was invented by Tim Berners-Lee in 1989.',
                subjectTopic: 'Internet Basics',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  'Find the odd one out: 3, 5, 7, 9, 11',
                options: ['3', '5', '7', '9'],
                correctAnswerIndex: 3,
                explanation:
                  'The numbers 3, 5, 7 and 11 are all prime numbers, while 9 is not prime (9 = 3 × 3). Therefore, 9 is the odd one out.',
                subjectTopic: 'Odd One Out',
                marks: 1,
                isPremium: false,
              },
              {
                question:
                  "'Book' is to 'Author' as 'Movie' is to:",
                options: ['Actor', 'Director', 'Producer', 'Singer'],
                correctAnswerIndex: 1,
                explanation:
                  'The relationship is creator-to-creation. A book is created by an author, similarly a movie is created (directed) by a director. The director is the primary creative force behind a movie, just as the author is for a book.',
                subjectTopic: 'Analogy',
                marks: 1,
                isPremium: false,
              },
            ],
          },
        ],
      },
    ],
  },
];
