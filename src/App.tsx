import { HashRouter } from 'react-router-dom';
import { TooltipProvider } from './components/ui/tooltip';
import { ProfileProvider } from './context/ProfileContext';
import V3App from './v3/V3App';
export default function App(){return <HashRouter><TooltipProvider><ProfileProvider><V3App/></ProfileProvider></TooltipProvider></HashRouter>;}
