import i18next from "i18next";
import ICU from "i18next-icu";
import { loadMarkdownTemplatesForLang } from "./utils";
import en from "../../lang/en.json";
import he from "../../lang/he.json";
import fr from "../../lang/fr.json";
import env from "./env";

/**
 * merge all markdown templates with the translations for each language
 */
const resources = {
  en: { translation: { ...loadMarkdownTemplatesForLang("en"), ...en } },
  he: { translation: { ...loadMarkdownTemplatesForLang("he"), ...he } },
  fr: { translation: { ...loadMarkdownTemplatesForLang("fr"), ...fr } },
};

/**
 * Initialize i18next with ICU support and the loaded resources
 */
i18next.use(ICU).init({
  lng: env.LANGUAGE,
  fallbackLng: "en",
  resources,
  interpolation: { escapeValue: false },
});

export default i18next;
