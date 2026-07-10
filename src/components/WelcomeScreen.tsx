import { BookOpen, Grid3X3, ArrowLeft } from "lucide-react";

export default function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400">
          <Grid3X3 size={32} strokeWidth={1.5} />
          <BookOpen size={40} strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Welcome to the Football Glossary
          </h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Your visual guide to American football formations and terminology.
            Explore interactive diagrams, definitions, and more.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-2.5">
          <ArrowLeft size={16} className="shrink-0 animate-pulse" />
          <span>
            Browse formations and terms in the sidebar to get started
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-left">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              🏈 Formations
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Visual diagrams of offensive and defensive formations with player
              positions.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-left">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              📖 Terminology
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Definitions for scoring, positions, plays, rules, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}