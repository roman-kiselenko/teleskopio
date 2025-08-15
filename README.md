<h2 align="center">
    teleskopio is an open-source small and beautiful Kubernetes client.
</h2>
<p align="center">
    <img width="300" src="./assets/icon.png"/>
</p>

## Features

- Multiple configs from `~/.kube` folder support - switch between clusters effortlessly.
- Cluster overview - get a high-level view of cluster health and activity.
- Live updates - real-time resource changes with Kubernetes watchers.
- Pod logs and events - inspect logs and event history directly in the UI.
- Owner links - navigate from a resource to its owner.
- Resource editor/creator - integrated [Monaco Editor](https://microsoft.github.io/monaco-editor/) with syntax highlighting.
- Multiple font options - customize the UI appearance.
- Light and dark themes.

---

## Planned Features

- Shell access to containers.
- Port forwarding.
- Helm integration.
- Kubernetes resource schemas per API version.
- Resource metrics - CPU, memory, and other usage statistics.

---

## Stack

- **[Tauri v2](https://tauri.app/)** - lightweight and fast desktop framework.
- **[kube.rs](https://kube.rs)** - backend logic and Kubernetes API integration.
- **React** - responsive and modern frontend.
- **[shadcn/ui](https://ui.shadcn.com/)** + **Tailwind CSS** - clean and flexible UI components.
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - powerful code editor with syntax highlighting.
- **Dynamic resources** - auto-loading resources for flexible navigation.
- **Kubernetes watchers** - instant updates from the cluster.

---

## Installation

1. Download the latest `.dmg` release from [Releases](https://github.com/roman-kiselenko/teleskopio/releases).
2. Open the `.dmg` file and drag **teleskopio.app** to the Applications folder.
3. Launch **teleskopio.app** from Applications.

---

## Development

1. Install tauri and rust
1. Use `pnpm` package manager
1. `pnpm install`
1. `pnpm tauri dev`

## Contributing

**teleskopio.app** is an open-source project, and contributions are welcome.
