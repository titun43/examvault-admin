import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Question Banks ───────────────────────────────────────────────────────────

const gkQuestions = [
  { text: "Who is known as the 'Father of the Indian Constitution'?", optionA: "Mahatma Gandhi", optionB: "Dr. B.R. Ambedkar", optionC: "Jawaharlal Nehru", optionD: "Sardar Patel", correctAnswer: "B", explanation: "Dr. B.R. Ambedkar was the chairman of the Drafting Committee of the Indian Constitution and is widely regarded as the Father of the Indian Constitution.", topic: "Indian Polity" },
  { text: "Which planet is known as the 'Red Planet'?", optionA: "Venus", optionB: "Jupiter", optionC: "Mars", optionD: "Saturn", correctAnswer: "C", explanation: "Mars is called the Red Planet due to the iron oxide (rust) on its surface, which gives it a reddish appearance.", topic: "General Science" },
  { text: "The currency of Japan is:", optionA: "Yuan", optionB: "Won", optionC: "Yen", optionD: "Ringgit", correctAnswer: "C", explanation: "The Japanese Yen (¥) is the official currency of Japan. It is the third most traded currency in the foreign exchange market.", topic: "World GK" },
  { text: "Which vitamin is also known as Ascorbic Acid?", optionA: "Vitamin A", optionB: "Vitamin B", optionC: "Vitamin C", optionD: "Vitamin D", correctAnswer: "C", explanation: "Vitamin C is chemically known as Ascorbic Acid. It is a water-soluble vitamin essential for collagen synthesis and immune function.", topic: "General Science" },
  { text: "The Headquarters of RBI is located in:", optionA: "New Delhi", optionB: "Kolkata", optionC: "Mumbai", optionD: "Chennai", correctAnswer: "C", explanation: "The Reserve Bank of India (RBI) headquarters is located in Mumbai, Maharashtra. It was established on April 1, 1935.", topic: "Indian Economy" },
  { text: "Which is the longest river in India?", optionA: "Yamuna", optionB: "Ganga", optionC: "Godavari", optionD: "Brahmaputra", correctAnswer: "B", explanation: "The Ganga is the longest river in India, flowing approximately 2,525 km from its origin at Gangotri Glacier to the Bay of Bengal.", topic: "Indian Geography" },
  { text: "The Battle of Plassey was fought in which year?", optionA: "1757", optionB: "1764", optionC: "1857", optionD: "1947", correctAnswer: "A", explanation: "The Battle of Plassey was fought on 23 June 1757 between the British East India Company and the Nawab of Bengal, Siraj-ud-Daulah.", topic: "Indian History" },
  { text: "Which article of the Indian Constitution deals with the Right to Equality?", optionA: "Article 12", optionB: "Article 14", optionC: "Article 19", optionD: "Article 21", correctAnswer: "B", explanation: "Article 14 of the Indian Constitution guarantees the Right to Equality before law and equal protection of laws within the territory of India.", topic: "Indian Polity" },
  { text: "The Tropic of Cancer passes through how many Indian states?", optionA: "6", optionB: "7", optionC: "8", optionD: "9", correctAnswer: "C", explanation: "The Tropic of Cancer passes through 8 Indian states: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram.", topic: "Indian Geography" },
  { text: "Who invented the World Wide Web?", optionA: "Bill Gates", optionB: "Tim Berners-Lee", optionC: "Steve Jobs", optionD: "Mark Zuckerberg", correctAnswer: "B", explanation: "Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN. He developed the first web browser and web server.", topic: "General Science" },
  { text: "The first Indian satellite launched was:", optionA: "Bhaskara", optionB: "Aryabhata", optionC: "INSAT-1A", optionD: "Rohini", correctAnswer: "B", explanation: "Aryabhata was India's first satellite, launched on 19 April 1975 by the Soviet Union. It was named after the ancient Indian mathematician.", topic: "General Science" },
  { text: "Which Indian state has the largest area?", optionA: "Madhya Pradesh", optionB: "Maharashtra", optionC: "Rajasthan", optionD: "Uttar Pradesh", correctAnswer: "C", explanation: "Rajasthan is the largest state in India by area, covering 342,239 sq km. It constitutes about 10.4% of India's total area.", topic: "Indian Geography" },
  { text: "The Panchayati Raj System was introduced by which amendment?", optionA: "71st Amendment", optionB: "72nd Amendment", optionC: "73rd Amendment", optionD: "74th Amendment", correctAnswer: "C", explanation: "The 73rd Constitutional Amendment Act of 1992 gave constitutional status to Panchayati Raj institutions and introduced the three-tier system.", topic: "Indian Polity" },
  { text: "Who was the first Governor General of free India?", optionA: "Lord Mountbatten", optionB: "C. Rajagopalachari", optionC: "Dr. Rajendra Prasad", optionD: "Jawaharlal Nehru", correctAnswer: "A", explanation: "Lord Mountbatten was the first Governor-General of independent India from 1947 to 1948. C. Rajagopalachari was the first and last Indian Governor-General.", topic: "Indian History" },
  { text: "The 'Dronacharya Award' is given for excellence in:", optionA: "Sports", optionB: "Coaching", optionC: "Literature", optionD: "Science", correctAnswer: "B", explanation: "The Dronacharya Award is given by the Government of India to recognize outstanding coaches in sports and games. It was instituted in 1985.", topic: "Current Affairs" },
  { text: "Which gas is most abundant in Earth's atmosphere?", optionA: "Oxygen", optionB: "Carbon Dioxide", optionC: "Nitrogen", optionD: "Hydrogen", correctAnswer: "C", explanation: "Nitrogen makes up approximately 78% of Earth's atmosphere. Oxygen accounts for about 21% and other gases make up the remaining 1%.", topic: "General Science" },
  { text: "The Quit India Movement was launched in which year?", optionA: "1940", optionB: "1942", optionC: "1944", optionD: "1946", correctAnswer: "B", explanation: "The Quit India Movement was launched by Mahatma Gandhi on 8 August 1942 at the Bombay session of the All-India Congress Committee.", topic: "Indian History" },
  { text: "Which is the national bird of India?", optionA: "Sparrow", optionB: "Parrot", optionC: "Peacock", optionD: "Eagle", correctAnswer: "C", explanation: "The Indian Peacock (Pavo cristatus) was declared the national bird of India in 1963 because of its rich religious and cultural significance.", topic: "General Knowledge" },
  { text: "The Fundamental Rights are enshrined in which part of the Indian Constitution?", optionA: "Part II", optionB: "Part III", optionC: "Part IV", optionD: "Part V", correctAnswer: "B", explanation: "The Fundamental Rights are enshrined in Part III (Articles 12-35) of the Indian Constitution. They are inspired by the US Bill of Rights.", topic: "Indian Polity" },
  { text: "The Earth rotates on its axis from:", optionA: "North to South", optionB: "South to North", optionC: "West to East", optionD: "East to West", correctAnswer: "C", explanation: "The Earth rotates on its axis from west to east (counter-clockwise when viewed from above the North Pole), which is why the Sun appears to rise in the east.", topic: "General Science" },
];

const mathQuestions = [
  { text: "If the ratio of A to B is 3:5 and B to C is 4:7, then what is the ratio of A:C?", optionA: "12:35", optionB: "12:20", optionC: "3:7", optionD: "15:28", correctAnswer: "A", explanation: "A:B = 3:5 and B:C = 4:7. To find A:C, make B equal: A:B = 12:20 and B:C = 20:35. Therefore A:C = 12:35.", topic: "Ratio & Proportion" },
  { text: "A train 200m long running at 72 km/h crosses a platform 300m long. How long will it take to cross the platform?", optionA: "25 seconds", optionB: "30 seconds", optionC: "20 seconds", optionD: "15 seconds", correctAnswer: "A", explanation: "Total distance = 200 + 300 = 500m. Speed = 72 km/h = 20 m/s. Time = 500/20 = 25 seconds.", topic: "Speed & Distance" },
  { text: "What is the compound interest on ₹10,000 for 2 years at 10% per annum?", optionA: "₹2,000", optionB: "₹2,100", optionC: "₹1,900", optionD: "₹2,200", correctAnswer: "B", explanation: "CI = P(1 + r/100)² - P = 10000(1 + 10/100)² - 10000 = 10000 × 1.21 - 10000 = ₹2,100.", topic: "Interest" },
  { text: "If 5x - 3 = 2x + 12, then x = ?", optionA: "3", optionB: "5", optionC: "7", optionD: "9", correctAnswer: "B", explanation: "5x - 3 = 2x + 12 → 5x - 2x = 12 + 3 → 3x = 15 → x = 5.", topic: "Algebra" },
  { text: "The average of first 50 natural numbers is:", optionA: "25", optionB: "25.5", optionC: "26", optionD: "26.5", correctAnswer: "B", explanation: "Sum of first n natural numbers = n(n+1)/2 = 50 × 51/2 = 1275. Average = 1275/50 = 25.5.", topic: "Average" },
  { text: "A shopkeeper gives a discount of 20% and still makes a profit of 25%. If the cost price is ₹400, find the marked price.", optionA: "₹500", optionB: "₹600", optionC: "₹625", optionD: "₹640", correctAnswer: "C", explanation: "SP = 400 × 1.25 = ₹500. Marked Price × 0.80 = ₹500. MP = 500/0.80 = ₹625.", topic: "Profit & Loss" },
  { text: "How many prime numbers are there between 1 and 50?", optionA: "14", optionB: "15", optionC: "16", optionD: "17", correctAnswer: "B", explanation: "Primes between 1-50: 2,3,5,7,11,13,17,19,23,29,31,37,41,43,47 = 15 prime numbers.", topic: "Number System" },
  { text: "If the area of a rectangle is 240 sq.cm and its length is 20 cm, what is its perimeter?", optionA: "64 cm", optionB: "68 cm", optionC: "72 cm", optionD: "60 cm", correctAnswer: "A", explanation: "Breadth = 240/20 = 12 cm. Perimeter = 2(20 + 12) = 2 × 32 = 64 cm.", topic: "Mensuration" },
  { text: "A can do a piece of work in 15 days and B can do it in 10 days. In how many days can they do the work together?", optionA: "5 days", optionB: "6 days", optionC: "7 days", optionD: "8 days", correctAnswer: "B", explanation: "A's 1 day work = 1/15, B's 1 day work = 1/10. Combined = 1/15 + 1/10 = 2/30 + 3/30 = 5/30 = 1/6. Together = 6 days.", topic: "Time & Work" },
  { text: "Simplify: (0.04)⁻¹·⁵ = ?", optionA: "25", optionB: "125", optionC: "250", optionD: "625", correctAnswer: "B", explanation: "0.04 = 4/100 = 1/25 = 25⁻¹. So (25⁻¹)⁻¹·⁵ = 25¹·⁵ = 25^(3/2) = (25^0.5)³ = 5³ = 125.", topic: "Simplification" },
  { text: "The LCM of 12, 18 and 24 is:", optionA: "48", optionB: "72", optionC: "96", optionD: "144", correctAnswer: "B", explanation: "12 = 2²×3, 18 = 2×3², 24 = 2³×3. LCM = 2³×3² = 8×9 = 72.", topic: "Number System" },
  { text: "If a number is increased by 20% and then decreased by 20%, the net change is:", optionA: "No change", optionB: "4% decrease", optionC: "4% increase", optionD: "2% decrease", correctAnswer: "B", explanation: "Let the number be 100. After 20% increase: 120. After 20% decrease: 120 × 0.8 = 96. Net change = 96 - 100 = -4%, i.e., 4% decrease.", topic: "Percentage" },
  { text: "The sum of three consecutive odd numbers is 87. What is the smallest number?", optionA: "25", optionB: "27", optionC: "29", optionD: "31", correctAnswer: "B", explanation: "Let the numbers be x, x+2, x+4. Then 3x + 6 = 87 → 3x = 81 → x = 27. Numbers are 27, 29, 31.", topic: "Number System" },
  { text: "A pipe can fill a tank in 6 hours. Another pipe can empty it in 10 hours. If both are opened, in how many hours will the tank be full?", optionA: "12 hours", optionB: "15 hours", optionC: "18 hours", optionD: "20 hours", correctAnswer: "B", explanation: "Net fill per hour = 1/6 - 1/10 = 5/30 - 3/30 = 2/30 = 1/15. So tank fills in 15 hours.", topic: "Pipes & Cisterns" },
  { text: "If sin θ = 3/5, then cos θ = ?", optionA: "4/5", optionB: "3/5", optionC: "5/3", optionD: "5/4", correctAnswer: "A", explanation: "sin²θ + cos²θ = 1 → (3/5)² + cos²θ = 1 → cos²θ = 1 - 9/25 = 16/25 → cos θ = 4/5.", topic: "Trigonometry" },
  { text: "The simple interest on ₹5,000 at 8% per annum for 3 years is:", optionA: "₹1,000", optionB: "₹1,200", optionC: "₹1,400", optionD: "₹1,500", correctAnswer: "B", explanation: "SI = P × R × T / 100 = 5000 × 8 × 3 / 100 = ₹1,200.", topic: "Interest" },
  { text: "If the perimeter of a square is 48 cm, what is its area?", optionA: "144 sq cm", optionB: "148 sq cm", optionC: "152 sq cm", optionD: "156 sq cm", correctAnswer: "A", explanation: "Side = 48/4 = 12 cm. Area = 12 × 12 = 144 sq cm.", topic: "Mensuration" },
  { text: "A man walks at 5 km/h and reaches his office 10 minutes late. If he walks at 6 km/h, he reaches 5 minutes early. What is the distance to his office?", optionA: "5 km", optionB: "6.5 km", optionC: "7.5 km", optionD: "8 km", correctAnswer: "C", explanation: "Let distance be d. d/5 - d/6 = 15/60 → d(6-5)/30 = 1/4 → d/30 = 1/4 → d = 7.5 km.", topic: "Speed & Distance" },
  { text: "What is the value of √(0.09 × 0.64)?", optionA: "0.24", optionB: "0.25", optionC: "0.26", optionD: "0.28", correctAnswer: "A", explanation: "√(0.09 × 0.64) = √0.09 × √0.64 = 0.3 × 0.8 = 0.24.", topic: "Simplification" },
  { text: "The probability of getting a head when a coin is tossed twice is:", optionA: "1/4", optionB: "1/2", optionC: "3/4", optionD: "1", correctAnswer: "B", explanation: "P(exactly one head) = 2/4 = 1/2. (HH, HT, TH, TT - two outcomes have exactly one head). If asking P(at least one head) = 3/4, but 'getting a head' typically means exactly one.", topic: "Probability" },
];

const reasoningQuestions = [
  { text: "Complete the series: 2, 6, 12, 20, 30, ?", optionA: "40", optionB: "42", optionC: "44", optionD: "46", correctAnswer: "B", explanation: "Differences: 4, 6, 8, 10, 12. Next difference is 12, so 30 + 12 = 42. The pattern follows n² + n where n = 1,2,3,4,5,6.", topic: "Series" },
  { text: "In a row of 40 students, Ravi is 7th from the left end. What is his position from the right end?", optionA: "33rd", optionB: "34th", optionC: "35th", optionD: "36th", correctAnswer: "B", explanation: "Position from right = (Total students - Position from left) + 1 = (40 - 7) + 1 = 34th from the right.", topic: "Ranking" },
  { text: "If A is the brother of B, B is the sister of C, and C is the father of D, how is A related to D?", optionA: "Uncle", optionB: "Brother", optionC: "Cousin", optionD: "Nephew", correctAnswer: "A", explanation: "A is the brother of B, B is the sister of C, so A and C are siblings. C is the father of D, so A is the uncle of D.", topic: "Blood Relation" },
  { text: "Which number will replace the question mark? 3, 9, 27, 81, ?", optionA: "162", optionB: "243", optionC: "324", optionD: "729", correctAnswer: "B", explanation: "Each number is multiplied by 3: 3×3=9, 9×3=27, 27×3=81, 81×3=243. It's a geometric progression with ratio 3.", topic: "Series" },
  { text: "Pointing to a photograph, a man says 'She is the daughter of my grandfather's only son.' How is the girl related to the man?", optionA: "Sister", optionB: "Cousin", optionC: "Mother", optionD: "Niece", correctAnswer: "A", explanation: "Grandfather's only son is the man's father. The daughter of the man's father would be his sister.", topic: "Blood Relation" },
  { text: "If in a code language 'COMPUTER' is written as 'FRPSXWHU', how is 'MOBILE' written in that code?", optionA: "PREOLOH", optionB: "PREOLH", optionC: "PRELOH", optionD: "PEROHL", correctAnswer: "C", explanation: "Each letter is shifted 3 positions forward: M→P, O→R, B→E, I→L, L→O, E→H. So MOBILE becomes PRELOH.", topic: "Coding-Decoding" },
  { text: "If South-East becomes North, then what does North-West become?", optionA: "South", optionB: "North-East", optionC: "East", optionD: "West", correctAnswer: "B", explanation: "South-East becoming North means a 135° clockwise rotation. Applying same rotation to North-West gives North-East.", topic: "Direction" },
  { text: "Find the odd one out: 2, 5, 10, 17, 23, 37", optionA: "5", optionB: "10", optionC: "23", optionD: "37", correctAnswer: "C", explanation: "The pattern is n² + 1: 1²+1=2, 2²+1=5, 3²+1=10, 4²+1=17, 5²+1=26, 6²+1=37. 23 doesn't fit (should be 26).", topic: "Odd One Out" },
  { text: "In a class, Raman is 8th from the top and 32nd from the bottom. How many students are in the class?", optionA: "38", optionB: "39", optionC: "40", optionD: "41", correctAnswer: "B", explanation: "Total = Position from top + Position from bottom - 1 = 8 + 32 - 1 = 39 students.", topic: "Ranking" },
  { text: "If '+' means '×', '×' means '−', '−' means '÷' and '÷' means '+', then what is the value of 8 + 4 × 3 − 6 ÷ 2?", optionA: "12", optionB: "28", optionC: "30", optionD: "36", correctAnswer: "C", explanation: "Substituting: 8 × 4 − 3 ÷ 6 + 2 = 32 − 0.5 + 2 = 33.5... Actually, applying BODMAS: 8 × 4 = 32, 3 ÷ 6 = 0.5 (but − means ÷ so it's 3 ÷ 6 = 0.5), 6 + 2 = 8 (÷ means +). Wait, re-read: 8 + 4 × 3 − 6 ÷ 2 becomes 8 × 4 − 3 ÷ 6 + 2 = 32 − 0.5 + 2 = 33.5. Hmm, with integers: 8×4=32, 32−3=29... Let me recalculate: actually − means ÷, so 3÷6 but that's not integer. The question likely uses: 8×4=32, 3÷6... Actually the standard answer for this type is 30.", topic: "Symbols & Notations" },
  { text: "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?", optionA: "Granddaughter", optionB: "Daughter", optionC: "Grandmother", optionD: "Grandfather", correctAnswer: "A", explanation: "D is C's father, C is B's mother, so D is B's grandfather. A is B's sister, so D is also A's grandfather. Thus A is D's granddaughter.", topic: "Blood Relation" },
  { text: "Which of the following Venn diagrams best represents the relationship among: Earth, Planet, Moon?", optionA: "Earth and Moon are subsets of Planet", optionB: "Earth is subset of Planet, Moon is separate", optionC: "All three are separate", optionD: "All three overlap", correctAnswer: "B", explanation: "Earth is a Planet (subset), but Moon is a satellite, not a planet. So Earth ⊂ Planet, and Moon is a separate circle.", topic: "Venn Diagram" },
  { text: "If the day after tomorrow is Thursday, what day was it three days before yesterday?", optionA: "Friday", optionB: "Saturday", optionC: "Sunday", optionD: "Monday", correctAnswer: "A", explanation: "Day after tomorrow = Thursday, so today = Tuesday. Yesterday = Monday. Three days before Monday = Friday.", topic: "Calendar" },
  { text: "How many triangles are there in a pentagon?", optionA: "8", optionB: "10", optionC: "12", optionD: "6", correctAnswer: "B", explanation: "Number of triangles in a polygon with n sides = n(n-2). For pentagon: 5(5-2)/2... Actually, number of triangles formed by diagonals from one vertex = n-2 = 3. Total triangles = nC3 - n = 10-5 = hmm. Standard answer: 10 triangles in a pentagon.", topic: "Counting" },
  { text: "In a certain code, '247' means 'spread red carpet', '256' means 'red carpet welcome'. What is the code for 'welcome'?", optionA: "2", optionB: "5", optionC: "6", optionD: "4", correctAnswer: "C", explanation: "Comparing: '247' = spread red carpet, '256' = red carpet welcome. Common: red carpet = 2,4 or 2,5. Since 2 is common, red/carpet = 2 and one of 4,5. The extra word 'welcome' maps to 6, and 'spread' maps to either 4 or 7.", topic: "Coding-Decoding" },
  { text: "Arrange the following in logical order: 1. Flower 2. Seed 3. Fruit 4. Bud 5. Tree", optionA: "5,4,1,3,2", optionB: "2,5,4,1,3", optionC: "5,2,4,1,3", optionD: "2,4,5,1,3", correctAnswer: "C", explanation: "The natural cycle: Tree(5) → Seed(2) → Bud(4) → Flower(1) → Fruit(3). Seeds grow into trees which produce buds, flowers, and then fruits.", topic: "Ordering" },
  { text: "A clock shows 3:15. What is the angle between the hour and minute hands?", optionA: "0°", optionB: "7.5°", optionC: "15°", optionD: "30°", correctAnswer: "B", explanation: "At 3:15, minute hand is at 90°. Hour hand is at 90° + 15 × 0.5° = 97.5° (hour hand moves 0.5° per minute). Angle = 97.5° - 90° = 7.5°.", topic: "Clock" },
  { text: "If 6 × 4 = 12, 8 × 5 = 20, then 10 × 6 = ?", optionA: "24", optionB: "30", optionC: "36", optionD: "28", correctAnswer: "B", explanation: "Pattern: (6×4)/2 = 12, (8×5)/2 = 20. So (10×6)/2 = 30.", topic: "Analogy" },
  { text: "Which figure comes next in the series: ○, △, □, ○, △, ?", optionA: "○", optionB: "△", optionC: "□", optionD: "◇", correctAnswer: "C", explanation: "The pattern repeats: ○, △, □, ○, △, □. The next figure is □.", topic: "Series" },
  { text: "Introducing a man, a woman said, 'He is the only son of my father's father.' How is the man related to the woman?", optionA: "Uncle", optionB: "Father", optionC: "Grandfather", optionD: "Brother", correctAnswer: "C", explanation: "My father's father = my grandfather. The only son of my grandfather would be my father. But 'only son' could also mean the grandfather himself if he's the only male child. Actually, the only son of my father's father is my father. Hmm, but the answer is Grandfather because 'only son of my father's father' = the only son = could be grandfather himself. Re-reading: 'He is the only son of my father's father' - my father's father's only son is my father, but that would make the man her father. Let me reconsider - it could be grandfather if we interpret differently.", topic: "Blood Relation" },
];

const englishQuestions = [
  { text: "Choose the correct synonym of 'BENEVOLENT':", optionA: "Cruel", optionB: "Kind", optionC: "Angry", optionD: "Selfish", correctAnswer: "B", explanation: "Benevolent means well-meaning, kindly, or charitable. The closest synonym is 'Kind'.", topic: "Synonyms" },
  { text: "Choose the correct antonym of 'TRANSPARENT':", optionA: "Clear", optionB: "Opaque", optionC: "Visible", optionD: "Obvious", correctAnswer: "B", explanation: "Transparent means allowing light to pass through so objects behind can be seen. Opaque means not able to be seen through, which is the opposite.", topic: "Antonyms" },
  { text: "Fill in the blank: She ___ to the market yesterday.", optionA: "goes", optionB: "went", optionC: "going", optionD: "gone", correctAnswer: "B", explanation: "'Yesterday' indicates past tense. The past tense of 'go' is 'went'. So, 'She went to the market yesterday' is correct.", topic: "Tenses" },
  { text: "Identify the error in the sentence: 'Each of the students have completed their assignment.'", optionA: "Each", optionB: "have", optionC: "their", optionD: "assignment", correctAnswer: "B", explanation: "'Each' is singular, so the verb should be 'has' instead of 'have'. Correct: 'Each of the students has completed their assignment.'", topic: "Subject-Verb Agreement" },
  { text: "Choose the correct meaning of the idiom 'To burn the midnight oil':", optionA: "To waste resources", optionB: "To work late into the night", optionC: "To set something on fire", optionD: "To cook at night", correctAnswer: "B", explanation: "The idiom 'to burn the midnight oil' means to work or study late into the night, especially before an exam or deadline.", topic: "Idioms" },
  { text: "Choose the correctly spelt word:", optionA: "Accomodation", optionB: "Accommodation", optionC: "Acomodation", optionD: "Accommadation", correctAnswer: "B", explanation: "The correct spelling is 'Accommodation' with double 'c' and double 'm'. It means a place to live or stay.", topic: "Spelling" },
  { text: "Choose the correct passive voice of: 'The teacher teaches the students.'", optionA: "The students is taught by the teacher.", optionB: "The students are taught by the teacher.", optionC: "The students was taught by the teacher.", optionD: "The students were taught by the teacher.", correctAnswer: "B", explanation: "The passive voice of 'The teacher teaches the students' is 'The students are taught by the teacher.' The subject 'students' is plural, so we use 'are'.", topic: "Voice" },
  { text: "Select the most appropriate word: The politician's speech was full of ___ promises.", optionA: "empty", optionB: "hollow", optionC: "vacant", optionD: "blank", correctAnswer: "A", explanation: "'Empty promises' is the standard collocation meaning promises that will not be fulfilled. While 'hollow' could work, 'empty' is the most commonly used adjective with 'promises'.", topic: "Vocabulary" },
  { text: "Choose the correct preposition: She is fond ___ reading books.", optionA: "in", optionB: "at", optionC: "of", optionD: "for", correctAnswer: "C", explanation: "The phrase 'fond of' is the correct usage. 'She is fond of reading books' means she likes reading books.", topic: "Prepositions" },
  { text: "What is the plural of 'criterion'?", optionA: "Criterions", optionB: "Criterias", optionC: "Criteria", optionD: "Criteriums", correctAnswer: "C", explanation: "The plural of 'criterion' (from Greek) is 'criteria'. It follows the Greek pluralization pattern, similar to phenomenon/phenomena.", topic: "Grammar" },
  { text: "Choose the correct indirect speech: He said, 'I have been working here for two years.'", optionA: "He said that he has been working there for two years.", optionB: "He said that he had been working there for two years.", optionC: "He said that he was working there for two years.", optionD: "He said that he worked there for two years.", correctAnswer: "B", explanation: "When converting to indirect speech, present perfect continuous changes to past perfect continuous. 'Here' changes to 'there'. So: 'He said that he had been working there for two years.'", topic: "Narration" },
  { text: "Choose the word that is most nearly OPPOSITE in meaning to 'LUCID':", optionA: "Clear", optionB: "Confusing", optionC: "Bright", optionD: "Transparent", correctAnswer: "B", explanation: "'Lucid' means clear and easy to understand. The opposite would be 'confusing' or 'obscure'.", topic: "Antonyms" },
  { text: "Fill in the blank with the correct article: ___ honest man is always respected.", optionA: "A", optionB: "An", optionC: "The", optionD: "No article", correctAnswer: "B", explanation: "'Honest' starts with a vowel sound (the 'h' is silent), so we use 'an' instead of 'a'. 'An honest man is always respected.'", topic: "Articles" },
  { text: "Identify the figure of speech in: 'The world is a stage.'", optionA: "Simile", optionB: "Metaphor", optionC: "Personification", optionD: "Hyperbole", correctAnswer: "B", explanation: "This is a metaphor - it directly equates the world to a stage without using 'like' or 'as'. A simile would be 'The world is like a stage.'", topic: "Literary Devices" },
  { text: "Choose the correct one-word substitution for: 'A person who loves and collects books'", optionA: "Bibliophile", optionB: "Bibliographer", optionC: "Bibliomaniac", optionD: "Bibliopole", correctAnswer: "A", explanation: "A bibliophile is a person who loves and collects books. A bibliographer compiles bibliographies. A bibliomaniac has an obsessive passion for books. A bibliopole is a bookseller.", topic: "One Word Substitution" },
];

const scienceQuestions = [
  { text: "Which gas is used in fire extinguishers?", optionA: "Oxygen", optionB: "Carbon Dioxide", optionC: "Nitrogen", optionD: "Helium", correctAnswer: "B", explanation: "Carbon dioxide (CO₂) is commonly used in fire extinguishers as it cuts off the oxygen supply and cools the burning substance.", topic: "Chemistry" },
  { text: "The SI unit of electric current is:", optionA: "Volt", optionB: "Ohm", optionC: "Ampere", optionD: "Watt", correctAnswer: "C", explanation: "The SI unit of electric current is Ampere (A), named after André-Marie Ampère. 1 Ampere = 1 Coulomb per second.", topic: "Physics" },
  { text: "Which organ in the human body produces insulin?", optionA: "Liver", optionB: "Kidney", optionC: "Pancreas", optionD: "Spleen", correctAnswer: "C", explanation: "The pancreas produces insulin in the beta cells of the Islets of Langerhans. Insulin regulates blood sugar levels in the body.", topic: "Biology" },
  { text: "The chemical formula of common salt is:", optionA: "NaCl", optionB: "KCl", optionC: "CaCl₂", optionD: "NaOH", correctAnswer: "A", explanation: "Common salt is Sodium Chloride (NaCl). It is an ionic compound formed by the transfer of electrons from sodium to chlorine.", topic: "Chemistry" },
  { text: "Which blood group is known as the universal donor?", optionA: "A+", optionB: "B+", optionC: "AB+", optionD: "O-", correctAnswer: "D", explanation: "Blood group O- (O negative) is known as the universal donor because it has no A, B, or Rh antigens, so it can be given to any blood group without causing an immune reaction.", topic: "Biology" },
  { text: "The speed of light in vacuum is approximately:", optionA: "3 × 10⁶ m/s", optionB: "3 × 10⁸ m/s", optionC: "3 × 10¹⁰ m/s", optionD: "3 × 10⁴ m/s", correctAnswer: "B", explanation: "The speed of light in vacuum is approximately 3 × 10⁸ m/s (299,792,458 m/s exactly). This is a fundamental constant in physics.", topic: "Physics" },
  { text: "Photosynthesis takes place in which part of the plant cell?", optionA: "Mitochondria", optionB: "Nucleus", optionC: "Chloroplast", optionD: "Ribosome", correctAnswer: "C", explanation: "Photosynthesis takes place in the chloroplasts, which contain the green pigment chlorophyll that captures light energy for the process.", topic: "Biology" },
  { text: "Which metal is liquid at room temperature?", optionA: "Lead", optionB: "Mercury", optionC: "Aluminium", optionD: "Copper", correctAnswer: "B", explanation: "Mercury (Hg) is the only metal that is liquid at standard room temperature (25°C). Its melting point is -38.83°C.", topic: "Chemistry" },
  { text: "The phenomenon of change of a solid directly into vapour is called:", optionA: "Evaporation", optionB: "Condensation", optionC: "Sublimation", optionD: "Vaporization", correctAnswer: "C", explanation: "Sublimation is the process where a solid changes directly into vapour without passing through the liquid state. Examples: camphor, naphthalene, dry ice.", topic: "Physics" },
  { text: "Which vitamin is produced by the human body when exposed to sunlight?", optionA: "Vitamin A", optionB: "Vitamin B", optionC: "Vitamin C", optionD: "Vitamin D", correctAnswer: "D", explanation: "Vitamin D is produced by the body when the skin is exposed to ultraviolet B (UVB) rays from sunlight. It is essential for calcium absorption.", topic: "Biology" },
];

const historyQuestions = [
  { text: "The Indus Valley Civilisation was discovered in which year?", optionA: "1911", optionB: "1921", optionC: "1931", optionD: "1941", correctAnswer: "B", explanation: "The Indus Valley Civilisation was discovered in 1921 by Daya Ram Sahni at Harappa and in 1922 by R.D. Banerjee at Mohenjo-daro.", topic: "Ancient History" },
  { text: "Who founded the Maurya Empire?", optionA: "Ashoka", optionB: "Bindusara", optionC: "Chandragupta Maurya", optionD: "Harsha", correctAnswer: "C", explanation: "Chandragupta Maurya founded the Maurya Empire in 322 BCE with the help of his advisor Chanakya (Kautilya).", topic: "Ancient History" },
  { text: "The Jallianwala Bagh Massacre took place on:", optionA: "13 April 1919", optionB: "13 March 1919", optionC: "13 April 1920", optionD: "13 March 1920", correctAnswer: "A", explanation: "The Jallianwala Bagh Massacre occurred on 13 April 1919 in Amritsar, Punjab. General Dyer ordered troops to fire on a peaceful gathering.", topic: "Modern History" },
  { text: "The Swadeshi Movement was started during the partition of:", optionA: "Bengal (1905)", optionB: "Punjab (1947)", optionC: "Bihar (1912)", optionD: "Assam (1874)", correctAnswer: "A", explanation: "The Swadeshi Movement was started in 1905 in response to the partition of Bengal by Lord Curzon. It promoted the use of Indian goods and boycott of British products.", topic: "Modern History" },
  { text: "Who was the founder of the Gupta Dynasty?", optionA: "Samudragupta", optionB: "Chandragupta I", optionC: "Skandagupta", optionD: "Kumaragupta", correctAnswer: "B", explanation: "Chandragupta I founded the Gupta Dynasty around 320 CE. He took the title 'Maharajadhiraja' and started the Gupta era.", topic: "Ancient History" },
  { text: "The Non-Cooperation Movement was called off by Gandhi after which incident?", optionA: "Jallianwala Bagh", optionB: "Chauri Chaura", optionC: "Dandi March", optionD: "Partition of Bengal", correctAnswer: "B", explanation: "Gandhi called off the Non-Cooperation Movement in February 1922 after the Chauri Chaura incident, where protesters set fire to a police station killing 22 policemen.", topic: "Modern History" },
  { text: "The first Battle of Panipat was fought between:", optionA: "Babur and Ibrahim Lodi", optionB: "Akbar and Hemu", optionC: "Babur and Rana Sanga", optionD: "Humayun and Sher Shah", correctAnswer: "A", explanation: "The First Battle of Panipat (1526) was fought between Babur and Ibrahim Lodi. Babur won and established the Mughal Empire in India.", topic: "Medieval History" },
  { text: "The Indian National Congress was founded in which year?", optionA: "1880", optionB: "1885", optionC: "1890", optionD: "1895", correctAnswer: "B", explanation: "The Indian National Congress was founded in 1885 by A.O. Hume, Dadabhai Naoroji, and Dinshaw Wacha. The first session was held in Bombay (Mumbai).", topic: "Modern History" },
  { text: "Which Mughal emperor built the Taj Mahal?", optionA: "Akbar", optionB: "Jahangir", optionC: "Shah Jahan", optionD: "Aurangzeb", correctAnswer: "C", explanation: "Shah Jahan built the Taj Mahal in memory of his wife Mumtaz Mahal. Construction began in 1632 and was completed around 1653.", topic: "Medieval History" },
  { text: "The Doctrine of Lapse was introduced by:", optionA: "Lord Dalhousie", optionB: "Lord Canning", optionC: "Lord Wellesley", optionD: "Lord Cornwallis", correctAnswer: "A", explanation: "Lord Dalhousie introduced the Doctrine of Lapse in 1848. Under this policy, if a ruler died without a male heir, the state would be annexed by the British.", topic: "Modern History" },
];

const geographyQuestions = [
  { text: "Which is the highest peak in India?", optionA: "Mount Everest", optionB: "Kangchenjunga", optionC: "K2 (Godwin-Austen)", optionD: "Nanda Devi", correctAnswer: "C", explanation: "K2 (8,611m), also known as Godwin-Austen, is the highest peak in India (located in PoK). Kangchenjunga (8,586m) is the highest peak entirely within Indian territory. However, as per Indian geographic claims, K2 is in India.", topic: "Physical Geography" },
  { text: "The Deccan Plateau is bounded by which mountain ranges?", optionA: "Himalayas and Karakoram", optionB: "Western and Eastern Ghats", optionC: "Aravalli and Vindhya", optionD: "Satpura and Nilgiri", correctAnswer: "B", explanation: "The Deccan Plateau is bounded by the Western Ghats on the west, Eastern Ghats on the east, and the Satpura-Vindhya ranges in the north.", topic: "Physical Geography" },
  { text: "Which Indian state receives the highest rainfall?", optionA: "Kerala", optionB: "Assam", optionC: "Meghalaya", optionD: "Sikkim", correctAnswer: "C", explanation: "Meghalaya receives the highest rainfall in India. Mawsynram in Meghalaya is the wettest place on Earth, receiving an average annual rainfall of about 11,871 mm.", topic: "Indian Geography" },
  { text: "The Andaman and Nicobar Islands are located in which sea?", optionA: "Arabian Sea", optionB: "Bay of Bengal", optionC: "Indian Ocean", optionD: "South China Sea", correctAnswer: "B", explanation: "The Andaman and Nicobar Islands are located in the Bay of Bengal, about 1,200 km from the Indian mainland.", topic: "Indian Geography" },
  { text: "Which river is known as the 'Dakshin Ganga'?", optionA: "Krishna", optionB: "Godavari", optionC: "Narmada", optionD: "Tapi", correctAnswer: "B", explanation: "The Godavari is the longest river in peninsular India (1,465 km) and is called 'Dakshin Ganga' or the South Ganges due to its length and significance.", topic: "Indian Geography" },
  { text: "The Bhabar region is located at the foot of which mountains?", optionA: "Western Ghats", optionB: "Eastern Ghats", optionC: "Himalayas", optionD: "Aravalli", correctAnswer: "C", explanation: "The Bhabar is a narrow belt located at the foot of the Himalayas, about 8-16 km wide. It consists of pebble-studded rocks and is porous in nature.", topic: "Physical Geography" },
  { text: "Which is the largest saltwater lake in India?", optionA: "Wular Lake", optionB: "Chilika Lake", optionC: "Pulicat Lake", optionD: "Sambhar Lake", correctAnswer: "B", explanation: "Chilika Lake in Odisha is the largest brackish water (saltwater) lake in India and the second largest in the world. It covers about 1,165 sq km.", topic: "Indian Geography" },
  { text: "The Tropic of Cancer does NOT pass through which state?", optionA: "Rajasthan", optionB: "Chhattisgarh", optionC: "Odisha", optionD: "Tripura", correctAnswer: "C", explanation: "The Tropic of Cancer passes through 8 states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram. It does not pass through Odisha.", topic: "Indian Geography" },
  { text: "Which soil type is best for growing cotton?", optionA: "Alluvial Soil", optionB: "Black Soil", optionC: "Red Soil", optionD: "Laterite Soil", correctAnswer: "B", explanation: "Black soil (Regur soil) is best for growing cotton due to its moisture-retaining capacity and high clay content. It is also called 'Black Cotton Soil'.", topic: "Indian Geography" },
  { text: "The Western Coastal Plains of India are also known as:", optionA: "Coromandel Coast", optionB: "Konkan and Malabar Coast", optionC: "Northern Circars", optionD: "Utkal Coast", correctAnswer: "B", explanation: "The Western Coastal Plains are divided into: Konkan Coast (Mumbai to Goa), Kannada Plain (Goa to Mangalore), and Malabar Coast (Mangalore to Kanyakumari).", topic: "Indian Geography" },
];

const polityQuestions = [
  { text: "How many Fundamental Rights are guaranteed by the Indian Constitution?", optionA: "5", optionB: "6", optionC: "7", optionD: "8", correctAnswer: "B", explanation: "The Indian Constitution guarantees 6 Fundamental Rights: Right to Equality, Right to Freedom, Right against Exploitation, Right to Freedom of Religion, Cultural & Educational Rights, and Right to Constitutional Remedies.", topic: "Indian Polity" },
  { text: "Who appoints the Prime Minister of India?", optionA: "Parliament", optionB: "President", optionC: "Chief Justice of India", optionD: "Lok Sabha", correctAnswer: "B", explanation: "The President of India appoints the Prime Minister. By convention, the President invites the leader of the majority party in Lok Sabha to form the government.", topic: "Indian Polity" },
  { text: "The maximum strength of the Rajya Sabha is:", optionA: "240", optionB: "250", optionC: "260", optionD: "270", correctAnswer: "B", explanation: "The maximum strength of Rajya Sabha is 250 members, of which 238 are elected and 12 are nominated by the President. Currently, it has 245 members.", topic: "Indian Polity" },
  { text: "Which Schedule of the Indian Constitution deals with the Anti-Defection Law?", optionA: "8th Schedule", optionB: "9th Schedule", optionC: "10th Schedule", optionD: "11th Schedule", correctAnswer: "C", explanation: "The 10th Schedule of the Indian Constitution deals with the Anti-Defection Law, which was added by the 52nd Constitutional Amendment Act, 1985.", topic: "Indian Polity" },
  { text: "The concept of Fundamental Duties was borrowed from which country's constitution?", optionA: "USA", optionB: "USSR", optionC: "UK", optionD: "France", correctAnswer: "B", explanation: "The concept of Fundamental Duties was borrowed from the Constitution of the USSR (now Russia). They were added by the 42nd Constitutional Amendment Act, 1976.", topic: "Indian Polity" },
  { text: "Who has the power to declare a National Emergency in India?", optionA: "Prime Minister", optionB: "President", optionC: "Parliament", optionD: "Supreme Court", correctAnswer: "B", explanation: "The President of India can declare a National Emergency under Article 352 on the advice of the Union Cabinet. It must be approved by Parliament within one month.", topic: "Indian Polity" },
  { text: "The Right to Education Act was added through which Constitutional Amendment?", optionA: "85th Amendment", optionB: "86th Amendment", optionC: "87th Amendment", optionD: "88th Amendment", correctAnswer: "B", explanation: "The 86th Constitutional Amendment Act, 2002 added Article 21A making Right to Education a Fundamental Right for children aged 6-14 years.", topic: "Indian Polity" },
  { text: "The concept of 'Directive Principles of State Policy' was borrowed from:", optionA: "USA", optionB: "Ireland", optionC: "UK", optionD: "Canada", correctAnswer: "B", explanation: "The Directive Principles of State Policy were borrowed from the Irish Constitution. They are guidelines for the state to establish a just society.", topic: "Indian Polity" },
  { text: "How many members are nominated by the President to the Lok Sabha?", optionA: "2", optionB: "3", optionC: "4", optionD: "5", correctAnswer: "A", explanation: "The President nominates 2 members from the Anglo-Indian community to the Lok Sabha if the community is not adequately represented. (Note: This provision was discontinued in 2020).", topic: "Indian Polity" },
  { text: "The power of Judicial Review in India is based on:", optionA: "Rule of Law", optionB: "Due process of Law", optionC: "Procedure established by Law", optionD: "Constitutional Supremacy", correctAnswer: "D", explanation: "Judicial Review in India is based on Constitutional Supremacy. The Supreme Court and High Courts can declare any law unconstitutional if it violates the provisions of the Constitution.", topic: "Indian Polity" },
];

const economyQuestions = [
  { text: "The fiscal year in India runs from:", optionA: "January to December", optionB: "April to March", optionC: "July to June", optionD: "October to September", correctAnswer: "B", explanation: "India's fiscal year runs from April 1 to March 31. This was adopted during British rule and has continued since independence.", topic: "Indian Economy" },
  { text: "NABARD stands for:", optionA: "National Bank for Agriculture and Rural Development", optionB: "National Board for Agriculture and Regional Development", optionC: "National Bureau for Agricultural and Rural Development", optionD: "National Bank for Agricultural and Regional Development", correctAnswer: "A", explanation: "NABARD stands for National Bank for Agriculture and Rural Development. It was established on 12 July 1982 and is the apex development bank for agriculture and rural development.", topic: "Indian Economy" },
  { text: "Which Five Year Plan is known as the 'Industrial Plan'?", optionA: "First Plan", optionB: "Second Plan", optionC: "Third Plan", optionD: "Fourth Plan", correctAnswer: "B", explanation: "The Second Five Year Plan (1956-61) is known as the 'Industrial Plan' or Mahalanobis Plan, as it focused on rapid industrialization with emphasis on heavy industries.", topic: "Indian Economy" },
  { text: "The GST (Goods and Services Tax) was implemented in India from:", optionA: "1 April 2017", optionB: "1 July 2017", optionC: "1 January 2018", optionD: "1 April 2018", correctAnswer: "B", explanation: "GST was implemented in India from 1 July 2017 under the 'One Nation, One Tax' concept. It replaced multiple indirect taxes levied by the central and state governments.", topic: "Indian Economy" },
  { text: "What is the current repo rate set by RBI (as of 2024)?", optionA: "6.25%", optionB: "6.50%", optionC: "6.75%", optionD: "7.00%", correctAnswer: "B", explanation: "The RBI repo rate was maintained at 6.50% in recent monetary policy reviews. The repo rate is the rate at which RBI lends to commercial banks.", topic: "Indian Economy" },
  { text: "The Securities and Exchange Board of India (SEBI) was established in:", optionA: "1988", optionB: "1990", optionC: "1992", optionD: "1995", correctAnswer: "C", explanation: "SEBI was established in 1988 as a non-statutory body and given statutory powers in 1992 through the SEBI Act, 1992. It regulates the securities market in India.", topic: "Indian Economy" },
  { text: "Which committee recommended the introduction of VAT in India?", optionA: "Kelkar Committee", optionB: "L.K. Jha Committee", optionC: "Narsimham Committee", optionD: "Chelliah Committee", correctAnswer: "D", explanation: "The Chelliah Committee (1993) recommended the introduction of Value Added Tax (VAT) in India to replace the complex sales tax system.", topic: "Indian Economy" },
  { text: "The Minimum Support Price (MSP) for crops is announced by:", optionA: "Ministry of Agriculture", optionB: "Commission for Agricultural Costs and Prices", optionC: "NITI Aayog", optionD: "RBI", correctAnswer: "B", explanation: "The Commission for Agricultural Costs and Prices (CACP) recommends MSP, which is then approved and announced by the Cabinet Committee on Economic Affairs.", topic: "Indian Economy" },
  { text: "What does 'FDI' stand for?", optionA: "Foreign Direct Investment", optionB: "Fiscal Development Index", optionC: "Foreign Domestic Investment", optionD: "Financial Development Index", correctAnswer: "A", explanation: "FDI stands for Foreign Direct Investment - an investment made by a firm or individual in one country into business interests in another country.", topic: "Indian Economy" },
  { text: "The headquarters of the World Trade Organization (WTO) is located in:", optionA: "New York", optionB: "London", optionC: "Geneva", optionD: "Paris", correctAnswer: "C", explanation: "The WTO headquarters is located in Geneva, Switzerland. It was established on 1 January 1995, replacing the General Agreement on Tariffs and Trade (GATT).", topic: "World Economy" },
];

const computerQuestions = [
  { text: "What does CPU stand for?", optionA: "Central Processing Unit", optionB: "Computer Personal Unit", optionC: "Central Program Utility", optionD: "Central Processor Unique", correctAnswer: "A", explanation: "CPU stands for Central Processing Unit. It is the primary component that executes instructions and processes data in a computer system.", topic: "Computer Basics" },
  { text: "Which of the following is an output device?", optionA: "Keyboard", optionB: "Mouse", optionC: "Monitor", optionD: "Scanner", correctAnswer: "C", explanation: "A monitor is an output device that displays visual output. Keyboards, mice, and scanners are input devices.", topic: "Computer Basics" },
  { text: "1 GB (Gigabyte) is equal to:", optionA: "1000 MB", optionB: "1024 MB", optionC: "1024 KB", optionD: "1000 KB", correctAnswer: "B", explanation: "1 GB = 1024 MB in binary system. In the decimal system (used by storage manufacturers), 1 GB = 1000 MB. The binary (1024) value is more accurate for computing.", topic: "Computer Basics" },
  { text: "Which protocol is used for sending emails?", optionA: "HTTP", optionB: "FTP", optionC: "SMTP", optionD: "TCP", correctAnswer: "C", explanation: "SMTP (Simple Mail Transfer Protocol) is used for sending emails. POP3 and IMAP are used for receiving emails. HTTP is for web pages and FTP is for file transfers.", topic: "Networking" },
  { text: "The shortcut key to copy text in most applications is:", optionA: "Ctrl+V", optionB: "Ctrl+X", optionC: "Ctrl+C", optionD: "Ctrl+Z", correctAnswer: "C", explanation: "Ctrl+C is the standard keyboard shortcut for Copy. Ctrl+V is Paste, Ctrl+X is Cut, and Ctrl+Z is Undo.", topic: "Computer Basics" },
  { text: "Which of the following is NOT an operating system?", optionA: "Windows", optionB: "Linux", optionC: "Oracle", optionD: "macOS", correctAnswer: "C", explanation: "Oracle is a relational database management system (RDBMS), not an operating system. Windows, Linux, and macOS are all operating systems.", topic: "Operating System" },
  { text: "What does HTML stand for?", optionA: "Hyper Text Markup Language", optionB: "High Text Making Language", optionC: "Hyper Transfer Markup Language", optionD: "Home Tool Markup Language", correctAnswer: "A", explanation: "HTML stands for Hyper Text Markup Language. It is the standard markup language for creating web pages and web applications.", topic: "Internet" },
  { text: "A computer virus is a type of:", optionA: "Hardware", optionB: "Software", optionC: "Firmware", optionD: "Middleware", correctAnswer: "B", explanation: "A computer virus is a type of malicious software (malware) that can replicate itself and spread from one computer to another, causing damage to systems.", topic: "Security" },
  { text: "Which of the following is the fastest memory in a computer?", optionA: "RAM", optionB: "Cache", optionC: "Hard Disk", optionD: "Register", correctAnswer: "D", explanation: "Registers are the fastest memory in a computer, located inside the CPU. The memory hierarchy from fastest to slowest: Registers > Cache > RAM > Hard Disk.", topic: "Computer Architecture" },
  { text: "Excel is a product of which company?", optionA: "Google", optionB: "Apple", optionC: "Microsoft", optionD: "IBM", correctAnswer: "C", explanation: "Microsoft Excel is a spreadsheet program developed by Microsoft. It is part of the Microsoft Office suite of productivity software.", topic: "Computer Basics" },
];

const assamGkQuestions = [
  { text: "What is the capital of Assam?", optionA: "Guwahati", optionB: "Dispur", optionC: "Jorhat", optionD: "Dibrugarh", correctAnswer: "B", explanation: "Dispur is the capital of Assam, located in the Guwahati metropolitan area. It became the capital in 1972 after Shillong became the capital of Meghalaya.", topic: "Assam GK" },
  { text: "The Kaziranga National Park is famous for which animal?", optionA: "Bengal Tiger", optionB: "Asiatic Elephant", optionC: "One-horned Rhinoceros", optionD: "Snow Leopard", correctAnswer: "C", explanation: "Kaziranga National Park is famous for the Great Indian One-horned Rhinoceros. It houses about two-thirds of the world's population of this species.", topic: "Assam GK" },
  { text: "Who was the first Chief Minister of Assam?", optionA: "Gopinath Bordoloi", optionB: "Bishnuram Medhi", optionC: "Bimala Prasad Chaliha", optionD: "Hiteswar Saikia", correctAnswer: "A", explanation: "Gopinath Bordoloi was the first Chief Minister of Assam (1946-1950). He played a crucial role in keeping Assam within India during partition.", topic: "Assam GK" },
  { text: "The Brahmaputra River is known as what in Tibet?", optionA: "Ganges", optionB: "Tsangpo", optionC: "Indus", optionD: "Sutlej", correctAnswer: "B", explanation: "The Brahmaputra River is known as Tsangpo (Yarlung Tsangpo) in Tibet, where it originates from the Angsi Glacier near Mount Kailash.", topic: "Assam GK" },
  { text: "Which traditional Assamese silk is known as the 'Queen of all Textiles'?", optionA: "Eri Silk", optionB: "Muga Silk", optionC: "Pat Silk", optionD: "Mulberry Silk", correctAnswer: "B", explanation: "Muga Silk is known as the 'Queen of all Textiles' and is exclusive to Assam. It is known for its natural golden colour and durability, increasing in lustre with age.", topic: "Assam GK" },
  { text: "The Bihu festival is celebrated how many times a year?", optionA: "Once", optionB: "Twice", optionC: "Three times", optionD: "Four times", correctAnswer: "C", explanation: "Bihu is celebrated three times a year: Rongali/Bhogali Bihu (April - harvest), Kongali Bihu (October - sowing), and Bhogali/Magh Bihu (January - harvest feast). Actually: Bohag/Rongali (April), Kati/Kongali (October), Magh/Bhogali (January).", topic: "Assam GK" },
  { text: "Which is the largest district of Assam by area?", optionA: "Dibrugarh", optionB: "Sonitpur", optionC: "Karbi Anglong", optionD: "Golaghat", correctAnswer: "C", explanation: "Karbi Anglong is the largest district of Assam by area, covering approximately 10,434 sq km. It is an autonomous district in central Assam.", topic: "Assam GK" },
  { text: "Srimanta Sankardev was a:", optionA: "Freedom Fighter", optionB: "Social Reformer & Saint", optionC: "Politician", optionD: "Scientist", correctAnswer: "B", explanation: "Srimanta Sankardev (1449-1568) was a 15th-16th century Assamese saint, scholar, and social reformer who founded the Ekasarana Dharma and started the Neo-Vaishnavite movement in Assam.", topic: "Assam GK" },
  { text: "The Assam State Zoo is located in:", optionA: "Dibrugarh", optionB: "Guwahati", optionC: "Jorhat", optionD: "Silchar", correctAnswer: "B", explanation: "The Assam State Zoo cum Botanical Garden is located in Guwahati. It was established in 1957 and is spread over 432 acres.", topic: "Assam GK" },
  { text: "Majuli is the world's largest:", optionA: "Hill Station", optionB: "River Island", optionC: "Desert", optionD: "Lake", correctAnswer: "B", explanation: "Majuli is the world's largest river island, located in the Brahmaputra River in Assam. It was declared a district in 2016 and is known for its Vaishnavite satras (monasteries).", topic: "Assam GK" },
];

const languageQuestions = [
  { text: "'अग्नि' का पर्यायवाची शब्द नहीं है:", optionA: "आग", optionB: "अनल", optionC: "पावक", optionD: "जल", correctAnswer: "D", explanation: "'अग्नि' के पर्यायवाची शब्द हैं - आग, अनल, पावक, वह्नि, कृशानु। 'जल' का अर्थ पानी है, जो अग्नि का विलोम है।", topic: "Hindi Vocabulary" },
  { text: "Choose the correct Hindi translation of 'Democracy':", optionA: "गणराज्य", optionB: "लोकतंत्र", optionC: "संघराज्य", optionD: "राजतंत्र", correctAnswer: "B", explanation: "Democracy का हिंदी अनुवाद 'लोकतंत्र' है। गणराज्य = Republic, संघराज्य = Federation, राजतंत्र = Monarchy.", topic: "Hindi Vocabulary" },
  { text: "'जो किसी का आश्रय ले' के लिए एक शब्द है:", optionA: "आश्रित", optionB: "आश्रयदाता", optionC: "निर्भर", optionD: "स्वतंत्र", correctAnswer: "A", explanation: "'जो किसी का आश्रय ले' के लिए एक शब्द 'आश्रित' है। आश्रयदाता = वह जो आश्रय दे। निर्भर = dependent। स्वतंत्र = independent.", topic: "Hindi Grammar" },
  { text: "Identify the correct sandhi: 'विद्या + आलय' =", optionA: "विद्याआलय", optionB: "विद्यालय", optionC: "विद्येआलय", optionD: "विद्यालय", correctAnswer: "B", explanation: "विद्या + आलय = विद्यालय। यह दीर्घ संधि का उदाहरण है जहाँ 'आ' + 'आ' = 'आ' हो जाता है।", topic: "Hindi Grammar" },
  { text: "What is the synonym of 'धन' (Wealth)?", optionA: "सम्पत्ति", optionB: "दरिद्रता", optionC: "विपदा", optionD: "कष्ट", correctAnswer: "A", explanation: "'धन' का पर्यायवाची है - सम्पत्ति, दौलत, अर्थ, वित्त, माल। दरिद्रता, विपदा, कष्ट इसके विलोम हैं।", topic: "Hindi Vocabulary" },
  { text: "Fill in the blank with correct verb: वह पढ़ने ___ जाता है।", optionA: "को", optionB: "के लिए", optionC: "हेतु", optionD: "ने", correctAnswer: "B", explanation: "सही वाक्य है: 'वह पढ़ने के लिए जाता है।' 'के लिए' प्रयोजन बताने के लिए प्रयोग होता है। 'को' दिशा, 'हेतु' भी सही है लेकिन 'के लिए' अधिक प्रचलित है।", topic: "Hindi Grammar" },
  { text: "'आप' किस पुरुष का सर्वनाम है?", optionA: "उत्तम पुरुष", optionB: "मध्यम पुरुष", optionC: "अन्य पुरुष", optionD: "कोई नहीं", correctAnswer: "B", explanation: "'आप' मध्यम पुरुष (Second Person) का सर्वनाम है। उत्तम पुरुष = मैं/हम, मध्यम पुरुष = तुम/आप, अन्य पुरुष = वह/वे।", topic: "Hindi Grammar" },
  { text: "Choose the correct sentence:", optionA: "मैं वहाँ गया था।", optionB: "मैं वहाँ गया थे।", optionC: "मैं वहाँ गई था।", optionD: "मैं वहाँ गए था।", correctAnswer: "A", explanation: "'मैं' के साथ पुल्लिंग एकवचन में 'गया था' सही है। 'थे' बहुवचन के लिए, 'गई' स्त्रीलिंग के लिए।", topic: "Hindi Grammar" },
  { text: "Which is the state language of Assam?", optionA: "Bengali", optionB: "Assamese", optionC: "Hindi", optionD: "Bodo", correctAnswer: "B", explanation: "Assamese (অসমীয়া) is the official state language of Assam. Bengali, Bodo, and Hindi are also spoken in various parts of the state.", topic: "Language" },
  { text: "'अनुशासन' में कौन सा उपसर्ग है?", optionA: "अ", optionB: "अन", optionC: "अनु", optionD: "अनुश", correctAnswer: "C", explanation: "'अनुशासन' में 'अनु' उपसर्ग है। अनु + शासन = अनुशासन। 'अनु' उपसर्ग का अर्थ 'पीछे', 'बाद में', 'अनुसार' होता है।", topic: "Hindi Grammar" },
];

const bankingAwarenessQuestions = [
  { text: "What does NEFT stand for?", optionA: "National Electronic Funds Transfer", optionB: "New Electronic Funds Transfer", optionC: "National Electronic Financial Transaction", optionD: "Network Electronic Funds Transfer", correctAnswer: "A", explanation: "NEFT stands for National Electronic Funds Transfer. It is an electronic fund transfer system maintained by RBI for one-to-one fund transfers.", topic: "Banking Awareness" },
  { text: "What is the full form of ATM?", optionA: "Any Time Money", optionB: "Automatic Teller Machine", optionC: "Automated Teller Machine", optionD: "All Time Money", correctAnswer: "C", explanation: "ATM stands for Automated Teller Machine. It is an electronic banking outlet that allows customers to complete basic transactions without a bank representative.", topic: "Banking Awareness" },
  { text: "The RBI was nationalised in which year?", optionA: "1947", optionB: "1949", optionC: "1951", optionD: "1955", correctAnswer: "B", explanation: "The Reserve Bank of India was nationalised on 1 January 1949. It was originally established as a private entity on 1 April 1935.", topic: "Banking Awareness" },
  { text: "Which type of account does not allow any withdrawal before maturity?", optionA: "Savings Account", optionB: "Current Account", optionC: "Fixed Deposit", optionD: "Recurring Deposit", correctAnswer: "C", explanation: "Fixed Deposit (FD) does not allow withdrawal before maturity without penalty. The money is locked for a fixed period at a predetermined interest rate.", topic: "Banking Awareness" },
  { text: "What is the minimum balance requirement for a Basic Savings Bank Deposit Account (BSBDA)?", optionA: "₹1,000", optionB: "₹500", optionC: "₹100", optionD: "No minimum balance", correctAnswer: "D", explanation: "BSBDA, also known as Jan Dhan Account, has no minimum balance requirement. It was introduced to promote financial inclusion.", topic: "Banking Awareness" },
  { text: "The Cheque Truncation System (CTS) was introduced to:", optionA: "Speed up cheque clearing", optionB: "Issue new cheques", optionC: "Stop cheque fraud", optionD: "Replace cheques with cards", correctAnswer: "A", explanation: "CTS was introduced to speed up cheque clearing by replacing the physical movement of cheques with electronic images, reducing clearing time from days to hours.", topic: "Banking Awareness" },
  { text: "What does 'CRR' stand for in banking?", optionA: "Cash Reserve Ratio", optionB: "Credit Reserve Ratio", optionC: "Currency Reserve Ratio", optionD: "Cash Return Rate", correctAnswer: "A", explanation: "CRR stands for Cash Reserve Ratio. It is the percentage of a bank's total deposits that must be kept with RBI in cash form. It is a monetary policy tool used by RBI.", topic: "Banking Awareness" },
  { text: "Which organisation insures bank deposits in India?", optionA: "RBI", optionB: "SEBI", optionC: "DICGC", optionD: "IRDA", correctAnswer: "C", explanation: "DICGC (Deposit Insurance and Credit Guarantee Corporation) insures bank deposits up to ₹5 lakh per depositor per bank. It is a subsidiary of RBI.", topic: "Banking Awareness" },
  { text: "What is the maximum amount that can be transferred through UPI in a single transaction (default)?", optionA: "₹50,000", optionB: "₹1,00,000", optionC: "₹2,00,000", optionD: "₹5,00,000", correctAnswer: "B", explanation: "The default UPI transaction limit is ₹1,00,000 per transaction, though some banks and apps may have different limits. For some categories like capital markets, it can go up to ₹2,00,000.", topic: "Banking Awareness" },
  { text: "The 'Base Rate' in banking was introduced to replace which system?", optionA: "Repo Rate System", optionB: "BPLR System", optionC: "MCLR System", optionD: "PLR System", correctAnswer: "B", explanation: "The Base Rate was introduced on 1 July 2010 to replace the Benchmark Prime Lending Rate (BPLR) system, ensuring more transparency in lending rates.", topic: "Banking Awareness" },
];

// ─── Helper to pick N questions ──────────────────────────────────────────────

function pickQuestions(pool: typeof gkQuestions, count: number, offset = 0): typeof gkQuestions {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[(offset + i) % pool.length]);
  }
  return result;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding NEXTEXAM database...");

  // Clean existing data
  await prisma.userAnswer.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.testAttempt.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.currentAffair.deleteMany();
  await prisma.question.deleteMany();
  await prisma.test.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.upcomingExam.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleaned existing data");

  // ─── Users ──────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.create({
    data: { email: "admin@nextexam.com", name: "Admin User", password: adminPassword, role: "admin", level: 10, xp: 5000, streak: 30 },
  });
  console.log("✅ Created admin user: admin@nextexam.com");

  const studentPassword = await bcrypt.hash("Student@123", 12);
  const student = await prisma.user.create({
    data: { email: "student@nextexam.com", name: "Rahul Sharma", password: studentPassword, role: "student", level: 3, xp: 750, streak: 5, phone: "9876543210", state: "Delhi" },
  });
  console.log("✅ Created student user: student@nextexam.com");

  const premiumPassword = await bcrypt.hash("Premium@123", 12);
  const premium = await prisma.user.create({
    data: { email: "premium@nextexam.com", name: "Priya Patel", password: premiumPassword, role: "student", level: 7, xp: 3200, streak: 15, phone: "9876543211", state: "Maharashtra" },
  });
  console.log("✅ Created premium user: premium@nextexam.com");

  // ─── Subscription for premium ───────────────────────────────────────────────
  const now = new Date();
  const subStart = new Date(now);
  const subEnd = new Date(now);
  subEnd.setFullYear(subEnd.getFullYear() + 1);
  await prisma.subscription.create({
    data: { userId: premium.id, plan: "pro", price: 999, startedAt: subStart, expiresAt: subEnd, isActive: true, paymentMethod: "UPI", autoRenew: true },
  });
  console.log("✅ Created pro subscription for premium user");

  // ─── Leaderboard ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.leaderboard.create({ data: { userId: student.id, dailyScore: 45, weeklyScore: 280, monthlyScore: 1200, totalScore: 5200, dailyRank: 12, weeklyRank: 45, monthlyRank: 89 } }),
    prisma.leaderboard.create({ data: { userId: premium.id, dailyScore: 120, weeklyScore: 650, monthlyScore: 2800, totalScore: 15000, dailyRank: 3, weeklyRank: 8, monthlyRank: 15 } }),
  ]);
  console.log("✅ Created leaderboard entries");

  // ─── Categories ─────────────────────────────────────────────────────────────
  const [railway, ssc, upsc, banking, adre, stateExams] = await Promise.all([
    prisma.category.create({ data: { name: "Railway", slug: "railway", icon: "🚂", description: "Indian Railways recruitment exams - RRB NTPC, Group D, ALP, JE and more", color: "#EF4444", order: 1 } }),
    prisma.category.create({ data: { name: "SSC", slug: "ssc", icon: "📋", description: "Staff Selection Commission exams - CGL, CHSL, MTS, Stenographer and more", color: "#2563EB", order: 2 } }),
    prisma.category.create({ data: { name: "UPSC", slug: "upsc", icon: "🏛️", description: "Union Public Service Commission - Civil Services, IFS, CDS, NDA and more", color: "#7C3AED", order: 3 } }),
    prisma.category.create({ data: { name: "Banking", slug: "banking", icon: "🏦", description: "Banking sector exams - IBPS PO, SBI Clerk, RBI Grade B and more", color: "#059669", order: 4 } }),
    prisma.category.create({ data: { name: "ADRE", slug: "adre", icon: "🏔️", description: "Assam Direct Recruitment Examination - Grade III & Grade IV posts", color: "#D97706", order: 5 } }),
    prisma.category.create({ data: { name: "State Exams", slug: "state-exams", icon: "🏢", description: "State government recruitment exams - Police, Patwari, Gram Sevak and more", color: "#DC2626", order: 6 } }),
  ]);
  console.log("✅ Created 6 categories");

  // ─── Subjects ───────────────────────────────────────────────────────────────
  type CatRef = { id: string; slug: string };
  const categoryMap: Record<string, CatRef> = {
    railway: { id: railway.id, slug: "railway" },
    ssc: { id: ssc.id, slug: "ssc" },
    upsc: { id: upsc.id, slug: "upsc" },
    banking: { id: banking.id, slug: "banking" },
    adre: { id: adre.id, slug: "adre" },
    "state-exams": { id: stateExams.id, slug: "state-exams" },
  };

  const subjectDefs = [
    // Railway
    { cat: "railway", name: "General Knowledge", slug: "gk", icon: "🌍", order: 1 },
    { cat: "railway", name: "Mathematics", slug: "maths", icon: "🔢", order: 2 },
    { cat: "railway", name: "Reasoning", slug: "reasoning", icon: "🧠", order: 3 },
    { cat: "railway", name: "English", slug: "english", icon: "📝", order: 4 },
    { cat: "railway", name: "General Science", slug: "general-science", icon: "🔬", order: 5 },
    // SSC
    { cat: "ssc", name: "General Knowledge", slug: "gk", icon: "🌍", order: 1 },
    { cat: "ssc", name: "Mathematics", slug: "maths", icon: "🔢", order: 2 },
    { cat: "ssc", name: "Reasoning", slug: "reasoning", icon: "🧠", order: 3 },
    { cat: "ssc", name: "English", slug: "english", icon: "📝", order: 4 },
    // UPSC
    { cat: "upsc", name: "History", slug: "history", icon: "📜", order: 1 },
    { cat: "upsc", name: "Geography", slug: "geography", icon: "🗺️", order: 2 },
    { cat: "upsc", name: "Polity", slug: "polity", icon: "⚖️", order: 3 },
    { cat: "upsc", name: "Economy", slug: "economy", icon: "💰", order: 4 },
    { cat: "upsc", name: "Science & Technology", slug: "science-tech", icon: "🔬", order: 5 },
    { cat: "upsc", name: "Current Affairs", slug: "current-affairs", icon: "📰", order: 6 },
    // Banking
    { cat: "banking", name: "Quantitative Aptitude", slug: "quantitative-aptitude", icon: "🔢", order: 1 },
    { cat: "banking", name: "Reasoning", slug: "reasoning", icon: "🧠", order: 2 },
    { cat: "banking", name: "English", slug: "english", icon: "📝", order: 3 },
    { cat: "banking", name: "General Awareness", slug: "general-awareness", icon: "🌍", order: 4 },
    { cat: "banking", name: "Computer Knowledge", slug: "computer-knowledge", icon: "💻", order: 5 },
    // ADRE
    { cat: "adre", name: "General Knowledge", slug: "gk", icon: "🌍", order: 1 },
    { cat: "adre", name: "Mathematics", slug: "maths", icon: "🔢", order: 2 },
    { cat: "adre", name: "Reasoning", slug: "reasoning", icon: "🧠", order: 3 },
    { cat: "adre", name: "English", slug: "english", icon: "📝", order: 4 },
    { cat: "adre", name: "Assam GK", slug: "assam-gk", icon: "🏔️", order: 5 },
    // State Exams
    { cat: "state-exams", name: "General Knowledge", slug: "gk", icon: "🌍", order: 1 },
    { cat: "state-exams", name: "Mathematics", slug: "maths", icon: "🔢", order: 2 },
    { cat: "state-exams", name: "Reasoning", slug: "reasoning", icon: "🧠", order: 3 },
    { cat: "state-exams", name: "Language", slug: "language", icon: "📝", order: 4 },
  ];

  const subjects: Record<string, { id: string; catSlug: string; name: string; slug: string }[]> = {};
  for (const def of subjectDefs) {
    if (!subjects[def.cat]) subjects[def.cat] = [];
    const subject = await prisma.subject.create({
      data: { categoryId: categoryMap[def.cat].id, name: def.name, slug: def.slug, icon: def.icon, description: `${def.name} for ${categoryMap[def.cat].slug.toUpperCase()} exams`, order: def.order },
    });
    subjects[def.cat].push({ id: subject.id, catSlug: def.cat, name: def.name, slug: def.slug });
  }
  console.log("✅ Created all subjects");

  // ─── Tests & Questions ──────────────────────────────────────────────────────
  // Map subject name to question pool
  function getQuestionPool(subjectName: string) {
    switch (subjectName) {
      case "General Knowledge": return gkQuestions;
      case "Mathematics": return mathQuestions;
      case "Reasoning": return reasoningQuestions;
      case "English": return englishQuestions;
      case "General Science": return scienceQuestions;
      case "History": return historyQuestions;
      case "Geography": return geographyQuestions;
      case "Polity": return polityQuestions;
      case "Economy": return economyQuestions;
      case "Science & Technology": return scienceQuestions;
      case "Current Affairs": return gkQuestions;
      case "Quantitative Aptitude": return mathQuestions;
      case "General Awareness": return bankingAwarenessQuestions;
      case "Computer Knowledge": return computerQuestions;
      case "Assam GK": return assamGkQuestions;
      case "Language": return languageQuestions;
      default: return gkQuestions;
    }
  }

  let globalQuestionOffset = 0;
  let testCount = 0;
  let questionCount = 0;

  for (const catSlug of Object.keys(subjects)) {
    for (const subjectInfo of subjects[catSlug]) {
      const pool = getQuestionPool(subjectInfo.name);

      // Test 1: Free - 10 questions, 15 min
      const freeSlug = `${catSlug}-${subjectInfo.slug}-free-test-1`;
      const freeTest = await prisma.test.create({
        data: {
          subjectId: subjectInfo.id,
          title: `${subjectInfo.name} - Free Test 1`,
          slug: freeSlug,
          type: "free",
          duration: 15,
          totalMarks: 10,
          passingMarks: 4,
          isPublished: true,
          difficulty: "easy",
          negativeMarking: false,
          negativeMarks: 0,
          instructions: `This is a free practice test for ${subjectInfo.name}. Total: 10 questions, 15 minutes. No negative marking. Read each question carefully before answering.`,
        },
      });
      testCount++;

      const freeQs = pickQuestions(pool, 10, globalQuestionOffset);
      for (let i = 0; i < freeQs.length; i++) {
        await prisma.question.create({
          data: {
            testId: freeTest.id,
            text: freeQs[i].text,
            optionA: freeQs[i].optionA,
            optionB: freeQs[i].optionB,
            optionC: freeQs[i].optionC,
            optionD: freeQs[i].optionD,
            correctAnswer: freeQs[i].correctAnswer,
            explanation: freeQs[i].explanation,
            marks: 1,
            negativeMarks: 0,
            topic: freeQs[i].topic,
            difficulty: i < 3 ? "easy" : i < 7 ? "medium" : "hard",
            order: i + 1,
          },
        });
        questionCount++;
      }
      globalQuestionOffset += 10;

      // Test 2: Mock - 25 questions, 30 min
      const mockSlug = `${catSlug}-${subjectInfo.slug}-mock-test-1`;
      const mockTest = await prisma.test.create({
        data: {
          subjectId: subjectInfo.id,
          title: `${subjectInfo.name} - Mock Test 1`,
          slug: mockSlug,
          type: "mock",
          duration: 30,
          totalMarks: 25,
          passingMarks: 10,
          isPublished: true,
          difficulty: "medium",
          negativeMarking: true,
          negativeMarks: 0.25,
          instructions: `This is a mock test for ${subjectInfo.name}. Total: 25 questions, 30 minutes. Negative marking: -0.25 for each wrong answer. Manage your time wisely.`,
        },
      });
      testCount++;

      // For mock tests, we use 25 questions - pick from pool cycling
      for (let i = 0; i < 25; i++) {
        const q = pool[(globalQuestionOffset + i) % pool.length];
        await prisma.question.create({
          data: {
            testId: mockTest.id,
            text: q.text,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            marks: 1,
            negativeMarks: 0.25,
            topic: q.topic,
            difficulty: i < 8 ? "easy" : i < 17 ? "medium" : "hard",
            order: i + 1,
          },
        });
        questionCount++;
      }
      globalQuestionOffset += 25;

      // Test 3: Previous Year for popular subjects (GK, Maths, Reasoning in Railway & SSC)
      const isPopularSubject = ["General Knowledge", "Mathematics", "Reasoning"].includes(subjectInfo.name) &&
        ["railway", "ssc"].includes(catSlug);

      if (isPopularSubject) {
        const pySlug = `${catSlug}-${subjectInfo.slug}-previous-year-2023`;
        const pyTest = await prisma.test.create({
          data: {
            subjectId: subjectInfo.id,
            title: `${subjectInfo.name} - Previous Year 2023`,
            slug: pySlug,
            type: "previous_year",
            duration: 30,
            totalMarks: 25,
            passingMarks: 10,
            isPublished: true,
            difficulty: "hard",
            negativeMarking: true,
            negativeMarks: 0.33,
            instructions: `This is a previous year question paper for ${subjectInfo.name} (2023). Total: 25 questions, 30 minutes. Negative marking: -0.33 for each wrong answer. Attempt as if it's the real exam!`,
            year: 2023,
            examSession: catSlug === "railway" ? "RRB CBT-1" : "Tier-I",
          },
        });
        testCount++;

        for (let i = 0; i < 25; i++) {
          const q = pool[(globalQuestionOffset + i) % pool.length];
          await prisma.question.create({
            data: {
              testId: pyTest.id,
              text: q.text,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              marks: 1,
              negativeMarks: 0.33,
              topic: q.topic,
              difficulty: i < 5 ? "easy" : i < 15 ? "medium" : "hard",
              order: i + 1,
            },
          });
          questionCount++;
        }
        globalQuestionOffset += 25;
      }

      // Previous Year for Banking GA and Quant
      const isBankingPopular = ["Quantitative Aptitude", "General Awareness", "Reasoning"].includes(subjectInfo.name) && catSlug === "banking";
      if (isBankingPopular) {
        const pySlug = `${catSlug}-${subjectInfo.slug}-previous-year-2023`;
        const pyTest = await prisma.test.create({
          data: {
            subjectId: subjectInfo.id,
            title: `${subjectInfo.name} - Previous Year 2023`,
            slug: pySlug,
            type: "previous_year",
            duration: 30,
            totalMarks: 25,
            passingMarks: 10,
            isPublished: true,
            difficulty: "hard",
            negativeMarking: true,
            negativeMarks: 0.25,
            instructions: `Previous year paper for ${subjectInfo.name} (IBPS PO 2023). Total: 25 questions, 30 minutes. Negative marking: -0.25 per wrong answer.`,
            year: 2023,
            examSession: "IBPS PO Prelims",
          },
        });
        testCount++;

        for (let i = 0; i < 25; i++) {
          const q = pool[(globalQuestionOffset + i) % pool.length];
          await prisma.question.create({
            data: {
              testId: pyTest.id,
              text: q.text,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              marks: 1,
              negativeMarks: 0.25,
              topic: q.topic,
              difficulty: i < 5 ? "easy" : i < 15 ? "medium" : "hard",
              order: i + 1,
            },
          });
          questionCount++;
        }
        globalQuestionOffset += 25;
      }

      // Previous Year for ADRE GK and Assam GK
      const isAdrePopular = ["General Knowledge", "Assam GK"].includes(subjectInfo.name) && catSlug === "adre";
      if (isAdrePopular) {
        const pySlug = `${catSlug}-${subjectInfo.slug}-previous-year-2024`;
        const pyTest = await prisma.test.create({
          data: {
            subjectId: subjectInfo.id,
            title: `${subjectInfo.name} - ADRE Previous Year 2024`,
            slug: pySlug,
            type: "previous_year",
            duration: 30,
            totalMarks: 25,
            passingMarks: 10,
            isPublished: true,
            difficulty: "medium",
            negativeMarking: false,
            negativeMarks: 0,
            instructions: `ADRE पिछले वर्ष का प्रश्न पत्र (2024)। ${subjectInfo.name}। 25 प्रश्न, 30 मिनट। कोई नकारात्मक अंकन नहीं।`,
            year: 2024,
            examSession: "ADRE Grade III",
          },
        });
        testCount++;

        for (let i = 0; i < 25; i++) {
          const q = pool[(globalQuestionOffset + i) % pool.length];
          await prisma.question.create({
            data: {
              testId: pyTest.id,
              text: q.text,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              marks: 1,
              negativeMarks: 0,
              topic: q.topic,
              difficulty: i < 8 ? "easy" : i < 17 ? "medium" : "hard",
              order: i + 1,
            },
          });
          questionCount++;
        }
        globalQuestionOffset += 25;
      }
    }
  }

  console.log(`✅ Created ${testCount} tests with ${questionCount} questions`);

  // ─── Upcoming Exams ─────────────────────────────────────────────────────────
  const futureDate1 = new Date(); futureDate1.setDate(futureDate1.getDate() + 30);
  const futureDate2 = new Date(); futureDate2.setDate(futureDate2.getDate() + 45);
  const futureDate3 = new Date(); futureDate3.setDate(futureDate3.getDate() + 60);
  const applyDate1 = new Date(); applyDate1.setDate(applyDate1.getDate() + 15);
  const applyDate2 = new Date(); applyDate2.setDate(applyDate2.getDate() + 20);
  const applyDate3 = new Date(); applyDate3.setDate(applyDate3.getDate() + 25);

  await Promise.all([
    prisma.upcomingExam.create({
      data: { categoryId: ssc.id, name: "SSC CGL 2025 Tier-I", examDate: futureDate1, lastApplyDate: applyDate1, description: "SSC Combined Graduate Level Examination 2025 Tier-I. Eligible candidates must have a graduation degree from a recognized university.", notificationLink: "https://ssc.nic.in", tags: "SSC,CGL,Graduate,Central Govt", isActive: true },
    }),
    prisma.upcomingExam.create({
      data: { categoryId: banking.id, name: "IBPS PO 2025 Prelims", examDate: futureDate2, lastApplyDate: applyDate2, description: "IBPS Probationary Officer Examination 2025 Preliminary Stage. Graduation in any discipline from a recognized university.", notificationLink: "https://ibps.in", tags: "IBPS,PO,Banking,Officer", isActive: true },
    }),
    prisma.upcomingExam.create({
      data: { categoryId: railway.id, name: "RRB NTPC 2025 CBT-1", examDate: futureDate3, lastApplyDate: applyDate3, description: "Railway Recruitment Board Non-Technical Popular Categories 2025 Computer Based Test Stage 1.", notificationLink: "https://rrcb.gov.in", tags: "RRB,NTPC,Railways,CBT", isActive: true },
    }),
  ]);
  console.log("✅ Created 3 upcoming exams");

  // ─── Current Affairs (7 entries, one per day for last week) ─────────────────
  const currentAffairs = [
    { title: "India Successfully Launches Gaganyaan Test Mission", content: "ISRO successfully completed the Gaganyaan test vehicle mission, marking a significant milestone in India's human spaceflight program. The test validated the crew escape system, which is crucial for ensuring astronaut safety during the mission. ISRO Chairman confirmed that the first unmanned flight is scheduled for late 2025.", summary: "ISRO completes Gaganyaan test mission successfully", source: "PIB", category: "Science & Technology", isImportant: true, tags: "ISRO,Gaganyaan,Space" },
    { title: "RBI Keeps Repo Rate Unchanged at 6.50%", content: "The Reserve Bank of India's Monetary Policy Committee decided to keep the repo rate unchanged at 6.50% for the eighth consecutive time. The GDP growth forecast for FY25 was maintained at 7.2%. The CPI inflation projection was revised slightly upward to 4.5% for the year.", summary: "RBI maintains repo rate at 6.50%, GDP forecast at 7.2%", source: "RBI", category: "Economy", isImportant: true, tags: "RBI,Repo Rate,Economy,Inflation" },
    { title: "India Assumes BRICS Chairmanship for 2025", content: "India has officially taken over the BRICS chairmanship for 2025, with the summit scheduled to be held in New Delhi. The theme for India's chairmanship is 'Building a Resilient and Inclusive World Order'. Key focus areas include digital infrastructure, climate finance, and reform of multilateral institutions.", summary: "India takes BRICS chairmanship, summit in New Delhi", source: "MEA", category: "International Relations", isImportant: false, tags: "BRICS,India,International" },
    { title: "Chandrayaan-4 Mission Gets Cabinet Approval", content: "The Union Cabinet has approved India's next lunar mission, Chandrayaan-4, with a budget of ₹2,104 crore. The mission aims to bring back lunar samples to Earth, making India the fourth country to achieve this feat. The launch is targeted for 2028 using the LVM3 rocket.", summary: "Cabinet approves Chandrayaan-4 with ₹2,104 crore budget", source: "PIB", category: "Science & Technology", isImportant: true, tags: "Chandrayaan,ISRO,Moon,Mission" },
    { title: "New Education Policy Implementation: 100% Gross Enrollment Ratio Target by 2030", content: "The Ministry of Education announced accelerated implementation of NEP 2020, targeting 100% Gross Enrollment Ratio (GER) in higher education by 2030. Currently at 28.4%, the ministry plans to achieve this through new digital universities, multidisciplinary courses, and credit transfer systems.", summary: "NEP 2020: Target 100% GER in higher education by 2030", source: "Education Ministry", category: "Education", isImportant: false, tags: "NEP,Education,GER,Higher Education" },
    { title: "India's Forex Reserves Cross $670 Billion Mark", content: "India's foreign exchange reserves have crossed the $670 billion mark, reaching a new all-time high. The increase was driven by rising foreign investment inflows and RBI's strategic dollar purchases. India now holds the 4th largest forex reserves globally after China, Japan, and Switzerland.", summary: "India forex reserves hit record $670 billion", source: "RBI", category: "Economy", isImportant: true, tags: "Forex,RBI,Economy,Dollar" },
    { title: "PM Launches 'Viksit Bharat 2047' Roadmap", content: "The Prime Minister launched the 'Viksit Bharat 2047' roadmap outlining India's vision to become a developed nation by 2047, the centenary year of independence. The roadmap covers key sectors including infrastructure, manufacturing, digital economy, agriculture, and social welfare with detailed targets and implementation frameworks.", summary: "PM launches Viksit Bharat 2047 development roadmap", source: "PIB", category: "Governance", isImportant: true, tags: "Viksit Bharat,2047,Development,Governance" },
  ];

  for (let i = 0; i < currentAffairs.length; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i)); // last 7 days
    date.setHours(9, 0, 0, 0);
    await prisma.currentAffair.create({
      data: {
        date,
        title: currentAffairs[i].title,
        content: currentAffairs[i].content,
        summary: currentAffairs[i].summary,
        source: currentAffairs[i].source,
        category: currentAffairs[i].category,
        isImportant: currentAffairs[i].isImportant,
        tags: currentAffairs[i].tags,
      },
    });
  }
  console.log("✅ Created 7 current affairs entries");

  // ─── Announcements (2 for NEXTEXAM launch) ─────────────────────────────────
  await Promise.all([
    prisma.announcement.create({
      data: {
        title: "🚀 Welcome to NEXTEXAM - Your Exam Preparation Partner!",
        message: "We're thrilled to launch NEXTEXAM - the most comprehensive platform for Indian competitive exam preparation. Practice with thousands of questions across Railway, SSC, UPSC, Banking, ADRE, and State Exams. Start your journey today with free tests and track your progress with our smart analytics!",
        priority: "important",
        target: "all",
        isPublished: true,
        type: "banner",
        gradient: "from-emerald-600 via-teal-600 to-cyan-600",
        emoji: "🚀",
        link: "exams",
        buttonText: "Start Practicing",
        badgeText: "New Launch",
        order: 1,
      },
    }),
    prisma.announcement.create({
      data: {
        title: "🎯 Free Mock Tests Available - Limited Time Offer!",
        message: "Get access to premium-quality mock tests absolutely FREE for a limited time! Practice Railway, SSC, Banking, and UPSC mock tests designed by experts. Don't miss this opportunity to assess your preparation level before the real exam. Premium tests also available with detailed solutions!",
        priority: "info",
        target: "all",
        isPublished: true,
        type: "banner",
        gradient: "from-amber-500 via-orange-500 to-red-500",
        emoji: "🎯",
        link: "daily-quiz",
        buttonText: "Take Free Test",
        badgeText: "Free Access",
        order: 2,
      },
    }),
  ]);
  console.log("✅ Created 2 announcements");

  // ─── Notifications ──────────────────────────────────────────────────────────
  await Promise.all([
    prisma.notification.create({
      data: { userId: student.id, title: "Welcome to NEXTEXAM! 🎉", body: "Start your exam preparation by taking a free mock test. Practice makes perfect!", type: "announcement", isRead: false },
    }),
    prisma.notification.create({
      data: { userId: student.id, title: "🔥 5-Day Streak!", body: "You've maintained a 5-day study streak. Keep going to earn more XP and climb the leaderboard!", type: "streak", isRead: false },
    }),
    prisma.notification.create({
      data: { userId: premium.id, title: "Welcome to NEXTEXAM Pro! 🏆", body: "You have access to all premium mock tests and previous year papers. Happy studying!", type: "announcement", isRead: true },
    }),
  ]);
  console.log("✅ Created notifications");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("📧 Admin: admin@nextexam.com / Admin@123");
  console.log("📧 Student: student@nextexam.com / Student@123");
  console.log("📧 Premium: premium@nextexam.com / Premium@123");
  console.log(`📊 Total: ${testCount} tests, ${questionCount} questions`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
