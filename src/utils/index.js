export const createPageUrl = (pageName) => {
  // Navega para a raiz se for o Dashboard, senão para a página específica
  if (pageName === "Dashboard") return "/";
  return `/${pageName}`;
};

export const formatDateSafely = (dateString, formatPattern = "dd/MM/yyyy") => {
  if (!dateString) return "Data não informada";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data inválida";
    
    // Formatação simples para os padrões mais comuns
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    const shortYear = year.slice(-2);
    
    switch (formatPattern) {
      case "dd/MM":
        return `${day}/${month}`;
      case "dd/MM/yy":
        return `${day}/${month}/${shortYear}`;
      case "dd/MM/yyyy":
        return `${day}/${month}/${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
};