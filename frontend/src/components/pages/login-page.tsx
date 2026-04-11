// components/auth/LoginPage.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <span className="text-white text-3xl font-bold">D</span>
          </div>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Template Studio
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Your go-to contract building partner
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            onClick={onLogin}
            size="lg"
            className="w-full h-12 text-base font-medium"
          >
            Sign in with Microsoft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}