import Cookies from "js-cookie";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Field, Input, Label } from "@headlessui/react";
import Navigation from "../components/shared/Navigation";
import { FaHome } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import api from "../lib/axios";
import Club from "./Club";
import { useUser } from "../context/UserContext";
import CustomSelect from "../components/shared/Select";
import { CiCircleInfo } from "react-icons/ci";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { format, parseISO } from "date-fns";

export const handleShare = () => {
  if (navigator.share) {
    navigator
      .share({
        title: "Invite a Friend",
        text: "Hey! Check this out, I think you'll like it.",
        url: process.env.REACT_APP_INVITE_FRIEND_LINK,
      })
      .then(() => console.log("Sharing successful!"))
      .catch((error) => console.error("Error sharing:", error));
  } else {
    alert("Sharing is not supported on this browser.");
  }
};

function Settings() {
  const { user, fetchUser } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [favoriteClubs, setFavoriteClubs] = useState([]);
  const [loading, setLoading] = useState<{
    get: boolean;
    set: boolean;
    delete: boolean;
    fav: boolean;
  }>({
    get: true,
    set: false,
    delete: false,
    fav: false,
  });
  const [inputs, setInputs] = useState({
    email: user?.email,
    alias: user?.alias,
    name: user?.name,
    dateOfBirth: user?.dateOfBirth,
    gender: user?.gender,
    id: user?._id,
  });
  const [tabs, setTabs] = useState(0);
  const session = Cookies.get("session_key");
  const [club, setClub] = useState<{ value: string; label: string } | null>(
    null
  );
  const [clubs, setClubs] = useState<{ value: string; label: string }[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading({ ...loading, set: true });
    try {
      const response = await api.put("/api/v1/user/update-profile", {
        alias: inputs?.alias,
        name: inputs?.name,
        dateOfBirth: inputs?.dateOfBirth,
        gender: inputs?.gender,
      });
      if (
        response.status === 200 &&
        !response?.data?.error &&
        response?.data?.code === "PROFILE_UPDATED"
      ) {
        fetchUser();
      } else {
        window.alert(response?.data?.message);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.message);
    } finally {
      setLoading({ ...loading, set: false });
    }
  };

  const deleteAccount = async () => {
    setLoading({ ...loading, delete: true });
    try {
      const response = await api.delete("/api/v1/user/delete-profile");
      if (
        response.status === 200 &&
        !response?.data?.error &&
        response?.data?.code === "PROFILE_DELETED"
      ) {
        Cookies.remove("session_key");
        window.location.reload();
      } else {
        window.alert(response?.data?.message);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.message);
    } finally {
      setLoading({ ...loading, delete: false });
    }
  };

  // Get favorite clubs
  const getFavoriteClubs = async () => {
    try {
      const response = await api.get(`/api/v1/user/favorite-clubs`);
      if (response.status === 200) {
        setFavoriteClubs(response?.data?.clubs);
      }
    } catch (error: any) {
      console.log(error?.response?.data?.messages[0]);
    }
  };

  const getAllClubs = async () => {
    try {
      const response = await api.get(`/api/v1/public/dropdown-clubs`);
      if (response.status === 200) {
        setClubs(response?.data?.clubs);
      }
    } catch (error: any) {
      console.log(error?.response?.data?.messages[0]);
    }
  };

  useEffect(() => {
    if (!session) navigate("/auth/login");
    else {
      getFavoriteClubs();
      getAllClubs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, session]);

  const addFavoriteClub = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading({ ...loading, fav: true });
    try {
      const response = await api.post(`/api/v1/user/favorite-club`, {
        club: club?.value,
      });
      if (response.status === 200 && !response?.data?.error) {
        setClub(null);
        getFavoriteClubs();
      } else {
        window.alert(response?.data?.messages?.[0]);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.messages?.[0]);
    } finally {
      setLoading({ ...loading, fav: false });
    }
  };

  const activateFavoriteClub = async (id: string) => {
    try {
      const response = await api.patch(
        `/api/v1/user/active-favorite-club/${id}`
      );
      if (
        response.status === 200 &&
        !response?.data?.error &&
        response?.data?.code === "FAVORITE_CLUB_ACTIVATED"
      ) {
        getFavoriteClubs();
      } else {
        window.alert(response?.data?.messages?.[0]);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.messages?.[0]);
    }
  };

  const deleteFavoriteClub = async (id: string) => {
    try {
      const response = await api.delete(`/api/v1/user/favorite-club/${id}`);
      if (response.status === 200 && !response?.data?.error) {
        getFavoriteClubs();
      } else {
        window.alert(response?.data?.messages?.[0]);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.messages?.[0]);
    }
  };

  return (
    <Fragment>
      <Navigation />
      <section className="container md:py-8 py-6 max-w-[1000px] space-y-8">
        {/* Tabs */}
        <div className="overflow-x-auto bg-tab rounded-lg md:max-w-max">
          <div className="inline-flex p-1 space-x-1 whitespace-nowrap">
            {[
              "settings",
              "favorite clubs",
              "Clubs that I administrate",
              "delete account",
            ].map((tab, index) => (
              <button
                key={tab}
                onClick={() => setTabs(index)}
                className={`py-1.5 px-4 capitalize rounded-lg text-brand-black font-primary md:text-base text-sm ${
                  index === tabs ? "bg-white shadow-tab" : ""
                }`}
              >
                {t(tab)}
              </button>
            ))}
          </div>
        </div>

        {tabs === 0 && (
          <form
            onSubmit={onSubmit}
            className="w-full rounded-lg overflow-hidden shadow-table border border-tableBorder"
          >
            <div className="p-4 border-b border-tableBorder">
              <h1 className="text-brand-primary md:text-2xl text-xl font-primary font-semibold capitalize">
                {t("settings")}
              </h1>
            </div>
            <div className="px-4 py-6">
              <Field>
                <Label className="text-brand-primary font-primary md:text-base text-sm font-medium">
                  {t("email address")} <span className="text-red-600">*</span>
                </Label>
                <Input
                  disabled
                  required
                  type="text"
                  name="email"
                  className={`border px-4 font-normal rounded-lg outline-brand-primary border-[#C6C4D5] text-brand-primary placeholder:text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm`}
                  placeholder={t("enter email address")}
                  value={inputs.email}
                  onChange={handleInputChange}
                />
              </Field>
              <Field className="mt-4">
                <Label className="text-brand-primary font-primary md:text-base text-sm font-medium">
                  {t("alias")} <span className="text-red-600">*</span>
                </Label>
                <Input
                  required
                  type="text"
                  name="alias"
                  className={`border px-4 font-normal rounded-lg outline-brand-primary border-[#C6C4D5] text-brand-primary placeholder:text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm`}
                  placeholder={t("enter alias")}
                  value={inputs.alias}
                  onChange={handleInputChange}
                />
              </Field>
              <Field className="mt-4">
                <Label className="text-brand-primary font-primary md:text-base text-sm font-medium">
                  {t("name")} <span className="text-red-600">*</span>
                </Label>
                <Input
                  required
                  type="text"
                  name="name"
                  className={`border px-4 font-normal rounded-lg outline-brand-primary border-[#C6C4D5] text-brand-primary placeholder:text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm`}
                  placeholder={t("enter name")}
                  value={inputs.name}
                  onChange={handleInputChange}
                />
              </Field>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Field className="flex flex-col w-full">
                  <Label className="text-brand-primary font-primary md:text-base text-sm font-medium">
                    {t("date of birth")}
                  </Label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    className={`border px-4 font-normal w-full outline-brand-primary rounded-lg border-[#C6C4D5] text-brand-primary placeholder:text-brand-primary mt-1 h-[40px] font-primary md:text-base text-sm`}
                    placeholder={t("select date of birth")}
                    value={
                      inputs.dateOfBirth
                        ? format(parseISO(inputs.dateOfBirth), "yyyy-MM-dd")
                        : ""
                    }
                    onChange={handleInputChange}
                  />
                </Field>
                <Field>
                  <Label className="text-brand-primary font-primary md:text-base text-sm font-medium">
                    {t("gender")}
                  </Label>
                  <select
                    name="gender"
                    value={inputs.gender}
                    onChange={handleInputChange}
                    className="border px-3 font-normal rounded-lg outline-brand-primary border-[#C6C4D5] w-full mt-1 h-[40px] font-primary md:text-base text-sm text-brand-primary disabled:text-brand-primary"
                  >
                    <option value="" disabled hidden>
                      {t("select gender")}
                    </option>
                    <option value="male">{t("male")}</option>
                    <option value="female">{t("female")}</option>
                    <option value="other">{t("other")}</option>
                  </select>
                </Field>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-3 mt-8 font-semibold w-full rounded-lg bg-brand-secondary font-primary text-sm text-brand-black active:animate-jerk flex justify-center items-center gap-2"
                >
                  {loading.set ? t("saving") : t("save")}
                </button>
              </div>
            </div>
          </form>
        )}

        {tabs === 1 && (
          <div className="w-full rounded-lg shadow-table border border-tableBorder">
            <div className="p-4 border-b border-tableBorder flex justify-between items-center">
              <h1 className="text-brand-primary md:text-2xl text-xl font-primary font-semibold capitalize">
                {t("favorite clubs")}
              </h1>
              <CiCircleInfo
                data-tooltip-id="fav-tooltip"
                className="text-brand-black text-2xl"
              />
              <ReactTooltip
                id="fav-tooltip"
                place="top"
                content={t(
                  "Click dropdown to add a club to user favorite list and then click on club in favorite list to make it your home club"
                )}
              />
            </div>
            <div className="px-4 py-6">
              <form
                onSubmit={addFavoriteClub}
                className="grid md:grid-cols-3 gap-4"
              >
                <CustomSelect
                  dropdownItems={clubs}
                  setSelectedOption={function (e: any): void {
                    setClub(e);
                  }}
                  selectedOption={club}
                  id={"club"}
                  placeholder={t("Type to find club")}
                  height="40px"
                  className="col-span-2"
                />
                <button
                  disabled={loading?.fav}
                  className="font-medium bg-brand-secondary rounded-lg active:animate-jerk w-full h-[40px] font-primary md:text-base text-sm flex justify-center items-center gap-2"
                >
                  {loading?.fav ? t("adding") : t("add to favorite")}
                </button>
              </form>
              {favoriteClubs?.map((item: any, index: number) => (
                <div key={index} className={`grid-cols-9 gap-2 mt-4 grid`}>
                  <button
                    onClick={() => activateFavoriteClub(item?._id)}
                    disabled={item?.status === "active"}
                    className={`w-full col-span-7 md:col-span-8 flex justify-between items-center text-base border-[#C6C4D5] border rounded-lg px-4 py-2 ${
                      item?.status === "active"
                        ? "bg-gray-200 text-brand-primary"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {item?.club?.name} <FaHome />
                  </button>
                  <button
                    onClick={() => deleteFavoriteClub(item?._id)}
                    // disabled={item?.status === "active"}
                    type="button"
                    className="py-2 font-semibold border md:col-span-1 col-span-2 border-red-600 rounded-lg active:animate-jerk flex justify-center items-center text-2xl text-red-600"
                  >
                    <MdDelete />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tabs === 2 && <Club />}

        {tabs === 3 && (
          <div className="w-full rounded-lg shadow-table border border-tableBorder">
            <div className="p-4 border-b border-tableBorder">
              <h1 className="text-brand-primary md:text-2xl text-xl font-primary font-semibold capitalize">
                {t("delete account")}
              </h1>
            </div>
            <div className="px-4 py-6">
              <p className="text-brand-black text-base font-primary">
                {t(
                  "To delete the account click the button below. Please remember this action cannot be reversed"
                )}
              </p>
              <button
                onClick={() => {
                  if (window.confirm("Do you really want to delete?")) {
                    deleteAccount();
                  }
                }}
                type="button"
                className="font-semibold bg-red-700 border rounded-lg mt-4 border-[#C6C4D5] active:animate-jerk text-white w-full md:h-[48px] h-[40px] font-primary md:text-base text-sm flex justify-center items-center gap-2"
              >
                {loading?.delete ? t("deleting") : t("delete my account")}
              </button>

              <h1 className="text-brand-primary md:text-2xl text-xl font-primary font-semibold capitalize mt-6">
                {t("other info")}
              </h1>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <a
                  href="mailto:service.tb10@gmail.com"
                  className="font-semibold bg-brand-secondary rounded-lg capitalize active:animate-jerk md:h-[48px] h-[40px] font-primary md:text-base text-sm flex justify-center items-center gap-2"
                >
                  {t("contact us")}
                </a>
                <button
                  onClick={handleShare}
                  className="font-semibold bg-brand-secondary rounded-lg capitalize active:animate-jerk md:h-[48px] h-[40px] font-primary md:text-base text-sm flex justify-center items-center gap-2"
                >
                  {t("invite friend")}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </Fragment>
  );
}

export default Settings;
