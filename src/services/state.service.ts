import { invoke } from '@tauri-apps/api/core';
import { getCurrent } from '@tauri-apps/api/window';

class StateService {
	setStatusText = async (text: string) => {
		await this.dispatch('status_text', text);
	};

	setGitProgress = async (progress: number) => {
		await this.dispatch('git_progress', progress);
	};

	setPlayDisabled = async (disabled: boolean) => {
		await this.dispatch('play_locked', disabled);
	};

	dispatch = async (type: string, payload: any) => {
		await invoke(type, { message: payload, window: getCurrent() });
	};

	setUpdating = async () => {
		await this.dispatch('set_log', '-> Updating mods...');
		await this.dispatch('play_locked', true);
		await this.dispatch('play_text', 'Updating');
	};

	setUninstalling = async () => {
		await this.dispatch('set_log', '-> Removing old files');
		await this.dispatch('play_locked', true);
		await this.dispatch('play_text', 'Uninstalling');
	};

	setReady = async (showMessage: boolean) => {
		await this.dispatch('play_locked', false);
		await this.dispatch('play_text', 'Play');
		await this.dispatch('status_text', 'Ready to play');
		showMessage && (await this.dispatch('set_log', '-> Running latest mods'));
	};

	setUpdateAvailable = async (showMessage: boolean) => {
		await this.dispatch('play_locked', false);
		await this.dispatch('play_text', 'Update');
		await this.dispatch('status_text', 'Update available');
		await this.dispatch('needs_update', true);
		showMessage && (await this.dispatch('set_log', '-> New updates found!'));
	};

	setDownloading = async () => {
		await this.dispatch('status_text', 'Starting download...');
		await this.dispatch('set_log', '-> Downloading mods...');
		await this.dispatch('play_locked', true);
		await this.dispatch('play_text', 'Installing');
		await this.dispatch('is_installed', false);
		await this.dispatch('needs_update', false);
	};

	setNotInstalled = async () => {
		await this.dispatch('play_locked', false);
		await this.dispatch('play_text', 'Install');
		await this.dispatch('status_text', 'Not installed');
		await this.dispatch('needs_update', false);
		await this.dispatch('set_log', '-> You need to install the mods first');
		await this.dispatch('is_installed', false);
	};

	setUninstalled = async () => {
		await this.dispatch('is_installed', false);
		await this.dispatch('needs_update', false);
		await this.dispatch('play_locked', false);
		await this.dispatch('play_text', 'Install');
		await this.dispatch('status_text', 'Uninstalled!');
		await this.dispatch('set_log', '-> Old files removed!');
		await this.dispatch('git_progress', 0);
	};

	setInstalled = async () => {
		await this.dispatch('is_installed', true);
		await this.dispatch('needs_update', false);
		await this.dispatch('play_text', 'Play');
		await this.dispatch('play_locked', false);
		await this.dispatch('progress_type', 'determinate');
		await this.dispatch('git_progress', 0);
		await this.dispatch('status_text', 'Done!');
		await this.dispatch('set_log', '-> Mods installed!');
		await this.dispatch('set_log', '-> Ready to play!');
	};
}

export const stateService = new StateService();
