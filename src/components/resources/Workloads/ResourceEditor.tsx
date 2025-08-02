import Editor, { useMonaco } from '@monaco-editor/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import podschema from '@/schema/pod.json';
import deploymentschema from '@/schema/deployment.json';
import { useLoaderData } from 'react-router';
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import { configureMonacoYaml } from 'monaco-yaml';
import { invoke } from '@tauri-apps/api/core';
import { currentClusterState } from '@/store/cluster';
import { toast } from 'sonner';

export function ResourceEditor({ resource }: { resource: string }) {
  const { data } = useLoaderData();
  const monaco = useMonaco();
  const editorRef = useRef(null);
  const [original, setOriginal] = useState(data);

  const onSave = async () => {
    const editor = editorRef.current;
    const model = editor?.getModel();
    const markers = monaco?.editor.getModelMarkers({ resource: model.uri });

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
    toast.promise(
      invoke('update_kube_object', {
        path: currentClusterState.kube_config.get(),
        context: currentClusterState.cluster.get(),
        yaml: value,
      }),
      {
        loading: 'Saving...',
        success: () => {
          return <span>Saving resource</span>;
        },
        error: (err) => (
          <span>
            Cant save resource
            <br />
            {err.message}
          </span>
        ),
      },
    );
    setOriginal(value!);
  };

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
    let schema;
    if (resource === 'pod') {
      schema = podschema;
    } else {
      schema = deploymentschema;
    }
    configureMonacoYaml(monaco, {
      enableSchemaRequest: false,
      validate: true,
      hover: true,
      completion: true,
      schemas: [
        {
          uri: `file://schema/${resource}.json`,
          fileMatch: ['*'],
          schema: schema,
        },
      ],
    });
  }

  return (
    <div className="h-screen p-2 flex flex-col">
      <div className="flex gap-2 mb-2">
        <Button className="text-xs" onClick={onSave}>
          Save
        </Button>
      </div>

      <Editor
        height="90vh"
        language="yaml"
        value={original}
        onMount={handleEditorDidMount}
        onChange={(value) => setOriginal(value || '')}
      />
    </div>
  );
}
