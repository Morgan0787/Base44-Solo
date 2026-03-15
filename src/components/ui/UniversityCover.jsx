import React from 'react';
import { MapPin } from 'lucide-react';

const REGION_GRADIENTS = {
    "Europe": "from-blue-500 via-indigo-500 to-purple-600",
    "North America": "from-emerald-500 via-teal-500 to-cyan-600",
    "Asia": "from-rose-500 via-pink-500 to-fuchsia-600",
    "Middle East": "from-amber-500 via-orange-500 to-red-600",
    "Oceania": "from-sky-500 via-blue-500 to-indigo-600",
    "South America": "from-lime-500 via-green-500 to-emerald-600"
};

export default function UniversityCover({ university, size = "default" }) {
    const gradient = REGION_GRADIENTS[university.region] || "from-slate-600 via-slate-700 to-slate-800";
    
    const isSmall = size === "small";
    const isLarge = size === "large";
    
    return (
        <div className={`relative w-full h-full bg-gradient-to-br ${gradient} overflow-hidden`}>
            {/* Subtle pattern overlay */}
            <div 
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />
            
            {/* Content overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-4">
                {!isSmall && (
                    <>
                        <h3 className={`font-bold text-white leading-tight mb-1 line-clamp-2 ${isLarge ? 'text-2xl' : 'text-base'}`}>
                            {university.name}
                        </h3>
                        <div className="flex items-center gap-1 text-white/90">
                            <MapPin className={`${isLarge ? 'w-4 h-4' : 'w-3 h-3'} flex-shrink-0`} />
                            <span className={`${isLarge ? 'text-sm' : 'text-xs'} truncate`}>
                                {university.city}, {university.country}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}