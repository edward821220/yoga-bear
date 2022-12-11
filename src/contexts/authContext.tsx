import { createContext, useState, useEffect, useMemo } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import Swal from "sweetalert2";
import { getUserData, createUserData } from "../utils/firestore";
import { auth } from "../../lib/firebase";

interface AuthContextInterface {
  isLogin: boolean;
  userData: { uid: string; email: string; identity: string; username: string; avatar: string };
  setUserData: React.Dispatch<
    React.SetStateAction<{
      uid: string;
      email: string;
      identity: string;
      username: string;
      avatar: string;
    }>
  >;
  signup(emil: string, password: string, identity: string, username: string): Promise<string>;
  login(email: string, password: string): void;
  logout(): void;
}

export const AuthContext = createContext<AuthContextInterface>({} as AuthContextInterface);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState({ uid: "", email: "", identity: "", username: "", avatar: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid } = user;
        const { email } = user;
        if (typeof email !== "string") return;
        setIsLogin(true);
        const userSnap = await getUserData(user.uid);
        if (!userSnap.exists()) return;
        const data = userSnap.data();
        const identity = data?.identity as string;
        const username = data?.username as string;
        const avatar = data?.photoURL as string;
        setUserData({ uid, email, identity, username, avatar });
      }
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, identity: string, username: string): Promise<string> => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = res;
      if (typeof user.email === "string") {
        await createUserData(user.uid, {
          uid: user.uid,
          email: user.email,
          identity,
          username,
          photoURL:
            "https://firebasestorage.googleapis.com/v0/b/yoga-bear-5faab.appspot.com/o/profile.png?alt=media&token=2fb4f433-e1b6-4f86-9b5d-b33d367e99b7",
        });
        setUserData({
          uid: user.uid,
          email: user.email,
          identity,
          username,
          avatar:
            "https://firebasestorage.googleapis.com/v0/b/yoga-bear-5faab.appspot.com/o/profile.png?alt=media&token=2fb4f433-e1b6-4f86-9b5d-b33d367e99b7",
        });
      }
      return user.uid;
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
      const userSnap = await getUserData(user.uid);
      if (!userSnap.exists()) return;
      const data = userSnap.data();
      setUserData({
        uid: user.uid,
        email: user.email,
        identity: data.identity as string,
        username: data.username as string,
        avatar: data.photoURL as string,
      });
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
    setUserData({ uid: "", email: "", identity: "", username: "", avatar: "" });
    Swal.fire({ title: "您已登出帳號！", confirmButtonColor: "#5d7262" });
  };

  return (
    <AuthContext.Provider
      value={useMemo(() => ({ isLogin, userData, setUserData, signup, login, logout }), [isLogin, userData])}
    >
      {children}
    </AuthContext.Provider>
  );
}
