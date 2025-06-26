import { Button } from "@/components/ui/button";

interface GenerationSectionProps {
  isGenerating: boolean;
  generationProgress: number;
  currentGeneratingFormat: string;
  isFormReady: boolean;
  onGenerate: () => void;
  missingFields: string[]; // ainda está disponível caso queira usar no futuro
}

export const GenerationSection = ({
  isGenerating,
  isFormReady,
  onGenerate
}: GenerationSectionProps) => {
  return (
    <div className="mt-6">
      <Button
        className="w-full h-10 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
        onClick={onGenerate}
        disabled={isGenerating || !isFormReady}
      >
        {isGenerating ? "Gerando..." : "Gerar artes"}
      </Button>
    </div>
  );
};
