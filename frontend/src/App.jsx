import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ChainInfo from "./pages/ChainInfo";
import ErrorPage from "./pages/ErrorPage";
import FakeBayc from "./pages/FakeBayc";
import FakeBaycToken from "./pages/FakeBaycToken";
import FakeMeebits from "./pages/FakeMeebits";
import FakeNefturians from "./pages/FakeNefturians";
import FakeNefturiansWallet from "./pages/FakeNefturiansWallet";
import "./App.css";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/chain-info" replace />} />
        <Route path="/chain-info" element={<ChainInfo />} />
        <Route path="/fakeBayc" element={<FakeBayc />} />
        <Route path="/fakeBayc/:tokenId" element={<FakeBaycToken />} />
        <Route path="/fakeNefturians" element={<FakeNefturians />} />
        <Route
          path="/fakeNefturians/:userAddress"
          element={<FakeNefturiansWallet />}
        />
        <Route path="/fakeMeebits" element={<FakeMeebits />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<Navigate to="/chain-info" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
