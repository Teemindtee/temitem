import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Plus, 
  Settings, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  UserX, 
  UserCheck,
  Edit,
  Trash2,
  Eye,
  Clock,
  MessageSquare,
  HeadphonesIcon
} from "lucide-react";
import AdminHeader from "@/components/admin-header";

interface SupportAgent {
  id: string;
  userId: string;
  agentId: string;
  department: string;
  permissions: string[];
  isActive: boolean;
  maxTicketsPerDay: number;
  responseTimeTarget: number;
  specializations: string[];
  languages: string[];
  suspendedAt: string | null;
  suspensionReason: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const DEPARTMENTS = [
  { value: 'general', label: 'General Support', color: 'bg-blue-100 text-blue-800' },
  { value: 'technical', label: 'Technical Support', color: 'bg-purple-100 text-purple-800' },
  { value: 'billing', label: 'Billing & Payments', color: 'bg-green-100 text-green-800' },
  { value: 'disputes', label: 'Disputes & Moderation', color: 'bg-orange-100 text-orange-800' },
  { value: 'verification', label: 'Account Verification', color: 'bg-indigo-100 text-indigo-800' },
];

const PERMISSION_OPTIONS = [
  { value: 'view_tickets', label: 'View Tickets' },
  { value: 'respond_tickets', label: 'Respond to Tickets' },
  { value: 'assign_tickets', label: 'Assign Tickets' },
  { value: 'close_tickets', label: 'Close Tickets' },
  { value: 'view_user_data', label: 'View User Data' },
  { value: 'escalate_tickets', label: 'Escalate Tickets' },
  { value: 'internal_notes', label: 'Add Internal Notes' },
  { value: 'bulk_operations', label: 'Bulk Operations' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ha', label: 'Hausa' },
  { value: 'yo', label: 'Yoruba' },
  { value: 'ig', label: 'Igbo' },
];

export default function SupportAgentsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<SupportAgent | null>(null);

  const [newAgent, setNewAgent] = useState({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    permissions: [] as string[],
    maxTicketsPerDay: 20,
    responseTimeTarget: 24,
    specializations: [] as string[],
    languages: ['en'] as string[],
  });

  const { data: agents, isLoading } = useQuery({
    queryKey: ["support-agents"],
    queryFn: () => apiRequest("/api/admin/support-agents"),
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiRequest("/api/admin/users"),
  });

  const createAgentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/support-agents", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-agents"] });
      setShowCreateDialog(false);
      setNewAgent({
        email: '',
        firstName: '',
        lastName: '',
        department: '',
        permissions: [],
        maxTicketsPerDay: 20,
        responseTimeTarget: 24,
        specializations: [],
        languages: ['en'],
      });
      toast({
        title: "Success",
        description: "Support agent created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create support agent",
        variant: "destructive",
      });
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest(`/api/admin/support-agents/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-agents"] });
      setShowEditDialog(false);
      setSelectedAgent(null);
      toast({
        title: "Success",
        description: "Support agent updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update support agent",
        variant: "destructive",
      });
    },
  });

  const suspendAgentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiRequest(`/api/admin/support-agents/${id}/suspend`, "POST", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-agents"] });
      toast({
        title: "Success",
        description: "Support agent suspended successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend support agent",
        variant: "destructive",
      });
    },
  });

  const reactivateAgentMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/support-agents/${id}/reactivate`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-agents"] });
      toast({
        title: "Success",
        description: "Support agent reactivated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reactivate support agent",
        variant: "destructive",
      });
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/support-agents/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-agents"] });
      toast({
        title: "Success",
        description: "Support agent deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete support agent",
        variant: "destructive",
      });
    },
  });

  const handleCreateAgent = () => {
    if (!newAgent.email || !newAgent.firstName || !newAgent.lastName || !newAgent.department || newAgent.permissions.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createAgentMutation.mutate(newAgent);
  };

  const handleEditAgent = () => {
    if (!selectedAgent) return;

    updateAgentMutation.mutate({
      id: selectedAgent.id,
      data: selectedAgent,
    });
  };

  const handleSuspendAgent = (agent: SupportAgent) => {
    const reason = prompt("Please provide a reason for suspension:");
    if (reason) {
      suspendAgentMutation.mutate({ id: agent.id, reason });
    }
  };

  const getDepartmentBadge = (department: string) => {
    const dept = DEPARTMENTS.find(d => d.value === department);
    return dept ? (
      <Badge className={dept.color}>
        {dept.label}
      </Badge>
    ) : (
      <Badge variant="outline">{department}</Badge>
    );
  };

  const availableUsers = users?.filter((user: any) => 
    !agents?.some((agent: SupportAgent) => agent.userId === user.id)
  ) || [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading support agents...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AdminHeader />
      <main className="flex-1 flex flex-col gap-6 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support Agents</h1>
            <p className="text-gray-600 mt-2">Manage customer support team members and their permissions</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0 bg-finder-red hover:bg-finder-red/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Support Agent</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    type="email"
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                    placeholder="Enter email address"
                    className="h-8"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      type="text"
                      value={newAgent.firstName}
                      onChange={(e) => setNewAgent({...newAgent, firstName: e.target.value})}
                      placeholder="First name"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      type="text"
                      value={newAgent.lastName}
                      onChange={(e) => setNewAgent({...newAgent, lastName: e.target.value})}
                      placeholder="Last name"
                      className="h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={newAgent.department} onValueChange={(value) => setNewAgent({...newAgent, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-1 gap-1 mt-2 max-h-32 overflow-y-auto border rounded p-2">
                    {PERMISSION_OPTIONS.map((permission) => (
                      <label key={permission.value} className="flex items-center space-x-2 text-xs">
                        <input
                          type="checkbox"
                          checked={newAgent.permissions.includes(permission.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAgent({
                                ...newAgent,
                                permissions: [...newAgent.permissions, permission.value]
                              });
                            } else {
                              setNewAgent({
                                ...newAgent,
                                permissions: newAgent.permissions.filter(p => p !== permission.value)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span>{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="maxTicketsPerDay" className="text-sm">Max Tickets Per Day</Label>
                    <Input
                      type="number"
                      value={newAgent.maxTicketsPerDay}
                      onChange={(e) => setNewAgent({...newAgent, maxTicketsPerDay: parseInt(e.target.value)})}
                      min={1}
                      max={100}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="responseTimeTarget" className="text-sm">Response Time Target (hours)</Label>
                    <Input
                      type="number"
                      value={newAgent.responseTimeTarget}
                      onChange={(e) => setNewAgent({...newAgent, responseTimeTarget: parseInt(e.target.value)})}
                      min={1}
                      max={168}
                      className="h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label>Languages</Label>
                  <div className="grid grid-cols-2 gap-1 mt-2 max-h-24 overflow-y-auto border rounded p-2">
                    {LANGUAGE_OPTIONS.map((language) => (
                      <label key={language.value} className="flex items-center space-x-2 text-xs">
                        <input
                          type="checkbox"
                          checked={newAgent.languages.includes(language.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAgent({
                                ...newAgent,
                                languages: [...newAgent.languages, language.value]
                              });
                            } else {
                              setNewAgent({
                                ...newAgent,
                                languages: newAgent.languages.filter(l => l !== language.value)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span>{language.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button 
                    onClick={handleCreateAgent} 
                    disabled={createAgentMutation.isPending}
                    className="w-full bg-finder-red hover:bg-finder-red/90"
                  >
                    {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{agents?.length || 0}</p>
                  <p className="text-gray-600">Total Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">
                    {agents?.filter((agent: SupportAgent) => agent.isActive).length || 0}
                  </p>
                  <p className="text-gray-600">Active Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserX className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">
                    {agents?.filter((agent: SupportAgent) => !agent.isActive).length || 0}
                  </p>
                  <p className="text-gray-600">Suspended</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <HeadphonesIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{DEPARTMENTS.length}</p>
                  <p className="text-gray-600">Departments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Support Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Agent</th>
                    <th className="text-left p-4">Department</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Permissions</th>
                    <th className="text-left p-4">Capacity</th>
                    <th className="text-left p-4">Languages</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents?.map((agent: SupportAgent) => (
                    <tr key={agent.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">
                            {agent.user.firstName} {agent.user.lastName}
                          </div>
                          <div className="text-sm text-gray-600">{agent.user.email}</div>
                          <div className="text-xs text-gray-500">ID: {agent.agentId}</div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {getDepartmentBadge(agent.department)}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {agent.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Suspended
                          </Badge>
                        )}
                        {agent.suspendedAt && (
                          <div className="text-xs text-red-600 mt-1">
                            {agent.suspensionReason}
                          </div>
                        )}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {agent.permissions.slice(0, 2).map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission.replace('_', ' ')}
                            </Badge>
                          ))}
                          {agent.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.permissions.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div>{agent.maxTicketsPerDay} tickets/day</div>
                          <div className="text-gray-600">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {agent.responseTimeTarget}h target
                          </div>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {agent.languages.slice(0, 2).map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang.toUpperCase()}
                            </Badge>
                          ))}
                          {agent.languages.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.languages.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAgent(agent);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>

                          {agent.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuspendAgent(agent)}
                            >
                              <UserX className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => reactivateAgentMutation.mutate(agent.id)}
                            >
                              <UserCheck className="w-3 h-3" />
                            </Button>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Support Agent</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this support agent? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAgentMutation.mutate(agent.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Agent Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Support Agent</DialogTitle>
            </DialogHeader>
            {selectedAgent && (
              <div className="space-y-6 py-4">
                <div>
                  <Label>Agent Information</Label>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">{selectedAgent.user.firstName} {selectedAgent.user.lastName}</div>
                    <div className="text-sm text-gray-600">{selectedAgent.user.email}</div>
                    <div className="text-xs text-gray-500">ID: {selectedAgent.agentId}</div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={selectedAgent.department} 
                    onValueChange={(value) => setSelectedAgent({...selectedAgent, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-1 gap-1 mt-2 max-h-32 overflow-y-auto border rounded p-2">
                    {PERMISSION_OPTIONS.map((permission) => (
                      <label key={permission.value} className="flex items-center space-x-2 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedAgent.permissions.includes(permission.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAgent({
                                ...selectedAgent,
                                permissions: [...selectedAgent.permissions, permission.value]
                              });
                            } else {
                              setSelectedAgent({
                                ...selectedAgent,
                                permissions: selectedAgent.permissions.filter(p => p !== permission.value)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span>{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="maxTicketsPerDay" className="text-sm">Max Tickets Per Day</Label>
                    <Input
                      type="number"
                      value={selectedAgent.maxTicketsPerDay}
                      onChange={(e) => setSelectedAgent({
                        ...selectedAgent, 
                        maxTicketsPerDay: parseInt(e.target.value)
                      })}
                      min={1}
                      max={100}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="responseTimeTarget" className="text-sm">Response Time Target (hours)</Label>
                    <Input
                      type="number"
                      value={selectedAgent.responseTimeTarget}
                      onChange={(e) => setSelectedAgent({
                        ...selectedAgent, 
                        responseTimeTarget: parseInt(e.target.value)
                      })}
                      min={1}
                      max={168}
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button 
                    onClick={handleEditAgent} 
                    disabled={updateAgentMutation.isPending}
                    className="w-full bg-finder-red hover:bg-finder-red/90"
                  >
                    {updateAgentMutation.isPending ? "Updating..." : "Update Agent"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEditDialog(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}