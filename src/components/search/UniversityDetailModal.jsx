import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    MapPin, Globe, GraduationCap, Bookmark, BookmarkCheck, 
    ExternalLink, Award, Calendar, Users, TrendingUp, DollarSign,
    Building2, BookOpen, Home, Heart, Briefcase, FileText,
    Shield, Clock, Phone, Mail, CheckCircle2, Info, ChevronRight
} from 'lucide-react';
import ChanceIndicator from '@/components/ui/ChanceIndicator';
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

export default function UniversityDetailModal({ university, isOpen, onClose, userGpa, userIelts, userTopik, isSaved, onSave }) {
    const { t } = useLanguage();
    
    if (!university) return null;
    
    const chance = calculateChance(university, userGpa, userIelts, userTopik);
    const totalCost = (university.tuition_min || 0) + (university.living_cost_estimate || 8000);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
                <DialogHeader>
                    <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                        <UniversityCover university={university} size="large" />
                    </div>
                </DialogHeader>

                <div className="space-y-6 w-full">
                    {/* Chance and Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">{t('university.admissionChance')}</p>
                            <ChanceIndicator chance={chance} size="lg" />
                            {university.required_ielts && userIelts > 0 && userIelts < university.required_ielts && (
                                <p className="text-xs text-amber-600 mt-1">
                                    ⚠ {t('university.ieltsBelow')} ({userIelts} / {university.required_ielts})
                                </p>
                            )}
                            {university.required_ielts && userIelts === 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    ⚠ {t('university.ieltsRequiredNote')} {university.required_ielts}+
                                </p>
                            )}
                            {university.country === "South Korea" && university.topikLevel && (
                                <>
                                    {(!userTopik || userTopik === "Not taken") && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            ⚠ 🇰🇷 {university.topikLevel} {t('university.topikRequiredNote')}
                                        </p>
                                    )}
                                    {userTopik && userTopik !== "Not taken" && parseInt(userTopik.split(' ')[1]) < parseInt(university.topikLevel.split(' ')[1]) && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            ⚠ {t('university.topikBelow')} ({userTopik} / {university.topikLevel})
                                        </p>
                                    )}
                                </>
                            )}
                            </div>
                                <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onSave(university.id)}
                                className={isSaved ? "border-indigo-200 bg-indigo-50" : ""}
                            >
                                {isSaved ? (
                                    <><BookmarkCheck className="w-4 h-4 mr-2 text-indigo-600" /> {t('university.saved')}</>
                                ) : (
                                    <><Bookmark className="w-4 h-4 mr-2" /> {t('university.save')}</>
                                )}
                            </Button>
                            {university.website && (
                                <Button asChild>
                                    <a href={university.website} target="_blank" rel="noopener noreferrer">
                                        {t('university.visitWebsite')}
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Key Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="p-3 bg-white border border-slate-100 rounded-xl">
                                    <DollarSign className="w-4 h-4 text-emerald-500 mb-1" />
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('university.tuition')}</p>
                                    <p className="font-semibold text-slate-800 text-base truncate">
                                        {university.tuition_min === 0 ? t('university.free') : `€${university.tuition_min?.toLocaleString()}`}
                                    </p>
                                </div>
                                <div className="p-3 bg-white border border-slate-100 rounded-xl">
                                    <Building2 className="w-4 h-4 text-blue-500 mb-1" />
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('university.livingCost')}</p>
                                    <p className="font-semibold text-slate-800 text-base truncate">
                                        €{university.living_cost_estimate?.toLocaleString() || "8,000"}/{t('common.year')}
                                    </p>
                                </div>
                                <div className="p-3 bg-white border border-slate-100 rounded-xl">
                                    <TrendingUp className="w-4 h-4 text-amber-500 mb-1" />
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('university.minGpa')}</p>
                                    <p className="font-semibold text-slate-800 text-base">{university.min_gpa?.toFixed(1)}</p>
                                </div>
                                <div className="p-3 bg-white border border-slate-100 rounded-xl">
                                    <Users className="w-4 h-4 text-violet-500 mb-1" />
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('university.intlStudents')}</p>
                                    <p className="font-semibold text-slate-800 text-base">
                                        {university.international_students_percent || "15"}%
                                    </p>
                                </div>
                            </div>

                            {/* Total Cost Highlight */}
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-indigo-600 font-medium">{t('university.totalCost')}</p>
                                        <p className="text-xs text-indigo-400 mt-0.5">{t('university.totalCostDesc')}</p>
                                    </div>
                                    <p className="text-2xl font-bold text-indigo-700">€{totalCost.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Description */}
                            {university.description && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Info className="w-5 h-5 text-indigo-600" />
                                            {t('university.about')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600 leading-relaxed">{university.description}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Quick Info */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-indigo-600" />
                                            {t('university.programs')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="bg-slate-100">
                                                <Globe className="w-3 h-3 mr-1" />
                                                {university.language}
                                            </Badge>
                                            {university.degree_levels?.map(deg => (
                                                <Badge key={deg} variant="secondary" className="bg-indigo-50 text-indigo-600">
                                                    <GraduationCap className="w-3 h-3 mr-1" />
                                                    {deg}
                                                </Badge>
                                            ))}
                                        </div>
                                        {university.notable_programs?.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 mb-2">{t('university.notablePrograms')}</p>
                                                <div className="flex flex-wrap gap-1.5 max-w-full">
                                                    {university.notable_programs.map((prog, i) => (
                                                        <Badge key={i} variant="outline" className="font-normal text-xs break-words">
                                                            {prog}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-indigo-600" />
                                            {t('university.languageReq')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {university.required_ielts ? (
                                            <div>
                                                <p className="text-sm text-slate-500">{t('university.ieltsRequired')}</p>
                                                <p className="font-semibold text-slate-800 text-lg">{university.required_ielts}+</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">{t('university.variesByProgram')}</p>
                                        )}
                                        {university.country === "South Korea" && university.topikLevel && (
                                            <div>
                                                <p className="text-sm text-slate-500">🇰🇷 {t('university.topikRequired')}</p>
                                                <p className="font-semibold text-indigo-700 text-lg">{university.topikLevel}</p>
                                                <p className="text-xs text-slate-400 mt-1">{t('university.forKorean')}</p>
                                            </div>
                                        )}
                                        {university.admission_requirements?.english_test && (
                                            <div>
                                                <p className="text-sm text-slate-500">{t('university.otherTests')}</p>
                                                <p className="font-medium text-slate-800">{university.admission_requirements.english_test}</p>
                                            </div>
                                        )}
                                        {university.application_deadline && (
                                            <div className="pt-3 border-t">
                                                <p className="text-sm text-slate-500">{t('university.applicationDeadline')}</p>
                                                <p className="font-medium text-slate-800">{university.application_deadline}</p>
                                            </div>
                                        )}
                                        {university.admission_requirements?.application_fee_eur && (
                                            <div>
                                                <p className="text-sm text-slate-500">{t('university.applicationFee')}</p>
                                                <p className="font-medium text-slate-800">€{university.admission_requirements.application_fee_eur}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <Separator className="my-6" />

                            {/* Campus Life */}
                            <Collapsible>
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-slate-50 rounded-lg">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Home className="w-5 h-5 text-indigo-600" />
                                        {t('university.campusLife')}
                                    </h3>
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-4">
                                    {university.campus_life ? (
                                <>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Home className="w-5 h-5 text-indigo-600" />
                                                {t('university.campusFacilities')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle2 className={`w-5 h-5 ${university.campus_life.housing_available ? 'text-green-500' : 'text-slate-300'}`} />
                                                        <div>
                                                            <p className="font-medium text-slate-800">{t('university.studentHousing')}</p>
                                                            {university.campus_life.housing_available && university.campus_life.housing_cost_monthly && (
                                                                <p className="text-sm text-slate-500">€{university.campus_life.housing_cost_monthly}/{t('common.month')}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle2 className={`w-5 h-5 ${university.campus_life.sports_facilities ? 'text-green-500' : 'text-slate-300'}`} />
                                                        <p className="font-medium text-slate-800">{t('university.sportsFacilities')}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    {university.campus_life.student_organizations && (
                                                        <div>
                                                            <p className="text-sm text-slate-500">{t('university.studentOrganizations')}</p>
                                                            <p className="font-semibold text-slate-800 text-lg">{university.campus_life.student_organizations}+</p>
                                                        </div>
                                                    )}
                                                    {university.campus_life.cafeterias && (
                                                        <div>
                                                            <p className="text-sm text-slate-500">{t('university.campusCafeterias')}</p>
                                                            <p className="font-semibold text-slate-800 text-lg">{university.campus_life.cafeterias}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {university.campus_life.campus_description && (
                                                <p className="text-slate-600 leading-relaxed mt-4 pt-4 border-t">
                                                    {university.campus_life.campus_description}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                    {university.campus_life.city_description && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                                    {t('university.lifeIn')} {university.city}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-slate-600 leading-relaxed">
                                                    {university.campus_life.city_description}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                        </>
                                    ) : (
                                        <p className="text-slate-500 text-center py-6">{t('university.campusInfoNotAvailable')}</p>
                                    )}
                                </CollapsibleContent>
                            </Collapsible>

                            <Separator className="my-6" />

                            {/* Support */}
                            <Collapsible>
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-slate-50 rounded-lg">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-indigo-600" />
                                        {t('university.support')}
                                    </h3>
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-4">
                            {university.international_support ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Heart className="w-5 h-5 text-indigo-600" />
                                            {t('university.support')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid sm:grid-cols-2 gap-3 mb-6">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className={`w-5 h-5 ${university.international_support.international_office ? 'text-green-500' : 'text-slate-300'}`} />
                                                <p className="text-slate-700">{t('university.internationalOffice')}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className={`w-5 h-5 ${university.international_support.orientation_program ? 'text-green-500' : 'text-slate-300'}`} />
                                                <p className="text-slate-700">{t('university.orientationProgram')}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className={`w-5 h-5 ${university.international_support.language_courses ? 'text-green-500' : 'text-slate-300'}`} />
                                                <p className="text-slate-700">{t('university.freeLanguageCourses')}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className={`w-5 h-5 ${university.international_support.buddy_program ? 'text-green-500' : 'text-slate-300'}`} />
                                                <p className="text-slate-700">{t('university.buddyProgram')}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className={`w-5 h-5 ${university.international_support.career_services ? 'text-green-500' : 'text-slate-300'}`} />
                                                <p className="text-slate-700">{t('university.careerServices')}</p>
                                            </div>
                                        </div>
                                        {university.international_support.support_description && (
                                            <div className="pt-4 border-t">
                                                <p className="text-slate-600 leading-relaxed">
                                                    {university.international_support.support_description}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <p className="text-slate-500 text-center py-6">{t('university.supportInfoNotAvailable')}</p>
                            )}

                            {university.contact_info && (
                                <div className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-indigo-600" />
                                            {t('university.contact')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {university.contact_info.email && (
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                                <a href={`mailto:${university.contact_info.email}`} className="text-indigo-600 hover:underline">
                                                    {university.contact_info.email}
                                                </a>
                                            </div>
                                        )}
                                        {university.contact_info.phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                <p className="text-slate-700">{university.contact_info.phone}</p>
                                            </div>
                                        )}
                                        {university.contact_info.admissions_office && (
                                            <div className="flex items-start gap-3">
                                                <Building2 className="w-4 h-4 text-slate-400 mt-1" />
                                                <p className="text-slate-700">{university.contact_info.admissions_office}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                                </div>
                            )}
                        </CollapsibleContent>
                    </Collapsible>

                    <Separator className="my-6" />

                    {/* Visa */}
                    <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-slate-50 rounded-lg">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                {t('university.visa')}
                            </h3>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-4">
                            {university.visa_info ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-indigo-600" />
                                            {t('university.visaWorkPermit')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">{t('university.visaRequired')}</p>
                                                <Badge variant={university.visa_info.visa_required ? "default" : "secondary"}>
                                                    {university.visa_info.visa_required ? t('university.yes') : t('university.no')}
                                                </Badge>
                                            </div>
                                            {university.visa_info.processing_time_weeks && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">{t('university.processingTime')}</p>
                                                    <p className="font-semibold text-slate-800">{university.visa_info.processing_time_weeks} {t('university.weeks')}</p>
                                                </div>
                                            )}
                                            {university.visa_info.visa_cost_eur && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">{t('university.visaCost')}</p>
                                                    <p className="font-semibold text-slate-800">€{university.visa_info.visa_cost_eur}</p>
                                                </div>
                                            )}
                                            {university.visa_info.work_allowed_hours && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">{t('university.workAllowed')}</p>
                                                    <p className="font-semibold text-slate-800">{university.visa_info.work_allowed_hours} {t('university.hoursPerWeek')}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-6 pt-6 border-t space-y-3">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className={`w-5 h-5 ${university.visa_info.post_study_work_visa ? 'text-green-500' : 'text-slate-300'}`} />
                                                <p className="text-slate-700">{t('university.postStudyWorkVisa')}</p>
                                            </div>
                                        </div>
                                        {university.visa_info.visa_details && (
                                            <div className="mt-6 pt-6 border-t">
                                                <p className="text-slate-600 leading-relaxed">{university.visa_info.visa_details}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <p className="text-slate-500 text-center py-6">{t('university.visaInfoNotAvailable')}</p>
                            )}
                        </CollapsibleContent>
                    </Collapsible>

                    <Separator className="my-6" />

                    {/* Scholarships */}
                    <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-slate-50 rounded-lg">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-600" />
                                {t('university.scholarships')}
                            </h3>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-4">
                            {university.scholarships && university.scholarships.length > 0 ? (
                                <div className="space-y-4">
                                    {university.scholarships.map((scholarship, index) => (
                                        <Card key={index}>
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                                                        {scholarship.amount_eur && (
                                                            <p className="text-2xl font-bold text-indigo-600 mt-2">
                                                                €{scholarship.amount_eur.toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {scholarship.renewable && (
                                                        <Badge className="bg-emerald-500 text-white">{t('university.renewable')}</Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {scholarship.coverage && (
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700 mb-1">{t('university.coverage')}</p>
                                                        <p className="text-slate-600">{scholarship.coverage}</p>
                                                    </div>
                                                )}
                                                {scholarship.eligibility && (
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700 mb-1">{t('university.eligibility')}</p>
                                                        <p className="text-slate-600">{scholarship.eligibility}</p>
                                                    </div>
                                                )}
                                                {scholarship.deadline && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        <span className="text-slate-600">{t('university.deadline')}: <strong>{scholarship.deadline}</strong></span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center py-6">{t('university.noScholarshipInfo')}</p>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </DialogContent>
        </Dialog>
    );
}