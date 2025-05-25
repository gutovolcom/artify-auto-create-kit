import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePersistedState } from "@/hooks/usePersistedState";

interface Teacher {
  id: string;
  name: string;
  photo: string;
}

export const TeacherManager = () => {
  const [teachers, setTeachers] = usePersistedState<Teacher[]>("admin_teachers", [
    { id: "1", name: "Prof. Ana Silva", photo: "/api/placeholder/150/150" },
    { id: "2", name: "Prof. João Santos", photo: "/api/placeholder/150/150" },
    { id: "3", name: "Prof. Maria Costa", photo: "/api/placeholder/150/150" },
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherPhoto, setNewTeacherPhoto] = useState<string | null>(null);

  const handleCreateTeacher = () => {
    if (!newTeacherName.trim()) {
      toast.error("Nome do professor é obrigatório!");
      return;
    }

    if (!newTeacherPhoto) {
      toast.error("Foto do professor é obrigatória!");
      return;
    }

    const newTeacher: Teacher = {
      id: Date.now().toString(),
      name: newTeacherName.trim(),
      photo: newTeacherPhoto
    };

    setTeachers([...teachers, newTeacher]);
    setIsCreating(false);
    setNewTeacherName("");
    setNewTeacherPhoto(null);
    toast.success("Professor adicionado com sucesso!");
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setNewTeacherName(teacher.name);
    setNewTeacherPhoto(teacher.photo);
  };

  const handleUpdateTeacher = () => {
    if (!editingTeacher) return;

    if (!newTeacherName.trim()) {
      toast.error("Nome do professor é obrigatório!");
      return;
    }

    const updatedTeachers = teachers.map(t => 
      t.id === editingTeacher.id 
        ? { ...t, name: newTeacherName.trim(), photo: newTeacherPhoto || t.photo }
        : t
    );

    setTeachers(updatedTeachers);
    setEditingTeacher(null);
    setNewTeacherName("");
    setNewTeacherPhoto(null);
    toast.success("Professor atualizado com sucesso!");
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers(teachers.filter(t => t.id !== id));
    toast.success("Professor excluído com sucesso!");
  };

  const handleFileUpload = (file: File) => {
    // In a real app, this would upload to a server
    const url = URL.createObjectURL(file);
    setNewTeacherPhoto(url);
  };

  const resetForm = () => {
    setNewTeacherName("");
    setNewTeacherPhoto(null);
    setEditingTeacher(null);
  };

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
                      handleFileUpload(file);
                    }
                  }}
                />
                {newTeacherPhoto && (
                  <div className="mt-2">
                    <img
                      src={newTeacherPhoto}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-full"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateTeacher}>Adicionar Professor</Button>
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
                  src={teacher.photo}
                  alt={teacher.name}
                  className="w-24 h-24 object-cover rounded-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTeacher(teacher)}
                    >
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Professor</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert>
                        <AlertDescription>
                          <strong>Atenção:</strong> Digite o nome do professor corretamente, pois este texto será usado nas artes geradas.
                        </AlertDescription>
                      </Alert>
                      
                      <div>
                        <Label htmlFor="editTeacherName">Nome do Professor</Label>
                        <Input
                          id="editTeacherName"
                          value={newTeacherName}
                          onChange={(e) => setNewTeacherName(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="editTeacherPhoto">Foto do Professor</Label>
                        <Input
                          id="editTeacherPhoto"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file);
                            }
                          }}
                        />
                        <div className="mt-2">
                          <img
                            src={newTeacherPhoto || teacher.photo}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-full"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateTeacher}>Salvar Alterações</Button>
                        <Button variant="outline" onClick={() => {
                          setEditingTeacher(null);
                          resetForm();
                        }}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteTeacher(teacher.id)}
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
