import React, { useState } from "react";
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

const ThreeTieBreak = ({
  scores,
  resetScores,
  setScores,
  myName,
  opponentName,
}: Props) => {
  const { t } = useTranslation();

  const [tieBreakMode, setTieBreakMode] = useState<{
    myScore: number | null;
  }>({
    myScore: null,
  });

  const isScoreSelected =
    scores.myScore.some((score) => score !== null && score !== undefined) ||
    scores.opponentScore.some((score) => score !== null && score !== undefined);

  const getScoreOptions = (
    otherScore: string | number | null,
    setIndex: number,
    opponent?: boolean,
    OpponentValidateOnly?: boolean
  ): (string | number)[] => {
    const baseOptions = ["-", "wo"];
    const options: (string | number)[] = [];

    if (setIndex === 2 && !opponent && !tieBreakMode.myScore) {
      options.push(...Array.from({ length: 21 }, (_, i) => i));
      options.push("custom score value");
      return [...baseOptions, ...options];
    }

    if (otherScore === null || otherScore === "" || OpponentValidateOnly) {
      return [
        ...baseOptions,
        ...Array.from({ length: setIndex === 2 ? 21 : 8 }, (_, i) => i),
      ];
    }

    if (otherScore === "-") return ["wo"];
    if (otherScore === "wo") return ["-"];

    const parsedScore = Number(otherScore);
    const isTieBreak = setIndex === 2;

    if (isNaN(parsedScore)) {
      return [
        ...baseOptions,
        ...Array.from({ length: setIndex === 2 ? 21 : 8 }, (_, i) => i),
      ];
    }

    if (isTieBreak) {
      // Special case: If I have 10, opponent can have 0-8 or 12
      if (parsedScore === 10) {
        options.push(...Array.from({ length: 9 }, (_, i) => i)); // 0-8
        options.push(12);
      } else if (parsedScore <= 8) {
        options.push(10);
      } else if (parsedScore === 9) {
        options.push(11);
      } else {
        options.push(parsedScore - 2, parsedScore + 2);
      }
    } else {
      if (parsedScore >= 0 && parsedScore <= 4) {
        options.push(6);
      } else if (parsedScore === 5) {
        options.push(7);
      } else if (parsedScore === 6) {
        options.push(0, 1, 2, 3, 4, 7);
      } else if (parsedScore === 7) {
        options.push(5, 6);
      }
    }

    return options;
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

    const isTieBreak = setIndex === 2;
    const opponentField = field === "myScore" ? "opponentScore" : "myScore";

    setScores((prevScores) => {
      const newScores = { ...prevScores };
      newScores[field] = [...newScores[field]];
      newScores[opponentField] = [...newScores[opponentField]];

      newScores[field][setIndex] = score;

      // Auto-fill for Tie Break 10
      if (isTieBreak && typeof score === "number") {
        let opponentScore: number | string | null = null;

        if (score <= 8) {
          opponentScore = 10;
        } else if (score === 9) {
          opponentScore = 11;
        } else {
          opponentScore = score + 2;
        }

        newScores[opponentField][setIndex] = opponentScore;
      }

      // Auto-fill for normal sets
      if (!isTieBreak && typeof score === "number") {
        let opponentScore: number | string | null = null;

        if (score >= 0 && score <= 4) {
          opponentScore = 6;
        } else if (score === 5) {
          opponentScore = 7;
        } else if (score === 6) {
          // Don't auto-fill because opponent could be 0-4 or 7
          // But clear invalid values like 5 or 6
          const existing = newScores[opponentField][setIndex];
          if (existing === 5 || existing === 6) {
            opponentScore = null;
            newScores[opponentField][setIndex] = opponentScore;
          }
        } else if (score === 7) {
          opponentScore = 5;
        }

        if (opponentScore !== null && score !== 6) {
          newScores[opponentField][setIndex] = opponentScore;
        }
      }

      // Mirror 'wo' and '-' entries
      if (score === "wo") {
        newScores[opponentField][setIndex] = "-";
      } else if (score === "-") {
        newScores[opponentField][setIndex] = "wo";
      }

      return newScores;
    });
  };

  return (
    <section className="space-y-2">
      {[0, 1, 2].map((setIndex) => {
        const myScoreValue = scores.myScore[setIndex];
        const opponentScoreValue = scores.opponentScore[setIndex];

        return (
          <div className="flex gap-4" key={setIndex}>
            {/* Player Score */}
            <label className="block">
              <span className="text-sm mr-2">{`Set ${setIndex + 1} (${
                myName ? myName : t("You")
              })`}</span>
              {tieBreakMode.myScore === setIndex ||
              (typeof myScoreValue === "string" &&
                /^\d{1,3}$/.test(myScoreValue)) ? (
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={
                    myScoreValue === null || myScoreValue === undefined
                      ? ""
                      : String(myScoreValue)
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,3}$/.test(value)) {
                      handleScoreChange(setIndex, "myScore", value);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      setTieBreakMode((prev) => ({
                        ...prev,
                        myScore: null,
                      }));
                    }
                  }}
                  className="border px-1 py-2 rounded w-24 text-gray-900"
                  placeholder="0–999"
                />
              ) : (
                <select
                  value={
                    myScoreValue === null || myScoreValue === undefined
                      ? ""
                      : String(myScoreValue)
                  }
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected === "custom score value") {
                      setTieBreakMode((prev) => ({
                        ...prev,
                        myScore: setIndex,
                      }));
                      return;
                    }
                    handleScoreChange(setIndex, "myScore", selected);
                  }}
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
                  {[
                    "-",
                    "wo",
                    ...Array.from(
                      { length: setIndex === 2 ? 21 : 8 },
                      (_, i) => i
                    ),
                  ].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
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
                onChange={(e) => {
                  const selected = e.target.value;
                  if (selected === "custom score value") {
                    setTieBreakMode((prev) => ({
                      ...prev,
                      opponentScore: setIndex,
                    }));
                    return;
                  }
                  if (/^\d{1,3}$/.test(selected)) {
                    setTieBreakMode((prev) => ({
                      ...prev,
                      opponentScore: setIndex,
                    }));
                    handleScoreChange(setIndex, "opponentScore", selected);
                    return;
                  }
                  handleScoreChange(setIndex, "opponentScore", selected);
                }}
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
                {getScoreOptions(myScoreValue, setIndex, true).map((opt) => (
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
          onClick={() => {
            setTieBreakMode({ myScore: null });
            resetScores();
          }}
          className="mt-4 bg-brand-secondary rounded-lg active:animate-jerk px-4 h-[30px] font-primary text-sm flex justify-center items-center gap-2"
        >
          {t("Reset Scores")}
        </button>
      )}
    </section>
  );
};

export default ThreeTieBreak;
