export const createPageUrl = (pageName) => {
  if (pageName === "Dashboard") return "/";
  return `/${pageName}`;
};