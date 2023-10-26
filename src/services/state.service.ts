import { invoke } from '@tauri-apps/api/primitives';
import { getCurrent } from '@tauri-apps/api/window';

class StateService {
	setInstalled = () => {
		this.dispatch('is_installed', true);
		this.dispatch('play_text', 'Play');
		this.dispatch('play_locked', false);
		this.dispatch('progress_type', 'determinate');
		this.dispatch('git_progress', 100);
		this.dispatch('status_text', 'Done!');
		this.dispatch('set_log', '-> Mods installed!');
		this.dispatch('set_log', '-> Ready to play!');
	};

	setDownloading = () => {
		this.dispatch('status_text', 'Starting download...');
		this.dispatch('set_log', '-> Downloading mods...');
		this.dispatch('play_locked', true);
		this.dispatch('play_text', 'Installing');
		this.dispatch('is_installed', false);
		this.dispatch('needs_update', false);
	};

	setUpdating = () => {
		this.dispatch('set_log', '-> Updating mods...');
		this.dispatch('play_locked', true);
		this.dispatch('play_text', 'Updating');
	};

	setReady = (showMessage: boolean) => {
		this.dispatch('play_locked', false);
		this.dispatch('play_text', 'Play');
		this.dispatch('status_text', 'Ready to play');
		showMessage && this.dispatch('set_log', '-> Running latest mods');
	};

	setUpdateAvailable = (showMessage: boolean) => {
		this.dispatch('play_locked', false);
		this.dispatch('play_text', 'Update');
		this.dispatch('status_text', 'Update available');
		this.dispatch('needs_update', true);
		showMessage && this.dispatch('set_log', '-> New updates found!');
	};

	setNotInstalled = () => {
		this.dispatch('play_locked', false);
		this.dispatch('play_text', 'Install');
		this.dispatch('status_text', 'Not installed');
		this.dispatch('needs_update', false);
		this.dispatch('set_log', '-> You need to install the mods first');
		this.dispatch('is_installed', false);
	};

	setUnpacking = () => {
		this.dispatch('set_log', '-> Unpacking mods...');
		this.dispatch('play_locked', true);
		this.dispatch('play_text', 'Unpacking');
		this.dispatch('progress_type', 'indeterminate');
		this.dispatch('status_text', 'Unpacking mods...');
	};

	setUninstalling = () => {
		this.dispatch('set_log', '-> Removing old files');
		this.dispatch('play_locked', true);
		this.dispatch('play_text', 'Uninstalling');
	};

	setUninstalled = () => {
		this.dispatch('is_installed', false);
		this.dispatch('needs_update', false);
		this.dispatch('play_locked', false);
		this.dispatch('play_text', 'Install');
		this.dispatch('status_text', 'Uninstalled!');
		this.dispatch('set_log', '-> Old files removed!');
		this.dispatch('git_progress', 0);
	};

	setOpenValheim = (sendMessage: boolean) => {
		this.dispatch('play_text', 'Play');
		this.dispatch('play_locked', true);
		sendMessage && this.dispatch('set_log', '-> Please launch Valheim to begin install!');
		sendMessage && this.dispatch('status_text', 'Waiting for Valheim...');
	};

	setGitProgress = (progress: number) => {
		this.dispatch('git_progress', progress);
	};

	setStatusText = (text: string) => {
		this.dispatch('status_text', text);
	};

	setPlayDisabled = (disabled: boolean) => {
		this.dispatch('play_locked', disabled);
	};

	dispatch = (type: string, payload: any) => {
		invoke(type, { message: payload, window: getCurrent() }).then((res) => res);
	};
}

export const stateService = new StateService();
