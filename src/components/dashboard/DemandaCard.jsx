import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Eye,
  Cog,
  CheckCircle2,
  Calendar,
  User,
  Trash2,
  Server,
  Briefcase,
  Building,
  MessageSquareDashed,
  MessageSquare,
  Edit2,
  Save,
  X
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useState } from "react";
import { Demanda } from "@/entities/Demanda";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import ResponsibleSelector from "@/components/ui/ResponsibleSelector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UrgentTimer from "@/components/ui/UrgentTimer";

const statusConfig = {
  pendente_visualizacao: { icon: Clock, color: "text-amber-700", bgColor: "bg-amber-100", label: "Pendente" },
  visualizada: { icon: Eye, color: "text-blue-700", bgColor: "bg-blue-100", label: "Visualizada" },
  em_producao: { icon: Cog, color: "text-purple-700", bgColor: "bg-purple-100", label: "Em Produção" },
  finalizada: { icon: CheckCircle2, color: "text-emerald-700", bgColor: "bg-emerald-100", label: "Finalizada" }
};
const areaConfig = {
  suporte: { color: "bg-blue-100 text-blue-800", label: "Suporte" },
  atendimento: { color: "bg-emerald-100 text-emerald-800", label: "Atendimento" },
  comercial: { color: "bg-purple-100 text-purple-800", label: "Comercial" }
};
const prioridadeConfig = {
  baixa: { color: "bg-slate-100 text-slate-700", label: "Baixa" },
  media: { color: "bg-yellow-100 text-yellow-800", label: "Média" },
  alta: { color: "bg-orange-100 text-orange-800", label: "Alta" },
  urgente: { color: "bg-red-100 text-red-800", label: "Urgente" }
};

export default function DemandaCard({ demanda, criador, onStatusChange, onDelete, onSelect, onUpdate }) {
  const { user } = useAuth();
  const { notify } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [responsibleUser, setResponsibleUser] = useState(null);
  const [creatorUser, setCreatorUser] = useState(null);

  const formatDateSafely = (dateString, formatPattern) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return format(date, formatPattern, { locale: ptBR });
  };

  const statusInfo = statusConfig[demanda.status] || statusConfig['pendente_visualizacao'];
  const StatusIcon = statusInfo.icon;

  // Carregar dados do responsável
  React.useEffect(() => {
    if (demanda.responsavel_designado) {
      loadResponsibleUser(demanda.responsavel_designado);
    }
  }, [demanda.responsavel_designado]);

  // Carregar dados do criador
  React.useEffect(() => {
    if (demanda.user_id) {
      loadCreatorUser(demanda.user_id);
    }
  }, [demanda.user_id]);

  const loadResponsibleUser = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, raw_user_meta_data')
        .eq('id', userId)
        .single();
      
      if (profile && !error) {
        setResponsibleUser({
          id: profile.id,
          name: profile.raw_user_meta_data?.name || 'Usuário',
          email: profile.email
        });
      }
    } catch (error) {
      console.error('Erro ao carregar responsável:', error);
    }
  };

  const loadCreatorUser = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, raw_user_meta_data')
        .eq('id', userId)
        .single();
      
      if (profile && !error) {
        setCreatorUser({
          id: profile.id,
          name: profile.raw_user_meta_data?.name || 'Usuário',
          email: profile.email
        });
      }
    } catch (error) {
      console.error('Erro ao carregar criador:', error);
    }
  };

  const handleEdit = () => {
    setEditData({
      titulo: demanda.titulo,
      descricao: demanda.descricao,
      status: demanda.status,
      prioridade: demanda.prioridade,
      responsavel_designado: demanda.responsavel_designado
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedDemanda = await Demanda.update(demanda.id, editData);
      if (updatedDemanda) {
        notify.success('Demanda atualizada', 'As alterações foram salvas com sucesso!');
        
        
        setIsEditing(false);
        if (onUpdate) {
          onUpdate(updatedDemanda);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar demanda:', error);
      notify.error('Erro ao atualizar', error.message || 'Ocorreu um erro inesperado');
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="cursor-default"
      >
        <Card className="h-full border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Editando Demanda</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Título</label>
              <Input
                value={editData.titulo || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Título da demanda"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Descrição</label>
              <Textarea
                value={editData.descricao || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição da demanda"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
                <Select
                  value={editData.status || demanda.status || 'pendente_visualizacao'}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <config.icon className={`w-4 h-4 ${config.color}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Prioridade</label>
                <Select
                  value={editData.prioridade || ''}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, prioridade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(prioridadeConfig).map(([prioridade, config]) => (
                      <SelectItem key={prioridade} value={prioridade}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Responsável</label>
              <ResponsibleSelector
                value={editData.responsavel_designado}
                onChange={(value) => setEditData(prev => ({ ...prev, responsavel_designado: value }))}
                placeholder="Selecione um responsável"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`cursor-pointer hover:shadow-lg transition-all duration-200 shadow-sm bg-white relative h-[400px] ${
        demanda.prioridade === 'urgente' ? 'urgent-pulse border-red-200' : ''
      }`}>
        {/* Header - posição fixa no topo */}
        <div className="absolute top-0 left-0 right-0 p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <h3 className="font-semibold text-slate-900 text-lg leading-tight line-clamp-2 h-12 flex items-start">
                {demanda.titulo}
              </h3>
              <p className="text-slate-600 text-sm line-clamp-2 mt-1 h-8 flex items-start">
                {demanda.descricao}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2" onClick={handleMenuClick}>
                  <div className={`p-1 rounded-full ${statusInfo.bgColor}`}>
                    <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
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
                  onClick={(e) => { handleMenuClick(e); handleEdit(); }}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { handleMenuClick(e); onDelete(demanda.id); }}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Seção de observações e comentários - posição fixa */}
        <div className="absolute top-24 left-4 right-4 space-y-2">
          {demanda.observacoes && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-100 p-2 rounded-md h-8">
              <MessageSquareDashed className="h-4 w-4" />
              <span className="font-medium">Possui observações</span>
            </div>
          )}
          {demanda.comentarios_count && demanda.comentarios_count[0]?.count > 0 && (
            <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-100 p-2 rounded-md h-8">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">
                {demanda.comentarios_count[0].count} comentário{demanda.comentarios_count[0].count !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Seção de badges - posição fixa */}
        <div className="absolute top-32 left-4 right-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={areaConfig[demanda.area_responsavel]?.color}>
              {areaConfig[demanda.area_responsavel]?.label}
            </Badge>
            <Badge className={prioridadeConfig[demanda.prioridade]?.color}>
              {prioridadeConfig[demanda.prioridade]?.label}
            </Badge>
          </div>
        </div>
        
        <CardContent className="pt-0 flex-grow relative">
          {/* Seção de informações da demanda - posição fixa */}
          <div className="absolute top-48 left-4 right-4 space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2 h-5">
              <Server className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{demanda.adserver || ''}</span>
            </div>
            <div className="flex items-center gap-2 h-5">
              <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{demanda.agencia || ''}</span>
            </div>
            <div className="flex items-center gap-2 h-5">
              <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{demanda.cliente_final || ''}</span>
            </div>
          </div>
          
          {/* Seção de rodapé - posição fixa no final */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-sm text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 min-w-0 h-5">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{responsibleUser?.name || 'Sem responsável'}</span>
              </div>
              <div className="flex items-center gap-1 h-5">
                {demanda.prazo_estimado ? (
                  demanda.prioridade === 'urgente' ? (
                    <UrgentTimer createdAt={demanda.created_at} />
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateSafely(demanda.prazo_estimado, "dd/MM")}</span>
                    </>
                  )
                ) : (
                  <span className="text-slate-400">Sem prazo</span>
                )}
              </div>
            </div>
            <div className="text-xs h-5 flex items-center">
              {demanda.updated_at && demanda.updated_at !== demanda.created_at ? (
                <span className="text-amber-600">Editado {formatDateSafely(demanda.updated_at, "dd/MM/yy")}</span>
              ) : (
                formatDateSafely(demanda.created_at, "dd/MM/yy")
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}