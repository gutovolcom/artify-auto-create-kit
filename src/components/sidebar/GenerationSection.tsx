import { Button } from "@/components/ui/button";

interface GenerationSectionProps {
  isGenerating: boolean;
  onGenerate: () => void;
}

export const GenerationSection = ({
  isGenerating,
  onGenerate,
}: GenerationSectionProps) => {
  return (
    <div className="mt-6">
      <Button
        className="w-full h-10 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
        onClick={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? "Gerando..." : "Gerar artes"}
      </Button>
    </div>
  );
};
