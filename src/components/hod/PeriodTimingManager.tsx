import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PeriodTiming } from '@/types';
import { Clock, Save } from 'lucide-react';
import { toast } from 'sonner';

export function PeriodTimingManager() {
  const { periodTimings, updatePeriodTimings } = useApp();
  const [editingTimings, setEditingTimings] = useState<PeriodTiming[]>(periodTimings);

  const handleTimingChange = (id: string, field: keyof PeriodTiming, value: string | boolean) => {
    setEditingTimings(prev =>
      prev.map(timing =>
        timing.id === id ? { ...timing, [field]: value } : timing
      )
    );
  };

  const handleSave = () => {
    updatePeriodTimings(editingTimings);
    toast.success('Period timings updated successfully');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Period Timings Configuration
            </CardTitle>
            <CardDescription>Customize period timings for the entire college</CardDescription>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {editingTimings.map((timing) => (
            <div
              key={timing.id}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg"
            >
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={timing.label}
                  onChange={(e) => handleTimingChange(timing.id, 'label', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={timing.startTime}
                  onChange={(e) => handleTimingChange(timing.id, 'startTime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={timing.endTime}
                  onChange={(e) => handleTimingChange(timing.id, 'endTime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Period Number</Label>
                <Input
                  type="number"
                  value={timing.periodNumber}
                  onChange={(e) => handleTimingChange(timing.id, 'periodNumber', e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={timing.isBreak}
                    onCheckedChange={(checked) => handleTimingChange(timing.id, 'isBreak', checked)}
                  />
                  <Label>Is Break</Label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
