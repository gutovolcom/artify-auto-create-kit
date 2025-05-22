
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Mock KV images for demonstration
const kvImages = [
  { id: "kv1", url: "/placeholder.svg", name: "Template 1" },
  { id: "kv2", url: "/placeholder.svg", name: "Template 2" },
  { id: "kv3", url: "/placeholder.svg", name: "Template 3" },
  { id: "kv4", url: "/placeholder.svg", name: "Template 4" },
  { id: "kv5", url: "/placeholder.svg", name: "Template 5" },
  { id: "kv6", url: "/placeholder.svg", name: "Template 6" },
];

interface ImageSelectorProps {
  selectedImageId: string | null;
  onSelect: (id: string) => void;
}

export const ImageSelector = ({ selectedImageId, onSelect }: ImageSelectorProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Selecione a Imagem Principal (KV)</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-2 gap-4">
            {kvImages.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "border cursor-pointer rounded-md overflow-hidden transition-all",
                  selectedImageId === image.id
                    ? "ring-2 ring-blue-600 ring-offset-2"
                    : "hover:border-blue-300"
                )}
                onClick={() => onSelect(image.id)}
              >
                <div className="aspect-video relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-2 text-center text-sm font-medium">
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
