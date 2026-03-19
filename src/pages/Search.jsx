import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search as SearchIcon, SlidersHorizontal, GraduationCap, X, GitCompare } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import FilterPanel from '@/components/search/FilterPanel';
import UniversityCard from '@/components/search/UniversityCard';
import UniversityDetailModal from '@/components/search/UniversityDetailModal';
import ComparisonModal from '@/components/comparison/ComparisonModal';
import { useLanguage } from '@/lib/i18n';

export default function Search() {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState(() => {
        const saved = localStorage.getItem('uniAdmitFilters');
        return saved ? JSON.parse(saved) : { gpa: 3.0, ielts: 0, topikLevel: "Not taken", budget: 15000, region: '', country: '', languages: [], degree: '', scholarshipsOnly: false };
    });
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [savedUniversities, setSavedUniversities] = useState([]);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [compareList, setCompareList] = useState([]);
    const [showComparison, setShowComparison] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => { localStorage.setItem('uniAdmitFilters', JSON.stringify(filters)); }, [filters]);
    const { data: universities = [], isLoading } = useQuery({ queryKey: ['universities'], queryFn: () => apiClient.entities.University.list() });
    useEffect(() => { const loadProfile = async () => { try { const profile = await apiClient.entities.StudentProfile.filter({ created_by: (await apiClient.auth.me()).email }); if (profile.length > 0) { setUserProfile(profile[0]); setSavedUniversities(profile[0].saved_universities || []); if (profile[0].gpa) setFilters(f => ({ ...f, gpa: profile[0].gpa })); if (profile[0].english_proficiency !== undefined) setFilters(f => ({ ...f, ielts: profile[0].english_proficiency })); if (profile[0].budget_max) setFilters(f => ({ ...f, budget: profile[0].budget_max })); if (profile[0].topikLevel) setFilters(f => ({ ...f, topikLevel: profile[0].topikLevel })); } } catch (e) {} }; loadProfile(); }, []);

    const filteredUniversities = universities.filter(uni => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch = uni.name?.toLowerCase().includes(query) || uni.country?.toLowerCase().includes(query) || uni.city?.toLowerCase().includes(query);
            if (!matchesSearch) return false;
        }
        if (filters.budget && uni.tuition_min > filters.budget) return false;
        if (filters.ielts > 0 && uni.required_ielts && uni.required_ielts > filters.ielts) return false;
        if (filters.region && uni.region !== filters.region) return false;
        if (filters.country && uni.country !== filters.country) return false;
        if (filters.languages?.length > 0 && !filters.languages.includes(uni.language)) return false;
        if (filters.degree && !uni.degree_levels?.includes(filters.degree)) return false;
        if (filters.scholarshipsOnly && !uni.scholarships_available) return false;
        return true;
    });
    const isDefaultView = !searchQuery && !filters.region && !filters.country && (!filters.languages || filters.languages.length === 0) && !filters.degree && !filters.scholarshipsOnly;
    const sortedUniversities = (() => {
        if (isDefaultView) {
            const byCountry = {};
            filteredUniversities.forEach(uni => { if (!byCountry[uni.country]) byCountry[uni.country] = []; byCountry[uni.country].push(uni); });
            const balanced = []; const remaining = [];
            Object.values(byCountry).forEach(countryUnis => {
                const sorted = [...countryUnis].sort((a, b) => (filters.gpa - b.min_gpa) - (filters.gpa - a.min_gpa));
                balanced.push(...sorted.slice(0, 4)); remaining.push(...sorted.slice(4));
            });
            const shuffled = balanced.sort(() => Math.random() - 0.5);
            const sortedRemaining = remaining.sort((a, b) => (filters.gpa - b.min_gpa) - (filters.gpa - a.min_gpa));
            return [...shuffled, ...sortedRemaining];
        }
        return [...filteredUniversities].sort((a, b) => (filters.gpa - b.min_gpa) - (filters.gpa - a.min_gpa));
    })();

    const handleSave = async (universityId) => {
        try {
            const newSaved = savedUniversities.includes(universityId) ? savedUniversities.filter(id => id !== universityId) : [...savedUniversities, universityId];
            setSavedUniversities(newSaved);
            const user = await apiClient.auth.me();
            const profiles = await apiClient.entities.StudentProfile.filter({ created_by: user.email });
            if (profiles.length > 0) await apiClient.entities.StudentProfile.update(profiles[0].id, { saved_universities: newSaved });
        } catch (e) {}
    };

    const resetFilters = () => setFilters({ gpa: 3.0, ielts: 0, topikLevel: "Not taken", budget: 15000, region: '', country: '', languages: [], degree: '', scholarshipsOnly: false });
    const handleCompareToggle = (universityId) => setCompareList(prev => prev.includes(universityId) ? prev.filter(id => id !== universityId) : prev.length < 3 ? [...prev, universityId] : prev);
    const handleRemoveFromCompare = (universityId) => setCompareList(prev => prev.filter(id => id !== universityId));
    const compareUniversities = universities.filter(uni => compareList.includes(uni.id));
    const activeFilterCount = [filters.region, filters.country, filters.languages?.length > 0, filters.degree, filters.scholarshipsOnly].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-100 sticky top-0 z-40"><div className="max-w-7xl mx-auto px-4 sm:px-6 py-4"><div className="flex flex-col md:flex-row gap-4 items-center"><div className="relative flex-1 w-full"><SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><Input placeholder={t('search.placeholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 pr-4 py-6 text-lg bg-slate-50 border-slate-200 rounded-xl focus:bg-white" />{searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>}</div><Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}><SheetTrigger asChild><Button variant="outline" className="lg:hidden gap-2"><SlidersHorizontal className="w-4 h-4" />{t('search.filters')}{activeFilterCount > 0 && <Badge className="bg-indigo-600 text-white ml-1">{activeFilterCount}</Badge>}</Button></SheetTrigger><SheetContent side="left" className="w-full sm:w-96 p-0 flex flex-col max-h-screen"><div className="flex-1 overflow-y-auto p-6"><FilterPanel filters={filters} setFilters={setFilters} onReset={resetFilters} universities={universities} /></div></SheetContent></Sheet></div><div className="flex items-center justify-between mt-4 gap-4"><p className="text-slate-600"><span className="font-semibold text-slate-800">{sortedUniversities.length}</span> {t('search.results')}</p><div className="flex items-center gap-3">{compareList.length > 0 && <Button onClick={() => setShowComparison(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2" size="sm"><GitCompare className="w-4 h-4" />{t('search.compare')} ({compareList.length})</Button>}<div className="flex gap-2 items-center text-sm text-slate-500"><span>{t('search.yourGpa')}:</span><Badge variant="secondary" className="bg-indigo-100 text-indigo-700">{filters.gpa?.toFixed(1)}</Badge></div></div></div></div></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6"><div className="flex gap-8"><aside className="hidden lg:block w-80 flex-shrink-0"><div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto"><FilterPanel filters={filters} setFilters={setFilters} onReset={resetFilters} universities={universities} /></div></aside><main className="flex-1 min-w-0">{isLoading ? <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100"><Skeleton className="h-32" /><div className="p-5 space-y-3"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-16" /><Skeleton className="h-8 w-24" /></div></div>)}</div> : sortedUniversities.length === 0 ? <div className="text-center py-20"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><GraduationCap className="w-8 h-8 text-slate-400" /></div><h3 className="text-lg font-semibold text-slate-800 mb-2">{t('search.noResults')}</h3><p className="text-slate-500 mb-6">{t('search.tryAdjusting')}</p><Button variant="outline" onClick={resetFilters}>{t('search.resetFilters')}</Button></div> : <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"><AnimatePresence>{sortedUniversities.map((university) => <UniversityCard key={university.id} university={university} userGpa={filters.gpa} userIelts={filters.ielts} userTopik={filters.topikLevel} isSaved={savedUniversities.includes(university.id)} onSave={handleSave} onView={setSelectedUniversity} isComparing={compareList.includes(university.id)} onCompareToggle={handleCompareToggle} />)}</AnimatePresence></div>}</main></div></div>
            <UniversityDetailModal university={selectedUniversity} isOpen={!!selectedUniversity} onClose={() => setSelectedUniversity(null)} userGpa={filters.gpa} userIelts={filters.ielts} userTopik={filters.topikLevel} isSaved={selectedUniversity && savedUniversities.includes(selectedUniversity.id)} onSave={handleSave} />
            <ComparisonModal universities={compareUniversities} isOpen={showComparison} onClose={() => setShowComparison(false)} onRemove={handleRemoveFromCompare} userProfile={userProfile} />
        </div>
    );
}
