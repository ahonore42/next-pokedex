import Pokeball from './Pokeball';

interface LoadingPageProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const LoadingPage: React.FC<LoadingPageProps> = ({ size = 'xl' }) => {
  return (
    <div className="flex flex-grow justify-center items-center min-h-[calc(100vh-150px)]"> {/* Adjust min-h based on header/footer height */}
      <Pokeball size={size} endlessSpin spinSpeed={1.5} />
    </div>
  );
};

export default LoadingPage;
