import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/i18n/LanguageContext';

const countries = [
    "Uzbekistan", "Kazakhstan", "Kyrgyzstan", "Tajikistan", "Turkmenistan",
    "Russia", "Ukraine", "Azerbaijan", "Georgia", "Armenia",
    "India", "Pakistan", "Bangladesh", "Vietnam", "Indonesia",
    "Nigeria", "Kenya", "Ghana", "Egypt", "Morocco", "Other"
];

const languages = ["English", "German", "French", "Russian", "Mixed"];
const interests = [
    "Engineering", "Computer Science", "Business", "Medicine", "Law",
    "Arts & Design", "Natural Sciences", "Social Sciences", "Economics", "Architecture"
];

export default function ProfileBuilder({ profile, onSave, isLoading }) {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        gpa: profile?.gpa || 3.0,
        english_proficiency: profile?.english_proficiency || 0,
        topikLevel: profile?.topikLevel || "Not taken",
        budget_max: profile?.budget_max || 10000,
        home_country: profile?.home_country || "",
        grade_level: profile?.grade_level || "",
        target_degree: profile?.target_degree || "Bachelor",
        preferred_languages: profile?.preferred_languages || [],
        interests: profile?.interests || []
    });

    const updateField = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const toggleArrayField = (key, value) => {
        setFormData(prev => {
            const current = prev[key] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [key]: updated };
        });
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    const totalSteps = 3;

    return (
        <Card className="max-w-xl mx-auto border-0 shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white pb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium text-indigo-100">{t('profile.personalizedMatching')}</span>
                </div>
                <CardTitle className="text-2xl">{t('profile.buildProfile')}</CardTitle>
                <CardDescription className="text-indigo-100">
                    {t('profile.buildProfileDesc')}
                </CardDescription>
                {/* Progress */}
                <div className="flex gap-2 mt-6">
                    {[1, 2, 3].map(s => (
                        <div 
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                                s <= step ? 'bg-white' : 'bg-white/30'
                            }`}
                        />
                    ))}
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="font-semibold text-slate-800 mb-4">{t('profile.academicInfo')}</h3>
                                
                                <div className="space-y-5">
                                    <div className="space-y-3">
                                        <Label>{t('profile.gpaScale')}</Label>
                                        <div className="flex items-center gap-4">
                                            <Slider
                                                value={[formData.gpa]}
                                                onValueChange={([val]) => updateField('gpa', val)}
                                                min={1.0}
                                                max={4.0}
                                                step={0.1}
                                                className="flex-1"
                                            />
                                            <span className="w-12 text-center font-semibold text-indigo-600 text-lg">
                                                {formData.gpa.toFixed(1)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            {t('profile.gpaNote')}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>{t('profile.currentGradeLevel')}</Label>
                                        <Select 
                                            value={formData.grade_level} 
                                            onValueChange={(val) => updateField('grade_level', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('profile.selectGrade')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Grade 10">{t('profile.grade10')}</SelectItem>
                                                <SelectItem value="Grade 11">{t('profile.grade11')}</SelectItem>
                                                <SelectItem value="Grade 12">{t('profile.grade12')}</SelectItem>
                                                <SelectItem value="Gap Year">{t('profile.gapYear')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>{t('profile.targetDegree')}</Label>
                                        <div className="flex gap-2">
                                            {["Bachelor", "Master", "PhD"].map(deg => (
                                                <Button
                                                    key={deg}
                                                    type="button"
                                                    variant={formData.target_degree === deg ? "default" : "outline"}
                                                    className={formData.target_degree === deg ? "bg-indigo-600" : ""}
                                                    onClick={() => updateField('target_degree', deg)}
                                                >
                                                    {deg}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>{t('profile.englishProficiency')}</Label>
                                        <Select 
                                            value={String(formData.english_proficiency)} 
                                            onValueChange={(val) => updateField('english_proficiency', Number(val))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('profile.selectIelts')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">{t('profile.noCertificate')}</SelectItem>
                                                <SelectItem value="5.5">IELTS 5.5</SelectItem>
                                                <SelectItem value="6.0">IELTS 6.0</SelectItem>
                                                <SelectItem value="6.5">IELTS 6.5</SelectItem>
                                                <SelectItem value="7.0">IELTS 7.0+</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-slate-400">
                                            {t('profile.ieltsNote')}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>{t('profile.koreanProficiency')} 🇰🇷</Label>
                                        <Select 
                                            value={formData.topikLevel || "Not taken"} 
                                            onValueChange={(val) => updateField('topikLevel', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('profile.selectTopik')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Not taken">{t('profile.notTaken')}</SelectItem>
                                                <SelectItem value="TOPIK 1">TOPIK 1</SelectItem>
                                                <SelectItem value="TOPIK 2">TOPIK 2</SelectItem>
                                                <SelectItem value="TOPIK 3">TOPIK 3</SelectItem>
                                                <SelectItem value="TOPIK 4">TOPIK 4</SelectItem>
                                                <SelectItem value="TOPIK 5">TOPIK 5</SelectItem>
                                                <SelectItem value="TOPIK 6">TOPIK 6</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-slate-400">
                                            {t('profile.topikNote')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="font-semibold text-slate-800 mb-4">{t('profile.budgetBackground')}</h3>
                                
                                <div className="space-y-5">
                                    <div className="space-y-3">
                                        <Label>{t('profile.maxAnnualBudget')}</Label>
                                        <div className="flex items-center gap-4">
                                            <Slider
                                                value={[formData.budget_max]}
                                                onValueChange={([val]) => updateField('budget_max', val)}
                                                min={0}
                                                max={50000}
                                                step={1000}
                                                className="flex-1"
                                            />
                                            <span className="w-20 text-center font-semibold text-indigo-600 text-lg">
                                                €{formData.budget_max.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            {t('profile.budgetNote')}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>{t('profile.homeCountry')}</Label>
                                        <Select 
                                            value={formData.home_country} 
                                            onValueChange={(val) => updateField('home_country', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('profile.selectCountry')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries.map(c => (
                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>{t('profile.languagesToStudy')}</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {languages.map(lang => (
                                                <Badge
                                                    key={lang}
                                                    variant={formData.preferred_languages.includes(lang) ? "default" : "outline"}
                                                    className={`cursor-pointer transition-all ${
                                                        formData.preferred_languages.includes(lang) 
                                                            ? "bg-indigo-600" 
                                                            : "hover:bg-slate-100"
                                                    }`}
                                                    onClick={() => toggleArrayField('preferred_languages', lang)}
                                                >
                                                    {formData.preferred_languages.includes(lang) && (
                                                        <Check className="w-3 h-3 mr-1" />
                                                    )}
                                                    {lang}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="font-semibold text-slate-800 mb-4">{t('profile.yourInterests')}</h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    {t('profile.interestsNote')}
                                </p>
                                
                                <div className="flex flex-wrap gap-2">
                                    {interests.map(interest => (
                                        <Badge
                                            key={interest}
                                            variant={formData.interests.includes(interest) ? "default" : "outline"}
                                            className={`cursor-pointer transition-all py-2 px-3 ${
                                                formData.interests.includes(interest) 
                                                    ? "bg-indigo-600" 
                                                    : "hover:bg-slate-100"
                                            }`}
                                            onClick={() => toggleArrayField('interests', interest)}
                                        >
                                            {formData.interests.includes(interest) && (
                                                <Check className="w-3 h-3 mr-1" />
                                            )}
                                            {interest}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                        variant="ghost"
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 1}
                    >
                        {t('profile.back')}
                    </Button>
                    
                    {step < totalSteps ? (
                        <Button onClick={() => setStep(s => s + 1)} className="bg-indigo-600 hover:bg-indigo-700">
                            {t('profile.continue')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSubmit} 
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isLoading ? t('profile.saving') : t('profile.completeProfile')}
                            <Sparkles className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
