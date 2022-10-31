import React, { createContext, useState, useEffect, useMemo } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";

interface AuthContextInterface {
  isLogin: boolean;
  userData: { uid: string; email: string };
  signup: (emil: string, password: string) => void;
  login(email: string, password: string): void;
  logout(): void;
}

export const AuthContext = createContext<AuthContextInterface>({
  isLogin: false,
  userData: { uid: "", email: "" },
  signup: () => {},
  login: () => {},
  logout: () => {},
});

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState({ uid: "", email: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid } = user;
        const { email } = user;
        if (typeof email === "string") setUserData({ uid, email });
        setIsLogin(true);
        // getDoc(doc(db, "users", user.uid)).then((docSnap) => {
        //   const data: any = docSnap.data();
        //   const points = data?.points ?? 0;
        // });
      } else {
        alert("尚未登入");
      }
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string): Promise<string> => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = res;
      if (typeof user.email === "string") setUserData({ uid: user.uid, email: user.email });
      // setDoc(doc(db, "users", user.uid), {
      //   uid: res.user.uid,
      //   email: res.user.email,
      //   identity: ,
      //   photoURL: "https://i.pravatar.cc/300",
      // });
      return "註冊成功";
    } catch (error) {
      if (error instanceof Error) return error.message;
      return "註冊失敗";
    }
  };

  const login = async (email: string, password: string) => {
    // await signInWithEmailAndPassword(auth, email, password).then((res: any) => {
    //   setIsLogin(true);
    //   getDoc(doc(db, "users", res.user.uid)).then((docSnap) => {
    //     const data: any = docSnap.data();
    //     setUser({ uid: res.user.uid, email: res.user.email, points: data?.points ?? 0 });
    //   });
    // });
  };
  const logout = () => {
    signOut(auth);
    setIsLogin(false);
    setUserData({ uid: "", email: "" });
    alert("您已登出帳號！");
  };

  return (
    <AuthContext.Provider value={useMemo(() => ({ isLogin, userData, signup, login, logout }), [isLogin, userData])}>
      {children}
    </AuthContext.Provider>
  );
}
