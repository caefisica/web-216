"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/auth-provider";
import type { User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldX,
  UserX,
  UserCheck,
  Mail,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Link,
  Copy,
} from "lucide-react";
import {
  inviteUser,
  updateUserRole,
  suspendUser,
} from "@/app/admin/actions/user-management";

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showInviteResult, setShowInviteResult] = useState(false);
  const [lastInviteResult, setLastInviteResult] = useState<{
    emailSent: boolean;
    setupRequired: boolean;
    message: string;
    setupUrl?: string;
  } | null>(null);

  // Form state for invite dialog
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "user" as "user" | "librarian",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteForm.name || !inviteForm.email) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive",
      });
      return;
    }

    setInviteLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", inviteForm.name);
      formData.append("email", inviteForm.email);
      formData.append("role", inviteForm.role);
      formData.append("inviterName", currentUser?.name || "Administrador");

      const result = await inviteUser(formData);

      if (result.success) {
        toast({
          title: "Usuario invitado exitosamente",
          description: result.message,
        });

        // Store the result for showing status
        setLastInviteResult({
          emailSent: result.emailSent || false,
          setupRequired: result.setupRequired || false,
          message: result.message,
          setupUrl: result.setupUrl,
        });
        setShowInviteResult(true);

        setInviteDialogOpen(false);
        fetchUsers();

        // Reset form
        setInviteForm({
          name: "",
          email: "",
          role: "user",
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        title: "Error",
        description: "No se pudo invitar al usuario.",
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "user" | "librarian" | "admin",
  ) => {
    try {
      const result = await updateUserRole(userId, newRole);

      if (result.success) {
        toast({
          title: "Rol actualizado",
          description: result.message,
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario.",
        variant: "destructive",
      });
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const result = await suspendUser(userId);

      if (result.success) {
        toast({
          title: "Usuario suspendido",
          description: result.message,
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      toast({
        title: "Error",
        description: "No se pudo suspender al usuario.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "Enlace copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldCheck className="h-4 w-4" />;
      case "librarian":
        return <Shield className="h-4 w-4" />;
      case "suspended":
        return <ShieldX className="h-4 w-4" />;
      default:
        return <UserCheck className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "librarian":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "librarian":
        return "Bibliotecario";
      case "suspended":
        return "Suspendido";
      default:
        return "Usuario";
    }
  };

  const canManageUser = (targetUser: User) => {
    if (currentUser?.role !== "admin") return false;
    if (targetUser.id === currentUser.id) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-8 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestión de usuarios
          </h2>
          <p className="text-gray-600">
            Administra roles y permisos de usuarios
          </p>
        </div>

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setInviteDialogOpen(true);
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invitar usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invitar nuevo usuario</DialogTitle>
              <DialogDescription>
                Envía una invitación segura para que el usuario configure su
                propia contraseña.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-name">Nombre completo</Label>
                <Input
                  id="invite-name"
                  value={inviteForm.name}
                  onChange={(e) =>
                    setInviteForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ej: Juan Pérez"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-email">Correo electrónico</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Ej: juan@ejemplo.com"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Rol del usuario</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value: "user" | "librarian") =>
                    setInviteForm((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Usuario - Puede explorar y solicitar libros
                      </div>
                    </SelectItem>
                    <SelectItem value="librarian">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Bibliotecario - Puede gestionar libros y préstamos
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900">
                      Invitación segura
                    </p>
                    <p className="text-green-700 mt-1">
                      Se enviará un enlace seguro para que el usuario configure
                      su propia contraseña. No se comparten credenciales por
                      correo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
                disabled={inviteLoading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleInviteUser}
                disabled={
                  inviteLoading || !inviteForm.name || !inviteForm.email
                }
                className="w-full sm:w-auto"
              >
                {inviteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando invitación...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar invitación segura
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invitation Result Dialog */}
      <Dialog open={showInviteResult} onOpenChange={setShowInviteResult}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Usuario creado exitosamente
            </DialogTitle>
            <DialogDescription>
              El usuario ha sido invitado al sistema.
            </DialogDescription>
          </DialogHeader>
          {lastInviteResult && (
            <div className="space-y-4 py-4">
              {/* Email Status */}
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  lastInviteResult.emailSent
                    ? "bg-green-50 border border-green-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                {lastInviteResult.emailSent ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-800 text-sm font-medium">
                      Correo de invitación enviado
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-800 text-sm font-medium">
                      Usuario creado, pero el correo no pudo enviarse
                    </span>
                  </>
                )}
              </div>

              {/* Manual setup link if email failed */}
              {!lastInviteResult.emailSent && lastInviteResult.setupUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Enlace de configuración manual
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={lastInviteResult.setupUrl}
                      readOnly
                      className="flex-1 bg-gray-50 text-xs font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(lastInviteResult.setupUrl!)
                      }
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Comparte este enlace con el usuario para que configure su
                    contraseña
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Link className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Próximos pasos</p>
                    <p className="text-blue-700 mt-1">
                      {lastInviteResult.emailSent
                        ? "El usuario recibirá un correo con un enlace seguro para configurar su contraseña. El enlace es válido por 24 horas."
                        : "Comparte el enlace de configuración con el usuario para que pueda establecer su contraseña."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>{lastInviteResult.message}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setShowInviteResult(false)}
              className="w-full sm:w-auto"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar usuarios por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
            <SelectItem value="librarian">Bibliotecarios</SelectItem>
            <SelectItem value="user">Usuarios</SelectItem>
            <SelectItem value="suspended">Suspendidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-gray-600">
            Intenta ajustar tus criterios de búsqueda o filtro
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <Avatar className="flex-shrink-0">
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base lg:text-lg truncate">
                        {user.name}
                      </CardTitle>
                      <p
                        className="text-sm text-gray-600 truncate"
                        title={user.email}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={getRoleBadgeVariant(user.role)}
                    className="flex items-center gap-1 flex-shrink-0"
                  >
                    {getRoleIcon(user.role)}
                    <span className="hidden sm:inline">
                      {getRoleText(user.role)}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p>
                      Se unió:{" "}
                      {new Date(user.created_at).toLocaleDateString("es-ES")}
                    </p>
                    <p>Donaciones: ${user.total_donations || 0}</p>
                  </div>

                  {canManageUser(user) && (
                    <div className="flex flex-wrap gap-2">
                      {user.role !== "admin" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleChange(user.id, "admin")}
                        >
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Hacer </span>admin
                        </Button>
                      )}

                      {user.role !== "librarian" && user.role !== "admin" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleChange(user.id, "librarian")}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Hacer </span>
                          bibliotecario
                        </Button>
                      )}

                      {user.role !== "user" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleChange(user.id, "user")}
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Hacer </span>
                          usuario
                        </Button>
                      )}

                      {user.role !== "suspended" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <UserX className="h-3 w-3 mr-1" />
                              Suspender
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="sm:max-w-[425px]">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Suspender usuario
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que quieres suspender a{" "}
                                {user.name}? Perderán acceso al sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleSuspendUser(user.id)}
                              >
                                Suspender usuario
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
