import React, { createContext, useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

interface AuthContextInterface {
  isLogin: boolean;
  user: { name: string; email: string; password: string };
  signup(): void;
  login(): void;
}

export const AuthContext = createContext<AuthContextInterface | null>(null);

// export function AuthContextProvider({ children }: { children: React.ReactNode }) {
//   const [isLogin, setIsLogin] = useState(false);

//   const signup = async () => {
//     try {
//       const res = await createUserWithEmailAndPassword(auth, email, password);
//       const { user } = res;
//       console.log(user);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return <AuthContext.Provider value={{ isLogin, user, signup, login }}>{children}</AuthContext.Provider>;
// }
