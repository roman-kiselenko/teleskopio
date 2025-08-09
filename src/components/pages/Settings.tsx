import { useEffect, useState } from 'react';
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
import { call } from '@/lib/api';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Fonts, FONT_KEY } from '@/settings';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [logs, setLogs] = useState([]);
  const apiResources = useApiResourcesState();

  const [selectedFont, setSelectedFont] = useState<string>(() => {
    return localStorage.getItem(FONT_KEY) || 'cascadia';
  });

  useEffect(() => {
    fetchLogs();
    document.body.classList.remove(...Fonts.map((f) => f.className));
    document.body.classList.add(selectedFont);
    localStorage.setItem(FONT_KEY, selectedFont);
  }, [selectedFont]);

  const fetchLogs = async () => {
    const logsResponse = await call('get_logs');
    setLogs(logsResponse);
  };

  return (
    <div className="flex flex-row flex-grow p-2">
      <div className="flex flex-col w-full">
        <Tabs defaultValue="theme" className="text-xs">
          <TabsList>
            <TabsTrigger key="theme" value="theme" className="text-xs">
              Theme
            </TabsTrigger>
            <TabsTrigger key="font" value="font" className="text-xs">
              Font
            </TabsTrigger>
            <TabsTrigger key="api-resources" value="api-resources" className="text-xs">
              API Resources
            </TabsTrigger>
            <TabsTrigger key="logs" value="logs" className="text-xs">
              Backend Logs
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
          <TabsContent value="font">
            <Select onValueChange={(v) => setSelectedFont(v)} defaultValue={selectedFont}>
              <SelectTrigger className="p-2 text-xs w-[180px]">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup className="text-xs">
                  <SelectLabel>Fonts</SelectLabel>
                  {Fonts.map((font) => (
                    <SelectItem className="text-xs" value={font.className}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </TabsContent>
          <TabsContent value="api-resources">
            {apiResources.get().slice().length === 0 ? (
              <div className="text-xs p-2">No cluster connected.</div>
            ) : (
              <ScrollArea className="h-[800px] w-full rounded-md border p-1">
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
              </ScrollArea>
            )}
          </TabsContent>
          <TabsContent value="logs">
            <ScrollArea className="h-[800px] w-full rounded-md border p-1">
              {logs.map((l: string) => (
                <div className="whitespace-pre-line">{l}</div>
              ))}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
