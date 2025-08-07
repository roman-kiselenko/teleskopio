import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/components/ThemeProvider';
import type { Theme } from '@/components/ThemeProvider';
import { useApiResourcesState } from '@/store/api-resources';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const apiResources = useApiResourcesState();
  return (
    <div className="flex flex-row flex-grow p-2 ">
      <div className="flex flex-col">
        <div className="flex">
          <Tabs defaultValue="theme" className="w-full text-xs">
            <TabsList>
              <TabsTrigger value="theme" className="text-xs">
                Theme
              </TabsTrigger>
              <TabsTrigger value="api-resources" className="text-xs">
                API Resources
              </TabsTrigger>
            </TabsList>
            <TabsContent value="theme">
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
            </TabsContent>
            <TabsContent value="api-resources">
              {apiResources.get().slice().length === 0 ? (
                <div className="text-xs p-2">No cluster connected.</div>
              ) : (
                <div className="flex flex-col h-screen overflow-auto">
                  <div className="flex">API Resources</div>
                  <div className="flex">
                    <div className="bg-background">
                      <Table className="text-xs">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Group</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>Kind</TableHead>
                            <TableHead>Namespaced</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {apiResources
                            .get()
                            .slice()
                            .map((a: any, index: number) => (
                              <TableRow key={index}>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
