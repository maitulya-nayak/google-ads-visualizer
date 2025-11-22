import React, { useEffect, useRef, useState } from "react";
import {
  Upload,
  Type,
  Layout,
  Maximize,
  Box,
  Star,
  Image as ImageIcon,
  Moon,
  Sun,
  ZoomIn,
  Monitor,
  Download,
  Save,
  List,
  Eye,
} from "lucide-react";
import { toPng } from "html-to-image";

// ---------- Types ----------

interface AdSize {
  w: number;
  h: number;
}

interface AdProps {
  size: AdSize;
  image: string | null;
  headline: string;
  subhead: string;
  cta: string;
  primaryColor: string;
  darkMode: boolean;
  imageScale: number;
  imageOffset: { x: number; y: number };
  enableDrag?: boolean;
  onImageOffsetChange?: (offset: { x: number; y: number }) => void;
}

interface Preset {
  id: string;
  name: string;
  headline: string;
  subhead: string;
  cta: string;
  primaryColor: string;
  darkMode: boolean;
  imageScale: number;
  imageOffset: { x: number; y: number };
}

// ---------- Ad Canvas ----------

const AdCanvas: React.FC<AdProps> = ({
  size,
  image,
  headline,
  subhead,
  cta,
  primaryColor,
  darkMode,
  imageScale,
  imageOffset,
  enableDrag = false,
  onImageOffsetChange,
}) => {
  const isLeaderboard = size.w > size.h * 1.5;
  const isSkyscraper = size.h > size.w * 1.5;
  const isMicro = size.h <= 60;

  const containerBg = darkMode
    ? "bg-slate-900 border-slate-700"
    : "bg-white border-slate-200";
  const textColor = darkMode ? "text-white" : "text-slate-800";
  const subTextColor = darkMode ? "text-slate-300" : "text-slate-600";
  const placeholderColor = darkMode
    ? "bg-slate-800 border-slate-600 text-slate-500"
    : "bg-slate-50 border-slate-300 text-slate-300";

  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const offsetStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!enableDrag || !onImageOffsetChange || !image) return;
    e.preventDefault();
    setDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    offsetStartRef.current = { ...imageOffset };
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!enableDrag || !dragging || !onImageOffsetChange) return;
    if (!dragStartRef.current || !offsetStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    onImageOffsetChange({
      x: offsetStartRef.current.x + dx,
      y: offsetStartRef.current.y + dy,
    });
  };

  const stopDragging = () => setDragging(false);

  return (
    <div
      className={`${containerBg} border shadow-sm relative overflow-hidden flex cursor-default select-none transition-colors duration-200`}
      style={{ width: size.w, height: size.h }}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <div
        className={`relative z-10 w-full h-full flex p-3 ${
          isLeaderboard
            ? "flex-row items-center justify-between gap-4"
            : "flex-col gap-2"
        }`}
      >
        {/* Image */}
        <div
          className={`
            flex items-center justify-center shrink-0 relative overflow-hidden
            ${
              isLeaderboard
                ? isMicro
                  ? "w-12 ml-auto order-2"
                  : "w-1/4 h-full order-last"
                : isSkyscraper
                ? "w-full h-1/3 mt-8"
                : "w-full h-1/2 mt-4"
            }
          `}
          onMouseDown={handleMouseDown}
        >
          {image ? (
            <img
              src={image}
              alt="Creative"
              className="max-h-full max-w-full object-contain transition-transform duration-100"
              style={{
                transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageScale})`,
                cursor: enableDrag ? "grab" : "default",
              }}
            />
          ) : (
            <div
              className={`w-full h-full border border-dashed rounded flex items-center justify-center ${placeholderColor}`}
            >
              <ImageIcon size={isMicro ? 12 : 24} />
            </div>
          )}
        </div>

        {/* Text */}
        <div
          className={`
            flex flex-col justify-center flex-grow
            ${
              isLeaderboard
                ? "text-left items-start pl-2"
                : "text-center items-center"
            }
          `}
        >
          <h3
            className={`font-bold leading-tight font-sans ${textColor}`}
            style={{
              fontSize: isMicro
                ? "11px"
                : isLeaderboard
                ? "18px"
                : isSkyscraper
                ? "20px"
                : "18px",
            }}
          >
            {headline}
          </h3>
          {!isMicro && (
            <p
              className={`mt-1 leading-snug font-sans ${subTextColor}`}
              style={{ fontSize: isSkyscraper ? "14px" : "12px" }}
            >
              {subhead}
            </p>
          )}
        </div>

        {/* CTA */}
        <div
          className={`
            flex items-center shrink-0
            ${
              isLeaderboard
                ? "w-auto"
                : "w-full mt-auto pt-1 justify-center"
            }
          `}
        >
          <button
            className="font-medium shadow-sm rounded-md transition-all whitespace-nowrap text-white font-sans"
            style={{
              backgroundColor: primaryColor,
              padding: isMicro ? "2px 8px" : "6px 16px",
              fontSize: isMicro ? "10px" : "12px",
            }}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Character Counter ----------

const CharCounter: React.FC<{ current: number; max: number }> = ({
  current,
  max,
}) => {
  const isOver = current > max;
  return (
    <span
      className={`text-[10px] font-mono ml-auto ${
        isOver ? "text-red-500 font-bold" : "text-slate-400"
      }`}
    >
      {current}/{max}
    </span>
  );
};

// ---------- Ad Preview Card (with Download) ----------

interface AdPreviewSettings {
  image: string | null;
  headline: string;
  subhead: string;
  cta: string;
  primaryColor: string;
  darkMode: boolean;
  imageScale: number;
  imageOffset: { x: number; y: number };
}

interface AdPreviewCardProps {
  label: string;
  size: AdSize;
  settings: AdPreviewSettings;
  highlightDrag?: boolean;
  onImageOffsetChange?: (offset: { x: number; y: number }) => void;
}

const AdPreviewCard: React.FC<AdPreviewCardProps> = ({
  label,
  size,
  settings,
  highlightDrag = false,
  onImageOffsetChange,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = async () => {
    if (!wrapperRef.current) return;
    try {
      const dataUrl = await toPng(wrapperRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      const safeLabel = label.toLowerCase().replace(/\s+/g, "-");
      link.download = `${safeLabel}-${size.w}x${size.h}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed", err);
      alert("Could not export PNG. Check console for details.");
    }
  };

  return (
    <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] text-slate-400 font-mono uppercase">
          {label} ({size.w}x{size.h})
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-slate-300 text-slate-600 hover:bg-white active:scale-95"
        >
          <Download size={10} /> PNG
        </button>
      </div>
      <div ref={wrapperRef} className="flex justify-center">
        <AdCanvas
          size={size}
          image={settings.image}
          headline={settings.headline}
          subhead={settings.subhead}
          cta={settings.cta}
          primaryColor={settings.primaryColor}
          darkMode={settings.darkMode}
          imageScale={settings.imageScale}
          imageOffset={settings.imageOffset}
          enableDrag={highlightDrag}
          onImageOffsetChange={onImageOffsetChange}
        />
      </div>
    </div>
  );
};

// ---------- Main App ----------

const App: React.FC = () => {
  // Images
  const [images, setImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Copy - all empty by default
  const [headline, setHeadline] = useState("");
  const [subhead, setSubhead] = useState("");
  const [cta, setCta] = useState("");

  // Design
  const [primaryColor, setPrimaryColor] = useState("#EF4444");
  const [darkMode, setDarkMode] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });

  // Presets
  const [presets, setPresets] = useState<Preset[]>(() => {
    try {
      const raw = localStorage.getItem("ga-visualizer-presets");
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Could not load presets", e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "ga-visualizer-presets",
        JSON.stringify(presets.slice(0, 10))
      );
    } catch (e) {
      console.warn("Could not save presets", e);
    }
  }, [presets]);

  const activeImage = images[activeImageIndex] ?? null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const data = ev.target.result as string;
          setImages((prev) => {
            const next = [...prev, data];
            setActiveImageIndex(next.length - 1);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePreset = () => {
    const name = window.prompt("Preset name?", "Default layout");
    if (!name) return;
    const preset: Preset = {
      id: Date.now().toString(),
      name,
      headline,
      subhead,
      cta,
      primaryColor,
      darkMode,
      imageScale,
      imageOffset,
    };
    setPresets((prev) => [preset, ...prev].slice(0, 10));
  };

  const applyPreset = (preset: Preset) => {
    setHeadline(preset.headline);
    setSubhead(preset.subhead);
    setCta(preset.cta);
    setPrimaryColor(preset.primaryColor);
    setDarkMode(preset.darkMode);
    setImageScale(preset.imageScale);
    setImageOffset(preset.imageOffset);
  };

  const deletePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const sharedSettings: AdPreviewSettings = {
    image: activeImage,
    headline,
    subhead,
    cta,
    primaryColor,
    darkMode,
    imageScale,
    imageOffset,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <Monitor size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Google Ads <span className="text-blue-600">Visualizer by Maitulya</span>
            </h1>
            <p className="text-xs text-slate-500">
              Internal creative QA for Display campaigns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-500">
            <Eye size={12} /> Preview only
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Star size={12} /> v1.2
          </span>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-4 h-fit lg:sticky lg:top-24">
          {/* Assets */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Upload size={14} /> Creative assets
            </h2>

            {/* Upload */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Upload final banner (PNG/JPG)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className={`border rounded-md p-3 text-center transition-colors ${
                    images.length
                      ? "border-green-400 bg-green-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {images.length ? (
                    <span className="text-green-700 text-xs font-medium">
                      {images.length} creative
                      {images.length > 1 ? "s" : ""} uploaded
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">
                      Click to upload creative
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Variants
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Click to switch
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`border rounded-md p-1 shrink-0 ${
                        activeImageIndex === idx
                          ? "border-blue-500 ring-1 ring-blue-300"
                          : "border-slate-200"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`variant-${idx + 1}`}
                        className="w-12 h-12 object-contain bg-slate-50"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scale */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <ZoomIn size={12} /> Image scale
                </label>
                <span className="text-[10px] text-slate-400">
                  {Math.round(imageScale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={imageScale}
                onChange={(e) => setImageScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Halo checker */}
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
              <div className="flex items-center gap-2">
                {darkMode ? (
                  <Moon size={14} className="text-blue-600" />
                ) : (
                  <Sun size={14} className="text-slate-400" />
                )}
                <span className="text-xs font-semibold text-slate-600">
                  Halo checker
                </span>
              </div>
              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  darkMode ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${
                    darkMode ? "translate-x-4" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Copy */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Type size={14} /> Copy compliance
            </h2>
            <div className="space-y-4">
              {/* Headline */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Headline
                  </label>
                  <CharCounter current={headline.length} max={30} />
                </div>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded text-sm outline-none focus:ring-1 ${
                    headline.length > 30
                      ? "border-red-300 focus:ring-red-200 bg-red-50"
                      : "border-slate-200 focus:ring-blue-500"
                  }`}
                />
              </div>

              {/* Subhead */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Subhead
                  </label>
                  <CharCounter current={subhead.length} max={90} />
                </div>
                <input
                  type="text"
                  value={subhead}
                  onChange={(e) => setSubhead(e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded text-sm outline-none focus:ring-1 ${
                    subhead.length > 90
                      ? "border-red-300 focus:ring-red-200 bg-red-50"
                      : "border-slate-200 focus:ring-blue-500"
                  }`}
                />
              </div>

              {/* CTA */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Button label
                  </label>
                  <CharCounter current={cta.length} max={15} />
                </div>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded text-sm outline-none focus:ring-1 ${
                    cta.length > 15
                      ? "border-red-300 focus:ring-red-200 bg-red-50"
                      : "border-slate-200 focus:ring-blue-500"
                  }`}
                />
              </div>

              {/* Button color */}
              <div className="pt-2 mt-2 border-t border-slate-100">
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">
                  Button color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    "#EF4444",
                    "#EA4335",
                    "#FBBC04",
                    "#34A853",
                    "#4285F4",
                    "#111827",
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setPrimaryColor(color)}
                      className={`w-6 h-6 rounded-full border ${
                        primaryColor === color
                          ? "ring-2 ring-offset-1 ring-slate-300 border-transparent"
                          : "border-slate-200"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border-0 p-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <List size={14} /> Layout presets
            </h2>
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleSavePreset}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded text-xs bg-slate-900 text-white hover:bg-slate-800 active:scale-95"
              >
                <Save size={12} /> Save current
              </button>
            </div>
            {presets.length === 0 ? (
              <p className="text-[11px] text-slate-400">
                Save common layouts here per brand or campaign.
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {presets.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-100 rounded px-2 py-1"
                  >
                    <button
                      onClick={() => applyPreset(p)}
                      className="text-left flex-1 hover:text-blue-600"
                    >
                      {p.name}
                    </button>
                    <button
                      onClick={() => deletePreset(p.id)}
                      className="text-slate-400 hover:text-red-500 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main preview */}
        <div className="lg:col-span-9 space-y-8">
          {/* High impact */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Star className="text-amber-500" size={16} /> Billboard high
              impact
            </h3>
            <AdPreviewCard
              label="Billboard"
              size={{ w: 970, h: 250 }}
              settings={sharedSettings}
              highlightDrag
              onImageOffsetChange={setImageOffset}
            />
          </section>

          {/* Rectangles */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Box className="text-blue-500" size={16} /> Rectangles high volume
            </h3>
            <div className="flex flex-wrap gap-6">
              {[
                { w: 300, h: 250, label: "Medium rectangle" },
                { w: 336, h: 280, label: "Large rectangle" },
                { w: 250, h: 250, label: "Square" },
              ].map((spec, i) => (
                <AdPreviewCard
                  key={i}
                  label={spec.label}
                  size={{ w: spec.w, h: spec.h }}
                  settings={sharedSettings}
                />
              ))}
            </div>
          </section>

          {/* Leaderboards */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Maximize className="text-green-500" size={16} /> Leaderboards
            </h3>
            <div className="space-y-6">
              <AdPreviewCard
                label="Leaderboard"
                size={{ w: 728, h: 90 }}
                settings={sharedSettings}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <AdPreviewCard
                  label="Mobile leaderboard"
                  size={{ w: 320, h: 50 }}
                  settings={sharedSettings}
                />
                <AdPreviewCard
                  label="Large mobile"
                  size={{ w: 320, h: 100 }}
                  settings={sharedSettings}
                />
              </div>
            </div>
          </section>

          {/* Skyscrapers */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Layout className="text-purple-500" size={16} /> Skyscrapers
            </h3>
            <div className="flex flex-wrap gap-6 items-start">
              {[
                { w: 300, h: 600, label: "Half page" },
                { w: 160, h: 600, label: "Wide skyscraper" },
                { w: 240, h: 400, label: "Vertical rectangle" },
              ].map((spec, i) => (
                <AdPreviewCard
                  key={i}
                  label={spec.label}
                  size={{ w: spec.w, h: spec.h }}
                  settings={sharedSettings}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default App;
