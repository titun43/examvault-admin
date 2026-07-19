// =============================================================================
// ExamVault — TET (Teacher Eligibility Test) PART A
// Bilingual question pool — Child Development & Pedagogy (tet-cdp) + Assamese (tet-assamese)
//
// Format (CRITICAL — every field is bilingual EN + অসমীয়া):
//   question  -> "English\nঅসমীয়া"
//   option    -> "English / অসমীয়া"
//   expl      -> "English\nঅসমীয়া"
//
// tet-cdp      : 20 questions (Piaget, Vygotsky, Kohlberg, Learning Theory,
//                Assessment, Inclusive Education, RTE)
// tet-assamese : 20 questions (সন্ধি, সমাস, সাহিত্য, ভাষা শিক্ষণ)
// Total = 40 bilingual items.
//
// correctAnswerIndex is distributed across 0,1,2,3 in each pool
// (per-20 distribution: 0→5, 1→5, 2→5, 3→5) so test slicing produces a
// balanced answer key.
//
// All answers are verifiable from standard education / Assamese references.
// =============================================================================
import type { QuestionPoolMap } from './structure';

export const TET_POOLS_A: QuestionPoolMap = {
  // ===========================================================================
  // tet-cdp — Child Development & Pedagogy (20)
  // ===========================================================================
  'tet-cdp': [
    // --- Piaget (4) ---
    {
      question: "According to Piaget, which stage is characterised by object permanence and sensory exploration?\nপিয়াজেৰ মতে, বস্তু স্থায়িত্ব আৰু ইন্দ্ৰিয়ানুভূতিমূলক অন্বেষণ কোনটো পৰ্যায়ৰ বৈশিষ্ট্য?",
      options: [
        'Sensorimotor stage / ইন্দ্ৰিয়ানুভূতিমূলক পৰ্যায়',
        'Preoperational stage / পূৰ্ব-পৰিচালনামূলক পৰ্যায়',
        'Concrete operational stage / মূৰ্ত পৰিচালনামূলক পৰ্যায়',
        'Formal operational stage / মূৰ্ত পৰিচালনামূলক পৰ্যায়',
      ],
      correctAnswerIndex: 0,
      explanation: "Piaget's sensorimotor stage (birth–2 yrs) is marked by sensory exploration and the development of object permanence by around 8 months.\nপিয়াজেৰ ইন্দ্ৰিয়ানুভূতিমূলক পৰ্যায় (জন্ম–২ বছৰ) ইন্দ্ৰিয়ানুভূতিমূলক অন্বেষণ আৰু প্ৰায় ৮ মাহৰ ভিতৰত বস্তু স্থায়িত্বৰ বিকাশৰ বাবে পৰিচিত।",
      subjectTopic: 'Piaget',
      marks: 1,
    },
    {
      question: "The ability to perform mental operations on concrete objects develops in which Piagetian stage?\nমূৰ্ত বস্তুৰ ওপৰত মানসিক পৰিচালনা কৰাৰ ক্ষমতা পিয়াজেৰ কোনটো পৰ্যায়ত বিকাশ পায়?",
      options: [
        'Sensorimotor / ইন্দ্ৰিয়ানুভূতিমূলক',
        'Preoperational / পূৰ্ব-পৰিচালনামূলক',
        'Concrete operational / মূৰ্ত পৰিচালনামূলক',
        'Formal operational / মূৰ্ত পৰিচালনামূলক',
      ],
      correctAnswerIndex: 2,
      explanation: "The concrete operational stage (7–11 yrs) brings logical thought about concrete events, conservation, reversibility, and classification.\nমূৰ্ত পৰিচালনামূলক পৰ্যায়ে (৭–১১ বছৰ) মূৰ্ত ঘটনাৰ যুক্তিবোধ, সংৰক্ষণ, ওলোটা-পালোটা কৰা আৰু শ্ৰেণীবিভাজন আনে।",
      subjectTopic: 'Piaget',
      marks: 1,
    },
    {
      question: "Which Piagetian concept refers to the inability to take another person's perspective?\nপিয়াজেৰ কোনটো ধাৰণাই আনৰ দৃষ্টিভংগী গ্ৰহণ কৰিব নোৱাৰাটো বুজায়?",
      options: [
        'Animism / জড়াত্মবাদ',
        'Egocentrism / আত্মকেন্দ্ৰিকতা',
        'Conservation / সংৰক্ষণ',
        'Assimilation / সম্পৃক্তকৰণ',
      ],
      correctAnswerIndex: 1,
      explanation: "Egocentrism, seen in the preoperational stage, is the child's inability to distinguish their own perspective from that of others.\nপূৰ্ব-পৰিচালনামূলক পৰ্যায়ত দেখা পোৱা আত্মকেন্দ্ৰিকতাই শিশুৰ নিজৰ দৃষ্টিভংগী আৰু আনৰ দৃষ্টিভংগী পৃথক কৰিব নোৱাৰাটো বুজায়।",
      subjectTopic: 'Piaget',
      marks: 1,
    },
    {
      question: "Abstract and hypothetical reasoning characterises which Piagetian stage?\nবিমূৰ্ত আৰু কাল্পনিক যুক্তি পিয়াজেৰ কোনটো পৰ্যায়ৰ বৈশিষ্ট্য?",
      options: [
        'Sensorimotor / ইন্দ্ৰিয়ানুভূতিমূলক',
        'Preoperational / পূৰ্ব-পৰিচালনামূলক',
        'Concrete operational / মূৰ্ত পৰিচালনামূলক',
        'Formal operational / মূৰ্ত পৰিচালনামূলক',
      ],
      correctAnswerIndex: 3,
      explanation: "The formal operational stage (11+ yrs) brings abstract, hypothetical, and deductive reasoning.\nমূৰ্ত পৰিচালনামূলক পৰ্যায়ে (১১+ বছৰ) বিমূৰ্ত, কাল্পনিক আৰু নিগমনাত্মক যুক্তি আনে।",
      subjectTopic: 'Piaget',
      marks: 1,
    },

    // --- Vygotsky (3) ---
    {
      question: "Vygotsky's Zone of Proximal Development (ZPD) refers to:\nভাইগটস্কিৰ সম্ভাৱ্য বিকাশৰ অঞ্চল (ZPD) কি বুজায়?",
      options: [
        'Tasks a child can do alone / শিশুৱে অকলে কৰিব পৰা কাম',
        'Tasks a child can do with guidance but not yet alone / সহায়ত কৰিব পৰা কিন্তু এতিয়াও অকলে নোৱাৰা কাম',
        'Tasks too difficult even with help / সহায়তেও অতি কঠিন কাম',
        'Already mastered skills / ইতিমধ্যে আয়ত্ত কৰা দক্ষতা',
      ],
      correctAnswerIndex: 1,
      explanation: "The ZPD is the gap between what a learner can do independently and what they can do with guidance from a More Knowledgeable Other.\nZPD হৈছে শিকক্তই অকলে কৰিব পৰা আৰু অধিক জ্ঞানী ব্যক্তিৰ সহায়ত কৰিব পৰা কামৰ মাজৰ ব্যৱধান।",
      subjectTopic: 'Vygotsky',
      marks: 1,
    },
    {
      question: "In Vygotsky's theory, 'scaffolding' means:\nভাইগটস্কিৰ তত্ত্বত 'ছেফল্ডিং' মানে কি?",
      options: [
        'Standardised testing / মানকীকৃত পৰীক্ষা',
        'Memorising rules / নিয়ম মুখস্থ কৰা',
        'Temporary support adjusted to the learner\'s level / শিকক্তৰ স্তৰ অনুসৰি সাময়িক সহায় আগবঢ়োৱা',
        'Punishing wrong answers / ভুল উত্তৰৰ শাস্তি দিয়া',
      ],
      correctAnswerIndex: 2,
      explanation: "Scaffolding is the temporary, adjustable support a teacher gives so the learner can complete a task, gradually withdrawn as competence grows.\nছেফল্ডিং হৈছে শিক্ষকে দিয়া সাময়িক, সমন্বিত সহায় যাক শিকক্তৰ দক্ষতা বাঢ়িলে ক্ৰমাৎ আঁতৰোৱা হয়।",
      subjectTopic: 'Vygotsky',
      marks: 1,
    },
    {
      question: "Who is the 'More Knowledgeable Other' (MKO) in Vygotsky's theory?\nভাইগটস্কিৰ তত্ত্বত 'অধিক জ্ঞানী আন' (MKO) কোন?",
      options: [
        'Anyone with more understanding than the learner, including peers / শিকক্ততকৈ অধিক বুজ থকা যিকোনো ব্যক্তি, সমনীয়াও অন্তৰ্ভুক্ত',
        'Only a certified teacher / কেৱল প্ৰমাণিত শিক্ষক',
        'A standardized curriculum / এটা মানকীকৃত পাঠ্যক্ৰম',
        'The textbook publisher / পাঠ্যপুথি প্ৰকাশক',
      ],
      correctAnswerIndex: 0,
      explanation: "An MKO is anyone — teacher, peer, parent, even a digital tool — who has higher ability than the learner in a given task.\nMKO হৈছে কোনো নিৰ্দিষ্ট কামত শিকক্ততকৈ অধিক দক্ষ যিকোনো ব্যক্তি — শিক্ষক, সমনীয়া, অভিভাৱক বা ডিজিটেল সঁজুলিও।",
      subjectTopic: 'Vygotsky',
      marks: 1,
    },

    // --- Kohlberg (2) ---
    {
      question: "Kohlberg's pre-conventional level of moral development focuses on:\nক'হলবাৰ্গৰ নৈতিক বিকাশৰ পূৰ্ব-প্ৰথাগত স্তৰে কাক গুৰুত্ব দিয়ে?",
      options: [
        'Universal ethical principles / সাৰ্বজনীন নৈতিক নীতি',
        'Social contract / সামাজিক চুক্তি',
        'Obedience and punishment orientation / আজ্ঞাপালন আৰু শাস্তিৰ দৃষ্টিভংগী',
        'Maintaining social order / সামাজিক শৃংখলা বজাই ৰখা',
      ],
      correctAnswerIndex: 2,
      explanation: "At the pre-conventional level (typically early childhood), moral reasoning is governed by direct consequences — obedience to avoid punishment and reward-seeking.\nপূৰ্ব-প্ৰথাগত স্তৰত (সাধাৰণতে প্ৰাক-শৈশৱ) নৈতিক যুক্তি প্ৰত্যক্ষ ফলাফলেৰে নিয়ন্ত্ৰিত — শাস্তি এৰাই চলি আজ্ঞা পালন আৰু পুৰস্কাৰ বিচৰা।",
      subjectTopic: 'Kohlberg',
      marks: 1,
    },
    {
      question: "Kohlberg's highest stage of moral development is:\nক'হলবাৰ্গৰ নৈতিক বিকাশৰ সৰ্বোচ্চ স্তৰ কোনটো?",
      options: [
        'Good boy / good girl orientation / ভাল ল\'ৰা/ছোৱালী দৃষ্টিভংগী',
        'Law and order orientation / আইন আৰু শৃংখলা দৃষ্টিভংগী',
        'Universal ethical principles / সাৰ্বজনীন নৈতিক নীতি',
        'Instrumental relativist orientation / সঁজুলিমূলক আপেক্ষিকতাবাদী দৃষ্টিভংগী',
      ],
      correctAnswerIndex: 2,
      explanation: "Stage 6 — universal ethical principles — is Kohlberg's highest, where individuals follow internalised abstract moral principles even against law.\nষষ্ঠ স্তৰ — সাৰ্বজনীন নৈতিক নীতি — ক'হলবাৰ্গৰ সৰ্বোচ্চ স্তৰ, য'ত ব্যক্তিয়ে আইনৰ বিৰুদ্ধ গ'লেও আভ্যন্তৰীণ বিমূৰ্ত নৈতিক নীতি অনুসৰণ কৰে।",
      subjectTopic: 'Kohlberg',
      marks: 1,
    },

    // --- Learning Theory (4) ---
    {
      question: "Skinner's operant conditioning uses 'positive reinforcement' to:\nস্কিনাৰৰ সঁচালনামূলক অনুবৰ্তনত 'ধনাত্মক পুনঃবলন' কি কৰিবলৈ ব্যৱহাৰ কৰা হয়?",
      options: [
        'Decrease a behaviour / আচৰণ হ্ৰাস কৰিবলৈ',
        'Punish the learner / শিকক্তক শাস্তি দিবলৈ',
        'Remove a stimulus / উদ্দীপক আঁতৰাবলৈ',
        'Increase a behaviour by adding a pleasant stimulus / আনন্দদায়ক উদ্দীপক যোগ কৰি আচৰণ বৃদ্ধি কৰিবলৈ',
      ],
      correctAnswerIndex: 3,
      explanation: "Positive reinforcement adds a pleasant stimulus after a behaviour to increase the likelihood of that behaviour recurring.\nধনাত্মক পুনঃবলনে এটা আচৰণৰ পিছত আনন্দদায়ক উদ্দীপক যোগ কৰে যাতে সেই আচৰণ পুনৰ হোৱাৰ সম্ভাৱনা বাঢ়ে।",
      subjectTopic: 'Learning Theory',
      marks: 1,
    },
    {
      question: "Pavlov's classical conditioning is best demonstrated by which phenomenon?\nপাভলভৰ শাস্ত্ৰীয় অনুবৰ্তন কোনটো পৰিঘটনাৰ দ্বাৰা ভালদৰে দেখুওৱা হয়?",
      options: [
        'A dog salivating to the sound of a bell / ঘণ্টাৰ শব্দত কুকুৰে লালটি নিৰ্গত কৰা',
        'A rat pressing a lever for food / খাদ্যৰ বাবে এন্দুৰে লিভাৰ টিপা',
        'A child learning to read / শিশুৱে পঢ়া শিকা',
        'A student solving an equation / ছাত্ৰই সমীকৰণ সমাধান কৰা',
      ],
      correctAnswerIndex: 0,
      explanation: "Pavlov paired a neutral bell with food until the bell alone elicited salivation — the conditioned response.\nপাভলভে এটা নিৰপেক্ষ ঘণ্টা খাদ্যৰ সৈতে যুটিয়াই যোৱা পৰ্যন্ত ঘণ্টাটোৱে অকলেই লালটি নিৰ্গত কৰিবলৈ বাধ্য কৰালে — সৰ্তশীল প্ৰতিক্ৰিয়া।",
      subjectTopic: 'Learning Theory',
      marks: 1,
    },
    {
      question: "Gardner's theory of multiple intelligences includes all EXCEPT:\nগাৰ্ডনাৰৰ বহুবিধ বুদ্ধিমত্তা তত্ত্বই যিবোৰ নাভৰায় তাৰ ভিতৰত আছে (বাদ পৰা এটা বাছনি কৰক):",
      options: [
        'Linguistic intelligence / ভাষিক বুদ্ধিমত্তা',
        'Single IQ (g-factor) intelligence / একক IQ (g-কাৰক) বুদ্ধিমত্তা',
        'Logical-mathematical intelligence / যুক্তিমূলক-গাণিতিক বুদ্ধিমত্তা',
        'Musical intelligence / সংগীতিক বুদ্ধিমত্তা',
      ],
      correctAnswerIndex: 1,
      explanation: "Gardner proposed distinct intelligences (linguistic, logical-mathematical, musical, spatial, bodily-kinaesthetic, interpersonal, intrapersonal, naturalist); he explicitly opposed the single g-factor IQ model.\nগাৰ্ডনাৰে ভিন্ন বুদ্ধিমত্তা প্ৰস্তাৱ কৰিছিল (ভাষিক, যুক্তিমূলক-গাণিতিক, সংগীতিক, স্থানিক, শাৰীৰিক-গতিবেগীয়, আন্তঃব্যক্তিগত, অন্তঃব্যক্তিগত, প্ৰাকৃতিক); তেওঁ একক g-কাৰক IQ মডেলৰ স্পষ্ট বিৰোধ কৰিছিল।",
      subjectTopic: 'Learning Theory',
      marks: 1,
    },
    {
      question: "Bruner's spiral curriculum is based on the idea that:\nব্ৰুনাৰৰ সৰ্পিল পাঠ্যক্ৰমৰ ভিত্তি হৈছে:",
      options: [
        'Topics should be taught only once / বিষয় কেৱল এবাৰহে শিকোৱা উচিত',
        'Learning is purely biological / শিকন সম্পূৰ্ণ জৈৱিক',
        'Memory is fixed at birth / স্মৃতি জন্মতেই নিৰ্ধাৰিত',
        'Complex ideas are revisited at increasing depth over time / জটিল ধাৰণা সময়ৰ লগে লগে ক্ৰমাৎ গভীৰতাৰে পুনৰ শিকোৱা উচিত',
      ],
      correctAnswerIndex: 3,
      explanation: "Bruner argued that any subject can be taught honestly in some form at any age, with ideas revisited at deeper levels as the learner matures — the spiral curriculum.\nব্ৰুনাৰে যুক্তি দিছিল যে যিকোনো বিষয় যিকোনো বয়সতেই কোনো নিৰ্দিষ্ট ৰূপত শিকোৱা সম্ভৱ, আৰু শিকক্ত ডাঙৰ হ'লে ধাৰণা গভীৰ স্তৰত পুনৰ শিকোৱা হয় — সৰ্পিল পাঠ্যক্ৰম।",
      subjectTopic: 'Learning Theory',
      marks: 1,
    },

    // --- Assessment (3) ---
    {
      question: "Formative assessment is primarily used to:\nগঠনমূলক মূল্যায়ন মূলতঃ কি কাৰণে ব্যৱহাৰ কৰা হয়?",
      options: [
        'Grade students at term-end / শব্দান্তত ছাত্ৰক গ্ৰেড দিবলৈ',
        'Rank students nationally / ৰাষ্ট্ৰীয়ভাৱে ছাত্ৰক স্থান দিবলৈ',
        'Decide promotion only / কেৱল উন্নতি নিৰ্ধাৰণ কৰিবলৈ',
        'Provide feedback during learning to improve instruction / শিকনৰ সময়ত মতামত দি শিক্ষণ উন্নত কৰিবলৈ',
      ],
      correctAnswerIndex: 3,
      explanation: "Formative assessment is ongoing, low-stakes feedback used DURING instruction to adjust teaching and support learning.\nগঠনমূলক মূল্যায়ন হৈছে শিক্ষণৰ সময়ত ব্যৱহৃত চলি থকা, নিম্ন-পুঁজিৰ মতামত যিয়ে শিক্ষণ সমন্বয় আৰু শিকন সমৰ্থন কৰে।",
      subjectTopic: 'Assessment',
      marks: 1,
    },
    {
      question: "Summative assessment differs from formative because it:\nসামগ্ৰিক মূল্যায়ন গঠনমূলকৰ পৰা পৃথক কিয় কাৰণ ই:",
      options: [
        'Happens during the lesson / পাঠৰ সময়ত হয়',
        'Evaluates learning at the end of a unit or course / একক বা পাঠ্যক্ৰমৰ শেষত শিকন মূল্যায়ন কৰে',
        'Gives no grade / কোনো গ্ৰেড নিদিয়ে',
        'Is always informal / সদায় অনৌপচাৰিক',
      ],
      correctAnswerIndex: 1,
      explanation: "Summative assessment measures learning at the end of a programme (e.g., final exam) for grading, certification, or accountability.\nসামগ্ৰিক মূল্যায়নে এটা কাৰ্যসূচীৰ শেষত (যেনে চূড়ান্ত পৰীক্ষা) গ্ৰেডিং, প্ৰমাণপত্ৰ বা জবাবদিহিতাৰ বাবে শিকন জুখে।",
      subjectTopic: 'Assessment',
      marks: 1,
    },
    {
      question: "Under India's CCE (Continuous and Comprehensive Evaluation), assessment covers:\nভাৰতৰ CCE (নিৰন্তৰ আৰু সমন্বিত মূল্যায়ন) অনুসৰি মূল্যায়নে কাক সামৰি লয়?",
      options: [
        'Both scholastic and co-scholastic areas / শৈক্ষিক আৰু সহ-শৈক্ষিক দুয়োটা ক্ষেত্ৰ',
        'Only written exams / কেৱল লিখিত পৰীক্ষা',
        'Only sports / কেৱল ক্ৰীড়া',
        'Only attendance / কেৱল উপস্থিতি',
      ],
      correctAnswerIndex: 0,
      explanation: "CCE evaluates scholastic (academic subjects) AND co-scholastic (life skills, attitudes, values, arts, sports) areas continuously throughout the year.\nCCE-এ শৈক্ষিক (শৈক্ষিক বিষয়) আৰু সহ-শৈক্ষিক (জীৱন দক্ষতা, মনোভাৱ, মূল্য, কলা, ক্ৰীড়া) দুয়োটা ক্ষেত্ৰ বছৰজুৰি নিৰন্তৰ মূল্যায়ন কৰে।",
      subjectTopic: 'Assessment',
      marks: 1,
    },

    // --- Inclusive Education (2) ---
    {
      question: "Inclusive education primarily means:\nসমন্বিত শিক্ষাৰ মূল অৰ্থ হৈছে:",
      options: [
        'Separate schools for children with disabilities / প্ৰতিবন্ধী শিশুৰ বাবে পৃথক বিদ্যালয়',
        'Only gifted children in regular schools / কেৱল প্ৰতিভাশালী শিশু সাধাৰণ বিদ্যালয়ত',
        'All children learning together in the same classroom regardless of differences / পাৰ্থক্য নোহোৱাকৈ সকলো শিশুৱে একেটা শ্ৰেণীকোঠাত একেলগে শিকা',
        'Home-based schooling only / কেৱল ঘৰভিত্তিক শিক্ষা',
      ],
      correctAnswerIndex: 2,
      explanation: "Inclusive education means all students — regardless of ability, background, or difference — learn together in age-appropriate regular classrooms with appropriate support.\nসমন্বিত শিক্ষা মানে সকলো ছাত্ৰ — দক্ষতা, পৃষ্ঠভূমি বা পাৰ্থক্য নিৰ্বিশেষে — উপযুক্ত সহায়ত বয়স-উপযুক্ত নিয়মীয়া শ্ৰেণীকোঠাত একেলগে শিকে।",
      subjectTopic: 'Inclusive Education',
      marks: 1,
    },
    {
      question: "CWSN stands for:\nCWSN ৰ সম্পূৰ্ণ ৰূপ কি?",
      options: [
        'Children With Special Needs / বিশেষ প্ৰয়োজনীয় শিশু',
        'Centre for Welfare of Students National / ৰাষ্ট্ৰীয় ছাত্ৰ কল্যাণ কেন্দ্ৰ',
        'Curriculum With Standard Norms / মানক নিয়ম সহ পাঠ্যক্ৰম',
        'Council of Women\'s School Networks / মহিলা বিদ্যালয় নেটৱৰ্ক পৰিষদ',
      ],
      correctAnswerIndex: 0,
      explanation: "CWSN = Children With Special Needs — children who require adapted materials, teaching, or environment due to disability or learning difference.\nCWSN = বিশেষ প্ৰয়োজনীয় শিশু — প্ৰতিবন্ধকতা বা শিকন পাৰ্থক্যৰ বাবে অভিযোজিত সামগ্ৰী, শিক্ষণ বা পৰিৱেশ প্ৰয়োজন শিশু।",
      subjectTopic: 'Inclusive Education',
      marks: 1,
    },

    // --- RTE (2) ---
    {
      question: "Under the RTE Act 2009, free and compulsory education is guaranteed to children of which age group?\nRTE আইন ২০০৯ অনুসৰি কোনটো বয়সৰ গোটৰ শিশুৰ বাবে বিনামূল্যে আৰু বাধ্যতামূলক শিক্ষা নিশ্চিত কৰা হৈছে?",
      options: [
        '3–8 years / ৩–৮ বছৰ',
        '6–14 years / ৬–১৪ বছৰ',
        '4–10 years / ৪–১০ বছৰ',
        '6–18 years / ৬–১৮ বছৰ',
      ],
      correctAnswerIndex: 1,
      explanation: "The Right of Children to Free and Compulsory Education (RTE) Act, 2009 guarantees free and compulsory education to every child aged 6 to 14 years.\nশিশুৰ বিনামূল্যে আৰু বাধ্যতামূলক শিক্ষাৰ অধিকাৰ (RTE) আইন, ২০০৯-এ ৬ৰ পৰা ১৪ বছৰ বয়সৰ প্ৰতিটো শিশুৰ বাবে বিনামূল্যে আৰু বাধ্যতামূলক শিক্ষা নিশ্চিত কৰে।",
      subjectTopic: 'RTE',
      marks: 1,
    },
    {
      question: "The RTE Act 2009 reserves what percentage of seats in private schools for children from disadvantaged groups?\nRTE আইন ২০০৯ অনুসৰি ব্যক্তিগত বিদ্যালয়ত অনগ্ৰসৰ গোটৰ শিশুৰ বাবে কিমান শতাংশ আসন সংৰক্ষিত?",
      options: [
        '15% / ১৫%',
        '33% / ৩৩%',
        '50% / ৫০%',
        '25% / ২৫%',
      ],
      correctAnswerIndex: 3,
      explanation: "Section 12(1)(c) of the RTE Act mandates that private schools reserve 25% of entry-level seats for children from socially and economically disadvantaged sections.\nRTE আইনৰ ধাৰা ১২(১)(চি)-এ ব্যক্তিগত বিদ্যালয়ক প্ৰৱেশ-স্তৰৰ ২৫% আসন সামাজিক আৰু অৰ্থনৈতিকভাৱে অনগ্ৰসৰ শিশুৰ বাবে সংৰক্ষণ কৰিবলৈ নিৰ্দেশ দিয়ে।",
      subjectTopic: 'RTE',
      marks: 1,
    },
  ],

  // ===========================================================================
  // tet-assamese — অসমীয়া ভাষা (20)
  // ===========================================================================
  'tet-assamese': [
    // --- সন্ধি (5) ---
    {
      question: "'বিদ্যালয়' শব্দৰ সন্ধি বিচ্ছেদ কৰিলে পোৱা যায়:\n'বিদ্যালয়' শব্দৰ সন্ধি বিচ্ছেদ কৰিলে পোৱা যায়:",
      options: [
        'বিদ + যালয় / বিদ + যালয়',
        'বিদ্যা + আলয় / বিদ্যা + আলয়',
        'বিদ্ + যালয় / বিদ্ + যালয়',
        'বিদ্যা + লয় / বিদ্যা + লয়',
      ],
      correctAnswerIndex: 1,
      explanation: "স্বৰ সন্ধিৰ নিয়মানুসাৰে 'বিদ্যা' + 'আলয়' = 'বিদ্যালয়' (আ + আ = আ, দীৰ্ঘ স্বৰ)।\nAs per vowel-sandhi rule 'বিদ্যা' + 'আলয়' = 'বিদ্যালয়' (আ + আ = আ, long vowel).",
      subjectTopic: 'সন্ধি',
      marks: 1,
    },
    {
      question: "'পৰমেশ্বৰ' শব্দত কোনটো সন্ধি আছে?\n'পৰমেশ্বৰ' শব্দত কোনটো সন্ধি আছে?",
      options: [
        'স্বৰ সন্ধি / স্বৰ সন্ধি',
        'ব্যঞ্জন সন্ধি / ব্যঞ্জন সন্ধি',
        'বিসৰ্গ সন্ধি / বিসৰ্গ সন্ধি',
        'কোনো সন্ধি নাই / কোনো সন্ধি নাই',
      ],
      correctAnswerIndex: 1,
      explanation: "'পৰমেশ্বৰ' = 'পৰম' + 'ঈশ্বৰ'; ইয়াত ম্ + ঈ = মেশ্বৰ — ব্যঞ্জন সন্ধিৰ উদাহৰণ।\n'পৰমেশ্বৰ' = 'পৰম' + 'ঈশ্বৰ'; here ম্ + ঈ = মেশ্বৰ — an example of consonant sandhi.",
      subjectTopic: 'সন্ধি',
      marks: 1,
    },
    {
      question: "'গাৰৈ' শব্দৰ সন্ধি বিচ্ছেদ কৰিলে পোৱা যায়:\n'গাৰৈ' শব্দৰ সন্ধি বিচ্ছেদ কৰিলে পোৱা যায়:",
      options: [
        'গা + ৰৈ / গা + ৰৈ',
        'গৈ + ৰৈ / গৈ + ৰৈ',
        'গো + ৰৈ / গো + ৰৈ',
        'গৈ + ৰই / গৈ + ৰই',
      ],
      correctAnswerIndex: 2,
      explanation: "'গাৰৈ' = 'গো' + 'ৰৈ' — স্বৰ সন্ধিৰ উদাহৰণ (অ' ধ্বনিৰ পৰিৱৰ্তন)।\n'গাৰৈ' = 'গো' + 'ৰৈ' — example of vowel sandhi (change of অ' sound).",
      subjectTopic: 'সন্ধি',
      marks: 1,
    },
    {
      question: "'মহৰ্ষি' শব্দৰ সঠিক সন্ধি বিচ্ছেদ কোনটো?\n'মহৰ্ষি' শব্দৰ সঠিক সন্ধি বিচ্ছেদ কোনটো?",
      options: [
        'মহ + ঋষি / মহ + ঋষি',
        'মহে + ঋষি / মহে + ঋষি',
        'মহ + সৰ্ষি / মহ + সৰ্ষি',
        'মহা + ঋষি / মহা + ঋষি',
      ],
      correctAnswerIndex: 3,
      explanation: "'মহৰ্ষি' = 'মহা' + 'ঋষি'; আ + ঋ = অৰ্ — স্বৰ সন্ধি।\n'মহৰ্ষি' = 'মহা' + 'ঋষি'; আ + ঋ = অৰ্ — vowel sandhi.",
      subjectTopic: 'সন্ধি',
      marks: 1,
    },
    {
      question: "নিচ্ছিদ্ৰ শব্দত সন্ধি বিচ্ছেদ হ'লে পোৱা যায়:\nনিচ্ছিদ্ৰ শব্দত সন্ধি বিচ্ছেদ হ'লে পোৱা যায়:",
      options: [
        'নি + ছিদ্ৰ / নি + ছিদ্ৰ',
        'নিচ + ছিদ্ৰ / নিচ + ছিদ্ৰ',
        'নিশ + ছিদ্ৰ / নিশ + ছিদ্ৰ',
        'নিঃ + ছিদ্ৰ / নিঃ + ছিদ্ৰ',
      ],
      correctAnswerIndex: 3,
      explanation: "'নিচ্ছিদ্ৰ' = 'নিঃ' + 'ছিদ্ৰ'; বিসৰ্গৰ পিছত 'ছ' থাকিলে বিসৰ্গ লোপ পাই 'চ্' হয় — বিসৰ্গ সন্ধি।\n'নিচ্ছিদ্ৰ' = 'নিঃ' + 'ছিদ্ৰ'; when 'ছ' follows visarga, visarga drops to 'চ্' — visarga sandhi.",
      subjectTopic: 'সন্ধি',
      marks: 1,
    },

    // --- সমাস (5) ---
    {
      question: "'ৰাজপুত্ৰ' শব্দৰ সমাসৰ নাম কি?\n'ৰাজপুত্ৰ' শব্দৰ সমাসৰ নাম কি?",
      options: [
        'কৰ্মধাৰয় সমাস / কৰ্মধাৰয় সমাস',
        'দ্বন্দ্ব সমাস / দ্বন্দ্ব সমাস',
        'তৎপুৰুষ সমাস / তৎপুৰুষ সমাস',
        'বহুব্ৰীহি সমাস / বহুব্ৰীহি সমাস',
      ],
      correctAnswerIndex: 2,
      explanation: "'ৰাজপুত্ৰ' = 'ৰাজাৰ পুত্ৰ' — চতুৰ্থী তৎপুৰুষ সমাস; পূৰ্বপদে উত্তৰপদক সম্বন্ধ কৰে।\n'ৰাজপুত্ৰ' = 'ৰাজাৰ পুত্ৰ' — caturthi tatpurusha compound; the prior member relates to the latter.",
      subjectTopic: 'সমাস',
      marks: 1,
    },
    {
      question: "'নীলকমল' (নীলা কমল) কোনটো সমাসৰ উদাহৰণ?\n'নীলকমল' (নীলা কমল) কোনটো সমাসৰ উদাহৰণ?",
      options: [
        'দ্বন্দ্ব / দ্বন্দ্ব',
        'বহুব্ৰীহি / বহুব্ৰীহি',
        'কৰ্মধাৰয় / কৰ্মধাৰয়',
        'অব্যয়ীভাৱ / অব্যয়ীভাৱ',
      ],
      correctAnswerIndex: 2,
      explanation: "'নীলকমল' = নীলা কমল — বিশেষণ-বিশেষ্য সম্পৰ্ক, সেয়ে কৰ্মধাৰয় সমাস।\n'নীলকমল' = blue lotus — adjective-noun relation, hence karmadharaya compound.",
      subjectTopic: 'সমাস',
      marks: 1,
    },
    {
      question: "'মাতাপিতা' শব্দৰ সমাস কোনটো?\n'মাতাপিতা' শব্দৰ সমাস কোনটো?",
      options: [
        'তৎপুৰুষ সমাস / তৎপুৰুষ সমাস',
        'দ্বন্দ্ব সমাস / দ্বন্দ্ব সমাস',
        'কৰ্মধাৰয় সমাস / কৰ্মধাৰয় সমাস',
        'বহুব্ৰীহি সমাস / বহুব্ৰীহি সমাস',
      ],
      correctAnswerIndex: 1,
      explanation: "'মাতাপিতা' = মাতা আৰু পিতা — দুয়োটা পদে প্ৰধান, সেয়ে দ্বন্দ্ব সমাস।\n'মাতাপিতা' = mother and father — both members are primary, hence dvandva compound.",
      subjectTopic: 'সমাস',
      marks: 1,
    },
    {
      question: "'চাকৰিয়াল' শব্দটো কোন সমাসৰ উদাহৰণ?\n'চাকৰিয়াল' শব্দটো কোন সমাসৰ উদাহৰণ?",
      options: [
        'দ্বন্দ্ব সমাস / দ্বন্দ্ব সমাস',
        'তৎপুৰুষ সমাস / তৎপুৰুষ সমাস',
        'কৰ্মধাৰয় সমাস / কৰ্মধাৰয় সমাস',
        'বহুব্ৰীহি সমাস / বহুব্ৰীহি সমাস',
      ],
      correctAnswerIndex: 3,
      explanation: "'চাকৰিয়াল' — যিজনৰ চাকৰি আছে; উভয় পদে অপ্ৰধান হৈ তৃতীয় অৰ্থ বুজায় — বহুব্ৰীহি সমাস।\n'চাকৰিয়াল' — one who has a job; both members are non-primary and denote a third meaning — bahuvrihi compound.",
      subjectTopic: 'সমাস',
      marks: 1,
    },
    {
      question: "যিবোৰ সমাসত পূৰ্বপদটো প্ৰধান তাক বোলে:\nযিবোৰ সমাসত পূৰ্বপদটো প্ৰধান তাক বোলে:",
      options: [
        'অব্যয়ীভাৱ সমাস / অব্যয়ীভাৱ সমাস',
        'তৎপুৰুষ সমাস / তৎপুৰুষ সমাস',
        'বহুব্ৰীহি সমাস / বহুব্ৰীহি সমাস',
        'দ্বন্দ্ব সমাস / দ্বন্দ্ব সমাস',
      ],
      correctAnswerIndex: 0,
      explanation: "অব্যয়ীভাৱ সমাসত পূৰ্বপদটো প্ৰধান আৰু উত্তৰপদটো অপ্ৰধান; সাধাৰণতে পূৰ্বপদটো অব্যয় হয়।\nIn avyayibhava compound the prior member is primary and the latter is non-primary; usually the prior member is an indeclinable.",
      subjectTopic: 'সমাস',
      marks: 1,
    },

    // --- সাহিত্য (5) ---
    {
      question: "জ্যোতিপ্ৰসাদ আগৰৱালাক 'ৰূপকোঁৱৰ' উপাধি কিয় দিয়া হৈছিল?\nWhy is Jyotiprasad Agarwala given the title 'ৰূপকোঁৱৰ'?",
      options: [
        'For contribution to Assamese cinema and culture / অসমীয়া চলচ্চিত্ৰ আৰু সংস্কৃতিলৈ অৱদানৰ বাবে',
        'For contribution to agriculture / কৃষিলৈ অৱদানৰ বাবে',
        'For political leadership / ৰাজনৈতিক নেতৃত্বৰ বাবে',
        'For military service / সামৰিক সেৱাৰ বাবে',
      ],
      correctAnswerIndex: 0,
      explanation: "জ্যোতিপ্ৰসাদ আগৰৱালাই প্ৰথম অসমীয়া চলচ্চিত্ৰ 'জয়মতী' (১৯৩৫) নিৰ্মাণ কৰিছিল; সেয়ে তেখেতক 'ৰূপকোঁৱৰ' (সৌন্দর্য্যৰ ৰজা) বোলা হয়।\nJyotiprasad Agarwala produced the first Assamese film 'Joymati' (1935); hence he is called 'ৰূপকোঁৱৰ' (king of beauty).",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },
    {
      question: "বিষ্ণুপ্ৰসাদ ৰাভাক কি উপাধি দিয়া হৈছিল?\nWhat title was given to Bishnuprasad Rabha?",
      options: [
        'সাহিত্যথিয়ৰ / সাহিত্যথিয়ৰ',
        'কলাগুৰু / কলাগুৰু',
        'বাবেইজান / বাবেইজান',
        'গীতিকোঁৱৰ / গীতিকোঁৱৰ',
      ],
      correctAnswerIndex: 1,
      explanation: "বিষ্ণুপ্ৰসাদ ৰাভাই সংগীত, নৃত্য, অভিনয়, সাহিত্য আদি বহু কলাত পাৰদৰ্শিতা দেখুওৱা বাবে তেখেতক 'কলাগুৰু' বুলি জনা যায়।\nBishnuprasad Rabha excelled in music, dance, acting and literature, hence he is known as 'কলাগুৰু' (guru of arts).",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },
    {
      question: "ড° ভূপেন হাজৰিকাই কোনটো সংগীত সন্মানেৰে সন্মানিত?\nDr Bhupen Hazarika was honoured with which music award?",
      options: [
        'পদ্মশ্ৰী / পদ্মশ্ৰী',
        'ভাৰত ৰত্ন / ভাৰত ৰত্ন',
        'সংগীত নাটক একাডেমী বঁটা / সংগীত নাটক একাডেমী বঁটা',
        'গ্ৰেমী বঁটা / গ্ৰেমী বঁটা',
      ],
      correctAnswerIndex: 2,
      explanation: "ড° ভূপেন হাজৰিকাই ১৯৮৭ চনত সংগীত নাটক একাডেমী বঁটা লাভ কৰিছিল; তেখেতে পদ্মশ্ৰী, পদ্মভূষণ আৰু পদ্মবিভূষণো লাভ কৰিছিল।\nDr Bhupen Hazarika received the Sangeet Natak Akademi Award in 1987; he also received Padma Shri, Padma Bhushan and Padma Vibhushan.",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },
    {
      question: "মামণি ৰয়ছম গোস্বামীৰ উল্লেখযোগ্য উপন্যাস কোনটো?\nWhich is a notable novel by Mamoni Raisom Goswami?",
      options: [
        'মৃগনাভি / মৃগনাভি',
        'অহিৰণ / অহিৰণ',
        'দাতি আৰু আই / দাতি আৰু আই',
        'সাগৰলৈ বহুদূৰ / সাগৰলৈ বহুদূৰ',
      ],
      correctAnswerIndex: 1,
      explanation: "মামণি ৰয়ছম গোস্বামীয়ে ৰচনা কৰা 'অহিৰণ' তেখেতৰ উল্লেখযোগ্য উপন্যাস; তেওঁ জ্ঞানপীঠ বঁটা লাভ কৰিছিল।\n'Ahiron' is a notable novel by Mamoni Raisom Goswami; she also received the Jnanpith Award.",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },
    {
      question: "লক্ষ্মীনাথ বেজবৰুয়াক অসমীয়া সাহিত্যত কি বুলি জনা যায়?\nLakshminath Bezbaroa is known in Assamese literature as:",
      options: [
        'সাহিত্যৰথী / সাহিত্যৰথী',
        'কলাগুৰু / কলাগুৰু',
        'বুঢ়া আই / বুঢ়া আই',
        'অগ্নিকোঁৱৰ / অগ্নিকোঁৱৰ',
      ],
      correctAnswerIndex: 0,
      explanation: "লক্ষ্মীনাথ বেজবৰুয়াক অসমীয়া সাহিত্যৰ 'সাহিত্যৰথী' বুলি জনা যায়; তেওঁ 'বুঢ়ী আইৰ সাধু' আৰু 'কripabari' ৰচনা কৰিছিল।\nLakshminath Bezbaroa is called 'সাহিত্যৰথী' (charioteer of literature) in Assamese literature; he wrote 'Burhi Aair Sadhu' and 'Kripabar Barua'.",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },

    // --- ভাষা শিক্ষণ (5) ---
    {
      question: "ভাষা শিক্ষণৰ LSRW পদ্ধতিত 'W' য়ে কি বুজায়?\nIn LSRW method of language teaching, 'W' stands for:",
      options: [
        'Writing / লিখন',
        'Watching / চোৱা',
        'Working / কাম কৰা',
        'Waiting / অপেক্ষা কৰা',
      ],
      correctAnswerIndex: 0,
      explanation: "LSRW = Listening (শ্ৰবণ), Speaking (কথন), Reading (পঠন), Writing (লিখন) — ভাষা শিক্ষণৰ চাৰিটা মৌলিক দক্ষতা।\nLSRW = Listening, Speaking, Reading, Writing — the four foundational skills of language teaching.",
      subjectTopic: 'ভাষা শিক্ষণ',
      marks: 1,
    },
    {
      question: "ভাষা শিক্ষণত শ্ৰবণ দক্ষতা কিয় প্ৰথমে শিকোৱা হয়?\nWhy is listening skill taught first in language teaching?",
      options: [
        'Because it is the easiest / কাৰণ ই আটাইতকৈ সহজ',
        'Because it requires no effort / কাৰণ ইয়াত কোনো পৰিশ্ৰম নালাগে',
        'Because exams test only listening / কাৰণ পৰীক্ষাত কেৱল শ্ৰবণ পৰীক্ষা কৰা হয়',
        'Because language acquisition starts with listening before speaking / কাৰণ ভাষা অৰ্জন কথনৰ আগত শ্ৰবণেৰে আৰম্ভ হয়',
      ],
      correctAnswerIndex: 3,
      explanation: "শিশুৱে প্ৰথমে শুনি ভাষা আয়ত্ত কৰে, তাৰ পিছতহে কথন, পঠন আৰু লিখন আহে — প্ৰাকৃতিক ভাষা অৰ্জন ক্ৰম।\nA child first acquires language through listening, then speaking, reading and writing follow — natural language acquisition order.",
      subjectTopic: 'ভাষা শিক্ষণ',
      marks: 1,
    },
    {
      question: "শংকৰদেৱে অসমীয়া ভাষা আৰু সংস্কৃতিত কি অৱদান আগবঢ়াইছিল?\nWhat contribution did Sankardev make to Assamese language and culture?",
      options: [
        'Composed Borgeets and Ankiya Naats / বৰগীত আৰু অংকীয়া নাট ৰচনা',
        'Built modern bridges / আধুনিক দলং নিৰ্মাণ',
        'Started tea industry / চাহ উদ্যোগ আৰম্ভ',
        'Founded Assam University / অসম বিশ্ববিদ্যালয় স্থাপন',
      ],
      correctAnswerIndex: 0,
      explanation: "মহাপুৰুষ শংকৰদেৱে অসমীয়া ভাষাত বৰগীত, অংকীয়া নাট আৰু ভাওনা ৰচনা কৰি অসমীয়া সাহিত্য-সংস্কৃতি সমৃদ্ধ কৰিছিল আৰু একসৰণ ধৰ্ম প্ৰচাৰ কৰিছিল।\nMahapurush Sankardev enriched Assamese literature and culture by composing Borgeets, Ankiya Naats and Bhaona in Assamese, and propagated Ekasarana Dharma.",
      subjectTopic: 'সাহিত্য',
      marks: 1,
    },
    {
      question: "'প্ৰকৃতি-প্ৰত্যয়' ব্যাকৰণত প্ৰকৃতি হৈছে:\nIn 'prakriti-pratyaya' grammar, prakriti is:",
      options: [
        'The suffix added at the end / শেষত যোগ দিয়া প্ৰত্যয়',
        'A type of sandhi / সন্ধিৰ এক প্ৰকাৰ',
        'A case ending / কাৰক অন্ত প্ৰত্যয়',
        'The base word to which a suffix is added / যিটো মূল শব্দত প্ৰত্যয় যোগ দিয়া হয়',
      ],
      correctAnswerIndex: 3,
      explanation: "প্ৰকৃতি হৈছে মূল শব্দ (ধাতু বা শব্দ) যাৰ লগত প্ৰত্যয় যোগ দি নতুন শব্দ গঠন কৰা হয়; যেনে 'মন' + 'ইয়াল' = 'মনিয়াল'।\nPrakriti is the base word (root or stem) to which a suffix is added to form a new word; e.g., 'মন' + 'ইয়াল' = 'মনিয়াল'।",
      subjectTopic: 'ভাষা শিক্ষণ',
      marks: 1,
    },
    {
      question: "'কাৰক' ব্যাকৰণত কাৰক কিমান প্ৰকাৰ?\nIn 'karaka' grammar, how many types of karaka are there?",
      options: [
        '৪ প্ৰকাৰ / ৪ প্ৰকাৰ',
        '৫ প্ৰকাৰ / ৫ প্ৰকাৰ',
        '৬ প্ৰকাৰ / ৬ প্ৰকাৰ',
        '৮ প্ৰকাৰ / ৮ প্ৰকাৰ',
      ],
      correctAnswerIndex: 2,
      explanation: "অসমীয়া ব্যাকৰণত কাৰক ছয় প্ৰকাৰ — কৰ্তা, কৰ্ম, কৰণ, সম্প্ৰদান, অপাদান আৰু অধিকৰণ (কিছু প্ৰণালীত সম্বন্ধ আৰু সম্বোধন অন্তৰ্ভুক্ত)।\nIn Assamese grammar there are six karakas — karta, karma, karana, sampradana, apadana and adhikarana (some systems include sambandha and sambodhana).",
      subjectTopic: 'ভাষা শিক্ষণ',
      marks: 1,
    },
  ],
};
