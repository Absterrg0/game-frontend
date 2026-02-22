/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/shared/Navigation";
import { Field, Label } from "@headlessui/react";
import api from "../lib/axios";
import QRCode from "react-qr-code";
import CustomSelect from "../components/shared/Select";
import ThreeTieBreak from "../components/ThreeTieBreak";
import OneSetNormal from "../components/OneSetNormal";
import ThreeSetNormal from "../components/ThreeSetNormal";
import FiveSetNormal from "../components/FiveSetNormal";
import TieBreak10OnlySet from "../components/TieBreak10OnlySet";
import { IoMdArrowRoundBack } from "react-icons/io";

function base64UrlDecode(base64Url: string): string {
  base64Url = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(base64Url);
  return decoded;
}

export function getHmacKeyFromToken(token: string): string {
  try {
    const [header, payload, signature] = token.split(".");
    if (!payload) {
      throw new Error("Invalid token: No payload found");
    }
    const decodedPayload = base64UrlDecode(payload);
    const parsedPayload = JSON.parse(decodedPayload);

    // Assuming the payload contains 'userId' as the hmacKey
    return parsedPayload.userId || "";
  } catch (error) {
    console.error("Error decoding token:", error);
    return ""; // Return null if there's an error
  }
}

const AddScore = () => {
  const { t } = useTranslation();
  const session = Cookies.get("session_key");
  const hmacKey = getHmacKeyFromToken(session);
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState<string>("");
  const [inputs, setInputs] = useState<{
    tournament: { value: string; label: string } | null;
    myScore: string | undefined;
    opponentScore: string | undefined;
  }>({
    tournament: null,
    myScore: undefined,
    opponentScore: undefined,
  });
  const [tournaments, setTournaments] = useState<any>([]);
  const [selectedTournament, setSelectedTournament] = useState<any>({});
  const [scores, setScores] = useState<{
    myScore: (string | number | null)[];
    opponentScore: (string | number | null)[];
  }>({
    myScore: [],
    opponentScore: [],
  });

  // When a tournament is selected, reset the scores
  useEffect(() => {
    if (selectedTournament?.playMode) {
      setScores({
        myScore: [], // Use null for unselected scores
        opponentScore: [],
      });
    }
  }, [selectedTournament]);

  const getUserParticipatedTournaments = async () => {
    try {
      const response = await api.get(
        `/api/v1/user/get-user-participated-tournaments`
      );
      if (response?.status === 200) {
        setTournaments(response?.data?.tournaments);
      }
    } catch (error: any) {
      console.log(
        error?.response?.data?.message || error?.response?.data?.messages?.[0]
      );
    }
  };

  useEffect(() => {
    if (!session) navigate("/auth/login");
    if (hmacKey) {
      const qrData = {
        playerOne_hmacKey: hmacKey,
      };
      setQrCode(JSON.stringify(qrData));
    }
    getUserParticipatedTournaments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, session]);

  useEffect(() => {
    // Only update QR if qrCode has been initialized
    if (qrCode) {
      try {
        const qrData = JSON.parse(qrCode);
        qrData.scores = {
          [hmacKey]: scores.myScore, // Use hmacKey as the key dynamically
          opponentScore: scores.opponentScore,
        };
        setQrCode(JSON.stringify(qrData));
      } catch (err) {
        console.error("Failed to parse qrCode JSON:", err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores, hmacKey]); // Ensure effect runs when scores, hmacKey, or error changes

  return (
    <Fragment>
      <Navigation />

      <section className="container md:py-8 py-6 max-w-[1000px]">
        <button
          onClick={() => navigate(-1)}
          className="border border-tableBorder shadow-table rounded-lg px-4 py-1.5 flex justify-center items-center gap-2 text-sm"
        >
          <IoMdArrowRoundBack />
          {t("back")}
        </button>
        <div className="rounded-lg shadow-table border border-tableBorder mt-4">
          {/* Header */}
          <div className="p-4 border-b border-tableBorder">
            <h1 className="text-xl font-primary font-medium text-brand-black">
              {t("generate qr code")}
            </h1>
          </div>
          <div className="px-4 py-4 grid md:grid-cols-6 gap-8">
            <aside className="md:col-span-2">
              {qrCode && (
                <QRCode value={qrCode} className="w-full h-max mx-auto my-4" />
              )}
            </aside>
            <div className="md:col-span-4">
              <form>
                <Field className="relative">
                  <Label className="text-brand-primary font-primary md:text-base text-sm capitalize">
                    {t("select tournaments to add score")}{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <CustomSelect
                    dropdownItems={tournaments?.map((item: any) => ({
                      label: item?.name,
                      value: item?._id,
                    }))}
                    setSelectedOption={function (e: any): void {
                      const data = tournaments.find(
                        (tournament: any) => tournament._id === e?.value
                      );
                      setSelectedTournament(data);
                      const qrData = JSON.parse(qrCode);
                      qrData.currentRound = data?.schedule?.currentRound;
                      qrData.tournament = data?._id;
                      setQrCode(JSON.stringify(qrData));
                      setInputs({ ...inputs, tournament: e });
                    }}
                    selectedOption={inputs.tournament}
                    id={"tournament-select"}
                    placeholder={t("Type to find tournament")}
                    height="40px"
                    className="mt-1"
                    noOptionsMessage={t("No games scheduled yet")}
                  />
                </Field>
                {selectedTournament?.schedule?.status === "active" &&
                  selectedTournament?.schedule?.currentRound !== 0 &&
                  selectedTournament?.playMode && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">
                        {t("Enter Scores")}
                      </h3>
                      {selectedTournament.playMode === "TieBreak10" && (
                        <TieBreak10OnlySet
                          scores={scores}
                          setScores={setScores}
                          resetScores={() => {
                            setScores({
                              myScore: [],
                              opponentScore: [],
                            });
                          }}
                        />
                      )}
                      {selectedTournament.playMode === "3setTieBreak10" && (
                        <ThreeTieBreak
                          scores={scores}
                          setScores={setScores}
                          resetScores={() => {
                            setScores({
                              myScore: [],
                              opponentScore: [],
                            });
                          }}
                        />
                      )}
                      {selectedTournament.playMode === "1set" && (
                        <OneSetNormal
                          scores={scores}
                          setScores={setScores}
                          resetScores={() => {
                            setScores({
                              myScore: [],
                              opponentScore: [],
                            });
                          }}
                        />
                      )}
                      {selectedTournament.playMode === "3set" && (
                        <ThreeSetNormal
                          scores={scores}
                          setScores={setScores}
                          resetScores={() => {
                            setScores({
                              myScore: [],
                              opponentScore: [],
                            });
                          }}
                        />
                      )}
                      {selectedTournament.playMode === "5set" && (
                        <FiveSetNormal
                          scores={scores}
                          setScores={setScores}
                          resetScores={() => {
                            setScores({
                              myScore: [],
                              opponentScore: [],
                            });
                          }}
                        />
                      )}
                    </div>
                  )}
                {selectedTournament?.schedule?.status === "finished" && (
                  <p className="sm:text-base text-sm text-center mt-4">
                    {`No games scheduled for you yet in the tournament "${selectedTournament?.name}"`}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default AddScore;
