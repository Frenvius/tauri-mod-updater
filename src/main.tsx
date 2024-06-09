import React from 'react';
import ReactDOM from 'react-dom/client';
import { check, Update } from '@tauri-apps/plugin-updater';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

import './styles/global.scss';
import AppProviders from '~/context';
import Home from '~/components/Home';
import Settings from '~/components/Settings';
import { Config } from '~/context/AppState/types';
import TitleBar from '~/components/common/TitleBar';

interface MainProps {
	configData: Config;
}

const darkTheme = createTheme({ palette: { mode: 'dark', background: { default: '#262626' } } });

const ModUpdater: React.FC<MainProps> = ({ configData }) => {
	const [update, setUpdate] = React.useState<null | Update>(null);
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

	React.useEffect(() => {
		const interval = setInterval(async () => {
			const update = await check();
			setUpdate(update);
		}, 30000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	React.useEffect(() => {
		setConfig(configData);
	}, [configData]);

	return (
		<BrowserRouter>
			{config && (
				<ThemeProvider theme={darkTheme}>
					<CssBaseline />
					<AppProviders data={config} update={update}>
						<TitleBar />
						<Routes>
							<Route path="/" Component={Home} />
							<Route path="/settings" Component={Settings} />
						</Routes>
					</AppProviders>
				</ThemeProvider>
			)}
		</BrowserRouter>
	);
};

const { updaterConfig } = window as never;
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<ModUpdater configData={updaterConfig} />);
