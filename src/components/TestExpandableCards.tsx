import React from "react";
import { ExpandableTeacherCards } from "./ExpandableTeacherCards";

const mockTeachers = [
  {
    id: "1",
    name: "Prof. João Silva",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    created_by: "user123",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Prof. Maria Santos",
    image_url: "https://images.unsplash.com/photo-1494790108755-2616b2232d6d?w=300&h=300&fit=crop&crop=face",
    created_by: "user123",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Prof. Carlos Oliveira",
    image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    created_by: "user123",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Prof. Ana Costa",
    image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    created_by: "user123",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    name: "Prof. Pedro Santos",
    image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
    created_by: "user123",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "6",
    name: "Prof. Lucia Fernandes",
    image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face",
    created_by: "user123",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "7",
    name: "Prof. Roberto Lima",
    image_url: "https://images.unsplash.com/photo-1559474513-8c72e3f8ccad?w=300&h=300&fit=crop&crop=face",
    created_by: "user123",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "8",
    name: "Prof. Sandra Mendes",
    image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face",
    created_by: "user123",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "9",
    name: "Prof. Eduardo Costa",
    image_url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face",
    created_by: "user123",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "10",
    name: "Prof. Beatriz Alves",
    image_url: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=300&fit=crop&crop=face",
    created_by: "user123",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const TestExpandableCards = () => {
  const handleUpdate = async (id: string, name: string, imageFile?: File) => {
    console.log("Update teacher:", { id, name, imageFile });
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleDelete = async (id: string) => {
    console.log("Delete teacher:", id);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Test Expandable Cards</h2>
      <ExpandableTeacherCards
        teachers={mockTeachers}
        onUpdateTeacher={handleUpdate}
        onDeleteTeacher={handleDelete}
        loading={false}
      />
    </div>
  );
};