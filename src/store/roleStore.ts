import { mockRoles } from "@/mock-data/roles";
import type { PermissionAction, PermissionSection, Role } from "@/types";
import { create } from "zustand";

interface RoleState {
  roles: Role[];
  isLoading: boolean;
  addRole: (role: Omit<Role, "id" | "createdAt" | "userCount">) => void;
  updateRole: (id: string, role: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  updatePermission: (
    roleId: string,
    section: PermissionSection,
    action: PermissionAction,
    value: boolean,
  ) => void;
  hasPermission: (
    roleId: string,
    section: PermissionSection,
    action: PermissionAction,
  ) => boolean;
  getRoleById: (id: string) => Role | undefined;
}

export const useRoleStore = create<RoleState>((set, get) => ({
  roles: mockRoles,
  isLoading: false,

  addRole: (role) => {
    const newRole: Role = {
      ...role,
      id: `role-${Date.now()}`,
      userCount: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ roles: [...state.roles, newRole] }));
  },

  updateRole: (id, role) => {
    set((state) => ({
      roles: state.roles.map((r) => (r.id === id ? { ...r, ...role } : r)),
    }));
  },

  deleteRole: (id) => {
    set((state) => ({
      roles: state.roles.filter((r) => r.id !== id),
    }));
  },

  updatePermission: (roleId, section, action, value) => {
    set((state) => ({
      roles: state.roles.map((r) => {
        if (r.id !== roleId) return r;
        return {
          ...r,
          permissions: r.permissions.map((p) =>
            p.section === section
              ? { ...p, actions: { ...p.actions, [action]: value } }
              : p,
          ),
        };
      }),
    }));
  },

  hasPermission: (roleId, section, action) => {
    const role = get().roles.find((r) => r.id === roleId);
    if (!role) return false;
    const permission = role.permissions.find((p) => p.section === section);
    return permission?.actions[action] ?? false;
  },

  getRoleById: (id) => {
    return get().roles.find((r) => r.id === id);
  },
}));
