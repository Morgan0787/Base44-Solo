import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Bookmark, BookmarkCheck, ExternalLink, Award, GitCompare } from 'lucide-react';
import ChanceIndicator from '@/components/ui/ChanceIndicator';
import { motion } from 'framer-motion';
import UniversityCover from '@/components/ui/UniversityCover';
import { useLanguage } from '@/lib/i18n';

function calculateChance(university, userGpa, userIelts, userTopik) {
    if (!userGpa) return 'medium';
    
    let score = 0;
    const isKorean = university.country === "South Korea";
    
    // GPA score (50% weight for Korean unis with TOPIK, 60% otherwise)
    const gpaWeight = isKorean && university.topikLevel ? 50 : 60;
    const gpaDiff = userGpa - university.min_gpa;
    if (gpaDiff >= 0.3) score += gpaWeight;
    else if (gpaDiff >= -0.2) score += gpaWeight * 0.67;
    else score += gpaWeight * 0.33;
    
    // Language score (IELTS or TOPIK)
    if (isKorean && university.topikLevel) {
        // TOPIK scoring (30% weight)
        const topikLevels = { "Not taken": 0, "TOPIK 1": 1, "TOPIK 2": 2, "TOPIK 3": 3, "TOPIK 4": 4, "TOPIK 5": 5, "TOPIK 6": 6 };
        const userLevel = topikLevels[userTopik] || 0;
        const requiredLevel = parseInt(university.topikLevel.split(' ')[1]) || 0;
        
        if (userLevel === 0) {
            score += 0; // No TOPIK
        } else if (userLevel >= requiredLevel + 1) {
            score += 30;
        } else if (userLevel >= requiredLevel) {
            score += 25;
        } else if (userLevel >= requiredLevel - 1) {
            score += 10;
        } else {
            score += 0;
        }
        
        // IELTS for Korean unis (20% weight)
        if (university.required_ielts) {
            if (userIelts >= university.required_ielts) score += 20;
            else if (userIelts >= university.required_ielts - 0.5) score += 10;
        } else {
            score += 20;
        }
    } else {
        // Standard IELTS scoring (40% weight)
        if (university.required_ielts) {
            if (userIelts === 0) {
                score += 0;
            } else if (userIelts >= university.required_ielts) {
                score += 40;
            } else if (userIelts >= university.required_ielts - 0.5) {
                score += 20;
            } else {
                score += 0;
            }
        } else {
            score += 40;
        }
    }
    
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
}

export default function UniversityCard({ university, userGpa, userIelts, userTopik, isSaved, onSave, onView, isComparing, onCompareToggle }) {
    const { t } = useLanguage();
    const chance = calculateChance(university, userGpa, userIelts, userTopik);
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="group overflow-hidden border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col">
                {/* Header with cover */}
                <div className="relative h-28 overflow-hidden">
                    <UniversityCover university={university} size="small" />
                    <div className="absolute top-3 right-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-white/90 hover:bg-white shadow-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSave(university.id);
                            }}
                        >
                            {isSaved ? (
                                <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                            ) : (
                                <Bookmark className="w-4 h-4 text-slate-400" />
                            )}
                        </Button>
                    </div>
                    {university.scholarships_available && (
                        <div className="absolute top-3 left-3">
                            <Badge className="bg-emerald-500 text-white border-0 shadow-sm">
                                <Award className="w-3 h-3 mr-1" />
                                {t('university.scholarships')}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <div>
                        <h3 className="font-semibold text-slate-800 text-base leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {university.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{university.city}, {university.country}</span>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="space-y-1.5 py-2 border-y border-slate-100">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('university.tuition')}</p>
                                <p className="font-semibold text-slate-800 text-sm truncate">
                                    {university.tuition_min === 0 ? (
                                        <span className="text-emerald-600">{t('university.free')}</span>
                                    ) : (
                                        <>€{university.tuition_min?.toLocaleString()}</>
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('university.minGpa')}</p>
                                <p className="font-semibold text-slate-800 text-sm">{university.min_gpa?.toFixed(1)}</p>
                            </div>
                        </div>
                        {university.required_ielts ? (
                            <div className="text-xs text-slate-600">
                                <span className="text-slate-500">IELTS:</span> {university.required_ielts}+
                                {userIelts === 0 && (
                                    <span className="ml-1 text-amber-600">({t('university.required')})</span>
                                )}
                            </div>
                        ) : null}
                        {university.country === "South Korea" && university.topikLevel ? (
                            <div className="text-xs text-slate-600">
                                <span className="text-slate-500">🇰🇷 TOPIK:</span> {university.topikLevel.split(' ')[1]}+
                                {(!userTopik || userTopik === "Not taken") && (
                                    <span className="ml-1 text-amber-600">({t('university.required')})</span>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal text-[10px] px-1.5 py-0.5">
                            <Globe className="w-2.5 h-2.5 mr-1" />
                            {university.language}
                        </Badge>
                        {university.degree_levels?.slice(0, 2).map(deg => (
                            <Badge key={deg} variant="secondary" className="bg-indigo-50 text-indigo-600 font-normal text-[10px] px-1.5 py-0.5">
                                {deg}
                            </Badge>
                        ))}
                    </div>

                    {/* Chance indicator */}
                    <div className="mb-2">
                        <ChanceIndicator chance={chance} size="sm" />
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-1.5 mt-auto">
                        <Button 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-9 text-sm"
                            onClick={() => onView(university)}
                        >
                            {t('university.viewDetails')}
                            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                        <Button 
                            variant="outline"
                            size="sm"
                            className={`w-full h-8 text-xs ${isComparing ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-600 hover:bg-indigo-50"}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onCompareToggle(university.id);
                            }}
                        >
                            <GitCompare className="w-3 h-3 mr-1.5" />
                            {isComparing ? t('university.added') : t('university.compare')}
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}