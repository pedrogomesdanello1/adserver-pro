import React, { useState, useEffect } from "react";
import { Demanda } from "@/entities/Demanda";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils/createPageUrl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { CreatableSelect } from "@/components/ui/CreatableSelect";
import { useAuth } from '../context/AuthContext';

export default function NovaDemanda() {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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
    observacoes: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const demandas = await Demanda.list();
        const agenciasUnicas = [...new Set(demandas.map(d => d.agencia).filter(Boolean))];
        const clientesUnicos = [...new Set(demandas.map(d => d.cliente_final).filter(Boolean))];
        setAgencias(agenciasUnicas.map(a => ({ value: a, label: a })));
        setClientes(clientesUnicos.map(c => ({ value: c, label: c })));
      } catch (e) {
        console.error("Failed to fetch agencies/clients:", e);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (campo, valor) => {
    if (campo === 'agencia') {
        if (valor && !agencias.some(a => a.value === valor)) {
            setAgencias(prev => [...prev, { value: valor, label: valor }]);
        }
        setFormData(prev => ({ ...prev, agencia: valor }));
    } else if (campo === 'cliente_final') {
        if (valor && !clientes.some(c => c.value === valor)) {
            setClientes(prev => [...prev, { value: valor, label: valor }]);
        }
        setFormData(prev => ({ ...prev, cliente_final: valor }));
    } else {
        setFormData(prev => ({ ...prev, [campo]: valor }));
    }
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.area_responsavel || !formData.area_solicitante || !formData.adserver || !formData.agencia || !formData.cliente_final || !formData.prazo_estimado) {
      setError("Por favor, preencha os campos obrigatórios (*).");
      return;
    }

    setIsLoading(true);
    try {
      const dadosParaEnviar = { ...formData, user_id: user.id };
      await Demanda.create(dadosParaEnviar);
      navigate("/"); 
    } catch (error) {
      console.error("Erro ao criar demanda:", error);
      setError("Erro ao criar demanda. Tente novamente.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Bloco de animação removido daqui */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")} // Corrigido para navegar para a raiz
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nova Demanda</h1>
            <p className="text-slate-600 mt-1">Crie uma nova solicitação para sua equipe</p>
          </div>
        </div>

        {error && (
          // Bloco de animação removido daqui
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Bloco de animação removido daqui */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl text-slate-900">Informações da Demanda</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="titulo" className="text-slate-700 font-medium">
                    Título da Demanda *
                  </Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                    placeholder="Digite o título da demanda"
                    className="mt-2"
                  />
                </div>
                
                <div>
                    <Label htmlFor="adserver" className="text-slate-700 font-medium">
                    Adserver *
                  </Label>
                    <Select
                    value={formData.adserver}
                    onValueChange={(value) => handleInputChange("adserver", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione o Adserver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admotion">Admotion</SelectItem>
                      <SelectItem value="Ahead">Ahead</SelectItem>
                      <SelectItem value="Digital Operations">Digital Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="agencia" className="text-slate-700 font-medium">
                      Agência *
                  </Label>
                    <CreatableSelect
                      options={agencias}
                      value={formData.agencia}
                      onChange={(newValue) => handleInputChange("agencia", newValue)}
                      placeholder="Selecione ou crie a agência"
                      createLabel="Adicionar nova agência"
                      className="mt-2"
                    />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="cliente_final" className="text-slate-700 font-medium">
                      Cliente Final *
                  </Label>
                    <CreatableSelect
                      options={clientes}
                      value={formData.cliente_final}
                      onChange={(newValue) => handleInputChange("cliente_final", newValue)}
                      placeholder="Selecione ou crie o cliente"
                      createLabel="Adicionar novo cliente"
                      className="mt-2"
                    />
                </div>

                <div>
                  <Label htmlFor="area_solicitante" className="text-slate-700 font-medium">
                    Área Solicitante *
                  </Label>
                  <Select
                    value={formData.area_solicitante}
                    onValueChange={(value) => handleInputChange("area_solicitante", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione sua área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suporte">Suporte</SelectItem>
                      <SelectItem value="atendimento">Atendimento</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="area_responsavel" className="text-slate-700 font-medium">
                    Área Responsável *
                  </Label>
                  <Select
                    value={formData.area_responsavel}
                    onValueChange={(value) => handleInputChange("area_responsavel", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione a área responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suporte">Suporte</SelectItem>
                      <SelectItem value="atendimento">Atendimento</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prioridade" className="text-slate-700 font-medium">
                    Prioridade
                  </Label>
                  <Select
                    value={formData.prioridade}
                    onValueChange={(value) => handleInputChange("prioridade", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prazo_estimado" className="text-slate-700 font-medium">
                    Prazo Estimado *
                  </Label>
                  <Input
                    id="prazo_estimado"
                    type="date"
                    value={formData.prazo_estimado}
                    onChange={(e) => handleInputChange("prazo_estimado", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="responsavel_designado" className="text-slate-700 font-medium">
                    Responsável Designado
                  </Label>
                  <Input
                    id="responsavel_designado"
                    value={formData.responsavel_designado}
                    onChange={(e) => handleInputChange("responsavel_designado", e.target.value)}
                    placeholder="Nome do responsável (opcional)"
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="descricao" className="text-slate-700 font-medium">
                    Descrição Detalhada
                  </Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                    placeholder="Descreva detalhadamente a demanda..."
                    className="mt-2 h-32"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="observacoes" className="text-slate-700 font-medium">
                    Observações Adicionais
                  </Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange("observacoes", e.target.value)}
                    placeholder="Informações extras, links, referências..."
                    className="mt-2 h-24"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")} // Corrigido para navegar para a raiz
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Criar Demanda
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}