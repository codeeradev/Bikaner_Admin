import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGuard } from "@/components/PermissionGuard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PERMISSIONS } from "@/lib/permissions";
import { roleService } from "@/api/services/roleService";
import type { Role } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Shield, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [permissionRole, setPermissionRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        roleService.getRoles({ limit: 100 }),
        roleService.getAvailablePermissions(),
      ]);

      if (rolesRes.success) setRoles(rolesRes.data);
      if (permissionsRes.success) setAvailablePermissions(permissionsRes.data.all);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingRole(null);
    setFormData({ name: "", description: "" });
    setErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const openPermissionDialog = (role: Role) => {
    setPermissionRole(role);
    setSelectedPermissions([...role.permissions]);
    setIsPermissionDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Role name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, {
          name: formData.name,
          permissions: editingRole.permissions,
        });
      } else {
        await roleService.createRole({
          name: formData.name,
          permissions: [],
          isActive: true,
        });
      }

      setIsDialogOpen(false);
      setFormData({ name: "", description: "" });
      await loadData();
    } catch (error: any) {
      console.error("Failed to save role:", error);
      setErrors({ submit: error.message || "Failed to save role" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deletingRole) return;

    try {
      await roleService.deleteRole(deletingRole.id);
      await loadData();
      setIsDeleteDialogOpen(false);
      setDeletingRole(null);
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!permissionRole) return;

    setSubmitting(true);
    try {
      await roleService.updateRole(permissionRole.id, {
        permissions: selectedPermissions,
      });

      setIsPermissionDialogOpen(false);
      await loadData();
    } catch (error: any) {
      console.error("Failed to update permissions:", error);
      alert(error.message || "Failed to update permissions");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
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
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.permissions.length} permissions
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "success" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isAdminRole = row.original.name === "Admin";

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openPermissionDialog(row.original)}
            >
              Permissions
            </Button>
            <PermissionGuard permission={PERMISSIONS.ROLES_EDIT} hideOnDenied>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditDialog(row.original)}
                disabled={isAdminRole}
                title={isAdminRole ? "Admin role cannot be edited" : "Edit role"}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </PermissionGuard>
            <PermissionGuard permission={PERMISSIONS.ROLES_DELETE} hideOnDenied>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDeletingRole(row.original);
                  setIsDeleteDialogOpen(true);
                }}
                disabled={isAdminRole}
                title={isAdminRole ? "Admin role cannot be deleted" : "Delete role"}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </PermissionGuard>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage user roles and access permissions"
      >
        <PermissionGuard permission={PERMISSIONS.ROLES_CREATE} hideOnDenied>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </PermissionGuard>
      </PageHeader>

      <DataTable columns={columns} data={roles} emptyMessage="No roles found" />

      {/* Create/Edit Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update role name and description"
                : "Create a new role with custom permissions"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="name">
                Role Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Store Manager"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what this role does"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingRole ? "Update" : "Create"} Role</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions: {permissionRole?.name}</DialogTitle>
            <DialogDescription>
              Select which permissions this role should have
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {availablePermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={() => togglePermission(permission)}
                    disabled={permissionRole?.name === "Admin"}
                  />
                  <Label
                    htmlFor={permission}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {permission.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>

            {permissionRole?.name === "Admin" && (
              <Alert>
                <AlertDescription>
                  Admin role has all permissions and cannot be modified.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPermissionDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePermissions}
              disabled={submitting || permissionRole?.name === "Admin"}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Permissions"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Role"
        description={`Are you sure you want to delete "${deletingRole?.name}"? This action cannot be undone and will affect all users assigned to this role.`}
        onConfirm={handleDeleteRole}
      />
    </div>
  );
}
