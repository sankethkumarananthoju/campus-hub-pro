import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';
import { GraduationCap, BookOpen, Shield } from 'lucide-react';

export function RoleSwitcher() {
  const { currentRole, setCurrentRole, currentUserName } = useApp();

  const roles: { value: UserRole; label: string; icon: typeof GraduationCap }[] = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'teacher', label: 'Teacher', icon: BookOpen },
    { value: 'hod', label: 'HOD', icon: Shield }
  ];

  return (
    <div className="flex items-center gap-3 p-4 bg-card border-b border-border">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">Viewing as</p>
        <p className="font-semibold text-foreground">{currentUserName}</p>
      </div>
      <div className="flex gap-2">
        {roles.map(role => {
          const Icon = role.icon;
          return (
            <Button
              key={role.value}
              variant={currentRole === role.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentRole(role.value)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {role.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
