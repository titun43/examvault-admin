// =============================================================================
// ExamVault — ADRE (Assam Direct Recruitment) PART C
// Bilingual question pool — General Awareness (adre-awareness)
//
// Format (CRITICAL — every field is bilingual EN + অসমীয়া):
//   question  -> "English\nঅসমীয়া"
//   option    -> "English / অসমীয়া"
//   expl      -> "English\nঅসমীয়া"
//
// adre-awareness : 30 questions covering Indian history (Mughal, freedom
//                  movement), Indian geography, Indian polity (President,
//                  PM, Parliament), Indian economy, general science
//                  (physics/chemistry/biology basics), sports (cricket,
//                  Olympics), books & authors, important days, current
//                  affairs (Chandrayaan-3, G20) — class IX-X level.
//
// correctAnswerIndex is distributed evenly (8 × 0, 8 × 1, 7 × 2, 7 × 3)
// so test slicing produces a balanced answer key.
//
// subjectTopic spread:
//   History(5), Geography(4), Polity(5), Economy(3), Science(5),
//   Sports(3), Books & Authors(2), Important Days(1), Current Affairs(2)
// =============================================================================
import type { QuestionPoolMap } from './structure';

export const ADRE_POOLS_C: QuestionPoolMap = {
  // ===========================================================================
  // adre-awareness — General Awareness (30)
  // ===========================================================================
  'adre-awareness': [
    // --- History (5) ---
    {
      question:
        "Who founded the Mughal Empire in India?\nভাৰতত মোগল সাম্ৰাজ্য কোনে প্ৰতিষ্ঠা কৰিছিল?",
      options: [
        'Babur / বাবৰ',
        'Humayun / হুমায়ুন',
        'Akbar / আকবৰ',
        'Timur / তৈমুৰ',
      ],
      correctAnswerIndex: 0,
      explanation:
        "Babur defeated Ibrahim Lodi at the First Battle of Panipat in 1526 and founded the Mughal Empire.\n1526 চনত পানিপথৰ প্ৰথম যুদ্ধত বাবৰে ইব্ৰাহিম লোদিক পৰাস্ত কৰি মোগল সাম্ৰাজ্য প্ৰতিষ্ঠা কৰিছিল।",
      subjectTopic: 'History',
      marks: 1,
    },
    {
      question:
        "In which year did the Jallianwala Bagh massacre take place?\nজালিয়ানৱালা বাগৰ হত্যাকাণ্ড কোন চনত সংঘটিত হৈছিল?",
      options: ['1905 / 1905', '1919 / 1919', '1921 / 1921', '1942 / 1942'],
      correctAnswerIndex: 1,
      explanation:
        "On 13 April 1919, British troops under General Dyer fired on unarmed civilians at Jallianwala Bagh, Amritsar.\n1919 চনৰ 13 এপ্ৰিলত জেনেৰেল ডায়াৰৰ নেতৃত্বত ব্ৰিটিছ সেনাই অমৃতসৰৰ জালিয়ানৱালা বাগত নিৰস্ত্ৰ লোকৰ ওপৰত গুলীচালনা কৰিছিল।",
      subjectTopic: 'History',
      marks: 1,
    },
    {
      question:
        "Who gave the slogan 'Give me blood and I will give you freedom'?\n'তোমাক মই স্বাধীনতা দিম, মোক তুমি তোমাৰ তেজ দিয়া' — এই স্লোগানটো কোনে দিছিল?",
      options: [
        'Bhagat Singh / ভগৎ সিং',
        'Mahatma Gandhi / মহাত্মা গান্ধী',
        'Subhas Chandra Bose / সুভাষ চন্দ্ৰ বসু',
        'Bal Gangadhar Tilak / বাল গঙ্গাধৰ তিলক',
      ],
      correctAnswerIndex: 2,
      explanation:
        "Subhas Chandra Bose gave this slogan in 1943 while addressing the Indian National Army in Singapore.\n1943 চনত ছিংগাপুৰত ভাৰতীয় জাতীয় সেনাৰ সন্মুখত ভাষণ দি সুভাষ চন্দ্ৰ বসুৱে এই স্লোগানটো দিছিল।",
      subjectTopic: 'History',
      marks: 1,
    },
    {
      question:
        "Who was the first Governor-General of independent India?\nস্বাধীন ভাৰতৰ প্ৰথম গৱৰ্ণৰ-জেনেৰেল কোন আছিল?",
      options: [
        'Lord Mountbatten / লৰ্ড মাউন্টবেটেন',
        'C. Rajagopalachari / চি. ৰাজাগোপালাচাৰী',
        'Rajendra Prasad / ৰাজেন্দ্ৰ প্ৰসাদ',
        'Lord Wavell / লৰ্ড ৱেভেল',
      ],
      correctAnswerIndex: 0,
      explanation:
        "Lord Mountbatten became the first Governor-General of independent India in August 1947; C. Rajagopalachari succeeded him as the last and only Indian Governor-General.\n1947 চনৰ আগষ্টত লৰ্ড মাউন্টবেটেন স্বাধীন ভাৰতৰ প্ৰথম গৱৰ্ণৰ-জেনেৰেল হৈছিল; চি. ৰাজাগোপালাচাৰী তেওঁৰ পিছত শেষৰ আৰু একমাত্ৰ ভাৰতীয় গৱৰ্ণৰ-জেনেৰেল হৈছিল।",
      subjectTopic: 'History',
      marks: 1,
    },
    {
      question:
        "In which year was the Quit India Movement launched?\n'ভাৰত ত্যাগ আন্দোলন' কোন চনত আৰম্ভ কৰা হৈছিল?",
      options: ['1940 / 1940', '1942 / 1942', '1945 / 1945', '1930 / 1930'],
      correctAnswerIndex: 1,
      explanation:
        "The Quit India Movement was launched by Mahatma Gandhi on 8 August 1942 at the Bombay session of the All-India Congress Committee.\n1942 চনৰ 8 আগষ্টত বোম্বেত অনুষ্ঠিত অল-ইণ্ডিয়া কংগ্ৰেছ কমিটিৰ অধিৱেশনত মহাত্মা গান্ধীয়ে ভাৰত ত্যাগ আন্দোলন আৰম্ভ কৰিছিল।",
      subjectTopic: 'History',
      marks: 1,
    },

    // --- Geography (4) ---
    {
      question:
        "Which is the longest river in India?\nভাৰতৰ আটাইতকৈ দীঘল নদী কোনখন?",
      options: [
        'Godavari / গোদাৱৰী',
        'Ganga / গংগা',
        'Brahmaputra / ব্ৰহ্মপুত্ৰ',
        'Yamuna / যমুনা',
      ],
      correctAnswerIndex: 1,
      explanation:
        "The Ganga is the longest river in India, flowing about 2,525 km from Gangotri in Uttarakhand to the Bay of Bengal.\nউত্তৰাখণ্ডৰ গংগোত্ৰীৰ পৰা বংগোপসাগৰলৈ প্ৰায় 2,525 কিলোমিটাৰ বৈ যোৱা গংগা ভাৰতৰ আটাইতকৈ দীঘল নদী।",
      subjectTopic: 'Geography',
      marks: 1,
    },
    {
      question:
        "Through which of the following states does the Tropic of Cancer NOT pass?\nতলৰ কোনখন ৰাজ্যৰ মাজেদি কৰ্কটক্ৰান্তি ৰেখা পাৰ নহয়?",
      options: [
        'Gujarat / গুজৰাট',
        'Rajasthan / ৰাজস্থান',
        'Madhya Pradesh / মধ্য প্ৰদেশ',
        'Kerala / কেৰালা',
      ],
      correctAnswerIndex: 3,
      explanation:
        "The Tropic of Cancer passes through 8 Indian states (Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, Mizoram); Kerala lies south of it.\nকৰ্কটক্ৰান্তি ৰেখাই 8 খন ভাৰতীয় ৰাজ্যৰ মাজেদি পাৰ হয় (গুজৰাট, ৰাজস্থান, মধ্য প্ৰদেশ, ছত্তীছগঢ়, ঝাৰখণ্ড, পশ্চিম বংগ, ত্ৰিপুৰা, মিজোৰাম); কেৰালা ইয়াৰ দক্ষিণত অৱস্থিত।",
      subjectTopic: 'Geography',
      marks: 1,
    },
    {
      question:
        "Which is the highest mountain peak in India?\nভাৰতৰ আটাইতকৈ ওখ পৰ্বত শিখৰ কোনটো?",
      options: [
        'Nanda Devi / নন্দা দেৱী',
        'Kangchenjunga / কাঞ্চনজংঘা',
        'K2 / কে-২',
        'Mount Everest / মাউন্ট এভাৰেষ্ট',
      ],
      correctAnswerIndex: 1,
      explanation:
        "Kangchenjunga (8,586 m) on the Sikkim–Nepal border is the highest peak in India and the third highest in the world.\nচিক্কিম–নেপাল সীমান্তত অৱস্থিত কাঞ্চনজংঘা (8,586 মিটাৰ) ভাৰতৰ আটাইতকৈ ওখ আৰু বিশ্বৰ তৃতীয় ওখ শিখৰ।",
      subjectTopic: 'Geography',
      marks: 1,
    },
    {
      question:
        "Which Indian state has the longest coastline?\nকোনখন ভাৰতীয় ৰাজ্যৰ উপকূলৰেখা আটাইতকৈ দীঘল?",
      options: [
        'Andhra Pradesh / অন্ধ্ৰ প্ৰদেশ',
        'Tamil Nadu / তামিলনাডু',
        'Gujarat / গুজৰাট',
        'Maharashtra / মহাৰাষ্ট্ৰ',
      ],
      correctAnswerIndex: 2,
      explanation:
        "Gujarat has the longest coastline in India, about 1,600 km along the Arabian Sea.\nআৰব সাগৰৰ কাষেদি প্ৰায় 1,600 কিলোমিটাৰ উপকূলৰেখাৰে গুজৰাট ভাৰতৰ আটাইতকৈ দীঘল উপকূল ৰাজ্য।",
      subjectTopic: 'Geography',
      marks: 1,
    },

    // --- Polity (5) ---
    {
      question:
        "Who is the constitutional head of the Indian state?\nভাৰতীয় ৰাষ্ট্ৰৰ সাংবিধানিক মুৰব্বী কোন?",
      options: [
        'Prime Minister / প্ৰধানমন্ত্ৰী',
        'President / ৰাষ্ট্ৰপতি',
        'Chief Justice / মুখ্য ন্যায়াধীশ',
        'Speaker / অধ্যক্ষ',
      ],
      correctAnswerIndex: 1,
      explanation:
        "The President of India is the constitutional head of the state, while executive power is exercised by the Prime Minister-led Council of Ministers.\nভাৰতৰ ৰাষ্ট্ৰপতি ৰাষ্ট্ৰৰ সাংবিধানিক মুৰব্বী, আনহাতে কাৰ্যবাহী ক্ষমতা প্ৰধানমন্ত্ৰীৰ নেতৃত্বাধীন মন্ত্ৰী পৰিষদে প্ৰয়োগ কৰে।",
      subjectTopic: 'Polity',
      marks: 1,
    },
    {
      question:
        "What is the minimum age required to become the President of India?\nভাৰতৰ ৰাষ্ট্ৰপতি হ'বলৈ ন্যূনতম বয়স কিমান?",
      options: [
        '25 years / 25 বছৰ',
        '30 years / 30 বছৰ',
        '18 years / 18 বছৰ',
        '35 years / 35 বছৰ',
      ],
      correctAnswerIndex: 3,
      explanation:
        "Article 58 of the Constitution sets the minimum age for the President at 35 years.\nসংবিধানৰ 58 নং অনুচ্ছেদ অনুসৰি ৰাষ্ট্ৰপতি হ'বলৈ ন্যূনতম বয়স 35 বছৰ।",
      subjectTopic: 'Polity',
      marks: 1,
    },
    {
      question:
        "How many members are nominated to the Rajya Sabha by the President of India?\nভাৰতৰ ৰাষ্ট্ৰপতিয়ে ৰাজ্যসভালৈ কিমানজন সদস্য মনোনীত কৰে?",
      options: ['10 / 10', '14 / 14', '12 / 12', '8 / 8'],
      correctAnswerIndex: 2,
      explanation:
        "The President nominates 12 members to the Rajya Sabha from persons having special knowledge of literature, science, art and social service.\nসাহিত্য, বিজ্ঞান, কলা আৰু সমাজসেৱাৰ বিশেষ জ্ঞান থকা ব্যক্তিসকলৰ পৰা ৰাষ্ট্ৰপতিয়ে ৰাজ্যসভালৈ 12 জন সদস্য মনোনীত কৰে।",
      subjectTopic: 'Polity',
      marks: 1,
    },
    {
      question:
        "How many houses does the Indian Parliament consist of?\nভাৰতীয় সংসদ কিমানটা সদনেৰে গঠিত?",
      options: [
        'One / এটা',
        'Three / তিনিটা',
        'Two / দুটা',
        'Four / চাৰিটা',
      ],
      correctAnswerIndex: 2,
      explanation:
        "The Indian Parliament consists of two houses: the Lok Sabha (Lower House) and the Rajya Sabha (Upper House), along with the President.\nভাৰতীয় সংসদ দুটা সদনেৰে গঠিত: লোকসভা (নিম্ন সদন) আৰু ৰাজ্যসভা (উচ্চ সদন), লগতে ৰাষ্ট্ৰপতি।",
      subjectTopic: 'Polity',
      marks: 1,
    },
    {
      question:
        "Who is the ex-officio Chairman of the Rajya Sabha?\nৰাজ্যসভাৰ পদবি অনুসৰি অধ্যক্ষ কোন?",
      options: [
        'Vice President of India / ভাৰতৰ উপ-ৰাষ্ট্ৰপতি',
        'President / ৰাষ্ট্ৰপতি',
        'Prime Minister / প্ৰধানমন্ত্ৰী',
        'Speaker / অধ্যক্ষ',
      ],
      correctAnswerIndex: 0,
      explanation:
        "Article 64 of the Constitution makes the Vice President of India the ex-officio Chairman of the Rajya Sabha.\nসংবিধানৰ 64 নং অনুচ্ছেদ অনুসৰি ভাৰতৰ উপ-ৰাষ্ট্ৰপতি ৰাজ্যসভাৰ পদবি অনুসৰি অধ্যক্ষ।",
      subjectTopic: 'Polity',
      marks: 1,
    },

    // --- Economy (3) ---
    {
      question:
        "In which year was the Reserve Bank of India established?\nভাৰতীয় ৰিজাৰ্ভ বেংক কোন চনত প্ৰতিষ্ঠা কৰা হৈছিল?",
      options: ['1947 / 1947', '1950 / 1950', '1935 / 1935', '1969 / 1969'],
      correctAnswerIndex: 2,
      explanation:
        "The Reserve Bank of India was established on 1 April 1935 under the RBI Act, 1934; it was nationalised on 1 January 1949.\nভাৰতীয় ৰিজাৰ্ভ বেংক 1935 চনৰ 1 এপ্ৰিলত RBI আইন, 1934 অনুসৰি প্ৰতিষ্ঠা কৰা হৈছিল; 1949 চনৰ 1 জানুৱাৰীত ইয়াক ৰাষ্ট্ৰীয়কৰণ কৰা হয়।",
      subjectTopic: 'Economy',
      marks: 1,
    },
    {
      question:
        "Who is widely regarded as the 'Father of Indian Economic Reforms'?\n'ভাৰতীয় অৰ্থনৈতিক সংস্কাৰৰ জনক' বুলি কাক গণ্য কৰা হয়?",
      options: [
        'Manmohan Singh / মনমোহন সিং',
        'Atal Bihari Vajpayee / অটল বিহাৰী বাজপেয়ী',
        'P. V. Narasimha Rao / পি. ভি. নৰসিংহ ৰাও',
        'Pranab Mukherjee / প্ৰণব মুখাৰ্জী',
      ],
      correctAnswerIndex: 2,
      explanation:
        "As Prime Minister in 1991, P. V. Narasimha Rao, with Finance Minister Manmohan Singh, ushered in India's liberalisation reforms.\n1991 চনত প্ৰধানমন্ত্ৰী হিচাপে পি. ভি. নৰসিংহ ৰাওৱে বিত্তমন্ত্ৰী মনমোহন সিঙৰ সৈতে ভাৰতৰ উদাৰীকৰণ সংস্কাৰ আৰম্ভ কৰিছিল।",
      subjectTopic: 'Economy',
      marks: 1,
    },
    {
      question:
        "Which Five-Year Plan of India gave priority to agriculture and irrigation?\nকোনখন পঞ্চবাৰ্ষিক পৰিকল্পনাই কৃষি আৰু সেঁজুজীয়া সুবিধাক অগ্ৰাধিকাৰ দিছিল?",
      options: [
        'Second Plan / দ্বিতীয় পৰিকল্পনা',
        'Third Plan / তৃতীয় পৰিকল্পনা',
        'Fourth Plan / চতুৰ্থ পৰিকল্পনা',
        'First Plan / প্ৰথম পৰিকল্পনা',
      ],
      correctAnswerIndex: 3,
      explanation:
        "The First Five-Year Plan (1951–56) focused on agriculture, irrigation and power to address food shortages after Independence.\nস্বাধীনতাৰ পিছত খাদ্যাভাৱ দূৰ কৰিবলৈ প্ৰথম পঞ্চবাৰ্ষিক পৰিকল্পনাই (1951–56) কৃষি, সেঁজুজীয়া আৰু বিদ্যুতৰ ওপৰত গুৰুত্ব দিছিল।",
      subjectTopic: 'Economy',
      marks: 1,
    },

    // --- Science (5) ---
    {
      question:
        "What is the chemical symbol for gold?\nসোণৰ ৰাসায়নিক প্ৰতীক কি?",
      options: ['Ag / Ag', 'Gd / Gd', 'Go / Go', 'Au / Au'],
      correctAnswerIndex: 3,
      explanation:
        "The chemical symbol for gold is Au, derived from the Latin word 'aurum' meaning 'shining dawn'.\nসোণৰ ৰাসায়নিক প্ৰতীক Au, যি লেটিন 'aurum' (উজ্জ্বল পোহৰ) শব্দৰ পৰা আহিছে।",
      subjectTopic: 'Science',
      marks: 1,
    },
    {
      question:
        "What is the SI unit of electric current?\nবৈদ্যুতিক প্ৰৱাহৰ SI একক কি?",
      options: [
        'Volt / ভল্ট',
        'Watt / ৱাট',
        'Ampere / এম্পিয়াৰ',
        'Ohm / ওহম',
      ],
      correctAnswerIndex: 2,
      explanation:
        "The SI unit of electric current is the ampere (A), named after French physicist André-Marie Ampère.\nবৈদ্যুতিক প্ৰৱাহৰ SI একক এম্পিয়াৰ (A), যাক ফৰাচী পদাৰ্থবিজ্ঞানী আন্দ্ৰে-মেৰী এম্পিয়াৰৰ নামেৰে নামকৰণ কৰা হৈছে।",
      subjectTopic: 'Science',
      marks: 1,
    },
    {
      question:
        "Which vitamin is produced in the human skin when exposed to sunlight?\nসূৰ্যালোকৰ সংস্পৰ্শলৈ অহাত মানৱ ছালত কোন ভিটামিন উৎপন্ন হয়?",
      options: [
        'Vitamin D / ভিটামিন ডি',
        'Vitamin A / ভিটামিন এ',
        'Vitamin B / ভিটামিন বি',
        'Vitamin C / ভিটামিন চি',
      ],
      correctAnswerIndex: 0,
      explanation:
        "UVB rays in sunlight convert 7-dehydrocholesterol in the skin into Vitamin D3 (cholecalciferol).\nসূৰ্যালোকৰ UVB ৰশ্মিয়ে ছালৰ 7-dehydrocholesterol ক Vitamin D3 (cholecalciferol) লৈ পৰিবৰ্তন কৰে।",
      subjectTopic: 'Science',
      marks: 1,
    },
    {
      question:
        "Which organelle is known as the 'powerhouse of the cell'?\nকোনটো অঙ্গাণুক 'কোষৰ শক্তিগৃহ' বুলি কোৱা হয়?",
      options: [
        'Nucleus / নিউক্লিয়াছ',
        "Ribosome / ৰাইব'জ'ম",
        "Chloroplast / ক্ল'ৰ'প্লাষ্ট",
        "Mitochondria / মাইট'কণ্ড্ৰিয়া",
      ],
      correctAnswerIndex: 3,
      explanation:
        "Mitochondria carry out cellular respiration and produce ATP, the energy currency of the cell.\nমাইট'কণ্ড্ৰিয়াই কোষীয় শ্বসন কৰি ATP উৎপন্ন কৰে, যি কোষৰ শক্তিৰ মুদ্ৰা।",
      subjectTopic: 'Science',
      marks: 1,
    },
    {
      question:
        "What is the approximate speed of light in vacuum?\nশূন্যস্থানত পোহৰৰ প্ৰায় গতিবেগ কিমান?",
      options: [
        '3 × 10^8 m/s / 3 × 10^8 মি/ছে',
        '3 × 10^6 m/s / 3 × 10^6 মি/ছে',
        '3 × 10^10 m/s / 3 × 10^10 মি/ছে',
        '3 × 10^5 m/s / 3 × 10^5 মি/ছে',
      ],
      correctAnswerIndex: 0,
      explanation:
        "The speed of light in vacuum is about 299,792,458 m/s, commonly approximated as 3 × 10^8 m/s.\nশূন্যস্থানত পোহৰৰ গতিবেগ প্ৰায় 299,792,458 মি/ছে, যাক সাধাৰণতে 3 × 10^8 মি/ছে বুলি ধৰা হয়।",
      subjectTopic: 'Science',
      marks: 1,
    },

    // --- Sports (3) ---
    {
      question:
        "How many players from one side are allowed on the field in a cricket match?\nক্ৰিকেট মেচত এফালে কিমানজন খেলুৱৈ মাঠত থাকিব পাৰে?",
      options: ['11 / 11', '9 / 9', '10 / 10', '12 / 12'],
      correctAnswerIndex: 0,
      explanation:
        "A cricket team consists of 11 players on the field at any one time per side.\nএটা ক্ৰিকেট দলত একে সময়ত মাঠত প্ৰতি ফালে 11 জন খেলুৱৈ থাকে।",
      subjectTopic: 'Sports',
      marks: 1,
    },
    {
      question:
        "In which year did India win its first Olympic gold medal in hockey?\nভাৰতে হকীত প্ৰথম অলিম্পিক স্বৰ্ণ পদক কোন চনত লাভ কৰিছিল?",
      options: ['1928 / 1928', '1932 / 1932', '1936 / 1936', '1948 / 1948'],
      correctAnswerIndex: 0,
      explanation:
        "India won its first Olympic hockey gold at the 1928 Amsterdam Olympics, beginning a streak of six consecutive golds.\n1928 চনৰ এমষ্টাৰডাম অলিম্পিকত ভাৰতে প্ৰথম হকী স্বৰ্ণ পদক লাভ কৰে, আৰু তাৰ পিছত একেৰাহে ছয়টা অলিম্পিকত স্বৰ্ণ লাভ কৰে।",
      subjectTopic: 'Sports',
      marks: 1,
    },
    {
      question:
        "Which city hosted the 2024 Summer Olympic Games?\n2024 চনৰ গ্ৰীষ্মকালীন অলিম্পিক খেল কোনখন চহৰে আয়োজন কৰিছিল?",
      options: [
        "Tokyo / টকিঅ'",
        'Paris / পেৰিছ',
        'Los Angeles / লছ এঞ্জেলছ',
        'Beijing / বেইজিং',
      ],
      correctAnswerIndex: 1,
      explanation:
        "Paris hosted the 2024 Summer Olympics (26 July – 11 August 2024), marking the city's third Olympic Games.\nপেৰিছে 2024 চনৰ গ্ৰীষ্মকালীন অলিম্পিক (26 জুলাই – 11 আগষ্ট 2024) আয়োজন কৰিছিল, যি চহৰখনৰ তৃতীয় অলিম্পিক আছিল।",
      subjectTopic: 'Sports',
      marks: 1,
    },

    // --- Books & Authors (2) ---
    {
      question:
        "Who is the author of the autobiography 'Wings of Fire'?\n'উইংছ অৱ ফায়াৰ' আত্মজীৱনীখনৰ লেখক কোন?",
      options: [
        'Jawaharlal Nehru / জৱাহৰলাল নেহৰু',
        'Mahatma Gandhi / মহাত্মা গান্ধী',
        'Rabindranath Tagore / ৰবীন্দ্ৰনাথ ঠাকুৰ',
        'A. P. J. Abdul Kalam / এ. পি. জে. আব্দুল কালাম',
      ],
      correctAnswerIndex: 3,
      explanation:
        "'Wings of Fire' (1999) is the autobiography of Dr. A. P. J. Abdul Kalam, written with Arun Tiwari.\n'উইংছ অৱ ফায়াৰ' (1999) ড° এ. পি. জে. আব্দুল কালামৰ আত্মজীৱনী, যি তেওঁ অৰুণ তিৱাৰীৰ সৈতে লিখিছিল।",
      subjectTopic: 'Books & Authors',
      marks: 1,
    },
    {
      question:
        "Who wrote the novel 'Anandamath', which contains the song 'Vande Mataram'?\n'বন্দে মাতৰম্' গীতটো থকা 'আনন্দমঠ' উপন্যাসখন কোনে লিখিছিল?",
      options: [
        'Rabindranath Tagore / ৰবীন্দ্ৰনাথ ঠাকুৰ',
        'Sarat Chandra Chattopadhyay / শৰৎ চন্দ্ৰ চট্টোপাধ্যায়',
        'Munshi Premchand / মুন্সি প্ৰেমচান্দ',
        'Bankim Chandra Chattopadhyay / বংকিম চন্দ্ৰ চট্টোপাধ্যায়',
      ],
      correctAnswerIndex: 3,
      explanation:
        "Bankim Chandra Chattopadhyay wrote 'Anandamath' in 1882; the song 'Vande Mataram' from it became India's national song.\nবংকিম চন্দ্ৰ চট্টোপাধ্যায়ে 1882 চনত 'আনন্দমঠ' লিখিছিল; ইয়াৰ 'বন্দে মাতৰম্' গীতটো ভাৰতৰ জাতীয় গীত হিচাপে পৰিগণিত হয়।",
      subjectTopic: 'Books & Authors',
      marks: 1,
    },

    // --- Important Days (1) ---
    {
      question:
        "On which date is World Environment Day observed?\nবিশ্ব পৰিৱেশ দিৱস কোন তাৰিখে পালন কৰা হয়?",
      options: [
        '22nd April / 22 এপ্ৰিল',
        '5th June / 5 জুন',
        '16th September / 16 ছেপ্টেম্বৰ',
        '8th March / 8 মাৰ্চ',
      ],
      correctAnswerIndex: 1,
      explanation:
        "World Environment Day has been observed every 5 June since 1974, following the 1972 Stockholm Conference.\n1972 চনৰ ষ্টকহ'ম সন্মিলনৰ পিছত 1974 চনৰ পৰা প্ৰতি বছৰে 5 জুন বিশ্ব পৰিৱেশ দিৱস পালন কৰা হয়।",
      subjectTopic: 'Important Days',
      marks: 1,
    },

    // --- Current Affairs (2) ---
    {
      question:
        "In which year did India's Chandrayaan-3 successfully land on the Moon?\nভাৰতৰ চন্দ্ৰযান-৩ কোন চনত সফলতাৰে চন্দ্ৰত অৱতৰণ কৰিছিল?",
      options: ['2022 / 2022', '2023 / 2023', '2024 / 2024', '2019 / 2019'],
      correctAnswerIndex: 1,
      explanation:
        "Chandrayaan-3's Vikram lander soft-landed near the Moon's south pole on 23 August 2023, making India the first country to do so.\n2023 চনৰ 23 আগষ্টত চন্দ্ৰযান-৩ৰ বিক্ৰম লেণ্ডাৰে চন্দ্ৰৰ দক্ষিণ মেৰুৰ ওচৰত কোমল অৱতৰণ কৰে, যাৰ ফলত ভাৰত এনেকুৰা প্ৰথমখন দেশ হয়।",
      subjectTopic: 'Current Affairs',
      marks: 1,
    },
    {
      question:
        "Which city hosted the G20 Summit in September 2023?\n2023 চনৰ ছেপ্টেম্বৰত G20 শিখৰ সন্মিলন কোনখন চহৰে আয়োজন কৰিছিল?",
      options: [
        'New Delhi / নতুন দিল্লী',
        'Mumbai / মুম্বাই',
        'Bengaluru / বেংগালুৰু',
        'Chennai / চেন্নাই',
      ],
      correctAnswerIndex: 0,
      explanation:
        "India hosted the G20 Summit on 9–10 September 2023 at the Bharat Mandapam in New Delhi, under the theme 'Vasudhaiva Kutumbakam'.\nভাৰতে 2023 চনৰ 9–10 ছেপ্টেম্বৰত নতুন দিল্লীৰ ভাৰত মণ্ডপমত 'বসুধৈৱ কুটুম্বকম্' মূল বিষয়াৰ্থেৰে G20 শিখৰ সন্মিলন আয়োজন কৰিছিল।",
      subjectTopic: 'Current Affairs',
      marks: 1,
    },
  ],
};
