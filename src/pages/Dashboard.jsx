import React, { useState, useEffect } from "react";
import { Demanda } from "@/entities/Demanda";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Paperclip, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from "date-fns/locale";
import StatusCards from "../components/dashboard/StatusCards";
import DemandaCard from "../components/dashboard/DemandaCard";
import FiltrosDemandas from "../components/dashboard/FiltrosDemandas";
import ComentariosSection from "../components/dashboard/ComentariosSection";
import { useNotifications } from "@/context/NotificationContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { notifications, notify } = useNotifications();
  const [demandas, setDemandas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agenciasUnicas, setAgenciasUnicas] = useState([]);
  const [clientesUnicos, setClientesUnicos] = useState([]);
  const [responsaveisUnicos, setResponsaveisUnicos] = useState([]);
  const [filtros, setFiltros] = useState({
    status: "todos",
    area: "todos",
    prioridade: "todos",
    adserver: "todos",
    agencia: "todos",
    cliente_final: "todos",
    responsavel_designado: "todos"
  });
  const [demandaSelecionada, setDemandaSelecionada] = useState(null);

  useEffect(() => {
    loadDemandas();
  }, []);

  // Esta é a função de carregamento correta e simplificada
  const loadDemandas = async () => {
    setIsLoading(true);
    try {
      const data = await Demanda.list(); // Apenas esta linha é necessária
      setDemandas(data);

      const agencias = [...new Set(data.map(d => d.agencia).filter(Boolean))];
      const clientes = [...new Set(data.map(d => d.cliente_final).filter(Boolean))];
      const responsaveis = [...new Set(data.map(d => d.responsavel_designado).filter(Boolean))];

      setAgenciasUnicas(agencias.sort());
      setClientesUnicos(clientes.sort());
      setResponsaveisUnicos(responsaveis.sort());

    } catch (error) {
      console.error("Erro ao carregar demandas:", error);
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (demandaId, novoStatus) => {
    try {
      await Demanda.update(demandaId, { status: novoStatus });
      setDemandaSelecionada(prev => prev ? { ...prev, status: novoStatus } : null);
      loadDemandas();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleDeleteDemanda = async (demandaId) => {
    if (window.confirm("Tem certeza que deseja excluir esta demanda? Esta ação não pode ser desfeita.")) {
      try {
        await Demanda.delete(demandaId);
        setDemandaSelecionada(null);
        loadDemandas();
      } catch (error) {
        console.error("Erro ao excluir demanda:", error);
      }
    }
  };

  const handleFiltroChange = (tipo, valor) => {
    setFiltros(prev => ({ ...prev, [tipo]: valor }));
  };

  const handleLimparFiltros = () => {
    setFiltros({
      status: "todos", area: "todos", prioridade: "todos", adserver: "todos",
      agencia: "todos", cliente_final: "todos", responsavel_designado: "todos"
    });
  };

  const demandasFiltradas = demandas.filter(demanda => {
    const statusMatch = filtros.status === "todos" || demanda.status === filtros.status;
    const areaMatch = filtros.area === "todos" || demanda.area_responsavel === filtros.area;
    const prioridadeMatch = filtros.prioridade === "todos" || demanda.prioridade === filtros.prioridade;
    const adserverMatch = filtros.adserver === "todos" || demanda.adserver === filtros.adserver;
    const agenciaMatch = filtros.agencia === "todos" || demanda.agencia === filtros.agencia;
    const clienteMatch = filtros.cliente_final === "todos" || demanda.cliente_final === filtros.cliente_final;
    const responsavelMatch = filtros.responsavel_designado === "todos" || demanda.responsavel_designado === filtros.responsavel_designado;
    return statusMatch && areaMatch && prioridadeMatch && adserverMatch && agenciaMatch && clienteMatch && responsavelMatch;
  });

  return (
    // Estrutura de layout corrigida
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
          {/* -- Seção do Cabeçalho (Corrigida) -- */}
          <div className="flex justify-between items-center">
            {/* Div da Esquerda (Título) */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard de Demandas</h1>
              <p className="text-slate-600 mt-2">Gerencie todas as solicitações em tempo real</p>
            </motion.div>
            
            {/* Div da Direita (Ações) */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => notify.info('Notificações', 'Sistema de notificações ativo!')}
                className="relative p-3 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <Bell className="w-6 h-6 text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              <div className="flex gap-3">
              <Button variant="outline" onClick={loadDemandas} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={() => navigate('/novademanda')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Demanda
              </Button>
              </div>
            </div>
          </div>

        {/* -- Seção dos Status Cards -- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatusCards demandas={demandasFiltradas} />
        </motion.div>

        {/* -- Seção dos Filtros -- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <FiltrosDemandas
            filtros={filtros}
            onFiltroChange={handleFiltroChange}
            onLimparFiltros={handleLimparFiltros}
            agencias={agenciasUnicas}
            clientes={clientesUnicos}
            responsaveis={responsaveisUnicos}
          />
        </motion.div>

        {/* -- Seção das Demandas Ativas -- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Demandas Ativas ({demandasFiltradas.length})
              </h2>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse"><div className="bg-slate-200 rounded-lg h-48"></div></div>
                ))}
              </div>
            ) : demandasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4"><Plus className="w-12 h-12 mx-auto" /></div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma demanda encontrada</h3>
                <p className="text-slate-600 mb-6">
                  {Object.values(filtros).some(f => f !== "todos") ? "Ajuste os filtros ou crie uma nova demanda." : "Comece criando sua primeira demanda."}
                </p>
                <Button onClick={() => navigate('/novademanda')}><Plus className="w-4 h-4 mr-2" />Criar Demanda</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {demandasFiltradas.map((demanda) => (
                    <DemandaCard
                      key={demanda.id}
                      demanda={demanda}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteDemanda}
                      onSelect={() => setDemandaSelecionada(demanda)}
                      onUpdate={(updatedDemanda) => {
                        setDemandas(prev => prev.map(d => d.id === updatedDemanda.id ? updatedDemanda : d));
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* -- Seção do Pop-up (Dialog) -- */}
      <Dialog open={!!demandaSelecionada} onOpenChange={() => setDemandaSelecionada(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{demandaSelecionada?.titulo}</DialogTitle>
            <DialogDescription>
              Criado em: {demandaSelecionada && format(new Date(demandaSelecionada.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 text-sm">
            {demandaSelecionada?.profile && (
              <div>
                <h4 className="font-semibold mb-2 text-slate-800">Criado por</h4>
                <div className="flex items-center gap-3">
                  <img 
                    src={demandaSelecionada.profile.raw_user_meta_data?.avatar_url} 
                    alt="Avatar do criador"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{demandaSelecionada.profile.raw_user_meta_data?.full_name}</p>
                    <p className="text-slate-500 text-xs">{demandaSelecionada.profile.email}</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <h4 className="font-semibold mb-2 text-slate-800">Descrição Detalhada</h4>
              <p className="text-slate-600 whitespace-pre-wrap">{demandaSelecionada?.descricao || "Nenhuma descrição."}</p>
            </div>
            {demandaSelecionada?.observacoes && (
              <div>
                <h4 className="font-semibold mb-2 text-slate-800">Observações Adicionais</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{demandaSelecionada?.observacoes}</p>
              </div>
            )}
            
            {/* Seção de Comentários */}
            {demandaSelecionada && (
              <ComentariosSection demandaId={demandaSelecionada.id} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}