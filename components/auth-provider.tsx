"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { User, onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, firebaseConfigured } from "@/lib/firebase";
const C=createContext<{user:User|null;loading:boolean;configured:boolean}>({user:null,loading:true,configured:firebaseConfigured});
export function AuthProvider({children}:{children:React.ReactNode}){const[user,setUser]=useState<User|null>(null);const[loading,setLoading]=useState(true);useEffect(()=>{if(!auth){setLoading(false);return}return onAuthStateChanged(auth,u=>{setUser(u);setLoading(false)})},[]);return <C.Provider value={{user,loading,configured:firebaseConfigured}}>{children}</C.Provider>}
export const useAuth=()=>useContext(C);
