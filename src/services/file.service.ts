import { invoke } from '@tauri-apps/api/core';
import { exists } from '@tauri-apps/plugin-fs';

import { stateService } from './state.service';

class FileService {
	private async removeIfExists(): Promise<void> {
		await invoke('uninstall');
	}

	async checkIfInstalled() {
		const path = await invoke('config_folder');
		return await exists(`${path}\\BepInEx`);
	}

	async uninstall(sendMessage: boolean = true) {
		sendMessage && (await stateService.setUninstalling());
		await this.removeIfExists();
		sendMessage && (await stateService.setUninstalled());
	}
}

export const fileService = new FileService();
