"use client";

import React, { useEffect, useId, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, Save, X, Search } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Teacher {
  id: string;
  name: string;
  image_url: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ExpandableTeacherCardsProps {
  teachers: Teacher[];
  onUpdateTeacher: (id: string, name: string, imageFile?: File) => Promise<void>;
  onDeleteTeacher: (id: string) => Promise<void>;
  loading?: boolean;
}

export function ExpandableTeacherCards({ 
  teachers, 
  onUpdateTeacher, 
  onDeleteTeacher, 
  loading = false 
}: ExpandableTeacherCardsProps) {
  const [active, setActive] = useState<Teacher | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(5);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic screen height calculation
  useEffect(() => {
    const calculateCardsPerPage = () => {
      const navbarHeight = 64; // Navbar at top of page
      const adminPadding = 32; // pt-8 in AdminLayout container
      const teacherHeaderHeight = 72; // "Professores Cadastrados" + Add button
      const searchHeight = 52; // Search bar height
      const paginationHeight = 120; // Pagination + info text (increased)
      const buffer = 100; // Extra safety margin (increased)
      
      const totalUsedHeight = navbarHeight + adminPadding + teacherHeaderHeight + searchHeight + paginationHeight + buffer;
      const availableHeight = window.innerHeight - totalUsedHeight;
      
      const cardHeight = 88; // Card height + gap (80px card + 8px gap)
      const calculatedCards = Math.floor(availableHeight / cardHeight);
      
      // Minimum 2 cards, maximum 8 cards per page (reduced max to prevent overflow)
      const newCardsPerPage = Math.max(2, Math.min(8, calculatedCards));
      setCardsPerPage(newCardsPerPage);
    };

    calculateCardsPerPage();
    
    const handleResize = () => calculateCardsPerPage();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTeachers.length / cardsPerPage);
  const currentTeachers = useMemo(() => {
    const start = (currentPage - 1) * cardsPerPage;
    return filteredTeachers.slice(start, start + cardsPerPage);
  }, [filteredTeachers, currentPage, cardsPerPage]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
        setIsEditing(false);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
      setEditName(active.name);
    } else {
      document.body.style.overflow = "auto";
      setIsEditing(false);
      setEditName("");
      setEditImage(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => {
    setActive(null);
    setIsEditing(false);
  });

  const handleSave = async () => {
    if (!active || !editName.trim()) return;
    
    setUpdating(true);
    try {
      await onUpdateTeacher(active.id, editName.trim(), editImage || undefined);
      setIsEditing(false);
      setEditImage(null);
      setActive(null);
    } catch (error) {
      console.error("Error updating teacher:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!active) return;
    
    setDeleting(true);
    try {
      await onDeleteTeacher(active.id);
      setActive(null);
    } catch (error) {
      console.error("Error deleting teacher:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(active?.name || "");
    setEditImage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.name}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              key={`modal-${active.id}`}
              ref={ref}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-2xl"
            >
              <div className="relative">
                <img
                  width={200}
                  height={200}
                  src={active.image_url}
                  alt={active.name}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="editName">Nome do Professor</Label>
                          <Input
                            id="editName"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nome do professor"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editImage">Nova Foto (opcional)</Label>
                          <Input
                            id="editImage"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setEditImage(file);
                              }
                            }}
                          />
                          {editImage && (
                            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                              ✓ {editImage.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium text-neutral-700 dark:text-neutral-200 text-xl mb-2">
                          {active.name}
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                          Criado em: {new Date(active.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 relative px-4 pb-6">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2 flex-wrap"
                  >
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSave}
                          disabled={updating || !editName.trim()}
                          className="flex items-center gap-2"
                        >
                          {updating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Salvar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={updating}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={handleEdit}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          onClick={handleDelete}
                          variant="destructive"
                          disabled={deleting}
                          className="flex items-center gap-2"
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          Excluir
                        </Button>
                      </>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      
      {/* Search Bar */}
      <div className="w-full mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <Input
            placeholder="Buscar professor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Teachers List */}
      <div 
        className="w-full space-y-3" 
        style={{ minHeight: `${cardsPerPage * 88}px` }}
      >
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            {searchTerm ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}
          </div>
        ) : (
          currentTeachers.map((teacher, index) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              onClick={() => setActive(teacher)}
              className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:shadow-md transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-600 cursor-pointer"
            >
              <div className="flex-shrink-0">
                <img
                  width={64}
                  height={64}
                  src={teacher.image_url}
                  alt={teacher.name}
                  className="w-16 h-16 rounded-full object-cover object-top border-2 border-neutral-100 dark:border-neutral-800"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-neutral-800 dark:text-neutral-200 text-lg truncate">
                  {teacher.name}
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Criado em {new Date(teacher.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 py-2 text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(teacher);
                  }}
                >
                  Editar
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredTeachers.length > 0 && totalPages > 1 && (
        <div className="mt-8 pb-6">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pl-2.5 cursor-pointer"
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Anterior</span>
                  </button>
                </PaginationItem>
              )}
              
              {getPageNumbers().map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    className="cursor-pointer"
                    isActive={pageNum === currentPage}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pr-2.5 cursor-pointer"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <span>Próximo</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
          
          {/* Pagination Info */}
          <div className="text-center mt-6 text-sm text-neutral-500 dark:text-neutral-400 pb-4">
            Mostrando {((currentPage - 1) * cardsPerPage) + 1} a {Math.min(currentPage * cardsPerPage, filteredTeachers.length)} de {filteredTeachers.length} professores
          </div>
        </div>
      )}
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .dark .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};