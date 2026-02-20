import { BookOpen, Grid3X3, ArrowLeft } from "lucide-react";

/**
 * Shown in the main panel when no formation or term is selected.
 * Guides new visitors toward the sidebar.
 */
export default function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        {/* Icon cluster */}
        <div className="flex items-center justify-center gap-3 text-emerald-600">
          <Grid3X3 size={32} strokeWidth={1.5} />
          <BookOpen size={40} strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome to the Football Glossary
          </h1>
          <p className="text-slate-500 leading-relaxed">
            Your visual guide to American football formations and terminology.
            Explore interactive diagrams, definitions, and more.
          </p>
        </div>

        {/* Pointer toward sidebar */}
        <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
          <ArrowLeft size={16} className="shrink-0 animate-pulse" />
          <span>
            Browse formations and terms in the sidebar to get started
          </span>
        </div>

        {/* Quick-start hints */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-left">
            <div className="text-sm font-semibold text-slate-700 mb-1">
              🏈 Formations
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Visual diagrams of offensive and defensive formations with player
              positions.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-left">
            <div className="text-sm font-semibold text-slate-700 mb-1">
              📖 Terminology
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Definitions for scoring, positions, plays, rules, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}