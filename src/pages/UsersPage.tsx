import { cityService } from "@/api/services/cityService";
import { roleService } from "@/api/services/roleService";
import { staffService } from "@/api/services/staffService";
import { zoneService } from "@/api/services/zoneService";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERMISSIONS } from "@/lib/permissions";
import type { Role, Staff } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";

// Users with these roles are managed elsewhere, so edit/delete/toggle are disabled for them.
const PROTECTED_ROLES = ["Admin", "Franchise"];

const getInitials = (name?: string) =>
  (name || "User")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function UsersPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    roleId: "",
    cityId: "",
    zoneId: "",
    status: "active" as "active" | "inactive",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffRes, rolesRes, citiesRes, zonesRes] = await Promise.all([
        staffService.getStaff(),
        roleService.getRoles({ page: 1, limit: 100 }),
        cityService.getCities({ page: 1, pageSize: 100 }),
        zoneService.getZones({ page: 1, pageSize: 100 }),
      ]);

      if (staffRes.success) setStaff(staffRes.data);
      if (rolesRes.success) {
        // Filter out Admin role from the list
        const nonAdminRoles = rolesRes.data.filter(
          (role) => role.name !== "Admin",
        );
        setRoles(nonAdminRoles);
      }
      setCities(citiesRes.data || []);
      setZones(zonesRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile is required";
    if (!/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = "Mobile must be 10 digits";
    if (!formData.roleId) newErrors.roleId = "Role is required";
    if (!editingStaff && !formData.password)
      newErrors.password = "Password is required";
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingStaff) {
        const updateData: any = {
          name: formData.name,
          email: formData.email || undefined,
          mobile: formData.mobile,
          roleId: formData.roleId,
          cityId: formData.cityId || undefined,
          zoneId: formData.zoneId || undefined,
          status: formData.status,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }

        await staffService.updateStaff(editingStaff.id, updateData);
      } else {
        await staffService.createStaff({
          name: formData.name,
          email: formData.email || undefined,
          mobile: formData.mobile,
          password: formData.password,
          roleId: formData.roleId,
          cityId: formData.cityId || undefined,
          zoneId: formData.zoneId || undefined,
          status: formData.status,
        });
      }

      setIsDialogOpen(false);
      resetForm();
      await loadData();
    } catch (error: any) {
      console.error("Failed to save staff:", error);
      setErrors({ submit: error.message || "Failed to save staff member" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email || "",
      mobile: staffMember.mobile,
      password: "",
      roleId: staffMember.roleId,
      cityId: staffMember.cityId || "",
      zoneId: staffMember.zoneId || "",
      status: staffMember.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await staffService.deleteStaff(deletingId);
      await loadData();
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error("Failed to delete staff:", error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await staffService.toggleStaffStatus(id);
      await loadData();
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      password: "",
      roleId: "",
      cityId: "",
      zoneId: "",
      status: "active",
    });
    setEditingStaff(null);
    setErrors({});
  };

  const filteredStaff = staff.filter((s) => {
    const name = s.name || "";
    const mobile = s.mobile || "";
    const email = s.email || "";
    const normalizedSearch = searchTerm.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(normalizedSearch) ||
      mobile.includes(searchTerm) ||
      email.toLowerCase().includes(normalizedSearch);

    const matchesRole = roleFilter === "all" || s.roleId === roleFilter;
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns: ColumnDef<Staff>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={member.profileImage} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {member.name || "Unnamed User"}
              </div>
              <div className="text-sm text-muted-foreground">
                {member.mobile || "No mobile"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "—",
    },
    {
      id: "role",
      header: "Role",
      // accessorFn gives the table a plain string, so sorting and search work
      accessorFn: (member) => member.role?.name ?? "",
      cell: ({ row }) => {
        const roleName = row.original.role?.name;
        return (
          <Badge variant={roleName === "Admin" ? "default" : "secondary"}>
            {roleName || "No Role"}
          </Badge>
        );
      },
    },
    {
      id: "city",
      header: "City",
      accessorFn: (member) => member.city?.name ?? "",
      cell: ({ row }) => row.original.city?.name || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const member = row.original;
        const isProtected = PROTECTED_ROLES.includes(member.role?.name ?? "");
        const isActive = member.status === "active";

        return (
          <div className="flex items-center gap-2 justify-end">
            <PermissionGuard permission={PERMISSIONS.USERS_EDIT} hideOnDenied>
              <Button
                variant="ghost"
                size="sm"
                title={isActive ? "Deactivate user" : "Activate user"}
                aria-label={isActive ? "Deactivate user" : "Activate user"}
                onClick={() => handleToggleStatus(member.id)}
                disabled={isProtected}
              >
                {isActive ? (
                  <UserX className="h-4 w-4" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={PERMISSIONS.USERS_EDIT} hideOnDenied>
              <Button
                variant="ghost"
                size="sm"
                title="Edit user"
                aria-label="Edit user"
                onClick={() => handleEdit(member)}
                disabled={isProtected}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={PERMISSIONS.USERS_DELETE} hideOnDenied>
              <Button
                variant="ghost"
                size="sm"
                title="Delete user"
                aria-label="Delete user"
                onClick={() => {
                  setDeletingId(member.id);
                  setIsDeleteDialogOpen(true);
                }}
                disabled={isProtected}
              >
                <Trash2 className="h-4 w-4" />
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
        title="Users & Staff"
        description="Manage staff members and their roles"
      >
        <PermissionGuard permission={PERMISSIONS.USERS_CREATE} hideOnDenied>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </PermissionGuard>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, mobile, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredStaff} />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {editingStaff
                ? "Update user information and role assignment"
                : "Create a new staff member with role assignment"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="mobile">
                  Mobile <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  className={errors.mobile ? "border-destructive" : ""}
                />
                {errors.mobile && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.mobile}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="password">
                  Password{" "}
                  {!editingStaff && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingStaff ? "Leave blank to keep current" : ""
                  }
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="roleId">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.roleId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, roleId: value })
                  }
                >
                  <SelectTrigger
                    className={errors.roleId ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roleId && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.roleId}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cityId">City</Label>
                <Select
                  value={formData.cityId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cityId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="zoneId">Zone</Label>
                <Select
                  value={formData.zoneId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, zoneId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
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
                  <>{editingStaff ? "Update" : "Create"} User</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
