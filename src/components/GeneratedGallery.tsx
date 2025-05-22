
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, Image } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EventData } from "@/pages/Index";

interface GeneratedGalleryProps {
  images: string[];
  eventData: EventData;
}

export const GeneratedGallery = ({ images, eventData }: GeneratedGalleryProps) => {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-gray-100 p-6 mb-4">
          <Image
            className="h-9 w-9 text-gray-500"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2">Nenhuma imagem gerada</h3>
        <p className="text-gray-500 max-w-md">
          Vá para a aba "Pré-visualização" e clique em "Gerar Pré-visualizações" para criar suas artes.
        </p>
      </div>
    );
  }

  const platforms = {
    youtube: "YouTube",
    instagram: "Instagram",
    linkedin: "LinkedIn",
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Artes Geradas</h3>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-6 p-4">
            {images.map((image, index) => {
              const platformId = eventData.platforms[index % eventData.platforms.length];
              const platformName = platforms[platformId as keyof typeof platforms];
              
              return (
                <div key={index} className="w-[250px] shrink-0 space-y-3">
                  <div className="overflow-hidden rounded-md border">
                    <div className="relative">
                      <img
                        src={image}
                        alt={`Generated image ${index + 1}`}
                        className="aspect-[4/3] h-auto w-full object-cover"
                      />
                      
                      {/* Overlay content to represent the generated image */}
                      <div className="absolute inset-0 p-3 flex flex-col items-center justify-center">
                        <h4 className="font-bold text-sm text-center text-white bg-black/50 p-1 rounded mb-1 w-full">
                          {eventData.title}
                        </h4>
                        
                        {/* Show teacher images if available */}
                        {eventData.teacherImages.length > 0 && (
                          <div className="flex -space-x-2 mt-auto">
                            {eventData.teacherImages.slice(0, 3).map((image, idx) => (
                              <Avatar 
                                key={idx} 
                                className="border-2 border-white w-8 h-8"
                              >
                                <AvatarImage src={image} alt={`Professor ${idx + 1}`} />
                                <AvatarFallback>P{idx + 1}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <p className="font-medium">{platformName}</p>
                    </div>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};
