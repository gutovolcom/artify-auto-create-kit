// src/components/MultiSelectTeacher.tsx

import React, { useState } from "react";
import { useSupabaseTeachers } from "@/hooks/useSupabaseTeachers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search } from "lucide-react";

interface MultiSelectTeacherProps {
  selectedTeacherIds: string[];
  onSelectionChange: (teacherIds: string[], teacherImages: string[], teacherNames: string[]) => void;
}

export const MultiSelectTeacher: React.FC<MultiSelectTeacherProps> = ({
  selectedTeacherIds,
  onSelectionChange
}) => {
  const { teachers, loading } = useSupabaseTeachers();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedTeachers = teachers.filter((t) => selectedTeacherIds.includes(t.id));

  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (teacherId: string) => {
    const isSelected = selectedTeacherIds.includes(teacherId);
    let updated = isSelected
      ? selectedTeacherIds.filter((id) => id !== teacherId)
      : [...selectedTeacherIds, teacherId];

    if (updated.length > 3) return;

    const teacherObjs = teachers.filter((t) => updated.includes(t.id));

    onSelectionChange(
      updated,
      teacherObjs.map((t) => t.image_url),
      teacherObjs.map((t) => t.name)
    );
  };

  const handleRemove = (id: string) => {
    const updated = selectedTeacherIds.filter((tid) => tid !== id);
    const teacherObjs = teachers.filter((t) => updated.includes(t.id));

    onSelectionChange(
      updated,
      teacherObjs.map((t) => t.image_url),
      teacherObjs.map((t) => t.name)
    );
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-700 font-medium">Foto do professor:</label>

      <div className="relative flex items-center border rounded-md px-3 py-2 bg-white">
        {selectedTeachers.length === 1 && (
          <div className="flex items-center bg-gray-100 rounded-full px-2 py-1 pr-7 relative">
            <img
              src={selectedTeachers[0].image_url}
              alt={selectedTeachers[0].name}
              className="w-6 h-6 rounded-full object-cover mr-2"
            />
            <span className="text-sm text-gray-700">{selectedTeachers[0].name}</span>
            <button
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
              onClick={() => handleRemove(selectedTeachers[0].id)}
            >
              ×
            </button>
          </div>
        )}

        {selectedTeachers.length > 1 && (
          <div className="flex items-center gap-1">
            {selectedTeachers.map((t) => (
              <div key={t.id} className="relative">
                <img
                  src={t.image_url}
                  alt={t.name}
                  className="w-7 h-7 rounded-full object-cover border border-white"
                />
                <button
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                  onClick={() => handleRemove(t.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="ml-auto text-gray-500">
          <Dialog>
            <DialogTrigger asChild>
              <button>
                <Search className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="w-[420px] max-w-full">
              <DialogHeader>
                <DialogTitle>Selecionar Professor</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <ScrollArea className="mt-4 max-h-[300px]">
                <div className="grid grid-cols-3 gap-3">
                  {filteredTeachers.map((teacher) => {
                    const isSelected = selectedTeacherIds.includes(teacher.id);
                    return (
                      <div
                        key={teacher.id}
                        onClick={() => handleToggle(teacher.id)}
                        className={`cursor-pointer border rounded-md p-2 text-center transition ${
                          isSelected ? "ring-2 ring-blue-500" : "hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={teacher.image_url}
                          alt={teacher.name}
                          className="w-full h-20 object-cover object-top rounded-md"
                        />
                        <p className="text-sm mt-2 truncate">{teacher.name}</p>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="pt-2 text-right">
                <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
