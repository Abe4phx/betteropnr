import React from "react";
import Logo from "@/components/Logo";
import { TS_COLORS, BRAND } from "@/lib/constants";

export default function BrandPreview() {
  return (
    <div className="min-h-screen p-6 sm:p-10 bg-ts-gray">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Logo size={40} />
          <button className="btn btn-primary">Primary CTA</button>
        </div>

        <section className="card">
          <h1 className="h2 mb-2">{BRAND.name}</h1>
          <p className="text-ts-navy/70">{BRAND.tagline}</p>
        </section>

        <section className="card">
          <h2 className="h3 mb-4">Colors</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {Object.entries(TS_COLORS).map(([k, v]) => (
              <div key={k} className="rounded-2xl shadow-soft overflow-hidden">
                <div className="h-20" style={{ background: v }} />
                <div className="p-3 text-sm">
                  <div className="font-medium">{k}</div>
                  <div className="text-xs text-black/60">{v}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="h3 mb-3">Typography</h2>
          <div className="space-y-2">
            <div className="h1">Heading One — Poppins 700</div>
            <div className="h2">Heading Two — Poppins 600</div>
            <div className="h3">Heading Three — Poppins 600</div>
            <p className="text-base leading-7">
              Body — Inter 400/500/600. Friendly, confident, and readable for mobile-first UI.
            </p>
          </div>
        </section>

        <section className="card">
          <h2 className="h3 mb-3">Components</h2>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary">Generate Openers</button>
            <button className="btn btn-secondary">Need a Follow-Up?</button>
            <button className="btn btn-ghost">Copy</button>
            <span className="badge">Playful</span>
            <span className="badge">Sincere</span>
            <span className="badge">Confident</span>
            <span className="badge">Funny</span>
          </div>

          <div className="mt-6 screenshot-card">
            <p className="text-sm text-ts-navy/70 mb-1">Share Preview</p>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-heading text-xl text-ts-navy">"Serious question: coffee or tea—and how do you take it?"</div>
                <div className="mt-2 flex gap-2">
                  <span className="badge">Playful</span>
                  <span className="badge">Sincere</span>
                </div>
              </div>
              <Logo size={28} wordmark={false} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
