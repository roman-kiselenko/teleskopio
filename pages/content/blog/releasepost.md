---
title: Happy release v0.1.2!
description: First post about stable teleskopio release.
date: 2025-01-05
tags: ["release"]
---

Let's observe `teleskopio` features.

Requirements:

- kubernetes clusters with any version.
- `kubeconfig` of the cluster.

That's it, we need only access to the cluster in order to run `teleskopio`.

In this example I'm going to use [`kind`](https://kind.sigs.k8s.io/), it's a very popular tools in kubernetes world (btw `kind` is used in the kubernetes e2e pipelines).

> kind is a tool for running local Kubernetes clusters using Docker container “nodes”.
> kind was primarily designed for testing Kubernetes itself, but may be used for local development or CI.

Let's create a simple cluster.

```shell
> kind create cluster
Creating cluster "kind" ...
 ✓ Ensuring node image (kindest/node:v1.35.0) 🖼
 ✓ Preparing nodes 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
Set kubectl context to "kind-kind"
You can now use your cluster with:

kubectl cluster-info --context kind-kind

Have a nice day! 👋
```

Now copy the content of `~/.kube/config` file or ensure the env variable `KUBECONFIG` is pointed to right place.

Run `teleskopio config`, the [config](https://github.com/roman-kiselenko/teleskopio?tab=readme-ov-file#config) example will be printed to stdout.

Generate a user with hashed password and add it to the `config.yaml`.

```shell
> htpasswd -nbB admin MySecret12345
```

Run `teleskopio --config=./config.yaml`.

<video controls="" loop="" autoplay="off" muted="" playsinline="" aria-labelledby="login to cluster" src="./login.mp4"></video>

If everything is going good, you'll see the login screen, use `user/pass` from the `config.yaml`.

Let's deploy a pod to our cluster. Double click on pod. Check pod logs.

<video controls="" loop="" autoplay="off" muted="" playsinline="" aria-labelledby="open pod resource" src="deploy-pod.mp4"></video>

Now select a bunch of pods and delete it.

<video controls="" loop="" autoplay="off" muted="" playsinline="" aria-labelledby="delete pod resource" src="delete-pods.mp4"></video>

Another cool feature is font and theme.

<video controls="" loop="" autoplay="off" muted="" playsinline="" aria-labelledby="theme and font" src="change-theme-font.mp4"></video>

That's a brief overview of the `teleskopio` features.

Feel free to try it!
