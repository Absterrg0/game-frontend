import React, { Fragment } from "react";
import Navigation from "../components/shared/Navigation";
import { useTranslation } from "react-i18next";

type Props = {};

const About = (props: Props) => {
  const { t } = useTranslation();
  return (
    <Fragment>
      <Navigation />
      <section className="w-full container md:py-8 py-6 max-w-[1000px] rounded-lg overflow-hidden shadow-table border border-tableBorder my-8">
        <h1 className="text-brand-primary md:text-[36px] text-2xl font-primary font-semibold capitalize mb-4">
          {t("about")}
        </h1>

        <h2 className="text-xl font-semibold mb-2">
          {t("TB10 allows you to")}
        </h2>

        <ul className="list-disc pl-5 mb-4">
          <li>{t("Find and participate in tournaments")}</li>
          <li>{t("Record your scores")}</li>
          <li>{t("Organise tournaments")}</li>
          <li>{t("Schedule games according to player skill level")}</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">{t("How to use TB10")}</h2>

        <ul className="list-disc pl-5 mb-4">
          <li>{t("Sign in using Google or Apple ID")}</li>
          <li>{t("Find or add your club under “Clubs” in Settings")}</li>
          <li>
            {t(
              "Add your club as “Home Club” (now tournaments can be filtered on distance from your home club)"
            )}
          </li>
          <li>{t("You become administrator of clubs you add")}</li>
          <li>
            {t("Only the administrator can organise tournaments for your club")}
          </li>
          <li>
            {t("You can change or add administrators for your club by")}{" "}
            <a className="font-bold text-brand-primary" href="mailto:service.tb10@gmail.com">
              {t("contacting us")}
            </a>
            .
          </li>
        </ul>

        <h2 className="text-xl font-semibold mb-2">
          {t("Player skill level (Glicko-2)")}
        </h2>

        <ul className="list-disc pl-5">
          <li>{t("Player skill level text")}</li>
        </ul>
        <p className="mt-1">
          {t(
            "1: Glicko-2 was developed by MARK E. GLICKMAN Senior Lecturer on Statistics at Harvard University"
          )}
        </p>
        <p className="mt-1">
          {t(
            "2: Developed by Arpad Elo, a Hungarian-American physics professor."
          )}
        </p>
        <p className="mt-1 italic">
          <a href="https://datascience.harvard.edu/directory/mark-glickman/">
            https://datascience.harvard.edu/directory/mark-glickman/
          </a>
        </p>
        <p className="mt-1 italic">
          <a href="https://de.wikipedia.org/wiki/Glicko-System#Schritt_1">
            https://de.wikipedia.org/wiki/Glicko-System#Schritt_1
          </a>
        </p>
      </section>
    </Fragment>
  );
};

export default About;
