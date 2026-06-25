import type { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Alex Johnson",
    email: "alex@franchise.com",
    phone: "+1-555-0101",
    avatar: "",
    role: "Admin",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    name: "Sarah Williams",
    email: "sarah@franchise.com",
    phone: "+1-555-0102",
    avatar: "",
    role: "Manager",
    status: "active",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "user-3",
    name: "Michael Chen",
    email: "michael@franchise.com",
    phone: "+1-555-0103",
    avatar: "",
    role: "Franchise",
    status: "active",
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "user-4",
    name: "Emily Davis",
    email: "emily@franchise.com",
    phone: "+1-555-0104",
    avatar: "",
    role: "Staff",
    status: "inactive",
    createdAt: "2024-02-15T00:00:00Z",
  },
  {
    id: "user-5",
    name: "James Wilson",
    email: "james@franchise.com",
    phone: "+1-555-0105",
    avatar: "",
    role: "Admin",
    status: "active",
    createdAt: "2024-03-01T00:00:00Z",
  },
];

export const currentUser: User = mockUsers[0];
