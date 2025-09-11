import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

export default function FiltrosDemandas({ filtros, onFiltroChange, onLimparFiltros, agencias, clientes, responsaveis }) { // RECEBE 'responsaveis'
  const activeFiltersCount = Object.values(filtros).filter(value => value !== "todos").length;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Filtros</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Select value={filtros.adserver} onValueChange={(value) => onFiltroChange("adserver", value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Adserver" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Adservers</SelectItem>
              <SelectItem value="Admotion">Admotion</SelectItem>
              <SelectItem value="Ahead">Ahead</SelectItem>
              <SelectItem value="Digital Operations">Digital Operations</SelectItem>
            </SelectContent>
          </Select>
        
          <Select value={filtros.status} onValueChange={(value) => onFiltroChange("status", value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="pendente_visualizacao">Pendente</SelectItem>
              <SelectItem value="visualizada">Visualizada</SelectItem>
              <SelectItem value="em_producao">Em Produção</SelectItem>
              <SelectItem value="finalizada">Finalizada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtros.area} onValueChange={(value) => onFiltroChange("area", value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as áreas</SelectItem>
              <SelectItem value="suporte">Suporte</SelectItem>
              <SelectItem value="atendimento">Atendimento</SelectItem>
              <SelectItem value="comercial">Comercial</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtros.prioridade} onValueChange={(value) => onFiltroChange("prioridade", value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtros.agencia} onValueChange={(value) => onFiltroChange("agencia", value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Agência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as agências</SelectItem>
              {agencias.map(agencia => (
                <SelectItem key={agencia} value={agencia}>{agencia}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtros.cliente_final} onValueChange={(value) => onFiltroChange("cliente_final", value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Cliente Final" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os clientes</SelectItem>
              {clientes.map(cliente => (
                <SelectItem key={cliente} value={cliente}>{cliente}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* NOVO FILTRO DE COLABORADOR */}
          <Select value={filtros.responsavel_designado} onValueChange={(value) => onFiltroChange("responsavel_designado", value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Responsáveis</SelectItem>
              {responsaveis.map(responsavel => (
                <SelectItem key={responsavel} value={responsavel}>{responsavel}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLimparFiltros}
              className="flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}