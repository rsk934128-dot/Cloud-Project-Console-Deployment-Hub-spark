import React, { useState } from 'react';
import { 
  Cloud, 
  Cpu, 
  Box, 
  ShieldCheck, 
  Zap, 
  ImageIcon, 
  Mail, 
  Terminal, 
  Globe, 
  Layers, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Lock, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Server,
  Code2,
  BarChart3,
  LogIn,
  User,
  Sliders,
  Check
} from 'lucide-react';
import { USER_INFO } from '../mockData';

interface LandingPageProps {
  onEnterConsole: () => void;
  onLogin: (email: string) => void;
  isLoggedIn: boolean;
  userEmail: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterConsole,
  onLogin,
  isLoggedIn,
  userEmail
}) => {
  const [activeFeatureTab, setActiveFeatureTab] = useState<'images' | 'sandboxes' | 'agent' | 'gateway'>('images');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState(USER_INFO.email);
  const [passwordInput, setPasswordInput] = useState('••••••••••••');
  const [loginFeedback, setLoginFeedback] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginFeedback('অথেনটিকেশন সফল হচ্ছে...');
    setTimeout(() => {
      onLogin(emailInput);
      setIsLoginModalOpen(false);
      setLoginFeedback(null);
      onEnterConsole();
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    onLogin(USER_INFO.email);
    setIsLoginModalOpen(false);
    onEnterConsole();
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Floating Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-sm sm:text-base">Cloud Project Console</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                  Hub v3.8
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">Next-Gen Deployment & Edge Infrastructure</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-neutral-300">
            <button onClick={() => scrollToSection('section-about')} className="hover:text-white transition-colors">
              আমাদের সম্পর্কে (About)
            </button>
            <button onClick={() => scrollToSection('section-features')} className="hover:text-white transition-colors">
              ফিচারসমূহ (Features)
            </button>
            <button onClick={() => scrollToSection('section-architecture')} className="hover:text-white transition-colors">
              আর্কিটেকচার (Architecture)
            </button>
            <button onClick={() => scrollToSection('section-faq')} className="hover:text-white transition-colors">
              প্রশ্নোত্তর (FAQ)
            </button>
          </nav>

          {/* Auth & Console CTA buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs text-neutral-200 font-medium">{USER_INFO.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    লগইন করা আছে
                  </span>
                </div>
                <button
                  id="btn-nav-enter-console"
                  onClick={onEnterConsole}
                  className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
                >
                  <span>কনসোলে প্রবেশ করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-nav-open-login"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 border border-neutral-800 rounded-lg transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>লগইন করুন</span>
                </button>
                <button
                  id="btn-nav-direct-console"
                  onClick={onEnterConsole}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-100 hover:bg-white text-neutral-950 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>সরাসরি কনসোল ডেমো</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-neutral-800/80">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-600/15 via-blue-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-white">নতুন রিলিজ</span>
            <span className="text-neutral-500">•</span>
            <span className="text-indigo-300">এজ ইমেজ অপটিমাইজেশন ও ফায়ারক্র্যাকার মাইক্রো-ভিএম</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            আধুনিক ক্লাউড ডেপ্লয়মেন্ট ও এজ ইনফ্রাস্ট্রাকচার হাব
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
            একক সমন্বিত ড্যাশবোর্ডে পান গ্লোবাল এজ ট্রান্সকোডিং, ফায়ারক্র্যাকার মাইক্রো-ভিএম স্যান্ডবক্সিং,
            অটোনোমাস সেল্ফ-হিলিং অপস এবং সরাসরি জিমেইল ইনসিডেন্ট নোটিফিকেশন।
          </p>

          {/* Call to Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              id="hero-btn-enter-console"
              onClick={onEnterConsole}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>{isLoggedIn ? 'কনসোল ড্যাশবোর্ডে প্রবেশ করুন' : 'কনসোল ড্যাশবোর্ড দেখুন (Live)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="hero-btn-learn-more"
              onClick={() => scrollToSection('section-about')}
              className="px-5 py-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-200 border border-neutral-800 font-medium text-sm rounded-xl transition-colors flex items-center gap-2"
            >
              <span>প্ল্যাটফর্ম সম্পর্কে পড়ুন</span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>
            {!isLoggedIn && (
              <button
                id="hero-btn-login-modal"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-3 text-neutral-400 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-indigo-400" />
                <span>অ্যাকাউন্টে লগইন</span>
              </button>
            )}
          </div>

          {/* Key Metrics / Highlights Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-xs">
              <div className="text-2xl font-bold text-white tracking-tight">99.99%</div>
              <div className="text-xs text-neutral-400 mt-1">গ্লোবাল আপটাইম এসএলএ</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">সব এজ ক্লাস্টার সচল</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-xs">
              <div className="text-2xl font-bold text-indigo-400 tracking-tight">&lt; 32ms</div>
              <div className="text-xs text-neutral-400 mt-1">গ্লোবাল এজ লেটেন্সি</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">২৮৫+ এজ পিওপি (PoPs)</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-xs">
              <div className="text-2xl font-bold text-cyan-400 tracking-tight">-91.6%</div>
              <div className="text-xs text-neutral-400 mt-1">ব্যান্ডউইথ হ্রাস</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">Next-Gen AVIF/WebP</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-xs">
              <div className="text-2xl font-bold text-amber-400 tracking-tight">&lt; 120ms</div>
              <div className="text-xs text-neutral-400 mt-1">মাইক্রো-ভিএম বুট টাইম</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">সিকিউর ফায়ারক্র্যাকার কার্নেল</div>
            </div>
          </div>

          {/* Hero Visual Preview Showcase */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="p-2 rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden">
              <div className="rounded-xl overflow-hidden relative group">
                <img 
                  src="./public/assets/images/cloud_console_banner_1789929035948.jpg" 
                  alt="Cloud Project Console & Deployment Hub Dashboard Banner" 
                  className="w-full h-auto object-cover max-h-[460px] transform group-hover:scale-[1.01] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent flex items-end p-6 justify-between">
                  <div className="text-left">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-950/90 border border-indigo-800/80 text-[11px] font-mono text-indigo-300">
                      LIVE PRODUCTION CLUSTER
                    </span>
                    <h3 className="text-white font-bold text-lg mt-1">সেন্ট্রালাইজড ডেপ্লয়মেন্ট কনসোল প্রিভিউ</h3>
                    <p className="text-xs text-neutral-300 max-w-md">
                      ৩৮টি রিয়েল-টাইম প্রজেক্ট, সিকিউর ডোমেন, ডাব্লুএএফ ফায়ারওয়াল ও সেল্ফ-হিলিং অপস একসাথে।
                    </p>
                  </div>
                  <button
                    onClick={onEnterConsole}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-neutral-950 text-xs font-bold rounded-lg shadow-lg hover:bg-neutral-200 transition-colors"
                  >
                    <span>কনসোলে ডেমো দেখুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section: প্ল্যাটফর্ম সম্পর্কে জানুন */}
      <section id="section-about" className="py-20 border-b border-neutral-800/80 bg-neutral-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-mono font-semibold tracking-wider text-indigo-400 uppercase">
              আমাদের মিশন ও দৃষ্টিভঙ্গি
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              কেন তৈরি করা হলো এই ক্লাউড ডেপ্লয়মেন্ট কনসোল?
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              ঐতিহ্যগত ক্লাউড প্রোভাইডারদের বিচ্ছিন্ন টুলস (কনটেইনার, সিডিএন, লগস, ইমেজ প্রসেসর, ফায়ারওয়াল)
              পরিচালনা করা জটিল ও ব্যয়বহুল। আমাদের লক্ষ্য ছিল ডেভেলপার ও ডেভঅপস টিমকে একটি সর্বাধুনিক,
              স্বয়ংসম্পূর্ণ প্ল্যাটফর্ম উপহার দেওয়া যেখানে কোড ডেপ্লয়মেন্ট থেকে সেল্ফ-হিলিং পর্যন্ত সবকিছু স্বয়ংক্রিয়।
            </p>
          </div>

          {/* Three Pillar Cards */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">জিরো-কনফিগ এজ স্পিড</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                কোনো জটিল কনফিগারেশন ছাড়াই গিট পুশের সাথে সাথে অটোমেটেড বিল্ড এবং গ্লোবাল এজ নেটওয়ার্কে
                কন্টেন্ট ডেলিভারি শুরু হয়ে যায়।
              </p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">হার্ডেনড সিকিউরিটি ও আইসোলেশন</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                ফায়ারক্র্যাকার মাইক্রো-ভিএম আর্কিটেকচার প্রতিটি কোড এক্সিকিউশন ও স্যান্ডবক্সকে হার্ডওয়্যার-লেভেলে
                সম্পূর্ণ পৃথক রাখে।
              </p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">স্বয়ংক্রিয় সেল্ফ-হিলিং অপস</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                ডেপ্লয়মেন্টে ক্র্যাশ বা মেমোরি লিক ঘটলে কৃত্রিম বুদ্ধিমত্তা চালিত অপস এজেন্ট স্বয়ংক্রিয়ভাবে
                রুট কজ বিশ্লেষণ করে এবং জিরো-ডাউনটাইম রোলব্যাক ঘটায়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep-Dive Section */}
      <section id="section-features" className="py-20 border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
              কোর মডিউলসমূহ
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              প্ল্যাটফর্মের প্রধান ফিচার ও প্রযুক্তি
            </h2>
            <p className="text-neutral-400 text-sm">
              নিচের ট্যাবগুলোতে ক্লিক করে প্রতিটি গুরুত্বপূর্ণ সাব-সিস্টেমের কাজের পদ্ধতি বিস্তারিত জেনে নিন।
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 border-b border-neutral-800 pb-4">
            <button
              onClick={() => setActiveFeatureTab('images')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeFeatureTab === 'images'
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>১. এজ ইমেজ অপটিমাইজেশন</span>
            </button>
            <button
              onClick={() => setActiveFeatureTab('sandboxes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeFeatureTab === 'sandboxes'
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Box className="w-4 h-4 text-amber-400" />
              <span>২. মাইক্রো-ভিএম স্যান্ডবক্স</span>
            </button>
            <button
              onClick={() => setActiveFeatureTab('agent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeFeatureTab === 'agent'
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>৩. অটোনোমাস অপস এজেন্ট</span>
            </button>
            <button
              onClick={() => setActiveFeatureTab('gateway')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeFeatureTab === 'gateway'
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>৪. এআই গেটওয়ে ও প্রক্সি</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="mt-8">
            {activeFeatureTab === 'images' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 text-left">
                  <span className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono text-[11px]">
                    EDGE IMAGE PIPELINE & TRANSCODING
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    অন-দ্য-ফ্লাই নেক্সট-জেন ফরম্যাট কনভার্সন ও ৯০%+ ব্যান্ডউইথ সাশ্রয়
                  </h3>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    ব্রাউজারের আধুনিক ক্যাপাবিলিটির ওপর ভিত্তি করে মূল ছবিকে কোনো স্টোরেজ নষ্ট না করে
                    সার্ভারলেস এজে নিমেষেই AVIF বা WebP ফরম্যাটে রূপান্তর করা হয়।
                  </p>
                  <ul className="space-y-2.5 text-xs text-neutral-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span><strong>লাইভ সাইড-বাই-সাইড কম্প্যারিজন</strong>: কোয়ালিটি ও ফাইল সাইজের পার্থক্য সরাসরি স্ক্রিনে দেখা যায়।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span><strong>রেসপনসিভ HTML &lt;picture&gt; স্নsnippet</strong>: LCP এবং CLS স্কোর ১০০% উন্নত করতে স্বয়ংক্রিয় মার্কআপ জেনারেশন।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span><strong>স্মার্ট ক্রপিং ও মেটাডেটা স্ট্রিপিং</strong>: ফেস-ডিটেকশন ফোকাস এবং অপ্রয়োজনীয় এক্সিফ ডাটা অপ্টিমাইজেশন।</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={onEnterConsole}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>ইমেজ স্টুডিও কনসোলে পরীক্ষা করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl">
                  <img
                    src="./public/assets/images/edge_pipeline_cdn_1789929050562.jpg"
                    alt="Edge Image Optimization Pipeline Architecture"
                    className="w-full h-auto object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}

            {activeFeatureTab === 'sandboxes' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 text-left">
                  <span className="px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-800 text-amber-300 font-mono text-[11px]">
                    FIRECRACKER ISOLATED MICROVMS
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    আইসোলেটেড ও এফিমোরাল কম্পিউট স্যান্ডবক্সিং
                  </h3>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    প্রতিটি অ্যাপ্লিকেশন কোড টেস্ট ও ইন্টিগ্রেশন চালানো হয় লাইটওয়েট ফায়ারক্র্যাকার মাইক্রো-ভিএমে,
                    যা মিলিসেকেন্ডে বুট হয়ে সম্পূর্ণ হোস্ট-লেভেল আইসোলেশন নিশ্চিত করে।
                  </p>
                  <ul className="space-y-2.5 text-xs text-neutral-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>ডেডিকেটেড রিসোর্স এলোকেশন</strong>: প্রতি স্যান্ডবক্সে নির্ধারিত vCPU, RAM এবং ডিস্ক স্পেস মনিটরিং।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>ইনস্ট্যান্ট লাইফসাইকেল হ্যান্ডলিং</strong>: ১-ক্লিকে স্টার্ট, রিবুট, ফোর্স টার্মিনেট বা রি-ইমেজিং।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>জিরো কনটামিনেশন গ্যারান্টি</strong>: প্রতিটি টেস্ট রান শেষে ইনস্ট্যান্স নিরাপদে ধ্বংস করা হয়।</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={onEnterConsole}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <span>স্যান্ডবক্স ম্যানেজমেন্টে যান</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl">
                  <img
                    src="./public/assets/images/microvm_sandboxes_1789929064795.jpg"
                    alt="Firecracker MicroVM Sandboxes Architecture"
                    className="w-full h-auto object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}

            {activeFeatureTab === 'agent' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 text-left">
                  <span className="px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-800 text-purple-300 font-mono text-[11px]">
                    AUTONOMOUS SELF-HEALING
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    ২৪/৭ এআই ডেভঅপস ইঞ্জিনিয়ার ও অটোমেটেড রিকভারি
                  </h3>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    সার্ভিস ফেইলিউর বা ট্র্যাফিক স্পাইকে রাতের বেলা অ্যালার্ম বাজিয়ে কাউকে জাগিয়ে তোলার দিন শেষ।
                    আমাদের স্বয়ংক্রিয় এজেন্ট সমস্যা নির্ণয় করে দ্রুত প্যাচ প্রয়োগ করে।
                  </p>
                  <ul className="space-y-2.5 text-xs text-neutral-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span><strong>লগ অ্যানালাইসিস</strong>: হাজার হাজার লাইনের স্ট্যাকট্রেস বিশ্লেষণ করে মূল বাগ চিহ্নিতকরণ।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span><strong>জিরো-ডাউনটাইম রোলব্যাক</strong>: কোনো বিল্ড ফেইল হলে নিমিষে পূর্ববর্তী স্টেবল ভার্সনে প্রত্যাবর্তন।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span><strong>জিমেইল নোটিফিকেশন সিঙ্ক</strong>: প্রতিটি ইনসিডেন্ট ও অটো-ফিক্সের বিস্তারিত রিপোর্ট ইমেইলে প্রেরণ।</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={onEnterConsole}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <span>এজেন্ট অ্যাক্টিভিটি দেখতে যান</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/90 font-mono text-xs text-neutral-300 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-[11px] text-neutral-500">
                    <span>OPS-AGENT-TELEMETRY</span>
                    <span className="text-emerald-400">ACTIVE REMEDIATION</span>
                  </div>
                  <p className="text-amber-300">[WARN] 11:28:02 Pod latency threshold exceeded (&gt;450ms) on Edge cluster IAD1</p>
                  <p className="text-blue-300">[INFO] 11:28:03 Autonomous agent analyzing container heap dumps & GC metrics...</p>
                  <p className="text-purple-300">[EXEC] 11:28:05 Auto-scaling microVM pool: spin-up 4 additional instances</p>
                  <p className="text-emerald-400">[RESOLVED] 11:28:08 Latency normalized to 28ms. Zero requests dropped.</p>
                  <p className="text-neutral-400">[DISPATCH] Sent incident resolution report to {USER_INFO.email}</p>
                </div>
              </div>
            )}

            {activeFeatureTab === 'gateway' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 text-left">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-800 text-indigo-300 font-mono text-[11px]">
                    AI GATEWAY & INFERENCE PROXY
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    সিম্যান্টিক ক্যাশিং ও মাল্টি-মডেল ইনফারেন্স ম্যানেজমেন্ট
                  </h3>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    আপনার অ্যাপ্লিকেশন থেকে জেমিনি বা অন্যান্য এলএলএম কলগুলোকে অপ্টিমাইজ করার জন্য
                    স্মার্ট ক্যাশিং প্রক্সি, যা টোকেন খরচ প্রায় ৪০% পর্যন্ত কমিয়ে দেয়।
                  </p>
                  <ul className="space-y-2.5 text-xs text-neutral-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>সিম্যান্টিক টোকেন ক্যাশ</strong>: সদৃশ প্রম্পটগুলোর উত্তর এজ লেভেলে ক্যাশ থেকে ডেলিভারি।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>ফলব্যাক রাউটিং</strong>: প্রাইমারি মডেল রেট-লিমিট হলে স্বয়ংক্রিয়ভাবে সেকেন্ডারি মডেলে স্থানান্তর।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>রিয়েল-টাইম কস্ট মিটার</strong>: প্রতিটি ডিপার্টমেন্ট ও প্রজেক্টের এআই ব্যয় পর্যবেক্ষণ।</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={onEnterConsole}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>এআই গেটওয়ে কনসোলে যান</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/90 text-left space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs font-semibold text-white">Global AI Gateway Metrics</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Cache Hit Rate: 68.4%
                    </span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Total AI Requests:</span>
                      <span className="font-mono text-white">1,420,890</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Avg. Response Time:</span>
                      <span className="font-mono text-cyan-400">142 ms</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Estimated Token Savings:</span>
                      <span className="font-mono text-emerald-400">$2,410.50 (This Month)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive System Flow / Architecture */}
      <section id="section-architecture" className="py-20 border-b border-neutral-800/80 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold tracking-wider text-indigo-400 uppercase">
              সিস্টেম লাইফসাইকেল
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              গিট পুশ থেকে বিশ্বব্যাপী এজ ডেলিভারি
            </h2>
            <p className="text-neutral-400 text-sm">
              কিভাবে আমাদের ক্লাউড পাইপলাইন আপনার প্রজেক্টকে শূন্য থেকে প্রোডাকশনে পৌঁছে দেয়:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 relative">
              <div className="text-xs font-mono text-indigo-400 font-bold">ধাপ ০১</div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                গিট অটোমেশন
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                GitHub বা GitLab-এ পুশ করার সাথে সাথে ওয়েবহুক ট্রিগার হয় এবং ক্যানারি ব্রাঞ্চ তৈরি হয়।
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="text-xs font-mono text-amber-400 font-bold">ধাপ ০২</div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Box className="w-4 h-4 text-amber-400" />
                স্যান্ডবক্স টেস্ট
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                ফায়ারক্র্যাকার মাইক্রো-ভিএমে এনভায়রনমেন্ট ভেরিয়েবল ও এন্ড-টু-এন্ড টেস্ট স্বয়ংক্রিয়ভাবে সম্পন্ন হয়।
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="text-xs font-mono text-cyan-400 font-bold">ধাপ ০৩</div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                এজ ট্রান্সকোড
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                ইমেজ ও স্ট্যাটিক অ্যাসেটগুলো এজ সিডিএন-এ স্বয়ংক্রিয়ভাবে AVIF/WebP কম্প্রেসড ও ক্যাশড হয়।
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="text-xs font-mono text-emerald-400 font-bold">ধাপ ০৪</div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                ২৪/৭ গার্ডিয়ান
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                সেল্ফ-হিলিং এজেন্ট রিয়েল-টাইমে স্বাস্থ্য পরীক্ষা করে এবং কোনো বিঘ্ন হলে জিমেইলে অ্যালার্ট পাঠায়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section id="section-faq" className="py-20 border-b border-neutral-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-semibold tracking-wider text-neutral-400 uppercase">
              সচরাচর জিজ্ঞাসা
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              প্ল্যাটফর্ম সম্পর্কে সাধারণ প্রশ্নোত্তর
            </h2>
            <p className="text-neutral-400 text-sm">
              আপনার মনে আসা সাধারণ প্রশ্নের উত্তর এখানে পেয়ে যাবেন:
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '১. এই প্ল্যাটফর্মে কাজ শুরু করতে কি কোনো ক্রেডিট কার্ড প্রয়োজন?',
                a: 'না! আপনি সরাসরি কনসোলে ঢুকে ডেমো দেখতে পারেন এবং ফ্রি টায়ারে প্রজেক্ট ডেপ্লয় করে পরীক্ষা করতে পারেন। কোনো বাধ্যতামূলক ক্রেডিট কার্ডের প্রয়োজন নেই।'
              },
              {
                q: '২. এজ ইমেজ অপ্টিমাইজেশন কিভাবে ব্যান্ডউইথ ও লোডিং সময় সাশ্রয় করে?',
                a: 'যখন কোনো ইউজার আপনার সাইটে ভিজিট করে, আমাদের এজ সিডিএন তার ব্রাউজারের গ্রহণযোগ্যতা অনুযায়ী অরিজিনাল জেপিজি বা পিএনজি ছবিকে নিমেষেই আধুনিক AVIF বা WebP ফরম্যাটে রূপান্তর করে ক্যাশ করে। এতে ফাইল সাইজ প্রায় ৮৫% থেকে ৯২% পর্যন্ত হ্রাস পায় এবং সাইট চোখের পলকে লোড হয়।'
              },
              {
                q: '৩. ফায়ারক্র্যাকার মাইক্রো-ভিএম স্যান্ডবক্স কতটা নিরাপদ?',
                a: 'এটি অ্যাডভান্সড লিনাক্স KVM হাইপারভাইজর প্রযুক্তি ব্যবহার করে তৈরি। প্রতিটি অ্যাপ্লিকেশন টেস্ট ও রান সম্পূর্ণ পৃথক আইসোলেটেড কার্নেলে চলে, তাই হোস্ট বা অন্যান্য অ্যাপের কোনো ডাটা লিক হওয়ার ঝুঁকি থাকে না।'
              },
              {
                q: '৪. জিমেইল অ্যালার্ট কনফিগার করতে কত সময় লাগে?',
                a: 'মাত্র ১০ সেকেন্ড! আপনি এক ক্লিকে গুগল সাইন-ইন দিয়ে আপনার জিমেইল কানেক্ট করতে পারেন। এরপর যেকোনো ক্রিটিক্যাল এরর বা ডেপ্লয়মেন্ট স্ট্যাটাস সরাসরি আপনার ইনবক্সে নোটিফিকেশন হিসেবে আসবে।'
              },
              {
                q: '৫. আমি কি আমার নিজস্ব কাস্টম ডোমেন যুক্ত করতে পারব?',
                a: 'অবশ্যই! আমাদের Domains Console ব্যবহার করে আপনি যেকোনো কাস্টম ডোমেন (যেমন: example.com) স্বয়ংক্রিয় এসএসএল (SSL Certificate) এবং ডিডিওএস প্রটেকশনসহ সংযুক্ত করতে পারবেন।'
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4.5 text-left flex items-center justify-between gap-4 hover:bg-neutral-800/40 transition-colors"
                  >
                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4 text-xs text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ready to Explore CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            এখনই আপনার প্রজেক্ট কনসোলে প্রবেশ করুন
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            সব ফিচার স্বচক্ষে দেখার জন্য প্রস্তুত? আপনি লগইন করে বা সরাসরি গেস্ট ডেমো হিসেবে
            সম্পূর্ণ কার্যকরী কনসোল এক্সপ্লোর করতে পারেন।
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onEnterConsole}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>{isLoggedIn ? 'কনসোলে ফিরে যান' : 'সরাসরি কনসোল খুলুন (Explore Live)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {!isLoggedIn && (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 text-indigo-400" />
                <span>লগইন / সাইন-ইন করুন</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-10 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <Cloud className="w-3.5 h-3.5" />
            </div>
            <span className="text-neutral-300 font-semibold">Cloud Project Console & Deployment Hub</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-emerald-400 flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              285+ Global PoPs Operational
            </span>
            <span className="text-neutral-500">© 2026 All Rights Reserved</span>
          </div>
        </div>
      </footer>

      {/* Authentication / Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">প্ল্যাটফর্মে সাইন-ইন করুন</h3>
                  <p className="text-[11px] text-neutral-400">আপনার প্রজেক্ট কনসোল অ্যাক্সেস করতে লগইন করুন</p>
                </div>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded-md hover:bg-neutral-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick 1-Click Demo Login */}
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-300">১-ক্লিক দ্রুত ভেরিফাইড লগইন</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-200 px-1.5 py-0.5 rounded font-mono">RECOMMENDED</span>
              </div>
              <p className="text-[11px] text-neutral-300">
                অ্যাকাউন্ট: <strong className="text-white">{USER_INFO.email}</strong> ({USER_INFO.name})
              </p>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full mt-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{USER_INFO.name} হিসেবে সরাসরি প্রবেশ করুন</span>
              </button>
            </div>

            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <span className="relative px-3 bg-neutral-900 text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                অথবা ইমেইল দিয়ে লগইন
              </span>
            </div>

            {/* Standard Email/Password Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">ইমেইল ঠিকানা</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">পাসওয়ার্ড</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {loginFeedback && (
                <div className="text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 p-2 rounded text-center">
                  {loginFeedback}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    onEnterConsole();
                  }}
                  className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
                >
                  গেস্ট হিসেবে প্রবেশ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-white hover:bg-neutral-100 text-neutral-950 rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  লগইন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
