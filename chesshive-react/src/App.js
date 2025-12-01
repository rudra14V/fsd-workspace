import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ContactUs from './pages/ContactUs';
import Verify from './pages/auth/Verify';
import PlayerDashboard from './pages/player/PlayerDashboard';
import PlayerProfile from './pages/player/PlayerProfile';
import PlayerTournament from './pages/player/PlayerTournament';
import PlayerGrowth from './pages/player/PlayerGrowth';
import OneOnOne from './pages/player/OneOnOne';
import PlayerPairings from './pages/player/PlayerPairings';
import PlayerGameRequest from './pages/player/PlayerGameRequest';
import PlayerPlayChess from './pages/player/PlayerPlayChess';
import PlayerChat from './pages/player/PlayerChat';
import PlayerRankings from './pages/player/PlayerRankings';
import PlayerStore from './pages/player/PlayerStore';
import PlayerSubscription from './pages/player/PlayerSubscription';
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import CoordinatorChat from './pages/coordinator/CoordinatorChat';
import CoordinatorMeetings from './pages/coordinator/CoordinatorMeetings';
import CoordinatorProfile from './pages/coordinator/CoordinatorProfile';
import EnrolledPlayers from './pages/coordinator/EnrolledPlayers';
import FeedbackView from './pages/coordinator/FeedbackView';
import CoordinatorPairings from './pages/coordinator/CoordinatorPairings';
import CoordinatorPlayerStats from './pages/coordinator/CoordinatorPlayerStats';
import CoordinatorRankings from './pages/coordinator/CoordinatorRankings';
import StoreManagement from './pages/coordinator/StoreManagement';
import TournamentManagement from './pages/coordinator/TournamentManagement';
import CollegeStats from './pages/organizer/CollegeStats';
import CoordinatorManagement from './pages/organizer/CoordinatorManagement';
import Meetings from './pages/organizer/Meetings';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerProfile from './pages/organizer/OrganizerProfile';
import OrganizerTournament from './pages/organizer/OrganizerTournament';
import SalesAnalysis from './pages/organizer/SalesAnalysis';
import StoreMonitoring from './pages/organizer/StoreMonitoring';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTournamentManagement from './pages/admin/AdminTournamentManagement';
import AdminCoordinatorManagement from './pages/admin/AdminCoordinatorManagement';
import AdminOrganizerManagement from './pages/admin/AdminOrganizerManagement';
import AdminPlayerManagement from './pages/admin/AdminPlayerManagement';
import AdminPayments from './pages/admin/AdminPayments';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/player/player_dashboard" element={<PlayerDashboard />} />
        <Route path="/player/player_profile" element={<PlayerProfile />} />
        <Route path="/player/player_tournament" element={<PlayerTournament />} />
        <Route path="/player/growth" element={<PlayerGrowth />} />
        <Route path="/player/one_on_one" element={<OneOnOne />} />
        <Route path="/player/pairings" element={<PlayerPairings />} />
        <Route path="/player/game_request" element={<PlayerGameRequest />} />
        <Route path="/player/play_chess" element={<PlayerPlayChess />} />
        <Route path="/player/player_chat" element={<PlayerChat />} />
        <Route path="/player/rankings" element={<PlayerRankings />} />
        <Route path="/player/store" element={<PlayerStore />} />
        <Route path="/player/subscription" element={<PlayerSubscription />} />
        <Route path="/coordinator/coordinator_dashboard" element={<CoordinatorDashboard />} />
        <Route path="/coordinator/coordinator_chat" element={<CoordinatorChat />} />
        <Route path="/coordinator/coordinator_meetings" element={<CoordinatorMeetings />} />
        <Route path="/coordinator/coordinator_profile" element={<CoordinatorProfile />} />
        <Route path="/coordinator/enrolled_players" element={<EnrolledPlayers />} />
        <Route path="/coordinator/feedback_view" element={<FeedbackView />} />
        <Route path="/coordinator/pairings" element={<CoordinatorPairings />} />
        <Route path="/coordinator/player_stats" element={<CoordinatorPlayerStats />} />
        <Route path="/coordinator/rankings" element={<CoordinatorRankings />} />
        <Route path="/coordinator/store_management" element={<StoreManagement />} />
        <Route path="/coordinator/tournament_management" element={<TournamentManagement />} />
        <Route path="/organizer/college_stats" element={<CollegeStats />} />
        <Route path="/organizer/coordinator_management" element={<CoordinatorManagement />} />
        <Route path="/organizer/meetings" element={<Meetings />} />
        <Route path="/organizer/organizer_dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/organizer_profile" element={<OrganizerProfile />} />
        <Route path="/organizer/organizer_tournament" element={<OrganizerTournament />} />
        <Route path="/organizer/sales_analysis" element={<SalesAnalysis />} />
        <Route path="/organizer/store_monitoring" element={<StoreMonitoring />} />
        <Route path="/admin/admin_dashboard" element={<AdminDashboard />} />
        <Route path="/admin/admin_tournament_management" element={<AdminTournamentManagement />} />
        <Route path="/admin/coordinator_management" element={<AdminCoordinatorManagement />} />
        <Route path="/admin/organizer_management" element={<AdminOrganizerManagement />} />
        <Route path="/admin/player_management" element={<AdminPlayerManagement />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
      </Routes>
    </Router>
  );
}

export default App;
