import LogProvider from '~/context/LogContext';
import AppStateProvider from '~/context/AppState';
import { AppProvidersProps } from '~/context/types';

const AppProviders = ({ data, update, children }: AppProvidersProps) => {
	return (
		<LogProvider>
			<AppStateProvider config={data} updateData={update}>
				{children}
			</AppStateProvider>
		</LogProvider>
	);
};

export default AppProviders;
