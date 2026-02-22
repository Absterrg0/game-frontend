import React from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { RiArrowDownSLine } from "react-icons/ri";
import ProgressBar from "./ProgressBar";
import Calender from "./icons/Calender";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import Clock from "./icons/Clock";
import Ball from "./icons/Ball";
import TimerStart from "./icons/TimerStart";
import TimerPause from "./icons/TimerPause";
import User from "./icons/User";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// Skeleton component
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 ${className}`} />
);

function Info({
  tournament,
  onParticipate,
  loading,
  getLoading,
  onLeaveTournament,
}: {
  tournament: {
    tournament: any;
    participantsCount: number;
    isParticipating: boolean;
    participants: Participant[];
  };
  onParticipate: (id: string) => Promise<void>;
  loading: boolean;
  getLoading: boolean;
  onLeaveTournament: (id: string) => Promise<void>;
}) {
  const navigate = useNavigate();
  const session = Cookies.get("session_key");
  const { t } = useTranslation();

  // Format date using date-fns
  const formattedDate = tournament?.tournament?.date
    ? format(new Date(tournament.tournament.date), "MMMM d, yyyy")
    : "";

  // If loading.get is true, show skeletons
  if (getLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4 md:order-1 order-2">
          <Skeleton className="h-8 w-1/3 mb-4 rounded" />
          <Skeleton className="h-6 w-2/3 mb-2 rounded" />
          <Skeleton className="h-6 w-full mb-2 rounded" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded mb-2" />
            ))}
          </div>
          <Skeleton className="h-6 w-1/2 mt-6 rounded" />
          <Skeleton className="h-6 w-2/3 mb-2 rounded" />
        </div>
        <div className="border border-[#DDDDDD] md:order-2 order-1 rounded-xl shadow-info p-4 max-h-max">
          <Skeleton className="h-6 w-1/2 mb-4 rounded" />
          <Skeleton className="h-4 w-full mb-2 rounded" />
          <Skeleton className="h-4 w-full mb-2 rounded" />
          <div className="rounded-xl border border-brand-black/20 mt-4 grid grid-cols-2 gap-2 overflow-hidden">
            <Skeleton className="h-8 w-full rounded" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
          <Skeleton className="h-4 w-1/2 mt-6 mb-4 rounded" />
          <Skeleton className="h-6 w-1/3 mb-2 rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-4 md:order-1 order-2">
        {/* Info */}
        <Disclosure as="div" defaultOpen={true}>
          {({ open }) => (
            <>
              <DisclosureButton className="group flex w-full items-center justify-between">
                <span className="font-primary font-semibold text-lg">Info</span>
                <span
                  className={`p-1 rounded-md border border-brand-black/20 text-brand-black`}
                >
                  <RiArrowDownSLine
                    className={`transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </DisclosureButton>
              <DisclosurePanel className={"mt-4"}>
                <p className="font-primary md:text-base text-sm text-brand-divider">
                  {" "}
                  {tournament?.tournament?.descriptionInfo}
                </p>

                {/* Divider */}
                <hr className="w-full my-6" />

                <div className="grid grid-cols-2 gap-4">
                  {formattedDate && (
                    <button
                      disabled
                      className="flex gap-3 font-primary text-brand-black pointer-events-none"
                    >
                      <Calender />
                      <span className="text-left">
                        {formattedDate}
                        <br />
                        <span className="text-brand-black/60 font-light">
                          {t("date")}
                        </span>
                      </span>
                    </button>
                  )}
                  {tournament?.tournament?.startTime &&
                    tournament?.tournament?.endTime && (
                      <button
                        disabled
                        className="flex gap-3 font-primary text-brand-black pointer-events-none"
                      >
                        <Clock />
                        <span className="text-left">
                          {`${tournament?.tournament?.startTime} - ${tournament?.tournament?.endTime}`}
                          <br />
                          <span className="text-brand-black/60 font-light">
                            {t("time")}
                          </span>
                        </span>
                      </button>
                    )}
                  {tournament?.tournament?.playMode && (
                    <button
                      disabled
                      className="flex gap-3 font-primary text-brand-black pointer-events-none"
                    >
                      <Ball />
                      <span className="text-left">
                        {tournament?.tournament?.playMode}
                        <br />
                        <span className="text-brand-black/60 font-light">
                          Game mode
                        </span>
                      </span>
                    </button>
                  )}
                  {tournament?.tournament?.playTime && (
                    <button
                      disabled
                      className="flex gap-3 font-primary text-brand-black pointer-events-none"
                    >
                      <TimerStart />
                      <span className="text-left">
                        {tournament?.tournament?.playTime} Min Play
                        <br />
                        <span className="text-brand-black/60 font-light">
                          Duration
                        </span>
                      </span>
                    </button>
                  )}
                  {tournament?.tournament?.pauseTime && (
                    <button
                      disabled
                      className="flex gap-3 font-primary text-brand-black pointer-events-none"
                    >
                      <TimerPause />
                      <span className="text-left">
                        {tournament?.tournament?.pauseTime} Minutes
                        <br />
                        <span className="text-brand-black/60 font-light">
                          Breaks
                        </span>
                      </span>
                    </button>
                  )}
                </div>

                {/* Divider */}
                <hr className="w-full my-6" />
                <h4 className="font-primary font-medium text-base">
                  Food & Drinks
                </h4>
                <p className="font-primary md:text-base text-sm text-brand-divider">
                  {" "}
                  {tournament?.tournament?.foodInfo}
                </p>
                <hr className="w-full my-6" />
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
        <Disclosure as="div" defaultOpen={true}>
          {({ open }) => (
            <>
              <DisclosureButton className="group flex w-full items-center justify-between">
                <span className="font-primary font-semibold text-lg">
                  Current Players
                </span>
                <span
                  className={`p-1 rounded-md border border-brand-black/20 text-brand-black`}
                >
                  <RiArrowDownSLine
                    className={`transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </DisclosureButton>
              <DisclosurePanel className={"mt-4"}>
                <div className="grid grid-cols-2 gap-4">
                  {tournament?.participants?.map((participant) => (
                    <button
                      key={participant._id}
                      disabled
                      className="border border-brand-black/10 rounded-xl p-3 flex items-center gap-3 pointer-events-none"
                    >
                      <User />
                      <div className="flex flex-col items-start">
                        <p className="text-brand-black font-normal md:text-base text-sm font-primary">
                          {participant.name}
                        </p>
                        <p className="text-brand-black/60 font-light md:text-base text-sm font-primary capitalize">
                          {participant.gender}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      </div>

      {/* match progress */}
      <div className="border border-[#DDDDDD] rounded-xl md:order-2 order-1 shadow-info p-4 max-h-max">
        <h2 className="font-semibold font-primary text-brand-black md:text-lg text-lg mb-4">
          {tournament?.tournament?.name}
        </h2>
        <ProgressBar
          joined={tournament?.participantsCount}
          total={tournament?.tournament?.maxMember}
          minMember={tournament?.tournament?.minMember}
        />
        <div className="rounded-xl border border-brand-black/20 mt-4 grid grid-cols-2 overflow-hidden">
          <div className="border-r border-brand-black/20 py-2 px-3">
            <h4 className="text-brand-black uppercase text-sm font-light">
              Min players
            </h4>
            <p className="text-brand-black font-primary text-sm font-medium">
              {tournament?.tournament?.minMember}
            </p>
          </div>
          <div className="border-r border-brand-black/20 py-2 px-3">
            <h4 className="text-brand-black uppercase text-sm font-light">
              max players
            </h4>
            <p className="text-brand-black font-primary text-sm font-medium">
              {tournament?.tournament?.maxMember}
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="w-full mt-6 mb-4" />

        {/* Fee */}
        <h2 className="font-primary md:text-base text-sm">
          ${tournament?.tournament?.memberFee}{" "}
          <span className="text-xs text-brand-black/60">Fee</span>
        </h2>

        {/* CTA */}
        {tournament?.isParticipating ? (
          <button
            onClick={() => {
              if (!session) {
                const confirmed = window.confirm(
                  "You need to login to leave. Do you want to go to the login page?"
                );
                if (confirmed) {
                  navigate("/auth/login");
                }
                return;
              }
              onLeaveTournament(tournament?.tournament?._id);
            }}
            className={`px-4 py-2 w-full rounded-lg font-primary text-sm active:animate-jerk mt-1 bg-brand-secondary text-brand-black`}
          >
            {loading ? t("leaving") : t("leave")}
          </button>
        ) : (
          <button
            onClick={() => {
              if (!session) {
                const confirmed = window.confirm(
                  "You need to login to participate. Do you want to go to the login page?"
                );
                if (confirmed) {
                  navigate("/auth/login");
                }
                return;
              }
              onParticipate(tournament?.tournament?._id);
            }}
            disabled={
              tournament?.participantsCount >= tournament?.tournament?.maxMember
            }
            className={`px-4 py-2 w-full rounded-lg font-primary text-sm active:animate-jerk mt-1 ${
              tournament?.participantsCount >= tournament?.tournament?.maxMember
                ? "bg-brand-primary/80 text-black"
                : "bg-brand-primary text-white"
            }`}
          >
            {loading ? t("joining") : t("join tournament")}
          </button>
        )}
      </div>
    </div>
  );
}

export default Info;
