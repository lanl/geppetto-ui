# Medifor User Interface

The Medifor UI is a user interface for the [DARPA MediFor](https://www.darpa.mil/program/media-forensics) program. The Medifor UI is designed to run as a standalone microservice in the [Medifor System](https://gitlab.mediforprogram.com/medifor/medifor-how-to).

We highly recommend reading about the [Medifor System](https://gitlab.mediforprogram.com/medifor/medifor-how-to) to get an overview of the UI's role.

## Features

- Web-based user interface
- Built in image and video playback
- Sorting (media and results)
- Multi-threaded uploading
- Pan, Zoom, and Rotation
- Metadata extraction
- Report generation
- Filtering
- Tagging
- Export
- More...

## Overview

This repository has several distinct components: a Javascript based monorepo for client and server code, an Ansible repo for managing configuration files and deployments, and _docker-compose_ files for locally deploying the Medifor System.

Please visit the following links for information on how to:

- [Setup Development Environment](./docs/setup.md)
- [Run the UI from Source](./docs/source.md)
- [Run the UI from Docker Container](./docs/docker.md)
- [Work with Ansible](./docs/ansible.md)

## Preview

![MediFor UI](/docs/images/mediforupdatedui.png "MediFor UI")

## Troubleshooting

Please reach out to [help@mediforprogram.com](help@mediforprogam.com) if you need assistance.