"use client";
import Sidebar from "../components/Sidebar";
import BottomBar from "../components/BottomBar";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/firebase-auth";

export default function HomeLayout({ children }) {
  const [role, setRole] = useState("client");
  useEffect(() => {
    getCurrentUser().then((user) => {
      console.log("Admin layout - Current user:", user);
      console.log("Admin layout - User role:", user?.role);
      if (user?.role === "admin") {
        console.log("Admin layout - Setting role to admin");
        setRole("admin");
      } else {
        console.log("Admin layout - Setting role to client");
        setRole("client");
      }
    });
  }, []);
  return (
    
    <div className="flex">

      <Sidebar role={role} />
      <main className="flex-1">
        {children}
      </main>
      <BottomBar role={role} />
    </div>
  );
}
