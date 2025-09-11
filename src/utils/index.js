export const createPageUrl = (pageName) => {
  // Navega para a raiz se for o Dashboard, senão para a página específica
  if (pageName === "Dashboard") return "/";
  return `/${pageName}`;
};