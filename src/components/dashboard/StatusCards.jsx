import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Eye, Cog, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  pendente_visualizacao: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    label: "Pendente de Visualização"
  },
  visualizada: {
    icon: Eye,
    color: "text-blue-600", 
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Visualizada"
  },
  em_producao: {
    icon: Cog,
    color: "text-purple-600",
    bgColor: "bg-purple-50", 
    borderColor: "border-purple-200",
    label: "Em Produção"
  },
  finalizada: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    label: "Finalizada"
  }
};

export default function StatusCards({ demandas }) {
  const statusCounts = demandas.reduce((acc, demanda) => {
    acc[demanda.status] = (acc[demanda.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(statusConfig).map(([status, config], index) => {
        const count = statusCounts[status] || 0;
        const Icon = config.icon;
        
        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${config.borderColor} border-l-4 shadow-sm hover:shadow-md transition-shadow duration-200`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {config.label}
                </CardTitle>
                <div className={`p-2 rounded-full ${config.bgColor}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{count}</div>
                <p className="text-xs text-slate-500 mt-1">
                  {count === 1 ? 'demanda' : 'demandas'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}