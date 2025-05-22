
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface GeneratedGalleryProps {
  images: string[];
}

export const GeneratedGallery = ({ images }: GeneratedGalleryProps) => {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-gray-100 p-6 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-500"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Nenhuma imagem gerada</h3>
        <p className="text-gray-500 max-w-md">
          Vá para a aba "Pré-visualização" e clique em "Gerar Pré-visualizações" para criar suas artes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Artes Geradas</h3>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-6 p-4">
            {images.map((image, index) => (
              <div key={index} className="w-[250px] shrink-0 space-y-3">
                <div className="overflow-hidden rounded-md border">
                  <img
                    src={image}
                    alt={`Generated image ${index + 1}`}
                    className="aspect-[4/3] h-auto w-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <p className="font-medium">Plataforma {index + 1}</p>
                  </div>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};
