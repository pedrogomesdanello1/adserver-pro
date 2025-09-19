import React, { useState, useEffect } from "react";
import { Demanda } from "@/entities/Demanda";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils/createPageUrl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { CreatableSelect } from "@/components/ui/CreatableSelect";
import { useAuth } from '../context/AuthContext';
import ResponsibleSelector from '@/components/ui/ResponsibleSelector';

export default function EditarDemanda() {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [agencias, setAgencias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    adserver: "",
    agencia: "",
    cliente_final: "",
    area_responsavel: "",
    area_solicitante: "",
    prioridade: "media",
    prazo_estimado: "",
    responsavel_designado: "",
    observacoes: "",
    status: "pendente_visualizacao"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar dados da demanda
        const demandas = await Demanda.list();
        const demanda = demandas.find(d => d.id === id);
        
        if (!demanda) {
          setError("Demanda não encontrada");
          return;
        }

        // Preencher formulário com dados da demanda
        setFormData({
          titulo: demanda.titulo || "",
          descricao: demanda.descricao || "",
          adserver: demanda.adserver || "",
          agencia: demanda.agencia || "",
          cliente_final: demanda.cliente_final || "",
          area_responsavel: demanda.area_responsavel || "",
          area_solicitante: demanda.area_solicitante || "",
          prioridade: demanda.prioridade || "media",
          prazo_estimado: demanda.prazo_estimado || "",
          responsavel_designado: demanda.responsavel_designado || "",
          observacoes: demanda.observacoes || "",
          status: demanda.status || "pendente_visualizacao"
        });

        // Carregar opções de agências e clientes
        const agenciasUnicas = [...new Set(demandas.map(d => d.agencia).filter(Boolean))];
        const clientesUnicos = [...new Set(demandas.map(d => d.cliente_final).filter(Boolean))];
        setAgencias(agenciasUnicas.map(a => ({ value: a, label: a })));
        setClientes(clientesUnicos.map(c => ({ value: c, label: c })));

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Erro ao carregar dados da demanda");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validar campos obrigatórios
      if (!formData.titulo.trim()) {
        setError("Título é obrigatório");
        return;
      }

      if (!formData.descricao.trim()) {
        setError("Descrição é obrigatória");
        return;
      }

      // Atualizar demanda
      const updatedDemanda = await Demanda.update(id, {
        ...formData,
        updated_at: new Date().toISOString()
      });

      if (updatedDemanda) {
        navigate("/");
      } else {
        setError("Erro ao atualizar demanda");
      }

    } catch (error) {
      console.error("Erro ao atualizar demanda:", error);
      setError("Erro ao atualizar demanda");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados da demanda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Editar Demanda</h1>
              <p className="text-slate-600 mt-1">Atualize as informações da demanda</p>
            </div>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Informações da Demanda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => handleInputChange("titulo", e.target.value)}
                      placeholder="Digite o título da demanda"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente_visualizacao">Pendente de Visualização</SelectItem>
                        <SelectItem value="visualizada">Visualizada</SelectItem>
                        <SelectItem value="em_producao">Em Produção</SelectItem>
                        <SelectItem value="finalizada">Finalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                    placeholder="Descreva detalhadamente a demanda"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="adserver">Adserver</Label>
                    <Input
                      id="adserver"
                      value={formData.adserver}
                      onChange={(e) => handleInputChange("adserver", e.target.value)}
                      placeholder="Nome do adserver"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agencia">Agência</Label>
                    <CreatableSelect
                      value={formData.agencia}
                      onChange={(value) => handleInputChange("agencia", value)}
                      options={agencias}
                      placeholder="Selecione ou digite uma agência"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cliente_final">Cliente Final</Label>
                    <CreatableSelect
                      value={formData.cliente_final}
                      onChange={(value) => handleInputChange("cliente_final", value)}
                      options={clientes}
                      placeholder="Selecione ou digite um cliente"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="area_responsavel">Área Responsável</Label>
                    <Select
                      value={formData.area_responsavel}
                      onValueChange={(value) => handleInputChange("area_responsavel", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suporte">Suporte</SelectItem>
                        <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="vendas">Vendas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select
                      value={formData.prioridade}
                      onValueChange={(value) => handleInputChange("prioridade", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="prazo_estimado">Prazo Estimado</Label>
                    <Input
                      id="prazo_estimado"
                      type="date"
                      value={formData.prazo_estimado}
                      onChange={(e) => handleInputChange("prazo_estimado", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Responsável Designado</Label>
                    <ResponsibleSelector
                      value={formData.responsavel_designado}
                      onChange={(value) => handleInputChange("responsavel_designado", value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange("observacoes", e.target.value)}
                    placeholder="Observações adicionais"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
