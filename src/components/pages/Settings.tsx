import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/components/ThemeProvider';
import type { Theme } from '@/components/ThemeProvider';
import { useApiResourcesState } from '@/store/api-resources';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const apiResources = useApiResourcesState();
  return (
    <div className="flex flex-row flex-grow flex flex-col h-screen overflow-auto">
      <div className="flex w-1/2">
        <div className="flex items-center flex-shrink-0 h-10 px-2 text-xs">Theme</div>
        <div className="flex">
          <div className="col-span-1 bg-background">
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
      {apiResources.get().slice().length === 0 ? (
        <></>
      ) : (
        <div>
          <div className="flex items-center flex-shrink-0 h-10 px-2 text-xs">API Resources</div>
          <div className="flex">
            <div className="col-span-1 bg-background">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead className="w-[100px] ">Version</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead>Namespaced</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiResources
                    .get()
                    .slice()
                    .map((a: any) => (
                      <TableRow>
                        <TableCell className="font-medium">{a.group}</TableCell>
                        <TableCell>{a.version}</TableCell>
                        <TableCell>{a.kind}</TableCell>
                        <TableCell>{a.namespaced ? 'True' : 'False'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
