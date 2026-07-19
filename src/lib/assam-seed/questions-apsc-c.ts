// =============================================================================
// ExamVault — APSC (Assam Public Service Commission) PART C
// Bilingual question pool — Economy (apsc-economy)
//
// Format (CRITICAL — every field is bilingual EN + অসমীয়া):
//   question  -> "English\nঅসমীয়া"
//   option    -> "English / অসমীয়া"
//   expl      -> "English\nঅসমীয়া"
//
// apsc-economy : 40 questions (Indian Economy, Banking, Assam Economy,
//                                Agriculture, Industry, Budget)
//
// correctAnswerIndex is distributed evenly (10 × 0, 10 × 1, 10 × 2, 10 × 3)
// so test slicing produces a balanced answer key.
// =============================================================================
import type { QuestionPoolMap } from './structure';

export const APSC_POOLS_C: QuestionPoolMap = {
  // ===========================================================================
  // apsc-economy — Economy (40)
  // ===========================================================================
  'apsc-economy': [
    // --- Indian Economy (10) ---
    {
      question: "NITI Aayog was established in which year?\nনীতি আয়োগ কতবাৰত প্ৰতিষ্ঠা কৰা হৈছিল?",
      options: [
        '2015 / ২০১৫',
        '2014 / ২০১৪',
        '2016 / ২০১৬',
        '2017 / ২০১৭',
      ],
      correctAnswerIndex: 0,
      explanation: "NITI Aayog was constituted on 1 January 2015, replacing the erstwhile Planning Commission, as the Government of India's premier policy think-tank.\nনীতি আয়োগ ১ জানুৱাৰী ২০১৫ত পূৰ্বৰ পৰিকল্পনা আয়োগৰ ঠাইত ভাৰত চৰকাৰৰ শীৰ্ষ নীতি-চিন্তামন্ত্ৰী সংস্থা হিচাপে গঠন কৰা হৈছিল।",
      subjectTopic: 'Indian Economy',
      marks: 2,
    },
    {
      question: "India's First Five Year Plan covered which period?\nভাৰতৰ প্ৰথম পঞ্চবাৰ্ষিক পৰিকল্পনা কোন সময়ছোৱাক সামৰি লৈছিল?",
      options: [
        '1951–1956 / ১৯৫১–১৯৫৬',
        '1947–1952 / ১৯৪৭–১৯৫২',
        '1950–1955 / ১৯৫০–১৯৫৫',
        '1952–1957 / ১৯৫২–১৯৫৭',
      ],
      correctAnswerIndex: 0,
      explanation: "The First Five Year Plan of India covered the period 1951–1956 and focused on agriculture, irrigation and power, modeled on the Harrod–Domar model.\nভাৰতৰ প্ৰথম পঞ্চবাৰ্ষিক পৰিকল্পনাই ১৯৫১–১৯৫৬ সময়ছোৱাক সামৰি লৈছিল আৰু কৃষি, জলসিঞ্চন আৰু শক্তিৰ ওপৰত গুৰুত্ব আৰোপ কৰিছিল; ই হেৰ'ড–ডোমাৰ আৰ্হিৰ ওপৰত আধাৰিত আছিল।",
      subjectTopic: 'Indian Economy',
      marks: 2,
    },
    {
      question: "India's economic liberalisation (LPG reforms) was launched in which year?\nভাৰতৰ অৰ্থনৈতিক উদাৰীকৰণ (LPG সংস্কাৰ) কতবাৰত আৰম্ভ কৰা হৈছিল?",
      options: [
        '1985 / ১৯৮৫',
        '1989 / ১৯৮৯',
        '1995 / ১৯৯৫',
        '1991 / ১৯৯১',
      ],
      correctAnswerIndex: 3,
      explanation: "The LPG (Liberalisation, Privatisation, Globalisation) reforms were launched in 1991 under Prime Minister P.V. Narasimha Rao and Finance Minister Dr. Manmohan Singh to address a severe balance-of-payments crisis.\nভাৰতৰ ভাৰাসম্পত্তি সংকটৰ সমাধানৰ বাবে ১৯৯১ত প্ৰধানমন্ত্ৰী পি.ভি. নৰসিংহ ৰাও আৰু বিত্তমন্ত্ৰী ড° মনমোহন সিঙৰ অধীনত উদাৰীকৰণ, ব্যক্তিকৰণ আৰু বিশ্বায়ন (LPG) সংস্কাৰ আৰম্ভ কৰা হৈছিল।",
      subjectTopic: 'Indian Economy',
      marks: 2,
    },
    {
      question: "What is the current base year for calculating India's GDP?\nভাৰতৰ জিডিপি গণনাৰ বাবে বৰ্তমানৰ আধাৰ বছৰ কি?",
      options: [
        '2004–05 / ২০০৪–০৫',
        '2009–10 / ২০০৯–১০',
        '2014–15 / ২০১৪–১৫',
        '2011–12 / ২০১১–১২',
      ],
      correctAnswerIndex: 3,
      explanation: "The Central Statistics Office (CSO, now NSO) revised the base year for GDP calculation from 2004–05 to 2011–12 in 2015, introducing the new series of national accounts.\nকেন্দ্ৰীয় পৰিসাংখ্যিক কাৰ্যালয়ে (বৰ্তমান NSO) ২০১৫ত জিডিপি গণনাৰ আধাৰ বছৰ ২০০৪–০৫ৰ পৰা ২০১১–১২লৈ সলনি কৰি নতুন ৰাষ্ট্ৰীয় হিচাপ শৃংখলা আগবঢ়াইছিল।",
      subjectTopic: 'Indian Economy',
      marks: 2,
    },
    {
      question: "Which body replaced the Planning Commission of India?\nভাৰতৰ পৰিকল্পনা আয়োগৰ ঠাই কোনখনে লৈছিল?",
      options: [
        'Finance Commission / বিত্ত আয়োগ',
        'Election Commission / নিৰ্বাচন আয়োগ',
        'Reserve Bank of India / ভাৰতীয় ৰিজাৰ্ভ বেংক',
        'NITI Aayog / নীতি আয়োগ',
      ],
      correctAnswerIndex: 3,
      explanation: "The Planning Commission, established in 1950, was replaced by NITI Aayog on 1 January 2015 to serve as a policy think-tank with a bottom-up approach.\n১৯৫০ত প্ৰতিষ্ঠিত পৰিকল্পনা আয়োগক ১ জানুৱাৰী ২০১৫ত নীতি আয়োগে সলনি কৰিছিল, যাক তলৰ পৰা ওপৰলৈ যোৱা নীতি-চিন্তা সংস্থা হিচাপে গঢ়ি তোলা হৈছিল।",
      subjectTopic: 'Indian Economy',
      marks: 2,
    },
    {
      question: "Who coined the term 'Hindu rate of growth'?\n'হিন্দু বৃদ্ধিৰ হাৰ' শব্দটো কোনে প্ৰথম ব্যৱহাৰ কৰিছিল?",
      options: [
        'Raj Krishna / ৰাজ কৃষ্ণ',
        'Amartya Sen / অমৰ্ত্য সেন',
        'V.K.R.V. Rao / ভি.কে.আৰ.ভি. ৰাও',
        'Manmohan Singh / মনমোহন সিং',
      ],
      correctAnswerIndex: 0,
      explanation: "Indian economist Raj Krishna coined the phrase 'Hindu rate of growth' in 1978 to describe India's low annual growth of about 3.5% from the 1950s to the 1980s.\nভাৰতীয় অৰ্থনীতিবিদ ৰাজ কৃষ্ণই ১৯৭৮ত 'হিন্দু বৃদ্ধিৰ হাৰ' শব্দটো ব্যৱহাৰ কৰি ১৯৫০ৰ দশকৰ পৰা ১৯৮০ৰ দশকলৈ ভাৰতৰ প্ৰায় ৩.৫% বাৰ্ষিক বৃদ্ধিৰ হাৰ বুজাইছিল।",
      subjectTopic: 'Indian Economy',
      marks: 2,
    },
    {
      question: "The Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) was enacted in which year?\nমহাত্মা গান্ধী ৰাষ্ট্ৰীয় গ্ৰাম্য নিয়োগ গেৰাণ্টী আইন (MGNREGA) কতবাৰত প্ৰণয়ন কৰা হৈছিল?",
      options: [
        '2001 / ২০০১',
        '2003 / ২০০৩',
        '2005 / ২০০৫',
        '2008 / ২০০৮',
      ],
      correctAnswerIndex: 2,
      explanation: "MGNREGA was enacted in September 2005 and provides a legal guarantee of 100 days of wage employment per year to rural households; it is the largest social-security scheme in the world.\nMGNREGA ২০০৫ৰ ছেপ্টেম্বৰত প্ৰণয়ন কৰা হৈছিল আৰু ই গ্ৰাম্য পৰিয়ালক বছৰি ১০০ দিনৰ মজুৰি নিয়োগৰ আইনী গেৰাণ্টী প্ৰদান কৰে; এইটো বিশ্বৰ আটাইতকৈ ডাঙৰ সামাজিক সুৰক্ষা আঁচনি।",
      subjectTopic: 'Indian Economy',
      marks: 2,
    },
    {
      question: "How many Five Year Plans were completed by India before they were replaced by NITI Aayog?\nনীতি আয়োগে সলনি কৰাৰ আগতে ভাৰতে কিমানখন পঞ্চবাৰ্ষিক পৰিকল্পনা সম্পূৰ্ণ কৰিছিল?",
      options: [
        '10 / ১০',
        '11 / ১১',
        '13 / ১৩',
        '12 / ১২',
      ],
      correctAnswerIndex: 3,
      explanation: "India completed 12 Five Year Plans (1951–2017); the 12th Plan (2012–2017) was the last, after which the Planning Commission was replaced by NITI Aayog in 2015.\nভাৰতে ১২খন পঞ্চবাৰ্ষিক পৰিকল্পনা (১৯৫১–২০১৭) সম্পূৰ্ণ কৰিছিল; ১২তম পৰিকল্পনা (২০১২–২০১৭) আছিল অন্তিম, যাৰ পিছত ২০১৫ত পৰিকল্পনা আয়োগক নীতি আয়োগে সলনি কৰিছিল।",
      subjectTopic: 'Indian Economy',
      marks: 2,
    },
    {
      question: "Who was the first Chairman of India's Planning Commission?\nভাৰতৰ পৰিকল্পনা আয়োগৰ প্ৰথম অধ্যক্ষ কোন আছিল?",
      options: [
        'Jawaharlal Nehru / জৱাহৰলাল নেহৰু',
        'Sardar Vallabhbhai Patel / সৰদাৰ বল্লভভাই পটেল',
        'Dr. Rajendra Prasad / ড° ৰাজেন্দ্ৰ প্ৰসাদ',
        'C.D. Deshmukh / চি.ডি. দেশমুখ',
      ],
      correctAnswerIndex: 0,
      explanation: "The Planning Commission was established on 15 March 1950 by a resolution of the Government of India, with the Prime Minister (Jawaharlal Nehru) as its ex-officio Chairman.\nপৰিকল্পনা আয়োগ ১৫ মাৰ্চ ১৯৫০ত ভাৰত চৰকাৰৰ এক প্ৰস্তাৱৰে প্ৰতিষ্ঠা কৰা হৈছিল, য'ত প্ৰধানমন্ত্ৰী (জৱাহৰলাল নেহৰু) পদবিৰূপে অধ্যক্ষ আছিল।",
      subjectTopic: 'Indian Economy',
      marks: 2,
    },
    {
      question: "Which sector contributes the highest share to India's GDP?\nভাৰতৰ জিডিপিলৈ কোনখন খণ্ডই সৰ্বাধিক অৱদান আগবঢ়ায়?",
      options: [
        'Primary (Agriculture) / প্ৰাথমিক (কৃষি)',
        'Secondary (Industry) / দ্বিতীয়ক (উদ্যোগ)',
        'Quaternary (IT only) / চতুৰ্থক (কেৱল আইটি)',
        'Tertiary (Services) / তৃতীয়ক (সেৱা)',
      ],
      correctAnswerIndex: 3,
      explanation: "The tertiary (services) sector contributes more than 50% of India's Gross Value Added and GDP, employing around 30% of the workforce.\nতৃতীয়ক (সেৱা) খণ্ডই ভাৰতৰ মুঠ মূল্য সংযোজন আৰু জিডিপিৰ ৫০%-তকৈ অধিক অৱদান আগবঢ়ায় আৰু প্ৰায় ৩০% শ্ৰমিকক নিয়োগ কৰে।",
      subjectTopic: 'Indian Economy',
      marks: 2,
    },

    // --- Banking (8) ---
    {
      question: "The Reserve Bank of India (RBI) was established in which year?\nভাৰতীয় ৰিজাৰ্ভ বেংক (RBI) কতবাৰত প্ৰতিষ্ঠা কৰা হৈছিল?",
      options: [
        '1921 / ১৯২১',
        '1928 / ১৯২৮',
        '1947 / ১৯৪৭',
        '1935 / ১৯৩৫',
      ],
      correctAnswerIndex: 3,
      explanation: "The Reserve Bank of India was established on 1 April 1935 under the RBI Act, 1934, and was nationalised on 1 January 1949. It is India's central bank.\nভাৰতীয় ৰিজাৰ্ভ বেংক RBI আইন, ১৯৩৪ৰ অধীনত ১ এপ্ৰিল ১৯৩৫ত প্ৰতিষ্ঠা কৰা হৈছিল আৰু ১ জানুৱাৰী ১৯৪৯ত ইয়াক ৰাষ্ট্ৰীয়কৰণ কৰা হৈছিল। ই ভাৰতৰ কেন্দ্ৰীয় বেংক।",
      subjectTopic: 'Banking',
      marks: 2,
    },
    {
      question: "The Reserve Bank of India was nationalised in which year?\nভাৰতীয় ৰিজাৰ্ভ বেংকক কতবাৰত ৰাষ্ট্ৰীয়কৰণ কৰা হৈছিল?",
      options: [
        '1947 / ১৯৪৭',
        '1948 / ১৯৪৮',
        '1949 / ১৯৪৯',
        '1950 / ১৯৫০',
      ],
      correctAnswerIndex: 2,
      explanation: "The Reserve Bank of India was nationalised on 1 January 1949 under the Reserve Bank (Transfer to Public Ownership) Act, 1948, transferring ownership from private shareholders to the Government of India.\nভাৰতীয় ৰিজাৰ্ভ বেংকক ১ জানুৱাৰী ১৯৪৯ত ভাৰতীয় ৰিজাৰ্ভ বেংক (ৰাজহুৱা মালিকীস্বত্বলৈ হস্তান্তৰ) আইন, ১৯৪৮ৰ অধীনত ৰাষ্ট্ৰীয়কৰণ কৰা হৈছিল।",
      subjectTopic: 'Banking',
      marks: 2,
    },
    {
      question: "How many major commercial banks were nationalised in India in July 1969?\n১৯৬৯ৰ জুলাই মাহত ভাৰতত কিমানখন প্ৰধান বাণিজ্যিক বেংক ৰাষ্ট্ৰীয়কৰণ কৰা হৈছিল?",
      options: [
        '10 / ১০',
        '12 / ১২',
        '16 / ১৬',
        '14 / ১৪',
      ],
      correctAnswerIndex: 3,
      explanation: "On 19 July 1969, the Government of India nationalised 14 major commercial banks (each with deposits exceeding ₹50 crore) under the Banking Companies (Acquisition and Transfer of Undertakings) Act, 1969.\n১৯ জুলাই ১৯৬৯ত ভাৰত চৰকাৰে বেংকিং কোম্পানী (উদ্যোগ অধিগ্ৰহণ আৰু হস্তান্তৰ) আইন, ১৯৬৯ৰ অধীনত ১৪খন প্ৰধান বাণিজ্যিক বেংক (প্ৰতিটোৰে আমানত ₹৫০ কোটিৰ অধিক) ৰাষ্ট্ৰীয়কৰণ কৰিছিল।",
      subjectTopic: 'Banking',
      marks: 2,
    },
    {
      question: "The second phase of bank nationalisation in India took place in which year?\nভাৰতত দ্বিতীয় পৰ্যায়ৰ বেংক ৰাষ্ট্ৰীয়কৰণ কতবাৰত সংঘটিত হৈছিল?",
      options: [
        '1980 / ১৯৮০',
        '1975 / ১৯৭৫',
        '1985 / ১৯৮৫',
        '1990 / ১৯৯০',
      ],
      correctAnswerIndex: 0,
      explanation: "On 15 April 1980, six more commercial banks (with deposits over ₹200 crore) were nationalised, bringing the total number of nationalised banks to 20 (before mergers in later decades).\n১৫ এপ্ৰিল ১৯৮০ত আৰু ৬খন বাণিজ্যিক বেংক (আমানত ₹২০০ কোটিৰ অধিক) ৰাষ্ট্ৰীয়কৰণ কৰা হৈছিল, যাৰ ফলত ৰাষ্ট্ৰীয়কৃত বেংকৰ মুঠ সংখ্যা ২০ হৈছিল।",
      subjectTopic: 'Banking',
      marks: 2,
    },
    {
      question: "Who was the first Indian Governor of the Reserve Bank of India?\nভাৰতীয় ৰিজাৰ্ভ বেংকৰ প্ৰথম ভাৰতীয় গৱৰ্ণৰ কোন আছিল?",
      options: [
        'Sir Osborne Smith / ছাৰ অছবৰ্ন স্মিথ',
        'Sir James Taylor / ছাৰ জেমছ টেইলৰ',
        'C.D. Deshmukh / চি.ডি. দেশমুখ',
        'Benegal Rama Rau / বেনেগল ৰাম ৰাউ',
      ],
      correctAnswerIndex: 2,
      explanation: "Sir Chintaman Dwarakanath Deshmukh was the first Indian Governor of the RBI, serving from 11 August 1943 to 30 June 1949; he was also the third Governor overall.\nছাৰ চিন্তামণ দ্বাৰকানাথ দেশমুখ আছিল ভাৰতীয় ৰিজাৰ্ভ বেংকৰ প্ৰথম ভাৰতীয় গৱৰ্ণৰ, যিয়ে ১১ আগষ্ট ১৯৪৩ৰ পৰা ৩০ জুন ১৯৪৯লৈ কাৰ্যনিৰ্বাহ কৰিছিল।",
      subjectTopic: 'Banking',
      marks: 2,
    },
    {
      question: "The State Bank of India (SBI) was established in which year?\nষ্টেট বেংক অফ ইণ্ডিয়া (SBI) কতবাৰত প্ৰতিষ্ঠা কৰা হৈছিল?",
      options: [
        '1949 / ১৯৪৯',
        '1951 / ১৯৫১',
        '1955 / ১৯৫৫',
        '1969 / ১৯৬৯',
      ],
      correctAnswerIndex: 2,
      explanation: "The State Bank of India was constituted on 1 July 1955 under the State Bank of India Act, 1955, by nationalising and renaming the Imperial Bank of India.\nষ্টেট বেংক অফ ইণ্ডিয়া আইন, ১৯৫৫ৰ অধীনত ১ জুলাই ১৯৫৫ত ইম্পেৰিয়েল বেংক অফ ইণ্ডিয়াক ৰাষ্ট্ৰীয়কৰণ আৰু নতুন নামকৰণ কৰি SBI গঠন কৰা হৈছিল।",
      subjectTopic: 'Banking',
      marks: 2,
    },
    {
      question: "What does SLR stand for in Indian banking?\nভাৰতীয় বেংকিংত SLR-এ কি বুজায়?",
      options: [
        'Statutory Liquidity Ratio / বিধিবদ্ধ তৰলতা অনুপাত',
        'Statutory Lending Rate / বিধিবদ্ধ ঋণ প্ৰদান হাৰ',
        'System Liquidity Reserve / ব্যৱস্থা তৰলতা সংৰক্ষণ',
        'Safe Lending Ratio / সুৰক্ষিত ঋণ অনুপাত',
      ],
      correctAnswerIndex: 0,
      explanation: "SLR (Statutory Liquidity Ratio) is the percentage of a bank's Net Demand and Time Liabilities (NDTL) that must be maintained in liquid assets such as cash, gold, and approved securities, as mandated by the RBI under Section 24 of the Banking Regulation Act, 1949.\nSLR (বিধিবদ্ধ তৰলতা অনুপাত) হৈছে এটা বেংকৰ মুঠ দাবি আৰু সময় দায়বদ্ধতাৰ শতাংশ, যিটো নগদ, সোণ আৰু অনুমোদিত প্ৰতিভূতিৰ ৰূপত বেংকিং নিয়ন্ত্ৰণ আইন, ১৯৪৯ৰ ধাৰা ২৪ৰ অধীনত ৰাখিব লাগিব।",
      subjectTopic: 'Banking',
      marks: 2,
    },
    {
      question: "In India, the Repo Rate is decided by which body?\nভাৰতত ৰেপ' হাৰ কোনখন সংস্থাই নিৰ্ধাৰণ কৰে?",
      options: [
        'Monetary Policy Committee of RBI / RBIৰ মুদ্ৰানীতি সমিতি',
        'Union Finance Ministry / কেন্দ্ৰীয় বিত্ত মন্ত্ৰালয়',
        'Parliament of India / ভাৰতৰ সংসদ',
        'NITI Aayog / নীতি আয়োগ',
      ],
      correctAnswerIndex: 0,
      explanation: "The six-member Monetary Policy Committee (MPC), constituted under the RBI Act (amended in 2016) and chaired by the RBI Governor, decides the policy repo rate to achieve the inflation target of 4% (±2%).\nছয়জনীয়া মুদ্ৰানীতি সমিতিয়ে (MPC), যিটো RBI আইন (২০১৬ সংশোধন)ৰ অধীনত গঠিত আৰু RBI গৱৰ্ণৰে সভাপতিত্ব কৰে, মূল্যবৃদ্ধিৰ লক্ষ্য ৪% (±২%) লাভৰ বাবে ৰেপ' হাৰ নিৰ্ধাৰণ কৰে।",
      subjectTopic: 'Banking',
      marks: 2,
    },

    // --- Assam Economy (12) ---
    {
      question: "Which state is the largest producer of tea in India?\nভাৰতৰ ভিতৰত কোনখন ৰাজ্য আটাইতকৈ বেছি চাহ উৎপাদন কৰে?",
      options: [
        'West Bengal / পশ্চিম বংগ',
        'Tamil Nadu / তামিলনাডু',
        'Assam / অসম',
        'Kerala / কেৰালা',
      ],
      correctAnswerIndex: 2,
      explanation: "Assam is the largest tea-producing state in India, contributing over 50% of India's total tea production; the Assam tea industry dates back to the 1830s with the establishment of the Assam Company in 1839.\nঅসম ভাৰতৰ আটাইতকৈ ডাঙৰ চাহ উৎপাদনকাৰী ৰাজ্য, যিয়ে ভাৰতৰ মুঠ চাহ উৎপাদনৰ ৫০%-তকৈ অধিক যোগান ধৰে; অসমৰ চাহ উদ্যোগ ১৮৩০ৰ দশকত ১৮৩৯ত অসম কোম্পানী প্ৰতিষ্ঠাৰে আৰম্ভ হৈছিল।",
      subjectTopic: 'Assam Economy',
      marks: 2,
    },
    {
      question: "Where is the headquarters of Oil India Limited (OIL) located?\nঅইল ইণ্ডিয়া লিমিটেড (OIL)-ৰ মুখ্য কাৰ্যালয় ক'ত অৱস্থিত?",
      options: [
        'Duliajan / ডুলিয়াজান',
        'Guwahati / গুৱাহাটী',
        'Digboi / ডিগবৈ',
        'Jorhat / যোৰহাট',
      ],
      correctAnswerIndex: 0,
      explanation: "Oil India Limited, a Navratna public-sector undertaking engaged in exploration and production of crude oil and natural gas, has its headquarters at Duliajan in Dibrugarh district of Assam.\nঅপৰিশোধিত তেল আৰু প্ৰাকৃতিক গেছৰ অন্বেষণ আৰু উৎপাদনত নিয়োজিত নৱৰত্ন ৰাজহুৱা খণ্ডৰ উদ্যোগ অইল ইণ্ডিয়া লিমিটেডৰ মুখ্য কাৰ্যালয় অসমৰ ডিব্ৰুগড় জিলাৰ ডুলিয়াজানত অৱস্থিত।",
      subjectTopic: 'Assam Economy',
      marks: 2,
    },
    {
      question: "Oil was first discovered at Digboi in Assam in which year?\nঅসমৰ ডিগবৈত প্ৰথমে তেল কতবাৰত আৱিষ্কৃত হৈছিল?",
      options: [
        '1867 / ১৮৬৭',
        '1889 / ১৮৮৯',
        '1901 / ১৯০১',
        '1911 / ১৯১১',
      ],
      correctAnswerIndex: 1,
      explanation: "Oil was first struck at Digboi in 1889 by the Assam Railways & Trading Company and the Assam Oil Company; the Digboi oilfield is the oldest continuously producing oilfield in the world.\n১৮৮৯ত অসম ৰে'লৱেজ এণ্ড ট্ৰেডিং কোম্পানী আৰু অসম অইল কোম্পানীয়ে ডিগবৈত প্ৰথম তেল আৱিষ্কাৰ কৰিছিল; ডিগবৈ তেলক্ষেত্ৰ বিশ্বৰ আটাইতকৈ পুৰণি নিৰন্তৰ উৎপাদনশীল তেলক্ষেত্ৰ।",
      subjectTopic: 'Assam Economy',
      marks: 2,
    },
    {
      question: "Muga silk, known for its golden colour, is unique to which Indian state?\nসোণালী ৰঙৰ বাবে জনাজাত মুগা পাট কোনখন ভাৰতীয় ৰাজ্যৰ বিশেষত্ব?",
      options: [
        'West Bengal / পশ্চিম বংগ',
        'Karnataka / কৰ্ণাটক',
        'Tamil Nadu / তামিলনাডু',
        'Assam / অসম',
      ],
      correctAnswerIndex: 3,
      explanation: "Muga silk is produced only in Assam (and a small pocket of Meghalaya) from the semi-domesticated silkworm Antheraea assamensis; it received the GI tag in 2007 and has a natural golden-yellow tint.\nমুগা পাট অসমত (আৰু মেঘালয়ৰ এটা সৰু অঞ্চলত) অন্তৰ্বৰ্তী পলু Antheraea assamensisৰ পৰা উৎপাদিত হয়; ২০০৭ত ই জিআই টেগ লাভ কৰিছে আৰু ইয়াৰ প্ৰাকৃতিক সোণালী-হালধীয়া আভা আছে।",
      subjectTopic: 'Assam Economy',
      marks: 2,
    },
    {
      question: "Assam's Muga silk received the Geographical Indication (GI) tag in which year?\nঅসমৰ মুগা পাটে কতবাৰত ভৌগোলিক সংকেত (GI) টেগ লাভ কৰিছিল?",
      options: [
        '2004 / ২০০৪',
        '2007 / ২০০৭',
        '2010 / ২০১০',
        '2013 / ২০১৩',
      ],
      correctAnswerIndex: 1,
      explanation: "Muga silk of Assam was granted the Geographical Indication (GI) registration in 2007 (application filed in 2006), protecting the product's Assamese origin and preventing misuse of the name elsewhere.\nঅসমৰ মুগা পাটক ২০০৭ত ভৌগোলিক সংকেত (GI) পঞ্জীয়ন প্ৰদান কৰা হৈছিল (আবেদন ২০০৬ত দাখিল), যাৰ দ্বাৰা উৎপাদনৰ অসমীয়া উৎস সুৰক্ষিত কৰা হয়।",
      subjectTopic: 'Assam Economy',
      marks: 2,
    },
    {
      question: "Which is recognised as Asia's oldest continuously operating oil refinery?\nএছিয়াৰ আটাইতকৈ পুৰণি নিৰন্তৰ পৰিচালিত তেল শোধনাগাৰ হিচাপে কোনটো স্বীকৃত?",
      options: [
        'Barauni Refinery / বৰৌনি শোধনাগাৰ',
        'Visakhapatnam Refinery / বিশাখাপট্টনম শোধনাগাৰ',
        'Guwahati Refinery / গুৱাহাটী শোধনাগাৰ',
        'Digboi Refinery / ডিগবৈ শোধনাগাৰ',
      ],
      correctAnswerIndex: 3,
      explanation: "The Digboi Refinery, commissioned in 1901 by the Assam Oil Company, is recognised as Asia's oldest continuously operating oil refinery; it is now operated by Indian Oil Corporation Limited.\n১৯০১ত অসম অইল কোম্পানীয়ে আৰম্ভ কৰা ডিগবৈ শোধনাগাৰ এছিয়াৰ আটাইতকৈ পুৰণি নিৰন্তৰ পৰিচালিত তেল শোধনাগাৰ হিচাপে স্বীকৃত; বৰ্তমান ইণ্ডিয়ান অইল কৰ্পোৰেশ্যন লিমিটেডে ইয়াক পৰিচালনা কৰে।",
      subjectTopic: 'Assam Economy',
      marks: 2,
    },
    {
      question: "The Numaligarh Refinery in Assam was commissioned in which year?\nঅসমৰ নুমলিগড় শোধনাগাৰ কতবাৰত কমিশ্যন কৰা হৈছিল?",
      options: [
        '1998 / ১৯৯৮',
        '1999 / ১৯৯৯',
        '2000 / ২০০০',
        '2002 / ২০০২',
      ],
      correctAnswerIndex: 2,
      explanation: "The Numaligarh Refinery Limited (NRL) at Numaligarh in Golaghat district was commissioned in October 2000, in fulfilment of the Assam Accord, 1985; it has a capacity of 3 million metric tonnes per annum.\nগোলাঘাট জিলাৰ নুমলিগড়ত থকা নুমলিগড় শোধনাগাৰ লিমিটেড (NRL) অসম চুক্তি, ১৯৮৫ৰ পূৰ্তিৰূপে অক্টোবৰ ২০০০ত কমিশ্যন কৰা হৈছিল; ইয়াৰ ক্ষমতা বাৰ্ষিক ৩০ লাখ মেট্ৰিক টন।",
      subjectTopic: 'Assam Economy',
      marks: 2,
    },
    {
      question: "The Naharkatiya oil field in Assam was discovered in which year?\nঅসমৰ নাৰকটিয়া তেলক্ষেত্ৰ কতবাৰত আৱিষ্কৃত হৈছিল?",
      options: [
        '1947 / ১৯৪৭',
        '1953 / ১৯৫৩',
        '1959 / ১৯৫৯',
        '1965 / ১৯৬৫',
      ],
      correctAnswerIndex: 1,
      explanation: "The Naharkatiya oil field was discovered in 1953 by the Assam Oil Company (a subsidiary of Burmah Oil), marking the first major commercial oil discovery in India after independence; production began in 1959.\nনাৰকটিয়া তেলক্ষেত্ৰ ১৯৫৩ত অসম অইল কোম্পানীয়ে (বাৰ্মা অইলৰ সহায়ক) আৱিষ্কাৰ কৰিছিল, যিটো স্বাধীনতাৰ পিছত ভাৰতৰ প্ৰথম ডাঙৰ বাণিজ্যিক তেল আৱিষ্কাৰ আছিল; উৎপাদন ১৯৫৯ত আৰম্ভ হৈছিল।",
      subjectTopic: 'Assam Economy',
      marks: 2,
    },
    {
      question: "What is the natural colour of Assamese Pat silk?\nঅসমীয়া পাটৰ প্ৰাকৃতিক ৰং কি?",
      options: [
        'Golden yellow / সোণালী হালধীয়া',
        'White / বগা',
        "Brick red / ইটাৰ ৰঙা",
        "Black / ক'লা",
      ],
      correctAnswerIndex: 1,
      explanation: "Assamese Pat silk, produced from the Bombyx mori silkworm fed on mulberry leaves, is naturally white or off-white; the Assamese word 'pat' itself means white. It is known for its fine texture and durability.\nঅসমীয়া পাট, যিটো তুঁত পাতত পোষা বম্বিক্স মৰি পলুৰ পৰা উৎপাদিত, প্ৰাকৃতিকভাৱে বগা বা মটিয়া; অসমীয়া 'পাট' শব্দৰ অৰ্থেই হৈছে বগা। ইয়াৰ সূক্ষ্ম সূতা আৰু টেকা ধৰ্মৰ বাবে জনাজাত।",
      subjectTopic: 'Assam Economy',
      marks: 2,
    },
    {
      question: "Eri silk of Assam is produced from which silkworm?\nঅসমৰ এৰি পাট কোনবিধ পলুৰ পৰা উৎপাদিত হয়?",
      options: [
        'Bombyx mori / বম্বিক্স মৰি',
        'Antheraea mylitta / এন্থেৰিয়া মাইলিটা',
        'Antheraea assamensis / এন্থেৰিয়া আছামেনছিছ',
        'Samia cynthia ricini / ছামিয়া চিন্থিয়া ৰিচিনি',
      ],
      correctAnswerIndex: 3,
      explanation: "Eri silk is produced by the multivoltine silkworm Samia cynthia ricini (also called Philosamia ricini or Attacus ricini), which feeds mainly on castor (eranda) leaves; it is also known as 'Ahimsa silk' because the cocoon is harvested after the moth emerges.\nএৰি পাট বহুবাৰ্ষিক পলু ছামিয়া চিন্থিয়া ৰিচিনি (Philosamia ricini বা Attacus ricini নামেৰেও জনাজাত)ৰ পৰা উৎপাদিত হয়, যিয়ে মূলতঃ এৰণ্ডা পাত খায়; পলু ওলোৱাৰ পিছতহে কোকুন সংগ্ৰহ কৰা বাবে ইয়াক 'অহিংসা পাট' বুলিও কোৱা হয়।",
      subjectTopic: 'Assam Economy',
      marks: 2,
    },
    {
      question: "The Guwahati Refinery at Noonmati, the first public-sector refinery in India, was commissioned in which year?\nনুনমাটিত থকা গুৱাহাটী শোধনাগাৰ, ভাৰতৰ প্ৰথম ৰাজহুৱা খণ্ডৰ শোধনাগাৰ, কতবাৰত কমিশ্যন কৰা হৈছিল?",
      options: [
        '1956 / ১৯৫৬',
        '1959 / ১৯৫৯',
        '1962 / ১৯৬২',
        '1965 / ১৯৬৫',
      ],
      correctAnswerIndex: 2,
      explanation: "The Guwahati Refinery at Noonmati, the first public-sector refinery in India, was inaugurated by Prime Minister Jawaharlal Nehru on 1 January 1962; it is currently operated by Indian Oil Corporation Limited.\nনুনমাটিত থকা গুৱাহাটী শোধনাগাৰ, ভাৰতৰ প্ৰথম ৰাজহুৱা খণ্ডৰ শোধনাগাৰ, প্ৰধানমন্ত্ৰী জৱাহৰলাল নেহৰুৱে ১ জানুৱাৰী ১৯৬২ত উদ্বোধন কৰিছিল; বৰ্তমান ইণ্ডিয়ান অইল কৰ্পোৰেশ্যন লিমিটেডে ইয়াক পৰিচালনা কৰে।",
      subjectTopic: 'Assam Economy',
      marks: 2,
    },
    {
      question: "Which is the principal agricultural crop of Assam?\nঅসমৰ মূল কৃষি শস্য কি?",
      options: [
        'Wheat / ঘেঁহু',
        'Rice / ধান',
        'Maize / মকাই',
        'Sugarcane / কুহুমৰী',
      ],
      correctAnswerIndex: 1,
      explanation: "Rice (paddy) is the principal agricultural crop and staple food of Assam, cultivated over the largest area among all crops; Assam produces three main rice crops — Sali, Ahu and Bao — suited to its flood-prone agro-climatic conditions.\nধান অসমৰ মূল কৃষি শস্য আৰু প্ৰধান খাদ্য, যাক আন সকলো শস্যতকৈ বৃহৎ এলেকাত খেতি কৰা হয়; অসমত শালি, আহু আৰু বাও এই তিনিটা মূল ধান শস্য উৎপন্ন হয়।",
      subjectTopic: 'Assam Economy',
      marks: 2,
    },

    // --- Agriculture (4) ---
    {
      question: "Who is widely regarded as the father of the Green Revolution in India?\nভাৰতত সেউজ বিপ্লৱৰ পিতৃপুৰুষ হিচাপে কাক বহুলভাৱে গণ্য কৰা হয়?",
      options: [
        'Norman Borlaug / নৰমান বৰলাউগ',
        'M.S. Swaminathan / এম.এছ. স্বামীনাথন',
        'Verghese Kurien / ভাৰ্গিজ কুৰিয়েন',
        'B.R. Barwale / বি.আৰ. বাৰৱালে',
      ],
      correctAnswerIndex: 1,
      explanation: "Dr. Monkombu Sambasivan Swaminathan is regarded as the father of India's Green Revolution for his work in introducing high-yielding wheat and rice varieties in the 1960s, in collaboration with Norman Borlaug.\nড° মনকোম্বু সম্ভাশিৱন স্বামীনাথনক ১৯৬০ৰ দশকত নৰমান বৰলাউগৰ সহযোগত উচ্চ-উৎপাদনশীল ঘেঁহু আৰু ধানৰ জাত প্ৰৱৰ্তনৰ বাবে ভাৰতৰ সেউজ বিপ্লৱৰ পিতৃপুৰুষ বুলি গণ্য কৰা হয়।",
      subjectTopic: 'Agriculture',
      marks: 2,
    },
    {
      question: "In India, the Minimum Support Price (MSP) is approved by which body?\nভাৰতত ন্যূনতম সমৰ্থন মূল্য (MSP) কোনখন সংস্থাই অনুমোদন কৰে?",
      options: [
        'NITI Aayog / নীতি আয়োগ',
        'Reserve Bank of India / ভাৰতীয় ৰিজাৰ্ভ বেংক',
        'Cabinet Committee on Economic Affairs / অৰ্থনৈতিক পৰিক্ৰমা বিষয়ক কেবিনেট সমিতি',
        'Parliament Standing Committee / সংসদৰ স্থায়ী সমিতি',
      ],
      correctAnswerIndex: 2,
      explanation: "The Cabinet Committee on Economic Affairs (CCEA), chaired by the Prime Minister, approves the MSP for agricultural crops on the basis of recommendations by the Commission for Agricultural Costs and Prices (CACP).\nঅৰ্থনৈতিক পৰিক্ৰমা বিষয়ক কেবিনেট সমিতিয়ে (CCEA), যাৰ সভাপতি প্ৰধানমন্ত্ৰী, কৃষি খৰচ আৰু মূল্য আয়োগৰ (CACP) পৰামৰ্শৰ ভিত্তিত কৃষি শস্যৰ MSP অনুমোদন কৰে।",
      subjectTopic: 'Agriculture',
      marks: 2,
    },
    {
      question: "Which state is the largest producer of jute in India?\nভাৰতৰ ভিতৰত কোনখন ৰাজ্য আটাইতকৈ বেছি জুট উৎপাদন কৰে?",
      options: [
        'West Bengal / পশ্চিম বংগ',
        'Bihar / বিহাৰ',
        'Assam / অসম',
        'Odisha / ওড়িশা',
      ],
      correctAnswerIndex: 0,
      explanation: "West Bengal is the largest producer of raw jute in India, contributing over 75% of the national output; the jute industry is concentrated along the Hooghly river belt and is governed by the Jute Packaging Materials Act, 1987.\nপশ্চিম বংগ ভাৰতৰ আটাইতকৈ ডাঙৰ কেঁচা জুট উৎপাদনকাৰী ৰাজ্য, যিয়ে ৰাষ্ট্ৰীয় উৎপাদনৰ ৭৫%-তকৈ অধিক যোগান ধৰে; জুট উদ্যোগ হুগলী নদী অঞ্চলত কেন্দ্ৰিভূত।",
      subjectTopic: 'Agriculture',
      marks: 2,
    },
    {
      question: "Which state is the largest producer of mustard (rapeseed-mustard) in India?\nভাৰতৰ ভিতৰত কোনখন ৰাজ্য আটাইতকৈ বেছি সৰিয়হ (ৰেপচিড-মাষ্টাৰ্ড) উৎপাদন কৰে?",
      options: [
        'Uttar Pradesh / উত্তৰ প্ৰদেশ',
        'Rajasthan / ৰাজস্থান',
        'Madhya Pradesh / মধ্য প্ৰদেশ',
        'Haryana / হৰিয়ানা',
      ],
      correctAnswerIndex: 1,
      explanation: "Rajasthan is the largest producer of mustard and rapeseed in India, contributing around 45–50% of national output; the crop is a major rabi oilseed in the mustard belt of Bharatpur, Alwar and Sriganganagar districts.\nৰাজস্থান ভাৰতৰ আটাইতকৈ ডাঙৰ সৰিয়হ আৰু ৰেপচিড উৎপাদনকাৰী ৰাজ্য, যিয়ে ৰাষ্ট্ৰীয় উৎপাদনৰ প্ৰায় ৪৫–৫০% যোগান ধৰে; ভৰতপুৰ, আলৱাৰ আৰু শ্ৰীগংগানগৰ জিলাত এই শস্য এক প্ৰধান ৰবি তৈলবীজ।",
      subjectTopic: 'Agriculture',
      marks: 2,
    },

    // --- Industry (3) ---
    {
      question: "Which is regarded as the first modern joint-stock industry of Assam?\nঅসমৰ প্ৰথম আধুনিক যৌথ-মূলধনী উদ্যোগ হিচাপে কোনটো গণ্য কৰা হয়?",
      options: [
        'Assam Silk Company / অসম পাট কোম্পানী',
        'Bengal Tea Association / বংগ চাহ সংঘ',
        'Assam Company Limited / অসম কোম্পানী লিমিটেড',
        'Cachar Tea Company / কাছাৰ চাহ কোম্পানী',
      ],
      correctAnswerIndex: 2,
      explanation: "The Assam Company Limited, incorporated on 12 February 1839 in London, is regarded as the first modern joint-stock tea company of Assam (and of India), pioneering the commercial cultivation of tea after the discovery of the indigenous tea plant in 1823.\n১৮৩৯ৰ ১২ ফেব্ৰুৱাৰীত লণ্ডনত অন্তৰ্ভুক্ত অসম কোম্পানী লিমিটেডক অসমৰ (আৰু ভাৰতৰ) প্ৰথম আধুনিক যৌথ-মূলধনী চাহ কোম্পানী হিচাপে গণ্য কৰা হয়, যিয়ে ১৮২৩ত থলুৱা চাহ গছ আৱিষ্কাৰৰ পিছত চাহ খেতিৰ বাণিজ্যিক প্ৰসাৰ আৰম্ভ কৰিছিল।",
      subjectTopic: 'Industry',
      marks: 2,
    },
    {
      question: "Tata Iron and Steel Company (TISCO) at Jamshedpur was established in which year?\nজামছেদপুৰত থকা টাটা আইৰন এণ্ড ষ্টিল কোম্পানী (TISCO) কতবাৰত প্ৰতিষ্ঠা কৰা হৈছিল?",
      options: [
        '1895 / ১৮৯৫',
        '1900 / ১৯০০',
        '1907 / ১৯০৭',
        '1911 / ১৯১১',
      ],
      correctAnswerIndex: 2,
      explanation: "Tata Iron and Steel Company (now Tata Steel Limited) was established by Jamsetji Tata on 25 August 1907 at Sakchi (later renamed Jamshedpur in Jharkhand); it was the first integrated steel plant in Asia.\nটাটা আইৰন এণ্ড ষ্টিল কোম্পানী (বৰ্তমান টাটা ষ্টিল লিমিটেড) জামছেতজি টাটাই ২৫ আগষ্ট ১৯০৭ত সাকচি (পিছত ঝাৰখণ্ডৰ জামছেদপুৰ নামেৰে পুনৰ্নামকৰণ)ত প্ৰতিষ্ঠা কৰিছিল; ই এছিয়াৰ প্ৰথম সমন্বিত ইস্পাত কাৰখানা আছিল।",
      subjectTopic: 'Industry',
      marks: 2,
    },
    {
      question: "The Nagaon Paper Mill of Hindustan Paper Corporation is located at which place in Assam?\nহিন্দুস্তান পেপাৰ কৰ্পোৰেশ্যনৰ নগাঁও পেপাৰ মিল অসমৰ কোন ঠাইত অৱস্থিত?",
      options: [
        'Jagiroad / জাগিৰ\'ড',
        'Duliajan / ডুলিয়াজান',
        'Namrup / নামৰুপ',
        'Bongaigaon / বঙাইগাওঁ',
      ],
      correctAnswerIndex: 0,
      explanation: "The Nagaon Paper Mill of Hindustan Paper Corporation Limited (HPCL) is located at Jagiroad in Morigaon district of Assam; it was commissioned in 1985 and is one of the largest writing and printing paper mills in India's north-east.\nহিন্দুস্তান পেপাৰ কৰ্পোৰেশ্যন লিমিটেডৰ (HPCL) নগাঁও পেপাৰ মিল অসমৰ মৰিগাঁও জিলাৰ জাগিৰ\'ডত অৱস্থিত; ইয়াক ১৯৮৫ত কমিশ্যন কৰা হৈছিল আৰু এইটো ভাৰতৰ উত্তৰ-পূবৰ আটাইতকৈ ডাঙৰ লিখন আৰু মুদ্ৰণ কাগজৰ কাৰখানাৰ অন্যতম।",
      subjectTopic: 'Industry',
      marks: 2,
    },

    // --- Budget (3) ---
    {
      question: "Since 2017, the Union Budget of India is presented on which date?\n২০১৭ৰ পৰা ভাৰতৰ কেন্দ্ৰীয় বাজেট কোন তাৰিখত উপস্থাপন কৰা হয়?",
      options: [
        'Last day of February / ফেব্ৰুৱাৰীৰ অন্তিম দিন',
        '1 February / ১ ফেব্ৰুৱাৰী',
        '28 February / ২৮ ফেব্ৰুৱাৰী',
        '31 March / ৩১ মাৰ্চ',
      ],
      correctAnswerIndex: 1,
      explanation: "From the Budget for 2017–18 onwards, the Government of India advanced the date of presentation of the Union Budget to 1 February (instead of the last working day of February), so that the budget is passed before the start of the new financial year on 1 April.\n২০১৭–১৮ বাজেটৰ পৰা আৰম্ভ কৰি ভাৰত চৰকাৰে কেন্দ্ৰীয় বাজেট উপস্থাপনৰ তাৰিখ ফেব্ৰুৱাৰীৰ অন্তিম কাৰ্যদিনৰ পৰা ১ ফেব্ৰুৱাৰীলৈ আগুৱাই আনিছে, যাতে নতুন বিত্তীয় বৰ্ষ ১ এপ্ৰিল আৰম্ভ হোৱাৰ আগতেই বাজেট পাছ হ'ব পাৰে।",
      subjectTopic: 'Budget',
      marks: 2,
    },
    {
      question: "The first budget of independent India was presented in which year?\nস্বাধীন ভাৰতৰ প্ৰথম বাজেট কতবাৰত উপস্থাপন কৰা হৈছিল?",
      options: [
        '1947 (August) / ১৯৪৭ (আগষ্ট)',
        '1947 (November) / ১৯৪৭ (নৱেম্বৰ)',
        '1948 / ১৯৪৮',
        '1950 / ১৯৫০',
      ],
      correctAnswerIndex: 1,
      explanation: "The first budget of independent India was presented on 26 November 1947 by Finance Minister R.K. Shanmukham Chetty, covering a period of just over seven months from 15 August 1947 to 31 March 1948.\nস্বাধীন ভাৰতৰ প্ৰথম বাজেট ২৬ নৱেম্বৰ ১৯৪৭ত বিত্তমন্ত্ৰী আৰ.কে. শানমুখম চেট্টিয়ে উপস্থাপন কৰিছিল, যিয়ে ১৫ আগষ্ট ১৯৪৭ৰ পৰা ৩১ মাৰ্চ ১৯৪৮লৈ মাত্ৰ সাত মাহৰো অধিক সময় সামৰি লৈছিল।",
      subjectTopic: 'Budget',
      marks: 2,
    },
    {
      question: "Who presented the Assam State Budget for the financial year 2024–25?\nঅসম ৰাজ্যিক বাজেট ২০২৪–২৫ বিত্তীয় বৰ্ষৰ বাবে কোনে উপস্থাপন কৰিছিল?",
      options: [
        'Himanta Biswa Sarma / হিমন্ত বিশ্ব শৰ্মা',
        'Ajanta Neog / অজন্তা নেওগ',
        'Pijush Hazarika / পীযূষ হাজৰিকা',
        'Sarat Chandra Singha / শৰৎ চন্দ্ৰ সিংহ',
      ],
      correctAnswerIndex: 1,
      explanation: "The Assam State Budget for 2024–25 was presented on 12 March 2024 by Finance Minister Ajanta Neog, with a focus on infrastructure, tea-tribe welfare, youth employment and digital governance.\nঅসম ৰাজ্যিক বাজেট ২০২৪–২৫ ১২ মাৰ্চ ২০২৪ত বিত্তমন্ত্ৰী অজন্তা নেওগে উপস্থাপন কৰিছিল, য'ত আন্তঃগাঁথনি, চাহ-জনজাতি কল্যাণ, যুৱ নিয়োগ আৰু ডিজিটেল শাসনৰ ওপৰত গুৰুত্ব আৰোপ কৰা হৈছিল।",
      subjectTopic: 'Budget',
      marks: 2,
    },
  ],
};
