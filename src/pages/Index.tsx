import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema, EventFormValues } from "@/lib/validators"; // Presume que você criou este arquivo no passo anterior
import { Navigate, useNavigate } from "react-router-dom";

// Ícones
import { FileImage, Sparkles, Download, Loader2, ChevronsUpDown, Paintbrush, Expand } from "lucide-react";

// Componentes da UI (shadcn/ui e customizados)
import { Header } from '@/components/layout/Header';
import { AdminPanel } from "@/components/AdminPanel";
import { TemplateBrowserModal } from '@/components/artwork/TemplateBrowserModal';
import { ArtworkPreviewModal } from '@/components/artwork/ArtworkPreviewModal';
import { MultiSelectTeacher } from "@/components/MultiSelectTeacher"; // Seu componente existente
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Toaster, toast } from "@/components/ui/sonner";

// Hooks do seu projeto
import { useAuth } from "@/hooks/useAuth";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { useSupabaseTemplates } from "@/hooks/useSupabaseTemplates";
import { useSupabaseTeachers } from "@/hooks/useSupabaseTeachers";

// --- COMPONENTES INTERNOS DA PÁGINA ---

const ControlPanel = ({ form, onGenerate, isGenerating, onSelectTemplateClick, selectedTemplate }: any) => {
    const { formState: { isValid } } = form;

    return (
        <aside className="lg:col-span-4 h-fit lg:sticky lg:top-24">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onGenerate)} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-slate-800">Preencha os campos abaixo</h2>

                    <FormField
                      control={form.control}
                      name="kvImageId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>KV do evento</FormLabel>
                          <FormControl>
                            {selectedTemplate ? (
                               <Button onClick={onSelectTemplateClick} type="button" variant="outline" className="w-full h-auto justify-between p-2">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9"><AvatarImage src={selectedTemplate.formats?.find((f:any) => f.format_name === 'youtube')?.image_url} /><AvatarFallback>KV</AvatarFallback></Avatar>
                                    <span className="flex-1 text-sm font-medium text-slate-800 truncate text-left">{selectedTemplate.name}</span>
                                  </div>
                                  <ChevronsUpDown size={16} className="text-slate-500 shrink-0" />
                               </Button>
                            ) : (
                              <Button onClick={onSelectTemplateClick} type="button" variant="outline" className="w-full p-3 h-auto border-2 border-dashed">
                                <FileImage size={24} className="mb-2"/><span className="text-sm font-semibold">Escolher um template</span>
                              </Button>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField control={form.control} name="classTheme" render={({ field }) => (<FormItem><FormLabel>Tema da aula</FormLabel><FormControl><Input placeholder="Insira aqui o tema da aula" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="selectedTeacherIds" render={({ field }) => (<FormItem><FormLabel>Professor(es)</FormLabel><FormControl><MultiSelectTeacher selectedTeacherIds={field.value} onSelectionChange={(ids) => field.onChange(ids)} /></FormControl><FormMessage /></FormItem>)} />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="time" render={({ field }) => (<FormItem><FormLabel>Horário</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>

                    <Button type="submit" disabled={isGenerating || !isValid} className="w-full bg-[#DD303E] text-white h-11 text-base hover:bg-red-700 disabled:bg-slate-400">
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20}/>}
                        {isGenerating ? 'Gerando...' : 'Gerar Artes'}
                    </Button>
                </form>
            </Form>
        </aside>
    );
};

const ArtworkThumbnail = ({ art, onPreviewClick }: { art: any, onPreviewClick: (art: any) => void }) => (
    <div className="w-48 flex-shrink-0 space-y-2 group" onClick={() => onPreviewClick(art)}>
        <div className="overflow-hidden rounded-lg border-2 border-slate-200 group-hover:border-[#DD303E] transition-all cursor-pointer relative shadow-sm">
            <img src={art.url} alt={art.format} className="w-full h-full object-cover aspect-auto transition-transform duration-300 group-hover:scale-105"/>
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2">
                <Expand size={24} className="text-white mb-2"/><span className="text-white text-xs text-center font-semibold">Visualizar</span>
            </div>
        </div>
        <p className="text-xs font-medium text-slate-600 text-center truncate">{art.format}</p>
    </div>
);

const ContentArea = ({ isGenerating, generatedArts, progress, currentFormat, onPreviewClick, onDownloadAll }: any) => (
    <main className="lg:col-span-8">
        {generatedArts.length === 0 && !isGenerating ? (
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[500px] bg-white border border-slate-200/80 rounded-2xl p-8">
                <div className="bg-slate-100 rounded-full p-5 mb-5"><Paintbrush size={32} className="text-slate-500" /></div>
                <h2 className="text-2xl font-semibold text-slate-800">Nenhuma arte gerada</h2>
                <p className="mt-2 text-slate-500 max-w-sm">Preencha os campos ao lado e clique em "Gerar Artes" para criar suas artes.</p>
            </div>
        ) : (
             <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-slate-800">Confira as artes geradas</h2>
                    <Button onClick={onDownloadAll} disabled={isGenerating || generatedArts.length === 0} className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400"><Download size={18} className="mr-2"/>Exportar Tudo (.zip)</Button>
                </div>
                {isGenerating && (
                    <div className="space-y-2 text-center">
                        <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="bg-[#DD303E] h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div></div>
                        <p className="text-sm text-slate-500">{progress < 100 ? `Gerando: ${currentFormat}... (${progress}%)` : 'Finalizando...'}</p>
                    </div>
                )}
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex w-max space-x-6 pb-4">
                    {generatedArts.map((art: any) => (<ArtworkThumbnail key={art.format} art={art} onPreviewClick={onPreviewClick} />))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
             </div>
        )}
    </main>
);

export default function Index() {
    const { user, loading, signOut } = useAuth();
    const { templates, loading: templatesLoading } = useSupabaseTemplates();
    const { teachers } = useSupabaseTeachers();
    const { isGenerating, generationProgress, currentGeneratingFormat, generatedImages, generateImages, downloadZip } = useImageGenerator();
    const [userType, setUserType] = useState<'user' | 'admin'>('user');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [previewingArt, setPreviewingArt] = useState<any | null>(null);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: { kvImageId: "", classTheme: "", selectedTeacherIds: [], date: "", time: "" },
        mode: "onChange"
    });

    const onGenerate = async (values: EventFormValues) => {
        const selectedTeachers = teachers.filter(t => values.selectedTeacherIds.includes(t.id));
        const fullEventData = {
            ...values,
            kvImageId: selectedTemplate.id,
            teacherImages: selectedTeachers.map(t => t.image_url),
            teacherNames: selectedTeachers.map(t => t.name),
        };
        await generateImages(fullEventData);
    };

    const handleDownloadAll = () => {
        const zipName = form.getValues("classTheme") || "Artes_Geradas";
        downloadZip(generatedImages, zipName);
    };
    
    const handleLogout = async () => { await signOut(); toast.success("Logout realizado com sucesso!"); };

    if (loading || templatesLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-[#DD303E]" /></div>;
    }
    if (!user) { return <Navigate to="/auth" replace />; }

    const isAdmin = user.email === "henriquetocheto@gmail.com";
    if (isAdmin && userType === 'admin') {
        return <AdminPanel onLogout={handleLogout} onSwitchToUser={() => setUserType('user')} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Toaster />
            <Header user={user} onLogout={handleLogout} />
            <TemplateBrowserModal 
                open={isModalOpen} 
                setOpen={setIsModalOpen} 
                templates={templates || []} 
                onSelectTemplate={(template: any) => {
                    setSelectedTemplate(template);
                    form.setValue("kvImageId", template.id, { shouldValidate: true });
                }} 
                selectedTemplateId={selectedTemplate?.id}
            />
            <ArtworkPreviewModal art={previewingArt} onClose={() => setPreviewingArt(null)} />
            <div className="container mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
                    <ControlPanel 
                        form={form}
                        onGenerate={onGenerate}
                        isGenerating={isGenerating} 
                        selectedTemplate={selectedTemplate}
                        onSelectTemplateClick={() => setIsModalOpen(true)}
                    />
                    <ContentArea 
                        isGenerating={isGenerating} 
                        generatedArts={generatedImages} 
                        progress={generationProgress} 
                        currentFormat={currentGeneratingFormat}
                        onPreviewClick={setPreviewingArt} 
                        onDownloadAll={handleDownloadAll}
                    />
                </div>
            </div>
        </div>
    );
}
