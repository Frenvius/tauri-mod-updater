import React from 'react';
import Head from 'next/head';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider, CssBaseline } from '@mui/material';

import LogProvider from 'context/LogContext';

const darkTheme = createTheme({
	palette: {
		background: {
			default: '#262626'
		},
		mode: 'dark'
	}
});

const App = (props) => {
	const { Component, pageProps } = props;

	React.useEffect(() => {
		const jssStyles = document.querySelector('#jss-server-side');
		if (jssStyles) {
			jssStyles.parentElement.removeChild(jssStyles);
		}
	}, []);

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

	return (
		<React.Fragment>
			<Head>
				<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
			</Head>
			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<LogProvider>
					<Component {...pageProps} />
				</LogProvider>
			</ThemeProvider>
		</React.Fragment>
	);
};

export default App;
