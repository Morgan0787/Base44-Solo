import React from 'react';
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function ChanceIndicator({ chance, size = "default" }) {
    const { t } = useLanguage();
    
    const config = {
        high: {
            label: t('chance.high'),
            color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            icon: CheckCircle2,
            iconColor: "text-emerald-500"
        },
        medium: {
            label: t('chance.medium'),
            color: "bg-amber-50 text-amber-700 border-amber-200",
            icon: AlertCircle,
            iconColor: "text-amber-500"
        },
        low: {
            label: t('chance.low'),
            color: "bg-rose-50 text-rose-600 border-rose-200",
            icon: XCircle,
            iconColor: "text-rose-400"
        }
    };

    const { label, color, icon: Icon, iconColor } = config[chance] || config.medium;

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium",
            color,
            size === "sm" && "text-xs px-2 py-1",
            size === "lg" && "text-base px-4 py-2"
        )}>
            <Icon className={cn("w-4 h-4", iconColor, size === "sm" && "w-3 h-3")} />
            <span>{label}</span>
        </div>
    );
}