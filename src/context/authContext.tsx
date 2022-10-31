import React, { createContext, useState, useEffect, useMemo } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

interface AuthContextInterface {
  isLogin: boolean;
  userData: { uid: string; email: string; identity: string; username: string };
  signup: (emil: string, password: string, identity: string, username: string) => void;
  login(email: string, password: string): void;
  logout(): void;
}

export const AuthContext = createContext<AuthContextInterface>({
  isLogin: false,
  userData: { uid: "", email: "", identity: "", username: "" },
  signup: () => {},
  login: () => {},
  logout: () => {},
});

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState({ uid: "", email: "", identity: "", username: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid } = user;
        const { email } = user;
        if (typeof email !== "string") return;
        setIsLogin(true);
        const res = await getDoc(doc(db, "users", user.uid));
        const data = res.data();
        const identity = data?.identity;
        const username = data?.username;
        setUserData({ uid, email, identity, username });
      }
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, identity: string, username: string): Promise<string> => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = res;
      setDoc(doc(db, "users", user.uid), {
        uid: res.user.uid,
        email: res.user.email,
        identity,
        username,
      });
      if (typeof user.email === "string") {
        setUserData({ uid: user.uid, email: user.email, identity, username });
      }
      return "註冊成功";
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "註冊失敗";
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const { user } = res;
      if (typeof user.email !== "string") return;
      const result = await getDoc(doc(db, "users", user.uid));
      const data = result.data();
      if (!data) return;
      setUserData({ uid: user.uid, email: user.email, identity: data.identity, username: data.username });
      setIsLogin(true);
      return "登入成功";
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "登入失敗";
    }
  };
  const logout = () => {
    signOut(auth);
    setIsLogin(false);
    setUserData({ uid: "", email: "", identity: "", username: "" });
    alert("您已登出帳號！");
  };

  return (
    <AuthContext.Provider value={useMemo(() => ({ isLogin, userData, signup, login, logout }), [isLogin, userData])}>
      {children}
    </AuthContext.Provider>
  );
}
