// =============================================================================
// ExamVault — Assam Police PART C
// Bilingual question pool — Assamese Language (police-assamese)
//
// Format (CRITICAL — every field is bilingual EN + অসমীয়া):
//   question  -> "English\nঅসমীয়া"
//   option    -> "English / অসমীয়া"
//   expl      -> "English\nঅসমীয়া"
//
// police-assamese : 30 questions covering অসমীয়া ব্যাকৰণ (সন্ধি, সমাস,
//                   প্ৰকৃতি-প্ৰত্যয়), অসমীয়া সাহিত্য, আৰু বাক্য শুদ্ধি.
// Total = 30 bilingual items.
//
// correctAnswerIndex distribution across 0,1,2,3 for 30 items:
//   0 -> 8,  1 -> 8,  2 -> 7,  3 -> 7  (balanced key for test slicing)
//
// subjectTopic spread: সন্ধি(6), সমাস(6), প্ৰকৃতি-প্ৰত্যয়(6),
//                       সাহিত্য(8), বাক্য শুদ্ধি(4).
//
// Level: HSLC to Graduation (Assam Police Constable / SI recruitment).
// All answers are verifiable from standard Assamese grammar & literature
// references (Hemchandra Barua, Bezbaroa, Jyotiprasad, Bishnuprasad Rabha,
// Bhupen Hazarika, Mamoni Raisom Goswami, Sankardev).
// =============================================================================
import type { QuestionPoolMap } from './structure';

export const POLICE_POOLS_C: QuestionPoolMap = {
  // ===========================================================================
  // police-assamese — Assamese Language (30)
  // ===========================================================================
  'police-assamese': [
    // --- সন্ধি (Sandhi) — 6 ---
    {
      question: "Which type of sandhi is found in the word 'বনানী'?\n'বনানী' শব্দত কোন সন্ধি প্ৰযোজিত হৈছে?",
      options: [
        'Vowel sandhi / স্বৰ সন্ধি',
        'Consonant sandhi / ব্যঞ্জন সন্ধি',
        'Visarga sandhi / বিসৰ্গ সন্ধি',
        'Action sandhi / ক্ৰিয়া সন্ধি',
      ],
      correctAnswerIndex: 0,
      explanation: "'বনানী' = বন + আনী; the two আ vowels merge into one আ, so it is a vowel sandhi (স্বৰ সন্ধি).\n'বনানী' = বন + আনী; আ + আ স্বৰ মিলি এটা আ হোৱাৰ বাবে ই স্বৰ সন্ধি।",
      subjectTopic: 'সন্ধি',
      marks: 1,
    },
    {
      question: "Sandhi viccheda of 'দেৱালয়' yields which two parts?\n'দেৱালয়' শব্দৰ সন্ধি বিচ্ছেদ কৰিলে কি পোৱা যায়?",
      options: [
        'দেব + লয় / দেৱ + লয়',
        'দেৱ + আলয় / দেৱ + আলয়',
        'দেৱা + আলয় / দেৱা + আলয়',
        'দে + বালয় / দে + বালয়',
      ],
      correctAnswerIndex: 1,
      explanation: "'দেৱালয়' = দেৱ + আলয়; অ + আ merge into আ — a vowel sandhi.\n'দেৱালয়' = দেৱ + আলয়; অ + আ মিলি আ হোৱাৰ বাবে স্বৰ সন্ধি।",
      subjectTopic: 'সন্ধি',
      marks: 1,
    },
    {
      question: "Which type of sandhi is found in 'সদ্গতি'?\n'সদ্গতি' শব্দত কোন সন্ধি প্ৰযোজিত হৈছে?",
      options: [
        'Vowel sandhi / স্বৰ সন্ধি',
        'Visarga sandhi / বিসৰ্গ সন্ধি',
        'Consonant sandhi / ব্যঞ্জন সন্ধি',
        'Action sandhi / ক্ৰিয়া সন্ধি',
      ],
      correctAnswerIndex: 2,
      explanation: "'সদ্গতি' = সদ্ + গতি; the visarga of সদ্ is dropped before the consonant গ — a consonant sandhi (ব্যঞ্জন সন্ধি).\n'সদ্গতি' = সদ্ + গতি; সদ্ ৰ বিসৰ্গ ব্যঞ্জন গ ৰ আগত লোপ পায় — ব্যঞ্জন সন্ধি।",
      subjectTopic: 'সন্ধি',
      marks: 1,
    },
    {
      question: "Sandhi viccheda of 'পুনৰুক্তি' yields —\n'পুনৰুক্তি' শব্দৰ সন্ধি বিচ্ছেদ কৰিলে পোৱা যায় —",
      options: [
        'পুন + উক্তি / পুন + উক্তি',
        'পুনৰ + ক্তি / পুনৰ + ক্তি',
        'পুন + ৰুক্তি / পুন + ৰুক্তি',
        'পুনঃ + উক্তি / পুনঃ + উক্তি',
      ],
      correctAnswerIndex: 3,
      explanation: "'পুনৰুক্তি' = পুনঃ + উক্তি; visarga (ঃ) becomes ৰ before the vowel উ — a visarga sandhi (বিসৰ্গ সন্ধি).\n'পুনৰুক্তি' = পুনঃ + উক্তি; বিসৰ্গ উ স্বৰৰ আগত ৰ হৈছে — বিসৰ্গ সন্ধি।",
      subjectTopic: 'সন্ধি',
      marks: 1,
    },
    {
      question: "Sandhi viccheda of 'তদ্ভৱ' yields —\n'তদ্ভৱ' শব্দৰ সন্ধি বিচ্ছেদ কৰিলে পোৱা যায় —",
      options: [
        'তদ্ + ভৱ / তদ্ + ভৱ',
        'ত + দ্ভৱ / ত + দ্ভৱ',
        'তদ + ভৱ / তদ + ভৱ',
        'তদঃ + ভৱ / তদঃ + ভৱ',
      ],
      correctAnswerIndex: 0,
      explanation: "'তদ্ভৱ' = তদ্ + ভৱ; the visarga of তদ্ is elided and দ + ভ combine — a consonant sandhi.\n'তদ্ভৱ' = তদ্ + ভৱ; তদ্ ৰ বিসৰ্গ লোপ পাই দ + ভ মিলে — ব্যঞ্জন সন্ধি।",
      subjectTopic: 'সন্ধি',
      marks: 1,
    },
    {
      question: "Which of the following is an example of vowel sandhi (স্বৰ সন্ধি)?\nতলৰ কোনটো স্বৰ সন্ধিৰ উদাহৰণ?",
      options: [
        'সদ্গতি / সদ্গতি',
        'বিদ্যালয় / বিদ্যালয়',
        'তদ্ভৱ / তদ্ভৱ',
        'পুনৰুক্তি / পুনৰুক্তি',
      ],
      correctAnswerIndex: 1,
      explanation: "'বিদ্যালয়' = বিদ্যা + আলয়; the two আ vowels merge into one আ — vowel sandhi.\n'বিদ্যালয়' = বিদ্যা + আলয়; আ + আ স্বৰ মিলি এটা আ হোৱাৰ বাবে স্বৰ সন্ধি।",
      subjectTopic: 'সন্ধি',
      marks: 1,
    },

    // --- সমাস (Samas) — 6 ---
    {
      question: "Which type of samas is 'চকু-পানী' (tears)?\n'চকু-পানী' (অশ্ৰু) শব্দটো কোন সমাসৰ উদাহৰণ?",
      options: [
        'Karmadharay / কৰ্মধাৰয়',
        'Bahubrihi / বহুব্ৰীহি',
        'Dwandwa / দ্বন্দ্ব',
        'Digu / দ্বিগু',
      ],
      correctAnswerIndex: 2,
      explanation: "'চকু-পানী' combines চকু (eye) and পানী (water) as two equal members — Dwandwa samas (দ্বন্দ্ব সমাস).\n'চকু-পানী' ত চকু আৰু পানী শব্দ দুটা সমান সদস্য হিচাপে যুক্ত হৈছে — দ্বন্দ্ব সমাস।",
      subjectTopic: 'সমাস',
      marks: 1,
    },
    {
      question: "Which type of samas is 'নীলকমল' (blue lotus)?\n'নীলকমল' (নীলা পদুম) শব্দটো কোন সমাসৰ উদাহৰণ?",
      options: [
        'Dwandwa / দ্বন্দ্ব',
        'Digu / দ্বিগু',
        'Bahubrihi / বহুব্ৰীহি',
        'Karmadharay / কৰ্মধাৰয়',
      ],
      correctAnswerIndex: 3,
      explanation: "'নীলকমল' = নীল কমল; the adjective নীল qualifies the noun কমল — Karmadharay samas (কৰ্মধাৰয় সমাস).\n'নীলকমল' = নীল কমল; নীল বিশেষণে কমল বিশেষ্যক বৰ্ণনা কৰে — কৰ্মধাৰয় সমাস।",
      subjectTopic: 'সমাস',
      marks: 1,
    },
    {
      question: "Which type of samas is 'চৌকোণ' (four-cornered)?\n'চৌকোণ' (চাৰিকোণীয়া) শব্দটো কোন সমাসৰ উদাহৰণ?",
      options: [
        'Digu / দ্বিগু',
        'Dwandwa / দ্বন্দ্ব',
        'Tatpurush / তৎপুৰুষ',
        'Avyayibhav / অব্যয়ীভাৱ',
      ],
      correctAnswerIndex: 0,
      explanation: "'চৌকোণ' = চৌ (চাৰি) + কোণ; the numeral চাৰি precedes the noun কোণ — Digu samas (দ্বিগু সমাস).\n'চৌকোণ' = চৌ (চাৰি) + কোণ; সংখ্যাবাচক শব্দ আগত থকাৰ বাবে দ্বিগু সমাস।",
      subjectTopic: 'সমাস',
      marks: 1,
    },
    {
      question: "Which type of samas is 'পঞ্চানন' (a name of Shiva, meaning five-faced)?\n'পঞ্চানন' (শিৱৰ নাম, পাঁচ মুখমণ্ডলযুক্ত) শব্দটো কোন সমাসৰ উদাহৰণ?",
      options: [
        'Karmadharay / কৰ্মধাৰয়',
        'Bahubrihi / বহুব্ৰীহি',
        'Digu / দ্বিগু',
        'Dwandwa / দ্বন্দ্ব',
      ],
      correctAnswerIndex: 1,
      explanation: "'পঞ্চানন' = পঞ্চ + আনন; although a numeral precedes, the meaning denotes a person whose faces are five — Bahubrihi samas (বহুব্ৰীহি সমাস).\n'পঞ্চানন' = পঞ্চ + আনন; সংখ্যাবাচক শব্দ থাকিলেও ব্যক্তিবাচক অৰ্থ বুজোৱা বাবে বহুব্ৰীহি সমাস।",
      subjectTopic: 'সমাস',
      marks: 1,
    },
    {
      question: "Which type of samas is 'প্ৰাগৈতিহাসিক' (prehistoric)?\n'প্ৰাগৈতিহাসিক' শব্দটো কোন সমাসৰ উদাহৰণ?",
      options: [
        'Tatpurush / তৎপুৰুষ',
        'Digu / দ্বিগু',
        'Avyayibhav / অব্যয়ীভাৱ',
        'Dwandwa / দ্বন্দ্ব',
      ],
      correctAnswerIndex: 2,
      explanation: "'প্ৰাগৈতিহাসিক' begins with the indeclinable prefix প্ৰ; an avyaya precedes the noun — Avyayibhav samas (অব্যয়ীভাৱ সমাস).\n'প্ৰাগৈতিহাসিক' শব্দৰ আগত অব্যয় প্ৰ থাকে — অব্যয়ীভাৱ সমাস।",
      subjectTopic: 'সমাস',
      marks: 1,
    },
    {
      question: "Which type of samas is 'ৰাজপুত্ৰ' (prince)?\n'ৰাজপুত্ৰ' (ৰজাৰ পুত্ৰ) শব্দটো কোন সমাসৰ উদাহৰণ?",
      options: [
        'Digu / দ্বিগু',
        'Bahubrihi / বহুব্ৰীহি',
        'Avyayibhav / অব্যয়ীভাৱ',
        'Tatpurush / তৎপুৰুষ',
      ],
      correctAnswerIndex: 3,
      explanation: "'ৰাজপুত্ৰ' = ৰাজ + পুত্ৰ; the genitive relation (king's son) is expressed by a case-ending — Tatpurush samas (তৎপুৰুষ সমাস).\n'ৰাজপুত্ৰ' = ৰাজ + পুত্ৰ; সম্বন্ধ ষষ্ঠী বিভক্তিৰ দ্বাৰা প্ৰকাশ পায় — তৎপুৰুষ সমাস।",
      subjectTopic: 'সমাস',
      marks: 1,
    },

    // --- প্ৰকৃতি-প্ৰত্যয় (Prakriti-Pratyay) — 6 ---
    {
      question: "Which type of pratyay is found in 'শিক্ষক' (teacher)?\n'শিক্ষক' শব্দত কোন প্ৰত্যয় প্ৰযোজিত হৈছে?",
      options: [
        'Krit pratyay / কৃৎ প্ৰত্যয়',
        'Taddhit pratyay / তদ্ধিত প্ৰত্যয়',
        'Stri pratyay / স্ত্ৰী প্ৰত্যয়',
        'Prefix / উপসৰ্গ',
      ],
      correctAnswerIndex: 0,
      explanation: "'শিক্ষক' = শিক্ষ্ + অক; the suffix অক is added to the verbal root শিক্ষ্ — Krit pratyay (কৃৎ প্ৰত্যয়).\n'শিক্ষক' = শিক্ষ্ + অক; শিক্ষ্ ধাতুৰ লগত অক প্ৰত্যয় যোগ হৈছে — কৃৎ প্ৰত্যয়।",
      subjectTopic: 'প্ৰকৃতি-প্ৰত্যয়',
      marks: 1,
    },
    {
      question: "Which type of pratyay is found in 'অসমীয়া' (Assamese)?\n'অসমীয়া' শব্দত কোন প্ৰত্যয় প্ৰযোজিত হৈছে?",
      options: [
        'Krit pratyay / কৃৎ প্ৰত্যয়',
        'Taddhit pratyay / তদ্ধিত প্ৰত্যয়',
        'Stri pratyay / স্ত্ৰী প্ৰত্যয়',
        'Prefix / উপসৰ্গ',
      ],
      correctAnswerIndex: 1,
      explanation: "'অসমীয়া' = অসম + ঈয়; the suffix ঈয় is added to the noun অসম — Taddhit pratyay (তদ্ধিত প্ৰত্যয়).\n'অসমীয়া' = অসম + ঈয়; অসম নামৰ পৰা ঈয় প্ৰত্যয় যোগ হৈছে — তদ্ধিত প্ৰত্যয়।",
      subjectTopic: 'প্ৰকৃতি-প্ৰত্যয়',
      marks: 1,
    },
    {
      question: "Prakriti-pratyay bichcheda of 'লেখক' (writer) yields —\n'লেখক' শব্দৰ প্ৰকৃতি-প্ৰত্যয় বিচ্ছেদ কৰিলে পোৱা যায় —",
      options: [
        'লিখ + অন / লিখ + অন',
        'লেখ + ক / লেখ + ক',
        'লিখ্ + অক / লিখ্ + অক',
        'লেখক + অ / লেখক + অ',
      ],
      correctAnswerIndex: 2,
      explanation: "'লেখক' = লিখ্ + অক; the verbal root লিখ্ takes the Krit suffix অক denoting the agent.\n'লেখক' = লিখ্ + অক; লিখ্ ধাতুৰ লগত কৃৎ প্ৰত্যয় অক যোগ হৈছে।",
      subjectTopic: 'প্ৰকৃতি-প্ৰত্যয়',
      marks: 1,
    },
    {
      question: "Which type of pratyay is found in 'বৈষ্ণৱ' (Vaishnav)?\n'বৈষ্ণৱ' শব্দত কোন প্ৰত্যয় প্ৰযোজিত হৈছে?",
      options: [
        'Krit pratyay / কৃৎ প্ৰত্যয়',
        'Stri pratyay / স্ত্ৰী প্ৰত্যয়',
        'Prefix / উপসৰ্গ',
        'Taddhit pratyay / তদ্ধিত প্ৰত্যয়',
      ],
      correctAnswerIndex: 3,
      explanation: "'বৈষ্ণৱ' = বিষ্ণু + অ; the suffix অ is added to the noun বিষ্ণু — Taddhit pratyay (তদ্ধিত প্ৰত্যয়).\n'বৈষ্ণৱ' = বিষ্ণু + অ; বিষ্ণু নামৰ পৰা অ প্ৰত্যয় যোগ হৈছে — তদ্ধিত প্ৰত্যয়।",
      subjectTopic: 'প্ৰকৃতি-প্ৰত্যয়',
      marks: 1,
    },
    {
      question: "Prakriti-pratyay bichcheda of 'কৃষক' (farmer) yields —\n'কৃষক' শব্দৰ প্ৰকৃতি-প্ৰত্যয় বিচ্ছেদ কৰিলে পোৱা যায় —",
      options: [
        'কৃষ্ + অক / কৃষ্ + অক',
        'কৃষ + ক / কৃষ + ক',
        'কৃষি + অক / কৃষি + অক',
        'কৃ + ষক / কৃ + ষক',
      ],
      correctAnswerIndex: 0,
      explanation: "'কৃষক' = কৃষ্ + অক; the verbal root কৃষ্ (to plough) takes the Krit suffix অক denoting the agent.\n'কৃষক' = কৃষ্ + অক; কৃষ্ (কৰ্ষণ কৰা) ধাতুৰ লগত অক প্ৰত্যয় যোগ হৈ কৰ্তা বুজায়।",
      subjectTopic: 'প্ৰকৃতি-প্ৰত্যয়',
      marks: 1,
    },
    {
      question: "Which pratyay denotes the feminine form in Assamese?\nঅসমীয়া ভাষাত স্ত্ৰীলিঙ্গ বুজাবলৈ কোন প্ৰত্যয় ব্যৱহাৰ কৰা হয়?",
      options: [
        'Krit pratyay / কৃৎ প্ৰত্যয়',
        'Stri pratyay / স্ত্ৰী প্ৰত্যয়',
        'Taddhit pratyay / তদ্ধিত প্ৰত্যয়',
        'Sandhi / সন্ধি',
      ],
      correctAnswerIndex: 1,
      explanation: "The Stri pratyay (স্ত্ৰী প্ৰত্যয়) — e.g. ঈ, আনী, নী — is added to denote the feminine form (e.g. ছাত্ৰ + ঈ = ছাত্ৰী).\nস্ত্ৰী প্ৰত্যয় (যেনে ঈ, আনী, নী) যোগ কৰি স্ত্ৰীলিঙ্গ বুজোৱা হয় (যেনে ছাত্ৰ + ঈ = ছাত্ৰী)।",
      subjectTopic: 'প্ৰকৃতি-প্ৰত্যয়',
      marks: 1,
    },

    // --- সাহিত্য (Literature) — 8 ---
    {
      question: "Who directed the first Assamese film 'Joymoti' (1935)?\nপ্ৰথম অসমীয়া চলচ্চিত্ৰ 'জয়মতী' (১৯৩৫) কোনে পৰিচালনা কৰিছিল?",
      options: [
        'Bishnuprasad Rabha / বিষ্ণুপ্ৰসাদ ৰাভা',
        'Bhupen Hazarika / ভূপেন হাজৰিকা',
        'Jyotiprasad Agarwala / জ্যোতিপ্ৰসাদ আগৰৱালা',
        'Lakshminath Bezbaroa / লক্ষ্মীনাথ বেজবৰুয়া',
      ],
      correctAnswerIndex: 2,
      explanation: "Jyotiprasad Agarwala directed 'Joymoti' in 1935 — the first Assamese feature film.\nজ্যোতিপ্ৰসাদ আগৰৱালাই ১৯৩৫ চনত 'জয়মতী' পৰিচালনা কৰিছিল — প্ৰথম অসমীয়া চলচ্চিত্ৰ।",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },
    {
      question: "By what title is Jyotiprasad Agarwala popularly known?\nজ্যোতিপ্ৰসাদ আগৰৱালাক জনপ্ৰিয়ভাৱে কি উপাধি দিয়া হৈছে?",
      options: [
        'Kalaguru / কলাগুৰু',
        'Sahityarathi / সাহিত্যৰথী',
        'Bard of Brahmaputra / ব্ৰহ্মপুত্ৰৰ বৰগীত',
        'Rupkonwar / ৰূপকোঁৱৰ',
      ],
      correctAnswerIndex: 3,
      explanation: "Jyotiprasad Agarwala is honoured with the title 'Rupkonwar' (ৰূপকোঁৱৰ) for his pioneering contribution to Assamese cinema and culture.\nঅসমীয়া চলচ্চিত্ৰ আৰু সংস্কৃতিলৈ আগবঢ়োৱা অৱদানৰ বাবে জ্যোতিপ্ৰসাদ আগৰৱালাক 'ৰূপকোঁৱৰ' উপাধি দিয়া হৈছে।",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },
    {
      question: "By what title is Bishnuprasad Rabha popularly known?\nবিষ্ণুপ্ৰসাদ ৰাভাক জনপ্ৰিয়ভাৱে কি উপাধি দিয়া হৈছে?",
      options: [
        'Kalaguru / কলাগুৰু',
        'Rupkonwar / ৰূপকোঁৱৰ',
        'Sahityarathi / সাহিত্যৰথী',
        'Mahapurush / মহাপুৰুষ',
      ],
      correctAnswerIndex: 0,
      explanation: "Bishnuprasad Rabha is honoured as 'Kalaguru' (কলাগুৰু) for his versatile contribution to art, music and dance.\nকলা, সংগীত আৰু নৃত্যলৈ আগবঢ়োৱা বহুমুখী অৱদানৰ বাবে বিষ্ণুপ্ৰসাদ ৰাভাক 'কলাগুৰু' উপাধি দিয়া হৈছে।",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },
    {
      question: "Dr. Bhupen Hazarika is popularly known as —\nড॰ ভূপেন হাজৰিকাক জনপ্ৰিয়ভাৱে কি বুলি জনা যায়?",
      options: [
        'Rupkonwar / ৰূপকোঁৱৰ',
        'Bard of Brahmaputra / ব্ৰহ্মপুত্ৰৰ বৰগীত',
        'Kalaguru / কলাগুৰু',
        'Sahityarathi / সাহিত্যৰথী',
      ],
      correctAnswerIndex: 1,
      explanation: "Dr. Bhupen Hazarika is lovingly called the 'Bard of Brahmaputra' for his timeless songs about the river and its people.\nব্ৰহ্মপুত্ৰ নদী আৰু ইয়াৰ পাৰৰ মানুহৰ কথা বৰ্ণনা কৰা অমৰ গীতসমূহৰ বাবে ড॰ ভূপেন হাজৰিকাক 'ব্ৰহ্মপুত্ৰৰ বৰগীত' বুলি জনা যায়।",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },
    {
      question: "By what title is Lakshminath Bezbaroa honoured?\nলক্ষ্মীনাথ বেজবৰুয়াক কি উপাধি দিয়া হৈছে?",
      options: [
        'Rupkonwar / ৰূপকোঁৱৰ',
        'Kalaguru / কলাগুৰু',
        'Sahityarathi / সাহিত্যৰথী',
        'Mahapurush / মহাপুৰুষ',
      ],
      correctAnswerIndex: 2,
      explanation: "Lakshminath Bezbaroa is honoured as 'Sahityarathi' (সাহিত্যৰথী) — the charioteer of Assamese literature.\nঅসমীয়া সাহিত্যলৈ আগবঢ়োৱা অৱদানৰ বাবে লক্ষ্মীনাথ বেজবৰুয়াক 'সাহিত্যৰথী' উপাধি দিয়া হৈছে।",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },
    {
      question: "Mamoni Raisom Goswami was honoured with which prestigious literary award?\nমামণি ৰয়ছম গোস্বামীক কোন বঁটাৰে সন্মানিত কৰা হৈছিল?",
      options: [
        'Sahitya Akademi Award only / কেৱল সাহিত্য অকাডেমি বঁটা',
        'Padma Shri only / কেৱল পদ্মশ্ৰী',
        'National Film Award / ৰাষ্ট্ৰীয় চলচ্চিত্ৰ বঁটা',
        'Jnanpith Award / জ্ঞানপীঠ বঁটা',
      ],
      correctAnswerIndex: 3,
      explanation: "Mamoni Raisom Goswami received the Jnanpith Award (2000) — the highest Indian literary honour — for her outstanding contribution to Assamese literature.\nঅসমীয়া সাহিত্যলৈ আগবঢ়োৱা অসামান্য অৱদানৰ বাবে মামণি ৰয়ছম গোস্বামীয়ে জ্ঞানপীঠ বঁটা (২০০০) লাভ কৰিছিল।",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },
    {
      question: "Who compiled the first comprehensive Assamese dictionary 'Hemkosh'?\nপ্ৰথম সম্পূৰ্ণ অসমীয়া অভিধান 'হেমকোষ' কোনে ৰচনা কৰিছিল?",
      options: [
        'Hemchandra Barua / হেমচন্দ্ৰ বৰুয়া',
        'Lakshminath Bezbaroa / লক্ষ্মীনাথ বেজবৰুয়া',
        'Miles Bronson / মাইলছ ব্ৰনছন',
        'Anandaram Dhekial Phukan / আনন্দৰাম ঢেকিয়াল ফুকন',
      ],
      correctAnswerIndex: 0,
      explanation: "Hemchandra Barua compiled 'Hemkosh' (হেমকোষ) — the first comprehensive Assamese dictionary, published posthumously in 1900.\nহেমচন্দ্ৰ বৰুয়াই 'হেমকোষ' ৰচনা কৰিছিল — প্ৰথম সম্পূৰ্ণ অসমীয়া অভিধান, যাক ১৯০০ চনত মৰণোত্তৰভাৱে প্ৰকাশ কৰা হৈছিল।",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },
    {
      question: "Sankardev is revered by which title in Assamese Vaishnavite tradition?\nঅসমীয়া বৈষ্ণৱ পৰম্পৰাত শংকৰদেৱক কি উপাধিৰে সন্মান কৰা হয়?",
      options: [
        'Kalaguru / কলাগুৰু',
        'Mahapurush / মহাপুৰুষ',
        'Rupkonwar / ৰূপকোঁৱৰ',
        'Sahityarathi / সাহিত্যৰথী',
      ],
      correctAnswerIndex: 1,
      explanation: "Sankardev, the 15th–16th century saint-reformer who founded Ekasarana Vaishnavism in Assam, is reverently called 'Mahapurush' (মহাপুৰুষ).\n১৫শ–১৬শ শতিকাৰ সন্ত-সংস্কাৰক শংকৰদেৱ, যিয়ে অসমত একশৰণ বৈষ্ণৱ ধৰ্ম প্ৰতিষ্ঠা কৰিছিল, তেওঁক শ্ৰদ্ধাৰে 'মহাপুৰুষ' বুলি জনা যায়।",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },

    // --- বাক্য শুদ্ধি (Sentence Correction) — 4 ---
    {
      question: "Which sentence correctly uses the anusvara in the first-person present-perfect form?\nপ্ৰথম পুৰুষ বৰ্তমান পূৰ্ণঘটিত ৰূপত শুদ্ধ অনুস্বাৰ ব্যৱহৃত বাক্য কোনটো?",
      options: [
        'মই ভাত খাইছো / মই ভাত খাইছো',
        'মই ভাত খাইছা / মই ভাত খাইছা',
        'মই ভাত খাইছোঁ / মই ভাত খাইছোঁ',
        'মই ভাত খাইছে / মই ভাত খাইছে',
      ],
      correctAnswerIndex: 2,
      explanation: "In the first-person present-perfect, the verb ends in ছোঁ (with anusvara) — 'মই ভাত খাইছোঁ' is the correct form.\nপ্ৰথম পুৰুষ বৰ্তমান পূৰ্ণঘটিত ৰূপত ক্ৰিয়াৰ শেষত অনুস্বাৰযুক্ত ছোঁ হয় — 'মই ভাত খাইছোঁ' শুদ্ধ ৰূপ।",
      subjectTopic: 'বাক্য শুদ্ধি',
      marks: 1,
    },
    {
      question: "Which sentence uses the correct ergative case-marker for the plural subject with a transitive verb?\nসকৰ্মক ক্ৰিয়াৰ সৈতে বহুবচন কৰ্তাৰ বাবে শুদ্ধ কৰ্তৃকাৰক বিভক্তি ব্যৱহৃত বাক্য কোনটো?",
      options: [
        'তেওঁলোক কাম কৰে / তেওঁলোক কাম কৰে',
        'তেওঁলোকৰ কাম কৰে / তেওঁলোকৰ কাম কৰে',
        'তেওঁলোকক কাম কৰে / তেওঁলোকক কাম কৰে',
        'তেওঁলোকে কাম কৰে / তেওঁলোকে কাম কৰে',
      ],
      correctAnswerIndex: 3,
      explanation: "With a transitive verb in the present/habitual tense, the plural subject তেওঁলোক takes the ergative marker এ — hence 'তেওঁলোকে কাম কৰে' is correct.\nবৰ্তমান/অভ্যাসমূলক কালত সকৰ্মক ক্ৰিয়াৰ সৈতে বহুবচন কৰ্তা তেওঁলোক ৰ লগত এ কাৰক বিভক্তি লাগে — 'তেওঁলোকে কাম কৰে' শুদ্ধ।",
      subjectTopic: 'বাক্য শুদ্ধি',
      marks: 1,
    },
    {
      question: "Which sentence correctly uses the locative case ending 'ত' to mean 'in the sky'?\n'আকাশত' অৰ্থ বুজাবলৈ শুদ্ধ সপ্তমী বিভক্তি 'ত' ব্যৱহৃত বাক্য কোনটো?",
      options: [
        'আকাশত বৰষুণ বৰিছে / আকাশত বৰষুণ বৰিছে',
        'আকাশে বৰষুণ বৰিছে / আকাশে বৰষুণ বৰিছে',
        'আকাশৰে বৰষুণ বৰিছে / আকাশৰে বৰষুণ বৰিছে',
        'আকাশলৈ বৰষুণ বৰিছে / আকাশলৈ বৰষুণ বৰিছে',
      ],
      correctAnswerIndex: 0,
      explanation: "The locative case ending ত (সপ্তমী বিভক্তি) denotes 'in/on'; hence 'আকাশত বৰষুণ বৰিছে' is correct.\nসপ্তমী বিভক্তিৰ ত প্ৰত্যয়ে 'ভিতৰত/ওপৰত' বুজায়; সেয়ে 'আকাশত বৰষুণ বৰিছে' শুদ্ধ।",
      subjectTopic: 'বাক্য শুদ্ধি',
      marks: 1,
    },
    {
      question: "Which sentence correctly uses the dative case ending 'ক' with the pronoun 'তেওঁ' (to him)?\n'তেওঁ' সৰ্বনামৰ লগত দ্বিতীয়া কাৰকৰ 'ক' বিভক্তি শুদ্ধভাৱে ব্যৱহৃত বাক্য কোনটো?",
      options: [
        'মই তেওঁ কিতাপ দিলোঁ / মই তেওঁ কিতাপ দিলোঁ',
        'মই তেওঁক কিতাপ দিলোঁ / মই তেওঁক কিতাপ দিলোঁ',
        'মই তেওঁৰ কিতাপ দিলোঁ / মই তেওঁৰ কিতাপ দিলোঁ',
        'মই তেওঁলৈ কিতাপ দিলোঁ / মই তেওঁলৈ কিতাপ দিলোঁ',
      ],
      correctAnswerIndex: 1,
      explanation: "With a verb of giving (দিয়া), the recipient takes the dative/accusative ending ক, hence 'তেওঁক' is correct; 'তেওঁলৈ' is used only with verbs of motion (যোৱা/আহা).\nদিয়া ক্ৰিয়াৰ সৈতে প্ৰাপকে ক বিভক্তি লয়, সেয়ে 'তেওঁক' শুদ্ধ; 'তেওঁলৈ' কেৱল গতি বুজোৱা ক্ৰিয়াৰ (যোৱা/আহা) লগতহে ব্যৱহৃত হয়।",
      subjectTopic: 'বাক্য শুদ্ধি',
      marks: 1,
    },
  ],
};
