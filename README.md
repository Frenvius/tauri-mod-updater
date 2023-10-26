# Valheim Mod Updater

A lightweight mod updater for the game Valheim built with [Tauri 2.0](https://beta.tauri.app/guides/).

![mod-updater.png](.github%2Fmod-updater.png)

## Overview

This project is designed to simplify the process of updating and sync mods for Valheim with friends. 
It checks for updates in a specified Git repository and applies them to your Valheim game folder.

## Features

- Automatic mod updates
- Simple and intuitive interface
- Sync mods and its configs with friends

## Usage

1. Clone this repository and change git repository URL in `/src/services/git.service.ts` to your own.
2. Install dependencies with `npm install` and run the project using `npm run tauri dev`.
3. The mod updater will check for updates in the Git repository and apply them to your Valheim game folder.