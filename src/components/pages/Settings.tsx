import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/components/ThemeProvider';
import type { Theme } from '@/components/ThemeProvider';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center flex-shrink-0 h-10 px-2 text-xs">Settings</div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-1">
          <div className="h-24 col-span-1 bg-background">
            <RadioGroup
              className="p-2"
              defaultValue={theme}
              onValueChange={(value) => setTheme(value as Theme)}
            >
              <div onClick={() => setTheme('light')} className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="option-one" />
                <Label className="text-xs" htmlFor="option-one">
                  Light
                </Label>
              </div>
              <div onClick={() => setTheme('dark')} className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="option-two" />
                <Label className="text-xs" htmlFor="option-two">
                  Dark
                </Label>
              </div>
              <div onClick={() => setTheme('system')} className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="option-three" />
                <Label className="text-xs" htmlFor="option-three">
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
