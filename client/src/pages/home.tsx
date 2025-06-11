import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Home, Users, Trophy, Star, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { login, register, isLoggingIn } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      login(email.trim(), password.trim());
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (familyName.trim() && email.trim() && password.trim() && password === confirmPassword) {
      register(familyName.trim(), email.trim(), password.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and branding */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 gradient-primary rounded-full flex items-center justify-center mb-4">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Chorly
          </h1>
          <p className="text-gray-600 mt-2">Family Chore Management Made Fun!</p>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Users className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-xs text-gray-600">Family Tasks</p>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Trophy className="w-6 h-6 text-warning mx-auto mb-1" />
            <p className="text-xs text-gray-600">Leaderboard</p>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Star className="w-6 h-6 text-info mx-auto mb-1" />
            <p className="text-xs text-gray-600">Rewards</p>
          </div>
        </div>

        {/* Authentication Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {showRegister ? "Create Your Family Account" : "Welcome Back!"}
            </CardTitle>
            <CardDescription>
              {showRegister ? "Set up your family's chore management system" : "Sign in to manage your family's chores"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showRegister ? (
              <>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jas.suttie@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 text-lg"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 text-lg"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg btn-primary"
                    disabled={isLoggingIn || !email.trim() || !password.trim()}
                  >
                    {isLoggingIn ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <>
                        <span>Login</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">
                        New to Chorly?
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-lg"
                    onClick={() => setShowRegister(true)}
                  >
                    Get Started
                  </Button>
                </div>
              </>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="familyName" className="text-sm font-medium text-gray-700">
                    Family Name
                  </Label>
                  <Input
                    id="familyName"
                    type="text"
                    placeholder="The Johnson Family"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="h-12 text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regEmail" className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="regEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-lg"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="regPassword" className="text-sm font-medium text-gray-700 flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Password
                  </Label>
                  <Input
                    id="regPassword"
                    type="password"
                    placeholder="Choose a password (6+ characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 text-lg"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 text-lg"
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowRegister(false)}
                    className="h-12 text-lg"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 text-lg btn-primary"
                    disabled={isLoggingIn || !familyName.trim() || !email.trim() || !password.trim() || password !== confirmPassword}
                  >
                    {isLoggingIn ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Fun stats */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Join thousands of families making chores fun!</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <span>🔥 Daily Streaks</span>
            <span>🏆 Achievement Badges</span>
            <span>🎁 Reward System</span>
          </div>
        </div>
      </div>
    </div>
  );
}