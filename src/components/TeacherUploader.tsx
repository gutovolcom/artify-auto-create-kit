
import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, X, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface TeacherUploaderProps {
  teacherImages: string[];
  updateTeacherImages: (images: string[]) => void;
}

export const TeacherUploader = ({
  teacherImages,
  updateTeacherImages,
}: TeacherUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Validar o arquivo (deve ser imagem)
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }
    
    // Criar URL para a imagem carregada
    const imageUrl = URL.createObjectURL(file);
    updateTeacherImages([...teacherImages, imageUrl]);
    
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTeacher = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveTeacher = (index: number) => {
    const newImages = [...teacherImages];
    const removedImageUrl = newImages[index];
    
    // Revogar a URL do objeto para evitar vazamento de memória
    if (removedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(removedImageUrl);
    }
    
    newImages.splice(index, 1);
    updateTeacherImages(newImages);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fotos dos Professores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {teacherImages.map((image, index) => (
            <div
              key={index}
              className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-200"
            >
              <Avatar className="w-full h-full">
                <AvatarImage
                  src={image}
                  alt={`Professor ${index + 1}`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  <Camera className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0 h-5 w-5 rounded-full"
                onClick={() => handleRemoveTeacher(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          <Button
            variant="outline"
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-dashed"
            onClick={handleAddTeacher}
          >
            <Upload className="h-6 w-6 mb-1" />
            <span className="text-xs">Adicionar</span>
          </Button>
          
          {/* Input oculto para selecionar arquivos */}
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Adicione fotos dos professores ou palestrantes do evento
        </p>
      </CardContent>
    </Card>
  );
};
