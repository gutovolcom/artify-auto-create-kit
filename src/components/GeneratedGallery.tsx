
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
                      {/* Real preview with styling matching the reference image */}
                      <div className="aspect-[4/3] h-auto w-full bg-red-600 text-white">
                        <div className="relative w-full h-full flex flex-col p-3">
                          {/* Logo area */}
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded-md bg-blue-500 mr-2 flex items-center justify-center overflow-hidden">
                              <div className="w-full h-full bg-yellow-400 relative">
                                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-700 rounded-full"></div>
                              </div>
                            </div>
                            <div className="text-lg font-bold tracking-wide">
                              {eventData.title.toUpperCase()}
                            </div>
                          </div>
                          
                          {/* Course topic */}
                          <div className="mb-2">
                            <div className="text-sm font-bold">
                              EM FOCO: {eventData.subtitle || "Tema da Aula"}
                            </div>
                            <div className="text-xs">
                              {eventData.date} {eventData.time && `- ${eventData.time}`}
                            </div>
                          </div>
                          
                          {/* Company logo at bottom */}
                          <div className="mt-auto">
                            <div className="text-lg font-bold tracking-wide">LOGO</div>
                          </div>
                          
                          {/* Teacher image if available */}
                          {eventData.teacherImages.length > 0 && (
                            <div className="absolute right-1 bottom-1 h-2/3 w-1/3">
                              <img 
                                src={eventData.teacherImages[0]} 
                                alt="Professor"
                                className="h-full w-auto object-contain object-bottom"
                              />
                            </div>
                          )}
                        </div>
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
