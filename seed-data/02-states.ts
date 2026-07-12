// Other State PSCs — part 2 of seed data
// Generated for ExamVault v2 — 100% real data

export const STATE_PSC_CATEGORIES: SeedCategory[] = [
  // =============================================================================
  // 1. WBCS — West Bengal Civil Service
  // =============================================================================
  {
    name: 'WBCS',
    slug: 'wbcs',
    icon: '🏛️',
    description:
      'West Bengal Civil Service (WBCS) examination conducted by the West Bengal Public Service Commission (WBPSC). Covers Indian history, polity, West Bengal geography, economy and culture.',
    image:
      'https://images.unsplash.com/photo-1598618356795-6ba7a8d83f3b?auto=format&fit=crop&w=800&q=70',
    color: '#b45309',
    order: 20,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'Indian History & Polity',
        slug: 'wbcs-history-polity',
        icon: '📜',
        description:
          'Indian National Movement, constitutional framework, governance and political history — aligned with the WBCS Prelims syllabus.',
        order: 1,
        tests: [
          {
            title: 'WBCS Prelims History & Polity — Mock',
            slug: 'wbcs-prelims-history-polity-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Attempt all 5 questions. Each question carries 2 marks. No negative marking. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question:
                  'Who was elected as the permanent President of the Constituent Assembly of India on 11 December 1946?',
                options: [
                  'Dr. Sachidanand Sinha',
                  'Dr. Rajendra Prasad',
                  'Dr. B.R. Ambedkar',
                  'Jawaharlal Nehru',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Dr. Rajendra Prasad was elected as the permanent President of the Constituent Assembly on 11 December 1946. Dr. Sachidanand Sinha served only as the interim president on the first day.',
                subjectTopic: 'Constitutional History',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'The Permanent Settlement (Zamindari system) of Bengal was introduced by which Governor-General?',
                options: [
                  'Lord Dalhousie',
                  'Lord William Bentinck',
                  'Lord Cornwallis',
                  'Lord Curzon',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'The Permanent Settlement of Bengal was introduced by Lord Cornwallis in 1793, fixing the land revenue to be paid by zamindars to the East India Company in perpetuity.',
                subjectTopic: 'Modern Indian History',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The Quit India Movement was launched by Mahatma Gandhi in which year?',
                options: ['1940', '1942', '1945', '1947'],
                correctAnswerIndex: 1,
                explanation:
                  'The Quit India Movement was launched on 8 August 1942 at the Bombay session of the All India Congress Committee, demanding an end to British colonial rule in India.',
                subjectTopic: 'Indian National Movement',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'Which Article of the Indian Constitution deals with the Right to Constitutional Remedies?',
                options: ['Article 14', 'Article 19', 'Article 21', 'Article 32'],
                correctAnswerIndex: 3,
                explanation:
                  'Article 32, called the "heart and soul" of the Constitution by Dr. B.R. Ambedkar, empowers citizens to directly approach the Supreme Court for enforcement of fundamental rights.',
                subjectTopic: 'Indian Polity',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The Battle of Plassey (1757) was fought between the British and which Nawab of Bengal?',
                options: [
                  'Siraj-ud-Daula',
                  'Mir Qasim',
                  'Shah Alam II',
                  'Hyder Ali',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The Battle of Plassey was fought on 23 June 1757 between the British East India Company under Robert Clive and Nawab Siraj-ud-Daula of Bengal, marking the beginning of British political rule in India.',
                subjectTopic: 'Modern Indian History',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'West Bengal Geography & Economy',
        slug: 'wbcs-geography-economy',
        icon: '🗺️',
        description:
          'Physical and economic geography of West Bengal, including the Sundarbans, Hooghly river system, cultural landmarks and the state economy.',
        order: 2,
        tests: [
          {
            title: 'WBCS WB Geography & Economy — Mock',
            slug: 'wbcs-geography-economy-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'hard',
            negativeMarking: true,
            negativeMarks: 0.5,
            instructions:
              'Attempt all 5 questions. Each correct answer = 2 marks, each wrong answer = -0.5 marks. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question:
                  'The Sundarbans, the world\u2019s largest mangrove forest and a UNESCO World Heritage Site, lies in the delta of which rivers?',
                options: [
                  'Ganga and Brahmaputra',
                  'Ganga and Yamuna',
                  'Mahanadi and Godavari',
                  'Krishna and Kaveri',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The Sundarbans is located in the delta of the Ganga and Brahmaputra rivers, shared between India (West Bengal) and Bangladesh. It was inscribed as a UNESCO World Heritage Site in 1987 and is home to the Bengal tiger.',
                subjectTopic: 'Physical Geography',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The Hooghly River, on which Kolkata is situated, is a distributary of which major river?',
                options: ['Brahmaputra', 'Ganga', 'Damodar', 'Teesta'],
                correctAnswerIndex: 1,
                explanation:
                  'The Hooghly is a distributary of the Ganga that flows south through West Bengal before emptying into the Bay of Bengal. Kolkata, the state capital, lies on its eastern bank.',
                subjectTopic: 'Rivers of West Bengal',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The Victoria Memorial in Kolkata was conceived by which Viceroy in 1906?',
                options: [
                  'Lord Curzon',
                  'Lord Ripon',
                  'Lord Dalhousie',
                  'Lord Minto',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The Victoria Memorial was conceived by Lord Curzon in 1906 to commemorate Queen Victoria. The foundation stone was laid in 1906 and the monument was opened to the public in 1921.',
                subjectTopic: 'Cultural Landmarks',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'Rabindranath Tagore received the Nobel Prize in Literature in 1913 primarily for which work?',
                options: ['Gora', 'Gitanjali', 'The Home and the World', 'The Post Office'],
                correctAnswerIndex: 1,
                explanation:
                  'Rabindranath Tagore became the first non-European to win the Nobel Prize in Literature in 1913 for his collection of poems "Gitanjali" (Song Offerings), translated into English by himself.',
                subjectTopic: 'Bengali Literature',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'Durga Puja in Kolkata was inscribed on the UNESCO Representative List of Intangible Cultural Heritage of Humanity in which year?',
                options: ['2019', '2020', '2021', '2022'],
                correctAnswerIndex: 2,
                explanation:
                  'Durga Puja in Kolkata was added to UNESCO\u2019s Representative List of the Intangible Cultural Heritage of Humanity in December 2021, recognising it as a ten-day celebration of the goddess Durga.',
                subjectTopic: 'Festivals & Culture',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // =============================================================================
  // 2. UPPSC PCS — Uttar Pradesh Public Service Commission
  // =============================================================================
  {
    name: 'UPPSC PCS',
    slug: 'uppsc',
    icon: '🏛️',
    description:
      'Uttar Pradesh Public Service Commission Provincial Civil Services (UPPSC PCS) examination. Covers Indian polity, governance, and the rich history and culture of Uttar Pradesh.',
    image:
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=70',
    color: '#c2410c',
    order: 21,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'Indian Polity & Governance',
        slug: 'uppsc-polity-governance',
        icon: '⚖️',
        description:
          'Indian Constitution, three-tier governance, panchayati raj and federal structure — aligned with the UPPSC PCS Prelims syllabus.',
        order: 1,
        tests: [
          {
            title: 'UPPSC PCS Prelims Polity — Mock',
            slug: 'uppsc-prelims-polity-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: true,
            negativeMarks: 0.5,
            instructions:
              'Attempt all 5 questions. Each correct answer = 2 marks, each wrong = -0.5 marks. Unattempted = 0. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question:
                  'The 73rd Constitutional Amendment Act, 1992 gave constitutional status to which institutions?',
                options: [
                  'Panchayati Raj Institutions',
                  'Municipalities',
                  'Fundamental Rights',
                  'Anti-defection law',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The 73rd Constitutional Amendment Act, 1992 gave constitutional status to Panchayati Raj Institutions by adding Part IX and Articles 243 to 243-O to the Constitution, with provisions for direct elections, reservations and State Election Commissions.',
                subjectTopic: 'Local Self Government',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'How many members are nominated by the President to the Rajya Sabha?',
                options: ['10', '12', '14', '15'],
                correctAnswerIndex: 1,
                explanation:
                  'Under Article 80 of the Constitution, the President nominates 12 members to the Rajya Sabha from persons with special knowledge or practical experience in literature, science, art, and social service.',
                subjectTopic: 'Parliament',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The Council of Ministers at the Centre is collectively responsible to which body?',
                options: [
                  'The President',
                  'The Prime Minister',
                  'The Lok Sabha',
                  'The Parliament',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'Article 75(3) of the Constitution provides that the Council of Ministers shall be collectively responsible to the Lok Sabha, the lower house of Parliament.',
                subjectTopic: 'Union Executive',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'Fundamental Duties were added to the Indian Constitution by which amendment?',
                options: [
                  '42nd Amendment',
                  '44th Amendment',
                  '73rd Amendment',
                  '86th Amendment',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The 42nd Constitutional Amendment Act, 1976 added Part IV-A and Article 51-A containing 10 Fundamental Duties on the recommendation of the Swaran Singh Committee. The 86th Amendment (2002) later added the duty regarding education of children.',
                subjectTopic: 'Constitutional Amendments',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'How many Lok Sabha constituencies are there in Uttar Pradesh?',
                options: ['70', '80', '85', '90'],
                correctAnswerIndex: 1,
                explanation:
                  'Uttar Pradesh has 80 Lok Sabha constituencies, making it the state with the highest representation in the lower house of the Indian Parliament.',
                subjectTopic: 'Elections',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'UP History & Culture',
        slug: 'uppsc-up-history-culture',
        icon: '🕌',
        description:
          'Mughal heritage, religious sites, freedom movement legacy and cultural landmarks of Uttar Pradesh.',
        order: 2,
        tests: [
          {
            title: 'UPPSC UP History & Culture — Mock',
            slug: 'uppsc-up-history-culture-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Attempt all 5 questions. Each question carries 2 marks. No negative marking. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question: 'The Taj Mahal at Agra was completed in which year?',
                options: ['1632', '1648', '1658', '1668'],
                correctAnswerIndex: 1,
                explanation:
                  'The Taj Mahal was commissioned by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal. Construction began in 1632 and the mausoleum was substantially completed in 1648. It is a UNESCO World Heritage Site since 1983.',
                subjectTopic: 'Mughal Architecture',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The Kumbh Mela in Uttar Pradesh is held at which city at the Triveni Sangam?',
                options: ['Varanasi', 'Mathura', 'Prayagraj', 'Ayodhya'],
                correctAnswerIndex: 2,
                explanation:
                  'The Kumbh Mela at Prayagraj (formerly Allahabad) is held at the Triveni Sangam \u2014 the confluence of the Ganga, Yamuna and the mythical Saraswati rivers. It is the largest peaceful gathering on Earth and a UNESCO Intangible Cultural Heritage since 2017.',
                subjectTopic: 'Religious Geography',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Who was the first Chief Minister of Uttar Pradesh?',
                options: [
                  'Govind Ballabh Pant',
                  'Sampurnanand',
                  'Charan Singh',
                  'Sucheta Kripalani',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'Govind Ballabh Pant became the first Chief Minister of Uttar Pradesh (then United Provinces) on 1 April 1946 and continued in office after India\u2019s independence in 1947.',
                subjectTopic: 'Post-Independence UP',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'Varanasi, one of the oldest continuously inhabited cities in the world, is situated on the banks of which river?',
                options: ['Yamuna', 'Ganga', 'Saraswati', 'Gandak'],
                correctAnswerIndex: 1,
                explanation:
                  'Varanasi (also known as Kashi or Banaras) is situated on the left bank of the Ganga in southeastern Uttar Pradesh. It is among the world\u2019s oldest continuously inhabited cities and a major religious hub for Hindus.',
                subjectTopic: 'Ancient Cities',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The Ram Janmabhoomi Temple at Ayodhya is dedicated to which deity?',
                options: [
                  'Lord Krishna',
                  'Lord Rama',
                  'Lord Shiva',
                  'Lord Vishnu',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The Ram Janmabhoomi Temple in Ayodhya, Uttar Pradesh, is dedicated to Lord Rama and is built at the site believed to be his birthplace. The pran pratishtha (consecration) was performed on 22 January 2024.',
                subjectTopic: 'Religious Sites',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // =============================================================================
  // 3. RPSC RAS — Rajasthan Administrative Service
  // =============================================================================
  {
    name: 'RPSC RAS',
    slug: 'rpsc-ras',
    icon: '🏛️',
    description:
      'Rajasthan Public Service Commission Rajasthan Administrative Service (RPSC RAS) examination. Covers Indian history and art along with the unique history, art and culture of Rajasthan.',
    image:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=70',
    color: '#b91c1c',
    order: 22,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'Indian History & Art',
        slug: 'rpsc-history-art',
        icon: '🎨',
        description:
          'Ancient, medieval and modern Indian history, classical art and major art movements — aligned with the RPSC RAS Prelims syllabus.',
        order: 1,
        tests: [
          {
            title: 'RPSC RAS Prelims History — Mock',
            slug: 'rpsc-prelims-history-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: true,
            negativeMarks: 0.5,
            instructions:
              'Attempt all 5 questions. Each correct = 2 marks, wrong = -0.5 marks. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'The Indus Valley Civilisation\u2019s dockyard was discovered at which site?',
                options: ['Harappa', 'Mohenjo-daro', 'Lothal', 'Kalibangan'],
                correctAnswerIndex: 2,
                explanation:
                  'Lothal, located in present-day Gujarat, was the port city of the Indus Valley Civilisation (c. 2400 BCE). It houses one of the world\u2019s earliest known dockyards connecting the city to the Sabarmati river trade route.',
                subjectTopic: 'Ancient India',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'The Mughal Empire in India was founded by Babur after winning which battle in 1526?',
                options: [
                  'Battle of Khanwa',
                  'First Battle of Panipat',
                  'Battle of Ghaghra',
                  'Battle of Chanderi',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Babur defeated Ibrahim Lodi at the First Battle of Panipat on 21 April 1526, marking the beginning of the Mughal Empire in India. The battle is famous for Babur\u2019s use of gunpowder and artillery.',
                subjectTopic: 'Medieval India',
                marks: 2,
                isPremium: false,
              },
              {
                question:
                  'The Ajanta Caves, a UNESCO World Heritage Site, primarily feature artwork related to which religion?',
                options: ['Hinduism', 'Buddhism', 'Jainism', 'Sikhism'],
                correctAnswerIndex: 1,
                explanation:
                  'The Ajanta Caves in Maharashtra (2nd century BCE to 6th century CE) are renowned for their Buddhist paintings, sculptures and frescoes depicting Jataka tales. They were inscribed as a UNESCO World Heritage Site in 1983.',
                subjectTopic: 'Indian Art',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The iconic painting "Bharat Mata" was created by which Indian artist?',
                options: [
                  'Raja Ravi Varma',
                  'Abanindranath Tagore',
                  'Nandalal Bose',
                  'Jamini Roy',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Bharat Mata, painted by Abanindranath Tagore in 1905 during the Swadeshi movement, depicts a saffron-clad woman resembling a sadhvi holding a book, sheaves of paddy, a piece of white cloth and a garland \u2014 symbolising learning, plenty, unity and purity.',
                subjectTopic: 'Modern Indian Art',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The Quit India Resolution was passed at which session of the Indian National Congress?',
                options: [
                  'Lahore Session 1929',
                  'Karachi Session 1931',
                  'Bombay Session 1942',
                  'Tripuri Session 1939',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'The Quit India Resolution was passed at the Bombay session of the All India Congress Committee on 8 August 1942, with Mahatma Gandhi giving the "Do or Die" slogan.',
                subjectTopic: 'Indian National Movement',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Rajasthan History, Art & Culture',
        slug: 'rpsc-rajasthan-culture',
        icon: '🏰',
        description:
          'Rajput dynasties, forts and palaces, folk dances, desert geography and cultural traditions of Rajasthan.',
        order: 2,
        tests: [
          {
            title: 'RPSC Rajasthan Art & Culture — Mock',
            slug: 'rpsc-rajasthan-art-culture-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'hard',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Attempt all 5 questions. Each question carries 2 marks. No negative marking. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question:
                  'The Battle of Haldighati (1576) was fought between Maharana Pratap and the forces of which Mughal emperor?',
                options: ['Babur', 'Humayun', 'Akbar', 'Jahangir'],
                correctAnswerIndex: 2,
                explanation:
                  'The Battle of Haldighati was fought on 18 June 1576 between Maharana Pratap of Mewar and the Mughal army led by Raja Man Singh I (and Asaf Khan) on behalf of Emperor Akbar. Though tactically indecisive, it became a symbol of Rajput valour.',
                subjectTopic: 'Medieval Rajasthan',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'The Mehrangarh Fort, one of the largest forts in India, is located in which city of Rajasthan?',
                options: ['Jaipur', 'Jodhpur', 'Udaipur', 'Jaisalmer'],
                correctAnswerIndex: 1,
                explanation:
                  'Mehrangarh Fort, founded by Rao Jodha in 1459, is situated in Jodhpur, Rajasthan. It rises 410 feet above the city and is enclosed by imposing thick walls, with intricate carvings and expansive courtyards.',
                subjectTopic: 'Forts of Rajasthan',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'Pushkar in Rajasthan is famous for housing one of the very few temples in the world dedicated to which Hindu deity?',
                options: ['Lord Vishnu', 'Lord Shiva', 'Lord Brahma', 'Lord Indra'],
                correctAnswerIndex: 2,
                explanation:
                  'The Jagatpita Brahma Mandir at Pushkar is one of the very few existing temples dedicated to Lord Brahma in the world. It lies near the sacred Pushkar Lake, mentioned in the Padma Purana.',
                subjectTopic: 'Religious Sites',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'The Aravalli Range, the oldest fold mountain range in India, is located primarily in which state?',
                options: ['Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Haryana'],
                correctAnswerIndex: 1,
                explanation:
                  'The Aravalli Range, dating back about 350 million years, is the oldest fold mountain range in India. It is located primarily in Rajasthan, with portions extending into Haryana, Delhi and Gujarat. Guru Shikhar (1,722 m) on Mount Abu is its highest peak.',
                subjectTopic: 'Physical Geography',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Ghoomar is a traditional folk dance associated with which Indian state?',
                options: ['Gujarat', 'Punjab', 'Rajasthan', 'Haryana'],
                correctAnswerIndex: 2,
                explanation:
                  'Ghoomar is a traditional folk dance of Rajasthan, performed by women with graceful swirling movements. It originated among the Bhil tribe and was later adopted by Rajput courts. The dance is performed to celebrate auspicious occasions.',
                subjectTopic: 'Folk Dances',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // =============================================================================
  // 4. MPSC — Maharashtra Public Service Commission
  // =============================================================================
  {
    name: 'MPSC',
    slug: 'mpsc',
    icon: '🏛️',
    description:
      'Maharashtra Public Service Commission (MPSC) State Service Examination. Covers Indian geography, economy and the history of Maharashtra including the Maratha Empire.',
    image:
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=70',
    color: '#9333ea',
    order: 23,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'Indian Geography & Economy',
        slug: 'mpsc-geography-economy',
        icon: '🌏',
        description:
          'Physical and economic geography of India, monetary system, planning and major economic indicators — aligned with MPSC State Service Prelims.',
        order: 1,
        tests: [
          {
            title: 'MPSC State Service Geography & Economy — Mock',
            slug: 'mpsc-geography-economy-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Attempt all 5 questions. Each question carries 2 marks. No negative marking. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'The Tropic of Cancer passes through how many Indian states?',
                options: ['6', '7', '8', '9'],
                correctAnswerIndex: 2,
                explanation:
                  'The Tropic of Cancer (23.5\u00b0 N) passes through 8 Indian states: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura and Mizoram.',
                subjectTopic: 'Physical Geography',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The Reserve Bank of India (RBI) was established in which year?',
                options: ['1935', '1947', '1950', '1969'],
                correctAnswerIndex: 0,
                explanation:
                  'The Reserve Bank of India was established on 1 April 1935 under the RBI Act, 1934. It was nationalised on 1 January 1949 and functions as India\u2019s central banking institution.',
                subjectTopic: 'Indian Economy',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Which is the longest river entirely within India?',
                options: ['Godavari', 'Ganga', 'Brahmaputra', 'Yamuna'],
                correctAnswerIndex: 1,
                explanation:
                  'The Ganga is the longest river in India, flowing approximately 2,525 km from its source at Gangotri Glacier in Uttarakhand to its mouth at the Bay of Bengal. (The Brahmaputra and Indus are longer overall but flow mostly outside India.)',
                subjectTopic: 'Drainage System',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'India is the largest producer of which of the following in the world?',
                options: ['Wheat', 'Pulses', 'Rice', 'Maize'],
                correctAnswerIndex: 1,
                explanation:
                  'India is the largest producer of pulses in the world, accounting for about 24\u201326% of global production. Major pulses grown include gram (chana), tur (arhar), urad and moong.',
                subjectTopic: 'Agriculture',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'In 2015, the base year for calculating India\u2019s GDP was shifted to which year?',
                options: ['2004-05', '2011-12', '2014-15', '2016-17'],
                correctAnswerIndex: 1,
                explanation:
                  'In 2015, the Central Statistics Office (now NSO) shifted the base year for India\u2019s GDP calculation from 2004-05 to 2011-12, in line with updated methodology and international best practices.',
                subjectTopic: 'National Income',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Maharashtra History & Geography',
        slug: 'mpsc-maharashtra-history',
        icon: '⚔️',
        description:
          'Maratha Empire, Chhatrapati Shivaji Maharaj, freedom movement in Maharashtra, Western Ghats and the cave architecture of Ajanta-Ellora.',
        order: 2,
        tests: [
          {
            title: 'MPSC Maharashtra History — Mock',
            slug: 'mpsc-maharashtra-history-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'hard',
            negativeMarking: true,
            negativeMarks: 0.5,
            instructions:
              'Attempt all 5 questions. Each correct = 2 marks, wrong = -0.5 marks. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question: 'Chhatrapati Shivaji Maharaj was born in which year at Shivneri Fort?',
                options: ['1627', '1630', '1635', '1640'],
                correctAnswerIndex: 1,
                explanation:
                  'Chhatrapati Shivaji Maharaj, the founder of the Maratha Empire, was born on 19 February 1630 (some sources say 1627) at Shivneri Fort near Junnar in present-day Maharashtra.',
                subjectTopic: 'Maratha History',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'The Battle of Pratapgad (1659) was fought between Shivaji Maharaj and which Bijapur general?',
                options: [
                  'Afzal Khan',
                  'Bahlol Khan',
                  'Rustam Zaman',
                  'Fazal Khan',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The Battle of Pratapgad, fought on 10 November 1659, was a decisive encounter in which Shivaji Maharaj defeated and killed Afzal Khan, a prominent general of the Bijapur Sultanate, at the foothills of Pratapgad Fort.',
                subjectTopic: 'Maratha History',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The Ajanta and Ellora Caves, a UNESCO World Heritage Site, are located in which state?',
                options: ['Madhya Pradesh', 'Maharashtra', 'Karnataka', 'Gujarat'],
                correctAnswerIndex: 1,
                explanation:
                  'The Ajanta and Ellora Caves, near Aurangabad in Maharashtra, are UNESCO World Heritage Sites (inscribed 1983). They feature Buddhist, Hindu and Jain rock-cut architecture and date from the 2nd century BCE to the 6th century CE (Ajanta) and 6th\u201310th centuries CE (Ellora).',
                subjectTopic: 'Cultural Heritage',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Who was the first Chief Minister of Maharashtra?',
                options: [
                  'Vasantrao Naik',
                  'Yashwantrao Chavan',
                  'Shankarrao Chavan',
                  'Vasantrao Patil',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Yashwantrao Chavan became the first Chief Minister of Maharashtra on 1 May 1960, when the state was formed after the division of the bilingual Bombay State under the States Reorganisation Act.',
                subjectTopic: 'Post-Independence Maharashtra',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The Gateway of India in Mumbai was built to commemorate the 1911 visit of which British monarch?',
                options: [
                  'Queen Victoria',
                  'King George V',
                  'King Edward VII',
                  'King George VI',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The Gateway of India was built to commemorate the visit of King George V and Queen Mary to Mumbai (then Bombay) in December 1911. The foundation stone was laid in 1911 and the monument was completed in 1924.',
                subjectTopic: 'Colonial Architecture',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // =============================================================================
  // 5. BPSC — Bihar Public Service Commission
  // =============================================================================
  {
    name: 'BPSC',
    slug: 'bpsc',
    icon: '🏛️',
    description:
      'Bihar Public Service Commission (BPSC) examination. Covers ancient and medieval Indian history with special focus on the historical legacy of Bihar including Nalanda, Bodh Gaya and the Mauryan empire.',
    image:
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=70',
    color: '#15803d',
    order: 24,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'Indian History (Ancient & Medieval)',
        slug: 'bpsc-ancient-medieval-history',
        icon: '🪷',
        description:
          'Ancient Indian dynasties, Mauryan and Gupta empires, Delhi Sultanate and Mughal period \u2014 aligned with the BPSC Prelims syllabus.',
        order: 1,
        tests: [
          {
            title: 'BPSC Prelims Indian History — Mock',
            slug: 'bpsc-prelims-history-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Attempt all 5 questions. Each question carries 2 marks. No negative marking. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'The Mauryan Empire was founded by which ruler in 322 BCE?',
                options: [
                  'Bimbisara',
                  'Chandragupta Maurya',
                  'Ashoka',
                  'Bindusara',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The Mauryan Empire was founded by Chandragupta Maurya in 322 BCE with the guidance of his mentor Chanakya (Kautilya), by overthrowing the Nanda dynasty of Magadha.',
                subjectTopic: 'Mauryan Empire',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Alexander the Great invaded north-western India in which year?',
                options: ['326 BCE', '321 BCE', '305 BCE', '273 BCE'],
                correctAnswerIndex: 0,
                explanation:
                  'Alexander the Great invaded north-western India in 326 BCE and defeated King Porus at the Battle of the Hydaspes (Jhelum). His army refused to advance further across the Beas river, forcing him to turn back.',
                subjectTopic: 'Ancient India',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The Delhi Sultanate was founded by which ruler in 1206 CE?',
                options: [
                  'Qutb-ud-din Aibak',
                  'Iltutmish',
                  'Razia Sultan',
                  'Alauddin Khilji',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The Delhi Sultanate was founded by Qutb-ud-din Aibak in 1206 CE after the death of Muhammad of Ghor. Aibak, a former slave, founded the Mamluk (Slave) Dynasty and ruled from Delhi.',
                subjectTopic: 'Delhi Sultanate',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Harshavardhana, who ruled northern India from 606 to 647 CE, had his capital at which city?',
                options: ['Pataliputra', 'Kannauj', 'Varanasi', 'Ujjain'],
                correctAnswerIndex: 1,
                explanation:
                  'Harshavardhana of the Pushyabhuti (Vardhana) dynasty shifted his capital from Thanesar to Kannauj after the death of his brother-in-law, the Maukhari king. He was the last great Hindu emperor of northern India.',
                subjectTopic: 'Post-Gupta Period',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The Vijayanagara Empire was founded in 1336 CE by which brothers?',
                options: [
                  'Harihara and Bukka',
                  'Krishnadevaraya and Devaraya',
                  'Sangama and Mallikarjuna',
                  'Devaraya II and Praudhadevaraya',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The Vijayanagara Empire was founded in 1336 CE by Harihara I and Bukka Raya I of the Sangama Dynasty, with its capital at Vijayanagara (modern-day Hampi, Karnataka).',
                subjectTopic: 'Medieval South India',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Bihar History & Polity',
        slug: 'bpsc-bihar-history-polity',
        icon: '📜',
        description:
          'Pataliputra, Nalanda, Vikramshila, Bodh Gaya, Chanakya\u2019s Arthashastra, post-independence politics and polity of Bihar.',
        order: 2,
        tests: [
          {
            title: 'BPSC Bihar History — Mock',
            slug: 'bpsc-bihar-history-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'hard',
            negativeMarking: true,
            negativeMarks: 0.5,
            instructions:
              'Attempt all 5 questions. Each correct = 2 marks, wrong = -0.5 marks. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question: 'The ancient name of Patna, the capital of Bihar, was:',
                options: ['Vaishali', 'Pataliputra', 'Rajgriha', 'Champa'],
                correctAnswerIndex: 1,
                explanation:
                  'Patna was known as Pataliputra in ancient times. It served as the capital of the Mauryan and Gupta empires and was one of the largest cities in the ancient world, also known as Kusumapura and Pushpapura.',
                subjectTopic: 'Ancient Bihar',
                marks: 2,
                isPremium: true,
              },
              {
                question:
                  'The ancient Nalanda University, founded in the 5th century CE, flourished under the patronage of which dynasty?',
                options: ['Mauryas', 'Guptas', 'Palas', 'Cholas'],
                correctAnswerIndex: 1,
                explanation:
                  'Nalanda University, founded in the 5th century CE, flourished under the patronage of the Gupta emperors, particularly Kumaragupta I (r. 415\u2013455 CE), who is credited with its founding. It continued to thrive under the Palas of Bengal.',
                subjectTopic: 'Education in Ancient Bihar',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Bodh Gaya in Bihar is revered as the place where:',
                options: [
                  'Buddha was born',
                  'Buddha attained enlightenment',
                  'Buddha delivered his first sermon',
                  'Buddha attained Mahaparinirvana',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Bodh Gaya is the place where Prince Siddhartha Gautama attained enlightenment under the Bodhi tree, becoming the Buddha. The Mahabodhi Temple at this site is a UNESCO World Heritage Site since 2002.',
                subjectTopic: 'Buddhist Heritage',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The Arthashastra, an ancient Indian treatise on statecraft, was written by:',
                options: [
                  'Kalidasa',
                  'Chanakya (Kautilya)',
                  'Panini',
                  'Charaka',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The Arthashastra, an ancient Indian treatise on statecraft, economic policy and military strategy, was written by Chanakya (also known as Kautilya or Vishnugupta), the prime minister to Emperor Chandragupta Maurya.',
                subjectTopic: 'Ancient Political Thought',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Who was the first Chief Minister of Bihar?',
                options: [
                  'Sri Krishna Sinha',
                  'Anugrah Narayan Sinha',
                  'Karpoori Thakur',
                  'Bindeshwari Dubey',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'Sri Krishna Sinha became the first Chief Minister of Bihar on 2 April 1946 and continued in office after independence, serving until his death on 31 January 1961. He is often called the "Architect of Modern Bihar".',
                subjectTopic: 'Post-Independence Bihar',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // =============================================================================
  // 6. JPSC — Jharkhand Public Service Commission
  // =============================================================================
  {
    name: 'JPSC',
    slug: 'jpsc',
    icon: '🏛️',
    description:
      'Jharkhand Public Service Commission (JPSC) Civil Services examination. Covers general studies, current affairs and the tribal heritage, history and culture of Jharkhand.',
    image:
      'https://images.unsplash.com/photo-1604608672516-f1b9b1d36442?auto=format&fit=crop&w=800&q=70',
    color: '#166534',
    order: 25,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'General Studies & Current Affairs',
        slug: 'jpsc-gs-current-affairs',
        icon: '📰',
        description:
          'National and international current affairs, Indian polity and economy, science and technology and major national events \u2014 aligned with JPSC Prelims.',
        order: 1,
        tests: [
          {
            title: 'JPSC Prelims GS & CA — Mock',
            slug: 'jpsc-prelims-gs-ca-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Attempt all 5 questions. Each question carries 2 marks. No negative marking. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'The World Health Organization declared COVID-19 a global pandemic on which date?',
                options: [
                  '30 January 2020',
                  '11 March 2020',
                  '13 March 2020',
                  '1 April 2020',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The World Health Organization declared COVID-19 a global pandemic on 11 March 2020. It was the first time a coronavirus was characterised as a pandemic by the WHO.',
                subjectTopic: 'Global Current Affairs',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'India hosted the 18th G20 Summit in September 2023 at which city?',
                options: ['Mumbai', 'New Delhi', 'Bengaluru', 'Chennai'],
                correctAnswerIndex: 1,
                explanation:
                  'India hosted the 18th G20 Summit on 9\u201310 September 2023 at the Bharat Mandapam International Exhibition-Convention Centre in New Delhi. The theme was "Vasudhaiva Kutumbakam" (One Earth, One Family, One Future).',
                subjectTopic: 'National Events',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Chandrayaan-3\u2019s Vikram lander successfully soft-landed on the Moon on which date?',
                options: [
                  '14 July 2023',
                  '23 August 2023',
                  '2 September 2023',
                  '16 October 2023',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Chandrayaan-3\u2019s Vikram lander successfully soft-landed on the lunar south polar region on 23 August 2023, making India the first country to land near the Moon\u2019s south pole and the fourth to achieve a soft landing on the Moon.',
                subjectTopic: 'Science & Technology',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The headquarters of the Indian Space Research Organisation (ISRO) is located in which city?',
                options: ['New Delhi', 'Bengaluru', 'Hyderabad', 'Thiruvananthapuram'],
                correctAnswerIndex: 1,
                explanation:
                  'The headquarters of the Indian Space Research Organisation (ISRO) is located in Bengaluru, Karnataka. ISRO was founded on 15 August 1969 and is one of the world\u2019s leading space agencies.',
                subjectTopic: 'Indian Institutions',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Who became the 51st Chief Justice of India in November 2024?',
                options: [
                  'Justice N.V. Ramana',
                  'Justice D.Y. Chandrachud',
                  'Justice Sanjiv Khanna',
                  'Justice B.R. Gavai',
                ],
                correctAnswerIndex: 2,
                explanation:
                  'Justice Sanjiv Khanna became the 51st Chief Justice of India on 11 November 2024, succeeding Justice D.Y. Chandrachud. He has a tenure of approximately six months until May 2025.',
                subjectTopic: 'National Polity',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Jharkhand History & Tribal Culture',
        slug: 'jpsc-jharkhand-tribal-culture',
        icon: '🌳',
        description:
          'Tribal communities of Jharkhand, Birsa Munda, formation of the state, major industries, natural sites and tribal cultural heritage.',
        order: 2,
        tests: [
          {
            title: 'JPSC Jharkhand Tribal Culture — Mock',
            slug: 'jpsc-jharkhand-tribal-culture-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'hard',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Attempt all 5 questions. Each question carries 2 marks. No negative marking. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question: 'Jharkhand was carved out as a separate state from Bihar on which date?',
                options: [
                  '1 November 2000',
                  '15 November 2000',
                  '1 January 2001',
                  '26 January 2001',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Jharkhand became the 28th state of India on 15 November 2000, the birth anniversary of tribal freedom fighter Birsa Munda, after being carved out of the southern part of Bihar under the Bihar Reorganisation Act, 2000.',
                subjectTopic: 'State Formation',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Birsa Munda, the legendary tribal freedom fighter, belonged to which tribe?',
                options: ['Santhal', 'Munda', 'Oraon', 'Ho'],
                correctAnswerIndex: 1,
                explanation:
                  'Birsa Munda (1875\u20131900) belonged to the Munda tribe. He led the Munda Rebellion (Ulgulan) of 1895\u20131900 against British colonial rule and the exploitative zamindari system. He is revered as "Dharti Aaba" (Father of the Earth) by tribals.',
                subjectTopic: 'Tribal Freedom Movement',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Tata Steel was established at Jamshedpur (then Sakchi) in which year?',
                options: ['1907', '1911', '1912', '1908'],
                correctAnswerIndex: 0,
                explanation:
                  'Tata Steel (originally Tata Iron and Steel Company, TISCO) was established by Jamsetji Tata in 1907 at Jamshedpur in present-day Jharkhand, marking the beginning of India\u2019s integrated steel industry. Production commenced in 1912.',
                subjectTopic: 'Industrial History',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Parasnath Hill (Sammed Shikhar) in Jharkhand is the most sacred pilgrimage site for which religion?',
                options: ['Hinduism', 'Buddhism', 'Jainism', 'Sikhism'],
                correctAnswerIndex: 2,
                explanation:
                  'Parasnath Hill (Sammed Shikharji), the highest peak in Jharkhand at 1,366 m, is the most sacred Jain pilgrimage site. According to Jain tradition, 20 of the 24 Tirthankaras attained moksha (salvation) at this site.',
                subjectTopic: 'Religious Geography',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The famous Hundru Falls in Jharkhand is formed on which river?',
                options: ['Damodar', 'Subarnarekha', 'Koel', 'Barakar'],
                correctAnswerIndex: 1,
                explanation:
                  'Hundru Falls, one of the most famous waterfalls in Jharkhand, is created on the Subarnarekha River. It falls from a height of about 98 metres (322 feet) and is located about 45 km from Ranchi.',
                subjectTopic: 'Physical Geography',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // =============================================================================
  // 7. OPSC — Odisha Public Service Commission
  // =============================================================================
  {
    name: 'OPSC',
    slug: 'opsc',
    icon: '🏛️',
    description:
      'Odisha Public Service Commission (OPSC) examination. Covers Indian geography and history with focus on the art, architecture and culture of Odisha \u2014 Konark, Jagannath Puri, Chilika and Odissi.',
    image:
      'https://images.unsplash.com/photo-1609145320938-f4a98b96eaf2?auto=format&fit=crop&w=800&q=70',
    color: '#1d4ed8',
    order: 26,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'Indian Geography & History',
        slug: 'opsc-geography-history',
        icon: '🏞️',
        description:
          'Indian physical geography, ancient and medieval Indian history, major dynasties and the freedom movement \u2014 aligned with OPSC Prelims.',
        order: 1,
        tests: [
          {
            title: 'OPSC Prelims Geography & History — Mock',
            slug: 'opsc-prelims-geography-history-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: true,
            negativeMarks: 0.5,
            instructions:
              'Attempt all 5 questions. Each correct = 2 marks, wrong = -0.5 marks. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'Which Indian state has the longest coastline on the mainland?',
                options: ['Andhra Pradesh', 'Gujarat', 'Maharashtra', 'Tamil Nadu'],
                correctAnswerIndex: 1,
                explanation:
                  'Gujarat has the longest coastline among Indian states, stretching approximately 1,600 km along the Arabian Sea, accounting for nearly one-third of India\u2019s total mainland coastline.',
                subjectTopic: 'Physical Geography',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The highest mountain peak entirely within India is:',
                options: ['K2', 'Kanchenjunga', 'Nanda Devi', 'Kamet'],
                correctAnswerIndex: 1,
                explanation:
                  'Kanchenjunga (8,586 m), on the border between Sikkim and Nepal, is the highest mountain peak entirely within India. K2 (8,611 m) is higher but is in the Pakistan-administered part of Kashmir.',
                subjectTopic: 'Physical Geography',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The First Battle of Panipat (1526) led to the establishment of which empire in India?',
                options: [
                  'Delhi Sultanate',
                  'Mughal Empire',
                  'Maratha Empire',
                  'Vijayanagara Empire',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The First Battle of Panipat was fought on 21 April 1526 between Babur and Ibrahim Lodi, resulting in the establishment of the Mughal Empire in India. Babur used gunpowder and artillery effectively in this battle.',
                subjectTopic: 'Medieval India',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'Who was the last Viceroy of British India and the first Governor-General of independent India?',
                options: [
                  'Lord Wavell',
                  'Lord Mountbatten',
                  'Lord Linlithgow',
                  'C. Rajagopalachari',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Lord Louis Mountbatten was the last Viceroy of British India (March\u2013August 1947) and the first Governor-General of independent India (1947\u20131948). C. Rajagopalachari succeeded him as the first Indian Governor-General.',
                subjectTopic: 'Modern India',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The largest state in India by area is:',
                options: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Uttar Pradesh'],
                correctAnswerIndex: 2,
                explanation:
                  'Rajasthan is the largest state in India by area, covering approximately 342,239 sq km, which is about 10.4% of India\u2019s total geographical area. It was formed on 30 March 1949.',
                subjectTopic: 'Indian States',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Odisha History & Art',
        slug: 'opsc-odisha-history-art',
        icon: '🛕',
        description:
          'Kalinga legacy, Eastern Ganga architecture, Konark Sun Temple, Jagannath Puri, Chilika Lake, Odissi dance and the cultural heritage of Odisha.',
        order: 2,
        tests: [
          {
            title: 'OPSC Odisha Art & Culture — Mock',
            slug: 'opsc-odisha-art-culture-mock',
            type: 'Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'hard',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Attempt all 5 questions. Each question carries 2 marks. No negative marking. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Prelims 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question:
                  'The Konark Sun Temple, a UNESCO World Heritage Site, was built in the 13th century by which king?',
                options: [
                  'Anantavarman Chodaganga',
                  'Narasimhadeva I',
                  'Narasimhadeva II',
                  'Mukundadeva',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The Konark Sun Temple was built in 1250 CE by King Narasimhadeva I of the Eastern Ganga Dynasty. Designed as a colossal chariot of the Sun God Surya with 24 wheels and 7 horses, it is a UNESCO World Heritage Site since 1984.',
                subjectTopic: 'Medieval Odisha',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Chilika Lake, the largest brackish water lagoon in Asia, is located in which state?',
                options: ['West Bengal', 'Andhra Pradesh', 'Odisha', 'Tamil Nadu'],
                correctAnswerIndex: 2,
                explanation:
                  'Chilika Lake is spread over the Puri, Khurda and Ganjam districts of Odisha. It is the largest brackish water lagoon in Asia and the largest wintering ground for migratory birds in the Indian subcontinent. It was designated a Ramsar site in 1981.',
                subjectTopic: 'Geography of Odisha',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The famous Jagannath Temple, one of the Char Dham pilgrimage sites, is located in which city?',
                options: ['Bhubaneswar', 'Puri', 'Cuttack', 'Konark'],
                correctAnswerIndex: 1,
                explanation:
                  'The Jagannath Temple, dedicated to Lord Jagannath (a form of Krishna), is located in Puri, Odisha. Built in the 12th century by King Anantavarman Chodaganga Deva of the Eastern Ganga dynasty, it is one of the four Char Dham pilgrimage sites.',
                subjectTopic: 'Religious Architecture',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Odissi, one of the eight classical dance forms of India, originated in which state?',
                options: ['Andhra Pradesh', 'Odisha', 'Tamil Nadu', 'Kerala'],
                correctAnswerIndex: 1,
                explanation:
                  'Odissi is a classical dance form that originated in Odisha, with roots in the temples of Lord Jagannath at Puri and references in the Natya Shastra. It is one of the eight recognised classical dance forms of India.',
                subjectTopic: 'Classical Dances',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Who was the first Chief Minister of Odisha?',
                options: [
                  'Harekrushna Mahatab',
                  'Biju Patnaik',
                  'Nabakrushna Choudhury',
                  'Ranganath Misra',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'Dr. Harekrushna Mahatab became the first Chief Minister of Odisha on 23 April 1946. He played a key role in the integration of princely states with Odisha and is remembered as the architect of modern Odisha.',
                subjectTopic: 'Post-Independence Odisha',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // =============================================================================
  // 8. Kerala PSC — Kerala Public Service Commission
  // =============================================================================
  {
    name: 'Kerala PSC',
    slug: 'kerala-psc',
    icon: '🏛️',
    description:
      'Kerala Public Service Commission (KPSC) examination. Covers general awareness along with the history, geography, backwaters, culture and high-literacy legacy of Kerala.',
    image:
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=70',
    color: '#0e7490',
    order: 27,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'General Awareness',
        slug: 'kerala-psc-general-awareness',
        icon: '🌐',
        description:
          'Static general knowledge, Indian polity and economy, science and national/international current affairs \u2014 aligned with Kerala PSC Degree Level examinations.',
        order: 1,
        tests: [
          {
            title: 'Kerala PSC Degree Level GA — Mock',
            slug: 'kerala-psc-degree-level-ga-mock',
            type: 'Degree Level Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Attempt all 5 questions. Each question carries 2 marks. No negative marking. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Degree Level 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'The International Day of Yoga is celebrated annually on which date?',
                options: ['21 June', '21 July', '21 September', '21 December'],
                correctAnswerIndex: 0,
                explanation:
                  'The International Day of Yoga is celebrated annually on 21 June. The United Nations declared it in December 2014 after Prime Minister Narendra Modi\u2019s address to the UN General Assembly in September 2014.',
                subjectTopic: 'International Days',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'India\u2019s first satellite, Aryabhata, was launched in which year?',
                options: ['1972', '1975', '1980', '1983'],
                correctAnswerIndex: 1,
                explanation:
                  'Aryabhata, India\u2019s first satellite, was launched on 19 April 1975 from the Soviet Union using a Kosmos-3M launch vehicle. It was named after the 5th-century Indian mathematician and astronomer Aryabhata.',
                subjectTopic: 'Science & Technology',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The Right to Information (RTI) Act in India was enacted in which year?',
                options: ['2003', '2005', '2007', '2009'],
                correctAnswerIndex: 1,
                explanation:
                  'The Right to Information Act was passed by Parliament on 15 June 2005 and came into force on 12 October 2005, empowering citizens to seek information from public authorities and promoting transparency.',
                subjectTopic: 'Indian Polity',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'In India, currency notes (other than the one-rupee note) are issued by:',
                options: [
                  'Government of India',
                  'Reserve Bank of India',
                  'State Bank of India',
                  'Ministry of Finance',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'Under the Reserve Bank of India Act, 1934, all currency notes except the one-rupee note are issued by the Reserve Bank of India (RBI). The Government of India issues only one-rupee notes and all coins.',
                subjectTopic: 'Indian Economy',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The 18th G20 Summit in 2023 was hosted by which country?',
                options: ['Indonesia', 'India', 'Brazil', 'Italy'],
                correctAnswerIndex: 1,
                explanation:
                  'India hosted the 18th G20 Summit on 9\u201310 September 2023 in New Delhi, with the theme "Vasudhaiva Kutumbakam" (One Earth, One Family, One Future). It was India\u2019s first time hosting the G20 Summit.',
                subjectTopic: 'Current Affairs',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Kerala History & Geography',
        slug: 'kerala-psc-history-geography',
        icon: '🛶',
        description:
          'First communist government of 1957, Western Ghats, backwaters, Munnar, Onam, Kathakali and the high-literacy legacy of Kerala.',
        order: 2,
        tests: [
          {
            title: 'Kerala PSC History & Geography — Mock',
            slug: 'kerala-psc-history-geography-mock',
            type: 'Degree Level Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'hard',
            negativeMarking: true,
            negativeMarks: 0.5,
            instructions:
              'Attempt all 5 questions. Each correct = 2 marks, wrong = -0.5 marks. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Degree Level 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question: 'Who became the first non-Congress Chief Minister of any Indian state in 1957?',
                options: [
                  'E.M.S. Namboodiripad',
                  'C. Achutha Menon',
                  'K. Karunakaran',
                  'E.K. Nayanar',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'E.M.S. Namboodiripad became the first Chief Minister of Kerala in 1957, forming the first democratically elected communist government in the world and the first non-Congress government in any Indian state.',
                subjectTopic: 'Modern Kerala',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Which Indian state has the highest literacy rate according to the 2011 Census?',
                options: ['Mizoram', 'Kerala', 'Goa', 'Tripura'],
                correctAnswerIndex: 1,
                explanation:
                  'Kerala has the highest literacy rate among Indian states at 93.91% according to the 2011 Census, far above the national average of 74.04%. The state has consistently led on literacy for decades.',
                subjectTopic: 'Social Indicators',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Onam, the major harvest festival, is primarily celebrated in which Indian state?',
                options: ['Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh'],
                correctAnswerIndex: 2,
                explanation:
                  'Onam is the official state festival of Kerala, celebrated annually to welcome the legendary King Mahabali. It features Vallam Kali (snake boat race), Kathakali performances, the Onam Sadhya feast and the floral carpet Pookalam.',
                subjectTopic: 'Festivals',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The Western Ghats, a UNESCO World Heritage Site, run through how many Indian states?',
                options: ['4', '5', '6', '7'],
                correctAnswerIndex: 2,
                explanation:
                  'The Western Ghats, recognised as a UNESCO World Heritage Site in 2012, run through 6 Indian states: Gujarat, Maharashtra, Goa, Karnataka, Kerala and Tamil Nadu. They are one of the eight "hottest hotspots" of biological diversity in the world.',
                subjectTopic: 'Physical Geography',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'The Kerala backwaters are primarily known for which activity?',
                options: [
                  'Coal mining',
                  'Tourism and transportation',
                  'Iron ore extraction',
                  'Tea plantation',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The Kerala backwaters are a network of interconnected canals, rivers, lakes and inlets along the Arabian Sea coast. They are famous for tourism (houseboats called kettuvallams) and serve as a traditional means of local transportation.',
                subjectTopic: 'Geography of Kerala',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // =============================================================================
  // 9. TNPSC — Tamil Nadu Public Service Commission
  // =============================================================================
  {
    name: 'TNPSC',
    slug: 'tnpsc',
    icon: '🏛️',
    description:
      'Tamil Nadu Public Service Commission (TNPSC) Group 1 examination. Covers Indian polity and economy along with the rich history and cultural heritage of Tamil Nadu \u2014 Chola, Pandya and Pallava legacy.',
    image:
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=70',
    color: '#be185d',
    order: 28,
    isPremium: false,
    premiumPrice: 0,
    premiumDurationMonths: 0,
    subjects: [
      {
        name: 'Indian Polity & Economy',
        slug: 'tnpsc-polity-economy',
        icon: '⚖️',
        description:
          'Indian Constitution, fundamental rights, taxation system, finance commission, planning bodies and economic reforms \u2014 aligned with TNPSC Group 1 Prelims.',
        order: 1,
        tests: [
          {
            title: 'TNPSC Group 1 Prelims Polity — Mock',
            slug: 'tnpsc-group-1-prelims-polity-mock',
            type: 'Group 1 Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'medium',
            negativeMarking: false,
            negativeMarks: 0,
            instructions:
              'Attempt all 5 questions. Each question carries 2 marks. No negative marking. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Group 1 Prelims 2025',
            isPremium: false,
            price: 0,
            questions: [
              {
                question: 'How many fundamental rights are guaranteed by the Indian Constitution as of 2025?',
                options: ['5', '6', '7', '8'],
                correctAnswerIndex: 1,
                explanation:
                  'The Constitution originally provided 7 fundamental rights. After the 44th Amendment Act, 1978 removed the Right to Property (Article 31) from fundamental rights (now a legal right under Article 300-A), there are now 6 fundamental rights.',
                subjectTopic: 'Fundamental Rights',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The Goods and Services Tax (GST) was implemented in India from which date?',
                options: [
                  '1 April 2017',
                  '1 July 2017',
                  '1 October 2017',
                  '1 January 2018',
                ],
                correctAnswerIndex: 1,
                explanation:
                  'The Goods and Services Tax (GST) was implemented in India from 1 July 2017, replacing multiple indirect taxes levied by the central and state governments. It was enabled by the 101st Constitutional Amendment Act, 2016.',
                subjectTopic: 'Indian Economy',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'The Finance Commission is constituted by the President under which Article of the Constitution?',
                options: ['Article 280', 'Article 270', 'Article 282', 'Article 360'],
                correctAnswerIndex: 0,
                explanation:
                  'Article 280 of the Indian Constitution provides for the constitution of a Finance Commission by the President every five years to recommend the distribution of tax revenues between the Union and the states.',
                subjectTopic: 'Federal Finance',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'A Money Bill is defined under which Article of the Indian Constitution?',
                options: ['Article 109', 'Article 110', 'Article 111', 'Article 112'],
                correctAnswerIndex: 1,
                explanation:
                  'Article 110 of the Indian Constitution defines a Money Bill. A Money Bill can be introduced only in the Lok Sabha and the Rajya Sabha cannot reject or amend it \u2014 only make recommendations within 14 days.',
                subjectTopic: 'Parliament',
                marks: 2,
                isPremium: false,
              },
              {
                question: 'NITI Aayog was established on which date, replacing the Planning Commission?',
                options: [
                  '1 January 2015',
                  '1 April 2015',
                  '1 July 2015',
                  '1 January 2016',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'NITI Aayog (National Institution for Transforming India) was established on 1 January 2015, replacing the 65-year-old Planning Commission, to serve as the premier policy think tank of the Government of India.',
                subjectTopic: 'Planning Bodies',
                marks: 2,
                isPremium: false,
              },
            ],
          },
        ],
      },
      {
        name: 'Tamil History & Culture',
        slug: 'tnpsc-tamil-history-culture',
        icon: '🛕',
        description:
          'Chola, Pandya and Pallava dynasties, Brihadeeswarar Temple, Marina Beach, Bharatanatyam, Pongal and the classical Tamil language.',
        order: 2,
        tests: [
          {
            title: 'TNPSC Tamil History & Culture — Mock',
            slug: 'tnpsc-tamil-history-culture-mock',
            type: 'Group 1 Prelims Mock',
            duration: 30,
            totalMarks: 10,
            passingMarks: 4,
            isPublished: true,
            difficulty: 'hard',
            negativeMarking: true,
            negativeMarks: 0.5,
            instructions:
              'Attempt all 5 questions. Each correct = 2 marks, wrong = -0.5 marks. Choose the single most accurate option.',
            year: 2025,
            examSession: 'Group 1 Prelims 2025',
            isPremium: true,
            price: 49,
            questions: [
              {
                question: 'The Brihadeeswarar Temple at Thanjavur was built by which Chola king around 1010 CE?',
                options: [
                  'Rajaraja Chola I',
                  'Rajendra Chola I',
                  'Rajadhiraja Chola',
                  'Kulothunga Chola I',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'The Brihadeeswarar Temple (Peruvudaiyar Kovil, also called the Big Temple) at Thanjavur was built by Rajaraja Chola I and completed around 1010 CE. It is part of the "Great Living Chola Temples" UNESCO World Heritage Site since 1987.',
                subjectTopic: 'Chola Empire',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Marina Beach in Chennai, the second longest urban beach in the world, is approximately how long?',
                options: ['About 6 km', 'About 13 km', 'About 25 km', 'About 30 km'],
                correctAnswerIndex: 1,
                explanation:
                  'Marina Beach in Chennai, Tamil Nadu, is approximately 13 km (8.1 miles) long, making it the second longest urban beach in the world after Cox\u2019s Bazar Beach in Bangladesh. It runs from Fort St. George to Besant Nagar.',
                subjectTopic: 'Geography of Tamil Nadu',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Pongal, the major harvest festival of Tamil Nadu, is celebrated in which month?',
                options: ['October', 'November', 'January', 'April'],
                correctAnswerIndex: 2,
                explanation:
                  'Pongal, the four-day harvest festival of Tamil Nadu, is celebrated in mid-January (typically 14\u201317 January) to mark the sun\u2019s northward journey (Uttarayana) and to thank the Sun God, nature and cattle. The first day is Bhogi, the main day is Thai Pongal.',
                subjectTopic: 'Festivals',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Tamil was accorded the status of a classical language by the Government of India in which year?',
                options: ['2002', '2004', '2008', '2013'],
                correctAnswerIndex: 1,
                explanation:
                  'Tamil was the first language to be accorded classical language status by the Government of India on 12 October 2004. It is one of the oldest surviving classical languages with a rich literary tradition spanning over two millennia.',
                subjectTopic: 'Language & Literature',
                marks: 2,
                isPremium: true,
              },
              {
                question: 'Who was the first Chief Minister of Tamil Nadu (then Madras State) under the reorganised state?',
                options: [
                  'C.N. Annadurai',
                  'K. Kamaraj',
                  'M. Bhaktavatsalam',
                  'M.G. Ramachandran',
                ],
                correctAnswerIndex: 0,
                explanation:
                  'C.N. Annadurai, popularly known as Anna, became the first Chief Minister of Tamil Nadu (Madras State renamed Tamil Nadu in 1967) on 6 March 1967, leading the Dravida Munnetra Kazhagam (DMK) to a historic victory ending Congress rule.',
                subjectTopic: 'Post-Independence Tamil Nadu',
                marks: 2,
                isPremium: true,
              },
            ],
          },
        ],
      },
    ],
  },
];
