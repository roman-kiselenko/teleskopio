import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/components/ThemeProvider';

export function SettingsPage() {
  const { setTheme } = useTheme();
  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center flex-shrink-0 h-12 border-b border-gray-300"></div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1">
          <div className="h-24 text-xs col-span-1 bg-background">
            <RadioGroup className="p-2" defaultValue="option-one">
              <div onClick={() => setTheme('light')} className="flex items-center space-x-2">
                <RadioGroupItem value="option-one" id="option-one" />
                <Label htmlFor="option-one">Light</Label>
              </div>
              <div onClick={() => setTheme('dark')} className="flex items-center space-x-2">
                <RadioGroupItem value="option-two" id="option-two" />
                <Label htmlFor="option-two">Dark</Label>
              </div>
              <div onClick={() => setTheme('system')} className="flex items-center space-x-2">
                <RadioGroupItem value="option-three" id="option-three" />
                <Label htmlFor="option-three">System</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
