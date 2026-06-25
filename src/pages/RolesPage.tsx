import { DataTable } from "@/components/DataTable";
import { FormInput, FormTextarea } from "@/components/FormComponents";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type RoleFormData, roleSchema } from "@/lib/validations";
import {
  permissionActionLabels,
  permissionSectionLabels,
} from "@/mock-data/roles";
import { useRoleStore, useUIStore } from "@/store";
import type { PermissionAction, PermissionSection, Role } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

const allSections: PermissionSection[] = [
  "dashboard",
  "categories",
  "products",
  "orders",
  "wallet",
  "franchise",
  "theme",
  "settings",
];
const allActions: PermissionAction[] = ["view", "create", "edit", "delete"];

export function RolesPage() {
  const { roles, addRole, updateRole, deleteRole, updatePermission } =
    useRoleStore();
  const { showDialog } = useUIStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  const methods = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
  });
  const { handleSubmit, reset } = methods;

  const openAddModal = () => {
    setEditingRole(null);
    reset({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    reset({ name: role.name, description: role.description });
    setIsModalOpen(true);
  };

  const onSubmit = (data: RoleFormData) => {
    if (editingRole) {
      updateRole(editingRole.id, data);
    } else {
      const newRolePermissions = allSections.map((section) => ({
        section,
        actions: Object.fromEntries(
          allActions.map((action) => [action, false]),
        ) as Record<PermissionAction, boolean>,
      }));
      addRole({ ...data, permissions: newRolePermissions });
    }
    setIsModalOpen(false);
    reset();
  };

  const handleDelete = (role: Role) => {
    showDialog({
      title: "Delete Role",
      description: `Are you sure you want to delete "${role.name}"? This action cannot be undone.`,
      onConfirm: () => deleteRole(role.id),
    });
  };

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: "Role",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.description}
            </div>
          </div>
        </div>
      ),
    },
    { accessorKey: "userCount", header: "Users" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveRole(row.original)}
            data-ocid={`role.permissions_button.${row.index + 1}`}
          >
            Permissions
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditModal(row.original)}
            data-ocid={`role.edit_button.${row.index + 1}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original)}
            data-ocid={`role.delete_button.${row.index + 1}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage user roles and access permissions"
        action={{ label: "Add Role", icon: Plus, onClick: openAddModal }}
      />

      <DataTable columns={columns} data={roles} emptyMessage="No roles found" />

      {/* Permission Matrix */}
      {activeRole && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Permissions: {activeRole.name}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveRole(null)}
            >
              Close
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Section</th>
                  {allActions.map((action) => (
                    <th
                      key={action}
                      className="text-center py-2 px-3 font-medium capitalize"
                    >
                      {permissionActionLabels[action]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSections.map((section) => {
                  const permission = activeRole.permissions.find(
                    (p) => p.section === section,
                  );
                  return (
                    <tr key={section} className="border-b border-border/50">
                      <td className="py-2 px-3 font-medium">
                        {permissionSectionLabels[section]}
                      </td>
                      {allActions.map((action) => (
                        <td key={action} className="text-center py-2 px-3">
                          <Checkbox
                            checked={permission?.actions[action] || false}
                            onCheckedChange={(checked) =>
                              updatePermission(
                                activeRole.id,
                                section,
                                action,
                                checked as boolean,
                              )
                            }
                            data-ocid={`role.permission.${section}.${action}`}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Add Role"}</DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                name="name"
                label="Role Name"
                placeholder="Enter role name"
              />
              <FormTextarea
                name="description"
                label="Description"
                placeholder="Enter role description"
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" data-ocid="role.submit_button">
                  {editingRole ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
