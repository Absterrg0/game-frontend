import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  scores: {
    myScore: (string | number | null)[];
    opponentScore: (string | number | null)[];
  };
  resetScores: () => void;
  setScores: React.Dispatch<
    React.SetStateAction<{
      myScore: (string | number | null)[];
      opponentScore: (string | number | null)[];
    }>
  >;
  myName?: string;
  opponentName?: string;
};

const FiveSetNormal = ({
  scores,
  setScores,
  resetScores,
  myName,
  opponentName,
}: Props) => {
  const { t } = useTranslation();

  const isScoreSelected =
    scores.myScore.some((score) => score !== null && score !== undefined) ||
    scores.opponentScore.some((score) => score !== null && score !== undefined);

  const getScoreOptions = (
    otherScore: string | number | null
  ): (string | number)[] => {
    const baseOptions = ["-", "wo"];
    const options: (string | number)[] = [];

    if (otherScore === null || otherScore === "") {
      return [...baseOptions, ...Array.from({ length: 8 }, (_, i) => i)];
    }

    if (otherScore === "-") return ["wo"];
    if (otherScore === "wo") return ["-"];

    const parsedScore = Number(otherScore);
    if (isNaN(parsedScore)) {
      return [...baseOptions, ...Array.from({ length: 8 }, (_, i) => i)];
    }

    if (parsedScore >= 0 && parsedScore <= 4) {
      options.push(6);
    } else if (parsedScore === 5) {
      options.push(7);
    } else if (parsedScore === 6) {
      options.push(0, 1, 2, 3, 4, 7);
    } else if (parsedScore === 7) {
      options.push(5, 6);
    }

    return [...options];
  };

  const handleScoreChange = (
    setIndex: number,
    field: "myScore" | "opponentScore",
    value: string
  ) => {
    let score: string | number | null;

    if (value === "wo" || value === "-") {
      score = value;
    } else if (value === "") {
      score = null;
    } else {
      const parsed = Number(value);
      if (isNaN(parsed)) return;
      score = parsed;
    }

    const opponentField = field === "myScore" ? "opponentScore" : "myScore";

    setScores((prevScores) => {
      const newScores = {
        myScore: [...prevScores.myScore],
        opponentScore: [...prevScores.opponentScore],
      };

      newScores[field][setIndex] = score;

      // Mirror "wo" and "-"
      if (score === "wo") {
        newScores[opponentField][setIndex] = "-";
        return newScores;
      } else if (score === "-") {
        newScores[opponentField][setIndex] = "wo";
        return newScores;
      }

      // Handle numeric score logic for normal set
      if (typeof score === "number") {
        let autoOpponentScore: number | null = null;
        const otherScore = newScores[opponentField][setIndex];

        if (score >= 0 && score <= 4) {
          autoOpponentScore = 6;
        } else if (score === 5) {
          autoOpponentScore = 7;
        } else if (score === 6) {
          if (otherScore === 5 || otherScore === 6) {
            autoOpponentScore = null;
          }
        } else if (score === 7) {
          autoOpponentScore = 5;
        }

        // Update opponent field only if logic allows it
        if (autoOpponentScore !== null && score !== 6) {
          newScores[opponentField][setIndex] = autoOpponentScore;
        } else if (score === 6 && (otherScore === 5 || otherScore === 6)) {
          newScores[opponentField][setIndex] = null;
        }
      }

      return newScores;
    });
  };

  return (
    <section className="space-y-2">
      {[0, 1, 2, 3, 4].map((setIndex) => {
        const myScoreValue = scores.myScore[setIndex];
        const opponentScoreValue = scores.opponentScore[setIndex];

        return (
          <div className="flex gap-4" key={setIndex}>
            {/* Player Score */}
            <label className="block">
              <span className="text-sm mr-2">{`Set ${setIndex + 1} (${
                myName ? myName : t("You")
              })`}</span>
              <select
                value={
                  myScoreValue === null || myScoreValue === undefined
                    ? ""
                    : String(myScoreValue)
                }
                onChange={(e) =>
                  handleScoreChange(setIndex, "myScore", e.target.value)
                }
                className={`border px-1 py-2 rounded w-24 ${
                  myScoreValue === null ||
                  myScoreValue === undefined ||
                  myScoreValue === ""
                    ? "text-gray-300"
                    : "text-gray-900"
                }`}
              >
                <option disabled value="">
                  {t("score")}
                </option>
                {["-", "wo", ...Array.from({ length: 8 }, (_, i) => i)].map(
                  (opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  )
                )}
              </select>
            </label>

            {/* Opponent Score */}
            <label className="block">
              <span className="text-sm mr-2">{`Set ${setIndex + 1} (${
                opponentName ? opponentName : t("Opponent")
              })`}</span>
              <select
                value={
                  opponentScoreValue === null ||
                  opponentScoreValue === undefined
                    ? ""
                    : String(opponentScoreValue)
                }
                onChange={(e) =>
                  handleScoreChange(setIndex, "opponentScore", e.target.value)
                }
                className={`border px-1 py-2 rounded w-24 ${
                  opponentScoreValue === null ||
                  opponentScoreValue === undefined ||
                  opponentScoreValue === ""
                    ? "text-gray-300"
                    : "text-gray-900"
                }`}
              >
                <option disabled value="">
                  {t("score")}
                </option>
                {getScoreOptions(myScoreValue).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>
        );
      })}

      {isScoreSelected && (
        <button
          type="button"
          onClick={resetScores}
          className="mt-4 bg-brand-secondary rounded-lg active:animate-jerk px-4 h-[30px] font-primary text-sm flex justify-center items-center gap-2"
        >
          {t("Reset Scores")}
        </button>
      )}
    </section>
  );
};

export default FiveSetNormal;
