/**
 * Every visitor-facing string in <ContactForm />, per language.
 *
 * ── Rules for this file ───────────────────────────────────────────────────
 *  1. `en` is the form as it has always read. Do not "improve" it here; a
 *     change to consent wording is a new consent text version (lib/consent.ts)
 *     and needs Erekle's sign-off.
 *  2. `ka` and `ru` are translations of the same form. They add nothing and
 *     promise nothing the English does not.
 *  3. The consent sentence in `ka` and `ru` is shown TOGETHER WITH its English
 *     original (`consentEnglish`), so the record of what was agreed to can be
 *     read by someone who does not read that language.
 *  4. Topic VALUES stay English: they are the enum the API validates and the
 *     lead scorer keys on. Only the labels are translated.
 *  5. Translation status lives in lib/language-pages.ts (`reviewed`). Until a
 *     fluent reviewer signs off, the page using these strings is noindex.
 */

import { CONTACT_TOPICS } from './validations/contact';

export type FormLocale = 'en' | 'ka' | 'ru';

type Topic = (typeof CONTACT_TOPICS)[number];

export type FormStrings = {
  skipForm: string;
  actions: { call: string; book: string; text: string; email: string };
  optional: string;
  name: string;
  contactLegend: string;
  callMe: string;
  textMe: string;
  emailMe: string;
  phone: string;
  phoneHint: string;
  email: string;
  zip: string;
  zipHint: string;
  topic: string;
  topicPlaceholder: string;
  topics: Record<Topic, string>;
  message: string;
  messageHint: string;
  consent: string;
  /** English original of `consent`, shown under it on translated forms. */
  consentEnglish?: string;
  optionalPermissions: string;
  consentSms: string;
  consentSmsDetail: string;
  consentMarketing: string;
  consentDetail: string;
  privacyLead: string;
  privacyBody: string;
  privacyPromise: string;
  privacyDelete: string;
  privacyLinkBefore: string;
  privacyLink: string;
  privacyLinkAfter: string;
  compareBefore: string;
  compareOr: string;
  submit: string;
  sending: string;
  errorFallback: string;
  errorTail: string;
  successHeading: string;
  successBody: string;
  successUrgent: string;
  /** Localized text for each validation message the schema can emit. */
  errors: Record<string, string>;
};

const NAME = 'Erekle Niniashvili';
const BRAND = 'Aegis Sage';
const PHONE = '(551) 202-9079';

const CONSENT_ENGLISH_FULL =
  `Yes, ${NAME} of ${BRAND} may contact me about Medicare insurance options using the ` +
  'phone number or email address I provided, including by text message.';

const en: FormStrings = {
  skipForm: 'Rather skip the form?',
  actions: { call: `Call ${PHONE}`, book: 'Book a Time', text: 'Text Erekle', email: 'Email Erekle' },
  optional: 'optional',
  name: 'Your name',
  contactLegend: 'How should I get back to you?',
  callMe: 'Call me',
  textMe: 'Text me',
  emailMe: 'Email me',
  phone: 'Phone number',
  phoneHint: 'Digits only is fine.',
  email: 'Email address',
  zip: 'ZIP code',
  zipHint: 'Plan availability is decided county by county — this is how I look yours up.',
  topic: 'What is going on?',
  topicPlaceholder: 'Pick the closest one',
  topics: {
    'I am turning 65 soon': 'I am turning 65 soon',
    'I am losing employer coverage': 'I am losing employer coverage',
    'I want to review my current coverage': 'I want to review my current coverage',
    'I am helping a parent or relative': 'I am helping a parent or relative',
    'Something else': 'Something else',
  },
  message: 'Anything you want me to know',
  messageHint:
    'Optional. Doctors you want to keep, a letter you got, a deadline you are worried about.',
  consent:
    'Yes, Erekle may contact me about Medicare insurance options using the phone number or ' +
    'email address I provided, including by text message.',
  optionalPermissions: 'Optional — you can leave these unchecked',
  consentSms: 'You may send me text messages, including automated ones.',
  consentSmsDetail:
    `From ${NAME} at ${BRAND}. Message frequency varies. Message and data rates may apply. ` +
    'Reply STOP to opt out or HELP for help at any time. You do not have to agree to this to get a reply.',
  consentMarketing: 'You may email me occasional Medicare deadline reminders and new guides.',
  consentDetail:
    'Submitting this form is a request for information, not an application, and it does not ' +
    'enroll you in anything. There is no cost or obligation.',
  privacyLead: 'Where this goes.',
  privacyBody:
    'Your request is stored securely and added to Erekle’s own follow-up list, so it is ' +
    'tracked instead of getting lost in an inbox. It is used only to answer you and to keep a ' +
    'record of that conversation. Only Erekle sees it, along with the services that store the ' +
    'data and send his replies.',
  privacyPromise:
    'I do not sell your information, and I do not share it with other agents, agencies or lead buyers.',
  privacyDelete: 'You can ask me to delete it at any time.',
  privacyLinkBefore: 'See the',
  privacyLink: 'privacy notice',
  privacyLinkAfter: 'for the details.',
  compareBefore: 'You can always compare every option available to you at',
  compareOr: 'or by calling',
  submit: 'Send this to Erekle',
  sending: 'Sending…',
  errorFallback: 'Something went wrong on my end.',
  errorTail:
    'Do not let my website be the reason you do not get an answer — call or text me at',
  successHeading: 'Got it — thank you.',
  successBody:
    'Your message has been saved and sent to Erekle. He reads and answers these himself — ' +
    'there is no assistant and no auto-reply, so it comes back from him.',
  successUrgent:
    'If it is time-sensitive, please do not wait on the form. Calling or texting is the fastest way to reach him.',
  errors: {},
};

const ka: FormStrings = {
  skipForm: 'გირჩევნიათ ფორმის გარეშე?',
  actions: {
    call: `დარეკეთ ${PHONE}`,
    book: 'დროის დაჯავშნა',
    text: 'მისწერეთ ერეკლეს',
    email: 'ელფოსტა ერეკლეს',
  },
  optional: 'არასავალდებულო',
  name: 'თქვენი სახელი',
  contactLegend: 'როგორ დაგიკავშირდეთ?',
  callMe: 'დამირეკეთ',
  textMe: 'მომწერეთ',
  emailMe: 'ელფოსტით',
  phone: 'ტელეფონის ნომერი',
  phoneHint: 'მხოლოდ ციფრებიც საკმარისია.',
  email: 'ელფოსტის მისამართი',
  zip: 'საფოსტო ინდექსი (ZIP)',
  zipHint:
    'გეგმების ხელმისაწვდომობა ოლქის (county) მიხედვით განისაზღვრება — ინდექსით ვნახავ, რა არის თქვენს ოლქში.',
  topic: 'რა ვითარებაა?',
  topicPlaceholder: 'აირჩიეთ ყველაზე ახლოს მდგომი',
  topics: {
    'I am turning 65 soon': 'მალე 65 წლის ვხდები',
    'I am losing employer coverage': 'ვკარგავ დამსაქმებლის დაზღვევას',
    'I want to review my current coverage': 'მინდა გადავხედო ჩემს ამჟამინდელ დაზღვევას',
    'I am helping a parent or relative': 'ვეხმარები მშობელს ან ნათესავს',
    'Something else': 'სხვა საკითხი',
  },
  message: 'რაც გსურთ, რომ ვიცოდე',
  messageHint:
    'არასავალდებულო. ექიმები, რომელთა შენარჩუნებაც გინდათ, მიღებული წერილი, ვადა, რომელიც გაწუხებთ.',
  consent:
    `დიახ, ერეკლე ნინიაშვილს (${BRAND}) შეუძლია დამიკავშირდეს Medicare-ის სადაზღვევო ` +
    'ვარიანტებთან დაკავშირებით ჩემ მიერ მითითებულ ტელეფონის ნომერზე ან ელფოსტის მისამართზე, ' +
    'მათ შორის ტექსტური შეტყობინებით.',
  consentEnglish: CONSENT_ENGLISH_FULL,
  optionalPermissions: 'არასავალდებულო — შეგიძლიათ მოუნიშნავი დატოვოთ',
  consentSms: 'შეგიძლიათ გამომიგზავნოთ ტექსტური შეტყობინებები, მათ შორის ავტომატური.',
  consentSmsDetail:
    `გამგზავნი: ${NAME}, ${BRAND}. შეტყობინებების სიხშირე ცვალებადია. შესაძლოა მოქმედებდეს ` +
    'შეტყობინებისა და ინტერნეტის ტარიფები. გასაუქმებლად უპასუხეთ STOP, დახმარებისთვის — HELP. ' +
    'პასუხის მისაღებად ამაზე დათანხმება სავალდებულო არ არის.',
  consentMarketing:
    'შეგიძლიათ ელფოსტით დროდადრო გამომიგზავნოთ შეხსენებები Medicare-ის ვადებზე და ახალი სახელმძღვანელოები.',
  consentDetail:
    'ამ ფორმის გაგზავნა არის ინფორმაციის მოთხოვნა და არა განაცხადი; ის არსად გარეგისტრირებთ. ' +
    'არ არსებობს არც საფასური და არც ვალდებულება.',
  privacyLead: 'სად მიდის ეს ინფორმაცია.',
  privacyBody:
    'თქვენი მოთხოვნა უსაფრთხოდ ინახება და ემატება ერეკლეს პირად სიას, რათა არ დაიკარგოს. ' +
    'ის გამოიყენება მხოლოდ თქვენთვის პასუხის გასაცემად და ამ საუბრის ჩანაწერის შესანახად. ' +
    'მას ხედავს მხოლოდ ერეკლე და ის სერვისები, რომლებიც მონაცემებს ინახავენ და მის პასუხებს აგზავნიან.',
  privacyPromise:
    'თქვენს ინფორმაციას არ ვყიდი და არ ვუზიარებ სხვა აგენტებს, სააგენტოებს ან კონტაქტების მყიდველებს.',
  privacyDelete: 'ნებისმიერ დროს შეგიძლიათ მთხოვოთ მისი წაშლა.',
  privacyLinkBefore: 'დეტალებისთვის იხილეთ',
  privacyLink: 'კონფიდენციალურობის შეტყობინება (ინგლისურად)',
  privacyLinkAfter: '.',
  compareBefore: 'თქვენთვის ხელმისაწვდომი ყველა ვარიანტის შედარება ყოველთვის შეგიძლიათ აქ:',
  compareOr: 'ან ტელეფონით:',
  submit: 'გაუგზავნეთ ერეკლეს',
  sending: 'იგზავნება…',
  errorFallback: 'ჩემს მხარეს რაღაც შეფერხდა.',
  errorTail: 'ნუ დარჩებით პასუხის გარეშე ჩემი ვებგვერდის გამო — დამირეკეთ ან მომწერეთ:',
  successHeading: 'მივიღე — გმადლობთ.',
  successBody:
    'თქვენი შეტყობინება შენახულია და გაეგზავნა ერეკლეს. ის ამ შეტყობინებებს თავად კითხულობს ' +
    'და თავად პასუხობს — არ არსებობს არც ასისტენტი და არც ავტომატური პასუხი.',
  successUrgent:
    'თუ საქმე სასწრაფოა, ნუ დაელოდებით ფორმას. ყველაზე სწრაფი გზაა დარეკვა ან ტექსტური შეტყობინება.',
  errors: {
    'Please enter your name.': 'გთხოვთ, მიუთითოთ თქვენი სახელი.',
    'That name is too long.': 'სახელი ძალიან გრძელია.',
    'That email address is too long.': 'ელფოსტის მისამართი ძალიან გრძელია.',
    'Please enter a valid email address.': 'გთხოვთ, მიუთითოთ სწორი ელფოსტის მისამართი.',
    'Please enter a 10-digit phone number.': 'გთხოვთ, მიუთითოთ 10-ციფრიანი ტელეფონის ნომერი.',
    'Please enter a 5-digit ZIP code.': 'გთხოვთ, მიუთითოთ 5-ციფრიანი საფოსტო ინდექსი.',
    'Please keep this under 2000 characters.': 'გთხოვთ, არ გადააჭარბოთ 2000 სიმბოლოს.',
    'Please check the box so I know it is okay to contact you.':
      'გთხოვთ, მონიშნოთ ველი, რათა ვიცოდე, რომ შემიძლია დაგიკავშირდეთ.',
    'Please give me either an email address or a phone number so I can reach you.':
      'გთხოვთ, მიუთითოთ ელფოსტა ან ტელეფონის ნომერი, რათა შევძლო დაკავშირება.',
    'You chose email — please add your email address.':
      'თქვენ აირჩიეთ ელფოსტა — გთხოვთ, დაამატოთ ელფოსტის მისამართი.',
    'You chose phone or text — please add your phone number.':
      'თქვენ აირჩიეთ ზარი ან შეტყობინება — გთხოვთ, დაამატოთ ტელეფონის ნომერი.',
    'Something went wrong on my end.': 'ჩემს მხარეს რაღაც შეფერხდა.',
  },
};

const ru: FormStrings = {
  skipForm: 'Удобнее без формы?',
  actions: {
    call: `Позвонить ${PHONE}`,
    book: 'Записаться на звонок',
    text: 'Написать Эрекле',
    email: 'Эл. письмо Эрекле',
  },
  optional: 'необязательно',
  name: 'Ваше имя',
  contactLegend: 'Как с вами связаться?',
  callMe: 'Позвоните мне',
  textMe: 'Напишите мне',
  emailMe: 'По эл. почте',
  phone: 'Номер телефона',
  phoneHint: 'Можно только цифры.',
  email: 'Адрес электронной почты',
  zip: 'Почтовый индекс (ZIP)',
  zipHint:
    'Доступные планы зависят от округа (county) — по индексу я посмотрю, что есть в вашем.',
  topic: 'Какая у вас ситуация?',
  topicPlaceholder: 'Выберите наиболее близкий вариант',
  topics: {
    'I am turning 65 soon': 'Мне скоро исполнится 65',
    'I am losing employer coverage': 'Я теряю страховку от работодателя',
    'I want to review my current coverage': 'Хочу пересмотреть свою нынешнюю страховку',
    'I am helping a parent or relative': 'Помогаю родителю или родственнику',
    'Something else': 'Другое',
  },
  message: 'Что мне стоит знать',
  messageHint:
    'Необязательно. Врачи, которых вы хотите сохранить, полученное письмо, срок, который вас беспокоит.',
  consent:
    `Да, Эрекле Ниниашвили (${BRAND}) может связаться со мной по вопросам страховых планов ` +
    'Medicare по указанному мной номеру телефона или адресу электронной почты, в том числе ' +
    'с помощью текстовых сообщений.',
  consentEnglish: CONSENT_ENGLISH_FULL,
  optionalPermissions: 'Необязательно — можно не отмечать',
  consentSms: 'Вы можете присылать мне текстовые сообщения, в том числе автоматические.',
  consentSmsDetail:
    `Отправитель: ${NAME}, ${BRAND}. Частота сообщений может меняться. Может взиматься плата ` +
    'за сообщения и передачу данных. Ответьте STOP, чтобы отказаться, или HELP, чтобы получить ' +
    'помощь. Соглашаться на это необязательно, чтобы получить ответ.',
  consentMarketing:
    'Вы можете иногда присылать мне по электронной почте напоминания о сроках Medicare и новые материалы.',
  consentDetail:
    'Отправка этой формы — это запрос информации, а не заявление, и она никуда вас не ' +
    'записывает. Это бесплатно и ни к чему не обязывает.',
  privacyLead: 'Куда попадает эта информация.',
  privacyBody:
    'Ваш запрос надёжно хранится и добавляется в личный список Эрекле, чтобы он не потерялся. ' +
    'Он используется только для того, чтобы ответить вам и сохранить запись этого разговора. ' +
    'Его видит только Эрекле, а также сервисы, которые хранят данные и отправляют его ответы.',
  privacyPromise:
    'Я не продаю вашу информацию и не передаю её другим агентам, агентствам или покупателям контактов.',
  privacyDelete: 'Вы можете в любой момент попросить меня её удалить.',
  privacyLinkBefore: 'Подробнее —',
  privacyLink: 'уведомление о конфиденциальности (на английском)',
  privacyLinkAfter: '.',
  compareBefore: 'Сравнить все доступные вам варианты всегда можно на сайте',
  compareOr: 'или по телефону',
  submit: 'Отправить Эрекле',
  sending: 'Отправка…',
  errorFallback: 'Что-то пошло не так с моей стороны.',
  errorTail: 'Не оставайтесь без ответа из-за моего сайта — позвоните или напишите мне:',
  successHeading: 'Получил — спасибо.',
  successBody:
    'Ваше сообщение сохранено и отправлено Эрекле. Он сам читает такие сообщения и сам на них ' +
    'отвечает — без помощников и автоответов.',
  successUrgent:
    'Если вопрос срочный, не ждите ответа на форму. Быстрее всего — позвонить или написать сообщение.',
  errors: {
    'Please enter your name.': 'Пожалуйста, укажите ваше имя.',
    'That name is too long.': 'Имя слишком длинное.',
    'That email address is too long.': 'Адрес электронной почты слишком длинный.',
    'Please enter a valid email address.': 'Пожалуйста, укажите действительный адрес электронной почты.',
    'Please enter a 10-digit phone number.': 'Пожалуйста, укажите номер телефона из 10 цифр.',
    'Please enter a 5-digit ZIP code.': 'Пожалуйста, укажите почтовый индекс из 5 цифр.',
    'Please keep this under 2000 characters.': 'Пожалуйста, не более 2000 символов.',
    'Please check the box so I know it is okay to contact you.':
      'Пожалуйста, отметьте поле, чтобы я знал, что могу с вами связаться.',
    'Please give me either an email address or a phone number so I can reach you.':
      'Пожалуйста, укажите адрес электронной почты или номер телефона, чтобы я мог с вами связаться.',
    'You chose email — please add your email address.':
      'Вы выбрали электронную почту — пожалуйста, укажите адрес.',
    'You chose phone or text — please add your phone number.':
      'Вы выбрали звонок или сообщение — пожалуйста, укажите номер телефона.',
    'Something went wrong on my end.': 'Что-то пошло не так с моей стороны.',
  },
};

export const FORM_STRINGS: Record<FormLocale, FormStrings> = { en, ka, ru };

/** Translate a validation or server message; unknown messages pass through. */
export function localizeError(
  strings: FormStrings,
  message: string | undefined,
): string | undefined {
  if (!message) return message;
  return strings.errors[message] ?? message;
}
