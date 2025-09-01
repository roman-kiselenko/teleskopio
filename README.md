<h2 align="center">
    teleskopio is an open-source small and beautiful Kubernetes Web client.
</h2>
<p align="center">
    <img width="300" src="./assets/icon.png"/>
</p>

[![CI](https://github.com/roman-kiselenko/teleskopio/actions/workflows/test.yaml/badge.svg)](https://github.com/roman-kiselenko/teleskopio/actions/workflows/test.yaml)

## Features

- Multiple configs support - switch between clusters effortlessly.
- Simple JWT token authorization.
- Admin and Viewer role - Full access (admin) or Read Only access (viewer) to cluster.
- Cluster overview - get a high-level view of cluster health and activity.
- Resource editor/creator - integrated [Monaco Editor](https://microsoft.github.io/monaco-editor/) with syntax highlighting.
- Live updates - real-time resource changes with Kubernetes watchers.
- Pod logs and events - inspect logs and event history directly in the UI.
- Owner links - navigate from a resource to its owner.
- Multiple font options - customize the UI appearance.
- Filter `CTRL + F` any resource.
- Jump to section `CTRL + J` any menu.
- Light and dark themes.

---

## Planned Features

- Helm integration.
- Kubernetes resource schemas per API version.
- Resource metrics - CPU, memory, and other usage statistics.

---

## Screenshots

<p align="center">
    <img width="900" src="./assets/diagonal_split.png"/>
    <img width="900" src="./assets/pods.png"/>
    <img width="900" src="./assets/editor.png"/>
    <img width="900" src="./assets/drain.png"/>
    <img width="900" src="./assets/scale.png"/>
</p>

## Stack

- **Golang** - Kubernetes golang client.
- **React** - responsive and modern frontend.
- **[shadcn/ui](https://ui.shadcn.com/)** + **Tailwind CSS** - clean and flexible UI components.
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - powerful code editor with syntax highlighting.
- **Dynamic resources** - auto-loading resources for flexible navigation.
- **Kubernetes watchers** - instant updates from the cluster.

---

## Usage

### Install

#### MacOS

1. `brew tap roman-kiselenko/homebrew-teleskopio`
1. `brew install --cask teleskopio`

#### Linux

1. Download the latest release from [Releases](https://github.com/roman-kiselenko/teleskopio/releases).

#### Docker

```sh
$ docker run -it -p 3080:3080 -v $(pwd)/config.yaml:/usr/bin/config.yaml teleskopio --config=/usr/bin/config.yaml
5:47AM INF set loglevel level=DEBUG
5:47AM INF version version=""
5:47AM INF initialize web server addr=:3080
...
```

#### Run

1. Generate config `teleskopio config > config.yaml`
1. `teleskopio`

---

## Development

1. `pnpm install`
1. `make run-frontend`
1. `make run-backend`
1. `make lint`

## Contributing

**teleskopio** is an open-source project, and contributions are welcome.
