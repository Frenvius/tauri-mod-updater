import { Command } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/primitives';
import { getCurrent } from '@tauri-apps/api/window';

class CommandService {
	async startGame() {
		await invoke('run_game_windows', { exec: '/C start steam://rungameid/892970' }).then(async () => {
			await invoke('set_log', { message: `-> Starting Valheim...`, window: getCurrent() });
		});
	}

	async openValheimFolder() {
		const path: string = await invoke('get_config', { key: 'valheimPath' });
		if (path) {
			await Command.create('explorer', [path]).execute();
		}
	}

	async findValheimProcess() {
		let isPathValid: RegExpMatchArray | null = null;
		let executablePath = '';

		while (!isPathValid) {
			const result = await Command.create('wmic', ['process', 'where', "name='Valheim.exe'", 'get', 'ExecutablePath'], {
				encoding: 'utf8'
			}).execute();

			const executableDir = result.stdout.replace('ExecutablePath', '').trim();
			executablePath = executableDir.replace('\\valheim.exe', '');
			isPathValid = this.pathChecker(executableDir);

			if (!isPathValid) {
				await new Promise((resolve) => setTimeout(resolve, 1000)); // waits for 5 seconds
			}
		}

		return { isPathValid, executablePath };
	}

	async killValheimProcess() {
		return Command.create('taskkill', ['/f', '/im', 'Valheim.exe'], {
			encoding: 'utf8'
		}).execute();
	}

	pathChecker = (path: string) => {
		return path.match(/^(?!.*[\\\/]\s+)(?!(?:.*\s|.*\.|\W+)$)(?:[a-zA-Z]:)?(?:(?:[^<>:"\|\?\*\n])+(?:\/\/|\/|\\\\|\\)?)+$/gm);
	};
}

export const commandService = new CommandService();
