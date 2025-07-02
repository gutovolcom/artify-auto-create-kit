import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

export const ExportButton = ({ disabled, onClick }: ExportButtonProps) => {
  return (
    <Button
      className="bg-primary hover:bg-primary/90"
      size="lg"
      disabled={disabled}
      onClick={onClick}
    >
      <Download className="mr-2 h-5 w-5" />
      Exportar Todas as Imagens (ZIP)
    </Button>
  );
};
