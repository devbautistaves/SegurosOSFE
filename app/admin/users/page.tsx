"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { usersAPI, User } from "@/lib/api"
import { useCompany } from "@/lib/company-context"
import { Search, Plus, Edit2, Trash2, UserCheck, UserX, Shield, Users as UsersIcon, Building2 } from "lucide-react"

export default function AdminUsersPage() {
  const { currentCompany } = useCompany()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    companyId: "seguros" as string,
    allowedCompanies: [] as string[],
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    role: "admin_seguros" as "admin" | "admin_seguros",
    commissionRate: 0.30,
    supervisorBaseCommission: 750000,
    fixedCommissionPerSale: null as number | null,
    useFixedCommission: false,
    supervisorId: null as string | null,
  })

  useEffect(() => {
    fetchUsers()
  }, [currentCompany.id])

  // Sync formData.companyId when currentCompany changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, companyId: currentCompany.id }))
  }, [currentCompany.id])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter, currentCompany.id])

  const fetchUsers = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await usersAPI.getAll(token)
      setUsers(response.users)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Filtrar por empresa actual - solo mostrar usuarios de esta empresa
    // Si el usuario no tiene companyId asignado, mostrarlo igual (aplica para WAC donde hay un solo sistema)
    filtered = filtered.filter((user) => !user.companyId || user.companyId === currentCompany.id)

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.location.toLowerCase().includes(query)
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user)
      setFormData({
        companyId: user.companyId || currentCompany.id,
        allowedCompanies: user.allowedCompanies || [],
        name: user.name,
        email: user.email,
        password: "",
        phone: user.phone,
        location: user.location,
        role: (user.role === "admin" ? "admin" : "admin_seguros") as "admin" | "admin_seguros",
        commissionRate: user.commissionRate || 0.30,
        supervisorBaseCommission: user.supervisorBaseCommission || 750000,
        fixedCommissionPerSale: user.fixedCommissionPerSale || null,
        useFixedCommission: user.fixedCommissionPerSale !== null && user.fixedCommissionPerSale !== undefined,
        supervisorId: user.supervisorId || null,
      })
    } else {
      setSelectedUser(null)
      setFormData({
        companyId: currentCompany.id,
        allowedCompanies: [],
        name: "",
        email: "",
        password: "",
        phone: "",
        location: "",
        role: "admin_seguros" as "admin" | "admin_seguros",
        commissionRate: 0.30,
        supervisorBaseCommission: 750000,
        fixedCommissionPerSale: null,
        useFixedCommission: false,
        supervisorId: null,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      if (selectedUser) {
        const updateData: Partial<User> & { password?: string; supervisorBaseCommission?: number; fixedCommissionPerSale?: number | null; allowedCompanies?: string[] } = {
          companyId: formData.companyId,
          allowedCompanies: formData.allowedCompanies,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          role: formData.role,
          commissionRate: formData.commissionRate,
        }
        // Para vendedores, agregar comision fija
        if (formData.role === "seller") {
          updateData.fixedCommissionPerSale = formData.useFixedCommission ? formData.fixedCommissionPerSale : null
        }
        if (formData.password) {
          updateData.password = formData.password
        }
        await usersAPI.update(token, selectedUser._id, updateData)
        toast({
          title: "Usuario actualizado",
          description: "El usuario se ha actualizado correctamente",
        })
      } else {
        const createData = { 
          companyId: formData.companyId,
          allowedCompanies: formData.allowedCompanies,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          location: formData.location,
          role: formData.role,
          commissionRate: formData.commissionRate,
          ...(formData.role === "seller" && formData.useFixedCommission && { fixedCommissionPerSale: formData.fixedCommissionPerSale }),
        }
        await usersAPI.create(token, createData as any)
        toast({
          title: "Usuario creado",
          description: "El usuario se ha creado correctamente",
        })
      }
      setIsDialogOpen(false)
      fetchUsers()
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error al guardar el usuario"
      const esLimite = msg.toLowerCase().includes("límite") || msg.toLowerCase().includes("limite")
      toast({
        title: esLimite ? "Alcanzaste el límite del plan FREE" : "Error",
        description: esLimite
          ? "El plan FREE permite 1 usuario. Pasate a PRO para invitar a tu equipo."
          : msg,
        variant: "destructive",
      })
      if (esLimite && typeof window !== "undefined") {
        setTimeout(() => { window.location.href = "/admin/suscripcion" }, 1500)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await usersAPI.delete(token, selectedUser._id)
      toast({
        title: "Usuario eliminado",
        description: "El usuario se ha eliminado correctamente",
      })
      setIsDeleteDialogOpen(false)
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el usuario",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <DashboardLayout requiredRole={["admin", "admin_seguros"]}>
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole={["admin", "admin_seguros"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Equipo</h1>
            <p className="text-muted-foreground">Administrá tu equipo y sus accesos</p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{filteredUsers.length}</p>
                  <p className="text-xs text-muted-foreground">Total Usuarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredUsers.filter((u) => u.role === "admin_seguros").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Administradores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredUsers.filter((u) => u.role === "admin").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredUsers.filter((u) => u.isActive).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o ubicacion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-secondary/50">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="admin_seguros">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
            <CardDescription>Lista de usuarios registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contacto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rol</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.role === "seller" && user.supervisorId && (
                            <p className="text-xs text-amber-400">
                              Sup: {users.find(u => u._id === user.supervisorId)?.name || "—"}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-foreground">{user.phone}</p>
                          <p className="text-sm text-muted-foreground">{user.location}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
<span
                                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            user.role === "admin"
                                              ? "bg-purple-500/20 text-purple-400"
                                              : "bg-emerald-500/20 text-emerald-400"
                                          }`}
                                        >
                                          {user.role === "admin" ? "Admin" : "Administrador"}
                                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                            <UserCheck className="h-4 w-4" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 text-sm">
                            <UserX className="h-4 w-4" />
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(user)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[560px] flex flex-col max-h-[92dvh] p-0 gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
              <DialogTitle>
                {selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
              </DialogTitle>
              <DialogDescription>
                {selectedUser
                  ? "Modifica los datos del usuario"
                  : "Completa los datos del nuevo usuario"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-2">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Juan Perez"
                  className="bg-secondary/50"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="juan@email.com"
                  className="bg-secondary/50"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">
                  Contrasena {selectedUser && "(dejar vacio para no cambiar)"}
                </FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="********"
                  className="bg-secondary/50"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Telefono</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+54 11 1234-5678"
                  className="bg-secondary/50"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="location">Ubicacion</FieldLabel>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Buenos Aires"
                  className="bg-secondary/50"
                />
              </Field>
              <Field>
                <FieldLabel>Rol</FieldLabel>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "admin_seguros") =>
                    setFormData((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin_seguros">Admin Seguros</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </Field>


            </FieldGroup>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-border/50 shrink-0">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
              <AlertDialogDescription>
                Estas seguro de que deseas eliminar a {selectedUser?.name}? Esta accion no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
