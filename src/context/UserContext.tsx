import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import api from "../lib/axios";
import Cookies from "js-cookie";
import Loader from "../components/shared/Loader";

interface IUser {
  _id: string;
  googleId: string;
  appleId: string | null;
  alias: string;
  name: string;
  email: string;
  dateOfBirth: string; // ISO date string, can be converted to Date if needed
  gender: "male" | "female" | "other"; // assuming limited values, adjust if needed
  userType: "user" | "admin" | "moderator"; // adjust possible values if needed
  hmacKey: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  elo: {
    rating: number;
    tau: number;
    rd: number;
    vol: number;
  };
}

interface UserContextType {
  loading: boolean;
  user: IUser | null;
  setUser: (user: IUser) => void;
  fetchUser: () => Promise<void>;
}

// Create the User Context
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

// Create a User Provider
export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const token = Cookies.get("session_key");
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const response = await api.get("/api/v1/user/profile");
      if (response.status === 200) {
        setUser(response?.data?.user);
      }
    } catch (error) {
    } finally {
      setTimeout(() => {
        setLoading(false); // Always unset loading
      }, 1000);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    } else
      setTimeout(() => {
        setLoading(false); // Always unset loading
      }, 1000); // No token, skip fetch
    // eslint-disable-next-line
  }, [token]);

  if (loading) {
    return (
      <section className="w-full h-screen flex justify-center items-center">
        <Loader />
      </section>
    ); // Render a fallback while loading
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook to Use the Context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};
