// =============================================================================
// ExamVault — APSC (Assam Public Service Commission) POLITY
// Bilingual question pool — apsc-polity (40 items)
//
// Format (CRITICAL — every field is bilingual EN + অসমীয়া):
//   question  -> "English\nঅসমীয়া"
//   option    -> "English / অসমীয়া"
//   expl      -> "English\nঅসমীয়া"
//
// Topics covered: Indian Constitution (Preamble, Fundamental Rights Part III,
//   DPSP Part IV, Fundamental Duties Part IVA), Parliament (Lok Sabha/Rajya
//   Sabha), Judiciary (Supreme Court/High Court), Federalism, President &
//   executive, Panchayati Raj (73rd Amendment), Assam polity (Bordoloi,
//   126-seat legislature, Governor, Dispur), RTE Act 2009.
//
// correctAnswerIndex is distributed evenly (10 × 0, 10 × 1, 10 × 2, 10 × 3)
// so test slicing produces a balanced answer key.
// =============================================================================
import type { QuestionPoolMap } from './structure';

export const APSC_POOLS_POLITY: QuestionPoolMap = {
  // ===========================================================================
  // apsc-polity — Polity (40)
  // ===========================================================================
  'apsc-polity': [
    // --- Constitution (10) ---
    {
      question: "The Preamble of the Indian Constitution begins with which phrase?\nভাৰতীয় সংবিধানৰ প্ৰস্তাৱনা কোনটো বাক্যাংশৰে আৰম্ভ হয়?",
      options: [
        'We, the People of India / আমি, ভাৰতৰ জনগণ',
        'In the name of God / ঈশ্বৰৰ নামত',
        'By the Government of India / ভাৰত চৰকাৰৰ দ্বাৰা',
        'By the Constituent Assembly / গণপৰিষদৰ দ্বাৰা',
      ],
      correctAnswerIndex: 0,
      explanation: "The Preamble begins with 'We, the People of India', signifying that sovereignty rests with the people of India.\nপ্ৰস্তাৱনা 'আমি, ভাৰতৰ জনগণ'ৰে আৰম্ভ হয়, যাৰ অৰ্থ হৈছে সাৰ্বভৌমত্ব ভাৰতৰ জনগণৰ হাতত।",
      subjectTopic: 'Constitution',
      marks: 2,
    },
    {
      question: "Fundamental Rights are enshrined in which Part of the Constitution?\nমৌলিক অধিকাৰসমূহ সংবিধানৰ কোনটো ভাগত সন্নিবিষ্ট আছে?",
      options: [
        'Part II / দ্বিতীয় ভাগ',
        'Part III / তৃতীয় ভাগ',
        'Part IV / চতুৰ্থ ভাগ',
        'Part IVA / চতুৰ্থ-ক ভাগ',
      ],
      correctAnswerIndex: 1,
      explanation: "Fundamental Rights are enshrined in Part III (Articles 12 to 35) of the Indian Constitution.\nমৌলিক অধিকাৰসমূহ ভাৰতীয় সংবিধানৰ তৃতীয় ভাগত (ধাৰা ১২ৰ পৰা ৩৫) সন্নিবিষ্ট।",
      subjectTopic: 'Constitution',
      marks: 2,
    },
    {
      question: "Directive Principles of State Policy are contained in which Part?\nৰাজ্যিক নীতিৰ নিৰ্দেশক নীতিসমূহ কোনটো ভাগত আছে?",
      options: [
        'Part III / তৃতীয় ভাগ',
        'Part IV-A / চতুৰ্থ-ক ভাগ',
        'Part IV / চতুৰ্থ ভাগ',
        'Part V / পঞ্চম ভাগ',
      ],
      correctAnswerIndex: 2,
      explanation: "The Directive Principles of State Policy are in Part IV (Articles 36 to 51) of the Constitution.\nৰাজ্যিক নীতিৰ নিৰ্দেশক নীতিসমূহ সংবিধানৰ চতুৰ্থ ভাগত (ধাৰা ৩৬ৰ পৰা ৫১) আছে।",
      subjectTopic: 'Constitution',
      marks: 2,
    },
    {
      question: "Fundamental Duties are mentioned in which Part of the Constitution?\nমৌলিক কৰ্তব্যসমূহ সংবিধানৰ কোনটো ভাগত উল্লেখ আছে?",
      options: [
        'Part III / তৃতীয় ভাগ',
        'Part IV / চতুৰ্থ ভাগ',
        'Part V / পঞ্চম ভাগ',
        'Part IV-A / চতুৰ্থ-ক ভাগ',
      ],
      correctAnswerIndex: 3,
      explanation: "Fundamental Duties are listed in Part IV-A (Article 51-A), added by the 42nd Amendment in 1976.\nমৌলিক কৰ্তব্যসমূহ চতুৰ্থ-ক ভাগত (ধাৰা ৫১-ক) তালিকাভুক্ত, যাক ১৯৭৬ত ৪২তম সংশোধনীৰ দ্বাৰা যোগ কৰা হৈছিল।",
      subjectTopic: 'Constitution',
      marks: 2,
    },
    {
      question: "How many Fundamental Rights are guaranteed by the Indian Constitution at present?\nবৰ্তমানে ভাৰতীয় সংবিধানে কিমানটা মৌলিক অধিকাৰ নিশ্চিত কৰিছে?",
      options: [
        'Six / ছটা',
        'Seven / সাতটা',
        'Eight / আঠটা',
        'Five / পাঁচটা',
      ],
      correctAnswerIndex: 0,
      explanation: "After the abolition of the Right to Property (Article 31) by the 44th Amendment in 1978, six Fundamental Rights remain.\n১৯৭৮ত ৪৪তম সংশোধনীৰ দ্বাৰা সম্পত্তিৰ অধিকাৰ (ধাৰা ৩১) বাতিল হোৱাৰ পিছত ছটা মৌলিক অধিকাৰ অৱশিষ্ট আছে।",
      subjectTopic: 'Constitution',
      marks: 2,
    },
    {
      question: "Article 32 of the Constitution deals with which right?\nসংবিধানৰ ধাৰা ৩২ কোনটো অধিকাৰৰ বিষয়ে আলোচনা কৰে?",
      options: [
        'Right to Freedom of Speech / বাক-স্বাধীনতাৰ অধিকাৰ',
        'Right to Equality / সমতাৰ অধিকাৰ',
        'Right to Constitutional Remedies / সাংবিধানিক প্ৰতিকাৰৰ অধিকাৰ',
        'Right against Exploitation / শোষণৰ বিৰুদ্ধে অধিকাৰ',
      ],
      correctAnswerIndex: 2,
      explanation: "Article 32 provides the Right to Constitutional Remedies, which Dr. B.R. Ambedkar called the 'heart and soul' of the Constitution.\nধাৰা ৩২য়ে সাংবিধানিক প্ৰতিকাৰৰ অধিকাৰ প্ৰদান কৰে, যাক ড॰ বি.আৰ. আম্বেদকাৰে সংবিধানৰ 'হৃদয় আৰু আত্মা' বুলি কৈছিল।",
      subjectTopic: 'Constitution',
      marks: 2,
    },
    {
      question: "Article 14 of the Constitution guarantees which right?\nসংবিধানৰ ধাৰা ১৪য়ে কোনটো অধিকাৰ নিশ্চিত কৰে?",
      options: [
        'Right to Freedom / স্বাধীনতাৰ অধিকাৰ',
        'Right to Religion / ধৰ্মৰ অধিকাৰ',
        'Right against Exploitation / শোষণৰ বিৰুদ্ধে অধিকাৰ',
        'Right to Equality / সমতাৰ অধিকাৰ',
      ],
      correctAnswerIndex: 3,
      explanation: "Article 14 guarantees equality before law and equal protection of laws to all persons within Indian territory.\nধাৰা ১৪য়ে ভাৰতৰ ভূখণ্ডৰ ভিতৰত সকলো ব্যক্তিক আইনৰ সন্মুখত সমতা আৰু আইনৰ সমান সুৰক্ষা নিশ্চিত কৰে।",
      subjectTopic: 'Constitution',
      marks: 2,
    },
    {
      question: "Article 21 of the Constitution protects which right?\nসংবিধানৰ ধাৰা ২১য়ে কোনটো অধিকাৰ ৰক্ষা কৰে?",
      options: [
        'Right to Life and Personal Liberty / জীৱন আৰু ব্যক্তিগত স্বাধীনতাৰ অধিকাৰ',
        'Right to Education / শিক্ষাৰ অধিকাৰ',
        'Right to Property / সম্পত্তিৰ অধিকাৰ',
        'Right to Vote / ভোটদানৰ অধিকাৰ',
      ],
      correctAnswerIndex: 0,
      explanation: "Article 21 protects the right to life and personal liberty, and has been interpreted to include many derived rights like dignity, privacy, and clean environment.\nধাৰা ২১য়ে জীৱন আৰু ব্যক্তিগত স্বাধীনতাৰ অধিকাৰ ৰক্ষা কৰে, আৰু ইয়াক মৰ্যাদা, গোপনীয়তা আৰু পৰিচ্ছন্ন পৰিৱেশৰ দৰে বহুতো অধিকাৰ অন্তৰ্ভুক্ত কৰিবলৈ ব্যাখ্যা কৰা হৈছে।",
      subjectTopic: 'Constitution',
      marks: 2,
    },
    {
      question: "The Directive Principles of State Policy were borrowed from the Constitution of which country?\nৰাজ্যিক নীতিৰ নিৰ্দেশক নীতিসমূহ কোনখন দেশৰ সংবিধানৰ পৰা গ্ৰহণ কৰা হৈছিল?",
      options: [
        'United States of America / আমেৰিকা যুক্তৰাষ্ট্ৰ',
        'Ireland / আয়াৰলেণ্ড',
        'Canada / কানাডা',
        'Australia / অষ্ট্ৰেলিয়া',
      ],
      correctAnswerIndex: 1,
      explanation: "The Directive Principles of State Policy were borrowed from the Constitution of Ireland.\nৰাজ্যিক নীতিৰ নিৰ্দেশক নীতিসমূহ আয়াৰলেণ্ডৰ সংবিধানৰ পৰা গ্ৰহণ কৰা হৈছিল।",
      subjectTopic: 'Constitution',
      marks: 2,
    },
    {
      question: "Fundamental Duties in the Indian Constitution were borrowed from which country?\nভাৰতীয় সংবিধানৰ মৌলিক কৰ্তব্যসমূহ কোনখন দেশৰ পৰা গ্ৰহণ কৰা হৈছিল?",
      options: [
        'United Kingdom / যুক্তৰাজ্য',
        'United States of America / আমেৰিকা যুক্তৰাষ্ট্ৰ',
        'USSR (Soviet Union) / ছোভিয়েট ইউনিয়ন',
        'France / ফ্ৰান্স',
      ],
      correctAnswerIndex: 2,
      explanation: "Fundamental Duties were borrowed from the Constitution of the USSR (Soviet Union) and added by the 42nd Amendment in 1976.\nমৌলিক কৰ্তব্যসমূহ ছোভিয়েট ইউনিয়নৰ সংবিধানৰ পৰা গ্ৰহণ কৰা হৈছিল আৰু ১৯৭৬ত ৪২তম সংশোধনীৰ দ্বাৰা যোগ কৰা হৈছিল।",
      subjectTopic: 'Constitution',
      marks: 2,
    },

    // --- Parliament (7) ---
    {
      question: "What is the maximum strength of the Lok Sabha as per the Constitution?\nসংবিধান অনুসৰি লোকসভাৰ সৰ্বাধিক শক্তি কিমান?",
      options: [
        '500 / ৫০০',
        '520 / ৫২০',
        '545 / ৫৪৫',
        '550 / ৫৫০',
      ],
      correctAnswerIndex: 3,
      explanation: "The maximum strength of the Lok Sabha is 550 members, as per Article 81 (amended). Currently it has 543 members.\nধাৰা ৮১ অনুসৰি (সংশোধিত) লোকসভাৰ সৰ্বাধিক শক্তি ৫৫০জন সদস্য। বৰ্তমান ইয়াত ৫৪৩জন সদস্য আছে।",
      subjectTopic: 'Parliament',
      marks: 2,
    },
    {
      question: "What is the term of a member of the Rajya Sabha?\nৰাজ্যসভাৰ এজন সদস্যৰ কাৰ্যকাল কিমান?",
      options: [
        'Six years / ছয় বছৰ',
        'Five years / পাঁচ বছৰ',
        'Four years / চাৰি বছৰ',
        'Permanent / আজীৱন',
      ],
      correctAnswerIndex: 0,
      explanation: "A member of the Rajya Sabha serves a term of six years, with one-third retiring every two years. The Rajya Sabha itself is a permanent house.\nৰাজ্যসভাৰ এজন সদস্য ছয় বছৰৰ কাৰ্যকাল সেৱা আগবঢ়ায়, প্ৰতি দুই বছৰত এক-তৃতীয়াংশ অৱসৰ গ্ৰহণ কৰে। ৰাজ্যসভা নিজেই এক স্থায়ী সদন।",
      subjectTopic: 'Parliament',
      marks: 2,
    },
    {
      question: "Which Article of the Constitution defines a Money Bill?\nসংবিধানৰ কোনটো ধাৰাই ধন বিল নিৰ্ধাৰণ কৰে?",
      options: [
        'Article 108 / ধাৰা ১০৮',
        'Article 110 / ধাৰা ১১০',
        'Article 111 / ধাৰা ১১১',
        'Article 112 / ধাৰা ১১২',
      ],
      correctAnswerIndex: 1,
      explanation: "Article 110 of the Constitution defines a Money Bill. It can only be introduced in the Lok Sabha and requires the Speaker's certification.\nসংবিধানৰ ধাৰা ১১০য়ে ধন বিল নিৰ্ধাৰণ কৰে। ইয়াক কেৱল লোকসভাত উপস্থাপন কৰিব পাৰি আৰু সভাপতিৰ প্ৰমাণপত্ৰৰ প্ৰয়োজন।",
      subjectTopic: 'Parliament',
      marks: 2,
    },
    {
      question: "What is the minimum age required to contest for the post of President of India?\nভাৰতৰ ৰাষ্ট্ৰপতি পদৰ বাবে প্ৰতিদ্বন্দ্বিতা কৰিবলৈ নূন্যতম বয়স কিমান?",
      options: [
        '25 years / ২৫ বছৰ',
        '30 years / ৩০ বছৰ',
        '35 years / ৩৫ বছৰ',
        '40 years / ৪০ বছৰ',
      ],
      correctAnswerIndex: 2,
      explanation: "A person must be at least 35 years of age to be eligible to contest for the post of President of India, as per Article 58.\nধাৰা ৫৮ অনুসৰি ভাৰতৰ ৰাষ্ট্ৰপতি পদৰ বাবে প্ৰতিদ্বন্দ্বিতা কৰিবলৈ এজন ব্যক্তিৰ বয়স অন্ততঃ ৩৫ বছৰ হোৱা আৱশ্যক।",
      subjectTopic: 'Parliament',
      marks: 2,
    },
    {
      question: "Who presides over the joint sitting of both Houses of Parliament?\nসংসদৰ উভয় সদনৰ যৌথ অধিৱেশন কোনে পৰিচালনা কৰে?",
      options: [
        'President of India / ভাৰতৰ ৰাষ্ট্ৰপতি',
        'Vice President of India / ভাৰতৰ উপ-ৰাষ্ট্ৰপতি',
        'Prime Minister / প্ৰধানমন্ত্ৰী',
        'Speaker of Lok Sabha / লোকসভাৰ সভাপতি',
      ],
      correctAnswerIndex: 3,
      explanation: "The Speaker of the Lok Sabha presides over the joint sitting of both Houses of Parliament, summoned under Article 108.\nলোকসভাৰ সভাপতিয়ে ধাৰা ১০৮ৰ অধীনত মতা সংসদৰ উভয় সদনৰ যৌথ অধিৱেশন পৰিচালনা কৰে।",
      subjectTopic: 'Parliament',
      marks: 2,
    },
    {
      question: "How many sessions does the Indian Parliament normally have in a year?\nভাৰতীয় সংসদৰ সাধাৰণতে বছৰি কিমানটা অধিৱেশন হয়?",
      options: [
        'Three / তিনিটা',
        'Two / দুটা',
        'Four / চাৰিটা',
        'Five / পাঁচটা',
      ],
      correctAnswerIndex: 0,
      explanation: "The Indian Parliament normally meets in three sessions: Budget (Feb-May), Monsoon (Jul-Sep), and Winter (Nov-Dec).\nভাৰতীয় সংসদ সাধাৰণতে তিনিটা অধিৱেশনত বৈঠক কৰে: বাজেট (ফেব্ৰু-মে'), বৰষুণ (জুলাই-ছেপ্টেম্বৰ) আৰু শীত (নৱেম্বৰ-ডিচেম্বৰ)।",
      subjectTopic: 'Parliament',
      marks: 2,
    },
    {
      question: "Who appoints the Prime Minister of India?\nভাৰতৰ প্ৰধানমন্ত্ৰীক কোনে নিযুক্তি দিয়ে?",
      options: [
        'Chief Justice of India / ভাৰতৰ মুখ্য ন্যায়াধীশ',
        'President of India / ভাৰতৰ ৰাষ্ট্ৰপতি',
        'Vice President / উপ-ৰাষ্ট্ৰপতি',
        'Speaker of Lok Sabha / লোকসভাৰ সভাপতি',
      ],
      correctAnswerIndex: 1,
      explanation: "The President of India appoints the Prime Minister, who is usually the leader of the majority party in the Lok Sabha, under Article 75.\nধাৰা ৭৫ অনুসৰি ভাৰতৰ ৰাষ্ট্ৰপতিয়ে প্ৰধানমন্ত্ৰীক নিযুক্তি দিয়ে, যি সাধাৰণতে লোকসভাৰ সংখ্যাগৰিষ্ঠ দলৰ নেতা হয়।",
      subjectTopic: 'Parliament',
      marks: 2,
    },

    // --- Judiciary (6) ---
    {
      question: "The Supreme Court of India is established under which Article?\nভাৰতৰ উচ্চতম ন্যায়ালয় কোনটো ধাৰাৰ অধীনত প্ৰতিষ্ঠিত?",
      options: [
        'Article 121 / ধাৰা ১২১',
        'Article 122 / ধাৰা ১২২',
        'Article 124 / ধাৰা ১২৪',
        'Article 126 / ধাৰা ১২৬',
      ],
      correctAnswerIndex: 2,
      explanation: "The Supreme Court of India is established under Article 124 of the Constitution, with its seat at New Delhi.\nভাৰতৰ উচ্চতম ন্যায়ালয় সংবিধানৰ ধাৰা ১২৪ৰ অধীনত প্ৰতিষ্ঠিত, যাৰ স্থান নতুন দিল্লীত।",
      subjectTopic: 'Judiciary',
      marks: 2,
    },
    {
      question: "What is the retirement age of a Supreme Court Judge?\nউচ্চতম ন্যায়ালয়ৰ ন্যায়াধীশৰ অৱসৰ গ্ৰহণৰ বয়স কিমান?",
      options: [
        '60 years / ৬০ বছৰ',
        '62 years / ৬২ বছৰ',
        '63 years / ৬৩ বছৰ',
        '65 years / ৬৫ বছৰ',
      ],
      correctAnswerIndex: 3,
      explanation: "A Supreme Court Judge retires at the age of 65 years, while a High Court Judge retires at 62 years.\nউচ্চতম ন্যায়ালয়ৰ ন্যায়াধীশ ৬৫ বছৰ বয়সত অৱসৰ গ্ৰহণ কৰে, আনহাতে উচ্চ ন্যায়ালয়ৰ ন্যায়াধীশ ৬২ বছৰত অৱসৰ গ্ৰহণ কৰে।",
      subjectTopic: 'Judiciary',
      marks: 2,
    },
    {
      question: "What is the retirement age of a High Court Judge?\nউচ্চ ন্যায়ালয়ৰ ন্যায়াধীশৰ অৱসৰ গ্ৰহণৰ বয়স কিমান?",
      options: [
        '62 years / ৬২ বছৰ',
        '60 years / ৬০ বছৰ',
        '65 years / ৬৫ বছৰ',
        '64 years / ৬৪ বছৰ',
      ],
      correctAnswerIndex: 0,
      explanation: "A High Court Judge retires at the age of 62 years as per Article 217 of the Constitution.\nসংবিধানৰ ধাৰা ২১৭ অনুসৰি উচ্চ ন্যায়ালয়ৰ ন্যায়াধীশ ৬২ বছৰ বয়সত অৱসৰ গ্ৰহণ কৰে।",
      subjectTopic: 'Judiciary',
      marks: 2,
    },
    {
      question: "What is the sanctioned strength of judges in the Supreme Court of India (including the CJI)?\nভাৰতৰ উচ্চতম ন্যায়ালয়ৰ ন্যায়াধীশৰ অনুমোদিত শক্তি (মুখ্য ন্যায়াধীশকে ধৰি) কিমান?",
      options: [
        '31 / ৩১',
        '34 / ৩৪',
        '33 / ৩৩',
        '30 / ৩০',
      ],
      correctAnswerIndex: 1,
      explanation: "The sanctioned strength of the Supreme Court is 34 judges including the Chief Justice of India, after the 2019 increase.\n২০১৯ চনৰ বৃদ্ধিৰ পিছত উচ্চতম ন্যায়ালয়ৰ অনুমোদিত শক্তি মুখ্য ন্যায়াধীশকে ধৰি ৩৪জন ন্যায়াধীশ।",
      subjectTopic: 'Judiciary',
      marks: 2,
    },
    {
      question: "The power of the judiciary to review legislative and executive actions is called?\nআইনসভা আৰু কাৰ্যবাহীৰ কাৰ্য পৰ্যালোচনা কৰা ন্যায়াপালিকাৰ ক্ষমতাক কি বোলা হয়?",
      options: [
        'Judicial Activism / ন্যায়িক সক্ৰিয়তা',
        'Judicial Supremacy / ন্যায়িক শ্ৰেষ্ঠতা',
        'Judicial Review / ন্যায়িক পৰ্যালোচনা',
        'Judicial Control / ন্যায়িক নিয়ন্ত্ৰণ',
      ],
      correctAnswerIndex: 2,
      explanation: "Judicial Review is the power of the courts to examine the constitutionality of legislative and executive acts and strike them down if violative.\nন্যায়িক পৰ্যালোচনা হৈছে আদালতৰ আইনসভা আৰু কাৰ্যবাহীৰ কাৰ্যৰ সাংবিধানিকতা পৰীক্ষা কৰি উলংঘামূলক হ'লে বাতিল কৰাৰ ক্ষমতা।",
      subjectTopic: 'Judiciary',
      marks: 2,
    },
    {
      question: "A writ petition filed in public interest in the Supreme Court or High Court is known as?\nউচ্চতম বা উচ্চ ন্যায়ালয়ত জনস্বাৰ্থত দাখিল কৰা ৰিট আবেদনক কি বোলা হয়?",
      options: [
        'Special Leave Petition / বিশেষ অনুমতি আবেদন',
        'Habeas Corpus / হেবিয়াছ কৰ্পাছ',
        'Writ of Mandamus / এমেণ্ডামাছ ৰিট',
        'Public Interest Litigation / জনস্বাৰ্থ মামলা',
      ],
      correctAnswerIndex: 3,
      explanation: "A Public Interest Litigation (PIL) is a legal action brought in court to enforce public interest, available to any citizen on behalf of the disadvantaged.\nজনস্বাৰ্থ মামলা (PIL) হৈছে ৰাজহুৱা স্বাৰ্থ বলবৎ কৰিবলৈ আদালতত দাখিল কৰা এক আইনী পদক্ষেপ, যি বঞ্চিতসকলৰ হৈ যিকোনো নাগৰিকে দাখিল কৰিব পাৰে।",
      subjectTopic: 'Judiciary',
      marks: 2,
    },

    // --- Federalism (5) ---
    {
      question: "Article 1 of the Constitution describes India as?\nসংবিধানৰ ধাৰা ১য়ে ভাৰতক কেনেকৈ বৰ্ণনা কৰিছে?",
      options: [
        'Union of States / ৰাজ্যসমূহৰ সংঘ',
        'Federation of States / ৰাজ্যসমূহৰ যুক্তৰাষ্ট্ৰ',
        'Confederation of States / ৰাজ্যসমূহৰ সংমণ্ডল',
        'Republic of States / ৰাজ্যসমূহৰ গণৰাজ্য',
      ],
      correctAnswerIndex: 0,
      explanation: "Article 1 describes India as a 'Union of States', indicating it is an indestructible union with the centre having more power than a typical federation.\nধাৰা ১য়ে ভাৰতক 'ৰাজ্যসমূহৰ সংঘ' হিচাপে বৰ্ণনা কৰিছে, যি সূচায় যে ই এক অবিনশ্বৰী সংঘ যাৰ কেন্দ্ৰৰ শক্তি সাধাৰণ যুক্তৰাষ্ট্ৰতকৈ অধিক।",
      subjectTopic: 'Federalism',
      marks: 2,
    },
    {
      question: "Which Schedule of the Constitution deals with the division of powers between Union and States?\nসংবিধানৰ কোনটো তফসিলত কেন্দ্ৰ আৰু ৰাজ্যৰ মাজত ক্ষমতা বিভাজন আলোচনা কৰা হৈছে?",
      options: [
        'First Schedule / প্ৰথম তফসিল',
        'Seventh Schedule / সপ্তম তফসিল',
        'Eighth Schedule / অষ্টম তফসিল',
        'Tenth Schedule / দশম তফসিল',
      ],
      correctAnswerIndex: 1,
      explanation: "The Seventh Schedule contains three lists - Union List, State List, and Concurrent List - dividing legislative powers between the centre and states.\nসপ্তম তফসিলত তিনিটা তালিকা আছে - কেন্দ্ৰীয় তালিকা, ৰাজ্যিক তালিকা আৰু সমবৰ্তী তালিকা - যিয়ে কেন্দ্ৰ আৰু ৰাজ্যৰ মাজত আইনসভা ক্ষমতা বিভাজন কৰে।",
      subjectTopic: 'Federalism',
      marks: 2,
    },
    {
      question: "Which of the following subjects is included in the Union List?\nতলত কোনটো বিষয় কেন্দ্ৰীয় তালিকাত অন্তৰ্ভুক্ত?",
      options: [
        'Police / আৰক্ষী',
        'Public Health / জনস্বাস্থ্য',
        'Defence / প্ৰতিৰক্ষা',
        'Local Government / স্থানীয় চৰকাৰ',
      ],
      correctAnswerIndex: 2,
      explanation: "Defence is a subject in the Union List, giving the central government exclusive power to legislate on it, along with foreign affairs, atomic energy, etc.\nপ্ৰতিৰক্ষা কেন্দ্ৰীয় তালিকাৰ এটা বিষয়, যি কেন্দ্ৰ চৰকাৰক ইয়াৰ ওপৰত আইন প্ৰণয়নৰ একচেটিয়া ক্ষমতা দিয়ে, বৈদেশিক পৰিক্ৰমা, পৰমাণু শক্তি ইত্যাদিৰ সৈতে।",
      subjectTopic: 'Federalism',
      marks: 2,
    },
    {
      question: "Which of the following subjects is included in the State List?\nতলত কোনটো বিষয় ৰাজ্যিক তালিকাত অন্তর্ভুক্ত?",
      options: [
        'Foreign Affairs / বৈদেশিক পৰিক্ৰমা',
        'Banking / বেংকিং',
        'Currency / মুদ্ৰা',
        'Police / আৰক্ষী',
      ],
      correctAnswerIndex: 3,
      explanation: "Police, public health, agriculture, and local government are among the subjects in the State List under the Seventh Schedule.\nআৰক্ষী, জনস্বাস্থ্য, কৃষি আৰু স্থানীয় চৰকাৰ সপ্তম তফসিলৰ অধীনত ৰাজ্যিক তালিকাৰ বিষয়সমূহৰ ভিতৰত আছে।",
      subjectTopic: 'Federalism',
      marks: 2,
    },
    {
      question: "Under the Constitution, residuary powers (subjects not mentioned in any list) are vested in?\nসংবিধান অনুসৰি, অৱশিষ্ট ক্ষমতা (কোনো তালিকাত উল্লেখ নথকা বিষয়) কাৰ ওপৰত ন্যস্ত?",
      options: [
        'Union Government / কেন্দ্ৰ চৰকাৰ',
        'State Government / ৰাজ্য চৰকাৰ',
        'Local Bodies / স্থানীয় সংস্থা',
        'Judiciary / ন্যায়াপালিকা',
      ],
      correctAnswerIndex: 0,
      explanation: "Under Article 248, residuary powers — subjects not mentioned in any of the three lists — are vested in the Union Government, making India a unitary-leaning federation.\nধাৰা ২৪৮ অনুসৰি অৱশিষ্ট ক্ষমতা — তিনিটা তালিকাৰ কোনোটোতে উল্লেখ নথকা বিষয় — কেন্দ্ৰ চৰকাৰৰ ওপৰত ন্যস্ত, যাৰ ফলত ভাৰত এক একক-ঝোঁৱৰ যুক্তৰাষ্ট্ৰ।",
      subjectTopic: 'Federalism',
      marks: 2,
    },

    // --- Assam Polity (7) ---
    {
      question: "Who was the first Chief Minister of Assam?\nঅসমৰ প্ৰথমগৰাকী মুখ্যমন্ত্ৰী কোন আছিল?",
      options: [
        'Bishnuram Medhi / বিষ্ণুৰাম মেধি',
        'Gopinath Bordoloi / গোপীনাথ বৰদলৈ',
        'Sarat Chandra Sinha / শৰৎ চন্দ্ৰ সিংহ',
        'Bimala Prasad Chaliha / বিমলা প্ৰসাদ চালিহা',
      ],
      correctAnswerIndex: 1,
      explanation: "Gopinath Bordoloi was the first Chief Minister of Assam (1946-1950) and a key figure in India's freedom movement, posthumously awarded the Bharat Ratna in 1999.\nগোপীনাথ বৰদলৈ অসমৰ প্ৰথমগৰাকী মুখ্যমন্ত্ৰী আছিল (১৯৪৬-১৯৫০) আৰু ভাৰতৰ স্বাধীনতা আন্দোলনৰ এগৰাকী মূল ব্যক্তি, যাক মৰণোত্তৰভাৱে ১৯৯৯ত ভাৰত ৰত্ন বঁটা প্ৰদান কৰা হৈছিল।",
      subjectTopic: 'Assam Polity',
      marks: 2,
    },
    {
      question: "How many seats are there in the Assam Legislative Assembly?\nঅসম বিধানসভাত কিমানটা আসন আছে?",
      options: [
        '120 / ১২০',
        '125 / ১২৫',
        '126 / ১২৬',
        '130 / ১৩০',
      ],
      correctAnswerIndex: 2,
      explanation: "The Assam Legislative Assembly has 126 seats, all elected directly from single-member constituencies for a five-year term.\nঅসম বিধানসভাত ১২৬টা আসন আছে, সকলোবোৰ এক-সদস্যযুক্ত সমষ্টিৰ পৰা পাঁচ বছৰৰ কাৰ্যকালৰ বাবে পোনপটীয়াকৈ নিৰ্বাচিত।",
      subjectTopic: 'Assam Polity',
      marks: 2,
    },
    {
      question: "What is the capital of Assam?\nঅসমৰ ৰাজধানী কি?",
      options: [
        'Guwahati / গুৱাহাটী',
        'Jorhat / যোৰহাট',
        'Tezpur / তেজপুৰ',
        'Dispur / দিছপুৰ',
      ],
      correctAnswerIndex: 3,
      explanation: "Dispur, a locality in Guwahati, is the capital of Assam, housing the state secretariat and legislative assembly.\nগুৱাহাটীৰ এটা অঞ্চল দিছপুৰ অসমৰ ৰাজধানী, য'ত ৰাজ্যিক সচিবালয় আৰু বিধানসভা অৱস্থিত।",
      subjectTopic: 'Assam Polity',
      marks: 2,
    },
    {
      question: "The Governor of Assam is appointed by whom?\nঅসমৰ ৰাজ্যপালক কোনে নিযুক্তি দিয়ে?",
      options: [
        'President of India / ভাৰতৰ ৰাষ্ট্ৰপতি',
        'Prime Minister of India / ভাৰতৰ প্ৰধানমন্ত্ৰী',
        'Chief Justice of India / ভাৰতৰ মুখ্য ন্যায়াধীশ',
        'Chief Minister of Assam / অসমৰ মুখ্যমন্ত্ৰী',
      ],
      correctAnswerIndex: 0,
      explanation: "The Governor of Assam, like all state governors, is appointed by the President of India under Article 155 and holds office during the President's pleasure.\nঅসমৰ ৰাজ্যপাল, সকলো ৰাজ্যৰ ৰাজ্যপালৰ দৰে, ধাৰা ১৫৫ৰ অধীনত ভাৰতৰ ৰাষ্ট্ৰপতিৰ দ্বাৰা নিযুক্ত হয় আৰু ৰাষ্ট্ৰপতিৰ সন্তুষ্টি কাললৈ পদত অধিষ্ঠিত থাকে।",
      subjectTopic: 'Assam Polity',
      marks: 2,
    },
    {
      question: "Which High Court has jurisdiction over the state of Assam?\nঅসম ৰাজ্যৰ ওপৰত কোনখন উচ্চ ন্যায়ালয়ৰ এক্তিয়াৰ আছে?",
      options: [
        'Calcutta High Court / কলিকতা উচ্চ ন্যায়ালয়',
        'Gauhati High Court / গুৱাহাটী উচ্চ ন্যায়ালয়',
        'Delhi High Court / দিল্লী উচ্চ ন্যায়ালয়',
        'Patna High Court / পাটনা উচ্চ ন্যায়ালয়',
      ],
      correctAnswerIndex: 1,
      explanation: "The Gauhati High Court, established in 1948, has jurisdiction over Assam and several other northeastern states.\n১৯৪৮ত প্ৰতিষ্ঠিত গুৱাহাটী উচ্চ ন্যায়ালয়ৰ অসম আৰু অন্য কেইবাখনো উত্তৰ-পূব ৰাজ্যৰ ওপৰত এক্তিয়াৰ আছে।",
      subjectTopic: 'Assam Polity',
      marks: 2,
    },
    {
      question: "How many Lok Sabha constituencies are there in Assam?\nঅসমত কিমানটা লোকসভা সমষ্টি আছে?",
      options: [
        '12 / ১২',
        '13 / ১৩',
        '14 / ১৪',
        '16 / ১৬',
      ],
      correctAnswerIndex: 2,
      explanation: "Assam has 14 Lok Sabha constituencies, with members elected for a five-year term through direct elections.\nঅসমত ১৪টা লোকসভা সমষ্টি আছে, যাৰ সদস্যসকল পাঁচ বছৰৰ কাৰ্যকালৰ বাবে পোনপটীয়া নিৰ্বাচনৰ দ্বাৰা নিৰ্বাচিত।",
      subjectTopic: 'Assam Polity',
      marks: 2,
    },
    {
      question: "How many seats does Assam have in the Rajya Sabha?\nঅসমৰ ৰাজ্যসভাত কিমানটা আসন আছে?",
      options: [
        '5 / ৫',
        '6 / ৬',
        '8 / ৮',
        '7 / ৭',
      ],
      correctAnswerIndex: 3,
      explanation: "Assam is represented by 7 members in the Rajya Sabha, elected by the elected members of the state legislative assembly.\nঅসম ৰাজ্যসভাত ৭জন সদস্যৰ দ্বাৰা প্ৰতিনিধিত্ব কৰা হয়, যাক ৰাজ্যিক বিধানসভাৰ নিৰ্বাচিত সদস্যসকলে নিৰ্বাচিত কৰে।",
      subjectTopic: 'Assam Polity',
      marks: 2,
    },

    // --- Local Govt (5) ---
    {
      question: "The Panchayati Raj system was given constitutional status by which amendment?\nপঞ্চায়তী ৰাজ ব্যৱস্থাক কোনটো সংশোধনীয়ে সাংবিধানিক মৰ্যাদা প্ৰদান কৰিছিল?",
      options: [
        '73rd Amendment / ৭৩তম সংশোধনী',
        '74th Amendment / ৭৪তম সংশোধনী',
        '61st Amendment / ৬১তম সংশোধনী',
        '86th Amendment / ৮৬তম সংশোধনী',
      ],
      correctAnswerIndex: 0,
      explanation: "The 73rd Constitutional Amendment Act, 1992 gave Panchayati Raj institutions constitutional status, adding Part IX and the 11th Schedule.\n৭৩তম সাংবিধানিক সংশোধনী আইন, ১৯৯২য়ে পঞ্চায়তী ৰাজ প্ৰতিষ্ঠানসমূহক সাংবিধানিক মৰ্যাদা প্ৰদান কৰিছিল, নৱম ভাগ আৰু একাদশ তফসিল যোগ কৰি।",
      subjectTopic: 'Local Govt',
      marks: 2,
    },
    {
      question: "Which amendment gave constitutional status to urban local bodies?\nকোনটো সংশোধনীয়ে নগৰীয়া স্থানীয় সংস্থাসমূহক সাংবিধানিক মৰ্যাদা প্ৰদান কৰিছিল?",
      options: [
        '73rd Amendment / ৭৩তম সংশোধনী',
        '74th Amendment / ৭৪তম সংশোধনী',
        '42nd Amendment / ৪২তম সংশোধনী',
        '44th Amendment / ৪৪তম সংশোধনী',
      ],
      correctAnswerIndex: 1,
      explanation: "The 74th Constitutional Amendment Act, 1992 gave constitutional status to urban local bodies, adding Part IX-A and the 12th Schedule.\n৭৪তম সাংবিধানিক সংশোধনী আইন, ১৯৯২য়ে নগৰীয়া স্থানীয় সংস্থাসমূহক সাংবিধানিক মৰ্যাদা প্ৰদান কৰিছিল, নৱম-ক ভাগ আৰু দ্বাদশ তফসিল যোগ কৰি।",
      subjectTopic: 'Local Govt',
      marks: 2,
    },
    {
      question: "The three-tier Panchayati Raj system consists of which levels?\nত্ৰিস্তৰীয় পঞ্চায়তী ৰাজ ব্যৱস্থা কোনবোৰ স্তৰৰে গঠিত?",
      options: [
        'Village and District only / কেৱল গাঁও আৰু জিলা',
        'Block and District only / কেৱল ব্লক আৰু জিলা',
        'Village, Block and District / গাঁও, ব্লক আৰু জিলা',
        'Village, Town and City / গাঁও, নগৰ আৰু চহৰ',
      ],
      correctAnswerIndex: 2,
      explanation: "The three-tier Panchayati Raj system consists of Gram Panchayat at village level, Panchayat Samiti at block level, and Zilla Parishad at district level.\nত্ৰিস্তৰীয় পঞ্চায়তী ৰাজ ব্যৱস্থা গাঁও স্তৰত গ্ৰাম পঞ্চায়ত, ব্লক স্তৰত পঞ্চায়ত সমিতি আৰু জিলা স্তৰত জিলা পৰিষদৰে গঠিত।",
      subjectTopic: 'Local Govt',
      marks: 2,
    },
    {
      question: "The Right of Children to Free and Compulsory Education Act was passed in which year?\nশিশুৰ বিনামূলীয়া আৰু বাধ্যতামূলক শিক্ষাৰ অধিকাৰ আইন কতবাৰত প্ৰণয়ন কৰা হৈছিল?",
      options: [
        '2005 / ২০০৫',
        '2007 / ২০০৭',
        '2008 / ২০০৮',
        '2009 / ২০০৯',
      ],
      correctAnswerIndex: 3,
      explanation: "The Right of Children to Free and Compulsory Education (RTE) Act was passed by Parliament in 2009 and came into effect on 1 April 2010.\nশিশুৰ বিনামূলীয়া আৰু বাধ্যতামূলক শিক্ষাৰ অধিকাৰ (RTE) আইন সংসদে ২০০৯ চনত প্ৰণয়ন কৰিছিল আৰু ১ এপ্ৰিল ২০১০ত কাৰ্যকৰ হৈছিল।",
      subjectTopic: 'Local Govt',
      marks: 2,
    },
    {
      question: "The RTE Act, 2009 provides free and compulsory education to children of which age group?\nRTE আইন, ২০০৯য়ে কোন বয়সৰ শিশুৰ বাবে বিনামূলীয়া আৰু বাধ্যতামূলক শিক্ষা প্ৰদান কৰে?",
      options: [
        '3 to 14 years / ৩ৰ পৰা ১৪ বছৰ',
        '6 to 14 years / ৬ৰ পৰা ১৪ বছৰ',
        '5 to 15 years / ৫ৰ পৰা ১৫ বছৰ',
        '6 to 18 years / ৬ৰ পৰা ১৮ বছৰ',
      ],
      correctAnswerIndex: 1,
      explanation: "The RTE Act, 2009 provides free and compulsory education to all children in the age group of 6 to 14 years as a fundamental right under Article 21-A.\nRTE আইন, ২০০৯য়ে ধাৰা ২১-কৰ অধীনত এটা মৌলিক অধিকাৰ হিচাপে ৬ৰ পৰা ১৪ বছৰ বয়সৰ সকলো শিশুক বিনামূলীয়া আৰু বাধ্যতামূলক শিক্ষা প্ৰদান কৰে।",
      subjectTopic: 'Local Govt',
      marks: 2,
    },
  ],
};
