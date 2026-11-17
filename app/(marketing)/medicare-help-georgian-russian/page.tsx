import {
  LanguageHelpPage,
  languagePageMetadata,
} from '@/components/marketing/language-help-page';

export const metadata = languagePageMetadata('en');

export default function Page() {
  return <LanguageHelpPage locale="en" />;
}
