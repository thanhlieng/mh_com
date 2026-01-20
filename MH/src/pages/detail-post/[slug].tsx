import dynamic from 'next/dynamic';

const MyComponent = dynamic(() => import('../../components/DetailsPost'), {
  ssr: false,
});

const DetailsPostContainer = () => {
  return <MyComponent />;
};

export default DetailsPostContainer;
