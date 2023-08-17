import dynamic from 'next/dynamic';
const Home = dynamic(() => import('pages/home'), { ssr: false });

const App = () => {
	return (
		<Home />
	);
};

export default App;
