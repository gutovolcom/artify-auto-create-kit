import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { LayoutEditor } from "@/components/LayoutEditor";
import { Loader2, Edit, Palette } from "lucide-react";

const formatSpecs = {
  youtube: { width: 1920, height: 1080, label: "YouTube" },
  feed: { width: 1080, height: 1080, label: "Feed" },
  stories: { width: 1080, height: 1920, label: "Stories" },
  bannerGCO: { width: 255, height: 192, label: "Banner GCO" },
  ledStudio: { width: 1024, height: 256, label: "LED Studio" },
  LP: { width: 800, height: 776, label: "LP" },
};

export const TemplateManager = () => {
  const { templates, loading, createTemplate, deleteTemplate } = useSupabaseTemplates();
  const [isCreating, setIsCreating] = useState(false);
  const [editingLayout, setEditingLayout] = useState<{
    templateId: string;
    formatName: string;
    imageUrl: string;
  } | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateFiles, setNewTemplateFiles] = useState<Record<string, File>>({});
  const [creating, setCreatingState] = useState(false);

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error("Nome do template é obrigatório!");
      return;
    }

    const missingFormats = Object.keys(formatSpecs).filter(
      format => !newTemplateFiles[format]
    );

    if (missingFormats.length > 0) {
      toast.error(`Formatos obrigatórios não preenchidos: ${missingFormats.join(', ')}`);
      return;
    }

    setCreatingState(true);
    try {
      await createTemplate(newTemplateName.trim(), newTemplateFiles);
      setIsCreating(false);
      setNewTemplateName("");
      setNewTemplateFiles({});
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setCreatingState(false);
    }
  };

  const handleFileUpload = (format: string, file: File) => {
    setNewTemplateFiles(prev => ({
      ...prev,
      [format]: file
    }));
  };

  const resetForm = () => {
    setNewTemplateName("");
    setNewTemplateFiles({});
  };

  const openLayoutEditor = (templateId: string, formatName: string, imageUrl: string) => {
    setEditingLayout({ templateId, formatName, imageUrl });
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
                            handleFileUpload(formatKey, file);
                          }
                        }}
                      />
                      {newTemplateFiles[formatKey] && (
                        <div className="mt-2 text-sm text-green-600">
                          ✓ {newTemplateFiles[formatKey].name}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateTemplate}
                  disabled={creating}
                >
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Template
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
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {template.formats?.map((format) => (
                  <div key={format.id} className="text-center">
                    <div className="relative group">
                      <img
                        src={format.image_url}
                        alt={`${format.format_name} format`}
                        className="w-full h-16 object-cover rounded mb-1"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openLayoutEditor(
                            template.id,
                            format.format_name,
                            format.image_url
                          )}
                        >
                          <Palette className="h-3 w-3 mr-1" />
                          Layout
                        </Button>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {formatSpecs[format.format_name as keyof typeof formatSpecs]?.label || format.format_name}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTemplate(template.id)}
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Layout Editor Dialog */}
      <Dialog open={!!editingLayout} onOpenChange={() => setEditingLayout(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editor de Layout</DialogTitle>
          </DialogHeader>
          {editingLayout && (
            <LayoutEditor
              templateId={editingLayout.templateId}
              formatName={editingLayout.formatName}
              backgroundImageUrl={editingLayout.imageUrl}
              formatDimensions={formatSpecs[editingLayout.formatName as keyof typeof formatSpecs]}
              onSave={() => {
                setEditingLayout(null);
                toast.success('Layout salvo com sucesso!');
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
