"use client";

import { useState } from "react";
import { Scissors, Layers, Zap, ArrowRight, ArrowLeft, ZoomIn, Video, Image } from "lucide-react";
import { TransitionType, transitionRegistry, getTransitionEffect, validateTransitionConfig, TransitionConfig } from "@/lib/transitions/TransitionTypes";

interface StudioTransitionsProps {
  currentTransition: TransitionType;
  onTransitionChange: (type: TransitionType) => void;
  onTransitionExecute: () => void;
  transitionDuration: number;
  onDurationChange: (duration: number) => void;
}

const BASE_TRANSITIONS: { type: TransitionType; icon: any; label: string }[] = [
  { type: "CUT", icon: Scissors, label: "Cut" },
  { type: "FADE", icon: Layers, label: "Fade" },
  { type: "FADE_TO_BLACK", icon: Zap, label: "Fade to Black" },
  { type: "CROSS_DISSOLVE", icon: Layers, label: "Cross Dissolve" },
  { type: "SLIDE", icon: ArrowRight, label: "Slide" },
  { type: "SWIPE_LEFT", icon: ArrowLeft, label: "Swipe Left" },
  { type: "SWIPE_RIGHT", icon: ArrowRight, label: "Swipe Right" },
  { type: "ZOOM", icon: ZoomIn, label: "Zoom" },
];

const ADVANCED_TRANSITIONS: { type: TransitionType; icon: any; label: string; requiresConfig: boolean }[] = [
  { type: "STINGER", icon: Video, label: "Stinger", requiresConfig: true },
  { type: "LUMA_WIPE", icon: Image, label: "Luma Wipe", requiresConfig: true },
  { type: "CUSTOM", icon: Layers, label: "Custom", requiresConfig: true },
];

export default function StudioTransitions({
  currentTransition,
  onTransitionChange,
  onTransitionExecute,
  transitionDuration,
  onDurationChange,
}: StudioTransitionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentTransitionData = [...BASE_TRANSITIONS, ...ADVANCED_TRANSITIONS].find(t => t.type === currentTransition);
  const CurrentIcon = currentTransitionData?.icon || Scissors;
  const isAdvanced = ADVANCED_TRANSITIONS.some(t => t.type === currentTransition);

  const handleTransitionSelect = (type: TransitionType) => {
    onTransitionChange(type);
    setShowMenu(false);
  };

  return (
    <div className="bg-[#16161f] rounded-lg p-4 flex flex-col gap-3">
      <div className="text-white text-xs font-semibold mb-1">TRANSITION</div>
      
      {/* Transition Type Selector */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full flex items-center justify-between gap-2 bg-[#252535] hover:bg-[#353545] px-3 py-2 rounded-lg transition"
        >
          <div className="flex items-center gap-2">
            <CurrentIcon size={16} className={isAdvanced ? "text-violet-400" : "text-emerald-400"} />
            <span className="text-white text-sm font-medium">{currentTransitionData?.label || "Cut"}</span>
          </div>
          <span className="text-gray-400 text-xs">{isAdvanced ? "ADV" : "STD"}</span>
        </button>

        {showMenu && (
          <div className="absolute left-0 top-full mt-2 bg-[#252535] rounded-lg shadow-xl border border-gray-700 z-10 w-56">
            {/* Base Transitions */}
            <div className="p-2">
              <div className="text-gray-500 text-xs font-semibold mb-1 px-2">STANDARD</div>
              {BASE_TRANSITIONS.map((transition) => {
                const Icon = transition.icon;
                return (
                  <button
                    key={transition.type}
                    onClick={() => handleTransitionSelect(transition.type)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition rounded ${
                      currentTransition === transition.type
                        ? "bg-emerald-600/20 text-emerald-400"
                        : "text-gray-300 hover:bg-[#353545]"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{transition.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Advanced Transitions */}
            <div className="border-t border-gray-700 p-2">
              <div className="text-gray-500 text-xs font-semibold mb-1 px-2">ADVANCED</div>
              {ADVANCED_TRANSITIONS.map((transition) => {
                const Icon = transition.icon;
                return (
                  <button
                    key={transition.type}
                    onClick={() => handleTransitionSelect(transition.type)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition rounded ${
                      currentTransition === transition.type
                        ? "bg-violet-600/20 text-violet-400"
                        : "text-gray-300 hover:bg-[#353545]"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{transition.label}</span>
                    {transition.requiresConfig && (
                      <span className="text-xs text-yellow-500">⚙</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Duration Slider */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-xs w-16">Duration</span>
        <input
          type="range"
          min={100}
          max={2000}
          step={100}
          value={transitionDuration}
          onChange={(e) => onDurationChange(parseInt(e.target.value))}
          className="flex-1 h-1 accent-emerald-500"
        />
        <span className="text-gray-400 text-xs w-12 text-right">{transitionDuration}ms</span>
      </div>

      {/* Execute Transition Button */}
      <button
        onClick={onTransitionExecute}
        className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition"
      >
        EXECUTE
      </button>

      {/* Advanced Transition Config Warning */}
      {isAdvanced && (
        <div className="text-yellow-500 text-xs text-center">
          Configuration requise
        </div>
      )}
    </div>
  );
}
