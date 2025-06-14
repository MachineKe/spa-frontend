import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
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

const superAdminNavLinks = [
  { to: "#overview", label: "Overview", key: "overview" },
  { to: "#tenants", label: "Tenants", key: "tenants" },
  { to: "#plans", label: "Plans", key: "plans" },
  { to: "#usage", label: "Usage", key: "usage" },
  { to: "#features", label: "Feature Toggles", key: "features" },
];

export default function SuperAdminDashboard() {
  const [section, setSection] = useState("overview");

  return (
    <DashboardLayout
      navLinks={superAdminNavLinks.map((s) => ({
        ...s,
        to: "#"+s.key,
        // Highlight active section
        label: (
          <button
            type="button"
            className={`block w-full text-left px-2 py-2 rounded font-sans transition-colors ${
              section === s.key
                ? "bg-black/80 text-gold font-bold border-l-4 border-gold"
                : "bg-black/80 text-gold hover:text-yellow-400 hover:bg-gold/10"
            }`}
            style={{
              textDecoration: "none",
            }}
            onClick={() => setSection(s.key)}
          >
            {s.label}
          </button>
        ),
        onClick: () => setSection(s.key),
      }))}
    >
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
    </DashboardLayout>
  );
}
