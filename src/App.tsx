import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { TemplateLibrary } from './pages/TemplateLibrary';
import { ReportEditor } from './pages/ReportEditor';
import { DataSelector } from './pages/DataSelector';
import { PreviewPublish } from './pages/PreviewPublish';
import { SubscriptionManager } from './pages/SubscriptionManager';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TemplateLibrary />} />
        <Route path="/editor" element={<ReportEditor />} />
        <Route path="/data" element={<DataSelector />} />
        <Route path="/preview" element={<PreviewPublish />} />
        <Route path="/subscription" element={<SubscriptionManager />} />
      </Routes>
    </Layout>
  );
}

export default App;
