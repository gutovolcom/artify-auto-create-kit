
import { toast } from "sonner";

export const useNotifications = () => {
  const notifications = {
    success: {
      imagesGenerated: (count: number) => 
        toast.success(`${count} imagens geradas com sucesso!`),
      zipDownloaded: () => 
        toast.success("Arquivo ZIP baixado com sucesso!"),
      templatesUpdated: () => 
        toast.success("Templates e layouts atualizados!"),
      logoutSuccess: () => 
        toast.success("Logout realizado com sucesso!"),
      dataUpdated: (item: string) => 
        toast.success(`${item} atualizado com sucesso!`),
    },
    error: {
      requiredFields: () => 
        toast.error("Por favor, preencha todos os campos obrigatórios."),
      generationFailed: () => 
        toast.error("Erro durante a geração das imagens. Tente novamente."),
      noImagesGenerated: () => 
        toast.error("Nenhuma imagem foi gerada. Verifique os dados e tente novamente."),
      zipCreationFailed: () => 
        toast.error("Erro ao criar arquivo ZIP. Tente novamente."),
      noImagesToExport: () => 
        toast.error("Nenhuma imagem para exportar."),
      updateFailed: (item: string) => 
        toast.error(`Erro ao atualizar ${item}`),
      templateNotFound: () => 
        toast.error("Template não encontrado. Tente atualizar a página."),
    },
    info: {
      addTemplateInfo: () => 
        toast.info("Para adicionar templates, use o painel administrativo"),
      processingImages: () => 
        toast.info("Processando imagens..."),
    }
  };

  return notifications;
};
