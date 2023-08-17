import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

const BorderLinearProgress = styled(LinearProgress)(() => ({
	height: 30,
	border: '1px solid #646464',
	[`&.${linearProgressClasses.colorPrimary}`]: {
		backgroundColor: '#262626'
	},
	[`& .${linearProgressClasses.bar}`]: {
		border: '1px solid #646464',
		backgroundColor: '#308fe8'
	}
}));

const LinearProgressWithLabel = (props) => {
	return (
		<Box sx={{ width: '100%' }}>
			<BorderLinearProgress {...props} />
		</Box>
	);
};

export default LinearProgressWithLabel;
