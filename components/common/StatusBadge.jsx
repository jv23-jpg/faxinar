import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PlayCircle, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
  },
  accepted: {
    label: 'Aceito',
    icon: CheckCircle2,
    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
  },
  in_progress: {
    label: 'Em Andamento',
    icon: PlayCircle,
    className: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400'
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'
  }
};

const paymentConfig = {
  pending: {
    label: 'Aguardando',
    className: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  paid: {
    label: 'Pago',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  refunded: {
    label: 'Reembolsado',
    className: 'bg-slate-100 text-slate-700 border-slate-200'
  }
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={cn("flex items-center gap-1.5 font-medium", config.className)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
}

export function PaymentBadge({ status }) {
  const config = paymentConfig[status] || paymentConfig.pending;
  
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}