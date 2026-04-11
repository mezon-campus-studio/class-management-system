import { MainLayout } from '@shared/components/layout/MainLayout';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    // <div className="app-container">
    //   <Outlet />
    // </div>
    <MainLayout>
      <Outlet/>
    </MainLayout>
  );
}

export default App;

