import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSession, authenticateHousehold, loginWithEmail, registerHousehold, selectMember, authenticateAdmin, logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: ["/api/session"],
    queryFn: getSession,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => loginWithEmail(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      toast({
        title: "Welcome!",
        description: "Successfully signed in to your family.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sign in. Please check your email and password.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) => 
      registerHousehold(name, email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      toast({
        title: "Welcome!",
        description: "Successfully created your family account.",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const legacyLoginMutation = useMutation({
    mutationFn: authenticateHousehold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      toast({
        title: "Welcome!",
        description: "Successfully signed in to your family.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectMemberMutation = useMutation({
    mutationFn: selectMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
    },
  });

  const adminMutation = useMutation({
    mutationFn: authenticateAdmin,
    onSuccess: () => {
      toast({
        title: "Admin Access",
        description: "Successfully authenticated as admin.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Invalid admin PIN.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      window.location.reload();
    },
  });

  return {
    household: session?.household,
    member: session?.member,
    isLoading,
    login: (email: string, password: string) => loginMutation.mutate({ email, password }),
    register: (name: string, email: string, password: string) => registerMutation.mutate({ name, email, password }),
    legacyLogin: legacyLoginMutation.mutate,
    selectMember: selectMemberMutation.mutate,
    authenticateAdmin: adminMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending || registerMutation.isPending,
    isSelectingMember: selectMemberMutation.isPending,
    isAuthenticatingAdmin: adminMutation.isPending,
  };
}
