import React, { useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { invokeAI } from '@/lib/aiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    Lightbulb, Sparkles, Loader2, User, GraduationCap, 
    BookOpen, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function BrainstormPanel({ profile, user }) {
    const [ideas, setIdeas] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateIdeas = async () => {
        setIsGenerating(true);
        try {
            const contextInfo = profile ? `
Student Profile:
- GPA: ${profile.gpa}
- Home Country: ${profile.home_country || 'Not specified'}
- Interests: ${profile.interests?.join(', ') || 'Not specified'}
- Target Degree: ${profile.target_degree || 'Not specified'}
- Preferred Study Languages: ${profile.preferred_languages?.join(', ') || 'Not specified'}
` : 'No profile information available.';

            const result = await invokeAI({
                prompt: `You are a university admissions essay consultant helping a student from ${profile?.home_country || 'Uzbekistan'} brainstorm essay topics for international university applications.

${contextInfo}

Generate 5 unique, compelling essay topic ideas that:
1. Help the student tell their authentic story
2. Highlight their unique background and experiences
3. Are specific and personal (not generic)
4. Show growth, reflection, or impact
5. Are appropriate for university application essays

For each topic idea, provide:
- Title: A catchy, descriptive title
- Description: 2-3 sentences explaining the topic
- Why It Works: Why this topic would resonate with admissions officers
- Starting Questions: 2-3 questions to help the student start writing

Also provide 3 general essay prompts commonly used by universities.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        topic_ideas: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    why_it_works: { type: "string" },
                                    starting_questions: {
                                        type: "array",
                                        items: { type: "string" }
                                    }
                                }
                            }
                        },
                        common_prompts: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });

            setIdeas(result);
            toast.success('Ideas generated!');
        } catch (error) {
            toast.error('Failed to generate ideas. Please try again.');
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!user) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 mb-4">Sign in to get personalized essay ideas</p>
                    <Button onClick={() => apiClient.auth.redirectToLogin()}>
                        Sign In
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-violet-600" />
                        Essay Topic Brainstorming
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                        Get personalized essay topic ideas based on your profile and experiences
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        onClick={generateIdeas}
                        disabled={isGenerating}
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Generating Ideas...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Generate Essay Ideas
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Profile Info */}
            {profile && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-600" />
                            Your Profile Context
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {profile.home_country && (
                                <Badge variant="secondary">🌍 {profile.home_country}</Badge>
                            )}
                            {profile.target_degree && (
                                <Badge variant="secondary">🎓 {profile.target_degree}</Badge>
                            )}
                            {profile.gpa && (
                                <Badge variant="secondary">📊 GPA {profile.gpa.toFixed(1)}</Badge>
                            )}
                            {profile.interests?.slice(0, 3).map(interest => (
                                <Badge key={interest} variant="secondary">💡 {interest}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Generated Ideas */}
            {isGenerating && (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {ideas && !isGenerating && (
                <>
                    {/* Topic Ideas */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            Personalized Essay Topics
                        </h3>
                        {ideas.topic_ideas?.map((topic, index) => (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg mb-2">{topic.title}</CardTitle>
                                            <p className="text-slate-600 text-sm leading-relaxed">
                                                {topic.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <p className="text-xs font-medium text-green-700 mb-1 flex items-center gap-1">
                                            <GraduationCap className="w-3 h-3" />
                                            Why This Works
                                        </p>
                                        <p className="text-sm text-slate-700">{topic.why_it_works}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" />
                                            Questions to Get Started
                                        </p>
                                        <ul className="space-y-1.5">
                                            {topic.starting_questions?.map((question, qIndex) => (
                                                <li key={qIndex} className="flex gap-2 text-sm">
                                                    <ChevronRight className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-slate-600">{question}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Common Prompts */}
                    {ideas.common_prompts?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-violet-600" />
                                    Common Essay Prompts
                                </CardTitle>
                                <CardDescription>
                                    Standard prompts used by many universities
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ol className="space-y-3">
                                    {ideas.common_prompts.map((prompt, index) => (
                                        <li key={index} className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </span>
                                            <p className="text-slate-700 text-sm flex-1">{prompt}</p>
                                        </li>
                                    ))}
                                </ol>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}