import { invoke } from '@tauri-apps/api/core';
import { getCurrent } from '@tauri-apps/api/window';

import { fileService } from './file.service';

class GitService {
	async pull() {
		const path = await invoke('config_folder');
		return await invoke('git_pull', { window: getCurrent(), path: `${path}\\updater` }).catch(async (err) => {
			if (err.includes('already exists') || err.includes('exists and is not an empty')) {
				await fileService.uninstall(false);
				await this.clone();
			}
		});
	}

	async checkLastCommit(): Promise<null | boolean> {
		const path = await invoke('config_folder');
		const latestCommit = await invoke('get_latest_hash', { path: `${path}\\updater` });
		const hash = await invoke('get_current_hash', { path: `${path}\\updater` });
		if (latestCommit === null || hash === null) return null;
		return latestCommit === hash;
	}

	async clone() {
		const config = JSON.parse(await invoke('get_config_data'));
		const url = config.repoUrl;
		const path = await invoke('config_folder');
		await fileService.uninstall(false);
		return await invoke('git_clone', { url: url, window: getCurrent(), path: `${path}/updater` }).catch(async (err) => {
			if (err.includes('already exists') || err.includes('exists and is not an empty')) {
				await this.clone();
			}
		});
	}
}

export const gitService = new GitService();
