
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LoginFormProps {
  onLogin: (userType: 'user' | 'admin') => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication - in real app this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === "admin@lovable.com" && password === "admin123") {
      toast.success("Login realizado como administrador!");
      onLogin('admin');
    } else if (email === "user@lovable.com" && password === "user123") {
      toast.success("Login realizado como usuário!");
      onLogin('user');
    } else {
      toast.error("Credenciais inválidas!");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Login - Gerador de Artes</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <p><strong>Usuário:</strong> user@lovable.com / user123</p>
            <p><strong>Admin:</strong> admin@lovable.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
