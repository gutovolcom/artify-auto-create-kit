
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { LayoutEditor } from "@/components/LayoutEditor";
import { Loader2, Edit, Palette, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { platformConfigs } from "@/lib/platformConfigs";

const formatSpecs = {
  youtube: { width: 1920, height: 1080, label: "YouTube" },
  youtube_ao_vivo: { width: 1920, height: 1080, label: "YouTube Ao Vivo" },
  youtube_pos_evento: { width: 1920, height: 1080, label: "YouTube Pós Evento" },
  feed: { width: 1080, height: 1080, label: "Feed" },
  stories: { width: 1080, height: 1920, label: "Stories" },
  bannerGCO: { width: 1920, height: 500, label: "Banner GCO" },
  destaque: { width: 255, height: 192, label: "Destaque" },
  ledStudio: { width: 1024, height: 256, label: "LED Studio" },
  LP: { width: 800, height: 776, label: "LP" },
};

export const TemplateManager = () => {
  const { 
    templates, 
    loading, 
    createTemplate, 
    deleteTemplate, 
    updateTemplateFormat,
    addMissingFormatsToTemplate,
    getMissingFormats,
    getAllRequiredFormats
  } = useSupabaseTemplates();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{
    templateId: string;
    templateName: string;
  } | null>(null);
  const [addingFormats, setAddingFormats] = useState<{
    templateId: string;
    templateName: string;
    missingFormats: string[];
  } | null>(null);
  const [editingLayout, setEditingLayout] = useState<{
    templateId: string;
    formatName: string;
    imageUrl: string;
  } | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateFiles, setNewTemplateFiles] = useState<Record<string, File>>({});
  const [editTemplateFiles, setEditTemplateFiles] = useState<Record<string, File>>({});
  const [missingFormatFiles, setMissingFormatFiles] = useState<Record<string, File>>({});
  const [creating, setCreatingState] = useState(false);

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error("Nome do template é obrigatório!");
      return;
    }

    const allRequiredFormats = getAllRequiredFormats();
    const missingFormats = allRequiredFormats.filter(
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

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    const updatedFormats = Object.keys(editTemplateFiles);
    if (updatedFormats.length === 0) {
      toast.error("Selecione pelo menos um formato para atualizar!");
      return;
    }

    try {
      for (const formatName of updatedFormats) {
        const file = editTemplateFiles[formatName];
        await updateTemplateFormat(editingTemplate.templateId, formatName, file);
      }
      
      setEditingTemplate(null);
      setEditTemplateFiles({});
      toast.success("Template atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar template");
    }
  };

  const handleAddMissingFormats = async () => {
    if (!addingFormats) return;

    const selectedFormats = Object.keys(missingFormatFiles);
    if (selectedFormats.length === 0) {
      toast.error("Selecione pelo menos um formato para adicionar!");
      return;
    }

    try {
      await addMissingFormatsToTemplate(addingFormats.templateId, missingFormatFiles);
      setAddingFormats(null);
      setMissingFormatFiles({});
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleFileUpload = (format: string, file: File, type: 'new' | 'edit' | 'missing' = 'new') => {
    if (type === 'edit') {
      setEditTemplateFiles(prev => ({
        ...prev,
        [format]: file
      }));
    } else if (type === 'missing') {
      setMissingFormatFiles(prev => ({
        ...prev,
        [format]: file
      }));
    } else {
      setNewTemplateFiles(prev => ({
        ...prev,
        [format]: file
      }));
    }
  };

  const resetForm = () => {
    setNewTemplateName("");
    setNewTemplateFiles({});
  };

  const resetEditForm = () => {
    setEditTemplateFiles({});
  };

  const resetMissingFormatsForm = () => {
    setMissingFormatFiles({});
  };

  const openLayoutEditor = (templateId: string, formatName: string, imageUrl: string) => {
    setEditingLayout({ templateId, formatName, imageUrl });
  };

  const openTemplateEditor = (templateId: string, templateName: string) => {
    setEditingTemplate({ templateId, templateName });
    setEditTemplateFiles({});
  };

  const openAddFormats = (templateId: string, templateName: string, missingFormats: string[]) => {
    setAddingFormats({ templateId, templateName, missingFormats });
    setMissingFormatFiles({});
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
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
              <DialogDescription>
                Crie um novo template fornecendo um nome e imagens para todos os formatos.
              </DialogDescription>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(formatSpecs).map(([formatKey, spec]) => (
                  <Card key={formatKey} className="p-3">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        {spec.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {spec.width}x{spec.height}
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(formatKey, file, 'new');
                          }
                        }}
                        className="text-xs"
                      />
                      {newTemplateFiles[formatKey] && (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {newTemplateFiles[formatKey].name}
                        </div>
                      )}
                    </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template) => {
          const missingFormats = getMissingFormats(template);
          const isComplete = missingFormats.length === 0;
          
          return (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant={isComplete ? "default" : "destructive"} className="text-xs">
                    {isComplete ? (
                      <><CheckCircle className="h-3 w-3 mr-1" />Completo</>
                    ) : (
                      <><AlertCircle className="h-3 w-3 mr-1" />{missingFormats.length} faltando</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Formats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(formatSpecs).map(([formatKey, spec]) => {
                    const format = template.formats?.find(f => f.format_name === formatKey);
                    const isMissing = !format;
                    
                    return (
                      <div key={formatKey} className="relative group">
                        <div className={`aspect-square rounded border-2 overflow-hidden ${
                          isMissing ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}>
                          {format ? (
                            <>
                              <img
                                src={format.image_url}
                                alt={`${spec.label} format`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => openLayoutEditor(
                                    template.id,
                                    formatKey,
                                    format.image_url
                                  )}
                                  className="text-xs"
                                >
                                  <Palette className="h-3 w-3 mr-1" />
                                  Layout
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-red-500">
                              <AlertCircle className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-center mt-1 truncate">
                          {spec.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTemplateEditor(template.id, template.name)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Editar
                  </Button>
                  
                  {!isComplete && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openAddFormats(template.id, template.name, missingFormats)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar Formatos
                    </Button>
                  )}
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    Excluir
                  </Button>
                </div>

                {/* Missing Formats Info */}
                {!isComplete && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    <strong>Formatos faltando:</strong> {missingFormats.map(f => formatSpecs[f as keyof typeof formatSpecs]?.label || f).join(', ')}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Template: {editingTemplate?.templateName}</DialogTitle>
            <DialogDescription>
              Selecione os formatos que deseja atualizar com novas imagens.
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(formatSpecs).map(([formatKey, spec]) => (
                  <Card key={formatKey} className="p-3">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        {spec.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {spec.width}x{spec.height}
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(formatKey, file, 'edit');
                          }
                        }}
                        className="text-xs"
                      />
                      {editTemplateFiles[formatKey] && (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {editTemplateFiles[formatKey].name}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpdateTemplate}
                  disabled={Object.keys(editTemplateFiles).length === 0}
                >
                  Atualizar Template
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditingTemplate(null);
                  resetEditForm();
                }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Missing Formats Dialog */}
      <Dialog open={!!addingFormats} onOpenChange={() => setAddingFormats(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Formatos Faltando: {addingFormats?.templateName}</DialogTitle>
            <DialogDescription>
              Adicione imagens para os formatos que estão faltando neste template.
            </DialogDescription>
          </DialogHeader>
          {addingFormats && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addingFormats.missingFormats.map((formatKey) => {
                  const spec = formatSpecs[formatKey as keyof typeof formatSpecs];
                  if (!spec) return null;
                  
                  return (
                    <Card key={formatKey} className="p-3">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          {spec.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {spec.width}x{spec.height}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(formatKey, file, 'missing');
                            }
                          }}
                          className="text-xs"
                        />
                        {missingFormatFiles[formatKey] && (
                          <div className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {missingFormatFiles[formatKey].name}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddMissingFormats}
                  disabled={Object.keys(missingFormatFiles).length === 0}
                >
                  Adicionar Formatos
                </Button>
                <Button variant="outline" onClick={() => {
                  setAddingFormats(null);
                  resetMissingFormatsForm();
                }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Layout Editor Dialog */}
      <Dialog open={!!editingLayout} onOpenChange={() => setEditingLayout(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editor de Layout</DialogTitle>
            <DialogDescription>
              Configure o layout dos elementos para este formato do template.
            </DialogDescription>
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
