import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";

interface Person {
  id: number;
  nickname: string;
  avatar: string;
  isAdmin: boolean;
  currentStreak?: number;
  totalPoints?: number;
}

interface Household {
  id: number;
  name: string;
  email?: string;
}

interface AuthState {
  household: Household | null;
  people: Person[];
  currentPerson: Person | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  selectProfile: (personId: number) => void;
  logout: () => void;
  verifyAdminPin: (pin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    household: null,
    people: [],
    currentPerson: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for saved session
    const savedHousehold = localStorage.getItem("chory_household");
    const savedPeople = localStorage.getItem("chory_people");
    const savedPerson = localStorage.getItem("chory_current_person");

    if (savedHousehold && savedPeople) {
      setState({
        household: JSON.parse(savedHousehold),
        people: JSON.parse(savedPeople),
        currentPerson: savedPerson ? JSON.parse(savedPerson) : null,
        isAuthenticated: true,
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await response.json();

      if (!data.success) {
        return { success: false, error: data.error || "Invalid credentials" };
      }

      const newState = {
        household: data.household,
        people: data.people,
        currentPerson: data.people[0], // Auto-select first person
        isAuthenticated: true,
      };

      setState(newState);
      
      localStorage.setItem("chory_household", JSON.stringify(data.household));
      localStorage.setItem("chory_people", JSON.stringify(data.people));
      localStorage.setItem("chory_current_person", JSON.stringify(data.people[0]));

      return { success: true };
    } catch (error) {
      return { success: false, error: "Invalid credentials" };
    }
  };

  const selectProfile = (personId: number) => {
    if (personId === 0) {
      // Clear current person to show profile select
      setState({
        ...state,
        currentPerson: null,
      });
      localStorage.removeItem("chory_current_person");
    } else {
      const person = state.people.find(p => p.id === personId);
      if (person) {
        setState({
          ...state,
          currentPerson: person,
        });
        localStorage.setItem("chory_current_person", JSON.stringify(person));
      }
    }
  };

  const verifyAdminPin = async (pin: string) => {
    if (!state.currentPerson) return false;
    
    try {
      await apiRequest("POST", `/api/auth/verify-admin-pin?personId=${state.currentPerson.id}`, { pin });
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setState({
      household: null,
      people: [],
      currentPerson: null,
      isAuthenticated: false,
    });
    
    localStorage.removeItem("chory_household");
    localStorage.removeItem("chory_people");
    localStorage.removeItem("chory_current_person");
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        selectProfile,
        logout,
        verifyAdminPin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
