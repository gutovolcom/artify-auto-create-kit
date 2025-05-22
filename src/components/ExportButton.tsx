
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  disabled?: boolean;
}

export const ExportButton = ({ disabled = false }: ExportButtonProps) => {
  const handleExport = () => {
    // In a real app, this would generate and download a ZIP file
    toast.success("Pacote de imagens exportado com sucesso!", {
      description: "O arquivo ZIP foi baixado para o seu computador.",
    });
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled}
      className="bg-blue-600 hover:bg-blue-700"
      size="lg"
    >
      <Download className="mr-2 h-5 w-5" />
      Exportar como ZIP
    </Button>
  );
};
