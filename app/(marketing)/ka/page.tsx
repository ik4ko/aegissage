import {
  LanguageHelpPage,
  languagePageMetadata,
} from '@/components/marketing/language-help-page';

export const metadata = languagePageMetadata('ka');

export default function Page() {
  return <LanguageHelpPage locale="ka" />;
}
