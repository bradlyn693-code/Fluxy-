import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster theme="dark" />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Home} />
            <Route path="/dashboard" component={Home} />
            <Route path="/servers" component={Home} />
            <Route path="/wallet" component={Home} />
            <Route path="/channels" component={Home} />
            <Route path="/pay/fluxt" component={Home} />
            <Route component={Home} />
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
