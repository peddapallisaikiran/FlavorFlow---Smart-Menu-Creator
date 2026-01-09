import React, { useState, useRef, useEffect } from 'react';
import { MenuItem, AIParseResult } from '../types';
import { parseMenuItem, generateImage, getUnsplashFallback } from '../services/geminiService';
import { 
  Plus, Trash2, Loader2, Share2, Sparkles, Wand2, Info, 
  Camera, Image as ImageIcon, Check, RefreshCcw, ArrowLeft, AlertTriangle, ExternalLink
} from 'lucide-react';

interface Props {
  items: MenuItem[];
  onAddItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
}

const MerchantDashboard: React.FC<Props> = ({ items, onAddItem, onDeleteItem }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<{message: string, type: 'api' | 'user' | 'quota'} | null>(null);
  
  const [draft, setDraft] = useState<AIParseResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiKey = process.env.API_KEY;
  const isApiKeyMissing = !apiKey || apiKey === 'undefined' || apiKey === '';

  const handleInitialParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (isApiKeyMissing) {
      setError({
        message: "API Key is missing. Please check your .env file.",
        type: 'api'
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parseMenuItem(input);
      setDraft(parsed);
      // Immediately set a placeholder based on the title
      setPreviewImage(getUnsplashFallback(parsed.title));
    } catch (err: any) {
      setError({
        message: "Failed to parse dish. Please try describing it more clearly.",
        type: 'user'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFallback = () => {
    if (!draft) return;
    setPreviewImage(getUnsplashFallback(draft.title));
    setError({
      message: "AI Generation is currently restricted in your region/plan. Switched to professional search fallback.",
      type: 'quota'
    });
  };

  const handleGenerateAIImage = async () => {
    if (!draft) return;
    setIsImageLoading(true);
    setError(null);
    try {
      const base64 = await generateImage(draft.title);
      setPreviewImage(base64);
    } catch (err: any) {
      if (err.message === "QUOTA_EXHAUSTED") {
        triggerFallback();
      } else {
        setError({
          message: "AI Generation failed. Try Unsplash or Upload instead.",
          type: 'api'
        });
      }
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (!draft || !previewImage) return;
    onAddItem({
      id: Math.random().toString(36).substr(2, 9),
      ...draft,
      imageUrl: previewImage,
      createdAt: Date.now(),
    });
    setDraft(null);
    setPreviewImage(null);
    setInput('');
    setError(null);
  };

  const shareToWhatsApp = (item: MenuItem) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const message = `🔥 *${item.title}* is now available!\n\n${item.description}\n\nPrice: ₹${item.price}\n\n😋 Order now at: ${baseUrl}#/`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 pt-16 pb-36 px-4">
        <div className="max-w-4xl mx-auto text-white">
          <div className="flex items-center space-x-2 mb-4 bg-white/20 backdrop-blur-md w-fit px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>AI powered Merchant Studio</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold heading-font mb-2">Create & Share instantly.</h1>
          <p className="text-white/80">Talk your menu into existence with Gemini AI.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24">
        {!draft ? (
          <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-2xl border border-red-50">
            <form onSubmit={handleInitialParse} className="space-y-6">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., Signature Grilled Lamb Chops with rosemary and a side of mash for ₹799"
                className="w-full h-40 p-6 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all text-lg font-medium outline-none resize-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-red-700 shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Wand2 className="w-5 h-5" /><span>Analyze with AI</span></>}
              </button>
              {error && error.type !== 'quota' && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center">
                  <Info className="w-4 h-4 mr-2" /> {error.message}
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-red-50">
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => { setDraft(null); setError(null); }} className="flex items-center text-gray-400 font-bold hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-1" /> Back
              </button>
              <div className="text-xs font-black text-gray-300 uppercase tracking-widest">Step 2: Customize Photo</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-gray-100 group">
                  <img src={previewImage || ''} className="w-full h-full object-cover" alt="Preview" />
                  {isImageLoading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-red-600">
                      <Loader2 className="w-12 h-12 animate-spin mb-4" />
                      <span className="font-black text-xs uppercase tracking-widest animate-pulse">Generating...</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Preview
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{draft.title}</h3>
                  <p className="text-red-600 font-black text-xl">₹{draft.price}</p>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                {error?.type === 'quota' && (
                  <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-3xl space-y-2 animate-in fade-in slide-in-from-top duration-500">
                    <div className="flex items-start space-x-3 text-amber-800">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="text-sm font-black">AI Limit Reached</p>
                        <p className="text-xs mt-1">Free tier restrictions applied. We've loaded a professional fallback photo instead!</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <button 
                    onClick={handleGenerateAIImage}
                    disabled={isImageLoading}
                    className="w-full bg-white text-gray-800 p-5 rounded-3xl font-bold flex items-center justify-between border-2 border-gray-100 hover:border-red-500 transition-all disabled:opacity-40 group"
                  >
                    <div className="flex items-center space-x-4 text-left">
                      <div className="p-2 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors"><Sparkles className="w-6 h-6 text-orange-600" /></div>
                      <div>
                        <span className="block text-base">Generate AI Image</span>
                        <span className="text-[10px] text-gray-400 uppercase font-black">Premium Quality</span>
                      </div>
                    </div>
                  </button>

                  {/* <button 
                    onClick={() => { setPreviewImage(getUnsplashFallback(draft.title)); setError(null); }}
                    className="w-full bg-white text-gray-800 p-5 rounded-3xl font-bold flex items-center justify-between border-2 border-gray-100 hover:border-red-500 transition-all group"
                  >
                    <div className="flex items-center space-x-4 text-left">
                      <div className="p-2 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors"><ImageIcon className="w-6 h-6 text-amber-600" /></div>
                      <div>
                        <span className="block text-base">Search New Photo</span>
                        <span className="text-[10px] text-gray-400 uppercase font-black">Professional Stock</span>
                      </div>
                    </div>
                  </button> */}

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white text-gray-800 p-5 rounded-3xl font-bold flex items-center justify-between border-2 border-gray-100 hover:border-red-500 transition-all group"
                  >
                    <div className="flex items-center space-x-4 text-left">
                      <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors"><Camera className="w-6 h-6 text-blue-600" /></div>
                      <div>
                        <span className="block text-base">Upload Custom</span>
                        <span className="text-[10px] text-gray-400 uppercase font-black">Camera / Gallery</span>
                      </div>
                    </div>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                </div>

                <button 
                  onClick={handlePublish}
                  className="w-full bg-green-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 mt-4"
                >
                  <Check className="w-7 h-7" />
                  <span>PUBLISH TO MENU</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 space-y-8">
          <h2 className="text-2xl font-black text-gray-800 px-2">Live Menu Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 flex flex-col group">
                <div className="h-56 relative overflow-hidden">
                  <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-4 right-4 bg-red-600 text-white px-4 py-1.5 rounded-xl font-black">
                    ₹{item.price}
                  </div>
                </div>
                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => shareToWhatsApp(item)}
                      className="flex-grow bg-[#25D366] text-white py-4 rounded-2xl font-black flex items-center justify-center space-x-2 shadow-lg shadow-green-500/10 active:scale-[0.98] transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>SHARE</span>
                    </button>
                    <button 
                      onClick={() => onDeleteItem(item.id)}
                      className="p-4 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl transition-colors active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;