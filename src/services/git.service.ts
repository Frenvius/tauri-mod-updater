import { invoke } from '@tauri-apps/api/primitives';
import { getCurrent } from '@tauri-apps/api/window';

import { fileService } from '~/services/file.service.ts';

class GitService {
	url: string = 'https://github.com/Frenvius/disneyland-mods.git';

	async checkLastCommit(): Promise<boolean> {
		const path = await invoke('get_config', { key: 'valheim-path' });
		const latestCommit = await invoke('get_latest_hash', { path: `${path}\\updater` });
		const hash = await invoke('get_current_hash', { path: `${path}\\updater` });
		return latestCommit === hash;
	}

	async clone(valheimPath?: string) {
		const path = valheimPath || (await invoke('get_config', { key: 'valheim-path' }));
		await fileService.uninstall(false);
		return await invoke('git_clone', { url: this.url, path: `${path}\\updater`, window: getCurrent() }).catch(async (err) => {
			if (err.includes('already exists') || err.includes('exists and is not an empty')) {
				await fileService.uninstall(false);
				await this.clone();
			}
		});
	}

	async pull() {
		const path = await invoke('get_config', { key: 'valheim-path' });
		return await invoke('git_pull', { path: `${path}\\updater`, window: getCurrent() }).catch(async (err) => {
			if (err.includes('already exists') || err.includes('exists and is not an empty')) {
				await fileService.uninstall(false);
				await this.clone();
			}
		});
	}
}

export const gitService = new GitService();
