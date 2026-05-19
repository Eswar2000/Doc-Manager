// components/auth/LoginPage.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logo from "@/assets/template-studio-brand.svg";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-indigo-900/50 bg-slate-950/80 backdrop-blur-xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center">
            <img src={logo} alt="Template Studio" className="drop-shadow-lg" />
          </div>
          <CardTitle className="text-4xl font-semibold tracking-tight text-white">
            Template Studio
          </CardTitle>
          <CardDescription className="text-base mt-3 text-indigo-300">
            Your go-to contract building partner
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <Button
            onClick={onLogin}
            size="lg"
            className="w-full h-14 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3"
          >
            Sign in with Microsoft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}