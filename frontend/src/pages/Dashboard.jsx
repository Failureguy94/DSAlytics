import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Heatmap from '../components/Heatmap';
import PlatformChart from '../components/PlatformChart';
import SubmissionList from '../components/SubmissionList';
import HandleManager from '../components/HandleManager';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
    <div>
      Hello Dashboard! This is where your analytics will be displayed.
    </div>
    {/* ---------------------------------------------------------------------------------------> */}
     <div className="dashboard">
       <header className="dashboard-header">
         <div className="header-content">
           <h1 className="logo">DSAlytics</h1>
           <button className="btn btn-outline" onClick={handleLogout}>
             Logout
           </button>
         </div>
       </header> 

       <main className="dashboard-main">
         <div className="dashboard-grid">
           <section className="grid-full">
             <Heatmap onDateSelect={setSelectedDate} />
           </section>

           <section className="grid-half">
             <PlatformChart date={selectedDate} />
           </section>

           <section className="grid-half">
             <SubmissionList date={selectedDate} />
           </section>

           <section className="grid-full">
             <HandleManager />
           </section>
         </div>
       </main>
     </div>
    </>
  );
}
