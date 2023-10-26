import React from 'react';
import ReactDOM from 'react-dom/client';
import { check, Update } from '@tauri-apps/plugin-updater';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

import './styles/global.scss';
import Home from '~/components/Home';
import AppProviders from '~/context';
import TitleBar from '~/components/common/TitleBar';
import { Config } from '~/context/AppState/types.ts';

const darkTheme = createTheme({
	palette: {
		background: {
			default: '#262626'
		},
		mode: 'dark'
	}
});

interface MainProps {
	configData: Config;
}

const ModUpdater: React.FC<MainProps> = ({ configData }) => {
	const [update, setUpdate] = React.useState<Update | null>(null);
	const [config, setConfig] = React.useState<Config>(configData || {});
	if (typeof window !== 'undefined') {
		document.onkeydown = function (e) {
			if (e.which === 116) {
				e.preventDefault();
			}
		};

		document.addEventListener('contextmenu', (e) => {
			e.preventDefault();
		});
	}

	(async () => {
		const update = await check();
		setUpdate(update);
	})();

	React.useEffect(() => {
		setConfig(configData);
	}, [configData]);

	return (
		<>
			{config && (
				<ThemeProvider theme={darkTheme}>
					<CssBaseline />
					<AppProviders data={config} update={update}>
						<TitleBar />
						<Home />
					</AppProviders>
				</ThemeProvider>
			)}
		</>
	);
};

const { updaterConfig } = window as any;
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<ModUpdater configData={updaterConfig} />);
