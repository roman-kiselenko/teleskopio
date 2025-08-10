import Editor, { useMonaco } from '@monaco-editor/react';
import { Save, ArrowBigLeft, Minus, Plus, Map, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import { configureMonacoYaml } from 'monaco-yaml';
import { call } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
loader.config({ monaco });
import yaml from 'js-yaml';
import { Header } from '@/components/Header';
import { Fonts, FONT_KEY } from '@/settings';

export function ResourceSubmit() {
  let navigate = useNavigate();
  const { theme } = useTheme();
  const monaco = useMonaco();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [original, setOriginal] = useState('# Put your YAML here...');
  const [hasErrors, setHasErrors] = useState(false);
  const [fontSize, setFontsize] = useState(14);
  const [minimap, setMinimap] = useState(true);
  const [selectedFont] = useState<string>(() => {
    return (
      Fonts.find((f) => f.className === localStorage.getItem(FONT_KEY))?.label || 'Cascadia Code'
    );
  });

  useEffect(() => {
    if (!monaco || !editorRef.current) return;

    const model = editorRef.current.getModel();

    const checkMarkers = () => {
      const markers = monaco.editor.getModelMarkers({ resource: model?.uri });
      setHasErrors(markers.length > 0);
    };

    const disposable = monaco.editor.onDidChangeMarkers(() => {
      checkMarkers();
    });

    checkMarkers();

    return () => disposable.dispose();
  }, [monaco, editorRef.current]);

  const changeFont = async (size: number) => {
    if (size < 0 && fontSize >= 10) {
      setFontsize(fontSize - 1);
    } else if (size > 0 && fontSize <= 20) {
      setFontsize(fontSize + 1);
    }
  };

  const onSave = async () => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor?.getModel();
    const markers = monaco?.editor.getModelMarkers({ resource: model?.uri });

    if (markers && markers.length > 0) {
      toast.error(
        <div className="flex flex-col">
          <div>YAML has validation errors. Please fix them before saving.</div>
          {markers.map((m) => (
            <div className="font-bold">{m.message}</div>
          ))}
        </div>,
      );
      return;
    }

    const value = editorRef.current?.getValue();
    toast.promise(call('create_kube_object', { yaml: value }), {
      loading: 'Creating...',
      success: (data) => {
        return (
          <span>
            {data.kind} {data.metadata.namespace} {data.metadata.name} created
          </span>
        );
      },
      error: (err) => (
        <span>
          Cant create resource
          <br />
          {err.message}
        </span>
      ),
    });
    setOriginal(value!);
  };

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
    // let schema = podschema;
    // loader.init().then((monaco) => {
    //   monaco.editor.setTheme(LightTheme);
    // });
    // configureMonacoYaml(monaco, {
    //   enableSchemaRequest: false,
    //   validate: true,
    //   hover: true,
    //   completion: true,
    //   schemas: [
    //     {
    //       uri: `file://schema/object.json`,
    //       fileMatch: ['*'],
    //       schema: schema,
    //     },
    //   ],
    // });
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex gap-2 p-1 border-b justify-items-stretch items-center">
        <Button title="back" className="text-xs bg-blue-500" onClick={() => navigate(-1)}>
          <ArrowBigLeft />
        </Button>
        <Button title="save" className="text-xs bg-green-500" disabled={hasErrors} onClick={onSave}>
          <Save />
        </Button>
        <Button
          title="toggle minimap"
          className="text-xs bg-gray-500"
          onClick={() => setMinimap(!minimap)}
        >
          <Map />
        </Button>
        <Button
          title="decrease font"
          className="text-xs bg-gray-500"
          onClick={() => changeFont(-1)}
        >
          <Minus />
        </Button>
        <Button title="increase font" className="text-xs bg-gray-500" onClick={() => changeFont(1)}>
          <Plus />
        </Button>
      </div>

      <Editor
        language="yaml"
        options={{
          minimap: { enabled: minimap },
          fontFamily: selectedFont,
          fontSize: fontSize,
          automaticLayout: true,
        }}
        value={original}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onMount={handleEditorDidMount}
        onChange={(value) => setOriginal(value || '')}
      />
    </div>
  );
}
