import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePersistedState } from "@/hooks/usePersistedState";

interface Template {
  id: string;
  name: string;
  formats: {
    youtube: string;
    feed: string;
    stories: string;
    bannerGCO: string;
    ledStudio: string;
    LP: string;
  };
}

const formatSpecs = {
  youtube: { width: 1920, height: 1080, label: "YouTube" },
  feed: { width: 1080, height: 1080, label: "Feed" },
  stories: { width: 1080, height: 1920, label: "Stories" },
  bannerGCO: { width: 255, height: 192, label: "Banner GCO" },
  ledStudio: { width: 1024, height: 256, label: "LED Studio" },
  LP: { width: 800, height: 776, label: "LP" },
};

export const TemplateManager = () => {
  const [templates, setTemplates] = usePersistedState<Template[]>("admin_templates", [
    {
      id: "1",
      name: "Template Padrão",
      formats: {
        youtube: "/api/placeholder/1920/1080",
        feed: "/api/placeholder/1080/1080",
        stories: "/api/placeholder/1080/1920",
        bannerGCO: "/api/placeholder/255/192",
        ledStudio: "/api/placeholder/1024/256",
        LP: "/api/placeholder/800/776",
      }
    }
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateFormats, setNewTemplateFormats] = useState<Partial<Template['formats']>>({});

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error("Nome do template é obrigatório!");
      return;
    }

    const missingFormats = Object.keys(formatSpecs).filter(
      format => !newTemplateFormats[format as keyof Template['formats']]
    );

    if (missingFormats.length > 0) {
      toast.error(`Formatos obrigatórios não preenchidos: ${missingFormats.join(', ')}`);
      return;
    }

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName,
      formats: newTemplateFormats as Template['formats']
    };

    setTemplates([...templates, newTemplate]);
    setIsCreating(false);
    setNewTemplateName("");
    setNewTemplateFormats({});
    toast.success("Template criado com sucesso!");
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplateName(template.name);
    setNewTemplateFormats(template.formats);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    const updatedTemplates = templates.map(t => 
      t.id === editingTemplate.id 
        ? { ...t, name: newTemplateName, formats: newTemplateFormats as Template['formats'] }
        : t
    );

    setTemplates(updatedTemplates);
    setEditingTemplate(null);
    setNewTemplateName("");
    setNewTemplateFormats({});
    toast.success("Template atualizado com sucesso!");
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success("Template excluído com sucesso!");
  };

  const handleFileUpload = (format: keyof Template['formats'], file: File) => {
    // In a real app, this would upload to a server
    const url = URL.createObjectURL(file);
    setNewTemplateFormats(prev => ({
      ...prev,
      [format]: url
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Templates Disponíveis</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>Criar Novo Template</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateName">Nome do Template</Label>
                <Input
                  id="templateName"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Digite o nome do template"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formatSpecs).map(([formatKey, spec]) => (
                  <Card key={formatKey}>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        {spec.label} ({spec.width}x{spec.height})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(formatKey as keyof Template['formats'], file);
                          }
                        }}
                      />
                      {newTemplateFormats[formatKey as keyof Template['formats']] && (
                        <img
                          src={newTemplateFormats[formatKey as keyof Template['formats']]}
                          alt={`Preview ${spec.label}`}
                          className="mt-2 max-w-full h-20 object-cover rounded"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateTemplate}>Criar Template</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(template.formats).map(([format, url]) => (
                  <div key={format} className="text-center">
                    <img
                      src={url}
                      alt={`${format} format`}
                      className="w-full h-16 object-cover rounded mb-1"
                    />
                    <span className="text-xs text-gray-600">
                      {formatSpecs[format as keyof typeof formatSpecs].label}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editar Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="editTemplateName">Nome do Template</Label>
                        <Input
                          id="editTemplateName"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(formatSpecs).map(([formatKey, spec]) => (
                          <Card key={formatKey}>
                            <CardHeader>
                              <CardTitle className="text-sm">
                                {spec.label} ({spec.width}x{spec.height})
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(formatKey as keyof Template['formats'], file);
                                  }
                                }}
                              />
                              <img
                                src={newTemplateFormats[formatKey as keyof Template['formats']] || template.formats[formatKey as keyof Template['formats']]}
                                alt={`Preview ${spec.label}`}
                                className="mt-2 max-w-full h-20 object-cover rounded"
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateTemplate}>Salvar Alterações</Button>
                        <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
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
