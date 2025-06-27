
import { Button } from "@/components/ui/button";

interface GenerationSectionProps {
  isGenerating: boolean;
  isFormValid: boolean;
  onGenerate: () => void;
}

export const GenerationSection = ({
  isGenerating,
  isFormValid,
  onGenerate
}: GenerationSectionProps) => {
  return (
    <div className="mt-6">
      <Button
        className="w-full h-10 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
        onClick={onGenerate}
        disabled={isGenerating || !isFormValid}
      >
        {isGenerating ? "Gerando..." : "Gerar artes"}
      </Button>
      
      {!isFormValid && !isGenerating && (
        <p className="text-xs text-red-500 mt-2 text-center">
          Preencha todos os campos obrigatórios
        </p>
      )}
    </div>
  );
};
