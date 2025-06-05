import React, { useState } from "react";
import TenantsManagement from "./TenantsManagement";
import PlansManagement from "./PlansManagement";
import UsageMetrics from "./UsageMetrics";
import FeatureToggles from "./FeatureToggles";
import PlatformOverview from "./PlatformOverview";

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "tenants", label: "Tenants" },
  { key: "plans", label: "Plans" },
  { key: "usage", label: "Usage" },
  { key: "features", label: "Feature Toggles" },
];

export default function SuperAdminDashboard() {
  const [section, setSection] = useState("overview");

  return (
    <div className="w-full min-h-screen flex bg-black text-gold">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-black border-r border-gold flex flex-col py-8 px-4">
        <div className="text-2xl font-serif font-bold mb-8 text-gold">Platform Admin</div>
        <nav className="flex flex-col gap-4">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`font-sans px-2 py-2 rounded text-left transition-colors ${
                section === s.key ? "bg-gold/10 text-gold font-bold" : "hover:bg-gold/10"
              }`}
              style={{ outline: "none", border: "none", background: "none" }}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 min-h-screen p-8 bg-black/90">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">Super Admin Dashboard</h1>
        {section === "overview" && (
          <section className="mb-8">
            <PlatformOverview />
          </section>
        )}
        {section === "tenants" && (
          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold mb-2">Tenants</h2>
            <TenantsManagement />
          </section>
        )}
        {section === "plans" && (
          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold mb-2">Subscription Plans</h2>
            <PlansManagement />
          </section>
        )}
        {section === "usage" && (
          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold mb-2">Usage & Metrics</h2>
            <UsageMetrics />
          </section>
        )}
        {section === "features" && (
          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold mb-2">Feature Toggles</h2>
            <FeatureToggles />
          </section>
        )}
      </main>
    </div>
  );
}
