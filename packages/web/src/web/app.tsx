import { Route, Switch } from "wouter";
import Index from "./pages/index";
import SignInPage from "./pages/sign-in";
import AdminPage from "./pages/admin/index";
import { Provider } from "./components/provider";
import { AgentFeedback } from "@runablehq/website-runtime";
import { ProtectedRoute } from "./components/protected-route";

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/admin">
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        </Route>
      </Switch>
      {import.meta.env.DEV && <AgentFeedback />}

    </Provider>
  );
}

export default App;
