import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  MessageSquare, 
  MessageSquareDashed, 
  Server, 
  Briefcase, 
  Building,
  Edit2, 
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDateSafely } from '@/utils/index';

const statusConfig = {
  pendente_visualizacao: { 
    label: 'Pendente de Visualização', 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-100',
    icon: Clock
  },
  visualizada: { 
    label: 'Visualizada', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100',
    icon: Eye
  },
  em_producao: { 
    label: 'Em Produção', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-100',
    icon: AlertCircle
  },
  finalizada: { 
    label: 'Finalizada', 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    icon: CheckCircle
  }
};

const areaConfig = {
  suporte: { label: 'Suporte', color: 'bg-blue-100 text-blue-800' },
  desenvolvimento: { label: 'Desenvolvimento', color: 'bg-green-100 text-green-800' },
  marketing: { label: 'Marketing', color: 'bg-purple-100 text-purple-800' },
  vendas: { label: 'Vendas', color: 'bg-orange-100 text-orange-800' }
};

const prioridadeConfig = {
  baixa: { label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  media: { label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-800' }
};

const UrgentTimer = ({ createdAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const created = new Date(createdAt);
      const deadline = new Date(created.getTime() + 24 * 60 * 60 * 1000); // 24 horas
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('Expirado');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <div className="flex items-center gap-1">
      <AlertCircle className="w-4 h-4 text-red-500" />
      <span className="text-red-600 font-medium">{timeLeft}</span>
    </div>
  );
};

export default function DemandaListItem({ 
  demanda, 
  onSelect, 
  onEdit, 
  onDelete, 
  onStatusChange,
  responsibleUser 
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Debug: verificar dados recebidos
  console.log(`DemandaListItem - Demanda ${demanda.id}:`, {
    responsavel_designado: demanda.responsavel_designado,
    responsibleUser: responsibleUser
  });

  const statusInfo = statusConfig[demanda.status] || statusConfig.pendente_visualizacao;
  const StatusIcon = statusInfo.icon;

  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(demanda);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(demanda.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer ${
        demanda.prioridade === 'urgente' ? 'urgent-pulse border-red-200' : ''
      }`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        {/* Header com título, status e ações */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-base leading-tight line-clamp-2 mb-1">
              {demanda.titulo}
            </h3>
            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
              {demanda.descricao}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
              <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleMenuClick}>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-slate-400 rounded-full mx-1"></div>
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={(e) => { handleMenuClick(e); onStatusChange(demanda.id, status); }}
                    className="flex items-center gap-2"
                  >
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                    {config.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tags e indicadores */}
        <div className="flex items-center gap-2 mb-3">
          {demanda.observacoes && (
            <div className="flex items-center gap-1 text-xs text-amber-800 bg-amber-100 px-2 py-1 rounded-md">
              <MessageSquareDashed className="h-3 w-3" />
              <span className="font-medium">Observações</span>
            </div>
          )}
          {demanda.comentarios_count && demanda.comentarios_count[0]?.count > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded-md">
              <MessageSquare className="h-3 w-3" />
              <span className="font-medium">
                {demanda.comentarios_count[0].count} comentário{demanda.comentarios_count[0].count !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          <Badge className={areaConfig[demanda.area_responsavel]?.color}>
            {areaConfig[demanda.area_responsavel]?.label}
          </Badge>
          <Badge className={prioridadeConfig[demanda.prioridade]?.color}>
            {prioridadeConfig[demanda.prioridade]?.label}
          </Badge>
        </div>

        {/* Informações da demanda */}
        <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 mb-3">
          {demanda.adserver && (
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{demanda.adserver}</span>
            </div>
          )}
          {demanda.agencia && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{demanda.agencia}</span>
            </div>
          )}
          {demanda.cliente_final && (
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{demanda.cliente_final}</span>
            </div>
          )}
        </div>

        {/* Rodapé com responsável e data */}
        <div className="flex items-center justify-between text-sm text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 text-slate-400" />
              <span className="truncate">{responsibleUser?.full_name || responsibleUser?.display_name || demanda.responsavel_designado || 'Sem responsável'}</span>
            </div>
            <div className="flex items-center gap-1">
              {demanda.prazo_estimado ? (
                demanda.prioridade === 'urgente' ? (
                  <UrgentTimer createdAt={demanda.created_at} />
                ) : (
                  <>
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{formatDateSafely(demanda.prazo_estimado, "dd/MM")}</span>
                  </>
                )
              ) : (
                <span className="text-slate-400">Sem prazo</span>
              )}
            </div>
          </div>
          <div className="text-xs text-slate-400">
            {demanda.updated_at && demanda.updated_at !== demanda.created_at ? (
              <span className="text-amber-600">Editado {formatDateSafely(demanda.updated_at, "dd/MM/yy")}</span>
            ) : (
              formatDateSafely(demanda.created_at, "dd/MM/yy")
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
