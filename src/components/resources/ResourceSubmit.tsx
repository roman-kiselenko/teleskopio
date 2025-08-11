import { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Save, ArrowBigLeft, Shredder, Plus, Minus, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { loader } from '@monaco-editor/react';
import { toast } from 'sonner';
import { call } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import yaml from 'js-yaml';
import { useTheme } from '@/components/ThemeProvider';
import { Fonts, FONT_KEY } from '@/settings';
loader.config({ monaco });

const yamlTokens = {
  tokenizer: {
    root: [
      [/#.*/, 'comment', ''],
      [/\b(true|false|null)\b/, 'keyword', ''],
      [/\b[0-9]+(\.[0-9]+)?\b/, 'number', ''],
      [/".*?"/, 'string', ''],
      [/'.*?'/, 'string', ''],
      [/[^:]+:/, 'key', ''],
    ],
  },
};

export default function ResourceEditor() {
  const { theme } = useTheme();
  let navigate = useNavigate();
  const [fontSize, setFontsize] = useState(14);
  const [hasErrors, setHasErrors] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [original, setOriginal] = useState('');
  const [stripManagedFields, setStripManagedFields] = useState(false);
  const [selectedFont] = useState<string>(() => {
    return (
      Fonts.find((f) => f.className === localStorage.getItem(FONT_KEY))?.label || 'Cascadia Code'
    );
  });

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoInstance.languages.register({ id: 'yaml' });
    monaco.languages.setMonarchTokensProvider('yaml', yamlTokens as any);
    monaco.languages.setLanguageConfiguration('yaml', {
      comments: {
        lineComment: '#',
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
      ],
    });
  };

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

    if (value === '') {
      toast.error(
        <div className="flex flex-col">
          <div>Resource cant be empty.</div>
        </div>,
      );
      return;
    }
    let obj = yaml.load(value);
    if (stripManagedFields && obj?.metadata?.managedFields) {
      delete obj.metadata.managedFields;
    }
    const cleanedYaml = yaml.dump(obj);
    toast.promise(call('create_kube_object', { yaml: cleanedYaml }), {
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

  const handleToggle = () => {
    setStripManagedFields(stripManagedFields);

    try {
      const editor = editorRef.current;
      if (!editor) return;

      const raw = editor.getValue();
      const obj = yaml.load(raw) as any;

      if (obj?.metadata?.managedFields) {
        delete obj.metadata.managedFields;
        const newYaml = yaml.dump(obj);
        editor.setValue(newYaml);
      }
    } catch (err) {
      toast.error('Invalid YAML');
      console.error(err);
    }
  };
  return (
    <div className="h-screen flex flex-col">
      <div className="flex gap-2 p-1 border-b justify-items-stretch items-center">
        <Button title="back" className="text-xs bg-blue-500" onClick={() => navigate(-1)}>
          <ArrowBigLeft />
        </Button>
        <Button title="save" className="text-xs bg-green-500" disabled={hasErrors} onClick={onSave}>
          <Save />
        </Button>
        <Button
          title="strip managedFields"
          className="text-xs bg-orange-500"
          disabled={hasErrors}
          onClick={handleToggle}
        >
          <Shredder />
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
        height="90vh"
        defaultLanguage="yaml"
        options={{
          minimap: { enabled: minimap },
          fontFamily: selectedFont,
          fontSize: fontSize,
          automaticLayout: true,
        }}
        onChange={(value) => setOriginal(value || '')}
        value={original}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onMount={handleEditorMount}
      />
    </div>
  );
}
