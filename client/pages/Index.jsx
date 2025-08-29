import React, { useState } from "react";
import MapComponent from "@/components/MapComponent";
import Inputs from "@/components/Inputs";
import Buttons from "@/components/Buttons";
import UserDropdown from "@/components/UserDropdown";

export default function Index({ user, onSignOut }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleChange = (field, value) => {
    if (field === "from") setFrom(value);
    else setTo(value);
  };

  const handleSearch = () => {
    console.log("search route", { from, to });
  };

  const handlePredict = () => console.log("predict");
  const handleCongestion = () => console.log("congestion");
  const handleReport = () => console.log("report accident");

  return (
    <main className="relative h-svh w-full bg-background">
      <MapComponent className="absolute inset-0" />

      {/* Top brand bar */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow backdrop-blur dark:bg-black/40">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F70e6f5bf64cd4c70b2f1db527b7e88f8%2F6a1cdfc7621e4323a5b54052454108b4?format=webp&width=64"
          alt="Pravah logo"
          className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10"
        />
        <span className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">Pravah</span>
      </div>

      {/* User dropdown */}
      <div className="absolute right-4 top-4 z-10">
        <UserDropdown user={user} onSignOut={onSignOut} />
      </div>

      {/* Desktop / laptop form panel */}
      <div className="pointer-events-none absolute left-1/2 bottom-6 hidden md:block transform -translate-x-1/2">
        <div className="relative pointer-events-auto">
          <div className="mb-3 flex items-center justify-center gap-3">
            <Buttons formId="route-form" />
          </div>
          <form id="route-form" action="#" method="post" className="w-[50vw] max-w-xl rounded-3xl border border-white/20 bg-white/70 p-6 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-black/40">
            <Inputs from={from} to={to} onChange={handleChange} />
          </form>
        </div>
      </div>

      {/* Mobile layout: buttons centered above inputs */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 md:hidden">
        <form id="route-form-mobile" action="#" method="post" className="pointer-events-auto rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-black/40">
          <div className="mb-3 flex items-center justify-center gap-4">
            <Buttons formId="route-form-mobile" />
          </div>
          <Inputs from={from} to={to} onChange={handleChange} />
        </form>
      </div>
    </main>
  );
}
