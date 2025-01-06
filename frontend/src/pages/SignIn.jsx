import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "rounded-xl shadow-lg",
            formButtonPrimary: "bg-yellow-400 hover:bg-yellow-500",
          },
        }}
        routing="path"
        path="/sign-in"
        afterSignInUrl={sessionStorage.getItem("prevUrl") || "/"} // Redirect to the previous URL or home
      />
    </div>
  );
}