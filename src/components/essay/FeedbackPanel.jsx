import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
    Award, Eye, MessageSquare, Sparkles, 
    CheckCircle2, AlertCircle, Lightbulb, ArrowRight
} from 'lucide-react';

export default function FeedbackPanel({ feedback, essay }) {
    const getScoreColor = (score) => {
        if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 6) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getScoreLabel = (score) => {
        if (score >= 8) return 'Excellent';
        if (score >= 6) return 'Good';
        if (score >= 4) return 'Fair';
        return 'Needs Work';
    };

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <Card className="border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-indigo-600" />
                            Overall Assessment
                        </CardTitle>
                        <Badge className={`text-xl px-4 py-2 ${getScoreColor(feedback.overall_score)} border`}>
                            {feedback.overall_score}/10
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-2">
                        <Progress value={feedback.overall_score * 10} className="h-3" />
                    </div>
                    <p className="text-sm text-slate-600">
                        <strong>{getScoreLabel(feedback.overall_score)}</strong> - Your essay shows {feedback.overall_score >= 7 ? 'strong potential' : 'room for improvement'}
                    </p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {feedback.strengths?.map((strength, index) => (
                                <li key={index} className="flex gap-2">
                                    <Sparkles className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-700 text-sm">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Clarity Score */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Eye className="w-5 h-5 text-indigo-600" />
                            Clarity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Score</span>
                            <Badge className={getScoreColor(feedback.clarity_score)}>
                                {feedback.clarity_score}/10
                            </Badge>
                        </div>
                        <Progress value={feedback.clarity_score * 10} className="h-2" />
                        <p className="text-sm text-slate-600">{feedback.clarity_explanation}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Grammar Issues */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        Grammar & Style
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {feedback.grammar_issues?.length > 0 && feedback.grammar_issues[0] !== "No major issues" ? (
                        <ul className="space-y-2">
                            {feedback.grammar_issues.map((issue, index) => (
                                <li key={index} className="flex gap-2 text-sm">
                                    <span className="text-amber-500">•</span>
                                    <span className="text-slate-700">{issue}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>No major grammar issues detected. Great job!</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tone Assessment */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-violet-600" />
                        Tone Assessment
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-700 leading-relaxed">{feedback.tone_assessment}</p>
                </CardContent>
            </Card>

            {/* Suggestions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-indigo-600" />
                        Suggestions for Improvement
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {feedback.suggestions?.map((suggestion, index) => (
                            <div key={index} className="flex gap-3 p-3 bg-indigo-50 rounded-lg">
                                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                </span>
                                <p className="text-slate-700 text-sm">{suggestion}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Revised Sentences */}
            {feedback.revised_sentences?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowRight className="w-5 h-5 text-green-600" />
                            Example Improvements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {feedback.revised_sentences.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                        <p className="text-xs text-red-600 font-medium mb-1">Before:</p>
                                        <p className="text-sm text-slate-700 italic">{item.original}</p>
                                    </div>
                                    <div className="flex justify-center">
                                        <ArrowRight className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                                        <p className="text-xs text-green-600 font-medium mb-1">After:</p>
                                        <p className="text-sm text-slate-700">{item.improved}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}