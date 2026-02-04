import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="px-3 pb-2">
      <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-emerald-500 transition-all duration-200">
        <Search size={15} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search formations..."
          className="bg-transparent text-white placeholder-slate-500 text-sm outline-none w-full"
        />
      </div>
    </div>
  );
}