import { Command } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/primitives';
import { getCurrent } from '@tauri-apps/api/window';
import { exists, removeDir, removeFile } from '@tauri-apps/plugin-fs';

import { stateService } from '~/services/state.service.ts';

interface File {
	name: string;
	type: string;
}

class FileService {
	fileList: File[] = [
		{ name: '_state', type: 'folder' },
		{ name: 'updater', type: 'folder' },
		{ name: 'BepInEx', type: 'folder' },
		{ name: 'doorstop_libs', type: 'folder' },
		{ name: 'mods.yml', type: 'file' },
		{ name: '.gitignore', type: 'file' },
		{ name: 'winhttp.dll', type: 'file' },
		{ name: 'changelog.txt', type: 'file' },
		{ name: 'doorstop_config.ini', type: 'file' },
		{ name: 'start_game_bepinex.sh', type: 'file' },
		{ name: 'start_server_bepinex.sh', type: 'file' }
	];

	async unpack() {
		const path = await invoke('get_config', { key: 'valheimPath' });
		return Command.create('robocopy', [`${path}\\updater`, `${path}`, '/E', '/XD', '.git'], {
			encoding: 'utf8'
		}).execute();
	}

	async uninstall(sendMessage: boolean = true) {
		const path = await invoke('get_config', { key: 'valheimPath' });
		sendMessage && stateService.setUninstalling();
		for (const file of this.fileList) {
			await this.removeIfExists(`${path}\\${file.name}`, file, sendMessage);
		}
		sendMessage && stateService.setUninstalled();
	}

	private async removeIfExists(path: string, file: File, sendMessage: boolean): Promise<void> {
		const exist = await exists(path);
		if (exist) {
			if (file.type === 'file') {
				await removeFile(path);
			} else {
				await removeDir(path, { recursive: true });
			}
			sendMessage && (await invoke('set_log', { message: `-> Removed ${file.type} ${file.name}`, window: getCurrent() }));
		}
	}

	async checkIfInstalled() {
		const path = await invoke('get_config', { key: 'valheimPath' });
		return await exists(`${path}\\BepInEx`);
	}
}

export const fileService = new FileService();
