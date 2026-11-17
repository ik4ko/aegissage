/**
 * Medicare help in Georgian and Russian: one page, three languages.
 *
 *   en  /medicare-help-georgian-russian   the reference version
 *   ka  /ka                               Georgian translation
 *   ru  /ru                               Russian translation
 *
 * ── Rules for this file ───────────────────────────────────────────────────
 *  1. The English version is the reference. `ka` and `ru` say the same things
 *     in the same order and add nothing. Change English first, then both
 *     translations in the same commit.
 *  2. Educational only. No carrier, no plan name, no premium, no benefit, no
 *     star rating, no "you qualify". Eligibility is described as the rule the
 *     government publishes, and the page says who actually decides it.
 *  3. Every Medicare rule cites an official source in `SOURCES`. Each URL was
 *     opened and checked on `REVIEW_DATE`.
 *  4. NATIVE REVIEW. A translation is published to search engines only when
 *     its `reviewed` entry below is true. Until then the page is noindex, is
 *     left out of the sitemap, of hreflang and of the footer, and shows a
 *     draft banner. Erekle reviews Georgian himself. Russian needs a fluent
 *     reviewer who is not Erekle (it is his weakest language).
 *     To publish: set `reviewed` to true and fill `reviewedBy`/`reviewedOn`.
 */

export type PageLocale = 'en' | 'ka' | 'ru';

export const REVIEW_DATE = '2026-11-15';

export const LANGUAGE_PAGE_PATHS: Record<PageLocale, string> = {
  en: '/medicare-help-georgian-russian',
  ka: '/ka',
  ru: '/ru',
};

export const TRANSLATION_REVIEW: Record<
  PageLocale,
  { reviewed: boolean; reviewedBy: string; reviewedOn: string }
> = {
  en: { reviewed: true, reviewedBy: 'Erekle Niniashvili (pending his read of PR 2)', reviewedOn: '' },
  // Erekle reviews this one himself.
  ka: { reviewed: false, reviewedBy: '', reviewedOn: '' },
  // Needs a fluent Russian reviewer other than Erekle.
  ru: { reviewed: false, reviewedBy: '', reviewedOn: '' },
};

export const HTML_LANG: Record<PageLocale, string> = { en: 'en-US', ka: 'ka', ru: 'ru' };

export const SOURCES = {
  partAB: {
    title: 'Original Medicare (Part A and B) Eligibility and Enrollment — CMS.gov',
    url: 'https://www.cms.gov/medicare/enrollment-renewal/original-part-a-b',
  },
  whenStart: {
    title: 'When does Medicare coverage start? — Medicare.gov',
    url: 'https://www.medicare.gov/basics/get-started-with-medicare/sign-up/when-does-medicare-coverage-start',
  },
  joining: {
    title: 'Joining a plan (enrollment periods) — Medicare.gov',
    url: 'https://www.medicare.gov/basics/get-started-with-medicare/get-more-coverage/joining-a-plan',
  },
  medigap: {
    title: 'Get Medigap Basics — Medicare.gov',
    url: 'https://www.medicare.gov/health-drug-plans/medigap/basics',
  },
  drugCosts: {
    title: 'Help with drug costs (Extra Help) — Medicare.gov',
    url: 'https://www.medicare.gov/basics/costs/help/drug-costs',
  },
  njsave: {
    title: 'NJSave — New Jersey Division of Aging Services',
    url: 'https://www.nj.gov/humanservices/doas/services/l-p/njsave/',
  },
  languages: {
    title: 'Get Medicare information in other languages — Medicare.gov',
    url: 'https://www.medicare.gov/about-us/other-languages',
  },
  costsRussian: {
    title: 'Получите помощь на оплату ваших расходов на Medicare — Medicare.gov (PDF, Russian)',
    url: 'https://www.medicare.gov/publications/10126-r-get-help-with-your-medicare-costs-getting-started.pdf?linkit_matcher=1',
  },
} as const;

export type SourceId = keyof typeof SOURCES;

export type LanguagePage = {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  h1: string;
  lede: string;
  agentNotice: string;
  sections: { heading: string; paragraphs: string[]; sources?: SourceId[] }[];
  faqHeading: string;
  faq: { question: string; answer: string }[];
  formHeading: string;
  formIntro: string;
  sourcesHeading: string;
  sourcesNote: string;
  reviewedLine: string;
  translationNotice: string;
  disclaimerHeading: string;
  /** TPMO disclaimer in this language. `{org}` and `{products}` are filled in. */
  disclaimerCounted: string;
  disclaimerGeneric: string;
  disclaimerEnglishNote: string;
  otherLanguages: string;
  languageNames: Record<PageLocale, string>;
};

const languageNames: Record<PageLocale, string> = {
  en: 'English',
  ka: 'ქართული',
  ru: 'Русский',
};

const en: LanguagePage = {
  metaTitle: 'Medicare help in Georgian and Russian, Edgewater',
  metaDescription:
    'Erekle Niniashvili, a licensed insurance broker in Edgewater, NJ, explains Medicare in Georgian, Russian and English. Bergen, Hudson, NYC, Philadelphia.',
  badge: 'Georgian · Russian · English',
  h1: 'Medicare help in Georgian and Russian',
  lede:
    'Erekle Niniashvili is a licensed independent insurance broker in Edgewater, New Jersey who explains Medicare in Georgian, Russian and English. Georgian is his first language. He works with people in Bergen and Hudson counties, New York City and Philadelphia who are turning 65, leaving employer coverage, or reviewing the coverage they have. There is no charge for his help. Call or text (551) 202-9079.',
  agentNotice: 'Calling this number will direct you to a licensed insurance agent.',
  sections: [
    {
      heading: 'Who this page is for',
      paragraphs: [
        'People who are more comfortable in Georgian or Russian than in English, and their adult children who are helping a parent sort out Medicare.',
        'Medicare letters, plan documents and enrollment forms are in English. What I can do is explain them in your language, slowly, as many times as you need, before you decide anything.',
      ],
    },
    {
      heading: 'Medicare in one minute',
      paragraphs: [
        'Medicare is the federal health insurance program for people 65 and older and for some younger people with disabilities. Part A is hospital insurance. Part B is medical insurance: doctor visits and outpatient care.',
        'After you have Part A and Part B there are two main ways to get your coverage. One is Original Medicare, where many people add a separate drug plan (Part D) and a Medicare Supplement (Medigap) policy. The other is a Medicare Advantage plan (Part C), a private plan that combines hospital and medical coverage and often drug coverage.',
        'Neither way is right for everyone. It depends on your doctors, your prescriptions, your budget and the county you live in.',
      ],
      sources: ['partAB', 'joining', 'medigap'],
    },
    {
      heading: 'When to sign up',
      paragraphs: [
        'Most people first sign up around their 65th birthday. That first window lasts 7 months: it starts 3 months before the month you turn 65 and ends 3 months after it.',
        'If you are still working at 65 and covered by your own or your spouse’s employer plan, you may be able to wait. You can then sign up while that coverage continues, or for up to 8 months after the job or the coverage ends, whichever comes first. COBRA and retiree coverage do not count as coverage from current work.',
        'Each year from October 15 to December 7 people with Medicare can join, switch or drop a Medicare Advantage or drug plan, with the change starting January 1. From January 1 to March 31, people already in a Medicare Advantage plan can switch plans once or return to Original Medicare.',
        'Missing a deadline can mean months without coverage and a late enrollment penalty that lasts as long as you have Part B. If you are not sure which window applies to you, ask before the date passes.',
      ],
      sources: ['whenStart', 'joining'],
    },
    {
      heading: 'If you have worked in the United States for less than 10 years',
      paragraphs: [
        'This question comes up often in immigrant families. Most people pay no monthly premium for Part A because they or their spouse paid Medicare taxes while working for about 10 years.',
        'Under the rules CMS publishes, a person who does not have that work history can still enroll in Part B, and can buy Part A, if they are 65 or older, live in the United States, and are either a U.S. citizen or a lawful permanent resident who has lived in the country continuously for the 5 years before applying.',
        'Social Security decides whether you are eligible and what you will pay. I cannot decide that for you, but I can explain the rule and tell you what to ask them.',
      ],
      sources: ['partAB'],
    },
    {
      heading: 'Help paying Medicare costs',
      paragraphs: [
        'People with limited income and savings may get help from two kinds of programs. Medicare Savings Programs are run by the states and can pay the Part B premium and sometimes other costs. Extra Help is a federal program that lowers the cost of prescription drug coverage.',
        'You can apply for both at the same time. In New Jersey one application, NJSave, covers the Medicare Savings Programs and the state’s own prescription assistance programs. Your state decides whether you are eligible.',
      ],
      sources: ['drugCosts', 'njsave'],
    },
    {
      heading: 'Your right to an interpreter',
      paragraphs: [
        'You do not have to rely on me or on a family member. Medicare itself offers interpreters at no cost: call 1-800-MEDICARE (1-800-633-4227) and ask for an interpreter in your language. The line is open 24 hours a day, 7 days a week, except some federal holidays. TTY users can call 1-877-486-2048.',
        'New Jersey also offers Medicare counseling at no cost through its State Health Insurance Assistance Program (SHIP).',
      ],
      sources: ['languages', 'njsave'],
    },
    {
      heading: 'How I work',
      paragraphs: [
        'We start with a conversation in the language you choose: your doctors, your prescriptions, your ZIP code and what you have now. That part is education and you can stop there.',
        'Before we talk about specific plans, Medicare rules require me to ask you to confirm what we will discuss (a Scope of Appointment), and that conversation takes place on a recorded line. Both rules exist to protect you.',
        'I am an independent broker, which means I am contracted with several insurance companies rather than one. I do not offer every plan available in your area, and I will tell you when the answer is to keep what you have.',
      ],
    },
  ],
  faqHeading: 'Common questions',
  faq: [
    {
      question: 'Do you charge for your help?',
      answer:
        'No. There is no fee to talk with me, and no obligation to enroll in anything. If you enroll in a plan through me, the insurance company pays me a commission.',
    },
    {
      question: 'Can you help my parent who does not speak English?',
      answer:
        'Yes, in Georgian or Russian. Your parent needs to take part in the conversation and agree to be contacted, because the coverage and the decision are theirs. You are welcome to join the call.',
    },
    {
      question: 'Are official Medicare materials available in Russian or Georgian?',
      answer:
        'Medicare publishes some of its booklets in Russian and other languages. For any language, including Georgian, you can call 1-800-MEDICARE and ask for an interpreter at no cost.',
    },
    {
      question: 'Where do you work?',
      answer:
        'I am based in Edgewater, New Jersey. I work mostly with people in Bergen and Hudson counties, New York City (including Brooklyn and Queens) and Philadelphia, by phone or video, and in person in northern New Jersey.',
    },
  ],
  formHeading: 'Ask me a question',
  formIntro: 'Write in Georgian, Russian or English. I read every message myself.',
  sourcesHeading: 'Sources',
  sourcesNote: 'Official pages these explanations are based on. All are in English unless marked.',
  reviewedLine: 'Reviewed November 15, 2026 by Erekle Niniashvili, licensed insurance broker.',
  translationNotice:
    'This is the English reference version. Georgian and Russian translations are provided for convenience; if a translation and the English differ, the English applies.',
  disclaimerHeading: 'Important disclosure',
  disclaimerCounted:
    'Aegis Sage is not connected with or endorsed by the United States government or the federal Medicare program. We do not offer every plan available in your area. Currently we represent {org} organizations which offer {products} products in your area. Please contact Medicare.gov or 1-800-MEDICARE to get information on all of your options. TTY users can call 1-877-486-2048.',
  disclaimerGeneric:
    'Aegis Sage is not connected with or endorsed by the United States government or the federal Medicare program. We do not offer every plan available in your area. Any information we provide is limited to those plans we do offer in your area. Please contact Medicare.gov or 1-800-MEDICARE to get information on all of your options. TTY users can call 1-877-486-2048.',
  disclaimerEnglishNote: '',
  otherLanguages: 'This page in other languages',
  languageNames,
};

const ka: LanguagePage = {
  metaTitle: 'დახმარება Medicare-ის საკითხებში ქართულად — ეჯუოტერი, ნიუ-ჯერსი',
  metaDescription:
    'ერეკლე ნინიაშვილი, ლიცენზირებული სადაზღვევო ბროკერი ეჯუოტერში (ნიუ-ჯერსი), Medicare-ს ქართულად, რუსულად და ინგლისურად გიხსნით.',
  badge: 'ქართული · რუსული · ინგლისური',
  h1: 'დახმარება Medicare-ის საკითხებში ქართულ ენაზე',
  lede:
    'ერეკლე ნინიაშვილი არის ლიცენზირებული დამოუკიდებელი სადაზღვევო ბროკერი ეჯუოტერში (Edgewater), ნიუ-ჯერსის შტატში. ის Medicare-ს გიხსნით ქართულად, რუსულად და ინგლისურად. ქართული მისი მშობლიური ენაა. ის მუშაობს ბერგენისა და ჰადსონის ოლქების, ნიუ-იორკისა და ფილადელფიის მცხოვრებლებთან, რომლებიც 65 წლის ხდებიან, ტოვებენ დამსაქმებლის დაზღვევას ან სურთ გადახედონ არსებულ დაზღვევას. მისი დახმარება უფასოა. დარეკეთ ან მოგვწერეთ: (551) 202-9079.',
  agentNotice: 'ამ ნომერზე დარეკვისას დაუკავშირდებით ლიცენზირებულ სადაზღვევო აგენტს.',
  sections: [
    {
      heading: 'ვისთვის არის ეს გვერდი',
      paragraphs: [
        'მათთვის, ვისთვისაც ქართული ან რუსული უფრო ადვილია, ვიდრე ინგლისური, და მათი ზრდასრული შვილებისთვის, რომლებიც მშობელს Medicare-ის საკითხების მოგვარებაში ეხმარებიან.',
        'Medicare-ის წერილები, გეგმების დოკუმენტები და სარეგისტრაციო ფორმები ინგლისურ ენაზეა. მე შემიძლია ისინი თქვენს ენაზე აგიხსნათ — აუჩქარებლად და იმდენჯერ, რამდენჯერაც დაგჭირდებათ, სანამ რაიმეს გადაწყვეტთ.',
      ],
    },
    {
      heading: 'Medicare ერთ წუთში',
      paragraphs: [
        'Medicare არის ფედერალური ჯანმრთელობის დაზღვევის პროგრამა 65 წლის და უფროსი ასაკის ადამიანებისთვის, ასევე ზოგიერთი უფრო ახალგაზრდა ადამიანისთვის, რომელსაც შეზღუდული შესაძლებლობა აქვს. ნაწილი A (Part A) არის საავადმყოფოს დაზღვევა. ნაწილი B (Part B) არის სამედიცინო დაზღვევა: ექიმთან ვიზიტები და ამბულატორიული მომსახურება.',
        'მას შემდეგ, რაც გექნებათ Part A და Part B, დაზღვევის მიღების ორი ძირითადი გზა არსებობს. პირველია Original Medicare, რომელსაც ბევრი ადამიანი უმატებს წამლების ცალკე გეგმას (Part D) და Medicare-ის დამატებით პოლისს (Medigap). მეორეა Medicare Advantage-ის გეგმა (Part C) — კერძო გეგმა, რომელიც აერთიანებს საავადმყოფოსა და სამედიცინო დაზღვევას და ხშირად წამლების დაფარვასაც.',
        'არცერთი გზა არ არის ყველასთვის სწორი. ეს დამოკიდებულია თქვენს ექიმებზე, წამლებზე, ბიუჯეტზე და ოლქზე, სადაც ცხოვრობთ.',
      ],
      sources: ['partAB', 'joining', 'medigap'],
    },
    {
      heading: 'როდის უნდა დარეგისტრირდეთ',
      paragraphs: [
        'ადამიანების უმეტესობა პირველად 65 წლის იუბილეს პერიოდში რეგისტრირდება. ეს პირველი პერიოდი 7 თვე გრძელდება: იწყება იმ თვემდე 3 თვით ადრე, როცა 65 წლის ხდებით, და მთავრდება ამ თვიდან 3 თვის შემდეგ.',
        'თუ 65 წლის ასაკში ჯერ კიდევ მუშაობთ და დაზღვეული ხართ თქვენი ან მეუღლის დამსაქმებლის გეგმით, შესაძლოა დალოდება შეგეძლოთ. ამ შემთხვევაში რეგისტრაცია შეგიძლიათ მანამ, სანამ ეს დაზღვევა მოქმედებს, ან სამუშაოს ან დაზღვევის დასრულებიდან 8 თვის განმავლობაში — იმის მიხედვით, რომელი დადგება უფრო ადრე. COBRA და პენსიონერთა დაზღვევა არ ითვლება მიმდინარე სამუშაოდან მიღებულ დაზღვევად.',
        'ყოველწლიურად, 15 ოქტომბრიდან 7 დეკემბრამდე, Medicare-ის მქონე ადამიანებს შეუძლიათ შეუერთდნენ Medicare Advantage-ის ან წამლების გეგმას, შეცვალონ ან დატოვონ ის; ცვლილება ძალაში შედის 1 იანვრიდან. 1 იანვრიდან 31 მარტამდე მათ, ვინც უკვე Medicare Advantage-ის გეგმაშია, შეუძლიათ ერთხელ შეცვალონ გეგმა ან დაუბრუნდნენ Original Medicare-ს.',
        'ვადის გაშვებამ შეიძლება გამოიწვიოს რამდენიმე თვე დაზღვევის გარეშე და დაგვიანებული რეგისტრაციის ჯარიმა, რომელიც გრძელდება მანამ, სანამ Part B გაქვთ. თუ არ ხართ დარწმუნებული, რომელი პერიოდი გეხებათ, იკითხეთ ვადის გასვლამდე.',
      ],
      sources: ['whenStart', 'joining'],
    },
    {
      heading: 'თუ შეერთებულ შტატებში 10 წელზე ნაკლები გიმუშავიათ',
      paragraphs: [
        'ეს კითხვა ხშირად ჩნდება ემიგრანტთა ოჯახებში. ადამიანების უმეტესობა Part A-სთვის ყოველთვიურ გადასახადს არ იხდის, რადგან თვითონ ან მათმა მეუღლემ მუშაობისას დაახლოებით 10 წლის განმავლობაში იხადა Medicare-ის გადასახადი.',
        'CMS-ის მიერ გამოქვეყნებული წესების მიხედვით, ადამიანს, რომელსაც ასეთი სამუშაო სტაჟი არ აქვს, მაინც შეუძლია დარეგისტრირდეს Part B-ში და იყიდოს Part A, თუ ის 65 წლის ან უფროსია, ცხოვრობს შეერთებულ შტატებში და არის აშშ-ის მოქალაქე ან კანონიერი მუდმივი მაცხოვრებელი, რომელიც განაცხადის შეტანამდე ბოლო 5 წლის განმავლობაში უწყვეტად ცხოვრობდა ქვეყანაში.',
        'იმას, გაქვთ თუ არა უფლება და რამდენს გადაიხდით, წყვეტს Social Security. ამის გადაწყვეტა მე არ შემიძლია, მაგრამ შემიძლია აგიხსნათ წესი და გითხრათ, რა უნდა ჰკითხოთ მათ.',
      ],
      sources: ['partAB'],
    },
    {
      heading: 'დახმარება Medicare-ის ხარჯების გადახდაში',
      paragraphs: [
        'შეზღუდული შემოსავლისა და დანაზოგის მქონე ადამიანებმა შეიძლება დახმარება ორი სახის პროგრამიდან მიიღონ. Medicare Savings Programs შტატების პროგრამებია და შეუძლიათ გადაიხადონ Part B-ის გადასახადი, ზოგჯერ კი სხვა ხარჯებიც. Extra Help ფედერალური პროგრამაა, რომელიც ამცირებს რეცეპტით გასაცემი წამლების დაზღვევის ხარჯებს.',
        'ორივეზე განაცხადის შეტანა ერთდროულად შეგიძლიათ. ნიუ-ჯერსიში ერთი განაცხადი, NJSave, მოიცავს როგორც Medicare Savings Programs-ს, ისე შტატის საკუთარ პროგრამებს, რომლებიც წამლების ხარჯებში გეხმარებათ. იმას, გაქვთ თუ არა უფლება, თქვენი შტატი წყვეტს.',
      ],
      sources: ['drugCosts', 'njsave'],
    },
    {
      heading: 'თქვენი უფლება თარჯიმანზე',
      paragraphs: [
        'არ ხართ ვალდებული, მხოლოდ ჩემზე ან ოჯახის წევრზე იყოთ დამოკიდებული. თავად Medicare გთავაზობთ თარჯიმანს უფასოდ: დარეკეთ 1-800-MEDICARE (1-800-633-4227) და მოითხოვეთ თარჯიმანი თქვენს ენაზე. ხაზი მუშაობს დღე-ღამეში 24 საათი, კვირაში 7 დღე, ზოგიერთი ფედერალური დღესასწაულის გარდა. TTY-ის მომხმარებლებს შეუძლიათ დარეკონ 1-877-486-2048.',
        'ნიუ-ჯერსი ასევე გთავაზობთ უფასო კონსულტაციას Medicare-ის საკითხებზე შტატის ჯანმრთელობის დაზღვევის დახმარების პროგრამის (SHIP) მეშვეობით.',
      ],
      sources: ['languages', 'njsave'],
    },
    {
      heading: 'როგორ ვმუშაობ',
      paragraphs: [
        'ვიწყებთ საუბრით თქვენ მიერ არჩეულ ენაზე: თქვენი ექიმები, წამლები, საფოსტო ინდექსი და ის, რაც ახლა გაქვთ. ეს ნაწილი საინფორმაციოა და შეგიძლიათ აქვე შეჩერდეთ.',
        'სანამ კონკრეტულ გეგმებზე ვისაუბრებთ, Medicare-ის წესები მოითხოვს, რომ დაადასტუროთ, რაზე ვისაუბრებთ (Scope of Appointment), და ეს საუბარი ჩაწერილ სატელეფონო ხაზზე მიმდინარეობს. ორივე წესი თქვენს დასაცავად არსებობს.',
        'მე დამოუკიდებელი ბროკერი ვარ, ანუ კონტრაქტი მაქვს რამდენიმე სადაზღვევო კომპანიასთან და არა ერთთან. მე არ გთავაზობთ თქვენს რეგიონში არსებულ ყველა გეგმას და გეტყვით, როცა სწორი პასუხია, შეინარჩუნოთ ის, რაც გაქვთ.',
      ],
    },
  ],
  faqHeading: 'ხშირად დასმული კითხვები',
  faq: [
    {
      question: 'იღებთ თუ არა საფასურს დახმარებისთვის?',
      answer:
        'არა. ჩემთან საუბარი უფასოა და არანაირ რეგისტრაციას არ გავალდებულებთ. თუ ჩემი მეშვეობით გეგმაში დარეგისტრირდებით, საკომისიოს სადაზღვევო კომპანია მიხდის.',
    },
    {
      question: 'შეგიძლიათ დაეხმაროთ ჩემს მშობელს, რომელიც ინგლისურად არ საუბრობს?',
      answer:
        'დიახ, ქართულად ან რუსულად. თქვენმა მშობელმა უნდა მიიღოს მონაწილეობა საუბარში და დათანხმდეს დაკავშირებას, რადგან დაზღვევაც და გადაწყვეტილებაც მისია. შეგიძლიათ თქვენც შემოუერთდეთ ზარს.',
    },
    {
      question: 'არის თუ არა Medicare-ის ოფიციალური მასალები რუსულად ან ქართულად?',
      answer:
        'Medicare ზოგიერთ ბროშურას აქვეყნებს რუსულ და სხვა ენებზე. ნებისმიერი ენისთვის, მათ შორის ქართულისთვის, შეგიძლიათ დარეკოთ 1-800-MEDICARE და უფასოდ მოითხოვოთ თარჯიმანი.',
    },
    {
      question: 'სად მუშაობთ?',
      answer:
        'ვცხოვრობ ეჯუოტერში (Edgewater), ნიუ-ჯერსი. ძირითადად ვმუშაობ ბერგენისა და ჰადსონის ოლქების, ნიუ-იორკის (მათ შორის ბრუკლინისა და ქუინსის) და ფილადელფიის მცხოვრებლებთან — ტელეფონით ან ვიდეოზარით, ხოლო ჩრდილოეთ ნიუ-ჯერსიში პირადადაც.',
    },
  ],
  formHeading: 'დამისვით კითხვა',
  formIntro: 'მომწერეთ ქართულად, რუსულად ან ინგლისურად. ყველა შეტყობინებას თავად ვკითხულობ.',
  sourcesHeading: 'წყაროები',
  sourcesNote: 'ოფიციალური გვერდები, რომლებსაც ეს განმარტებები ეფუძნება. ყველა ინგლისურ ენაზეა, თუ სხვა რამ არ არის მითითებული.',
  reviewedLine: 'გადახედულია 2026 წლის 15 ნოემბერს. ერეკლე ნინიაშვილი, ლიცენზირებული სადაზღვევო ბროკერი.',
  translationNotice:
    'ეს გვერდი არის თარგმანი თქვენი მოხერხებულობისთვის. თუ თარგმანსა და ინგლისურ ვერსიას შორის განსხვავებაა, მოქმედებს ინგლისური ვერსია.',
  disclaimerHeading: 'მნიშვნელოვანი ინფორმაცია',
  disclaimerCounted:
    'Aegis Sage არ არის დაკავშირებული აშშ-ის მთავრობასთან ან ფედერალურ Medicare-ის პროგრამასთან და არ არის მათ მიერ მოწონებული. ჩვენ არ გთავაზობთ თქვენს რეგიონში არსებულ ყველა გეგმას. ამჟამად წარმოვადგენთ {org} ორგანიზაციას, რომლებიც თქვენს რეგიონში {products} პროდუქტს გთავაზობენ. ყველა თქვენი ვარიანტის შესახებ ინფორმაციის მისაღებად მიმართეთ Medicare.gov-ს ან დარეკეთ 1-800-MEDICARE (TTY 1-877-486-2048).',
  disclaimerGeneric:
    'Aegis Sage არ არის დაკავშირებული აშშ-ის მთავრობასთან ან ფედერალურ Medicare-ის პროგრამასთან და არ არის მათ მიერ მოწონებული. ჩვენ არ გთავაზობთ თქვენს რეგიონში არსებულ ყველა გეგმას. ნებისმიერი ინფორმაცია, რომელსაც გაწვდით, შემოიფარგლება იმ გეგმებით, რომლებსაც თქვენს რეგიონში გთავაზობთ. ყველა თქვენი ვარიანტის შესახებ ინფორმაციის მისაღებად მიმართეთ Medicare.gov-ს ან დარეკეთ 1-800-MEDICARE (TTY 1-877-486-2048).',
  disclaimerEnglishNote:
    'ეს არის ქვემოთ, გვერდის ბოლოში მოცემული ინგლისურენოვანი შეტყობინების თარგმანი. ოფიციალურია ინგლისური ტექსტი.',
  otherLanguages: 'ეს გვერდი სხვა ენებზე',
  languageNames,
};

const ru: LanguagePage = {
  metaTitle: 'Помощь с Medicare на русском языке — Эджуотер, Нью-Джерси',
  metaDescription:
    'Эрекле Ниниашвили, лицензированный страховой брокер в Эджуотере (Нью-Джерси), объясняет Medicare на русском, грузинском и английском языках.',
  badge: 'Русский · Грузинский · Английский',
  h1: 'Помощь с Medicare на русском языке',
  lede:
    'Эрекле Ниниашвили — лицензированный независимый страховой брокер в городе Эджуотер (Edgewater), штат Нью-Джерси. Он объясняет Medicare на русском, грузинском и английском языках. Его родной язык — грузинский. Он работает с жителями округов Берген и Хадсон, Нью-Йорка и Филадельфии, которым исполняется 65 лет, которые уходят со страховки работодателя или хотят пересмотреть свою нынешнюю страховку. Его помощь бесплатна. Звоните или пишите: (551) 202-9079.',
  agentNotice: 'Позвонив по этому номеру, вы свяжетесь с лицензированным страховым агентом.',
  sections: [
    {
      heading: 'Для кого эта страница',
      paragraphs: [
        'Для тех, кому по-русски или по-грузински проще, чем по-английски, и для их взрослых детей, которые помогают родителям разобраться с Medicare.',
        'Письма Medicare, документы планов и формы для записи составлены на английском языке. Я могу объяснить их на вашем языке — не спеша и столько раз, сколько потребуется, прежде чем вы что-либо решите.',
      ],
    },
    {
      heading: 'Medicare за одну минуту',
      paragraphs: [
        'Medicare — это федеральная программа медицинского страхования для людей в возрасте 65 лет и старше, а также для некоторых более молодых людей с инвалидностью. Часть A (Part A) — больничная страховка. Часть B (Part B) — медицинская страховка: приёмы у врачей и амбулаторная помощь.',
        'Когда у вас есть Part A и Part B, получать страховое покрытие можно двумя основными способами. Первый — Original Medicare, к которой многие добавляют отдельный план на лекарства (Part D) и дополнительный полис Medicare Supplement (Medigap). Второй — план Medicare Advantage (Part C): частный план, который объединяет больничную и медицинскую страховку и часто покрытие лекарств.',
        'Ни один из способов не подходит всем. Это зависит от ваших врачей, лекарств, бюджета и округа, в котором вы живёте.',
      ],
      sources: ['partAB', 'joining', 'medigap'],
    },
    {
      heading: 'Когда записываться',
      paragraphs: [
        'Большинство людей впервые записываются примерно к своему 65-летию. Этот первый период длится 7 месяцев: он начинается за 3 месяца до месяца, в котором вам исполняется 65, и заканчивается через 3 месяца после него.',
        'Если в 65 лет вы ещё работаете и застрахованы по плану своего работодателя или работодателя супруга (супруги), возможно, вы можете подождать. Тогда записаться можно, пока действует эта страховка, или в течение 8 месяцев после окончания работы или страховки — в зависимости от того, что наступит раньше. COBRA и страховка для пенсионеров не считаются страховкой по текущей работе.',
        'Каждый год с 15 октября по 7 декабря люди с Medicare могут вступить в план Medicare Advantage или план на лекарства, сменить его или выйти из него; изменения вступают в силу с 1 января. С 1 января по 31 марта те, кто уже состоит в плане Medicare Advantage, могут один раз сменить план или вернуться в Original Medicare.',
        'Пропуск срока может означать несколько месяцев без страховки и штраф за позднюю запись, который действует всё время, пока у вас есть Part B. Если вы не уверены, какой период относится к вам, спросите до того, как срок пройдёт.',
      ],
      sources: ['whenStart', 'joining'],
    },
    {
      heading: 'Если вы работали в США меньше 10 лет',
      paragraphs: [
        'Этот вопрос часто возникает в семьях иммигрантов. Большинство людей не платят ежемесячный взнос за Part A, потому что они сами или их супруг (супруга) платили налог Medicare во время работы примерно 10 лет.',
        'По правилам, которые публикует CMS, человек без такого трудового стажа всё же может записаться в Part B и купить Part A, если ему 65 лет или больше, он живёт в США и является гражданином США или законным постоянным жителем, который непрерывно проживал в стране в течение 5 лет перед подачей заявления.',
        'Имеете ли вы право на программу и сколько будете платить, решает Social Security. Я не могу решить это за вас, но могу объяснить правило и подсказать, что у них спросить.',
      ],
      sources: ['partAB'],
    },
    {
      heading: 'Помощь в оплате расходов на Medicare',
      paragraphs: [
        'Люди с ограниченным доходом и сбережениями могут получить помощь по программам двух видов. Medicare Savings Programs — программы штатов, которые могут оплачивать взнос за Part B, а иногда и другие расходы. Extra Help — федеральная программа, которая снижает расходы на страховое покрытие рецептурных лекарств.',
        'Подать заявление на обе программы можно одновременно. В Нью-Джерси одно заявление, NJSave, охватывает и Medicare Savings Programs, и собственные программы штата по помощи с лекарствами. Имеете ли вы право на помощь, решает ваш штат.',
      ],
      sources: ['drugCosts', 'njsave', 'costsRussian'],
    },
    {
      heading: 'Ваше право на переводчика',
      paragraphs: [
        'Вам не обязательно полагаться только на меня или на члена семьи. Сама программа Medicare бесплатно предоставляет переводчиков: позвоните по номеру 1-800-MEDICARE (1-800-633-4227) и попросите переводчика на ваш язык. Линия работает круглосуточно, 7 дней в неделю, кроме некоторых федеральных праздников. Пользователи TTY могут звонить по номеру 1-877-486-2048.',
        'В Нью-Джерси также можно бесплатно получить консультацию по Medicare через Государственную программу помощи по медицинскому страхованию (SHIP).',
      ],
      sources: ['languages', 'njsave'],
    },
    {
      heading: 'Как я работаю',
      paragraphs: [
        'Мы начинаем с разговора на выбранном вами языке: ваши врачи, ваши лекарства, ваш почтовый индекс и то, что у вас есть сейчас. Эта часть — информационная, и на ней можно остановиться.',
        'Прежде чем мы будем обсуждать конкретные планы, правила Medicare требуют, чтобы вы подтвердили, о чём пойдёт речь (Scope of Appointment), и такой разговор ведётся по записываемой телефонной линии. Оба правила существуют для вашей защиты.',
        'Я независимый брокер, то есть у меня контракты с несколькими страховыми компаниями, а не с одной. Я предлагаю не все планы, доступные в вашем регионе, и скажу вам, если правильный ответ — оставить то, что у вас есть.',
      ],
    },
  ],
  faqHeading: 'Частые вопросы',
  faq: [
    {
      question: 'Берёте ли вы плату за помощь?',
      answer:
        'Нет. Разговор со мной бесплатен и ни к чему вас не обязывает. Если вы запишетесь в план через меня, комиссию мне платит страховая компания.',
    },
    {
      question: 'Можете ли вы помочь моему родителю, который не говорит по-английски?',
      answer:
        'Да, на русском или грузинском языке. Ваш родитель должен участвовать в разговоре и согласиться на то, чтобы с ним связались, потому что и страховка, и решение — его. Вы можете присоединиться к звонку.',
    },
    {
      question: 'Есть ли официальные материалы Medicare на русском или грузинском языке?',
      answer:
        'Medicare публикует некоторые брошюры на русском и других языках. Для любого языка, включая грузинский, можно позвонить по номеру 1-800-MEDICARE и бесплатно попросить переводчика.',
    },
    {
      question: 'Где вы работаете?',
      answer:
        'Я живу в Эджуотере (Edgewater), штат Нью-Джерси. В основном работаю с жителями округов Берген и Хадсон, Нью-Йорка (включая Бруклин и Квинс) и Филадельфии — по телефону или видеосвязи, а на севере Нью-Джерси и лично.',
    },
  ],
  formHeading: 'Задайте мне вопрос',
  formIntro: 'Пишите на русском, грузинском или английском. Я сам читаю каждое сообщение.',
  sourcesHeading: 'Источники',
  sourcesNote: 'Официальные страницы, на которых основаны эти объяснения. Все на английском языке, если не указано иное.',
  reviewedLine: 'Проверено 15 ноября 2026 г. Эрекле Ниниашвили, лицензированный страховой брокер.',
  translationNotice:
    'Эта страница — перевод для вашего удобства. Если перевод и английская версия расходятся, действует английская версия.',
  disclaimerHeading: 'Важная информация',
  disclaimerCounted:
    'Aegis Sage не связана с правительством США или федеральной программой Medicare и не одобрена ими. Мы предлагаем не все планы, доступные в вашем регионе. Число организаций, которые мы представляем в настоящее время: {org}. Число продуктов, которые они предлагают в вашем регионе: {products}. Чтобы получить информацию обо всех ваших вариантах, обратитесь на сайт Medicare.gov или позвоните по номеру 1-800-MEDICARE (TTY 1-877-486-2048).',
  disclaimerGeneric:
    'Aegis Sage не связана с правительством США или федеральной программой Medicare и не одобрена ими. Мы предлагаем не все планы, доступные в вашем регионе. Любая информация, которую мы предоставляем, ограничена теми планами, которые мы предлагаем в вашем регионе. Чтобы получить информацию обо всех ваших вариантах, обратитесь на сайт Medicare.gov или позвоните по номеру 1-800-MEDICARE (TTY 1-877-486-2048).',
  disclaimerEnglishNote:
    'Это перевод уведомления на английском языке, которое приведено ниже, в конце страницы. Официальным является английский текст.',
  otherLanguages: 'Эта страница на других языках',
  languageNames,
};

export const LANGUAGE_PAGES: Record<PageLocale, LanguagePage> = { en, ka, ru };

/** Locales that may be advertised to search engines and linked sitewide. */
export function publishedLocales(): PageLocale[] {
  return (Object.keys(TRANSLATION_REVIEW) as PageLocale[]).filter(
    (locale) => TRANSLATION_REVIEW[locale].reviewed,
  );
}
