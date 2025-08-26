import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FinderHeader } from "@/components/finder-header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Key, Mail, Smartphone, AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SecuritySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    loginAlerts: true,
    passwordRequirements: true
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('findermeister_token')}`
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      return response.json();
    },
    onSuccess: () => {
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Password changed",
        description: "Your password has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const updateSecuritySettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PUT', '/api/finder/security-settings', data),
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your security settings have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update security settings",
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  const handleSecuritySettingChange = (setting: string, value: boolean) => {
    const newSettings = { ...securitySettings, [setting]: value };
    setSecuritySettings(newSettings);
    updateSecuritySettingsMutation.mutate(newSettings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FinderHeader />

      <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('securitySettings.title')}</h1>
          <p className="text-gray-600 text-sm sm:text-base">{t('securitySettings.description')}</p>
        </div>

        <div className="grid gap-6">
          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                {t('securitySettings.changePassword.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">{t('securitySettings.changePassword.currentPasswordLabel')}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="mt-1"
                  placeholder={t('securitySettings.changePassword.currentPasswordPlaceholder')}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword">{t('securitySettings.changePassword.newPasswordLabel')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1"
                    placeholder={t('securitySettings.changePassword.newPasswordPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">{t('securitySettings.changePassword.confirmPasswordLabel')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="mt-1"
                    placeholder={t('securitySettings.changePassword.confirmPasswordPlaceholder')}
                  />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">{t('securitySettings.changePassword.passwordRequirementsTitle')}</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• {t('securitySettings.changePassword.requirement1')}</li>
                  <li>• {t('securitySettings.changePassword.requirement2')}</li>
                  <li>• {t('securitySettings.changePassword.requirement3')}</li>
                  <li>• {t('securitySettings.changePassword.requirement4')}</li>
                </ul>
              </div>
              <Button 
                onClick={handlePasswordChange}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || changePasswordMutation.isPending}
                className="bg-finder-red hover:bg-finder-red-dark"
              >
                {t('securitySettings.changePassword.updatePasswordButton')}
              </Button>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                {t('securitySettings.twoFactorAuth.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{t('securitySettings.twoFactorAuth.enable2FATitle')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('securitySettings.twoFactorAuth.enable2FADescription')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) => handleSecuritySettingChange('twoFactorEnabled', checked)}
                  />
                  {securitySettings.twoFactorEnabled ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  )}
                </div>
              </div>
              {securitySettings.twoFactorEnabled && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    {t('securitySettings.twoFactorAuth.enabledMessage')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {t('securitySettings.securityNotifications.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{t('securitySettings.securityNotifications.emailNotificationsTitle')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('securitySettings.securityNotifications.emailNotificationsDescription')}
                  </p>
                </div>
                <Switch
                  checked={securitySettings.emailNotifications}
                  onCheckedChange={(checked) => handleSecuritySettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{t('securitySettings.securityNotifications.loginAlertsTitle')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('securitySettings.securityNotifications.loginAlertsDescription')}
                  </p>
                </div>
                <Switch
                  checked={securitySettings.loginAlerts}
                  onCheckedChange={(checked) => handleSecuritySettingChange('loginAlerts', checked)}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{t('securitySettings.securityNotifications.passwordRequirementsTitle')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('securitySettings.securityNotifications.passwordRequirementsDescription')}
                  </p>
                </div>
                <Switch
                  checked={securitySettings.passwordRequirements}
                  onCheckedChange={(checked) => handleSecuritySettingChange('passwordRequirements', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Security Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t('securitySettings.accountSecurityStatus.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    {securitySettings.twoFactorEnabled ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    )}
                    <span className="font-medium">{t('securitySettings.accountSecurityStatus.twoFactorAuthTitle')}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {securitySettings.twoFactorEnabled ? t('securitySettings.accountSecurityStatus.twoFactorAuthEnabled') : t('securitySettings.accountSecurityStatus.twoFactorAuthDisabled')}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">{t('securitySettings.accountSecurityStatus.emailVerificationTitle')}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('securitySettings.accountSecurityStatus.emailVerificationStatus')}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    {securitySettings.passwordRequirements ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    )}
                    <span className="font-medium">{t('securitySettings.accountSecurityStatus.strongPasswordTitle')}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {securitySettings.passwordRequirements ? t('securitySettings.accountSecurityStatus.strongPasswordEnforced') : t('securitySettings.accountSecurityStatus.strongPasswordBasic')}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    {securitySettings.loginAlerts ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    )}
                    <span className="font-medium">{t('securitySettings.accountSecurityStatus.loginMonitoringTitle')}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {securitySettings.loginAlerts ? t('securitySettings.accountSecurityStatus.loginMonitoringActive') : t('securitySettings.accountSecurityStatus.loginMonitoringDisabled')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}