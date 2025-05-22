
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";

interface TeacherUploaderProps {
  teacherImages: string[];
  updateTeacherImages: (images: string[]) => void;
}

export const TeacherUploader = ({
  teacherImages,
  updateTeacherImages,
}: TeacherUploaderProps) => {
  // This would be replaced with actual file upload logic
  const handleAddTeacher = () => {
    // Simulating an image upload by adding a placeholder
    updateTeacherImages([...teacherImages, "/placeholder.svg"]);
  };

  const handleRemoveTeacher = (index: number) => {
    const newImages = [...teacherImages];
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
              <img
                src={image}
                alt={`Professor ${index + 1}`}
                className="object-cover w-full h-full"
              />
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
        </div>
        <p className="text-xs text-muted-foreground">
          Adicione fotos dos professores ou palestrantes do evento
        </p>
      </CardContent>
    </Card>
  );
};
