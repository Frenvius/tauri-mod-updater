import React from 'react';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/primitives';
import { Grid, Alert, TextField, Typography } from '@mui/material';

import styles from './styles.module.scss';
import { initConfig } from '~/components/Settings/constants.ts';
import { AppStateContext } from '~/context/AppState/constants.ts';

const Settings = () => {
	const navigate = useNavigate();
	const { setValheimPath } = React.useContext(AppStateContext);
	const [config, setConfig] = React.useState(initConfig);
	const { repoUrl, setRepoUrl } = React.useContext(AppStateContext);
	const [repo, setRepo] = React.useState<string>('');
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const [isRepoUrlSet, setIsRepoUrlSet] = React.useState<boolean>(false);
	const [valheimPathState, setValheimPathState] = React.useState<string>('');

	const handleRepoUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRepo(event.target.value);
	};

	const handleValheimPathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValheimPathState(event.target.value);
	};

	React.useEffect(() => {
		invoke('get_config_data').then((res) => {
			const configData = JSON.parse(res as string);
			setConfig(configData);
			setIsRepoUrlSet(!!configData.repoUrl);
			setRepo(configData.repoUrl || repoUrl || initConfig.repoUrl);
			setValheimPathState(configData.valheimPath || initConfig.valheimPath);
		});
	}, []);

	const saveSettings = async () => {
		setIsLoading(true);
		await setRepoUrl(repo);
		await setValheimPath(valheimPathState);
		navigate('/', { state: { from: !isRepoUrlSet ? '' : 'settings' } });
	};

	return (
		<>
			{config && (
				<div className={styles.container}>
					<Grid container spacing={2}>
						<Grid item xs={12} className={styles.header} display="flex" justifyContent="space-between" alignItems="center">
							<Typography className={styles.title}>Settings:</Typography>
							{!isRepoUrlSet && (
								<Alert severity="warning" className={styles.warning}>
									You need to set the repository url first!
								</Alert>
							)}
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								size="small"
								value={repo}
								variant="outlined"
								label="Repository Url"
								disabled={isLoading}
								onChange={handleRepoUrlChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								size="small"
								variant="outlined"
								value={valheimPathState}
								label="Valheim Folder"
								disabled={!isRepoUrlSet || isLoading}
								onChange={handleValheimPathChange}
							/>
						</Grid>
						<Grid item xs={12} display="flex" justifyContent="flex-end">
							<LoadingButton className={styles.saveButton} loading={isLoading} onClick={async () => await saveSettings()}>
								Save
							</LoadingButton>
						</Grid>
					</Grid>
				</div>
			)}
		</>
	);
};

export default Settings;
