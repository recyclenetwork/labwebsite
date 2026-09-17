"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { SITE_CONFIG } from "@/constants";
import { submitInquiry } from "@/lib/inbox/store";
import { InquiryFormData } from "@/lib/inbox/types";
import { useLandingData } from "@/lib/landing-store";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  FlaskConical,
  Building2,
  GraduationCap,
  Microscope,
  FileText,
  Globe,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Loader2,
  Calendar,
  Compass,
  ExternalLink,
  MessageSquare
} from "lucide-react";

const INQUIRY_CATEGORIES = [
  {
    id: "Research Collaboration",
    label: "Research Collaboration",
    icon: FlaskConical,
    desc: "Joint grant proposals, consortia & international investigations",
    badge: "Joint Grants",
  },
  {
    id: "Student Admission / Thesis",
    label: "Graduate & PhD Thesis",
    icon: GraduationCap,
    desc: "M.Sc., M.Phil., Ph.D. positions & undergraduate internships",
    badge: "Admissions",
  },
  {
    id: "Environmental Analytical Services",
    label: "Analytical Services",
    icon: Microscope,
    desc: "Micro-FTIR polymer mapping, trace metals & bioassays",
    badge: "Lab Testing",
  },
  {
    id: "Academic Partnership",
    label: "Academic Partnership",
    icon: Building2,
    desc: "Institutional MoUs, visiting faculty & guest lectures",
    badge: "Institutional",
  },
  {
    id: "Media & Press",
    label: "Media & Press",
    icon: Globe,
    desc: "Expert commentary, public briefs & policy briefings",
    badge: "Editorial",
  },
  {
    id: "General Inquiry",
    label: "General Inquiry",
    icon: MessageSquare,
    desc: "General questions, dataset requests & scientific queries",
    badge: "Inquiries",
  },
];

const FAQS = [
  {
    q: "How can prospective Master's and PhD students join the laboratory?",
    a: "We welcome passionate candidates in Environmental Sciences, Analytical Chemistry, Biology, and related disciplines. Select 'Graduate & PhD Thesis' in the contact form, specify your prior academic background and research interests, or apply directly through our Opportunities Portal.",
  },
  {
    q: "Does the laboratory accept external environmental samples for analytical characterization?",
    a: "Yes. Our facility supports collaborative analytical testing, including micro-FTIR spectral mapping for microplastics, AAS/ICP-MS trace metal quantification, and eco-biomarker screening for academic and public environmental agencies.",
  },
  {
    q: "What is the typical response turnaround time for research inquiries?",
    a: "Our administrative and research coordination desk reviews incoming correspondence daily. You will receive a direct reply from the Principal Investigator or lab coordinator within 24 to 48 business hours.",
  },
  {
    q: "How can international researchers visit as guest scholars or fellows?",
    a: "We host visiting scientists under collaborative university MoUs and international fellowship frameworks. Submit a summary of your proposed research scope and timeline via the form.",
  },
];

export default function ContactPage() {
  const { data: landingData } = useLandingData();
  const [formData, setFormData] = useState<InquiryFormData>({
    name: "",
    email: "",
    phone: "",
    organization: "",
    subject: "",
    category: "Research Collaboration",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [receiptId, setReceiptId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage("Please complete all required fields (Name, Email, and Message).");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const result = await submitInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        organization: formData.organization?.trim() || undefined,
        subject: formData.subject.trim() || `${formData.category} from ${formData.name}`,
        category: formData.category,
        message: formData.message.trim(),
        type: formData.category.includes("Admission") ? "student_application" : "contact_form",
      });

      setReceiptId(result.id);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to transmit message. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      organization: "",
      subject: "",
      category: "Research Collaboration",
      message: "",
    });
    setSubmitted(false);
    setReceiptId("");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col selection:bg-[#10B981]/30 selection:text-[#34D399]">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20">
        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden py-12 sm:py-16 border-b border-slate-200/80 dark:border-slate-800/80">
          {/* Subtle Ambient Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/70 border border-emerald-500/30 text-emerald-700 dark:text-[#34D399] text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Direct Communications Desk</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-manrope)] leading-[1.15]">
                Contact &amp; Connect With Our Research Team
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Whether you are exploring international research collaborations, applying for graduate thesis positions, requesting analytical testing, or seeking scientific commentary, our investigative team is ready to connect.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* MAIN 2-COLUMN SECTION: FORM & CONTACT CHANNELS                           */}
        {/* ========================================================================= */}
        <section className="py-12 sm:py-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* LEFT COLUMN: INTERACTIVE DISPATCH FORM (7 Cols) */}
              <div className="lg:col-span-7">
                <div className="p-6 sm:p-10 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-[#0F172A]/90 backdrop-blur-xl shadow-xl shadow-slate-900/5 dark:shadow-black/40 space-y-8">
                  
                  {submitted ? (
                    /* SUCCESS STATE */
                    <div className="py-12 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-[#34D399] flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold font-[family-name:var(--font-manrope)]">
                          Message Dispatched Successfully!
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                          Your message has been directly routed to our Principal Investigator and Lab Administrative Desk.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200/80 dark:border-slate-800/80 max-w-md mx-auto text-left text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span>Transmission Tracking ID:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 uppercase">{receiptId}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span>Inquiry Classification:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formData.category}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span>Standard Response Time:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">24 – 48 business hours</span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={handleReset}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>Submit Another Inquiry</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* INTERACTIVE CONTACT FORM */
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-manrope)]">
                          Send a Direct Message
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Select the purpose of your inquiry so we can route your message to the appropriate scientific lead.
                        </p>
                      </div>

                      {errorMessage && (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      {/* 1. Category Selection Pills */}
                      <div className="space-y-2.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Inquiry Nature &amp; Classification <span className="text-emerald-500">*</span>
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {INQUIRY_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = formData.category === cat.id;
                            return (
                              <div
                                key={cat.id}
                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                                  isSelected
                                    ? "bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white shadow-xs"
                                    : "bg-slate-50/70 dark:bg-[#090D16]/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                                    isSelected
                                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-bold truncate">{cat.label}</span>
                                    {isSelected && (
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                    {cat.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Sender Identity & Affiliation */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-800 dark:text-slate-200">
                            Your Full Name <span className="text-emerald-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Dr. Ayesha Siddiqua"
                            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#090D16] text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-[#090D16] transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-800 dark:text-slate-200">
                            Academic / Official Email <span className="text-emerald-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="e.g. a.siddiqua@university.edu"
                            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#090D16] text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-[#090D16] transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-800 dark:text-slate-200">
                            Institution / Organization (Optional)
                          </label>
                          <input
                            type="text"
                            value={formData.organization}
                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                            placeholder="e.g. Department of Chemistry, University of Dhaka"
                            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#090D16] text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-[#090D16] transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-800 dark:text-slate-200">
                            Phone / WhatsApp (Optional)
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="e.g. +880 1712-345678"
                            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#090D16] text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-[#090D16] transition"
                          />
                        </div>
                      </div>

                      {/* 3. Subject & Narrative Message */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-800 dark:text-slate-200">
                          Subject Line / Topic Overview
                        </label>
                        <input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="e.g. Inquiring about joint freshwater microplastics monitoring project"
                          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#090D16] text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-[#090D16] transition"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Detailed Message / Proposal Brief <span className="text-emerald-500">*</span>
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formData.message.length} characters
                          </span>
                        </div>
                        <textarea
                          required
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Please provide details regarding your background, proposed research objectives, timeline, or analytical questions..."
                          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#090D16] text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-[#090D16] transition leading-relaxed"
                        />
                      </div>

                      {/* 4. Submission Button */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span>Confidential academic transmission</span>
                        </div>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all duration-200 active:scale-98 cursor-pointer disabled:opacity-70"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Transmitting Inquiry...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Transmit Message to Lab</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: LAB COORDINATES, VISITING & DIRECT CONTACTS (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Primary Direct Channels Card */}
                <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-[#0F172A]/90 backdrop-blur-xl shadow-lg shadow-slate-900/5 dark:shadow-black/30 space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#34D399] flex items-center justify-center">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-[family-name:var(--font-manrope)]">
                        Laboratory Directorate
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Official academic channels &amp; physical location
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Address Item */}
                    <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200/70 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Physical Location</div>
                        <div className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                          {landingData?.contactSection?.facilityName || "Department of Environmental Sciences"}<br />
                          {landingData?.contactSection?.address || "Faculty of Biological Sciences, Jahangirnagar University, Savar, Dhaka-1342, Bangladesh"}
                        </div>
                        {landingData?.contactSection?.gpsCoordinates && (
                          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                            GPS: {landingData.contactSection.gpsCoordinates}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email Item */}
                    <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200/70 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">Direct Email Routing</div>
                        <div className="flex flex-col gap-0.5">
                          <a
                            href={`mailto:${landingData?.contactSection?.email || SITE_CONFIG.email}`}
                            className="text-emerald-600 dark:text-[#34D399] font-medium hover:underline flex items-center gap-1"
                          >
                            <span>{landingData?.contactSection?.email || SITE_CONFIG.email}</span>
                          </a>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {landingData?.contactSection?.phone ? `Phone: ${landingData.contactSection.phone}` : "General Lab Inquiries & Collaborations"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200/70 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Laboratory Operating Hours</div>
                        <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                          {landingData?.contactSection?.hours || "Sunday – Thursday: 09:00 AM – 05:00 PM (BST)"}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Clean-room instrumentation access by prior booking
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Google Map Card */}
                <div className="p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-[#0F172A]/90 shadow-md space-y-3">
                  <div className="flex items-center justify-between px-2 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Campus Interactive Map
                    </span>
                    <a
                      href="https://maps.google.com/maps?q=Department+of+Environmental+Sciences,+Jahangirnagar+University,+Savar,+Dhaka,+Bangladesh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-600 dark:text-[#34D399] hover:underline flex items-center gap-1"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="h-56 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <iframe
                      title="Jahangirnagar University Campus Map"
                      src={landingData?.contactSection?.mapEmbedUrl || "https://maps.google.com/maps?q=Department+of+Environmental+Sciences,+Jahangirnagar+University,+Savar,+Dhaka,+Bangladesh&t=&z=16&ie=UTF8&iwloc=&output=embed"}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FAQS SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="py-12 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Frequently Asked Questions</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-manrope)]">
                  Guidance For Researchers &amp; Inquirers
                </h2>
              </div>

              <div className="space-y-3">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0F172A]/70 overflow-hidden transition-all duration-200"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-900 dark:text-white cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                            isOpen ? "rotate-180 text-emerald-500" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in duration-150">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
