import * as React from "react";
import { ArrowRight, Compass, FlaskConical, LineChart, Dna, ShieldCheck } from "lucide-react";

interface WorkflowStep {
  step: string;
  phase: string;
  title: string;
  description: string;
  technologies: string[];
}

interface ResearchWorkflowProps {
  steps: WorkflowStep[];
}

const STEP_ICONS = [Compass, FlaskConical, LineChart, Dna, ShieldCheck];

export function ResearchWorkflow({ steps }: ResearchWorkflowProps) {
  return (
    <section className="py-16 lg:py-24 bg-[#F4F8F5] dark:bg-[#0B1120] border-y border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col space-y-3 max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#14532D]" />
            <span className="font-mono-scientific text-xs uppercase tracking-widest text-[#0F766E] font-bold">
              HOW WE WORK
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight theme-text-main font-display-hero">
            From field observations to scientific evidence.
          </h2>
          <p className="text-base sm:text-lg text-[#52635A] dark:text-slate-300 leading-relaxed">
            Our multi-phase investigative pipeline systematically bridges field environmental sampling
            with high-resolution toxicological assays and policy-level impact.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="relative">
          {/* Desktop Horizontal Connecting Line */}
          <div className="hidden lg:block absolute top-10 left-8 right-8 h-0.5 bg-[#D1E0D7] dark:bg-slate-800 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[index] || Compass;

              return (
                <div
                  key={step.step}
                  className="p-6 sm:p-7 rounded-2xl theme-card border shadow-sm flex flex-col justify-between space-y-5 group hover:border-[#14532D] transition-all"
                >
                  <div className="space-y-4">
                    {/* Step Icon & Number */}
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#14532D] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono-scientific text-xs font-bold text-[#0F766E] px-2 py-0.5 rounded bg-[#0F766E]/10">
                        {step.step}
                      </span>
                    </div>

                    {/* Phase Badge & Title */}
                    <div>
                      <span className="font-mono-scientific text-[11px] font-bold uppercase tracking-widest text-[#2F7D4A] dark:text-[#34D399] block mb-1">
                        {step.phase}
                      </span>
                      <h3 className="text-lg font-bold theme-text-main tracking-tight leading-snug">
                        {step.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#52635A] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Methodologies / Tech */}
                  <div className="pt-3 border-t border-current/10 space-y-1">
                    {step.technologies.slice(0, 2).map((tech) => (
                      <div
                        key={tech}
                        className="text-[10px] font-mono-scientific text-[#52635A] flex items-center gap-1.5"
                      >
                        <span className="h-1 w-1 rounded-full bg-[#0F766E]" />
                        <span>{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
