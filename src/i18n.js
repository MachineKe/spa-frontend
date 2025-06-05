import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome to Fellas Spa & Barbershop",
      bookNow: "Book Now",
      about: "About Us",
      services: "Services",
      team: "Meet the Team",
      gallery: "Gallery",
      contact: "Contact",
      // ...add more keys as needed
    },
  },
  sw: {
    translation: {
      welcome: "Karibu Fellas Spa & Barbershop",
      bookNow: "Weka Nafasi",
      about: "Kuhusu Sisi",
      services: "Huduma",
      team: "Timu Yetu",
      gallery: "Picha",
      contact: "Mawasiliano",
      // ...add more keys as needed
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
