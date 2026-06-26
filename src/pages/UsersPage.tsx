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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { staffService } from "@/api/services/staffService";
import { roleService } from "@/api/services/roleService";
import { cityService } from "@/api/services/cityService";
import { zoneService } from "@/api/services/zoneService";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import type { Staff, Role } from "@/types";
import { Loader2, Plus, Search, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function UsersPage() {
  const { canCreate, canEdit, canDelete, isAdmin, userPermissions } = usePermissions();
  
  // Debug logging
  console.log("🔍 UsersPage - Permission Check:");
  console.log("  isAdmin:", isAdmin);
  console.log("  canCreate:", canCreate);
  console.log("  canEdit:", canEdit);
  console.log("  canDelete:", canDelete);
  console.log("  userPermissions:", userPermissions);
  console.log("  USERS_CREATE permission:", PERMISSIONS.USERS_CREATE);
  console.log("  Has USERS_CREATE?", userPermissions.includes(PERMISSIONS.USERS_CREATE));
  
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
    zoneIds: [] as string[],
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
        roleService.getRoles({ limit: 100 }),
        cityService.getCities({ limit: 100 }),
        zoneService.getZones({ limit: 100 }),
      ]);

      if (staffRes.success) setStaff(staffRes.data);
      if (rolesRes.success) {
        // Filter out Admin role from the list
        const nonAdminRoles = rolesRes.data.filter(role => role.name !== "Admin");
        setRoles(nonAdminRoles);
      }
      if (citiesRes.success) setCities(citiesRes.data);
      if (zonesRes.success) setZones(zonesRes.data);
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
    if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile must be 10 digits";
    if (!formData.roleId) newErrors.roleId = "Role is required";
    if (!editingStaff && !formData.password) newErrors.password = "Password is required";
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
          zoneIds: formData.zoneIds.length > 0 ? formData.zoneIds : undefined,
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
          zoneIds: formData.zoneIds.length > 0 ? formData.zoneIds : undefined,
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
      zoneIds: staffMember.zoneIds || [],
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
      zoneIds: [],
      status: "active",
    });
    setEditingStaff(null);
    setErrors({});
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.mobile.includes(searchTerm) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || s.roleId === roleFilter;
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns = [
    {
      accessorKey: "name",
      key: "name",
      label: "User",
      render: (staffMember: Staff) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={staffMember.profileImage} />
            <AvatarFallback>
              {staffMember.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{staffMember.name}</div>
            <div className="text-sm text-muted-foreground">{staffMember.mobile}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      key: "email",
      label: "Email",
      render: (staffMember: Staff) => staffMember.email || "—",
    },
    {
      accessorKey: "role",
      key: "role",
      label: "Role",
      render: (staffMember: Staff) => (
        <Badge variant={staffMember.role?.name === "Admin" ? "default" : "secondary"}>
          {staffMember.role?.name || "No Role"}
        </Badge>
      ),
    },
    {
      accessorKey: "city",
      key: "city",
      label: "City",
      render: (staffMember: Staff) => staffMember.city?.name || "—",
    },
    {
      accessorKey: "status",
      key: "status",
      label: "Status",
      render: (staffMember: Staff) => (
        <Badge variant={staffMember.status === "active" ? "success" : "secondary"}>
          {staffMember.status}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      key: "actions",
      label: "Actions",
      render: (staffMember: Staff) => {
        // Don't allow editing/deleting admin users
        const isAdmin = staffMember.role?.name === "Admin";

        return (
          <div className="flex items-center gap-2">
            <PermissionGuard permission={PERMISSIONS.USERS_EDIT} hideOnDenied>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  staffMember.status === "active"
                    ? handleToggleStatus(staffMember.id)
                    : handleToggleStatus(staffMember.id)
                }
                disabled={isAdmin}
              >
                {staffMember.status === "active" ? (
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
                onClick={() => handleEdit(staffMember)}
                disabled={isAdmin}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={PERMISSIONS.USERS_DELETE} hideOnDenied>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDeletingId(staffMember.id);
                  setIsDeleteDialogOpen(true);
                }}
                disabled={isAdmin}
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
                  <p className="text-xs text-destructive mt-1">{errors.mobile}</p>
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
                  Password {!editingStaff && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={editingStaff ? "Leave blank to keep current" : ""}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password}</p>
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
                  <SelectTrigger className={errors.roleId ? "border-destructive" : ""}>
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
                  <p className="text-xs text-destructive mt-1">{errors.roleId}</p>
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
