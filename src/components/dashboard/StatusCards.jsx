import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Eye, Cog, CheckCircle2 } from 'lucide-react';
import { Demanda } from '@/entities/Demanda';

const statusConfig = {
  pendente_visualizacao: { 
    icon: Clock, 
    color: "text-amber-700", 
    bgColor: "bg-amber-100", 
    label: "Pendente de Visualização" 
  },
  visualizada: { 
    icon: Eye, 
    color: "text-blue-700", 
    bgColor: "bg-blue-100", 
    label: "Visualizada" 
  },
  em_producao: { 
    icon: Cog, 
    color: "text-purple-700", 
    bgColor: "bg-purple-100", 
    label: "Em Produção" 
  },
  finalizada: { 
    icon: CheckCircle2, 
    color: "text-emerald-700", 
    bgColor: "bg-emerald-100", 
    label: "Finalizada" 
  }
};

const StatusCards = ({ demandas = [], onStatusClick, selectedStatus }) => {
  const [stats, setStats] = useState({
    pendente_visualizacao: 0,
    visualizada: 0,
    em_producao: 0,
    finalizada: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [demandas]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Calcular estatísticas das demandas fornecidas
      const newStats = demandas.reduce((acc, demanda) => {
        const status = demanda.status || 'pendente_visualizacao';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {
        pendente_visualizacao: 0,
        visualizada: 0,
        em_producao: 0,
        finalizada: 0
      });

      setStats(newStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusClick = (status) => {
    if (onStatusClick) {
      onStatusClick(status);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Object.keys(statusConfig).map((status) => (
          <div key={status} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Object.entries(statusConfig).map(([status, config]) => {
        const count = stats[status] || 0;
        const isSelected = selectedStatus === status;
        const Icon = config.icon;
        
        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative bg-white dark:bg-slate-800 rounded-lg border-2 p-6 cursor-pointer transition-all duration-200
              ${isSelected 
                ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }
            `}
            onClick={() => handleStatusClick(status)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {config.label}
              </h3>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            
            {/* Ícone de fundo com transparência - design elegante cortando parte da imagem */}
            <div className="absolute -top-2 -right-2 opacity-35 overflow-hidden">
              <Icon className={`w-20 h-20 ${config.color}`} />
            </div>
            
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {count}
              </span>
              <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                {count === 1 ? 'demanda' : 'demandas'}
              </span>
            </div>
            
            {isSelected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium"
              >
                Filtro ativo
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatusCards;
