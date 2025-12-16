export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 font-sans dark:from-gray-900 dark:to-gray-800">
      <main className="flex w-full max-w-4xl flex-col gap-8 p-8">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900 dark:text-white">
            Tempo Web API
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Backend API for Tempo mobile app with Better Auth authentication
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
              Authentication Ready
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Better Auth is configured with email/password authentication
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-400">
              <li>✓ Sign up</li>
              <li>✓ Sign in</li>
              <li>✓ Sign out</li>
              <li>✓ Session management</li>
            </ul>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
              API Endpoints
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Ready-to-use endpoints for your Expo app
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-400">
              <li>• /api/auth/* - Authentication</li>
              <li>• /api/user - User profile</li>
              <li>• /api/health - Health check</li>
            </ul>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
              CORS Enabled
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Configured for Expo mobile app integration
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-400">
              <li>✓ Mobile app access</li>
              <li>✓ Credentials support</li>
              <li>✓ Secure headers</li>
            </ul>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
              Database Setup
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              SQLite database with Better Auth schema
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-400">
              <li>✓ User management</li>
              <li>✓ Session storage</li>
              <li>✓ Password hashing</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900">
          <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
            Getting Started
          </h3>
          <p className="text-blue-800 dark:text-blue-200">
            Check the README.md for integration instructions with your Expo mobile app.
            The API is ready to accept requests from your mobile application.
          </p>
        </div>
      </main>
    </div>
  );
}
