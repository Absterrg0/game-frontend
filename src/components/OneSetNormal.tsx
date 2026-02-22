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

const OneSetNormal = ({
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

    return options;
  };

  const myScoreValue = scores.myScore[0];
  const opponentScoreValue = scores.opponentScore[0];

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
      const newScores = { ...prevScores };
      newScores[field] = [...newScores[field]];
      newScores[opponentField] = [...newScores[opponentField]];

      newScores[field][0] = score;

      const opponentValue = newScores[opponentField][0];

      // Auto-correct logic for a single normal set
      if (typeof score === "number") {
        if (score >= 0 && score <= 4) {
          newScores[opponentField][0] = 6;
        } else if (score === 5) {
          newScores[opponentField][0] = 7;
        } else if (score === 6) {
          if (opponentValue === 5 || opponentValue === 6) {
            newScores[opponentField][0] = null;
          }
        } else if (score === 7) {
          newScores[opponentField][0] = 5;
        }
      }

      // Mirror wo / -
      if (score === "wo") {
        newScores[opponentField][0] = "-";
      } else if (score === "-") {
        newScores[opponentField][0] = "wo";
      }

      return newScores;
    });
  };

  return (
    <section className="space-y-2">
      <div className="flex gap-4">
        {/* Player Score */}
        <label className="block">
          <span className="text-sm mr-2">
            Set 1 ({myName ? myName : t("You")})
          </span>
          <select
            value={
              myScoreValue === null || myScoreValue === undefined
                ? ""
                : String(myScoreValue)
            }
            onChange={(e) => handleScoreChange(0, "myScore", e.target.value)}
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
          <span className="text-sm mr-2">
            Set 1 ({opponentName ? opponentName : "Opponent"})
          </span>
          <select
            value={
              opponentScoreValue === null || opponentScoreValue === undefined
                ? ""
                : String(opponentScoreValue)
            }
            onChange={(e) =>
              handleScoreChange(0, "opponentScore", e.target.value)
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

export default OneSetNormal;
