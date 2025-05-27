
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseTeachers } from "@/hooks/useSupabaseTeachers";
import { Loader2 } from "lucide-react";

export const TeacherManager = () => {
  const { teachers, loading, createTeacher, deleteTeacher } = useSupabaseTeachers();
  const [isCreating, setIsCreating] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherFile, setNewTeacherFile] = useState<File | null>(null);
  const [creating, setCreatingState] = useState(false);

  const handleCreateTeacher = async () => {
    if (!newTeacherName.trim()) {
      toast.error("Nome do professor é obrigatório!");
      return;
    }

    if (!newTeacherFile) {
      toast.error("Foto do professor é obrigatória!");
      return;
    }

    setCreatingState(true);
    try {
      await createTeacher(newTeacherName.trim(), newTeacherFile);
      setIsCreating(false);
      setNewTeacherName("");
      setNewTeacherFile(null);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setCreatingState(false);
    }
  };

  const resetForm = () => {
    setNewTeacherName("");
    setNewTeacherFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Professores Cadastrados</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>Adicionar Professor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Professor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Atenção:</strong> Digite o nome do professor corretamente, pois este texto será usado nas artes geradas.
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="teacherName">Nome do Professor</Label>
                <Input
                  id="teacherName"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="Ex: Prof. João Silva"
                />
              </div>
              
              <div>
                <Label htmlFor="teacherPhoto">Foto do Professor</Label>
                <Input
                  id="teacherPhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewTeacherFile(file);
                    }
                  }}
                />
                {newTeacherFile && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ {newTeacherFile.name}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateTeacher}
                  disabled={creating}
                >
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Adicionar Professor
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsCreating(false);
                  resetForm();
                }}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <Card key={teacher.id}>
            <CardHeader>
              <CardTitle className="text-lg">{teacher.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={teacher.image_url}
                  alt={teacher.name}
                  className="w-24 h-24 object-cover rounded-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTeacher(teacher.id)}
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
